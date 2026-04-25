import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Send, Bot, User, Sparkles } from 'lucide-react';
import { MaterialData } from './MaterialsTracker';
import { GoogleGenAI } from '@google/genai';
import { cn } from '@/lib/utils';
import { formatSilver } from '@/lib/albion/utils';
import { MarkdownMessage } from './MarkdownMessage';

interface MaterialsAiChatProps {
  materialsData: MaterialData[];
}

export function MaterialsAiChat({ materialsData }: MaterialsAiChatProps) {
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

      // Create a context summary from the data
      const dataContext = materialsData.map(m => {
        return `Item: ${m.name} (ID: ${m.itemId}, Tier: ${m.tier})
Melhor Venda Direta: ${m.bestDirectPrice < Infinity ? `${formatSilver(m.bestDirectPrice)} em ${m.bestDirectCity}` : 'Indisponível'}
Melhor Pedido de Compra: ${m.bestOrderPrice < Infinity ? `${formatSilver(m.bestOrderPrice)} em ${m.bestOrderCity}` : 'Indisponível'}
`;
      }).join('\n');

      const systemInstruction = `Você é um analista de mercado do Albion Online focado em Runas, Almas e Relíquias.
Sua função é aconselhar o jogador sobre as melhores cidades para colocar pedidos de compra ou fazer vendas diretas com base nos Fatos Atualizados Fornecidos.

DIRETRIZES DE FORMATAÇÃO:
- Estruture a resposta com cabeçalhos (\`###\`) e tópicos claros.
- Use **negrito** obrigatoriamente para destacar Preços, Nomes de Cidades e Nomes de Itens.
- A resposta deve ser extremamente fácil de ler num piscar de olhos (use listas \`-\`).
- Evite blocos de texto muito grandes ou parágrafos densos.

DADOS ATUAIS DO MERCADO:
${dataContext}
`;

      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const chat = ai.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
          systemInstruction,
          temperature: 0.2, // Be somewhat deterministic
        }
      });

      // Send the whole history and the new message? No wait, chat instances don't initialize with history in v3 quite like before unless defined in the constructor maybe, we can just use generateContent with history.
      // Wait, let's look up how to pass history in @google/genai or just pass raw history array
      // Actually, if we use chat.sendMessageStream, we can just map messages, but initializing it with history isn't clear from the snippet. Let's just use ai.models.generateContent containing the entire conversation.
      
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
      setMessages(prev => [...prev, { role: 'model', text: "Ocorreu um erro ao conectar com o mercado. Verifique se a chave de API está configurada adequadamente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-900 font-bold rounded-xl transition border border-amber-400 shadow-xl mt-4 w-full sm:w-auto"
      >
        <Sparkles size={18} /> Conselheiro IA de Encantamentos
      </button>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl overflow-hidden mt-6 shadow-2xl flex flex-col h-[500px]">
      <div className="bg-gradient-to-r from-slate-900 to-amber-900/20 px-4 py-3 border-b border-amber-500/20 flex justify-between items-center">
        <h3 className="font-bold text-amber-500 flex items-center gap-2">
          <Bot size={20} /> IA de Mercado: Análise de Runas & Almas
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
            <p className="mb-2 max-w-md">Olá! Sou seu conselheiro do Mercado de Encantamentos.</p>
            <p className="max-w-md">Posso analisar as cotações em tempo real da tabela e te dizer e sugerir as melhores cidades para criar pedidos de compra para Runas, analisar margens ou calcular o custo de transformar itens.</p>
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
            className="flex-1 bg-transparent px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500"
            placeholder="Ex: Qual a melhor cidade para pedir Runas T4 agressivamente?"
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
