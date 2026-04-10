import { create } from 'zustand';

export interface SettingsStore {
  openrouterKey: string;
  webhookUrl: string;
  useMockFallback: boolean;
  debateRounds: number;
  roundTimeout: number;
  showResearchBanner: boolean;
  agentModelLocks: Record<string, boolean>;
  autoLayout: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  deductible: number;
  setKey: (key: keyof Omit<SettingsStore, 'setKey' | 'persist' | 'hydrate'>, value: any) => void;
  persist: () => void;
  hydrate: () => void;
  testWebhook: () => Promise<boolean>;
}

const defaultSettings = {
  openrouterKey: '',
  webhookUrl: '',
  useMockFallback: true,
  debateRounds: 3,
  roundTimeout: 60,
  showResearchBanner: true,
  agentModelLocks: {},
  autoLayout: true,
  animationSpeed: 'normal' as const,
  deductible: 3000,
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...defaultSettings,
  
  setKey: (key, value) => {
    set({ [key]: value });
    get().persist();
  },

  persist: () => {
    const state = get();
    // Don't save functions
    const { setKey, persist, hydrate, testWebhook, ...dataToSave } = state;
    
    // openrouterKey should be stored separately as per spec
    if (dataToSave.openrouterKey) {
      localStorage.setItem('claimmind_openrouter_key', dataToSave.openrouterKey);
    } else {
      localStorage.removeItem('claimmind_openrouter_key');
    }
    
    // Rest goes to settings
    const { openrouterKey, ...settings } = dataToSave;
    localStorage.setItem('claimmind_settings', JSON.stringify(settings));
  },

  hydrate: () => {
    try {
      const storedKey = localStorage.getItem('claimmind_openrouter_key') || '';
      const storedSettings = localStorage.getItem('claimmind_settings');
      let parsed = {};
      if (storedSettings) {
        parsed = JSON.parse(storedSettings);
      }
      set({ ...defaultSettings, ...parsed, openrouterKey: storedKey });
    } catch (err) {
      console.error('Failed to hydrate settings', err);
    }
  },

  testWebhook: async () => {
    const url = get().webhookUrl;
    if (!url) return false;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  }
}));
