import { ClaimInput, ConsensusNode } from '../types';

export const executeAllLogic = async (claim: ClaimInput, get: any, set: any) => {
  const { nodes, setNodeStatus, setNodeResult } = get();

  get().resetExecution();
  for (const n of nodes) setNodeStatus(n.id, 'IDLE');

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  // Grab the real claim decision produced by the council debate
  const { useCouncilStore } = await import('../stores/councilStore');
  const consensusResult = useCouncilStore.getState().consensusResult;
  const d = consensusResult?.claimDecision;

  const docStatus = claim.documentsComplete
    ? 'Complete'
    : claim.documentsPartial
      ? 'Partial'
      : 'Missing';

  const fraudScore = Math.min(
    100,
    claim.pastClaims * 15 +
      (claim.documentsMissing ? 25 : claim.documentsPartial ? 10 : 0) +
      (d?.fraudIndicators?.length ?? 0) * 8,
  );

  for (const n of nodes) {
    const config = n.data.config as ConsensusNode;
    setNodeStatus(n.id, 'RUNNING');

    const nodeDelay = ['vision', 'fraud', 'payout'].includes(config.type) ? 950 : 500;
    await delay(nodeDelay);

    let result: Record<string, any> = {};

    switch (config.type) {
      case 'intake':
        result = {
          'Claim ID': claim.id,
          'Policy Type': claim.type,
          'Claimed Amount': `₹${claim.amount.toLocaleString('en-IN')}`,
          'Documents': docStatus,
          'Past Claims': claim.pastClaims,
          'Image Provided': claim.imageUrl ? 'Yes' : 'No',
        };
        break;

      case 'coverage':
        result = {
          'Coverage Valid': d?.coverageValid ? '✓ Yes' : '✗ No',
          'Policy': claim.type,
          'Verdict': d?.coverageValid
            ? 'Comprehensive policy covers own-vehicle damage.'
            : `Third-Party policy does NOT cover own-vehicle damage. Claim is ineligible.`,
        };
        break;

      case 'fraud':
        result = {
          'Risk Score': `${fraudScore}/100`,
          'Past Claims': claim.pastClaims,
          'Risk Level': fraudScore > 50 ? '⚠ HIGH' : fraudScore > 25 ? '~ MEDIUM' : '✓ LOW',
          'Flags': d?.fraudIndicators?.length
            ? d.fraudIndicators.join('; ')
            : 'No fraud indicators detected.',
        };
        break;

      case 'vision':
        result = claim.imageUrl
          ? {
              'Image': 'Analyzed by vision model',
              'Damage Severity': d?.damageSeverity ?? 'Unknown',
              'Note': 'Visual damage confirmed against description.',
            }
          : {
              'Image': 'No image provided',
              'Damage Severity': d?.damageSeverity ?? 'Text-based assessment',
              'Note': 'Severity inferred from claim description only.',
            };
        break;

      case 'gate':
        result = {
          branch: d?.status?.toUpperCase() ?? 'PENDING',
          'Confidence': d ? `${Math.round(d.confidenceScore * 100)}%` : 'N/A',
          'Reason': d?.reason ?? 'Awaiting decision',
        };
        break;

      case 'payout':
        result = {
          'Damage Severity': d?.damageSeverity ?? 'N/A',
          'Payout Rate': d ? `${d.payoutPercentage}%` : 'N/A',
          'Gross': d ? `₹${Math.round((claim.amount * d.payoutPercentage) / 100).toLocaleString('en-IN')}` : '₹0',
          'Deductible': '₹3,000',
          'Net Payout': d ? `₹${d.estimatedPayout.toLocaleString('en-IN')}` : '₹0',
        };
        break;

      case 'confidence':
        result = {
          'Score': d ? `${Math.round(d.confidenceScore * 100)}%` : 'N/A',
          'Band': d
            ? d.confidenceScore >= 0.8
              ? 'HIGH — clear case'
              : d.confidenceScore >= 0.6
                ? 'MEDIUM — some ambiguity'
                : 'LOW — missing data / risk flags'
            : 'N/A',
          'Risk Factors': d?.fraudIndicators?.length
            ? `${d.fraudIndicators.length} flag(s) detected`
            : 'None',
        };
        break;

      case 'communication':
        result = {
          'Customer Message': d?.customerMessage ?? 'No message generated.',
        };
        break;

      case 'output':
        result = {
          status: d?.status ?? 'Pending',
          // 'confidence' field is reused for payout display in the node UI
          confidence: d?.estimatedPayout ?? 0,
          confidenceScore: d ? Math.round(d.confidenceScore * 100) : 50,
          message: [
            d?.reason ?? 'Decision pending review.',
            d?.fraudIndicators?.length
              ? `\n\nFlags: ${d.fraudIndicators.join('; ')}`
              : '',
            `\n\nCustomer: ${d?.customerMessage ?? ''}`,
          ].join(''),
        };
        break;

      default:
        result = { 'Status': 'Processed', 'Hint': config.systemPromptHint };
    }

    setNodeResult(n.id, result);
    setNodeStatus(n.id, 'DONE');
  }
};
