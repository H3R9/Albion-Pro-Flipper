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
    *   **Motor de Felicidade Inteligente:** Regras de felicidade matemáticas e exaustivas foram integradas.
        *   **Troféus Gerais:** Dá +5 de felicidade para **todos** os trabalhadores em cada tier disponível (do T2 ao Tier da Casa).
        *   **Troféus Específicos:** Dá +10 de felicidade para o trabalhador específico em cada tier possível (do T2 ao Tier da casa).
        *   **Restrições e Exceções Rigorosas:** 
            *   *Artesões (Ferreiro, Flecheiro, Embutidor, Funileiro)*: NÃO possuem troféus específicos! Limite máximo de felicidade vindo de troféus gerais (+5 por tier) e da *Luneta do Explorador* (+5).
            *   *Pescadores e Tubarão*: Possuem Troféus Gerais (+5), Troféus Específicos do Pescador (+10) e suportam o *Troféu de Tubarão T8* (mais +5).
            *   A lógica agora prevê a Luneta do Explorador para compensar e os limites de slot de móveis vs quantidade de troféus.

---

## 🛠️ 2. Arquitetura e Engenharia de Software

Nossa engine tem os seguintes pilares:
*   **Next.js 15 (App Router):** Roteamento moderno utilizando Client Components em áreas vitais interativas.
*   **Tailwind CSS + Tailwind v4:** Estilização responsiva. Uso severo das cores 'var(--mw-gold-*)' e 'var(--mw-bg)' promovendo visual Premium / Fantasy dark. 
*   **API Albion Data Project:** Consultando os endpoints '/api/v2/stats/prices/'. Implementamos Lógica 'Promise.allSettled' para segmentar grandes blocos de chamadas simultâneas sem dar gargalo ou timeout ('lib/albion/api.ts').
*   **Componentes Reutilizáveis:** Uso constante do pacote 'lucide-react' para ícones vetoriais fluidos e componentes sem-cabeça.
*   **Lógica Hook-centric:** 'useScanLogic.ts' gerencia toda a volumetria de processamento em tempo real do BM; 'useIslandMaterials.ts' e afins fragmentam e unificam a contabilidade da ilha.

---

## 🚀 3. Conquistas Recentes (Update Maio/2026)

Implementações vitais que revolucionaram a ferramenta:
1. **Engenharia de Slots e Felicidade de Troféus (Laborers):** Refizemos do zero o motor de exibição de itens na Casa/Guildhall. Agora existe priorização! Se a casa ou o salão possui 10 e 14 slots respectivamente, o script injeta proativamente do Tier mais alto para o mais baixo priorizando Troféus Específicos (que dão mais felicidade). Regras especiais para *Artesanos* e os troféus *Tubarão* e *Luneta do Explorador* foram modeladas perfeitamente.
2. **Otimização Extrema de Renderização (Virtualized Lists):** O cálculo intensivo do multiplicador de \`scoreFlip\` foi removido inteiramente da pipeline do React UI (\`VirtualizedResultsList.ts\`) e movido para a sub-rotina bruta do fetcher (\`lib/albion/useAlbionData.ts\`). O resultado: *Zero lag e travamentos mesmo com 5.000+ cards processados na tela ao vivo*.
3. **Gráficos Históricos Interativos (Time-Series):** Adição avançada da macro-viziualização da biblioteca \`recharts\` internamente nos TradeCards usando Componente de Sparklines. Ele lê pontos das últimas horas (até 48h) diretamente nos cards expandidos, evitando dados cegos (bull-traps).
4. **Automação via Webhooks (Discord/Telegram):** Agora é possível passar uma URL secreta nas Configurações. Assim que a \`ScanLogic\` cruza a meta do "Lucro Absoluto", ela empurra silenciosamente o payload completo para o canal do usuário via Webhook externo com visual formatado.

---

## 🔭 4. Roadmap: Futuras Adições (What's Next?)

O ecossistema é estável, mas tem espaço astronômico para evoluir:

1.  **Tracking de Rotas de Transporte In-Game:**
    *   *O que é:* Criar uma ferramenta de *"Risk vs Reward"*. Calcular Oportunidades do Scanner para levar os itens por *Yellow Zone* vs *Red/Black Zone*, calculando lucro estimado vs taxa de morte no caminho.
2.  **Relatório de Refino Automatizado:**
    *   *O que é:* Ligar o Mercado de Materiais e a Calculadora em um novo Motor. Você diz o que tem na bolsa, ele acha a especialização na Black Zone vs Royal City mais barata no 'Data Project', com lucro líquido da conversão.
3.  **Suporte Global a Idiomas Exatos:**
    *   *O que é:* Melhorar o dicionário 'item-names.json', atualizando com constância e unificando a nomenclatura perfeitamente com os "nomes do cliente oficial" (Inglês, PT-BR e Espanhol) de forma modular.

---

## 🚨 5. Refinamentos Técnicos e Correções Pendentes

Use esse backlog para se orientar nas primeiras manutenções:

*   **[Throttling / Rate Limit Estrutural]:** O *Batch Volume* já foi otimizado para não enforcamentos de fetch, mas ainda requer *Exponential Backoff* rígido para Scans profundos onde múltiplas qualidades e itens simultâneos superem a marca de 5 mil items na fila TCP.
*   **[Trabalhadores/Empregados - Mesas]:** A regra atual divide o número de trabalhadores por 4 para cada mesa para as Casas, e para os Salões de Guildas usam cálculos de acomodações até 15 labourers. A lógica está robusta mas pode ganhar novos edge cases perante ao setup Meta.

---

> *"Informação combinada com conhecimento exato de Craft e Ilha é a relíquia mais valiosa de Albion, muito acima de qualquer metal T8."*

**Aureus Analytics v1.2.0** – Registrado e auditado para sucesso mercantil pleno e engenharia imobiliária otimizada.
`;

