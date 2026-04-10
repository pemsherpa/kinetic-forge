export const benchmarks: Record<string, { modelId: string, arenaElo: number, mmlu: number, contextK: number, notes: string }> = {
  'meta-llama/llama-3.1-8b-instruct:free': {
    modelId: 'meta-llama/llama-3.1-8b-instruct:free',
    arenaElo: 1150,
    mmlu: 73.0,
    contextK: 128,
    notes: 'Excellent generalist. Llama 3 architecture.'
  },
  'meta-llama/llama-3.1-70b-instruct': {
    modelId: 'meta-llama/llama-3.1-70b-instruct',
    arenaElo: 1210,
    mmlu: 82.0,
    contextK: 128,
    notes: 'High reasoning cap.'
  },
  'mistralai/mistral-7b-instruct': {
    modelId: 'mistralai/mistral-7b-instruct',
    arenaElo: 1045,
    mmlu: 62.5,
    contextK: 8,
    notes: 'Legacy swift model.'
  },
  'mistralai/mixtral-8x7b-instruct': {
    modelId: 'mistralai/mixtral-8x7b-instruct',
    arenaElo: 1114,
    mmlu: 70.6,
    contextK: 32,
    notes: 'MoE architecture, great cost/perf ratio'
  },
  'google/gemma-2-9b-it': {
    modelId: 'google/gemma-2-9b-it',
    arenaElo: 1125,
    mmlu: 71.3,
    contextK: 8,
    notes: 'Strong lightweight model.'
  },
  'google/gemma-2-27b-it': {
    modelId: 'google/gemma-2-27b-it',
    arenaElo: 1180,
    mmlu: 75.2,
    contextK: 8,
    notes: 'Outstanding scaling performance.'
  },
  'qwen/qwen-2.5-72b-instruct': {
    modelId: 'qwen/qwen-2.5-72b-instruct',
    arenaElo: 1215,
    mmlu: 82.3,
    contextK: 128,
    notes: 'State of the art open weights.'
  },
  'microsoft/phi-3-medium-128k-instruct': {
    modelId: 'microsoft/phi-3-medium-128k-instruct',
    arenaElo: 1110,
    mmlu: 78.0,
    contextK: 128,
    notes: 'Dense reasoning model.'
  },
  'deepseek/deepseek-r1': {
    modelId: 'deepseek/deepseek-r1',
    arenaElo: 1230,
    mmlu: 83.5,
    contextK: 128,
    notes: 'Top tier reasoning cluster.'
  }
};
