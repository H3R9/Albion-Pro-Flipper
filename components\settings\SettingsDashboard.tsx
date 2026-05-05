import React, { useState } from 'react';
import { Settings, FileText, BellRing, Save, ChevronRight, ShieldAlert, BookOpen, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CITIES } from '@/lib/albion/utils';
import Markdown from 'react-markdown';
import { SYSTEM_REPORT_MD } from '@/lib/docs/system-report';
import { motion, AnimatePresence } from 'motion/react';
import type { AlertSettings } from '@/lib/albion/types';

interface SettingsDashboardProps {
  alertSettings: AlertSettings;
  setAlertSettings: (settings: AlertSettings) => void;
}

export function SettingsDashboard({ alertSettings, setAlertSettings }: SettingsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'alerts' | 'report'>('alerts');

  const toggleCity = (city: string) => {
    if (city === 'all') {
       if (alertSettings.cities.includes('all')) {
         setAlertSettings({ ...alertSettings, cities: [] });
       } else {
         setAlertSettings({ ...alertSettings, cities: ['all'] });
       }
       return;
    }

    const current = alertSettings.cities.filter((c: string) => c !== 'all');
    if (current.includes(city)) {
       setAlertSettings({ ...alertSettings, cities: current.filter((c: string) => c !== city) });
    } else {
       setAlertSettings({ ...alertSettings, cities: [...current, city] });
    }
  };

  return (
    <div className="flex h-full flex-col font-sans">
      <div className="flex items-center gap-8 mb-8 border-b-2 border-white/5 pb-4 relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('alerts')}
          className={cn(
            "flex items-center gap-2 pb-4 -mb-[18px] text-sm font-bold tracking-widest uppercase transition-all duration-300",
            activeTab === 'alerts' ? "text-[var(--mw-gold-primary)] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" : "text-[var(--mw-text-muted)] hover:text-white"
          )}
        >
          <BellRing size={18} /> Alertas de Mercado
          {activeTab === 'alerts' && (
            <motion.div layoutId="settings-tab" className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-[var(--mw-gold-primary)] shadow-[0_0_10px_#f9bc00]" />
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('report')}
          className={cn(
            "flex items-center gap-2 pb-4 -mb-[18px] text-sm font-bold tracking-widest uppercase transition-all duration-300 relative",
            activeTab === 'report' ? "text-[var(--mw-gold-primary)] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" : "text-[var(--mw-text-muted)] hover:text-white"
          )}
        >
          <FileText size={18} /> Codex (Relatório)
          {activeTab === 'report' && (
            <motion.div layoutId="settings-tab" className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-[var(--mw-gold-primary)] shadow-[0_0_10px_#f9bc00]" />
          )}
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide pb-8">
        <AnimatePresence mode="wait">
          {activeTab === 'alerts' && (
            <motion.div 
              key="alerts"
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl"
            >
              <div className="bg-[#0f0f11] backdrop-blur-md border border-white/5 rounded-lg shadow-2xl p-8 space-y-10 relative overflow-hidden ring-1 ring-white/5">
                {/* Decorative game corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--mw-gold-primary)]/20 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--mw-gold-primary)]/20 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--mw-gold-primary)]/20 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--mw-gold-primary)]/20 rounded-br-lg" />

                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-[var(--mw-green)]/5 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <h3 className="text-white font-black tracking-widest uppercase flex items-center gap-3 text-lg">
                      <ShieldAlert size={22} className="text-[var(--mw-gold-primary)] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]" /> 
                      Parâmetros Automáticos (HUD)
                    </h3>
                    <div className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold uppercase tracking-widest rounded-sm">
                      Scanner Ativo
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-6 rounded-lg border border-white/5">
                    <div className="space-y-4 group">
                      <label className="block text-xs font-black text-amber-500/80 uppercase tracking-widest">Gatilho de Ouro (Prata Base)</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-amber-500/50 font-mono pointer-events-none transition-colors group-focus-within:text-amber-400 font-bold">💰</div>
                        <input 
                          type="number"
                          min="0"
                          step="10000"
                          className="w-full bg-[#151518] border border-white/10 rounded-md h-14 pl-12 pr-4 text-white outline-none focus:border-[var(--mw-gold-primary)] focus:bg-[#1a1a1e] focus:shadow-[0_0_15px_rgba(255,215,0,0.05)] transition-all font-mono text-lg shadow-inner placeholder-white/20"
                          value={alertSettings?.minProfit || 0}
                          onChange={e => setAlertSettings({ ...alertSettings, minProfit: Number(e.target.value) || 0 })}
                        />
                      </div>
                      <p className="text-xs text-[var(--mw-text-muted)] tracking-wide leading-relaxed">
                        Filtro de Ruído: Ignorar trades com lucro absoluto. Ex: <span className="text-white">100.000</span>
                      </p>
                    </div>

                    <div className="space-y-4 group">
                      <label className="block text-xs font-black text-amber-500/80 uppercase tracking-widest">Margem de Esforço (%)</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-amber-500/50 font-mono pointer-events-none transition-colors group-focus-within:text-amber-400 font-bold">%</div>
                        <input 
                          type="number"
                          min="0"
                          max="500"
                          className="w-full bg-[#151518] border border-white/10 rounded-md h-14 pl-12 pr-4 text-white outline-none focus:border-[var(--mw-gold-primary)] focus:bg-[#1a1a1e] focus:shadow-[0_0_15px_rgba(255,215,0,0.05)] transition-all font-mono text-lg shadow-inner placeholder-white/20"
                          value={alertSettings?.minMargin || 0}
                          onChange={e => setAlertSettings({ ...alertSettings, minMargin: Number(e.target.value) || 0 })}
                        />
                      </div>
                      <p className="text-xs text-[var(--mw-text-muted)] tracking-wide leading-relaxed">
                        Filtro de Desastre: Exija retorno base (<span className="text-[var(--mw-gold-primary)]">Recomendado: 100%</span>).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative bg-black/20 p-6 rounded-lg border border-white/5">
                  <h3 className="text-white font-black tracking-widest uppercase mb-6 flex items-center gap-3 text-sm">
                    <MapPin size={18} className="text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                    Zonas de Transporte (Hub de Incursão)
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleCity('all')}
                      className={cn("px-6 py-3 rounded-md text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2", 
                        alertSettings?.cities?.includes('all') 
                        ? "bg-[var(--mw-gold-primary)]/15 text-[var(--mw-gold-primary)] border border-[var(--mw-gold-primary)] shadow-[0_0_20px_rgba(255,215,0,0.15)] ring-1 ring-[var(--mw-gold-primary)]/50" 
                        : "bg-[#151518] text-[var(--mw-text-muted)] border border-white/10 hover:border-white/30 hover:bg-[#1a1a1e]"
                      )}
                    >
                      <span className={cn(alertSettings?.cities?.includes('all') && "drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]")}>GLOBAL (TODAS AS CIDADES)</span>
                    </motion.button>
                    
                    {CITIES.filter(c => c !== 'Caerleon').map(city => {
                      const isActive = alertSettings?.cities?.includes(city) && !alertSettings?.cities?.includes('all');
                      return (
                        <motion.button
                          key={city}
                          whileHover={!alertSettings?.cities?.includes('all') ? { scale: 1.05 } : {}}
                          whileTap={!alertSettings?.cities?.includes('all') ? { scale: 0.95 } : {}}
                          onClick={() => toggleCity(city)}
                          disabled={alertSettings?.cities?.includes('all')}
                          className={cn("px-4 py-3 rounded-md text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center min-w-[100px] disabled:opacity-20 disabled:cursor-not-allowed", 
                            isActive 
                            ? "bg-sky-500/15 text-sky-400 border border-sky-500/50 shadow-[0_0_15px_rgba(56,189,248,0.2)]" 
                            : "bg-[#151518] text-[var(--mw-text-main)] border border-white/10 hover:border-white/30 hover:bg-[#1a1a1e]"
                          )}
                        >
                          <span className={cn(isActive && "drop-shadow-[0_0_5px_rgba(56,189,248,0.8)]")}>{city}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div 
              key="report"
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl space-y-6"
            >
              <div className="p-10 rounded-sm bg-[#0d0f12]/90 backdrop-blur-md border border-[var(--mw-gold-primary)]/10 shadow-2xl relative overflow-hidden">
                 
                 {/* Tech game background flourishes */}
                 <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--mw-gold-primary)]/5 blur-[120px] pointer-events-none rounded-full" />
                 <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/5 blur-[100px] pointer-events-none rounded-full" />

                 <div className="mb-10 pb-6 border-b border-white/5 flex items-start gap-4">
                    <BookOpen size={48} className="text-[var(--mw-gold-primary)] opacity-80" />
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">Codex do Sistema</h2>
                      <p className="text-[var(--mw-text-muted)] mt-1 font-mono text-sm tracking-wider">AUREUS ANALYTICS • BUILD 1.0.0</p>
                    </div>
                 </div>

                 <div className="prose prose-invert prose-slate max-w-none 
                   prose-h1:hidden
                   prose-h2:text-[var(--mw-gold-primary)] prose-h2:text-2xl prose-h2:font-black prose-h2:tracking-widest prose-h2:opacity-90 prose-h2:uppercase prose-h2:mt-16 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-4 prose-h2:flex prose-h2:items-center prose-h2:gap-4
                   prose-h3:text-sky-300 prose-h3:text-lg prose-h3:font-bold prose-h3:tracking-widest prose-h3:uppercase prose-h3:mt-10
                   prose-p:text-[var(--mw-text-main)] prose-p:leading-loose prose-p:text-[16px] prose-p:font-medium text-justify
                   prose-ul:text-[var(--mw-text-main)] prose-ul:mb-8 prose-li:my-3 prose-li:text-[15px] prose-li:leading-relaxed marker:text-[var(--mw-gold-primary)]
                   prose-strong:text-amber-300 prose-strong:font-black prose-strong:drop-shadow-sm
                   prose-a:text-[var(--mw-gold-primary)] hover:prose-a:text-[var(--mw-gold-bright)] hover:prose-a:drop-shadow-[0_0_5px_rgba(255,215,0,0.8)] prose-a:transition-all prose-a:underline-offset-4
                   prose-hr:border-white/10 prose-hr:my-12
                   prose-blockquote:border-l-4 prose-blockquote:border-l-[var(--mw-gold-primary)] prose-blockquote:bg-gradient-to-r prose-blockquote:from-[var(--mw-gold-primary)]/10 prose-blockquote:to-transparent prose-blockquote:px-8 prose-blockquote:py-4 prose-blockquote:text-amber-100/90 prose-blockquote:italic prose-blockquote:rounded-r-xl prose-blockquote:text-xl prose-blockquote:font-serif prose-blockquote:my-10 prose-blockquote:shadow-sm
                   prose-code:text-[var(--mw-gold-bright)] prose-code:bg-amber-900/40 prose-code:px-2.5 prose-code:py-1 prose-code:rounded-md prose-code:font-mono prose-code:text-[14px] prose-code:border prose-code:border-amber-500/30">
                   <Markdown>{SYSTEM_REPORT_MD}</Markdown>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
