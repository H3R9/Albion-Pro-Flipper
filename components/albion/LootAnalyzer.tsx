import React, { useState } from 'react';
import { Brain, RefreshCw, AlertTriangle, ArrowRight, Save, Calculator } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

import { ExtractedItem, MaterialStock } from './loot-analyzer/constants';
import { extractItemsFromImages } from './loot-analyzer/api';
import { analyzeLoot, AnalysisSummary } from './loot-analyzer/engine';
import { FileUploader } from './loot-analyzer/FileUploader';
import { ExtractedItemsList } from './loot-analyzer/ExtractedItemsList';
import { ActionPlanView } from './loot-analyzer/ActionPlanView';

export function LootAnalyzer() {
  const { user, profile, updateProfile } = useAuth();
  
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  
  const [isFetchingMarket, setIsFetchingMarket] = useState(false);
  const [analysisSummary, setAnalysisSummary] = useState<AnalysisSummary | null>(null);
  
  const [isSavingInventory, setIsSavingInventory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddFiles = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    const newUrls = newFiles.map(f => URL.createObjectURL(f));
    setImageUrls(prev => [...prev, ...newUrls]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAnalyzeImages = async () => {
    if (files.length === 0) return;
    setIsAnalyzingImage(true);
    setError(null);
    setAnalysisSummary(null);
    setExtractedItems([]);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("A chave do Gemini API não está configurada.");

      const items = await extractItemsFromImages(files, apiKey);
      setExtractedItems(items);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao analisar as imagens.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleGenerateMarketPlan = async () => {
    if (extractedItems.length === 0) return;
    setIsFetchingMarket(true);
    setError(null);
    setAnalysisSummary(null);

    try {
      const itemsToFetch: string[] = [];

      extractedItems.forEach(item => {
        if (!item.exactId) return;
        const isMaterial = ['RUNA', 'ALMA', 'RELIQUIA'].includes(item.category);
        if (isMaterial) {
          itemsToFetch.push(item.exactId);
        } else {
          const baseId = item.exactId.split('@')[0];
          [0, 1, 2, 3].forEach(enc => {
            itemsToFetch.push(enc === 0 ? baseId : `${baseId}@${enc}`);
          });
        }
      });

      const tiers = Array.from(new Set(extractedItems.map(i => i.tier).filter(t => t >= 4)));
      tiers.forEach(t => {
        itemsToFetch.push(`T${t}_RUNE`, `T${t}_SOUL`, `T${t}_RELIC`);
      });

      const allIds = Array.from(new Set(itemsToFetch)).join(',');
      if (!allIds) throw new Error('Nenhum item válido identificado para buscar no mercado.');

      const url = `https://east.albion-online-data.com/api/v2/stats/Prices/${allIds}.json?locations=Black Market,Caerleon,Lymhurst,Bridgewatch,Martlock,Thetford,Fort Sterling`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Falha ao conectar com Albion Data Project.');
      const marketData = await res.json();

      // Build current stock
      const currentStock: MaterialStock = { runas: {}, almas: {}, reliquias: {} };
      
      extractedItems.forEach(item => {
        if (item.category === 'RUNA') currentStock.runas[item.tier] = (currentStock.runas[item.tier] || 0) + item.quantity;
        if (item.category === 'ALMA') currentStock.almas[item.tier] = (currentStock.almas[item.tier] || 0) + item.quantity;
        if (item.category === 'RELIQUIA') currentStock.reliquias[item.tier] = (currentStock.reliquias[item.tier] || 0) + item.quantity;
      });

      const summary = analyzeLoot(extractedItems, marketData, currentStock);
      setAnalysisSummary(summary);
      
    } catch (err: any) {
      setError(err.message || 'Erro ao estudar o mercado.');
    } finally {
      setIsFetchingMarket(false);
    }
  };

  const handleSaveToInventory = async () => {
    if (!user) {
      toast.error('Faça login para salvar materiais no seu inventário global.');
      return;
    }

    setIsSavingInventory(true);
    try {
      const currentInv = { ...(profile?.inventory || {}) };
      let added = 0;

      extractedItems.forEach(item => {
        if (!['RUNA', 'ALMA', 'RELIQUIA'].includes(item.category) || !item.tier) return;
        const typeIndex = item.category === 'RUNA' ? 1 : item.category === 'ALMA' ? 2 : 3;
        const key = `${item.tier}_${typeIndex}`;
        currentInv[key] = (currentInv[key] || 0) + item.quantity;
        added++;
      });

      if (added === 0) {
        toast.info('Nenhuma Runa, Alma ou Relíquia encontrada nas prints para salvar.');
        return;
      }

      await updateProfile({ inventory: currentInv });
      toast.success(`${added} tipos de materiais salvos no Planejador!`);
    } catch {
      toast.error('Erro ao sincronizar inventário.');
    } finally {
      setIsSavingInventory(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 border-b border-[var(--mw-border)] pb-4">
        <div className="p-3 bg-[var(--mw-gold-bright)]/10 text-[var(--mw-gold-bright)] rounded-xl">
          <Brain size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[var(--mw-text-main)] uppercase tracking-tight">Analista de Loot IA</h2>
          <p className="text-[var(--mw-text-muted)] text-sm">
            Faça upload dos prints do seu banco/inventário e descubra o que encantar!
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-500">
          <AlertTriangle size={20} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card className="p-6">
          <FileUploader 
            files={files} 
            imageUrls={imageUrls} 
            onAddFiles={handleAddFiles} 
            onRemoveFile={handleRemoveFile} 
          />
          <Button
            onClick={handleAnalyzeImages}
            disabled={files.length === 0 || isAnalyzingImage}
            className="w-full mt-6 bg-[var(--mw-gold-primary)] hover:bg-[var(--mw-gold-bright)] text-black font-bold uppercase tracking-widest text-sm py-4"
          >
            {isAnalyzingImage ? <RefreshCw className="animate-spin" size={18} /> : <Brain size={18} />}
            {isAnalyzingImage ? 'Extraindo Itens pela IA...' : 'Ler Itens da Imagem'}
          </Button>
        </Card>

        <Card className="p-6">
          <ExtractedItemsList items={extractedItems} />

          {extractedItems.length > 0 && (
            <div className="flex flex-col gap-3 mt-6">
              <Button
                onClick={handleSaveToInventory}
                disabled={isSavingInventory}
                variant="outline"
                className="w-full border-[var(--mw-border)] text-sm py-4"
              >
                {isSavingInventory ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                Salvar Materiais no Planejador
              </Button>

              <Button
                onClick={handleGenerateMarketPlan}
                disabled={isFetchingMarket || extractedItems.filter(i => i.exactId).length === 0}
                className="w-full bg-[var(--mw-green)] hover:bg-[var(--mw-green)]/90 text-black font-bold uppercase tracking-widest text-sm py-4 group"
              >
                {isFetchingMarket ? <RefreshCw className="animate-spin" size={18} /> : <Calculator size={18} />}
                {isFetchingMarket ? 'Estudando Mercado...' : 'Traçar Plano de Venda para BM'}
                {!isFetchingMarket && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </Button>
            </div>
          )}
        </Card>
      </div>

      {isFetchingMarket && (
        <Card className="p-8 border-[var(--mw-gold-primary)]/30 border-2 mt-4">
           <div className="flex flex-col items-center justify-center py-10 gap-4">
             <RefreshCw size={32} className="animate-spin text-[var(--mw-gold-primary)]" />
             <p className="text-[var(--mw-text-muted)] uppercase tracking-widest text-sm font-bold animate-pulse">
               Processando preços e calculando rotas...
             </p>
           </div>
        </Card>
      )}

      {analysisSummary && !isFetchingMarket && (
        <ActionPlanView summary={analysisSummary} />
      )}
    </div>
  );
}
