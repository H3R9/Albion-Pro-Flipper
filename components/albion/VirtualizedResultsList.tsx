import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TradeCard } from '@/components/albion/TradeCard';
import { TradeResult } from '@/lib/albion/types';
import { Search } from 'lucide-react';

import { EmptyState } from '@/components/ui/states/EmptyState';
import { LoadingState } from '@/components/ui/states/LoadingState';

export function VirtualizedResultsList({ 
  results, 
  isScanning, 
  hasProgress 
}: { 
  results: TradeResult[]; 
  isScanning: boolean; 
  hasProgress: boolean; 
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: results.length,
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
    <div className="flex flex-col gap-2">
      <div 
        ref={parentRef} 
        className="h-[800px] w-full overflow-auto rounded-lg border border-slate-800 bg-slate-900/20"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const res = results[virtualRow.index];
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
                className="p-2"
              >
                <TradeCard result={res} index={virtualRow.index} />
              </div>
            );
          })}
        </div>
      </div>
      {results.length > 100 && (
        <div className="text-center p-4 text-xs font-bold text-slate-500 mt-4 bg-slate-900/50 rounded-md border border-slate-800">
          Mostrando {results.length} resultados. Use filtros adicionais ou a barra de pesquisa se necessário.
        </div>
      )}
    </div>
  );
}
