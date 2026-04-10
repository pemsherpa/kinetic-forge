import { create } from 'zustand';
import { useSettingsStore } from './settingsStore';
import { benchmarks as hardcodedBenchmarks } from '../data/benchmarks';

export interface BenchmarkEntry {
  modelId: string;
  arenaElo: number;
  mmlu: number;
  contextK: number;
  notes: string;
}

export interface RegisteredModel {
  id: string;
  name: string;
  provider: 'OpenRouter' | 'Ollama' | 'Custom';
  tags: string[];
  contextLength?: number | null;
  costPerToken?: number;
  source?: string;
  endpoint?: string;
  headers?: Record<string, string>;
}

interface ModelStore {
  models: RegisteredModel[];
  benchmarks: Record<string, BenchmarkEntry>;
  isDetecting: boolean;
  autoDetect: () => Promise<void>;
  addModel: (model: Omit<RegisteredModel, 'id'> & { id?: string }) => void;
  removeModel: (id: string) => void;
  updateModel: (id: string, patch: Partial<RegisteredModel>) => void;
  testConnection: (model: RegisteredModel) => Promise<{ ok: boolean, latencyMs: number, error?: string }>;
  getBestModelForTask: (tag: string) => RegisteredModel | null;
  getAgentModels: () => Record<'strategist'|'critic'|'executor', RegisteredModel | null>;
}

export const useModelStore = create<ModelStore>((set, get) => ({
  models: [],
  benchmarks: {},
  isDetecting: false,

  autoDetect: async () => {
    set({ isDetecting: true });
    
    const detectedModels: RegisteredModel[] = [];

    // Detect Ollama
    try {
      const resp = await fetch('http://localhost:11434/api/tags');
      if (resp.ok) {
        const data = await resp.json();
        data.models?.forEach((m: any) => {
          detectedModels.push({
            id: `ollama-${m.name}`,
            name: m.name,
            provider: 'Ollama',
            tags: ['general'], // default tag, user can edit later
            contextLength: null,
            costPerToken: 0,
            source: 'auto-detected'
          });
        });
      }
    } catch(e) {
      // ignore
    }

    // Detect OpenRouter Free Models
    try {
      const resp = await fetch('https://openrouter.ai/api/v1/models');
      if (resp.ok) {
        const data = await resp.json();
        data.data?.forEach((m: any) => {
          if (m.pricing && m.pricing.prompt === "0") {
             detectedModels.push({
               id: m.id,
               name: m.id,
               provider: 'OpenRouter',
               tags: ['general'], // will map better tags later based on name heuristics if needed
               contextLength: m.context_length,
               costPerToken: 0,
               source: 'auto-detected'
             });
          }
        });
      }
    } catch(e) {
      // ignore
    }

    set(state => {
      // Merge detected, keeping existing
      const newModels = [...state.models];
      detectedModels.forEach(dm => {
        if (!newModels.find(m => m.id === dm.id)) {
          newModels.push(dm);
        }
      });
      return { models: newModels, isDetecting: false };
    });
  },

  addModel: (model) => set(state => ({ 
    models: [...state.models, { ...model, id: model.id || `custom-${Date.now()}` }] 
  })),

  removeModel: (id) => set(state => ({ models: state.models.filter(m => m.id !== id) })),
  
  updateModel: (id, patch) => set(state => ({
    models: state.models.map(m => m.id === id ? { ...m, ...patch } : m)
  })),

  testConnection: async (model) => {
    const start = Date.now();
    try {
      let url = '';
      let headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (model.provider === 'OpenRouter') {
        url = 'https://openrouter.ai/api/v1/chat/completions';
        const key = useSettingsStore.getState().openrouterKey;
        if (!key) throw new Error('API Key missing');
        headers['Authorization'] = `Bearer ${key}`;
      } else if (model.provider === 'Ollama') {
        url = 'http://localhost:11434/api/chat';
      } else {
        url = model.endpoint || '';
        headers = { ...headers, ...model.headers };
      }

      if (!url) throw new Error('No endpoint configured');

      const body = model.provider === 'Ollama' 
        ? JSON.stringify({ model: model.name, messages: [{ role: 'user', content: 'ping' }], stream: false })
        : JSON.stringify({ model: model.name, messages: [{ role: 'user', content: 'ping' }], max_tokens: 5 });

      const resp = await fetch(url, { method: 'POST', headers, body });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${txt}`);
      }

      return { ok: true, latencyMs: Date.now() - start };
    } catch (e: any) {
      return { ok: false, latencyMs: Date.now() - start, error: e.message };
    }
  },

  getBestModelForTask: (tag) => {
    const { models } = get();
    const available = models.filter(m => m.tags.includes(tag) || m.tags.includes('general'));
    if (available.length === 0) return null;

    available.sort((a, b) => {
      const eloA = hardcodedBenchmarks[a.id]?.arenaElo || 0;
      const eloB = hardcodedBenchmarks[b.id]?.arenaElo || 0;
      return eloB - eloA;
    });

    return available[0];
  },

  getAgentModels: () => {
    const locks = useSettingsStore.getState().agentModelLocks;
    // Assuming for now locks refer to specific assigned models stored somewhere, 
    // or if locked, we bypass dynamic selection (not fully specified where manual assignment is stored yet, 
    // we'll assume there's a way or it just uses getBestModelForTask for now).
    return {
      strategist: get().getBestModelForTask('reasoning'),
      critic: get().getBestModelForTask('analysis'),
      executor: get().getBestModelForTask('efficiency')
    };
  }
}));
