import { useEffect } from 'react';

/**
 * Hook to reload data when page becomes visible/focused
 * Useful for keeping data fresh when switching between tabs
 */
export const usePageFocus = (callback: () => void, dependencies: any[] = []) => {
  useEffect(() => {
    // Call immediately on mount
    callback();

    // Reload when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📍 Page focused - reloading data');
        callback();
      }
    };

    // Reload when window gains focus
    const handleFocus = () => {
      console.log('📍 Window focused - reloading data');
      callback();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, dependencies);
};
