import { create } from 'zustand';
import { ClaimInput } from '../types';

export interface ClaimResult {
  claim: ClaimInput;
  status: 'Approved' | 'Rejected' | 'Pending' | string;
  confidence: number;
  estimatedPayout?: number;
  reason?: string;
  customerMessage?: string;
  damageSeverity?: string;
  fraudIndicators?: string[];
  debateMessages?: Array<{ agent: string; text: string; round: number; ts: number; id: string }>;
}

interface ClaimsStore {
  currentClaim: ClaimInput | null;
  results: ClaimResult[];
  stats: {
    processed: number;
    approved: number;
    rejected: number;
    pending: number;
  };
  setActiveClaim: (claim: ClaimInput) => void;
  setClaim: (claim: ClaimInput) => void;
  addResult: (result: ClaimResult) => void;
  clearResults: () => void;
}

export const useClaimsStore = create<ClaimsStore>((set) => ({
  currentClaim: null,
  results: [],
  stats: { processed: 0, approved: 0, rejected: 0, pending: 0 },

  setActiveClaim: (claim) => set({ currentClaim: claim }),
  setClaim: (claim) => set({ currentClaim: claim }),

  addResult: (result) =>
    set((state) => {
      const s = result.status.toLowerCase();
      return {
        results: [result, ...state.results],
        stats: {
          processed: state.stats.processed + 1,
          approved: state.stats.approved + (s === 'approved' ? 1 : 0),
          rejected: state.stats.rejected + (s === 'rejected' ? 1 : 0),
          pending: state.stats.pending + (s === 'pending' ? 1 : 0),
        },
      };
    }),

  clearResults: () =>
    set({ results: [], stats: { processed: 0, approved: 0, rejected: 0, pending: 0 } }),
}));
