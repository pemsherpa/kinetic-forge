import { ClaimInput, ConsensusResult } from '../types';

export async function processClaim(claim: ClaimInput, consensus: ConsensusResult): Promise<{ status: string, confidence: number }> {
  // Mock logic to simulate processing through the pipeline
  return new Promise((resolve) => {
    setTimeout(() => {
      // Very simple mock logic based on claim details
      let confidence = 85;
      let status = 'Approved';
      
      if (claim.pastClaims > 2) {
        confidence -= 20;
      }
      if (claim.documentsMissing) {
        confidence -= 30;
      }
      if (claim.amount > 500000) {
        confidence -= 10;
      }

      if (confidence < 50) {
        status = 'Rejected';
      }

      resolve({ status, confidence });
    }, consensus.nodes.length * 600); // simulate roughly 600ms per node
  });
}
