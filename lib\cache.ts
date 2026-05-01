export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const memoryCache = new Map<string, string>();

export function getCached<T>(key: string): T | null {
  try {
    let item = localStorage.getItem(key);
    
    if (!item) {
      item = memoryCache.get(key) || null;
    }
    
    if (!item) return null;
    
    const entry: CacheEntry<T> = JSON.parse(item);
    const now = Date.now();
    
    if (now - entry.timestamp > entry.ttlMs) {
      try { localStorage.removeItem(key); } catch(e) {}
      memoryCache.delete(key);
      return null;
    }
    
    return entry.data;
  } catch (e) {
    console.warn('Error reading from cache', e);
    return null;
  }
}

export function setCached<T>(key: string, data: T, ttlMs: number): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttlMs,
    };
    
    const serialized = JSON.stringify(entry);
    
    try {
      localStorage.setItem(key, serialized);
    } catch (e: any) {
      if (
        e instanceof DOMException &&
        (e.code === 22 ||
         e.code === 1014 ||
         e.name === 'QuotaExceededError' ||
         e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
      ) {
        // Fallback to memory cache
        memoryCache.set(key, serialized);
        
        // Optionally, clear some old stuff from memory cache if it gets too large
        if (memoryCache.size > 2000) {
            const firstKey = memoryCache.keys().next().value;
            if (firstKey) memoryCache.delete(firstKey);
        }
      } else {
        console.warn('Error writing to cache', e);
      }
    }
  } catch (e) {
    console.warn('Error serializing cache entry', e);
  }
}

export function invalidateCache(pattern?: string): void {
  try {
    if (!pattern) return;
    const regex = new RegExp(pattern);
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
       const key = localStorage.key(i);
       if (key && regex.test(key)) {
         keysToRemove.push(key);
       }
    }
    keysToRemove.forEach(key => {
        try { localStorage.removeItem(key); } catch(e){}
    });
    
    // Also clear from memory cache
    for (const key of memoryCache.keys()) {
        if (regex.test(key)) {
            memoryCache.delete(key);
        }
    }
  } catch(e) {
    console.warn('Error invalidating cache', e);
  }
}
