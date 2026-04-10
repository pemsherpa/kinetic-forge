export type AgentStatus = 'IDLE' | 'THINKING' | 'SPOKE' | 'OBJECTING' | 'RESPONDING' | 'PROPOSING' | 'VOTED';

export type NodeType = 'intake' | 'coverage' | 'fraud' | 'vision' | 'gate' | 'payout' | 'confidence' | 'communication' | 'output';

export interface DebateMessage {
  agent: 'strategist' | 'critic' | 'executor';
  text: string;
  round: number;
  timestamp: number;
}

export interface ClaimInput {
  id: string;
  description: string;
  type: string;
  amount: number;
  pastClaims: number;
  documentsComplete: boolean;
  documentsPartial: boolean;
  documentsMissing: boolean;
  imageUrl?: string;
  rawJson?: string;
}

export interface ConsensusNode {
  id: string;
  type: NodeType;
  label: string;
  parallel: boolean;
  parallelGroup: string | null;
  conditional: boolean;
  conditionNote: string | null;
  modelTag: 'reasoning' | 'analysis' | 'vision' | 'communication' | 'efficiency' | 'general';
  systemPromptHint: string;
}

export interface ClaimDecision {
  status: 'Approved' | 'Rejected' | 'Pending';
  estimatedPayout: number;
  confidenceScore: number;
  reason: string;
  customerMessage: string;
  damageSeverity: 'Minor' | 'Moderate' | 'Major';
  payoutPercentage: number;
  fraudIndicators: string[];
  coverageValid: boolean;
}

export interface ConsensusResult {
  nodes: ConsensusNode[];
  rationale: string;
  estimatedSteps: number;
  parallelGroups: string[];
  claimDecision?: ClaimDecision;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'OpenRouter' | 'Ollama' | 'Custom';
  endpoint?: string;
  apiKey?: string;
  tags: string[];
  latency?: number;
  costIn?: number;
  costOut?: number;
}
