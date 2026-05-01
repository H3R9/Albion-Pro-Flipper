import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-slate-900 border border-dashed border-slate-700 rounded-lg p-12 flex flex-col items-center justify-center text-slate-500 text-center">
      <Icon size={48} className="mb-4 opacity-50" />
      <h3 className="text-xl font-bold text-slate-300 mb-2 uppercase tracking-wide">{title}</h3>
      <p className="text-sm max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
