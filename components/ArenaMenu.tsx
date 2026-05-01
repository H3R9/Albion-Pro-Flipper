import React from 'react';
import { motion } from 'motion/react';
import { Swords, TentTree, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface ArenaMenuProps {
  onSelectModule: (module: 'operations' | 'island' | 'settings') => void;
}

export function ArenaMenu({ onSelectModule }: ArenaMenuProps) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--mw-bg)] relative flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--mw-gold-primary)]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <div className="z-10 w-full max-w-6xl px-4 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-[0.2em] text-[var(--mw-text-main)] drop-shadow-2xl">
            Aureus <span className="text-[var(--mw-gold-bright)]">Arena</span>
          </h1>
          <p className="mt-4 text-[var(--mw-text-muted)] tracking-widest uppercase text-sm md:text-base">
            Selecione seu módulo de operações
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
          {/* Módulo de Operações */}
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectModule('operations')}
            className="relative group overflow-hidden rounded-2xl border border-[var(--mw-border)] bg-[var(--mw-card)] p-8 text-left transition-all hover:border-[var(--mw-gold-primary)] hover:shadow-[0_0_40px_-10px_rgba(201,168,76,0.3)] aspect-[2/1] flex flex-col justify-end"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--mw-card)] via-[var(--mw-card)]/80 to-transparent z-10" />
            
            {/* Abstract Background - Optional: an image could go here */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--mw-gold-dark)]/10 rounded-full blur-3xl group-hover:bg-[var(--mw-gold-primary)]/20 transition-colors" />
            
            <div className="relative z-20">
              <div className="w-14 h-14 rounded-xl bg-[var(--mw-gold-primary)]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Swords size={32} className="text-[var(--mw-gold-bright)]" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-[var(--mw-text-main)] mb-2">
                Operações de Mercado
              </h2>
              <p className="text-[var(--mw-text-muted)] text-sm">
                Flipping BM, Arbitragem, Runas e Calculadoras.
              </p>
            </div>
          </motion.button>

          {/* A Ilha (Novo) */}
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectModule('island')}
            className="relative group overflow-hidden rounded-2xl border border-emerald-900/50 bg-[var(--mw-card)] p-8 text-left transition-all hover:border-emerald-500 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] aspect-[2/1] flex flex-col justify-end"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--mw-card)] via-[var(--mw-card)]/80 to-transparent z-10" />

            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-900/20 rounded-full blur-3xl group-hover:bg-emerald-600/20 transition-colors" />

            <div className="relative z-20">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TentTree size={32} className="text-emerald-400" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-black uppercase tracking-wider text-[var(--mw-text-main)]">
                  A Ilha
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Novo
                </span>
              </div>
              <p className="text-[var(--mw-text-muted)] text-sm">
                Gestão de trabalhadores, plantações e crafting de ilha.
              </p>
            </div>
          </motion.button>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-6 mt-12"
        >
          <button 
            onClick={() => onSelectModule('settings')}
            className="flex items-center gap-2 text-[var(--mw-text-muted)] hover:text-[var(--mw-text-main)] transition-colors px-4 py-2"
          >
            <Settings size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">Configurações</span>
          </button>
          
          <div className="w-px h-4 bg-[var(--mw-border)]" />
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-rose-500/70 hover:text-rose-400 transition-colors px-4 py-2"
          >
            <LogOut size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">Sair</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
