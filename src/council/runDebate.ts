import { ClaimInput, ConsensusResult, AgentStatus, ClaimDecision } from '../types';
import { fallbackConsensus } from './fallbackConsensus';
import { RegisteredModel } from '../stores/modelStore';
import {
  STRATEGIST_ROUND1,
  CRITIC_ROUND1,
  EXECUTOR_ROUND1,
  CRITIC_ROUND2,
  STRATEGIST_ROUND2,
  DAMAGE_ASSESSMENT_PROMPT,
  SYNTHESIS_PROMPT,
} from './prompts';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1] ?? null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function callModel(
  model: RegisteredModel,
  systemPrompt: string,
  userPrompt: string,
  openrouterKey = '',
  imageBase64?: string | null,
): Promise<string> {
  const messages: { role: string; content: string; images?: string[] }[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (imageBase64 && model.provider === 'Ollama') {
    messages.push({ role: 'user', content: userPrompt, images: [imageBase64] });
  } else {
    messages.push({ role: 'user', content: userPrompt });
  }

  if (model.provider === 'Ollama') {
    const resp = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.name,
        messages,
        stream: false,
        options: { temperature: 0.25, num_predict: 500 },
      }),
    });
    if (!resp.ok) throw new Error(`Ollama HTTP ${resp.status}`);
    const data = await resp.json();
    return String(data?.message?.content ?? '').trim();
  }

  if (model.provider === 'OpenRouter') {
    if (!openrouterKey) throw new Error('OpenRouter API key missing');
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openrouterKey}`,
      },
      body: JSON.stringify({
        model: model.name,
        messages,
        temperature: 0.25,
        max_tokens: 500,
      }),
    });
    if (!resp.ok) throw new Error(`OpenRouter HTTP ${resp.status}`);
    const data = await resp.json();
    return String(data?.choices?.[0]?.message?.content ?? '').trim();
  }

  if (!model.endpoint) throw new Error('Custom model endpoint missing');
  const resp = await fetch(model.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(model.headers ?? {}) },
    body: JSON.stringify({ model: model.name, messages }),
  });
  if (!resp.ok) throw new Error(`Custom endpoint HTTP ${resp.status}`);
  const data = await resp.json();
  return String(data?.message?.content ?? data?.choices?.[0]?.message?.content ?? '').trim();
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Agent timeout after ${ms}ms`)), ms),
    ),
  ]);
}

// ─── Deterministic fallback decision (no LLM required) ───────────────────────

export function computeClaimDecision(claim: ClaimInput): ClaimDecision {
  const desc = claim.description.toLowerCase();
  const fraudIndicators: string[] = [];
  let confidenceScore = 0.85;
  const coverageValid = claim.type === 'Comprehensive';

  if (!coverageValid) fraudIndicators.push(`${claim.type} policy does not cover own damage`);
  if (claim.pastClaims > 3) {
    fraudIndicators.push(`Excessive past claims (${claim.pastClaims})`);
    confidenceScore -= 0.25;
  }
  if (claim.documentsMissing) {
    fraudIndicators.push('Required documents missing');
    confidenceScore -= 0.2;
  } else if (claim.documentsPartial) {
    fraudIndicators.push('Documents incomplete');
    confidenceScore -= 0.1;
  }

  let damageSeverity: 'Minor' | 'Moderate' | 'Major' = 'Minor';

  const isMajor =
    desc.includes('engine') ||
    desc.includes('total loss') ||
    desc.includes('severe') ||
    desc.includes('undriveable') ||
    desc.includes('destroyed') ||
    desc.includes('heavily');
  const isModerate =
    !isMajor &&
    (desc.includes('panel') ||
      desc.includes('broken') ||
      desc.includes('smash') ||
      desc.includes('trunk') ||
      desc.includes('rear end') ||
      desc.includes('cracked') ||
      desc.includes('windshield'));

  if (isMajor) damageSeverity = 'Major';
  else if (isModerate) damageSeverity = 'Moderate';

  // Pick payout % within spec range based on risk signals:
  // Fewer flags + complete docs → higher end of range; more flags → lower end
  const riskPenalty = fraudIndicators.length * 5 + (claim.documentsPartial ? 5 : 0);
  let payoutPercentage: number;
  if (damageSeverity === 'Major') {
    // Range: 30–50%; base 50, reduce by risk
    payoutPercentage = Math.max(30, 50 - riskPenalty);
  } else if (damageSeverity === 'Moderate') {
    // Range: 50–70%; base 70, reduce by risk
    payoutPercentage = Math.max(50, 70 - riskPenalty);
  } else {
    // Minor — Range: 70–90%; base 90, reduce by risk
    payoutPercentage = Math.max(70, 90 - riskPenalty);
  }

  if (damageSeverity === 'Minor' && claim.amount > 100000) {
    fraudIndicators.push('High claim amount for minor damage');
    confidenceScore -= 0.15;
  }

  let status: 'Approved' | 'Rejected' | 'Pending' = 'Approved';
  if (!coverageValid || confidenceScore < 0.5 || fraudIndicators.filter(f => !f.includes('incomplete')).length >= 2) {
    status = 'Rejected';
  } else if (confidenceScore < 0.65 || claim.documentsPartial || claim.documentsMissing) {
    status = 'Pending';
  }

  const estimatedPayout =
    status === 'Approved' ? Math.max(0, Math.round((claim.amount * payoutPercentage) / 100) - 3000) : 0;

  const customerMessage =
    status === 'Approved'
      ? `Dear customer, your claim ${claim.id} has been approved. Estimated payout: ₹${estimatedPayout.toLocaleString('en-IN')} (after ₹3,000 deductible). Processing time: 7–10 business days.`
      : status === 'Pending'
        ? `Dear customer, your claim ${claim.id} is under additional review. Please submit the required documentation to proceed. We will contact you within 3 business days.`
        : `Dear customer, your claim ${claim.id} has been declined. Reason: ${fraudIndicators.join('; ') || 'Coverage terms not met.'}`;

  return {
    status,
    estimatedPayout,
    confidenceScore: Math.max(0.1, Math.min(0.95, confidenceScore)),
    reason:
      fraudIndicators.length > 0
        ? `Flags raised: ${fraudIndicators.join('; ')}.`
        : `${claim.type} policy. ${damageSeverity} damage. Documents ${claim.documentsComplete ? 'complete' : 'incomplete'}.`,
    customerMessage,
    damageSeverity,
    payoutPercentage,
    fraudIndicators,
    coverageValid,
  };
}

// ─── Main debate function ─────────────────────────────────────────────────────

export async function runDebate(
  claim: ClaimInput,
  models: Record<'strategist' | 'critic' | 'executor', RegisteredModel | null>,
  onMessage: (agent: string, text: string, round: number) => void,
  onAgentStatus: (agent: string, status: AgentStatus) => void,
  rounds: number = 3,
  timeout: number = 60000,
  useMockFallback = true,
  openrouterKey = '',
): Promise<ConsensusResult> {
  const agentList = (['strategist', 'critic', 'executor'] as const).filter((a) => !!models[a]);

  if (agentList.length === 0) {
    return { ...fallbackConsensus, claimDecision: computeClaimDecision(claim) };
  }

  const agentTimeout = Math.min(timeout, 90_000);

  const claimContext = [
    `Claim ID: ${claim.id}`,
    `Description: ${claim.description}`,
    `Policy Type: ${claim.type}`,
    `Claim Amount: ₹${claim.amount.toLocaleString('en-IN')}`,
    `Past Claims: ${claim.pastClaims}`,
    `Documents: ${claim.documentsComplete ? 'Complete' : claim.documentsPartial ? 'Partial' : 'Missing'}`,
    claim.imageUrl ? `Image URL: ${claim.imageUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const availableModelsList = (Object.entries(models) as [string, RegisteredModel | null][])
    .filter(([, m]) => m)
    .map(([agent, m]) => `  ${agent}: ${m!.name} (${m!.provider})`)
    .join('\n');

  const transcript: { agent: string; text: string; round: number }[] = [];

  const call = (model: RegisteredModel, sys: string, user: string, img?: string | null) =>
    withTimeout(callModel(model, sys, user, openrouterKey, img), agentTimeout);

  try {
    // ── ROUND 1: Parallel Initial Assessment ─────────────────────────────────
    onAgentStatus('strategist', 'THINKING');
    onAgentStatus('critic', 'THINKING');
    onAgentStatus('executor', 'THINKING');

    await Promise.all(
      agentList.map(async (agent) => {
        const model = models[agent]!;
        const systemPrompts: Record<typeof agent, string> = {
          strategist: STRATEGIST_ROUND1,
          critic: CRITIC_ROUND1,
          executor: EXECUTOR_ROUND1.replace('{AVAILABLE_MODELS}', availableModelsList),
        };
        const text = await call(model, systemPrompts[agent], claimContext);
        transcript.push({ agent, text, round: 1 });
        onAgentStatus(agent, 'SPOKE');
        onMessage(agent, text, 1);
      }),
    );

    // ── ROUND 2: Sequential Cross-Examination ────────────────────────────────
    const stratR1 = transcript.find((t) => t.agent === 'strategist' && t.round === 1)?.text ?? '';

    if (models.critic && agentList.includes('critic')) {
      onAgentStatus('critic', 'OBJECTING');
      const criticR2Prompt = `${CRITIC_ROUND2}\n\nStrategist's proposal:\n${stratR1}\n\nClaim context:\n${claimContext}`;
      const criticR2 = await call(models.critic, CRITIC_ROUND1, criticR2Prompt);
      transcript.push({ agent: 'critic', text: criticR2, round: 2 });
      onAgentStatus('critic', 'SPOKE');
      onMessage('critic', criticR2, 2);
    }

    if (models.strategist && agentList.includes('strategist')) {
      onAgentStatus('strategist', 'THINKING');
      const criticR2 = transcript.find((t) => t.agent === 'critic' && t.round === 2)?.text ?? '';
      const stratR2Prompt = `${STRATEGIST_ROUND2}\n\nCritic's objection:\n${criticR2}\n\nOriginal proposal:\n${stratR1}\n\nClaim context:\n${claimContext}`;
      const stratR2 = await call(models.strategist, STRATEGIST_ROUND1, stratR2Prompt);
      transcript.push({ agent: 'strategist', text: stratR2, round: 2 });
      onAgentStatus('strategist', 'SPOKE');
      onMessage('strategist', stratR2, 2);
    }

    // ── Vision Damage Assessment (if image present) ───────────────────────────
    if (claim.imageUrl) {
      const visionModel =
        [models.critic, models.executor, models.strategist].find(
          (m) => m?.tags?.includes('vision'),
        ) ?? models.strategist ?? models.critic ?? models.executor;

      if (visionModel) {
        onAgentStatus('critic', 'THINKING');
        const imageBase64 = await fetchImageAsBase64(claim.imageUrl);
        if (imageBase64) {
          const damageText = await call(
            visionModel,
            'You are a vehicle damage assessment AI. Analyze the provided image objectively.',
            `${DAMAGE_ASSESSMENT_PROMPT}\n\nClaim description: ${claim.description}\nClaim amount: ₹${claim.amount.toLocaleString('en-IN')}`,
            imageBase64,
          );
          const visionMsg = `[VISION ASSESSMENT] ${damageText}`;
          transcript.push({ agent: 'critic', text: visionMsg, round: 2 });
          onAgentStatus('critic', 'SPOKE');
          onMessage('critic', visionMsg, 2);
        }
      }
    }

    // ── Executor Round 2: Finalize ────────────────────────────────────────────
    if (models.executor && agentList.includes('executor') && rounds >= 3) {
      onAgentStatus('executor', 'THINKING');
      const priorText = transcript
        .slice(-4)
        .map((t) => `[${t.agent.toUpperCase()}]: ${t.text}`)
        .join('\n');
      const execR2Prompt = `Finalize your operational plan.\n\nRecent debate:\n${priorText}\n\nClaim context:\n${claimContext}`;
      const execR2 = await call(
        models.executor,
        EXECUTOR_ROUND1.replace('{AVAILABLE_MODELS}', availableModelsList),
        execR2Prompt,
      );
      transcript.push({ agent: 'executor', text: execR2, round: 2 });
      onAgentStatus('executor', 'SPOKE');
      onMessage('executor', execR2, 2);
    }

    // ── SYNTHESIS: Produce structured JSON output ────────────────────────────
    const synthesisModel =
      // prefer strongest text model for JSON gen
      models.strategist ?? models.executor ?? models.critic!;

    onAgentStatus('executor', 'PROPOSING');
    onMessage('executor', 'Synthesizing final pipeline and claim decision...', rounds);

    const transcriptText = transcript
      .map((t) => `[R${t.round}][${t.agent.toUpperCase()}]: ${t.text}`)
      .join('\n\n');

    const synthesisUserPrompt = `${SYNTHESIS_PROMPT}
CLAIM CONTEXT:
${claimContext}

DEBATE TRANSCRIPT:
${transcriptText}
`;

    const rawSynthesis = await call(
      synthesisModel,
      'You are a precise JSON synthesis agent. Output ONLY valid JSON. No markdown. No code fences. No extra text.',
      synthesisUserPrompt,
    );

    // Extract JSON robustly
    const start = rawSynthesis.indexOf('{');
    const end = rawSynthesis.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON in synthesis response');
    const parsed = JSON.parse(rawSynthesis.slice(start, end + 1)) as ConsensusResult;

    if (!parsed?.nodes?.length) throw new Error('Synthesis returned no pipeline nodes');

    // Always ensure claimDecision is present (LLM may omit it)
    if (!parsed.claimDecision) {
      parsed.claimDecision = computeClaimDecision(claim);
    }

    onAgentStatus('strategist', 'VOTED');
    onAgentStatus('critic', 'VOTED');
    onAgentStatus('executor', 'VOTED');

    return parsed;
  } catch (err) {
    console.error('Council debate failed:', err);
    if (useMockFallback) {
      return {
        ...fallbackConsensus,
        claimDecision: computeClaimDecision(claim),
      };
    }
    throw err;
  }
}
