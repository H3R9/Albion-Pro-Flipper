import React from 'react';
import { Box, Home, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScanTab } from '@/lib/albion/types';

interface SidebarProps {
  appMode: string;
  currentTab: ScanTab | string;
  setCurrentTab: (tab: ScanTab) => void;
  isScanning: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  setAppMode: (mode: 'hub' | 'operations' | 'island' | 'settings') => void;
  navItems: readonly { id: string; label: string; icon: React.ReactNode }[];
}

export function Sidebar({
  appMode, currentTab, setCurrentTab, isScanning,
  isSidebarOpen, setIsSidebarOpen, setAppMode, navItems
}: SidebarProps) {
  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-[var(--mw-card)] border-r border-[var(--mw-border)] transition-transform duration-300 md:translate-x-0 md:static md:shrink-0 flex flex-col",
      isSidebarOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--mw-border)]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[var(--mw-gold-primary)]/10">
            <Box size={24} className="text-[var(--mw-gold-bright)]" />
          </div>
          <h1 className="font-black text-sm uppercase tracking-widest text-[var(--mw-text-main)]">
            Aureus <span className="text-[var(--mw-gold-bright)]">Analytics</span>
          </h1>
        </div>
        <button className="md:hidden text-[var(--mw-text-muted)] hover:text-white" onClick={() => setIsSidebarOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentTab(item.id as ScanTab);
              setIsSidebarOpen(false);
            }}
            disabled={isScanning}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold tracking-wide transition-all",
              currentTab === item.id 
                ? "bg-[var(--mw-gold-primary)]/10 text-[var(--mw-gold-bright)] border border-[var(--mw-gold-primary)]/20 shadow-sm" 
                : "text-[var(--mw-text-muted)] hover:bg-[var(--mw-card-hover)] hover:text-[var(--mw-text-main)] border border-transparent"
            )}
          >
            <div className={cn("transition-colors", currentTab === item.id ? "text-[var(--mw-gold-bright)]" : "text-[var(--mw-text-muted)]")}>{item.icon}</div>
            {item.label}
          </button>
        ))}
      </div>
      
      <div className="p-4 border-t border-[var(--mw-border)]">
         <button 
           onClick={() => setAppMode('hub')}
           className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[var(--mw-bg)] hover:bg-[var(--mw-card-hover)] border border-[var(--mw-border)] text-[var(--mw-text-main)] text-sm font-bold uppercase tracking-wider transition-colors mb-4"
         >
           <Home size={16} />
           Voltar à Arena
         </button>
         <div className="p-4 bg-[var(--mw-bg)] rounded-xl border border-[var(--mw-border)]/50 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--mw-gold-primary)]/10 rounded-full blur-xl"></div>
           <p className="text-sm font-bold text-[var(--mw-gold-dark)] uppercase tracking-widest mb-1">Status do Sistema</p>
           <div className="flex items-center gap-2 text-sm font-mono text-[var(--mw-text-main)]">
             <span className="w-2 h-2 rounded-full bg-[var(--mw-green)] shadow-[0_0_8px_rgba(76,175,125,0.6)] animate-pulse"></span>
             Mercado Ativo
           </div>
         </div>
      </div>
    </aside>
  );
}
