import { Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-[var(--mw-border)] bg-[var(--mw-card)]/50 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden h-28 opacity-60">
          
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             {/* Partículas de moeda simuladas via css inline vars */}
             {[...Array(5)].map((_, idx) => (
               <div 
                 key={idx} 
                 className="coin-particle" 
                 style={{ 
                   left: `${10 + Math.random() * 80}%`, 
                   animationDuration: `${1.5 + Math.random()}s`,
                   animationDelay: `${Math.random()}s`
                 }}
               />
             ))}
          </div>

          <div className="w-16 h-16 bg-[var(--mw-border)] rounded-md shadow-inner animate-pulse shrink-0 relative z-10" />
          <div className="flex flex-col gap-3 flex-1 w-full relative z-10">
             <div className="w-1/3 h-4 bg-[var(--mw-border)] rounded animate-pulse" />
             <div className="w-1/4 h-3 bg-[var(--mw-border)] rounded animate-pulse" />
          </div>
          <div className="flex-1 w-full relative z-10">
             <div className="w-3/4 mx-auto h-8 bg-[var(--mw-border)]/50 rounded animate-pulse" />
          </div>
          <div className="flex flex-col items-end gap-2 w-32 shrink-0 relative z-10">
             <div className="w-20 h-5 bg-[var(--mw-border)] rounded animate-pulse" />
             <div className="w-16 h-4 bg-[var(--mw-border)]/50 rounded animate-pulse bg-gradient-to-r from-transparent to-[var(--mw-gold-dark)]/20" />
          </div>
        </div>
      ))}
    </div>
  );
}
