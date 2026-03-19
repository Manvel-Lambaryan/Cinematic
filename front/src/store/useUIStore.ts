import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  language: 'am' | 'en' | 'ru';
  isSettingsOpen: boolean;
  isFullscreen: boolean;
  sidebarOpen: boolean;
}

interface UIActions {
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setLanguage: (language: 'am' | 'en' | 'ru') => void;
  setSettingsOpen: (open: boolean) => void;
  toggleSettings: () => void;
  setFullscreen: (fullscreen: boolean) => void;
  toggleFullscreen: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'dark',
      language: 'en',
      isSettingsOpen: false,
      isFullscreen: false,
      sidebarOpen: false,

      // Actions
      setTheme: (theme: 'light' | 'dark') => set({ theme }),
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
      },

      setLanguage: (language: 'am' | 'en' | 'ru') => set({ language }),

      setSettingsOpen: (open: boolean) => set({ isSettingsOpen: open }),

      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

      setFullscreen: (fullscreen: boolean) => set({ isFullscreen: fullscreen }),

      toggleFullscreen: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen()
            .then(() => set({ isFullscreen: true }))
            .catch(() => set({ isFullscreen: false }));
        } else {
          document.exitFullscreen();
          set({ isFullscreen: false });
        }
      },

      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);
