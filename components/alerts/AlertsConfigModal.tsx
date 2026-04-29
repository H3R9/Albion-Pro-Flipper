import React, { useState } from 'react';
import { Settings, X, Check, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CITIES } from '@/lib/albion/utils';

interface AlertsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertSettings: {
    minProfit: number;
    minMargin: number;
    cities: string[];
  };
  setAlertSettings: (s: any) => void;
}

export function AlertsConfigModal({ isOpen, onClose, alertSettings, setAlertSettings }: AlertsConfigModalProps) {
  if (!isOpen) return null;

  const toggleCity = (city: string) => {
    if (city === 'all') {
       if (alertSettings.cities.includes('all')) {
         setAlertSettings({ ...alertSettings, cities: [] });
       } else {
         setAlertSettings({ ...alertSettings, cities: ['all'] });
       }
       return;
    }

    const current = alertSettings.cities.filter(c => c !== 'all');
    if (current.includes(city)) {
       setAlertSettings({ ...alertSettings, cities: current.filter(c => c !== city) });
    } else {
       setAlertSettings({ ...alertSettings, cities: [...current, city] });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 flex items-center gap-2">
            <BellRing size={16} className="text-amber-500" />
            Configurar Alertas
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lucro Mínimo (Prata)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm pl-1">💰</span>
              <input 
                type="number"
                min="0"
                step="10000"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg h-10 pl-10 pr-4 text-slate-200 outline-none focus:border-amber-500 font-mono text-sm"
                value={alertSettings.minProfit}
                onChange={e => setAlertSettings({ ...alertSettings, minProfit: Number(e.target.value) || 0 })}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Acionar apenas em lucros líquidos reais maiores que isso</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ROI / Margem Mínima (%)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm pl-1">%</span>
              <input 
                type="number"
                min="0"
                max="500"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg h-10 pl-10 pr-4 text-slate-200 outline-none focus:border-amber-500 font-mono text-sm"
                value={alertSettings.minMargin}
                onChange={e => setAlertSettings({ ...alertSettings, minMargin: Number(e.target.value) || 0 })}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Margem (Lucro / Custo) para validar validade da oportunidade</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cidades de Interesse</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleCity('all')}
                className={cn("px-3 py-1.5 rounded-md text-[11px] font-bold uppercase transition flex items-center gap-1", 
                  alertSettings.cities.includes('all') 
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                  : "bg-slate-800 text-slate-400 border border-slate-700"
                )}
              >
                {alertSettings.cities.includes('all') && <Check size={12} />} TODAS
              </button>
              {CITIES.filter(c => c !== 'Caerleon').map(city => {
                const isActive = alertSettings.cities.includes(city) && !alertSettings.cities.includes('all');
                return (
                  <button
                    key={city}
                    onClick={() => toggleCity(city)}
                    disabled={alertSettings.cities.includes('all')}
                    className={cn("px-3 py-1.5 rounded-md text-[11px] font-bold transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed", 
                      isActive 
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                    )}
                  >
                    {isActive && <Check size={12} />} {city}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase tracking-widest text-xs rounded shadow-lg transition"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
