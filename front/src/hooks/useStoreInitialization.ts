import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

export const useStoreInitialization = () => {
  // Initialize theme from UI store
  const theme = useUIStore(state => state.theme);
  
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark';
    isDark ? root.classList.add('dark') : root.classList.remove('dark');
  }, [theme]);

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
