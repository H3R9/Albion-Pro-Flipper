import React, { useEffect, useState } from 'react';
import { useSessionStats } from '@/hooks/useSessionStats';
import { formatSilver, formatTimeAgo } from '@/lib/albion/utils';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Trophy, Activity, Wallet, MapPin, PackageOpen, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseItemId } from '@/lib/albion/utils';
import Image from 'next/image';

interface DashboardProps {
  stats: ReturnType<typeof useSessionStats>['stats'];
  refreshes: ReturnType<typeof useSessionStats>['refreshes'];
  isNewRecord: boolean;
}

interface BestFlip {
  id: string;
  displayName: string;
  itemId: string;
  itemName: string;
  profit: number;
  roi: number;
  sourceCity: string;
}

export function Dashboard({ stats, refreshes, isNewRecord }: DashboardProps) {
  const [globalBest, setGlobalBest] = useState<BestFlip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalBest = async () => {
      try {
        const q = query(collection(db, 'bestFlips'), orderBy('profit', 'desc'), limit(10));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BestFlip));
        setGlobalBest(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalBest();
  }, [stats.highestProfit]); // Refresh when user gets a new high score

  const maxDist = Math.max(...Object.values(stats.profitDistribution));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--mw-card)]/80 border border-[var(--mw-border)] rounded-xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity"><Activity size={100} /></div>
          <p className="text-[10px] text-[var(--mw-text-muted)] uppercase tracking-widest font-bold mb-1">Total Analisado (Sessão)</p>
          <div className="text-3xl font-black text-[var(--mw-text-main)] font-mono">{stats.totalAnalyzed.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-[var(--mw-card)]/80 border border-[var(--mw-border)] rounded-xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity"><Wallet size={100} /></div>
          <p className="text-[10px] text-[var(--mw-text-muted)] uppercase tracking-widest font-bold mb-1">Maior Lucro</p>
          <div className="text-3xl font-black text-[var(--mw-gold-bright)] font-mono">{formatSilver(stats.highestProfit)}</div>
          {isNewRecord && <span className="absolute top-2 right-2 px-2 py-0.5 bg-[var(--mw-gold-bright)]/20 border border-[var(--mw-gold-bright)]/50 text-[var(--mw-gold-bright)] text-[10px] uppercase font-bold rounded animate-pulse">Recorde Pessoal!</span>}
        </div>
        <div className="bg-[var(--mw-card)]/80 border border-[var(--mw-border)] rounded-xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity"><MapPin size={100} /></div>
          <p className="text-[10px] text-[var(--mw-text-muted)] uppercase tracking-widest font-bold mb-1">Melhor Cidade (Trend)</p>
          <div className="text-2xl font-black text-[var(--mw-text-main)] truncate mt-1">{stats.bestCity}</div>
        </div>
        <div className="bg-[var(--mw-card)]/80 border border-[var(--mw-border)] rounded-xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity"><PackageOpen size={100} /></div>
          <p className="text-[10px] text-[var(--mw-text-muted)] uppercase tracking-widest font-bold mb-1">Categoria Quente</p>
          <div className="text-2xl font-black text-[var(--mw-text-main)] truncate mt-1">{stats.hottestCategory}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico de Distribuição vindo do design guide puro CSS */}
        <div className="bg-[var(--mw-card)]/80 border border-[var(--mw-border)] rounded-xl p-6 shadow-lg">
          <h3 className="font-bold text-[var(--mw-text-main)] uppercase tracking-widest text-xs mb-6 border-b border-[var(--mw-border)] pb-2 flex items-center gap-2"><Trophy size={16} /> Distribuição de Lucros</h3>
          
          <div className="flex flex-col gap-4">
            {Object.entries(stats.profitDistribution).map(([label, value]) => {
               const percentage = maxDist > 0 ? (value / maxDist) * 100 : 0;
               return (
                 <div key={label} className="flex items-center gap-3">
                   <div className="w-20 text-xs font-mono text-[var(--mw-text-muted)] text-right">{label}</div>
                   <div className="flex-1 h-6 bg-[var(--mw-bg)] rounded overflow-hidden relative border border-[var(--mw-border)]">
                     <div 
                       className="h-full bg-gradient-to-r from-[var(--mw-gold-dark)] to-[var(--mw-gold-primary)] rounded-r transition-all duration-1000 ease-out"
                       style={{ width: `${percentage}%` }}
                     />
                     <div className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold text-white drop-shadow-md">
                       {value > 0 ? value : ''}
                     </div>
                   </div>
                 </div>
               );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-[var(--mw-card)]/80 border border-[var(--mw-border)] rounded-xl p-6 shadow-lg">
          <h3 className="font-bold text-[var(--mw-text-main)] uppercase tracking-widest text-xs mb-6 border-b border-[var(--mw-border)] pb-2 flex items-center gap-2"><Activity size={16} /> Timeline de Refreshes</h3>
          
          {refreshes.length === 0 ? (
            <div className="text-sm text-[var(--mw-text-muted)] italic text-center py-8">Nenhum refresh registrado ainda.</div>
          ) : (
            <div className="relative pl-4 border-l-2 border-[var(--mw-border)] flex flex-col gap-6 pt-2 pb-2">
               {refreshes.map((r, i) => (
                 <div key={r.timestamp} className="relative">
                   <div className={cn("absolute -left-[21px] top-1.5 w-2 h-2 rounded-full border-2 border-[var(--mw-bg)]", i === 0 ? "bg-[var(--mw-gold-bright)] shadow-[0_0_8px_rgba(240,192,64,0.8)]" : "bg-[var(--mw-gold-dark)]")}></div>
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-mono text-[var(--mw-text-muted)]">{new Date(r.timestamp).toLocaleTimeString('pt-BR')}</span>
                     <span className="font-bold text-[var(--mw-gold-primary)] text-sm">{r.found} ops</span>
                   </div>
                   <div className="text-[10px] text-[var(--mw-text-muted)] mt-1 tracking-widest uppercase">
                     {i === 0 ? "Último Update" : `${formatTimeAgo(new Date(r.timestamp).toISOString())}`}
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[var(--mw-card)]/80 border border-[var(--mw-border)] rounded-xl p-6 shadow-lg mb-10">
          <h3 className="font-bold text-[var(--mw-text-main)] uppercase tracking-widest text-xs mb-6 border-b border-[var(--mw-border)] pb-2 flex items-center gap-2"><Crown size={16} className="text-[var(--mw-gold-bright)]" /> Ranking Histórico (Global 7 Dias)</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--mw-border)] text-[10px] uppercase tracking-widest text-[var(--mw-text-muted)]">
                  <th className="pb-3 px-2">Rank</th>
                  <th className="pb-3 px-2">Trader</th>
                  <th className="pb-3 px-2">Item</th>
                  <th className="pb-3 px-2 text-right">Lucro Limpo</th>
                  <th className="pb-3 px-2 text-right">ROI</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-[var(--mw-text-muted)]">Carregando heróis de Caerleon...</td></tr>
                ) : globalBest.length === 0 ? (
                   <tr><td colSpan={5} className="text-center py-8 text-[var(--mw-text-muted)]">Nenhum recorde registrado. Seja o primeiro!</td></tr>
                ) : globalBest.map((flip, i) => {
                  const iconUrl = `https://render.albiononline.com/v1/item/${flip.itemId}.png?size=32&quality=1`;
                  return (
                    <tr key={flip.id} className="border-b border-[var(--mw-border)]/30 hover:bg-[var(--mw-bg)]/50 transition-colors">
                      <td className="py-3 px-2">
                        {i === 0 ? <span className="text-[var(--mw-gold-bright)] font-bold text-lg drop-shadow-md">#1</span> : 
                         i === 1 ? <span className="text-gray-300 font-bold text-base">#2</span> : 
                         i === 2 ? <span className="text-amber-700 font-bold text-base">#3</span> : 
                         <span className="text-[var(--mw-text-muted)]">#{i+1}</span>}
                      </td>
                      <td className="py-3 px-2 font-bold text-[var(--mw-text-main)]">
                         {flip.displayName}
                      </td>
                      <td className="py-3 px-2 flex items-center gap-2">
                         <div className="w-8 h-8 rounded bg-[var(--mw-bg)] flex items-center justify-center border border-[var(--mw-border)] shrink-0">
                           <Image src={iconUrl} alt={flip.itemName} width={24} height={24} className="object-contain filter drop-shadow" unoptimized referrerPolicy="no-referrer" />
                         </div>
                         <span className="truncate max-w-[200px] text-xs font-semibold text-[var(--mw-text-muted)]" title={flip.itemName}>{flip.itemName}</span>
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-[var(--mw-gold-bright)]">
                         {formatSilver(flip.profit)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-[var(--mw-green)] font-bold">
                         {flip.roi.toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}
