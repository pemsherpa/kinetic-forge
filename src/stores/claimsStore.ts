import { create } from 'zustand';
import { ClaimInput } from '../types';

export interface ClaimsStore {
  activeClaim: ClaimInput | null;
  results: any[];
  setActiveClaim: (claim: ClaimInput) => void;
  addResult: (result: any) => void;
  clearResults: () => void;
}

export const useClaimsStore = create<ClaimsStore>((set) => ({
  activeClaim: null,
  results: [],
  
  setActiveClaim: (claim) => set({ activeClaim: claim }),
  
  addResult: (result) => set((state) => ({ 
    results: [result, ...state.results] 
  })),

  clearResults: () => set({ results: [] })
}));
