import { create } from 'zustand';
import { ModelConfig, ConsensusNode } from '../types';

export interface ModelStore {
  models: ModelConfig[];
  openRouterApiKey: string;
  ollamaBaseUrl: string;
  defaultModelId: string | null;
  addModel: (model: ModelConfig) => void;
  updateModel: (id: string, updates: Partial<ModelConfig>) => void;
  removeModel: (id: string) => void;
  setOpenRouterApiKey: (key: string) => void;
  setOllamaBaseUrl: (url: string) => void;
  setDefaultModel: (id: string) => void;
  autoAssignModels: (nodes: ConsensusNode[]) => Record<string, string>;
  getBestModelForTask: (tag: string) => ModelConfig | undefined;
}

import { config } from '../config';

const defaultModels: ModelConfig[] = [
  {
    id: 'meta-llama/llama-3.1-8b-instruct:free',
    name: 'llama-3.1-8b-instruct',
    provider: 'OpenRouter',
    tags: ['general', 'efficiency'],
  },
  {
    id: 'mistralai/mixtral-8x7b-instruct',
    name: 'mixtral-8x7b',
    provider: 'OpenRouter',
    tags: ['reasoning', 'analysis'],
  }
];

export const useModelStore = create<ModelStore>((set, get) => ({
  models: defaultModels,
  openRouterApiKey: config.openRouterApiKey || '',
  ollamaBaseUrl: 'http://localhost:11434',
  defaultModelId: defaultModels[0].id,

  addModel: (model) => set((state) => ({ models: [...state.models, model] })),
  
  updateModel: (id, updates) => set((state) => ({
    models: state.models.map(m => m.id === id ? { ...m, ...updates } : m)
  })),

  removeModel: (id) => set((state) => ({
    models: state.models.filter(m => m.id !== id)
  })),

  setOpenRouterApiKey: (key) => set({ openRouterApiKey: key }),
  setOllamaBaseUrl: (url) => set({ ollamaBaseUrl: url }),
  setDefaultModel: (id) => set({ defaultModelId: id }),

  getBestModelForTask: (tag: string) => {
    const { models, defaultModelId } = get();
    // Try to find a model with the exact tag
    const taggedModels = models.filter(m => m.tags.includes(tag));
    if (taggedModels.length > 0) return taggedModels[0];
    
    // Fallback to general
    const generalModels = models.filter(m => m.tags.includes('general'));
    if (generalModels.length > 0) return generalModels[0];

    // Fallback to default
    return models.find(m => m.id === defaultModelId) || models[0];
  },

  autoAssignModels: (nodes: ConsensusNode[]) => {
    const { getBestModelForTask } = get();
    const assignment: Record<string, string> = {};
    nodes.forEach(node => {
      const best = getBestModelForTask(node.modelTag);
      if (best) {
        assignment[node.id] = best.id;
      }
    });
    return assignment;
  }
}));
