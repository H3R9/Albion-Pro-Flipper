# 🏰 CODEX Aureus Analytics - Mega Análise do Sistema & Plano de Melhorias

Bem-vindo ao centro de comando e supervisão do **Aureus Analytics**. Este documento contém a análise profunda do sistema, sua arquitetura técnica e um plano de ataque estruturado para implementarmos as "Melhorias Significativas" solicitadas.

---

## 🔎 Análise Profunda do Sistema Atual (Auditoria)

Após uma imersão profunda no ecossistema atual (Next.js 15, Tailwind v4, Albion Data API, Firebase), identificamos os seguintes pontos críticos e oportunidades de melhoria:

### 1. Gargalos de Performance e Renderização
*   **A "Dor" do React (Ciclo de Memoization):** O componente `VirtualizedResultsList.tsx` recebe os resultados (`results`) e realiza um `useMemo` com `scoreFlip()` aplicando matemática iterativa sob centenas/milhares de itens a cada nova listagem. Isso pesa no *Main Thread* do navegador do usuário.
*   *Solução:* Transferir toda a responsabilidade de *Scoring* (`flipScore`) para o Worker/Engine na etapa de Análise (`lib/albion/analysis.ts`). A UI deve receber o dado mastigado e se preocupar apenas em pintar na tela a lista virtualizada.

### 2. Gerenciamento de Estado Monolítico
*   **O "God Hook":** O `useScanLogic.ts` está assumindo responsabilidades demais (controles de UI, filtros, settings, trigger de refresh, notificações, etc.). 
*   *Solução:* A longo prazo, a ferramenta se beneficiaria absurdamente da introdução de uma library state-manager leve (como **Zustand**), removendo a sobrecarga do React Context/Prop Drilling e dividindo os estados de *Market*, *Island* e *Settings* em mini-stores independentes.

### 3. Rate Limits e Carga de API
*   **Throttling API Comunitária:** Atualmente temos um `fetchWithMutex` com delays estáticos e um fallback para `Retry-After`. Quando pedimos milhares de itens de uma só vez para a API do Albion Data Project, o servidor pode nos recusar.
*   *Solução:* Implementação de uma esteira assíncrona mais agressiva, processando em Background Tasks com limites estritos (Rate Limiter nativo). O *Batch Volume* já foi otimizado para requisições rápidas de volume24h de até 2000 items em ~4 segundos.

### 4. Inteligência Visual (Gráficos e Time-Series)
*   **Dados Frios vs. Tendências:** Temos o `fetchPriceTrend`, mas o usuário só vê o dado atual e uma seta, não confia instintivamente na mudança de preço.
*   *Solução:* Introduzir as bibliotecas gráficas avançadas (`Recharts`) no interior do `TradeCard` para plotar um mini-gráfico (Sparkline) de 24h ou 7-dias.

---

## 🚀 Plano de Melhorias Significativas (Execução Sugerida)

Com base na auditoria, proponho realizar as seguintes melhorias na aplicação (passo a passo):

### Passo 1: Otimização Extrema (Refatoração do Motor de Score)
*   Remover a lógica do `scoreFlip` e `adjustedProfit` da camada visualização (`VirtualizedResultsList.tsx`).
*   Aplicar o Score diretamente nas rotinas de `analyzeBlackTrades`, `analyzeRoyalBM`, etc.
*   **Benefício:** O React não vai mais "resmungar", a rolagem dos cards na tela ficará fixa em 60 a 120 frames por segundo, não importando se houver 5.000 resultados na tela.

### Passo 2: Webhooks Automatizados Inteligentes (Discord/Telegram)
*   Adicionar campo `Webhook URL` no menu de configurações (`SettingsDashboard`).
*   No motor de Notificações, ao cruzar o limite `alertSettings.minProfit`, efetuar um POST invisível do Payload direto pro Discord com Rich Embed de cores baseado na raridade/lucro do item.
*   **Benefício:** O usuário poderá fechar a aba principal e apenas aguardar as notificações chegarem em seu celular no canal privado no Telegram/Discord.

### Passo 3: Introdução Visual em Alta Fidelidade Gráfica (Histórico de Trading)
*   Expandir as informações detalhadas em de *TradeCard* e exibir Mini Gráficos (Sparklines) do comportamento do mercado nas últimas X horas.
*   **Benefício:** Maior precisão para o Player tomar decisão se a alta do item era especulativa no dia anterior ou real.

### Passo 4: Refatoração da Camada de Configuração e Persistência
*   Isolamento e centralização do LocalStorage (`usePersistedState`) num ambiente mais estrito (Zustand ou Hooks divididos para Settings e Engine). 

---

> *Este CODEX será a fonte primária da verdade técnica desta Ferramenta de Análise do Albion. A partir desta análise profunda, podemos começar a executar as modificações na sequência acima!*
