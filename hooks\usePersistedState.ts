import { useState, useEffect } from 'react';
import { z } from 'zod';

export function usePersistedState<T>(key: string, initialValue: T, schema?: z.ZodType<T>) {
  const [state, setState] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Determine the stored value
    let isCancelled = false;

    try {
      const item = window.localStorage.getItem(key);
      if (item && !isCancelled) {
        const parsed = JSON.parse(item);
        
        setTimeout(() => {
          if (isCancelled) return;
          if (schema) {
            try {
              setState(schema.parse(parsed));
            } catch (e) {
              console.warn(`Validation failed for persisted state key: ${key}`, e);
            }
          } else {
            setState(parsed as T);
          }
        }, 0);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key: ${key}`, error);
    }
    
    // Defer the setMounted to avoid synchronous effect setState
    setTimeout(() => {
      if (!isCancelled) setIsMounted(true);
    }, 0);
    
    return () => {
      isCancelled = true;
    };
  }, [key, schema]);

  useEffect(() => {
    if (isMounted) {
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.warn(`Error setting localStorage key: ${key}`, error);
      }
    }
  }, [key, state, isMounted]);

  return [state, setState] as const;
}
