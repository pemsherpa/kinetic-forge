import { create } from 'zustand';
import { ClaimInput } from '../types';

export interface ClaimResult {
  claim: ClaimInput;
  status: string;
  confidence: number;
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
  setClaim: (claim: ClaimInput) => void;
  addResult: (result: ClaimResult) => void;
  clearResults: () => void;
}

export const useClaimsStore = create<ClaimsStore>((set) => ({
  currentClaim: null,
  results: [],
  stats: { processed: 0, approved: 0, rejected: 0, pending: 0 },

  setClaim: (claim) => set({ currentClaim: claim }),

  addResult: (result) => set((state) => {
    const isApproved = result.status.toLowerCase() === 'approved';
    const isRejected = result.status.toLowerCase() === 'rejected';
    
    return {
      results: [result, ...state.results],
      stats: {
        processed: state.stats.processed + 1,
        approved: state.stats.approved + (isApproved ? 1 : 0),
        rejected: state.stats.rejected + (isRejected ? 1 : 0),
        pending: state.stats.pending + (!isApproved && !isRejected ? 1 : 0)
      }
    };
  }),

  clearResults: () => set({ results: [], stats: { processed: 0, approved: 0, rejected: 0, pending: 0 } })
}));
