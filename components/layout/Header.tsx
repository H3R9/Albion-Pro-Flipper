"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Box, Bell, BellOff, LogIn, LogOut, RefreshCw } from "lucide-react";
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
}

export function Header({ alertsEnabled, toggleAlerts, settings, autoRefreshInterval, setAutoRefreshInterval, nextRefreshTime, onOpenAlertsModal }: HeaderProps) {
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
    <header className="bg-[var(--mw-bg)]/95 backdrop-blur-md sticky top-0 z-50 shadow-md border-b border-[var(--mw-gold-primary)]/40" style={{ backgroundImage: 'linear-gradient(180deg, #1A1208 0%, #0D0D0F 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Thin bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--mw-gold-primary)] to-transparent opacity-50"></div>
        
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--mw-gold-primary)] drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]">
              <path d="M14.5 9.5 21 3m-4 0h4v4m-12 5 2-2M3 21l8-8M7 13l4 4"/>
              <circle cx="9" cy="8" r="1.5"/>
              <circle cx="15" cy="15" r="1.5"/>
              <circle cx="11" cy="5" r="1.5"/>
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight uppercase tracking-widest text-[var(--mw-text-main)] drop-shadow-sm flex items-center gap-1.5">
              Albion <span className="text-[var(--mw-gold-primary)]">Pro Flipper</span>
            </h1>
            <span className="text-[10px] text-[var(--mw-gold-dark)] font-mono tracking-wider">MERCADO NEGRO & ARBITRAGEM</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-mono">
          
          {/* Auto Refresh Toggle */}
          {setAutoRefreshInterval && (
            <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-md px-2 py-1 shadow-sm">
               <RefreshCw size={14} className={cn("text-slate-400", autoRefreshInterval && "animate-spin text-amber-500")} />
               <select 
                 className="bg-transparent text-slate-300 outline-none text-xs cursor-pointer"
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
                        className="text-amber-500 transition-all duration-100 linear" />
                    </svg>
                 </div>
               )}
            </div>
          )}

          <div className="flex items-center">
            <button
              onClick={toggleAlerts}
              className={cn(
                "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-l-md border shadow-sm transition",
                alertsEnabled 
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
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
                className="hidden sm:flex items-center justify-center px-2 py-1.5 bg-slate-900 border-y border-r border-slate-800 rounded-r-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                title="Configurar Alertas"
              >
                <div style={{ width: 14, height: 14 }} className="flex items-center justify-center">⚙️</div>
              </button>
            )}
          </div>
          
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded shadow-md text-green-400 font-bold uppercase tracking-wider text-[10px]">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            API West Conectada
          </div>

          <div className="w-px h-6 bg-slate-800 hidden sm:block"></div>

          {!loading && (
             user ? (
               <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-slate-200 font-bold leading-none">{user.displayName}</span>
                    {profile && (
                       <span className="text-amber-400 text-[10px]">
                          {profile.silver.toLocaleString('pt-BR')} Prata
                       </span>
                    )}
                  </div>
                  <button onClick={signOut} className="p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-400 hover:text-red-400 transition" title="Sair">
                    <LogOut size={16} />
                  </button>
               </div>
             ) : (
               <button 
                 onClick={signIn}
                 className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold transition shadow-md"
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
