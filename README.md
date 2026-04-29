# Aureus Market Analytics ⚖️💠

Uma ferramenta web profissional e avançada para jogadores de Albion Online, projetada para revelar as maiores oportunidades no **Mercado Negro (Black Market)** de Caerleon, calcular lucros de encantamento com precisão milimétrica, e fornecer análise estratégica através de recursos integrados de Inteligência Artificial.

---

## 📖 Visão Geral (Para Usuários)

Se você quer maximizar sua prata no Albion Online atuando como mercador especializado, refinador ou crafter, o **Aureus Market Analytics** foi feito para aposentar suas antigas planilhas. A ferramenta consome os dados atualizados gerados pela própria comunidade através do *Albion Online Data Project*, entregando indicativos claros do que comprar nas Cidades Reais, o que encantar e o que vender no Mercado Negro.

### 🌟 O que você pode fazer com esta ferramenta?
* **Oportunidades de Revenda (Arbitragem):** Descubra itens que estão sendo vendidos baratos nas Cidades Reais (Lymhurst, Martlock, Fort Sterling, Thetford, Bridgewatch) e que possuem ordens de compra altamente lucrativas no Mercado Negro.
* **Tracker de Encantamentos (Runas & Almas):** Monitore as cotações em tempo real para encontrar onde comprar os recursos necessários para evoluir os itens no seu inventário, extraindo o custo por unidade (Pedido vs Venda Direta).
* **Planejador Ativo (IA):** Informe quanto de prata e materiais você tem nas mochilas, e deixe nosso motor generativo analisar o mercado em tempo real e montar a melhor rota logística para suas vendas de madrugada.
* **Calculadora de Crafting Manual:** Calcule meticulosamente o lucro esperado inserindo manualmente o custo de base, preço de runas e extração de taxas Premium do Black Market.
* **Assistente GenAI Embutido:** Consulte dúvidas contextuais em uma janela de Chat Inteligente dedicada a gerar insights usando unicamente os números e variações reais que o motor do Aureus acabou de escanear na rede.
* **Relatórios na Nuvem:** Salve suas leituras de mercado e planos operacionais diretamente no banco de dados atrelado à sua Conta Google, podendo revisá-los depois mesmo em outro dispositivo.

---

## ⚙️ Visão Técnica (Para Desenvolvedores & Analistas)

O painel foi desenhado adotando um *design system* customizado usando Dark/Gold aesthetics, empregando controle denso de informações (tabelas comprimidas de forma limpa) com escalabilidade Cloud-Native, sendo altamente tolerante às limitações de redes de navegadores processando milhares de JSONs vindos por APIs abertas.

### 🛠 Stack Tecnológico
* **Framework:** Next.js 15+ (App Router) em topologia SPA focada num cliente rico.
* **Linguagem:** TypeScript.
* **Estilização:** Tailwind CSS v4 com propriedades aditivas via PostCSS e sistema de CSS Variables injetado nativamente:
  * `--mw-bg`, `--mw-card`, `--mw-border`, `--mw-gold-primary` (Theming padronizado para alta coesão visual).
* **Infraestrutura UI & Tipografia:** *Lucide-React* renderizando vetores de ícones e layouts focados em composição *Dashboard-like* de alta densidade sem perder respiro visual.
* **Inteligência Artificial:** SDK `@google/genai` realizando *parsing* de contexto financeiro convertido para blocos `Markdown`, capacitando inferência exata e sem delírios sobre o mercado do Albion em tempo de execução.
* **Data Storage & Auth (Serverless):** Firebase (Firestore) usando regras endurecidas com validação ABAC garantindo que dados PII não vazem e IDs sejam respeitados unicamente. Autenticação OAuth2 via Google.
* **Virtualização de Viewport:** Para mitigar *Dom-Trashing* ocasionado por pesquisas gerando milhares de TradeCards, utilizamos o `@tanstack/react-virtual` providenciando scroll de 60fps constantes até em displays mobile.

### 📡 Engenharia de Dados & Performance
1. **Arquitetura de Cache Resiliente (Memory Fallback/In-Memory Cache):**
   A API pública do Albion Online carrega megabytes em tempo real a cada call global. Para contornar disrupções de DOM local (`QuotaExceededError`), uma *Graceful Store* customizada limpa itens por TTL regular (`Map`-based), mantendo requisições o mais locais possível.
2. **Processamento Assíncrono Paralelo:**
   Combina o *Buy Order* em Caerleon com a tabela referencial de todas as variações de Encantamento nas Cidades Reais localizando brechas onde transformar `T4.0` em `T4.1` supera o custo somado das Runas contra a Venda do item flat.
3. **Escalonamento Backend:**
   Toda escrita salva, seja relatórios ou portfólios, invoca chaves restritivas usando o padrão Zero-Trust via Firebase Rules compilado pelo sistema de validações integradas. A IA só enxerga instantes em memória da tab de pesquisa, gerando privacidade by-design.

### 📂 Estrutura Principal de Diretórios
* `components/albion/`: Concentra a interface do MarketWeaver.
    * `VirtualizedResultsList.tsx`: Engine da listagem virtual do mercado.
    * `TradeCard.tsx`: Cartão complexo de balanço final apontando taxas reais, predições, e lucros cruzados.
    * `MaterialsTracker.tsx`: Visor focado num pool de informações e tendências de Artefatos de Encantamento.
    * `CraftingCalculator.tsx`: Módulo com simuladores embutidos que reordenam custo da base com as falhas.
* `lib/albion/`: Aglomerado algorítmico. Trata nomenclaturas dos Nodes do servidor (Regex stripping) e injeta descrições PT-BR legíveis (*Sapatos de Caçador*, etc).
* `lib/cache.ts`: Intercepta chamadas redundantes HTTP protegendo cotas mensais.
* `components/scan/`: Handlers UI atômicos para Input, Filters e Tiers (Barra superior de controles de parâmetros da varredura).

### 🚀 Setup Local
1. Tenha o *Node.js* e empacote as dependências básicas:
```bash
npm install
```
2. Crie/Popule o ambiente dentro de `.env` referenciando seu Database Firebase e sua Google GenAI key. A API roda localmente em `NEXT_PUBLIC` somente nas cascas necessárias.
3. Inicie o Server:
```bash
npm run dev
```

---

*Esta ferramenta consome de maneira otimizada e pacífica os dados expostos pela comunidade através do Albion Data Project. Faça a sua parte rodando o Albion Data Client por baixo de suas sessões de jogatina!*
