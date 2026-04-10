import { useCouncilStore } from '../stores/councilStore';
import { useModelStore } from '../stores/modelStore';
import { getAgentModels } from './agentModels';
import { callOpenRouter } from '../api/openrouter';
import { defaultConsensus } from './fallbackConsensus';
import { ClaimInput, ConsensusResult } from '../types';
import { DEBATE_TIMINGS } from './debateAnimations';
import * as Prompts from './prompts';

export async function runDebate(claim: ClaimInput): Promise<ConsensusResult> {
  const councilStore = useCouncilStore.getState();
  const modelStore = useModelStore.getState();
  
  const { strategist, critic, executor } = getAgentModels(modelStore);
  const apiKey = modelStore.openRouterApiKey;

  const claimStr = JSON.stringify(claim, null, 2);
  const availableModelsStr = JSON.stringify(modelStore.models.map(m => ({ id: m.id, tags: m.tags })));
  const userMsg = `CLAIM DATA:\n${claimStr}\n\nAVAILABLE MODELS:\n${availableModelsStr}`;

  councilStore.startDebate(claim);
  
  await new Promise(r => setTimeout(r, DEBATE_TIMINGS.COUNCIL_START_DELAY));

  try {
    // --- ROUND 1 (Parallel) ---
    const [stratR1, criticR1, execR1] = await Promise.all([
      callOpenRouter(Prompts.STRATEGIST_ROUND1, userMsg, strategist, apiKey),
      callOpenRouter(Prompts.CRITIC_ROUND1, userMsg, critic, apiKey),
      callOpenRouter(Prompts.EXECUTOR_ROUND1, userMsg, executor, apiKey)
    ]);

    // Dispatch messages
    councilStore.addMessage({ agent: 'strategist', text: stratR1, round: 1, timestamp: Date.now() });
    councilStore.setAgentStatus('strategist', 'SPOKE');
    
    await new Promise(r => setTimeout(r, DEBATE_TIMINGS.ROUND_DELAY));
    councilStore.addMessage({ agent: 'critic', text: criticR1, round: 1, timestamp: Date.now() });
    councilStore.setAgentStatus('critic', 'SPOKE');
    
    await new Promise(r => setTimeout(r, DEBATE_TIMINGS.ROUND_DELAY));
    councilStore.addMessage({ agent: 'executor', text: execR1, round: 1, timestamp: Date.now() });
    councilStore.setAgentStatus('executor', 'SPOKE');

    // --- ROUND 2 (Sequential) ---
    councilStore.setPhase('round2');
    councilStore.setAgentStatus('critic', 'THINKING');
    await new Promise(r => setTimeout(r, DEBATE_TIMINGS.ROUND_DELAY));

    const criticR2Msg = `The Strategist's Proposal:\n${stratR1}\n\nWhat is the biggest flaw?`;
    const criticR2 = await callOpenRouter(Prompts.CRITIC_ROUND2, criticR2Msg, critic, apiKey);
    councilStore.addMessage({ agent: 'critic', text: criticR2, round: 2, timestamp: Date.now() });
    councilStore.setAgentStatus('critic', 'OBJECTING');

    councilStore.setAgentStatus('strategist', 'THINKING');
    await new Promise(r => setTimeout(r, DEBATE_TIMINGS.ROUND_DELAY));
    
    const stratR2Msg = `The Critic objects:\n${criticR2}\n\nRespond and finalize the pipeline.`;
    const stratR2 = await callOpenRouter(Prompts.STRATEGIST_ROUND2, stratR2Msg, strategist, apiKey);
    councilStore.addMessage({ agent: 'strategist', text: stratR2, round: 2, timestamp: Date.now() });
    councilStore.setAgentStatus('strategist', 'RESPONDING');

    // --- ROUND 3 (Synthesis) ---
    councilStore.setPhase('round3');
    councilStore.setAgentStatus('strategist', 'THINKING');
    await new Promise(r => setTimeout(r, DEBATE_TIMINGS.ROUND_DELAY));
    
    const transcript = councilStore.debateMessages.map(m => `[${m.agent.toUpperCase()}]: ${m.text}`).join('\n\n');
    let synthesisResultStr = await callOpenRouter(Prompts.SYNTHESIS_PROMPT, transcript, strategist, apiKey);
    
    // strip markdown wrappers if any
    synthesisResultStr = synthesisResultStr.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const consensusParsed = JSON.parse(synthesisResultStr) as ConsensusResult;

    // Simulate voting procedure
    councilStore.setPhase('consensus');
    councilStore.setAgentStatus('executor', 'VOTED');
    councilStore.setVote('executor', true);
    await new Promise(r => setTimeout(r, DEBATE_TIMINGS.CONSENSUS_VOTE_INTERVAL));
    
    councilStore.setAgentStatus('critic', 'VOTED');
    councilStore.setVote('critic', true);
    await new Promise(r => setTimeout(r, DEBATE_TIMINGS.CONSENSUS_VOTE_INTERVAL));
    
    councilStore.setAgentStatus('strategist', 'VOTED');
    councilStore.setVote('strategist', true);
    await new Promise(r => setTimeout(r, DEBATE_TIMINGS.CONSENSUS_POP_DELAY));

    councilStore.setConsensus(consensusParsed);
    return consensusParsed;

  } catch (err) {
    console.error("Debate API error:", err);
    councilStore.setUsedFallback(true);
    
    // Dispatch fake fallback messages if failure
    councilStore.addMessage({ agent: 'strategist', text: "API offline. Initiating fallback...", round: 1, timestamp: Date.now() });
    councilStore.addMessage({ agent: 'critic', text: "Fallback risk accepted.", round: 1, timestamp: Date.now() });
    councilStore.addMessage({ agent: 'executor', text: "Proceeding with default layout.", round: 1, timestamp: Date.now() });
    
    councilStore.setPhase('consensus');
    councilStore.setVote('executor', true);
    councilStore.setVote('critic', true);
    councilStore.setVote('strategist', true);
    councilStore.setAgentStatus('executor', 'VOTED');
    councilStore.setAgentStatus('critic', 'VOTED');
    councilStore.setAgentStatus('strategist', 'VOTED');
    
    councilStore.setConsensus(defaultConsensus);
    return defaultConsensus;
  }
}
