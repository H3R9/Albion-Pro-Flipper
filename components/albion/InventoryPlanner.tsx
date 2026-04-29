import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Sparkles, Wallet, Pickaxe, MapPin, Search, Save, FileText } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '@/lib/utils';
import { TradeResult } from '@/lib/albion/types';
import { formatSilver, ROYAL_CITIES } from '@/lib/albion/utils';
import { getItemFullName } from '@/lib/albion/items';
import { MarkdownMessage } from './MarkdownMessage';
import { useAuth } from '@/components/auth/AuthProvider';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface InventoryPlannerProps {
  results: TradeResult[];
  settings: { maxAge: number, minProfit: number, minMargin: number };
}

export function InventoryPlanner({ results, settings }: InventoryPlannerProps) {
  const { user, profile, updateProfile } = useAuth();
  const [silver, setSilver] = useState<number>(0);
  const [cities, setCities] = useState<string[]>(ROYAL_CITIES);
  
  // Inventory: '4_1' (T4 Runa), '5_2' (T5 Alma), etc.
  const [inventory, setInventory] = useState<Record<string, number>>({});

  const [messages, setMessages] = useState<{ role: 'model' | 'user'; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync state with user profile initially
  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSilver(profile.silver || 0);
      setInventory(profile.inventory || {});
    }
  }, [profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleCity = (c: string) => {
    setCities(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const updateInv = (tier: number, enchant: number, val: string) => {
    const num = parseInt(val) || 0;
    setInventory(prev => ({
      ...prev,
      [`${tier}_${enchant}`]: num
    }));
  };

  const saveProfileData = async () => {
    if (!user) {
       toast.error("Faça login para salvar seu perfil.");
       return;
    }
    setIsSavingProfile(true);
    try {
      await updateProfile({ silver, inventory });
      toast.success("Perfil atualizado e salvo.");
    } catch (e) {
      toast.error("Erro ao salvar perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  const saveReport = async () => {
    if (!user) {
      toast.error("Faça login para salvar relatórios.");
      return;
    }
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== 'model') {
      toast.error("Nenhum relatório gerado.");
      return;
    }

    setIsSavingReport(true);
    try {
      await addDoc(collection(db, "reports"), {
        userId: user.uid,
        title: `Relatório de Planejamento - ${new Date().toLocaleDateString()}`,
        content: lastMsg.text,
        createdAt: serverTimestamp()
      });
      toast.success("Relatório salvo com sucesso!");
    } catch (e) {
       handleFirestoreError(e, OperationType.CREATE, "reports");
       toast.error("Erro ao salvar o relatório.");
    } finally {
      setIsSavingReport(false);
    }
  }

  const getMatName = (enchant: number) => {
    if (enchant === 1) return 'Runas';
    if (enchant === 2) return 'Almas';
    if (enchant === 3) return 'Relíquias';
    return '';
  };

  const handleAnalyze = async () => {
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Chave de API do Gemini não configurada.");
      }

      const ai = new GoogleGenAI({ apiKey });

      // Obter resultados (permitindo lucro negativo se for encantamento, pois o jogador usa runas do inventário)
      const validResults = results.filter(r => {
         if (!cities.includes(r.baseCity || r.sourceCity)) return false;
         
         if (r.tradeType === 'enchant') {
           // O jogador vai usar suas próprias runas. 
           // Lucro líquido em relação ao custo base (excluindo o valor de mercado das runas)
           const profitAssumingOwnRunes = r.sellPrice - (r.baseCost || 0) * 1.04;
           return profitAssumingOwnRunes > 0;
         }
         return r.profit > 0;
      });
      
      // Order by baseCost to give the AI smaller/different options, or just order by profit
      const topResults = validResults.sort((a,b) => b.profit - a.profit).slice(0, 100);
      const dataContext = topResults.map(r => {
        const tierStr = r.baseId?.split('_')[0] || r.itemId.split('_')[0]; // ex: T4
        const methodStr = r.baseMethod === 'direct' ? 'Compra Direta' : 'Pedido de Compra (Buy Order)';
        const imageId = (r.baseId || r.itemId).split('@')[0];
        
        let profitDesc = `Lucro Líquido Estimado: ${formatSilver(r.profit)}`;
        if (r.tradeType === 'enchant') {
           const profitOwnRunes = r.sellPrice - (r.baseCost || 0) * 1.04; // Simplificado imposto + base
           profitDesc = `Se ele COMPRAR materiais: ${formatSilver(r.profit)}. Se UTILIZAR materiais do inventário: ${formatSilver(profitOwnRunes)} de lucro!`;
        }
        
        return `Oportunidade: Encantar ${r.baseId || r.itemId} para ${r.itemId}
Tier do Item Flat: ${tierStr}
ID da Imagem: ${imageId}
Custo do Item Base Flat: ${formatSilver(r.baseCost || 0)} em ${r.baseCity} via ${methodStr} (Preço atualizado há ${r.cityAge} min)
Materiais Necessários: ${r.runesRequired?.map(rune => `${rune.amount}x ${getItemFullName(rune.id)} (Custo de mercado: ${formatSilver(rune.price * rune.amount)})`).join(', ')}
Venda no Black Market: ${formatSilver(r.sellPrice)} (Preço atualizado há ${r.bmAge} min)
Volume de Venda BM (24h): ${r.volume24h || 0} unidades vendidas
${profitDesc}`;
      }).join('\n\n');

      const invContext = Object.entries(inventory)
        .filter(([, qty]) => qty > 0)
        .map(([key, qty]) => {
           const [tier, ench] = key.split('_');
           return `Tier ${tier} ${getMatName(parseInt(ench))}: ${qty} unidades`;
        }).join('\n');

      const systemInstruction = `Você é um Estrategista Financeiro Avançado e Mestre Encantador em Albion Online.
Sua análise deve ser EXTREMAMENTE precisa, crítica e matemática. O jogador quer saber quais itens "flat" comprar nas cidades para encantar usando os recursos do inventário dele, e vendê-los no Black Market.

DADOS DO JOGADOR:
- Prata livre (apenas para comprar itens flats): ${formatSilver(silver)}
- Inventário de Materiais:
${invContext || 'Nenhum material no inventário.'}

DADOS DO MERCADO (TOP OPORTUNIDADES EM TEMPO REAL):
${dataContext || 'Nenhuma oportunidade.'}

AVISO IMPORTANTE: Se o jogador perguntar sobre itens específicos que não estão na lista, EXPLIQUE que o filtro atual dele de "Idade Máxima dos Dados" está configurado para ${settings.maxAge} minutos. Quando a API não tem atualizações recentes ou a margem é muito baixa, a oportunidade é omitida.

REGRAS DE ANÁLISE E CÁLCULOS RIGOROSOS:
1. **PRIORIDADE ABSOLUTA AO INVENTÁRIO (REGRA DE OURO):** Você DEVE priorizar ao MÁXIMO apontar as oportunidades (mesmo com lucros menores) que consumam os materiais exatos que o jogador já POSSUI NO INVENTÁRIO.
2. **Quantidade Múltipla MÁXIMA:** NÃO recomende apenas 1 unidade, mas use um Teto de Segurança Severo: Nunca mande comprar mais de 25% do "Volume de Venda BM (24h)".
3. **Perigo Real com Pedidos de Compra (Buy Orders):** NUNCA sugira "Pedido de Compra" para itens com Volume menor que 100.
4. **Alerta de Volatilidade e Histórico (CRÍTICO):** A API pode ter picos de preço (outliers) artificiais. No final do seu relatório, DÊ UM ALERTA NEGRITO E DESTACADO: "Verifique o histórico de 4 semanas no jogo! Não invista sem antes conferir se o preço do Black Market se manteve estável nos últimos dias. Jamais compre às cegas apenas pelos dados deste relatório, valide in-game primeiro!"
5. **Cálculo Correto e Taxa de Mercado:** O "Lucro Líquido Estimado" os impostos do Premium (4,5%). Avise brevemente: "O lucro projetado assume conta Com Premium (4,5% taxas BM). Para conta Sem Premium, reduza ~3% do valor bruto."
6. **Valorize o Uso do Baú:** Escolha itens cujos requisitos se encaixam no inventário dele.
7. **Tradução Oficial Albion PT-BR:** 
   - CAPEITEM_KEEPER = Capa Protetora
   - CAPEITEM_UNDEAD = Capa dos Mortos-Vivos
   - CAPEITEM_DEMON = Capa Demoníaca
   - CAPEITEM_MORGANA = Capa da Morgana
   - CAPEITEM_FW_MARTLOCK = Capa de Martlock
   - MACES = Maça, SWORDS = Espada, BROADSWORD = Espada Larga.

DIRETRIZES EXATAS DE FORMATAÇÃO (Deixe os dados bem fáceis de ler):
- Organize o plano de compras separando as cidades.
- Para cada item sugerido, use EXATAMENTE a sintaxe para Imagens abaixo:
  **![<NOME OFICIAL EM PT-BR>](https://render.albiononline.com/v1/item/<ID_DA_IMAGEM>.png?size=40) <QTD>x [T<Tier>] <NOME>** (via <Método de Compra>)
  - **Custo Unitário Flat:** <Valor> Prata
  - **Venda Unitária BM:** <Valor> Prata | **Volume 24h:** <Z> vendidos
  - **Materiais para <QTD>:** <Quantidade Total>x <Runa/Alma/Relíquia> Tier <Y>
  - **Lucro Líquido Estimado:** <Valor Unitário x Qtd> Prata

Notas sobre a Imagem: Substitua <ID_DA_IMAGEM> pela "ID da Imagem" exata dos dados fornecidos (ex: T4_CAPEITEM_KEEPER).
- Crie um "Resumo Financeiro da Operação" no final, focando nos materiais consumidos do próprio banco dele.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ role: 'user', parts: [{ text: "Por favor, analise as opções com base no meu inventário de prata e runas, e me diga minha melhor rota de ação." }] }],
        config: {
          systemInstruction,
          temperature: 0.2,
        }
      });

      const responseText = response.text || "Desculpe, não consegui analisar no momento.";
      
      setMessages([{ role: 'model', text: responseText }]);

    } catch (error) {
      console.error(error);
      setMessages([{ role: 'model', text: "Ocorreu um erro ao conectar com a IA analítica do mercado." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0b0c10]/80 border border-slate-800 rounded-2xl p-6 shadow-xl w-full mx-auto mt-6 backdrop-blur-sm relative z-10">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center gap-3 drop-shadow-md">
            <Wallet className="text-emerald-500" size={28} />
            Planejador de Inventário (IA)
          </h2>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl leading-relaxed">
            Informe quanto de prata livre você tem, e os materiais de encantamento no seu baú. 
            A IA combinará seu inventário com as últimas oportunidades de mercado para sugerir o **plano perfeito** de arbitragem e encantamento.
          </p>
        </div>
        <div className="flex shrink-0">
          <button 
             onClick={saveProfileData} 
             disabled={isSavingProfile || !user}
             className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-lg border border-slate-600 transition disabled:opacity-50"
             title={!user ? "Faça login para salvar" : "Salvar Prata e Inventário no perfil"}
          >
             {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
             Salvar Inventário
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 shadow-inner">
            <h3 className="text-emerald-400 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Wallet size={16} /> Prata Disponível
            </h3>
            <input 
              type="number" 
              value={silver || ''}
              onChange={(e) => setSilver(parseInt(e.target.value) || 0)}
              placeholder="Ex: 5000000"
              className="w-full bg-[#0b0c10] border border-slate-700 p-3 rounded-lg text-slate-100 focus:border-emerald-500 transition-colors outline-none"
            />
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 shadow-inner">
            <h3 className="text-amber-500 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Pickaxe size={16} /> Seus Materiais
            </h3>
            
            {[4,5,6,7,8].map(tier => (
              <div key={tier} className="mb-4 last:mb-0">
                <div className="text-slate-300 font-bold text-xs mb-2 border-b border-slate-800 pb-1">Tier {tier}</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Runas (.1)</label>
                    <input type="number" min="0" placeholder="0" className="w-full bg-[#0b0c10] border border-slate-800 p-2 rounded text-slate-300 text-xs text-center" value={inventory[`${tier}_1`] || ''} onChange={e => updateInv(tier, 1, e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Almas (.2)</label>
                    <input type="number" min="0" placeholder="0" className="w-full bg-[#0b0c10] border border-slate-800 p-2 rounded text-slate-300 text-xs text-center" value={inventory[`${tier}_2`] || ''} onChange={e => updateInv(tier, 2, e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Relíquias (.3)</label>
                    <input type="number" min="0" placeholder="0" className="w-full bg-[#0b0c10] border border-slate-800 p-2 rounded text-slate-300 text-xs text-center" value={inventory[`${tier}_3`] || ''} onChange={e => updateInv(tier, 3, e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 shadow-inner">
            <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
              <MapPin size={16} /> Cidades para Comprar (Itens Flat)
            </h3>
            <div className="flex flex-wrap gap-2">
              {ROYAL_CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => toggleCity(city)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    cities.includes(city)
                      ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                      : "bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300"
                  )}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isLoading || results.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider rounded-xl transition shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {isLoading ? "Processando e Analisando..." : "Gerar Plano Estratégico"}
          </button>
          {results.length === 0 && (
             <p className="text-[11px] text-amber-500 text-center font-medium mt-2">
               Execute o scan na aba &quot;Arbitragem BM&quot; primeiro para gerar oportunidades.
             </p>
          )}

        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl h-full min-h-[500px] flex flex-col">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <Sparkles className="text-emerald-500" size={18} />
              <h3 className="font-bold text-slate-200">Relatório da Inteligência Artificial</h3>
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto">
               {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 gap-4 opacity-50">
                     <Search size={48} className="text-emerald-500/50" />
                     <p className="max-w-xs">Preencha sua prata, seus materiais e clique em <strong>Gerar Plano Estratégico</strong> para receber a análise detalhada.</p>
                  </div>
               ) : (
                  <div>
                    {messages.map((msg, idx) => (
                      <div key={idx} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-sm relative mb-4">
                         <MarkdownMessage content={msg.text} />
                      </div>
                    ))}
                    
                    {messages.length > 0 && messages[messages.length - 1].role === 'model' && (
                      <div className="flex justify-end mt-4">
                        <button 
                          onClick={saveReport}
                          disabled={isSavingReport || !user}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-bold rounded-md border border-blue-500/50 transition disabled:opacity-50"
                        >
                          {isSavingReport ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                          Salvar Relatório no Perfil
                        </button>
                      </div>
                    )}
                  </div>
               )}
               <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
