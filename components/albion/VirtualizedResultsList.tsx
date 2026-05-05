import React, { useRef, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TradeCard } from '@/components/albion/TradeCard';
import { TradeResult } from '@/lib/albion/types';
import { Search, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/states/EmptyState';
import { LoadingState } from '@/components/ui/states/LoadingState';

export function VirtualizedResultsList({ 
  results, 
  isScanning, 
  hasProgress,
  newPulseKeys
}: { 
  results: TradeResult[]; 
  isScanning: boolean; 
  hasProgress: boolean;
  newPulseKeys?: Set<string>;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [scoreFilter, setScoreFilter] = useState<'ALL' | 'EXECUTE' | 'EXECUTE_WATCH'>('ALL');

  const filteredAndSortedResults = useMemo(() => {
    let list = results;
    
    if (scoreFilter === 'EXECUTE') {
      list = list.filter(r => r.flipScore?.recommendation === 'EXECUTE');
    } else if (scoreFilter === 'EXECUTE_WATCH') {
      list = list.filter(r => r.flipScore?.recommendation === 'EXECUTE' || r.flipScore?.recommendation === 'WATCH');
    }

    return list.sort((a, b) => {
      const pA = a.flipScore?.totalScore || 0;
      const pB = b.flipScore?.totalScore || 0;
      return sortDirection === 'desc' ? pB - pA : pA - pB;
    });
  }, [results, sortDirection, scoreFilter]);

  const maxProfit = useMemo(() => {
    if (filteredAndSortedResults.length === 0) return 0;
    return Math.max(...filteredAndSortedResults.map(r => r.adjustedProfit !== undefined ? r.adjustedProfit : r.profit));
  }, [filteredAndSortedResults]);

  const rowVirtualizer = useVirtualizer({
    count: filteredAndSortedResults.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140, // Altura estimada do card fechado
    overscan: 5,
  });

  if (isScanning && results.length === 0) {
    return <LoadingState />;
  }

  if (!isScanning && results.length === 0 && !hasProgress) {
    return (
      <EmptyState 
        icon={Search} 
        title="Scanner Inteligente" 
        description="Clique no botão SCAN para buscar dados em tempo real. Filtre por categoria para focar em itens específicos." 
      />
    );
  }

  if (!isScanning && results.length === 0 && hasProgress) {
    return (
      <EmptyState 
        icon={Search} 
        title="Sem Resultados" 
        description="A busca não retornou nenhuma oportunidade lucrativa. Tente alterar os filtros." 
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--mw-border)] bg-[var(--mw-bg)]/50 shadow-xl overflow-hidden">
      {/* Sticky Table Header */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 py-3 bg-[var(--mw-card)]/80 backdrop-blur-md border-b border-[var(--mw-border)] z-10 sticky top-0 shadow-sm gap-4">
        
        {/* Quick Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto shrink-0 scrollbar-hide pb-1 md:pb-0">
          <button 
            onClick={() => setScoreFilter('ALL')}
            className={cn("px-3 py-1.5 rounded text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border", scoreFilter === 'ALL' ? "bg-[var(--mw-bg)] text-[var(--mw-text-main)] border-[var(--mw-border)] shadow-sm" : "bg-transparent text-[var(--mw-text-muted)] border-transparent hover:text-[var(--mw-text-main)] hover:bg-[var(--mw-card-hover)]")}
          >
            Todos
          </button>
          <button 
            onClick={() => setScoreFilter('EXECUTE_WATCH')}
            className={cn("px-3 py-1.5 rounded text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border", scoreFilter === 'EXECUTE_WATCH' ? "bg-[var(--mw-gold-bright)]/10 text-[var(--mw-gold-bright)] border-[var(--mw-gold-bright)]/30" : "bg-transparent text-[var(--mw-text-muted)] border-transparent hover:text-[var(--mw-text-main)] hover:bg-[var(--mw-card-hover)]")}
          >
            EXECUTE + WATCH
          </button>
          <button 
            onClick={() => setScoreFilter('EXECUTE')}
            className={cn("px-3 py-1.5 rounded text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border", scoreFilter === 'EXECUTE' ? "bg-[var(--mw-green)]/10 text-[var(--mw-green)] border-[var(--mw-green)]/30" : "bg-transparent text-[var(--mw-text-muted)] border-transparent hover:text-[var(--mw-text-main)] hover:bg-[var(--mw-card-hover)]")}
          >
            Apenas EXECUTE
          </button>
        </div>

        <div className="flex-1 hidden lg:block text-center text-sm font-bold text-[var(--mw-text-muted)] uppercase tracking-widest">
          Rota de Arbitragem Fixa
        </div>
        <div className="w-full md:w-[160px] flex justify-end shrink-0">
          <button 
            onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center justify-end gap-2 px-3 py-1.5 rounded bg-[var(--mw-card)] hover:bg-[var(--mw-card-hover)] text-[var(--mw-gold-primary)] border border-[var(--mw-border)] transition-all group w-full md:w-auto"
          >
            <span className="text-sm font-bold uppercase tracking-widest">Score</span>
            <div className={cn("transition-transform duration-300", sortDirection === 'asc' ? "rotate-180" : "rotate-0")}>
               <ArrowUpDown size={14} className="text-[var(--mw-gold-bright)] group-hover:scale-110 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      <div 
        ref={parentRef} 
        className="h-[750px] w-full overflow-auto scrollbar-hide relative"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const res = filteredAndSortedResults[virtualRow.index];
            const oppKey = `${res.itemId}-${res.sourceCity || res.baseCity}-${Math.floor(res.buyPrice / 1000)}`;
            const rowIsEven = virtualRow.index % 2 === 0;
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={cn("px-4 pt-3 pb-3 border-b border-[var(--mw-border)]/50", rowIsEven ? "bg-[var(--mw-bg)]/20" : "bg-black/10")}
              >
                <TradeCard 
                  result={res} 
                  index={virtualRow.index} 
                  isNew={newPulseKeys?.has(oppKey)} 
                  maxProfit={maxProfit} 
                />
              </div>
            );
          })}
        </div>
      </div>
      {results.length > 100 && (
        <div className="text-center p-4 text-sm uppercase tracking-widest font-bold text-[var(--mw-text-muted)] bg-[var(--mw-card)]/50 border-t border-[var(--mw-border)]">
          Mostrando os {results.length} melhores resultados ordenados por score.
        </div>
      )}
    </div>
  );
}
