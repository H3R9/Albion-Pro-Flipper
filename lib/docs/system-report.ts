export const SYSTEM_REPORT_MD = `
# 🏰 Aureus Analytics - Mega Análise do Sistema

Bem-vindo ao centro de comando e supervisão do **Aureus Analytics**. Este documento contém a retrospectiva completa do ecossistema de ferramentas que construímos para o mundo de Albion Online, sua arquitetura técnica, regras de domínio e um plano de voo robusto para o futuro. 

---

## 🧭 1. Resumo do Ecossistema Atual

Atualmente, o **Aureus Analytics** está dividido em duas grandes frentes operacionais (App Modes) através da nossa 'ArenaMenu':

### ⚔️ HUB de Operações (Scanner & Mercado)
O coração da aplicação. Oferece as ferramentas de mercado e inteligência artificial:
*   **Dashboard Executiva:** Visão rápida de performance da sessão, taxas de acerto de atualizações e métricas globais de lucro.
*   **Scanner do Mercado Negro (BM):** Varredura super-rápida cruzando preços das Cidades Reais com o Black Market (Caerleon). Com suporte para Tiers, Encantamentos e Qualidades. Retorna Lucro Bruto, ROI (%) e Oportunidades Frescas.
*   **Mercado de Materiais (Runas/Almas/Relíquias):** Uma aba especializada no tracking dos itens essenciais de encantamento e craft avançado.
*   **Inventário & Planejamento:** Gerenciamento baseado nas oportunidades escaneadas. Permite "salvar" itens rentáveis para tracking contínuo.
*   **Calculadora de Crafting:** Ferramenta dedicada para cálculos de retorno de materiais (Focus vs In-Focus) com base nas taxas de refino/craft.
*   **Assistente IA (EnchantAiChat):** Implementação do 'GoogleGenAI' permitindo consultar diretamente a IA sobre os itens escaneados ("Quais os mais rentáveis?", "Cidades mais favoráveis para transporte", etc).

### 🏝️ Construtor de Ilhas (Island Builder)
O planner de build mais robusto e detalhado:
*   **Tracking de Construções:** Suporta cálculo de materiais para Casas (T1-T8), Fazendas, Pastos.
*   **Resumo de Materiais Modular:** Exibe custos brutos (Troncos e Pedras), processados (Tábuas e Blocos) e a conversão do Peso Estimado com formatação (Ton, Kg).
*   **Engenharia de Trabalhadores (Laborers):** 
    *   Painel completo dos 11 Trabalhadores (Pescadores, Mercenários, Coleta de Minério, Lenhadores, Costureiros, etc).
    *   Cálculo preciso de Contratos, Camas, Mesas e Diários (Vazios e Cheios) de acordo com o tier do Empregado vs Acomodação (Tier da Casa).
    *   **Motor de Felicidade:** Cálculos assertivos sobre Troféus Gerais vs. Troféus Específicos. Conta com a resolução exaustiva de problemas (ex: Pescadores requerem "Troféu de Tubarão T7/Kraken T8" e a incapacidade de troféus específicos T2-T6, enquanto Gatherers regulares possuem todos os seus tiers naturais).

---

## 🛠️ 2. Arquitetura e Engenharia de Software

Nossa engine tem os seguintes pilares:
*   **Next.js 15 (App Router):** Roteamento moderno utilizando Client Components em áreas vitais interativas.
*   **Tailwind CSS + Tailwind v4:** Estilização responsiva. Uso severo das cores 'var(--mw-gold-*)' e 'var(--mw-bg)' promovendo visual Premium / Fantasy dark. 
*   **API Albion Data Project:** Consultando os endpoints '/api/v2/stats/prices/'. Implementamos Lógica 'Promise.allSettled' para segmentar grandes blocos de chamadas simultâneas sem dar gargalo ou timeout ('lib/albion/api.ts').
*   **Componentes Reutilizáveis:** Uso constante do pacote 'lucide-react' para ícones vetoriais fluidos e componentes sem-cabeça.
*   **Lógica Hook-centric:** 'useScanLogic.ts' gerencia toda a volumetria de processamento em tempo real do BM; 'useIslandMaterials.ts' e afins fragmentam e unificam a contabilidade da ilha.

---

## 🔭 3. Roadmap: Futuras Adições (What's Next?)

O ecossistema é estável, mas tem espaço astronômico para evoluir. Seguem as implementações alvos para o próximo ciclo:

1.  **Gráficos Históricos (Time-Series):**
    *   *O que é:* Inserir 'recharts' ou 'd3' no *Scanner* ou *Painel de Refino* para visualizar a tendência de preço dos itens nos últimos 7 ou 30 dias usando o sub-endpoint '/api/v2/stats/history'.
    *   *Ação Útil:* Permitir ao player ver se a "baixa" de mercado é histórica ou um crash temporário.
2.  **Tracking de Rotas de Transporte In-Game:**
    *   *O que é:* Criar uma ferramenta de *"Risk vs Reward"*. Calcular Oportunidades do Scanner para levar os itens por *Yellow Zone* vs *Red/Black Zone*, calculando lucro estimado vs taxa de morte no caminho.
3.  **Relatório de Refino Automatizado:**
    *   *O que é:* Ligar o Mercado de Materiais e a Calculadora em um novo Motor. Você diz o que tem na bolsa, ele acha a especialização na Black Zone vs Royal City mais barata no 'Data Project', com lucro líquido da conversão.
4.  **Sistema de Notificações Webhook/Discord:**
    *   *O que é:* Permitir o disparo de uma URL via webhook local na aba de configurações. Caso o sistema ache um item com ROI altíssimo, joga a notificação silenciosa fora da aba.
5.  **Suporte Global a Idiomas Exatos:**
    *   *O que é:* Melhorar o dicionário 'item-names.json', unificando a nomenclatura perfeitamente com os "nomes do cliente oficial" (Inglês, PT-BR e Espanhol) de forma modular.

---

## 🚨 4. Refinamentos Técnicos e Correções Pendentes

Use esse backlog para se orientar nas primeiras manutenções:

*   **[Throttling / Rate Limit]:** A API da comunidade do Albion (Albion Data Project) é sensível se pedirmos arrays com milhares de itens juntos. Precisamos implementar *Exponential Backoff* nas falhas 429 nas próximas atualizações.
*   **[Otimização de Renderização (Virtualized Lists)]:** 'VirtualizedResultsList.tsx' recebeu o plugin do TanStack, mas o React de vez em quando resmunga do ciclo de 'memoization'. Isso precisa de ajuste na cadeia de 'FilteredResults'.
*   **[Trabalhadores/Empregados - Mesas]:** A regra atual divide o número de trabalhadores por 3 para cada mesa, porém no T8 muitos decoradores afirmam que as mesas dão 'overlaps' distintos. Precisamos checar essa matemática e adicionar eventuais variações (se existentes).

---

> *"Informação é a relíquia mais valiosa de Albion, muito acima de qualquer metal T8."*

**Aureus Analytics v1.0.0** – Registrado e auditado para sucesso mercantil.
`;
