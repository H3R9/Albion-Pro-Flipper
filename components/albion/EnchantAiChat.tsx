import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Send, Bot, User, Sparkles, MessageSquareText } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '@/lib/utils';
import { TradeResult } from '@/lib/albion/types';
import { formatSilver } from '@/lib/albion/utils';
import { getItemFullName } from '@/lib/albion/items';
import { MarkdownMessage } from './MarkdownMessage';

interface EnchantAiChatProps {
  results: TradeResult[];
  settings: { maxAge: number, minProfit: number, minMargin: number };
}

export function EnchantAiChat({ results, settings }: EnchantAiChatProps) {
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

      const dataContextRaw = {
        timestamp: new Date().toISOString(),
        serverRegion: "West (Américas/Europa)",
        marketSnapshot: {
          totalOpportunitiesFound: results.length,
          config: {
            maxAgeMinutes: settings.maxAge,
            minMargin: settings.minMargin,
            minProfit: settings.minProfit,
          },
          topItems: results.slice(0, 15).map(r => ({
            itemId: r.itemId,
            itemName: getItemFullName(r.itemId),
            quality: r.quality,
            baseCost: r.baseCost,
            baseCity: r.baseCity,
            baseMethod: r.baseMethod,
            runesCost: r.runesRequired?.reduce((acc, rune) => acc + (rune.price * rune.amount), 0) || 0,
            sellPrice: r.sellPrice,
            grossProfit: r.profit,
            netProfit: Math.floor(r.profit - (r.sellPrice * 0.045)),
            margin: r.margin,
            dataAgeMinutes: r.worstAge,
            runeDetails: r.runesRequired,
            score: r.flipScore?.totalScore || 'N/A',
            recommendation: r.flipScore?.recommendation || 'N/A'
          }))
        }
      };

      const systemInstruction = `Você é ARIA (Albion Real-time Intelligence Analyst), uma IA especialista em economia de Albion Online com profundo conhecimento de:
- Mecânicas de flipping no Black Market de Caerleon
- Cálculo de ROI considerando: taxa do mercado (4.5% padrão), custo de viagem, risco de competição, e volatilidade de preços
- Estratégias de encantamento (Runes, Souls, Relics) e quando vale o investimento
- Timing de mercado: horários de pico (EU: 19h-23h, NA: 01h-04h UTC)
- Categorias de itens mais lucrativas por tier

Quando receber dados de mercado, SEMPRE estruture sua análise assim:

1. 🏆 TOP PICKS (máx 5): Itens com maior score combinado de lucro + viabilidade
2. ⚠️ ALERTAS: Oportunidades que vão expirar logo (dados com idade > 20min)
3. 📊 DIAGNÓSTICO DE MERCADO: Qual categoria está aquecida hoje
4. 💡 ESTRATÉGIA SUGERIDA: Rota específica de cidades para maximizar o dia
5. 🔢 MÉTRICAS: ROI%, lucro/hora estimado, capital mínimo recomendado

Para cada item TOP PICK, forneça:
- Nome do item e tier/encantamento
- Cidade de compra → Cidade de venda
- Lucro bruto → Lucro líquido (após taxa 4.5%)
- Score de confiança (1-10) baseado na idade dos dados
- Aviso de risco se aplicável

NUNCA sugira flips sem calcular o lucro líquido real. NUNCA ignore a taxa do mercado nos cálculos.

DADOS REAIS DA PLATAFORMA EM JSON A SEREM ANALISADOS:
${JSON.stringify(dataContextRaw, null, 2)}
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
        className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--mw-gold-primary)] hover:bg-[var(--mw-gold-bright)] text-black font-bold uppercase tracking-widest text-sm rounded-xl transition shadow-md w-full"
      >
        <Sparkles size={18} /> IA Analista: Estratégias para Madrugada
      </button>
    );
  }

  return (
    <div className="bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded-xl overflow-hidden shadow-2xl flex flex-col h-[500px] mb-6 relative z-10 w-full">
      <div className="bg-[var(--mw-card)] px-4 py-3 border-b border-[var(--mw-border)] flex justify-between items-center">
        <h3 className="font-bold text-[var(--mw-gold-bright)] flex items-center gap-2 uppercase tracking-widest text-sm">
          <Bot size={20} /> IA de Mercado: Estratégia de Encantamento
        </h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-[var(--mw-text-muted)] hover:text-[var(--mw-text-main)] px-2 py-1 rounded hover:bg-[var(--mw-card-hover)] transition text-sm font-bold uppercase tracking-wider"
        >
          Minimizar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm bg-[var(--mw-bg)]">
        {messages.length === 0 && (
          <div className="text-center text-[var(--mw-text-muted)] my-8 px-4 flex flex-col items-center">
            <Sparkles size={32} className="text-[var(--mw-gold-dark)] mb-3" />
            <p className="mb-2 max-w-md text-[var(--mw-text-main)] font-medium">Olá! Sou sua IA estrategista do Black Market.</p>
            <p className="max-w-md text-sm leading-relaxed text-[var(--mw-text-muted)]">Posso analisar as oportunidades da lista abaixo e montar um plano de ação para a sua madrugada. Me pergunte coisas como: 
            <br/><br/><strong className="text-[var(--mw-text-main)] bg-[var(--mw-card)] border border-[var(--mw-border)] px-2 py-1 rounded shadow-inner block">&quot;Quais itens flat devo colocar pedido de compra pra encantar depois?&quot;</strong></p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded bg-[var(--mw-gold-primary)]/20 border border-[var(--mw-gold-dark)] flex items-center justify-center shrink-0">
                <Bot size={16} className="text-[var(--mw-gold-bright)]" />
              </div>
            )}
            <div className={cn(
              "px-5 py-4 rounded-2xl max-w-[90%]",
              msg.role === 'user' 
                ? "bg-[var(--mw-gold-dark)] text-[var(--mw-text-main)] rounded-tr-sm shadow-md" 
                : "bg-[var(--mw-card)]/80 border border-[var(--mw-border)] shadow-xl rounded-tl-sm w-full"
            )}>
              {msg.role === 'user' ? (
                msg.text
              ) : (
                <MarkdownMessage content={msg.text} />
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded bg-[var(--mw-card)] border border-[var(--mw-border)] flex items-center justify-center shrink-0">
                <User size={16} className="text-[var(--mw-text-muted)]" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded bg-[var(--mw-gold-primary)]/20 border border-[var(--mw-gold-dark)] flex items-center justify-center shrink-0">
              <Bot size={16} className="text-[var(--mw-gold-bright)]" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[var(--mw-card)] border border-[var(--mw-border)] text-[var(--mw-text-main)] rounded-tl-sm flex items-center gap-2 shadow-inner">
              <Loader2 size={16} className="animate-spin text-[var(--mw-gold-primary)]" /> <span className="text-[var(--mw-text-muted)]">Analisando o mercado...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-[var(--mw-card)] border-t border-[var(--mw-border)]">
        <div className="flex bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded-lg overflow-hidden focus-within:border-[var(--mw-gold-primary)] transition-colors">
          <input
            type="text"
            className="flex-1 bg-transparent px-4 py-3 text-[var(--mw-text-main)] outline-none placeholder:text-[var(--mw-text-muted)] text-sm"
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
            className="px-4 text-[var(--mw-gold-bright)] hover:bg-[var(--mw-card-hover)] disabled:opacity-50 transition"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
