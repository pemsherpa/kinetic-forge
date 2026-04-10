import { create } from 'zustand';
import { AgentStatus, DebateMessage, ConsensusResult, ClaimInput } from '../types';

export interface CouncilStore {
  phase: 'idle' | 'round1' | 'round2' | 'round3' | 'consensus' | 'done';
  agentStatuses: { strategist: AgentStatus; critic: AgentStatus; executor: AgentStatus };
  debateMessages: DebateMessage[];
  votes: { strategist: boolean | null; critic: boolean | null; executor: boolean | null };
  consensusResult: ConsensusResult | null;
  isDebating: boolean;
  usedFallback: boolean;
  startDebate: (claim: ClaimInput) => Promise<void>;
  resetCouncil: () => void;
  addMessage: (msg: DebateMessage) => void;
  setVote: (agent: 'strategist' | 'critic' | 'executor', vote: boolean) => void;
  setConsensus: (result: ConsensusResult) => void;
  setAgentStatus: (agent: 'strategist' | 'critic' | 'executor', status: AgentStatus) => void;
  setPhase: (phase: 'idle' | 'round1' | 'round2' | 'round3' | 'consensus' | 'done') => void;
  setUsedFallback: (used: boolean) => void;
}

export const useCouncilStore = create<CouncilStore>((set, get) => ({
  phase: 'idle',
  agentStatuses: { strategist: 'IDLE', critic: 'IDLE', executor: 'IDLE' },
  debateMessages: [],
  votes: { strategist: null, critic: null, executor: null },
  consensusResult: null,
  isDebating: false,
  usedFallback: false,

  startDebate: async (claim: ClaimInput) => {
    // Orchestrated internally by runDebate, handled via component actions or side effects
    set({
      isDebating: true,
      phase: 'round1',
      agentStatuses: { strategist: 'THINKING', critic: 'THINKING', executor: 'THINKING' },
      debateMessages: [],
      votes: { strategist: null, critic: null, executor: null },
      consensusResult: null,
      usedFallback: false,
    });
  },

  resetCouncil: () => set({
    phase: 'idle',
    agentStatuses: { strategist: 'IDLE', critic: 'IDLE', executor: 'IDLE' },
    debateMessages: [],
    votes: { strategist: null, critic: null, executor: null },
    consensusResult: null,
    isDebating: false,
    usedFallback: false,
  }),

  addMessage: (msg: DebateMessage) => set((state) => ({
    debateMessages: [...state.debateMessages, msg]
  })),

  setVote: (agent, vote) => set((state) => ({
    votes: { ...state.votes, [agent]: vote }
  })),

  setConsensus: (result) => set({
    consensusResult: result,
    phase: 'done',
    isDebating: false
  }),

  setAgentStatus: (agent, status) => set((state) => ({
    agentStatuses: { ...state.agentStatuses, [agent]: status }
  })),

  setPhase: (phase) => set({ phase }),
  
  setUsedFallback: (used) => set({ usedFallback: used })
}));
