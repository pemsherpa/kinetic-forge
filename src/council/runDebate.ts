import { ClaimInput, ConsensusResult, AgentStatus, ClaimDecision } from '../types';
import { fallbackConsensus } from './fallbackConsensus';
import { RegisteredModel } from '../stores/modelStore';
import { fetchClaimImageAsBase64, guessImageMimeFromBase64 } from '../lib/claimImage';
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

const DEFAULT_DEBATE_MAX_TOKENS = 2048;
const SYNTHESIS_MAX_TOKENS = 8192;
const VISION_MAX_TOKENS = 3072;

interface CallModelOptions {
  maxTokens?: number;
  temperature?: number;
  /** Ollama: native JSON; OpenRouter: response_format json_object when supported */
  jsonMode?: boolean;
}

type OpenAIStyleContent = Array<
  { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }
>;

function buildUserMessagePayload(
  userPrompt: string,
  imageBase64: string | null | undefined,
  forOllama: boolean,
): { content: string | OpenAIStyleContent; images?: string[] } {
  if (!imageBase64) {
    return { content: userPrompt };
  }
  if (forOllama) {
    return { content: userPrompt, images: [imageBase64] };
  }
  const mime = guessImageMimeFromBase64(imageBase64);
  const dataUrl = `data:${mime};base64,${imageBase64}`;
  const content: OpenAIStyleContent = [
    { type: 'text', text: userPrompt },
    { type: 'image_url', image_url: { url: dataUrl } },
  ];
  return { content };
}

function stripMarkdownJsonFence(raw: string): string {
  const t = raw.trim();
  const m = /^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```$/im.exec(t);
  return m ? m[1]!.trim() : t;
}

async function callModel(
  model: RegisteredModel,
  systemPrompt: string,
  userPrompt: string,
  openrouterKey = '',
  imageBase64?: string | null,
  opts: CallModelOptions = {},
): Promise<string> {
  const maxTokens = opts.maxTokens ?? DEFAULT_DEBATE_MAX_TOKENS;
  const temperature = opts.temperature ?? 0.28;
  const jsonMode = !!opts.jsonMode;

  const ollamaUser = buildUserMessagePayload(userPrompt, imageBase64, true);
  const openaiUser = buildUserMessagePayload(userPrompt, imageBase64, false);

  const ollamaMessages: Array<{ role: string; content: string; images?: string[] }> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: ollamaUser.content as string, ...(ollamaUser.images ? { images: ollamaUser.images } : {}) },
  ];

  const openAiMessages: Array<{ role: string; content: string | OpenAIStyleContent }> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: openaiUser.content as string | OpenAIStyleContent },
  ];

  if (model.provider === 'Ollama') {
    const body: Record<string, unknown> = {
      model: model.name,
      messages: ollamaMessages,
      stream: false,
      options: { temperature, num_predict: maxTokens },
    };
    if (jsonMode) body.format = 'json';

    const resp = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const errTxt = await resp.text().catch(() => '');
      throw new Error(`Ollama HTTP ${resp.status}: ${errTxt.slice(0, 400)}`);
    }
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
        'HTTP-Referer':
          typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080',
        'X-Title': 'Zathura Claims Council',
      },
      body: JSON.stringify({
        model: model.name,
        messages: openAiMessages,
        temperature,
        max_tokens: maxTokens,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
    if (!resp.ok) {
      const errTxt = await resp.text().catch(() => '');
      throw new Error(`OpenRouter HTTP ${resp.status}: ${errTxt.slice(0, 400)}`);
    }
    const data = await resp.json();
    return String(data?.choices?.[0]?.message?.content ?? '').trim();
  }

  if (!model.endpoint) throw new Error('Custom model endpoint missing');
  const resp = await fetch(model.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(model.headers ?? {}) },
    body: JSON.stringify({
      model: model.name,
      messages: openAiMessages,
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  if (!resp.ok) {
    const errTxt = await resp.text().catch(() => '');
    throw new Error(`Custom endpoint HTTP ${resp.status}: ${errTxt.slice(0, 400)}`);
  }
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

  const call = (
    model: RegisteredModel,
    sys: string,
    user: string,
    img?: string | null,
    opts?: CallModelOptions,
  ) => withTimeout(callModel(model, sys, user, openrouterKey, img, opts ?? {}), agentTimeout);

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
        const text = await call(model, systemPrompts[agent], claimContext, undefined, {
          maxTokens: DEFAULT_DEBATE_MAX_TOKENS,
        });
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
      const criticR2 = await call(models.critic, CRITIC_ROUND1, criticR2Prompt, undefined, {
        maxTokens: DEFAULT_DEBATE_MAX_TOKENS,
      });
      transcript.push({ agent: 'critic', text: criticR2, round: 2 });
      onAgentStatus('critic', 'SPOKE');
      onMessage('critic', criticR2, 2);
    }

    if (models.strategist && agentList.includes('strategist')) {
      onAgentStatus('strategist', 'THINKING');
      const criticR2 = transcript.find((t) => t.agent === 'critic' && t.round === 2)?.text ?? '';
      const stratR2Prompt = `${STRATEGIST_ROUND2}\n\nCritic's objection:\n${criticR2}\n\nOriginal proposal:\n${stratR1}\n\nClaim context:\n${claimContext}`;
      const stratR2 = await call(models.strategist, STRATEGIST_ROUND1, stratR2Prompt, undefined, {
        maxTokens: DEFAULT_DEBATE_MAX_TOKENS,
      });
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
        const imageBase64 = await fetchClaimImageAsBase64(claim.imageUrl);
        if (imageBase64) {
          const damageText = await call(
            visionModel,
            'You are a vehicle damage assessment and OCR specialist. Read all visible text and assess physical damage objectively.',
            `${DAMAGE_ASSESSMENT_PROMPT}\n\nClaim description: ${claim.description}\nClaim amount: ₹${claim.amount.toLocaleString('en-IN')}`,
            imageBase64,
            { maxTokens: VISION_MAX_TOKENS, temperature: 0.22 },
          );
          const visionMsg = `[VISION ASSESSMENT + OCR]\n${damageText}`;
          transcript.push({ agent: 'critic', text: visionMsg, round: 3 });
          onAgentStatus('critic', 'SPOKE');
          onMessage('critic', visionMsg, 3);
        }
      }
    }

    // ── Executor Round 2: Finalize ────────────────────────────────────────────
    if (models.executor && agentList.includes('executor') && rounds >= 3) {
      onAgentStatus('executor', 'THINKING');
      const priorText = transcript
        .slice(-10)
        .map((t) => `[${t.agent.toUpperCase()}]: ${t.text}`)
        .join('\n');
      const execR2Prompt = `Finalize your operational plan.\n\nRecent debate:\n${priorText}\n\nClaim context:\n${claimContext}`;
      const execR2 = await call(
        models.executor,
        EXECUTOR_ROUND1.replace('{AVAILABLE_MODELS}', availableModelsList),
        execR2Prompt,
        undefined,
        { maxTokens: DEFAULT_DEBATE_MAX_TOKENS },
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
    const SYNTHESIS_UI_ROUND = 4;
    onMessage('executor', 'Synthesizing final pipeline and claim decision...', SYNTHESIS_UI_ROUND);

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
      undefined,
      {
        maxTokens: SYNTHESIS_MAX_TOKENS,
        temperature: 0.18,
        jsonMode: true,
      },
    );

    // Extract JSON robustly (models sometimes wrap output in fences despite instructions)
    const cleaned = stripMarkdownJsonFence(rawSynthesis);
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON in synthesis response');
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as ConsensusResult;

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
