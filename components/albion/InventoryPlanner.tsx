import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Sparkles, Wallet, Pickaxe, MapPin, Search } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '@/lib/utils';
import { TradeResult } from '@/lib/albion/analysis';
import { formatSilver, ROYAL_CITIES } from '@/lib/albion/utils';
import { getItemFullName } from '@/lib/albion/items';
import { MarkdownMessage } from './MarkdownMessage';

interface InventoryPlannerProps {
  results: TradeResult[];
}

export function InventoryPlanner({ results }: InventoryPlannerProps) {
  const [silver, setSilver] = useState<number>(0);
  const [cities, setCities] = useState<string[]>(ROYAL_CITIES);
  
  // Inventory: '4_1' (T4 Runa), '5_2' (T5 Alma), etc.
  const [inventory, setInventory] = useState<Record<string, number>>({});

  const [messages, setMessages] = useState<{ role: 'model' | 'user'; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

      // Filtrar resultados apenas pelas cidades selecionadas e com lucro > 0
      const validResults = results.filter(r => cities.includes(r.baseCity || r.sourceCity) && r.profit > 0);
      
      // Order by baseCost to give the AI smaller/different options, or just order by profit
      const topResults = validResults.sort((a,b) => b.profit - a.profit).slice(0, 80);

      const dataContext = topResults.map(r => {
        const tierStr = r.baseId?.split('_')[0] || r.itemId.split('_')[0]; // ex: T4
        const methodStr = r.baseMethod === 'direct' ? 'Compra Direta' : 'Pedido de Compra (Buy Order)';
        return `Oportunidade: Encantar ${getItemFullName(r.baseId || r.itemId)} para ${getItemFullName(r.itemId)}
Tier do Item Flat: ${tierStr}
Custo do Item Base Flat: ${formatSilver(r.baseCost || 0)} em ${r.baseCity} via ${methodStr} (Preço atualizado há ${r.cityAge} min)
Materiais Necessários: ${r.runesRequired?.map(rune => `${rune.amount}x ${rune.tier} ${rune.type} (Custo estimado total: ${formatSilver(rune.price * rune.amount)})`).join(', ')}
Venda no Black Market: ${formatSilver(r.sellPrice)} (Preço atualizado há ${r.bmAge} min)
Volume de Venda BM (24h): ${r.volume24h || 0} unidades vendidas
Lucro Líquido Estimado: ${formatSilver(r.profit)}`;
      }).join('\n\n');

      const invContext = Object.entries(inventory)
        .filter(([_, qty]) => qty > 0)
        .map(([key, qty]) => {
           const [tier, ench] = key.split('_');
           return `Tier ${tier} ${getMatName(parseInt(ench))}: ${qty} unidades`;
        }).join('\n');

      const systemInstruction = `Você é um Estrategista Financeiro e Mestre Encantador em Albion Online.
O jogador quer saber quais itens "flat" ele deve comprar nas cidades escolhidas (incluindo Caerleon, se o jogador quiser e os dados mostrarem) para encantar usando os recursos do inventário dele, e vendê-los no Black Market.

DADOS DO JOGADOR:
- Prata livre (apenas para comprar itens flats): ${formatSilver(silver)}
- Inventário de Materiais:
${invContext || 'Nenhum material no inventário.'}

DADOS DO MERCADO (TOP OPORTUNIDADES EM ORDEM DE POTENCIAL DE LUCRO ABSOLUTO):
${dataContext || 'Nenhuma oportunidade.'}

REGRAS DE ANÁLISE E CÁLCULOS (MUITO IMPORTANTE):
1. **Os materiais no inventário NÃO SÃO DE GRAÇA.** O jogador COMPROU esses materiais e eles têm um valor de mercado. O seu cálculo de Lucro Real DEVE subtrair o valor estimado dos materiais (indicado nas oportunidades) do valor de venda. Não diga que o lucro é maior só porque ele já tem o material no baú. Mantenha os cálculos da lista (Lucro Líquido Real = BM Venda - Flat - Custo Mercado Materiais).
2. Dê ao jogador um plano de ação listando claramente os itens que ele deve comprar nas cidades com a prata livre que ele tem (respeitando o orçamento).
3. Maximize o seu Custo-Benefício por recurso: Se um item der um pouco mais de lucro absoluto mas gastar 384 materiais (arma 2 mãos), e outro der um pouco menos de lucro absoluto mas usar apenas 96 (botas/elmos/capas), mostre o que for mais vantajoso em termos de Retorno sobre Investimento.
4. Especifique EXATAMENTE o tipo de Runa em PT-BR (ex: "Use 288x Almas Tier 5 para encantar de .1 para .2", "Runas Tier 4", "Relíquias Tier 6", etc). Fale claramente a quantidade e o tier das runas usadas.
5. Traduza perfeitamente e mostre o TIER (ex: "Tier 4 Espada Larga", "Tier 6 Capa da Morgana"). 

DIRETRIZES EXATAS DE FORMATAÇÃO (Deixe os dados bem fáceis de ler):
- Organize a lista de compras agrupando por Cidade.
- Para cada item recomendado, use o formato OBRIGATÓRIO:
  **[T<Tier>] <Nome em PT-BR>** (via <Compra Direta ou Pedido de Compra>)
  - **Custo Flat:** <Valor> Prata (Há <X> min)
  - **Venda BM:** <Valor> Prata (Há <X> min) | **Volume 24h:** <Z> vendidos
  - **Materiais Necessários:** <Quantidade>x <Runa/Alma/Relíquia> Tier <Y>.
  - **Lucro Líquido Real:** <Valor> Prata
- Crie um "Resumo Financeiro da Operação" no final, mostrando apenas a matemática principal: Custo Total das Flats e o Lucro Líquido Real esperado.`;

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
                  messages.map((msg, idx) => (
                    <div key={idx} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-sm relative">
                       <MarkdownMessage content={msg.text} />
                    </div>
                  ))
               )}
               <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
