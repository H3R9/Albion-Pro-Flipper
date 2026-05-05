import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { PackageOpen } from 'lucide-react';
import { ExtractedItem } from './constants';

interface Props {
  items: ExtractedItem[];
}

export function ExtractedItemsList({ items }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-[var(--mw-text-main)] flex items-center gap-2">
        <PackageOpen size={18} className="text-[var(--mw-green)]" />
        2. Inventário Extraído
      </h3>

      {items.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center border border-[var(--mw-border)] rounded-xl bg-[var(--mw-bg)]/20">
          <p className="text-sm text-[var(--mw-text-muted)] italic">Nenhum item analisado ainda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-[var(--mw-bg)] border border-[var(--mw-border)]/50 rounded-lg">
              <div className="flex flex-col">
                <span className="font-bold text-[var(--mw-text-main)] text-sm">
                  T{item.tier}
                  {item.enchantment > 0
                    ? <span className="text-[var(--mw-gold-primary)]">.{item.enchantment}</span>
                    : <span className="text-[var(--mw-text-muted)]">.0</span>
                  }
                  {' '}{item.name}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[var(--mw-text-muted)] uppercase tracking-wide">{item.category}</span>
                  {item.exactId ? (
                    <span className="text-xs text-[var(--mw-green)] font-mono">{item.exactId}</span>
                  ) : (
                    <span className="text-xs text-red-400">ID não mapeado</span>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-sm border-[var(--mw-gold-primary)]/50 text-[var(--mw-gold-primary)]">
                x{item.quantity}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
