'use client';

import React from 'react';
import { LayoutDashboard, Crosshair, TentTree, Settings, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  appMode: 'hub' | 'operations' | 'island' | 'settings' | 'refining';
  currentTab: string;
  onNavigate: (mode: 'hub' | 'operations' | 'island' | 'settings' | 'refining', tab?: string) => void;
}

export function MobileBottomNav({ appMode, currentTab, onNavigate }: MobileBottomNavProps) {
  const items = [
    { id: 'hub', label: 'Arena', icon: <Home size={20} />, mode: 'hub' as const },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, mode: 'operations' as const },
    { id: 'enchant', label: 'Scanner', icon: <Crosshair size={20} />, mode: 'operations' as const },
    { id: 'island', label: 'Ilha', icon: <TentTree size={20} />, mode: 'island' as const },
    { id: 'settings', label: 'Config', icon: <Settings size={20} />, mode: 'settings' as const },
  ];

  const getIsActive = (item: typeof items[0]) => {
    if (item.id === 'hub' && appMode === 'hub') return true;
    if (item.id === 'island' && appMode === 'island') return true;
    if (item.id === 'settings' && appMode === 'settings') return true;
    if (item.mode === 'operations' && appMode === 'operations' && currentTab === item.id) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--mw-card)]/95 backdrop-blur-lg border-t border-[var(--mw-border)] safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map(item => {
          const active = getIsActive(item);
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'hub') {
                  onNavigate('hub');
                } else if (item.id === 'island') {
                  onNavigate('island');
                } else if (item.id === 'settings') {
                  onNavigate('settings');
                } else {
                  onNavigate('operations', item.id);
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-all",
                active 
                  ? "text-[var(--mw-gold-bright)]" 
                  : "text-[var(--mw-text-muted)]"
              )}
            >
              <div className={cn(
                "transition-transform",
                active && "scale-110"
              )}>
                {item.icon}
              </div>
              <span className={cn(
                "text-sm font-bold uppercase tracking-wider",
                active && "text-[var(--mw-gold-bright)]"
              )}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-1 w-6 h-0.5 rounded-full bg-[var(--mw-gold-bright)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
