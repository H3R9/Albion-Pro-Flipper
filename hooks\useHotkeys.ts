import { useEffect } from 'react';

export function useHotkeys(key: string, callback: (e?: KeyboardEvent) => void, ctrlKey = false) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in an input, unless it's Escape
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName)) {
        if (event.key !== 'Escape') {
            return;
        }
      }

      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      if (ctrlKey && !isCtrlOrCmd) return;
      if (!ctrlKey && isCtrlOrCmd && event.key !== 'Escape') return; // allow escape without ctrl
      
      if (event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault();
        callback(event);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ctrlKey]);
}
