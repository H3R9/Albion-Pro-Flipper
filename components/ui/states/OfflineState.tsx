'use client';

import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineState() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    if (typeof navigator !== 'undefined') {
      setTimeout(() => setIsOffline(!navigator.onLine), 0);
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-xl flex items-center gap-3 z-50">
      <WifiOff size={24} />
      <div>
        <h4 className="font-bold text-sm">Sem conexão</h4>
        <p className="text-sm text-red-200">Verifique sua internet.</p>
      </div>
    </div>
  );
}
