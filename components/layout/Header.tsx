"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Box, Bell, BellOff, LogIn, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  alertsEnabled: boolean;
  toggleAlerts: () => void;
  settings: { maxAge: number; minProfit: number; minMargin: number; };
}

export function Header({ alertsEnabled, toggleAlerts, settings }: HeaderProps) {
  const { user, profile, loading, signIn, signOut } = useAuth();

  return (
    <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-1.5 rounded-lg shadow-lg shadow-amber-500/20">
            <Box className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight uppercase tracking-widest text-slate-100 drop-shadow-sm">
              Albion <span className="text-amber-500">Pro Flipper</span>
            </h1>
            <span className="text-[10px] text-slate-500 font-mono tracking-wider">MERCADO NEGRO & ARBITRAGEM</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-mono">
          <button
            onClick={toggleAlerts}
            className={cn(
              "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border shadow-sm transition",
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
