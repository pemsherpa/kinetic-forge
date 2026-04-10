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
  agentStatuses: Record<'strategist'|'critic'|'executor', AgentStatus>;
  agentModels: Record<'strategist'|'critic'|'executor', string | null>;
  debateMessages: DebateMessage[];
  votes: Record<'strategist'|'critic'|'executor', boolean | null>;
  consensusResult: ConsensusResult | null;
  isDebating: boolean;
  usedFallback: boolean;
  error: string | null;
  
  startDebate: (claim: ClaimInput) => Promise<void>;
  resetCouncil: () => void;
  addMessage: (msg: Omit<DebateMessage, 'id'|'ts'>) => void;
  setAgentStatus: (agent: string, status: AgentStatus) => void;
  setVote: (agent: string, vote: boolean) => void;
  setConsensus: (result: ConsensusResult) => void;
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

  resetCouncil: () => set({
    phase: 'idle',
    agentStatuses: { strategist: 'IDLE', critic: 'IDLE', executor: 'IDLE' },
    debateMessages: [],
    votes: { strategist: null, critic: null, executor: null },
    consensusResult: null,
    isDebating: false,
    usedFallback: false,
    error: null,
  }),

  addMessage: (msg) => set(state => ({
    debateMessages: [...state.debateMessages, { ...msg, id: `msg-${Date.now()}-${Math.random()}`, ts: Date.now() }]
  })),

  setAgentStatus: (agent, status) => set(state => ({
    agentStatuses: { ...state.agentStatuses, [agent]: status }
  })),

  setVote: (agent, vote) => set(state => ({
    votes: { ...state.votes, [agent]: vote }
  })),

  setConsensus: (result) => set({ consensusResult: result }),

  startDebate: async (claim) => {
    set({ isDebating: true, phase: 'round1', error: null, usedFallback: false });
    
    try {
      const { useModelStore } = await import('./modelStore');
      const models = useModelStore.getState().getAgentModels();
      
      const consensus = await runDebate(
        claim, 
        models,
        (agent, text, round) => get().addMessage({ agent, text, round }),
        (agent, status) => get().setAgentStatus(agent, status)
      );

      set({ consensusResult: consensus, phase: 'consensus' });
      
      // Simulate Voting
      setTimeout(() => get().setVote('strategist', true), 300);
      setTimeout(() => get().setVote('critic', true), 600);
      setTimeout(async () => {
        get().setVote('executor', true);
        set({ phase: 'done', isDebating: false });
        
        // Push to pipeline directly, honoring autoLayout if true
        const { useWorkflowStore } = await import('./workflowStore');
        const { useSettingsStore } = await import('./settingsStore');
        const autoLayout = useSettingsStore.getState().autoLayout;
        if (autoLayout) {
          useWorkflowStore.getState().buildFromConsensus(consensus);
        }
      }, 900);

    } catch (e: any) {
      set({ error: e.message || 'Error occurred', isDebating: false, phase: 'error' });
    }
  }
}));
