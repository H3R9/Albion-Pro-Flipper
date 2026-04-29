import { Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-4">
      <Loader2 className="animate-spin" size={48} />
      <span className="font-bold tracking-wider uppercase text-sm">Carregando...</span>
    </div>
  );
}
