import { ClaimInput, ConsensusNode } from '../types';

export const executeAllLogic = async (claim: ClaimInput, get: any, set: any) => {
  const { nodes, setNodeStatus, setNodeResult } = get();

  // Reset statuses
  get().resetExecution();

  for (const n of nodes) {
    setNodeStatus(n.id, 'IDLE');
  }

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  for (const n of nodes) {
    const config = n.data.config as ConsensusNode;
    setNodeStatus(n.id, 'RUNNING');
    
    // Simulate API inference delay
    await delay(600);

    let resultData: Record<string, any> = {};

    switch (config.type) {
      case 'intake':
        resultData = { 'Entities Extracted': '2', 'Sentiment': 'Neutral' };
        break;
      case 'fraud':
        resultData = { 'Fraud Score': (claim.pastClaims * 15) + (claim.documentsMissing ? 20 : 0) };
        break;
      case 'gate':
        const fraudScore = (claim.pastClaims * 15) + (claim.documentsMissing ? 20 : 0);
        resultData = { branch: fraudScore > 30 ? 'REJECTED' : 'APPROVED' };
        break;
      case 'output':
        const fraudScoreFinal = (claim.pastClaims * 15) + (claim.documentsMissing ? 20 : 0);
        const finalStatus = fraudScoreFinal > 30 ? 'Rejected' : 'Approved';
        resultData = {
          status: finalStatus,
          confidence: claim.amount,
          confidenceScore: 100 - fraudScoreFinal,
          message: `The claim was ${finalStatus.toLowerCase()} based on a calculated pattern score of ${fraudScoreFinal}.`
        };
        // Log to claimsStore
        import('../stores/claimsStore').then(m => {
          m.useClaimsStore.getState().addResult({
            claim,
            status: finalStatus,
            confidence: 100 - fraudScoreFinal
          });
        });
        break;
      default:
        resultData = { 'Execution Status': 'Completed Successfully' };
    }

    setNodeResult(n.id, resultData);
    setNodeStatus(n.id, 'DONE');
  }
};
