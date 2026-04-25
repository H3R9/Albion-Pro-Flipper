import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Send, Bot, User, Sparkles, MessageSquareText } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '@/lib/utils';
import { TradeResult } from '@/lib/albion/analysis';
import { formatSilver } from '@/lib/albion/utils';
import { getItemFullName } from '@/lib/albion/items';
import { MarkdownMessage } from './MarkdownMessage';

interface EnchantAiChatProps {
  results: TradeResult[];
}

export function EnchantAiChat({ results }: EnchantAiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'model' | 'user'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Chave de API do Gemini (NEXT_PUBLIC_GEMINI_API_KEY) não configurada.");
      }

      const ai = new GoogleGenAI({ apiKey });

      // Create a context summary from the top 50 results
      const dataContext = results.slice(0, 50).map(r => {
        return `Oportunidade: Encantar ${getItemFullName(r.baseId || r.itemId)} para ${getItemFullName(r.itemId)} (Qualidade ${r.quality})
Item Base/Flat a comprar: ${r.baseMethod} em ${r.baseCity} por ${formatSilver(r.baseCost || 0)}
Materiais: ${r.runesRequired?.map(rune => `Comprar ${rune.amount}x ${rune.tier} ${rune.type} por ${formatSilver(rune.price)} (${rune.method} em ${rune.city})`).join(', ')}
Venda no Black Market: ${formatSilver(r.sellPrice)}
Lucro Estimado: ${formatSilver(r.profit)} (${r.margin}%)
`;
      }).join('\n');

      const systemInstruction = `Você é um estrategista do Mercado Negro (Black Market) de Albion Online. O jogador quer saber quais itens "flat" (.0) ou pouco encantados ele deve armar pedidos de compra agora (durante a madrugada).

DIRETRIZES DE FORMATAÇÃO:
- Separe sua reposta em tópicos e seções curtas (ex: use **Oportunidade 1:**).
- Use negrito (\`**\`) para destacar o nome de todos os itens e preços (Prata).
- Organize os passos como listas pontuadas ou numeradas.
- Seja objetivo e vá direto ao ponto, priorizando a legibilidade. Divirta-se um pouco adotando a persona de um goblin mercador calculista se quiser, mas mantenha a clareza. Use blocos de código ou emojis onde achar que melhore a leitura.

DADOS DE OPORTUNIDADES ATUAIS:
${dataContext}
`;

      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const contents = history.concat([{ role: 'user', parts: [{ text: userMessage }] }]);

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents,
        config: {
          systemInstruction,
          temperature: 0.2,
        }
      });

      const responseText = response.text || "Desculpe, não consegui analisar no momento.";
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Ocorreu um erro ao conectar com a IA analítica do mercado." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-900 font-bold rounded-xl transition border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] mt-4 w-full"
      >
        <Sparkles size={18} /> IA Analista: Estratégias para Madrugada (Buy Orders & Encantamentos)
      </button>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[500px] mb-6 relative z-10 w-full">
      <div className="bg-gradient-to-r from-slate-900 to-amber-900/20 px-4 py-3 border-b border-amber-500/20 flex justify-between items-center">
        <h3 className="font-bold text-amber-500 flex items-center gap-2">
          <Bot size={20} /> IA de Mercado: Estratégia de Encantamento
        </h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition text-sm font-bold"
        >
          Minimizar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 my-8 px-4 flex flex-col items-center">
            <Sparkles size={32} className="text-amber-500/50 mb-3" />
            <p className="mb-2 max-w-md text-slate-300 font-medium">Olá! Sou sua IA estrategista do Black Market.</p>
            <p className="max-w-md text-xs leading-relaxed">Posso analisar as oportunidades da lista abaixo e montar um plano de ação para a sua madrugada. Me pergunte coisas como: 
            <br/><br/><strong className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded">&quot;Quais itens flat devo colocar pedido de compra pra encantar depois?&quot;</strong></p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-amber-400" />
              </div>
            )}
            <div className={cn(
              "px-5 py-4 rounded-2xl max-w-[90%]",
              msg.role === 'user' 
                ? "bg-amber-600 text-white rounded-tr-sm shadow-md" 
                : "bg-slate-800/80 border border-slate-700/60 shadow-xl rounded-tl-sm w-full"
            )}>
              {msg.role === 'user' ? (
                msg.text
              ) : (
                <MarkdownMessage content={msg.text} />
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0">
                <User size={16} className="text-slate-300" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-amber-400" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-amber-500" /> <span className="text-slate-400">Analisando o mercado...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <div className="flex bg-[#0b0c10] border border-slate-700 rounded-lg overflow-hidden focus-within:border-amber-500 transition-colors">
          <input
            type="text"
            className="flex-1 bg-transparent px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 text-sm"
            placeholder="Pergunte sobre itens flat ou lucro potencial..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 text-amber-500 hover:bg-slate-800 disabled:opacity-50 transition"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
