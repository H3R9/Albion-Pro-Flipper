"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Box, Bell, BellOff, LogIn, LogOut, RefreshCw, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface HeaderProps {
  alertsEnabled: boolean;
  toggleAlerts: () => void;
  settings: { maxAge: number; minProfit: number; minMargin: number; };
  autoRefreshInterval?: number | null;
  setAutoRefreshInterval?: (interval: number | null) => void;
  nextRefreshTime?: number | null;
  onOpenAlertsModal?: () => void;
  onMenuToggle?: () => void;
}

export function Header({ alertsEnabled, toggleAlerts, settings, autoRefreshInterval, setAutoRefreshInterval, nextRefreshTime, onOpenAlertsModal, onMenuToggle }: HeaderProps) {
  const { user, profile, loading, signIn, signOut } = useAuth();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!nextRefreshTime) {
      setTimeout(() => setTimeLeft(0), 0);
      return;
    }
    const interval = setInterval(() => {
      const remaining = Math.max(0, nextRefreshTime - Date.now());
      setTimeLeft(remaining);
    }, 100);
    return () => clearInterval(interval);
  }, [nextRefreshTime]);

  const progressPct = autoRefreshInterval && autoRefreshInterval > 0 && timeLeft > 0
     ? (timeLeft / (autoRefreshInterval * 1000)) * 100
     : 0;

  return (
    <header className="bg-[var(--mw-bg)]/95 backdrop-blur-md sticky top-0 z-40 border-b border-[var(--mw-border)] shadow-sm shrink-0">
      <div className="w-full px-4 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button 
              onClick={onMenuToggle}
              className="md:hidden p-2 -ml-2 text-[var(--mw-text-main)] hover:bg-[var(--mw-card)] rounded-lg transition"
            >
              <Menu size={20} />
            </button>
          )}
          {/* Logo only visible on mobile here, since sidebar handles desktop logo */}
          <div className="md:hidden flex items-center gap-2">
            <h1 className="font-black text-sm uppercase tracking-widest text-[var(--mw-text-main)]">
              Aureus <span className="text-[var(--mw-gold-bright)]">Analytics</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4 text-sm font-mono ml-auto">
          
          {/* Auto Refresh Toggle */}
          {setAutoRefreshInterval && (
            <div className="hidden sm:flex items-center gap-2 bg-[var(--mw-card)] border border-[var(--mw-border)] rounded-md px-2 py-1 shadow-sm">
               <RefreshCw size={14} className={cn("text-slate-400", autoRefreshInterval && "animate-spin text-[var(--mw-gold-bright)]")} />
               <select 
                 className="bg-transparent text-[var(--mw-text-main)] outline-none text-sm cursor-pointer"
                 value={autoRefreshInterval || ''}
                 onChange={e => setAutoRefreshInterval(e.target.value ? Number(e.target.value) : null)}
               >
                  <option value="">Off (Manual)</option>
                  <option value="30">30 seg</option>
                  <option value="60">1 min</option>
                  <option value="120">2 min</option>
                  <option value="300">5 min</option>
               </select>

               {autoRefreshInterval && (
                 <div className="relative w-4 h-4 ml-1 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-700" />
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" 
                        strokeDasharray="62.83" 
                        strokeDashoffset={`${62.83 - (62.83 * progressPct) / 100}`} 
                        className="text-[var(--mw-gold-bright)] transition-all duration-100 linear" />
                    </svg>
                 </div>
               )}
            </div>
          )}

          <div className="flex items-center">
            <button
              onClick={toggleAlerts}
              className={cn(
                "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-l-md border transition",
                alertsEnabled 
                  ? "bg-[var(--mw-gold-dark)]/20 border-[var(--mw-gold-bright)]/30 text-[var(--mw-gold-bright)] hover:bg-[var(--mw-gold-dark)]/30" 
                  : "bg-[var(--mw-card)] border-[var(--mw-border)] text-[var(--mw-text-muted)] hover:text-white hover:bg-[var(--mw-card-hover)]"
              )}
            >
              {alertsEnabled ? (
                <><Bell size={14} className="animate-pulse" /> Alertas On</>
              ) : (
                <><BellOff size={14} /> Alertas Off</>
              )}
            </button>
            {onOpenAlertsModal && (
              <button 
                onClick={onOpenAlertsModal}
                className="hidden sm:flex items-center justify-center px-2 py-1.5 bg-[var(--mw-card)] border-y border-r border-[var(--mw-border)] rounded-r-md text-[var(--mw-text-muted)] hover:text-white hover:bg-[var(--mw-card-hover)] transition"
                title="Configurar Alertas"
              >
                <div style={{ width: 14, height: 14 }} className="flex items-center justify-center">⚙️</div>
              </button>
            )}
          </div>
          
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[var(--mw-green)]/10 border border-[var(--mw-green)]/20 rounded text-[var(--mw-green)] font-bold uppercase tracking-wider text-sm">
            <span className="w-2 h-2 bg-[var(--mw-green)] rounded-full animate-pulse shadow-[0_0_8px_rgba(76,175,125,0.6)]"></span>
            West API
          </div>

          <div className="w-px h-6 bg-[var(--mw-border)] hidden sm:block"></div>

          {!loading && (
             user ? (
               <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[var(--mw-text-main)] font-bold leading-none">{user.displayName}</span>
                    {profile && (
                       <span className="text-[var(--mw-gold-bright)] text-sm">
                          {profile.silver.toLocaleString('pt-BR')} Prata
                       </span>
                    )}
                  </div>
                  <button onClick={signOut} className="p-2 bg-[var(--mw-card)] border border-[var(--mw-border)] rounded-md text-[var(--mw-text-muted)] hover:text-[var(--mw-red)] transition" title="Sair">
                    <LogOut size={16} />
                  </button>
               </div>
             ) : (
               <button 
                 onClick={signIn}
                 className="flex items-center gap-2 px-4 py-1.5 bg-[var(--mw-gold-primary)] hover:bg-[var(--mw-gold-bright)] text-black rounded-md font-bold transition shadow-md"
               >
                 <LogIn size={14} /> Login Google
               </button>
             )
          )}
        </div>
      </div>
    </header>
  );
}
