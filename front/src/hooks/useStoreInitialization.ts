import { useEffect } from 'react';
import i18n from '../i18n';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

export const useStoreInitialization = () => {
  // Initialize theme from UI store
  const theme = useUIStore(state => state.theme);
  const language = useUIStore(state => state.language as string);
  const setLanguage = useUIStore(state => state.setLanguage);
  
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark';
    isDark ? root.classList.add('dark') : root.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    if (language === 'hy') {
      setLanguage('am');
      return;
    }

    if (i18n.resolvedLanguage !== language) {
      void i18n.changeLanguage(language);
    }
  }, [language, setLanguage]);

  // Initialize auth data if token exists
  const token = useAuthStore(state => state.token);
  const fetchUserData = useAuthStore(state => state.fetchUserData);
  
  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token, fetchUserData]);

  // Handle fullscreen changes
  const setFullscreen = useUIStore(state => state.setFullscreen);
  
  useEffect(() => {
    const handleFsChange = () => {
      const fullscreen = !!document.fullscreenElement;
      setFullscreen(fullscreen);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [setFullscreen]);
};
