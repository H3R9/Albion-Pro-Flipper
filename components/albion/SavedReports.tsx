import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { MarkdownMessage } from './MarkdownMessage';
import { Loader2, FileText, Calendar } from 'lucide-react';

interface SavedReport {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export function SavedReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);

  useEffect(() => {
    async function loadReports() {
      if (!user) {
        setReports([]);
        return;
      }
      setLoading(true);
      try {
        const q = query(
            collection(db, "reports"), 
            where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const loaded: SavedReport[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          loaded.push({
            id: doc.id,
            title: data.title,
            content: data.content,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        });
        loaded.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setReports(loaded);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "reports");
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [user]);

  if (!user) {
    return (
       <div className="flex flex-col items-center justify-center p-12 text-slate-500">
          <FileText size={48} className="opacity-50 mb-4" />
          <p>Faça login para visualizar seus relatórios salvos.</p>
       </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
         <Loader2 className="animate-spin mr-2" /> Carregando relatórios...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-h-[80vh]">
      <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
        <div className="bg-slate-950 p-4 border-b border-slate-800">
           <h3 className="font-bold text-slate-200">Meus Relatórios</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
           {reports.length === 0 ? (
             <p className="text-sm text-slate-500 p-4 text-center">Nenhum relatório salvo.</p>
           ) : (
             reports.map(report => (
               <button
                 key={report.id}
                 onClick={() => setSelectedReport(report)}
                 className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${selectedReport?.id === report.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800 border border-transparent'}`}
               >
                 <div className="font-bold text-sm truncate">{report.title}</div>
                 <div className="text-xs opacity-60 mt-1 flex items-center gap-1">
                    <Calendar size={12} />
                    {report.createdAt.toLocaleString('pt-BR')}
                 </div>
               </button>
             ))
           )}
        </div>
      </div>

      <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-6 overflow-y-auto">
         {selectedReport ? (
            <div>
               <h2 className="text-2xl font-black text-slate-100 mb-6">{selectedReport.title}</h2>
               <MarkdownMessage content={selectedReport.content} />
            </div>
         ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
               Selecione um relatório na lista para visualizar.
            </div>
         )}
      </div>
    </div>
  );
}
