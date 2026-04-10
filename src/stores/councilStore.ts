import { create } from 'zustand';
import { AgentStatus, ConsensusResult, ClaimInput } from '../types';
import { runDebate } from '../council/runDebate';

export interface DebateMessage {
  id: string;
  agent: string;
  text: string;
  round: number;
  ts: number;
}

interface CouncilStore {
  phase: 'idle' | 'round1' | 'round2' | 'round3' | 'consensus' | 'done' | 'error';
  agentStatuses: Record<'strategist' | 'critic' | 'executor', AgentStatus>;
  agentModels: Record<'strategist' | 'critic' | 'executor', string | null>;
  debateMessages: DebateMessage[];
  votes: Record<'strategist' | 'critic' | 'executor', boolean | null>;
  consensusResult: ConsensusResult | null;
  isDebating: boolean;
  usedFallback: boolean;
  error: string | null;
  showDialogue: boolean;

  startDebate: (claim: ClaimInput) => Promise<void>;
  resetCouncil: () => void;
  addMessage: (msg: Omit<DebateMessage, 'id' | 'ts'>) => void;
  setAgentStatus: (agent: string, status: AgentStatus) => void;
  setVote: (agent: string, vote: boolean) => void;
  setConsensus: (result: ConsensusResult) => void;
  setShowDialogue: (v: boolean) => void;
}

export const useCouncilStore = create<CouncilStore>((set, get) => ({
  phase: 'idle',
  agentStatuses: { strategist: 'IDLE', critic: 'IDLE', executor: 'IDLE' },
  agentModels: { strategist: null, critic: null, executor: null },
  debateMessages: [],
  votes: { strategist: null, critic: null, executor: null },
  consensusResult: null,
  isDebating: false,
  usedFallback: false,
  error: null,
  showDialogue: false,

  setShowDialogue: (v) => set({ showDialogue: v }),

  resetCouncil: () =>
    set({
      phase: 'idle',
      agentStatuses: { strategist: 'IDLE', critic: 'IDLE', executor: 'IDLE' },
      agentModels: { strategist: null, critic: null, executor: null },
      debateMessages: [],
      votes: { strategist: null, critic: null, executor: null },
      consensusResult: null,
      isDebating: false,
      usedFallback: false,
      error: null,
    }),

  addMessage: (msg) =>
    set((state) => ({
      debateMessages: [
        ...state.debateMessages,
        { ...msg, id: `msg-${Date.now()}-${Math.random()}`, ts: Date.now() },
      ],
    })),

  setAgentStatus: (agent, status) =>
    set((state) => ({
      agentStatuses: { ...state.agentStatuses, [agent]: status },
    })),

  setVote: (agent, vote) =>
    set((state) => ({ votes: { ...state.votes, [agent]: vote } })),

  setConsensus: (result) => set({ consensusResult: result }),

  startDebate: async (claim) => {
    set({
      isDebating: true,
      phase: 'round1',
      error: null,
      usedFallback: false,
      debateMessages: [],
      votes: { strategist: null, critic: null, executor: null },
      consensusResult: null,
      agentStatuses: { strategist: 'IDLE', critic: 'IDLE', executor: 'IDLE' },
    });

    try {
      const { useModelStore } = await import('./modelStore');
      const { useSettingsStore } = await import('./settingsStore');
      const settings = useSettingsStore.getState();

      // Re-detect Ollama models if none loaded yet
      const ms = useModelStore.getState();
      if (ms.models.length === 0) {
        await ms.autoDetect();
      }

      const assignedModels = useModelStore.getState().getAgentModels();

      // Record which model name is assigned to each agent for UI display
      set({
        agentModels: {
          strategist: assignedModels.strategist?.name ?? null,
          critic: assignedModels.critic?.name ?? null,
          executor: assignedModels.executor?.name ?? null,
        },
      });

      const consensus = await runDebate(
        claim,
        assignedModels,
        (agent, text, round) => {
          get().addMessage({ agent, text, round });
          // Update phase label
          if (round === 1) set({ phase: 'round1' });
          else if (round === 2) set({ phase: 'round2' });
          else set({ phase: 'round3' });
        },
        (agent, status) => get().setAgentStatus(agent, status),
        settings.debateRounds,
        settings.roundTimeout * 1000,
        settings.useMockFallback,
        settings.openrouterKey,
      );

      set({ consensusResult: consensus, phase: 'consensus' });

      // Cascade votes with brief delays for animation
      setTimeout(() => get().setVote('strategist', true), 300);
      setTimeout(() => get().setVote('critic', true), 600);
      setTimeout(async () => {
        get().setVote('executor', true);
        set({ phase: 'done', isDebating: false });

        // Save result to claims history
        const { useClaimsStore } = await import('./claimsStore');
        if (consensus.claimDecision) {
          const d = consensus.claimDecision;
          useClaimsStore.getState().addResult({
            claim,
            status: d.status,
            confidence: Math.round(d.confidenceScore * 100),
            estimatedPayout: d.estimatedPayout,
            reason: d.reason,
            customerMessage: d.customerMessage,
            damageSeverity: d.damageSeverity,
            fraudIndicators: d.fraudIndicators,
            debateMessages: get().debateMessages,
          });
        }

        // Auto-build pipeline in the Pipeline tab
        const { useWorkflowStore } = await import('./workflowStore');
        if (settings.autoLayout) {
          useWorkflowStore.getState().buildFromConsensus(consensus);
        }
      }, 900);
    } catch (e: any) {
      set({
        error: e.message ?? 'Council error',
        isDebating: false,
        phase: 'error',
      });
    }
  },
}));
