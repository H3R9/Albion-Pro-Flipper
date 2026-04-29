# Albion Market Pro ⚔️🛡️

Uma ferramenta web avançada para jogadores de Albion Online, projetada para revelar oportunidades no **Mercado Negro (Black Market)**, calcular lucro de encantamento e fornecer análise inteligente de mercado através de recursos integrados de Inteligência Artificial.

---

## 📖 Visão Geral (Para Usuários)

Se você quer maximizar sua prata no Albion Online atuando como mercador, refinador ou crafter, o **Albion Market Pro** vai aposentar a sua velha planilha do Excel. A ferramenta puxa os preços atualizados informados pela própria comunidade através do pacote *Albion Online Data Project* e te diz com clareza o que comprar, refinar ou vender.

### 🌟 O que você pode fazer com esta ferramenta?
* Oportunidades de Revenda (Arbitragem): Descubra itens que estão sendo vendidos barato nas Cidades Reais (Lymhurst, Martlock, Fort Sterling, etc.) e que o Mercado Negro de Caerleon está comprando muito mais caro.
* Planejador de Inventário e Encantamento: Vale a pena comprar Runas e Almas para subir o item do .0 para o .1 ou .2 antes de ir para Caerleon? A ferramenta faz a conta do custo das runas vs. aumento de preço e te dá a resposta (ROI).
* Calculadora de Crafting Manual: Calcule meticulosamente o lucro esperado inserindo manualmente o custo de aquisição da base, preço das runas e as taxas do mercado negro, incluindo configuração de taxa de falha para testes avançados.
* Assistente de Inteligência Artificial: Converse com a IA (alimentada pelo Gemini) analisando relatórios do mercado com dicas geradas apenas baseadas nos números reais que o sistema encontrou para você.
* Salvar Relatórios: Encontrou um pote de ouro? Salve o relatório detalhado e guarde no seu painel para não esquecer suas estratégias diárias – seus dados e acesso são protegidos de forma segura e pessoal.

---

## ⚙️ Visão Técnica (Para Desenvolvedores & Analistas)

A aplicação foi modernamente arquitetada empregando escalabilidade na nuvem (SPA assíncrona) e robustez frente as massivas requisições de dados da economia procedural do jogo.

### 🛠 Stack Tecnológico
* Framework: Next.js 15+ (App Router) em topologia SPA focada no Cliente.
* Linguagens: TypeScript puro e estrito.
* Estilização: Tailwind CSS v4 para composição fluida / adaptativa, integrado de modo direto e animações limpas via `motion` (Framer Motion).
* Ícones & Interface: *Lucide-React* e UI unificada orientada sob princípios ágeis de composição componentizada (Semelhante a componentes shadcn).
* Inteligência Artificial: SDK Oficial `@google/genai` realizando *parsing* de JSONs de estatística do Albion em contexto textual *LLM-ready*.
* Armazenamento & Autenticação: Firebase (Firestore para preservação persistente dos relatórios dos usuários e metadados com regras de segurança granulares, e Auth para login social seguro).
* Virtualização (Performance): Por possuir dezenas de milhares de itens consultáveis, emprega `@tanstack/react-virtual` que recicla os nós do DOM ao invés de inseri-los linearmente.

### 📡 Engenharia de Dados & Performance
1. Arquitetura de Cache Resiliente (Memory Fallback)
   A API pública do Albion Online Data transporta *payloads* densos, que muitas vezes estouram a cota de 5MB do `localStorage` nos navegadores móveis e desktops configurados estritamente. Implementamos um mecanismo `lib/cache` híbrido *graceful fallback*: caso a política `QuotaExceededError` dispare dentro do navegador, o fluxo transparente redireciona para um `Map()` estritamente alocado em memória local da sessão, limpando os detritos de tempo com regex dinâmico de chaves e TTL.

2. Consultas Encadeadas (Data Stitching)
   Nenhuma predição de arbitragem no Albion é possível sem o triângulo de informações: O Custo Base + O Custo de Encantamento + A Oferta/Sua Tributação no Mercado Negro. O sistema paraleliza requisições *client-side* filtrando metadados de *Buy Orders* ativas no "Black Market" contra *Sell Orders* mínimas no cluster 'Royal'. 

3. Rulesets do Firestore Hardened
   Garantia Total Zero-Trust: Sem acessos generalizados às collections. Relatórios salvos ativam validadores (`handleFirestoreError` hooks & robust `firestore.rules`). Escritas são aceitas apenas para autenticados onde cada schema injeta integridade em campos de tempo (`request.time`) e id de proprietário (`request.auth.uid`), frustrando vetores de espelhos falsos.

### 📂 Estrutura Principal dos Diretórios (Highlights)
* `components/albion/`: Concentra todo o complexo atômico de visualização financeira, incluindo:
    * `CraftingCalculator.tsx` - Calculadora manual avançada de taxas.
    * `TradeCard.tsx` - Box visual indicativo se a troca (com/sem enchanting) é altamente lucrativa.
    * `VirtualizedResultsList.tsx` - Engine que previne estrangulamento da janela (Window choke) no DOM para listas espessas.
    * `SavedReports.tsx` - Consome coleções do NoSQL para renderização assíncrona.
* `lib/albion/`: Helpers matematicamente puros lidando com contagem de recursos via *item strings* gerados procedimentalmente, lógicas de limpeza (`sanitize.ts`) de nomes crus do servidor.
* `lib/cache.ts`: Cache de múltiplas camadas adaptativo recém escrito que trata a volumetria imensa dos itens do game evitando re-fecth indevido gerando penalidades no servidor externo.

### 🚀 Rodando o Projeto Localmente
1. Tenha o *Node.js* atualizado e empacote as dependências:
```bash
npm install
```
2. Instancie e popule o arquivo `.env` (Siga as orientações em `.env.example`) integrando sua Cloud, seu Firebase e o seu acessório Gemini API.
3. Suba o server de desenvolvimento:
```bash
npm run dev
```

---

*Esta ferramenta consome os dados expostos pelos brilhantes organizadores das ferramentas do Albion Data Project. Agradeça suportando o client deles em plano de fundo nos computadores enquanto você joga!*
