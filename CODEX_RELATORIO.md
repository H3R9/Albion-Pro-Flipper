# 🏰 CODEX Aureus Analytics - Arquitetura e Visão Global do Sistema

Bem-vindo ao **CODEX do Aureus Analytics**. Este documento foi completamente reescrito para refletir o estado atual avançado da nossa infraestrutura, que evoluiu de um simples scanner de mercado para uma suíte completa de ferramentas financeiras, de logística, refino e ilhas para o Albion Online.

---

## 🏛️ Arquitetura Técnica e Tecnologias

Nossa stack é moderna, baseada no ambiente seguro e escalável do React Next.js:

*   **Core:** Next.js 15 (App Router Server & Client Components) + React 19.
*   **Design System:** Tailwind CSS v4 com customizações em variáveis de ambiente (`CSS variables`) para temas escuros (`#0a0a0c`, `cyanPoder`, `goldPrimary`), adotando o modelo *Pixel Perfect* e design fluido/responsivo. UI construída com componentes Shadcn e ícones Lucide-React.
*   **Dados in-memory & API:** Consumo massivo e intensivo da *Albion Data Project API* (`/lib/albion/api.ts`). Processamento via Web Workers/Hooks (`useAlbionData`, `useScanLogic`), garantindo resiliência em falhas de API com algoritmos de Retries.
*   **Backend & Persistência:** Integração robusta com *Firebase* (Auth, Firestore) permitindo que perfis de usuários e análises longas sejam salvas em Cloud (`lib/firebase.ts`, `AuthProvider.tsx`).
*   **Performance Engine:** Renderização virtualizada de milhares de dados em tempo real (`@tanstack/react-virtual` em `VirtualizedResultsList.tsx`) e controle de estado unificado.
*   **Inteligência Artificial (Gemini):** Ferramentas analíticas potencializadas por Agentes GenAI integrados, ajudando usuários na tomada de decisões em mercados dinâmicos (`MaterialsAiChat`, `EnchantAiChat`).

---

## ⚙️ Módulos e Funcionalidades Core

O **Aureus Analytics** está dividido em pilares lógicos de atuação in-game:

### 1. Market Scanner (Scan de Análise de Trading)
O coração comercial da ferramenta, capaz de raspar oportunidades de arbitragem através do tempo e através das cidades de Albion.
*   **Análise de Flipping Direto:** Diferença entre Ordens de Venda (`sell orders`) e Ordens de Compra (`buy orders`).
*   **Crafting Oculto (Enchanting):** Analisa se vale a pena comprar itens de base limpos (`.0`) e usar Runas/Almas/Relíquias para promover até `.3 / .4` em busca de lucros marginais invisíveis a jogadores normais (`enchant-trades.ts`).
*   **Cards de Decisão Rápida (`TradeCard`):** Exibe de relance margens, ROI, cenários prospectivos de lucro (otimista, pessimista), gráficos de volume e confiabilidade do dado (*Data Quality*).

### 2. Painel de Construção e Trabalhadores de Ilhas (Island Hub)
Fatores microeconômicos de propriedades de jogadores.
*   **Laborers Profit Calculator:** Gerenciamento refinado de Diários de Trabalhadores (Cheios e Vazios). Cálculos probabilísticos baseados nos retornos de diários até T8.
*   **Fish Chopper (Mercado de Peixe):** Uma ferramenta matemática engenhosa que calcula a métrica crucial de comprar picar peixes, baseado na receita bruta do Molho de Peixe derivado vs O custo da matéria bruta de todos os rios/mares.

### 3. Engine Mestra de Refino (Refining Calculator)
Uma calculadora pixel-perfect que simula o sistema econômico profundo de refino.
*   **Destiny Board (Specs):** Implementação da regra matemática de *Foco de Refino*. Nível máximo ajustado para `100`. Bônus passivos cruzados: `+250` spec primária e `+30` em conexões da mesma árvore matemática.
*   **Eficiência e Silver / Foco:** Aplicação perfeita da equação de Focus Cost = `Base * 0.5 ^ (Eficiência / 10000)`, retornando com precisão centesimal a força (Silver/Focus) de cada operação.
*   **Logística em Cadeia:** Agrupamento coerente de custos que sangram lucros (Taxa de Estação % e Frete Transporte de Carga por Unidade e Cidades com bônus geográfico).

---

## 🚀 Estado do Desenvolvimento & Próximos Alvos

Atualmente a ferramenta se prova altamente madura, confiável matematicamente e sofisticada visualmente. Os esforços futuros (norteadores) de desenvolvimento englobam:

1.  **Macro-Gerenciamento de Multi-Contas no Firestore:** Criar um painel onde donos de Ilhas Multi-Contas logados via Firebase podem salvar suas baterias logísticas e rodá-las uma vez por dia sob novos preços da API.
2.  **Criação Customizada e Crafting:** Expandir o escopo do mercado de refinadores para os Crafters de Itens de Batalha (Blacksmiths, Tailors), englobando custos de Diários Vazios nas oficinas.
3.  **Black Market Dashboard Avançado:** Fazer o Scanner conversar ativamente com o comportamento errático do Mercado Negro, detectando ondas de compra massivas de itens específicos.

> *Este é o CODEX Master atual do Aureus Analytics. Ele reflete a verdade atual da aplicação. A escalabilidade foi garantida e o design modelado minuciosamente está estabelecido.*