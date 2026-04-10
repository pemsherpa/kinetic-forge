import { ConsensusResult } from '../types';

export const fallbackConsensus: ConsensusResult = {
  nodes: [
    {
      id: 'intake-1',
      type: 'intake',
      label: 'Intake & Parsing',
      parallel: false,
      parallelGroup: null,
      conditional: false,
      conditionNote: null,
      modelTag: 'efficiency',
      systemPromptHint: 'Extract claim details and policy number efficiently.'
    },
    {
      id: 'coverage-1',
      type: 'coverage',
      label: 'Coverage Check',
      parallel: true,
      parallelGroup: 'group-1',
      conditional: false,
      conditionNote: null,
      modelTag: 'analysis',
      systemPromptHint: 'Verify if the described damage falls under the policy terms.'
    },
    {
      id: 'fraud-1',
      type: 'fraud',
      label: 'Fraud Detection',
      parallel: true,
      parallelGroup: 'group-1',
      conditional: false,
      conditionNote: null,
      modelTag: 'reasoning',
      systemPromptHint: 'Analyze past claims and description for inconsistencies or fraud indicators.'
    },
    {
      id: 'gate-1',
      type: 'gate',
      label: 'Decision Gate',
      parallel: false,
      parallelGroup: null,
      conditional: false,
      conditionNote: null,
      modelTag: 'reasoning',
      systemPromptHint: 'Make a final decision based on coverage and fraud results.'
    },
    {
      id: 'output-1',
      type: 'output',
      label: 'Final Output',
      parallel: false,
      parallelGroup: null,
      conditional: false,
      conditionNote: null,
      modelTag: 'communication',
      systemPromptHint: 'Format the final response for the user.'
    }
  ],
  rationale: 'Fallback pipeline built due to API failure or rate limit.',
  estimatedSteps: 5,
  parallelGroups: ['group-1']
};
