import { ModelStore } from '../stores/modelStore';

interface AgentModels {
  strategist: string;
  critic: string;
  executor: string;
}

export function getAgentModels(store: ModelStore): AgentModels {
  const models = store.models;
  
  if (!models || models.length === 0) {
    return {
      strategist: 'meta-llama/llama-3.1-8b-instruct:free',
      critic: 'meta-llama/llama-3.1-8b-instruct:free',
      executor: 'meta-llama/llama-3.1-8b-instruct:free',
    };
  }

  const getBest = (tag: string) => {
    // Basic scoring could look at benchmark cost/latency, here we just pick the first matching tag.
    let found = models.find(m => m.tags.includes(tag));
    if (!found) found = models.find(m => m.tags.includes('general'));
    if (!found) found = models[0];
    return found.id;
  };

  return {
    strategist: getBest('reasoning'),
    critic: getBest('analysis'),
    executor: getBest('efficiency'),
  };
}
