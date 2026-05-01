import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { MarkdownMessage } from './MarkdownMessage';
import { Loader2, FileText, Calendar, Trash2 } from 'lucide-react';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirmDeleteId !== reportId) {
      setConfirmDeleteId(reportId);
      return;
    }
    
    setConfirmDeleteId(null);
    setDeletingId(reportId);
    try {
      await deleteDoc(doc(db, "reports", reportId));
      setReports(prev => prev.filter(r => r.id !== reportId));
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reports/${reportId}`);
    } finally {
      setDeletingId(null);
    }
  };

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
               <div key={report.id} className="relative group">
                 <button
                   onClick={() => setSelectedReport(report)}
                   className={`w-full text-left p-3 rounded-lg mb-2 transition-colors border ${selectedReport?.id === report.id ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'text-slate-300 hover:bg-slate-800 border-transparent'}`}
                 >
                   <div className="font-bold text-sm truncate pr-8">{report.title}</div>
                   <div className="text-xs opacity-60 mt-1 flex items-center gap-1">
                      <Calendar size={12} />
                      {report.createdAt.toLocaleString('pt-BR')}
                   </div>
                 </button>
                 <button
                   onClick={(e) => handleDelete(report.id, e)}
                   className={`absolute top-3 right-3 transition-opacity p-1 rounded ${confirmDeleteId === report.id ? 'opacity-100 text-white bg-red-600 hover:bg-red-700 font-bold text-xs px-2 py-1' : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400'}`}
                   title={confirmDeleteId === report.id ? "Clique novamente para confirmar" : "Excluir relatório"}
                   disabled={deletingId === report.id}
                 >
                   {deletingId === report.id ? (
                     <Loader2 size={16} className="animate-spin text-white" />
                   ) : confirmDeleteId === report.id ? (
                     "Confirmar"
                   ) : (
                     <Trash2 size={16} />
                   )}
                 </button>
               </div>
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
