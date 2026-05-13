import { create } from 'zustand';
import { useSettingsStore } from './settingsStore';

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

const inferTagsFromOllamaModel = (name: string, family?: string): string[] => {
  const n = name.toLowerCase();
  const f = (family ?? '').toLowerCase();

  // Embedding-only models — exclude from chat
  if (n.includes('embed') || f.includes('bert') || n.includes('nomic')) {
    return ['embedding'];
  }

  // Document / OCR-friendly multimodal models
  if (
    n.includes('granite-doc') ||
    n.includes('docling') ||
    n.includes('chandra') ||
    n.includes('olmocr')
  ) {
    return ['vision', 'analysis', 'general'];
  }

  // Multimodal vision models that can also do analysis
  if (
    f.includes('qwen25vl') ||
    f.includes('qwenvl') ||
    f.includes('qwen3vl') ||
    n.includes('qwen2.5vl') ||
    n.includes('qwen2.5-vl') ||
    n.includes('qwen3-vl') ||
    n.includes('qwenvl') ||
    n.includes('moondream') ||
    n.includes('minicpm-v') ||
    n.includes('minicpm-v:')
  ) {
    return ['vision', 'analysis', 'general'];
  }

  // Vision-only models (llama-vision, mllama, etc.)
  if (
    f.includes('mllama') ||
    f.includes('llava') ||
    n.includes('vision') ||
    n.includes('llava') ||
    n.includes('bakllava') ||
    n.includes('vl:') ||
    n.includes('-vl:') ||
    n.includes('internvl') ||
    n.includes('pixtral')
  ) {
    return ['vision', 'general'];
  }

  // Strong reasoning models
  if (
    f.includes('deepseek') ||
    n.includes('deepseek-r1') ||
    n.includes('reason') ||
    n.includes('qwen2.5:') ||
    f === 'qwen2'
  ) {
    return ['reasoning', 'general'];
  }

  // Smaller/faster models — good for execution
  if (
    n.includes('3b') ||
    n.includes('1b') ||
    n.includes('phi') ||
    n.includes('gemma') ||
    n.includes('mistral')
  ) {
    return ['efficiency', 'general'];
  }

  return ['general'];
};

interface ModelStore {
  models: RegisteredModel[];
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
  isDetecting: false,

  autoDetect: async () => {
    set({ isDetecting: true });
    
    // Refresh dynamic models (Ollama) while keeping user-added ones.
    const customModels = get().models.filter(m => m.source !== 'auto-detected');
    const detectedModels: RegisteredModel[] = [];

    // Detect Ollama
    try {
      const resp = await fetch('http://localhost:11434/api/tags');
      if (resp.ok) {
        const data = await resp.json();
        data.models?.forEach((m: any) => {
          const name = String(m?.name ?? '').trim();
          if (!name) return;
          const tags = inferTagsFromOllamaModel(name, m?.details?.family);
          if (tags.includes('embedding')) return;
          detectedModels.push({
            id: `ollama-${name}`,
            name,
            provider: 'Ollama',
            tags,
            contextLength: typeof m?.context_length === 'number' ? m.context_length : null,
            costPerToken: 0,
            source: 'auto-detected'
          });
        });
      }
    } catch(e) {
      console.warn('Ollama not found or not running');
    }

    set({ 
      models: [...customModels, ...detectedModels], 
      isDetecting: false 
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
      const aExact = a.tags.includes(tag) ? 1 : 0;
      const bExact = b.tags.includes(tag) ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;
      return a.name.localeCompare(b.name);
    });

    return available[0];
  },

  getAgentModels: () => {
    const { models } = get();
    if (models.length === 0) {
      return { strategist: null, critic: null, executor: null };
    }

    const sorted = [...models].sort((a, b) => a.name.localeCompare(b.name));
    const pickDistinct = (preferredTag: string, used: Set<string>) => {
      const preferred = sorted.find(
        (m) => !used.has(m.id) && (m.tags.includes(preferredTag) || m.tags.includes('general'))
      );
      if (preferred) {
        used.add(preferred.id);
        return preferred;
      }

      const anyUnused = sorted.find((m) => !used.has(m.id));
      if (anyUnused) {
        used.add(anyUnused.id);
        return anyUnused;
      }

      // If we have fewer than 3 models, allow reuse.
      return sorted[0];
    };

    const used = new Set<string>();
    return {
      strategist: pickDistinct('reasoning', used),
      critic: pickDistinct('analysis', used),
      executor: pickDistinct('efficiency', used)
    };
  }
}));
