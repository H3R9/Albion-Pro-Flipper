import React from 'react';
import { Card } from '@/components/ui/Card';
import { Flame, ShieldAlert, Target, Book, LayoutDashboard, ArrowUpCircle, Info, Zap } from 'lucide-react';

export function RefiningDashboard() {
  return (
    <div className="space-y-12 animate-fade-in pb-20 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 w-fit">
          <Flame size={14} className="text-orange-400" />
          <span className="text-sm font-bold uppercase tracking-widest text-orange-400">Guia Econômico Completo - V2.0</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-wider text-[var(--mw-text-main)] mt-2">
          Guia de <span className="text-orange-500">Refino</span>
        </h1>
        <p className="text-[var(--mw-text-muted)] text-base max-w-2xl mx-auto leading-relaxed">
          T2 ao T8 | Encantados | Foco | Destiny Board | Transmutação | Journals | Hideouts | Black Market. Baseado nos dados oficiais rigorosos de 2026.
        </p>
      </div>

      {/* Seção 1 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--mw-gold-bright)] flex items-center gap-2">
          <span className="text-[var(--mw-text-muted)] font-mono text-sm">01</span> Introdução à Economia do Refino
        </h2>
        <Card className="p-6 space-y-4">
          <p className="text-[var(--mw-text-main)]">
            O refino é o segundo estágio da cadeia produtiva de Albion, convertendo o recurso bruto (coletado) em produto manufaturado (para uso de crafters). O circuito é: <strong>Coleta → Refino → Fabricação → Mercado</strong>.
          </p>
          <p className="text-[var(--mw-text-main)]">
            É a atividade mais estável de geração de prata. Baixo risco (zonas seguras), escalabilidade monstruosa e demanda ditada diretamente pelo <strong className="text-rose-400">Black Market</strong> e PvP Red/Black zone.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-[#151518] p-4 rounded border border-white/5">
              <p className="text-sm text-white/50 uppercase tracking-widest mb-1">Capital T4</p>
              <p className="text-lg font-bold text-white">50k - 200k <span className="text-sm">prata</span></p>
            </div>
            <div className="bg-[#151518] p-4 rounded border border-white/5">
              <p className="text-sm text-white/50 uppercase tracking-widest mb-1">Capital T5</p>
              <p className="text-lg font-bold text-white">200k - 1M <span className="text-sm">prata</span></p>
            </div>
            <div className="bg-[#151518] p-4 rounded border border-[var(--mw-gold-primary)]/30">
              <p className="text-sm text-[var(--mw-gold-bright)] uppercase tracking-widest mb-1">Capital T6</p>
              <p className="text-lg font-bold text-[var(--mw-gold-bright)]">1M - 5M <span className="text-sm">prata</span></p>
            </div>
            <div className="bg-orange-500/10 p-4 rounded border border-orange-500/30">
              <p className="text-sm text-orange-400 uppercase tracking-widest mb-1">Capital T7/T8</p>
              <p className="text-lg font-bold text-orange-400">5M+ <span className="text-sm">prata</span></p>
            </div>
          </div>
          <div className="bg-[var(--mw-bg)] border-l-4 border-emerald-500 p-4 rounded-r mt-4">
            <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-1">Perfil Ideal</p>
            <p className="text-[var(--mw-text-muted)] text-sm">Jogadores com <strong>Premium Ativo</strong>, focados em cálculos e planilhas, operando principalmente com Buy Orders para matar a margem comissão. </p>
          </div>
        </Card>
      </section>

      {/* Seção 2 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--mw-gold-bright)] flex items-center gap-2">
          <span className="text-[var(--mw-text-muted)] font-mono text-sm">02</span> Os 5 Tipos de Refino e Cidades Bônus
        </h2>
        <Card className="p-6 overflow-hidden space-y-4">
          <p className="text-[var(--mw-text-main)] mb-2">
            O jogo recompensa os refinos nas cidades de biomas opostos ao recurso bruto, forçando a atividade de comércio pelo Royal Continent.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-[var(--mw-text-muted)] uppercase tracking-widest font-bold">
                  <th className="p-3">Refino / Estação</th>
                  <th className="p-3">Bruto → Refinado</th>
                  <th className="p-3">Cidade Bônus</th>
                  <th className="p-3">Usado Para</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium text-amber-500">Fundição (Smelter)</td>
                  <td className="p-3">Minério (Ore) → Barra (Bar)</td>
                  <td className="p-3 font-bold text-purple-400">Thetford</td>
                  <td className="p-3 text-white/50">Pesadas (Armadura, Espadas)</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium text-orange-400">Curtimento (Tanner)</td>
                  <td className="p-3">Pele (Hide) → Couro (Leather)</td>
                  <td className="p-3 font-bold text-cyan-400">Martlock</td>
                  <td className="p-3 text-white/50">Médias (Botas, Arco, Adaga)</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium text-green-500">Tecelagem (Weaver)</td>
                  <td className="p-3">Fibra (Fiber) → Tecido (Cloth)</td>
                  <td className="p-3 font-bold text-emerald-500">Lymhurst</td>
                  <td className="p-3 text-white/50">Leves (Magos, Healers)</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium text-amber-700">Madeireira (Sawmill)</td>
                  <td className="p-3">Madeira (Wood) → Tábua (Plank)</td>
                  <td className="p-3 font-bold text-gray-200">Fort Sterling</td>
                  <td className="p-3 text-white/50">Cajados, Arcos e Arrombos</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium text-stone-400">Corte de Pedra (Stonemason)</td>
                  <td className="p-3">Pedra (Rock) → Bloco (Block)</td>
                  <td className="p-3 font-bold text-orange-500">Bridgewatch</td>
                  <td className="p-3 text-white/50">Guild Halls, Islands e Towns</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Seção 3 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--mw-gold-bright)] flex items-center gap-2">
          <span className="text-[var(--mw-text-muted)] font-mono text-sm">03</span> Lógica de Produção Sub-Recursos
        </h2>
        <Card className="p-6 space-y-4">
          <p className="text-[var(--mw-text-main)]">
            Diferentemente do Craft T2 que é processado livre, tudo <strong>a partir do T3 exige que o recurso refinado imediatamente abaixo atue como Sub-Recurso/fermento.</strong>
          </p>
          <div className="overflow-x-auto border rounded border-white/10 mt-4">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-white font-bold tracking-widest uppercase">
                  <th className="p-3">Tier Destino</th>
                  <th className="p-3">Bruto (Entrada)</th>
                  <th className="p-3 text-sky-400">Sub-Recurso (Refinado T-1)</th>
                  <th className="p-3">Saída</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr><td className="p-3 border-r border-white/5">Tier 2</td><td className="p-3">2 brutos T2</td><td className="p-3 text-white/20">-</td><td className="p-3">1 refinado T2</td></tr>
                <tr><td className="p-3 border-r border-white/5">Tier 3</td><td className="p-3">2 brutos T3</td><td className="p-3 font-bold text-sky-400">1 refinado T2</td><td className="p-3">1 refinado T3</td></tr>
                <tr><td className="p-3 border-r border-white/5">Tier 4</td><td className="p-3">3 brutos T4</td><td className="p-3 font-bold text-sky-400">1 refinado T3</td><td className="p-3">1 refinado T4</td></tr>
                <tr><td className="p-3 border-r border-white/5">Tier 5</td><td className="p-3">4 brutos T5</td><td className="p-3 font-bold text-sky-400">1 refinado T4</td><td className="p-3">1 refinado T5</td></tr>
                <tr><td className="p-3 border-r border-white/5">Tier 6</td><td className="p-3">5 brutos T6</td><td className="p-3 font-bold text-sky-400">1 refinado T5</td><td className="p-3">1 refinado T6</td></tr>
                <tr><td className="p-3 border-r border-white/5">Tier 7</td><td className="p-3">6 brutos T7</td><td className="p-3 font-bold text-sky-400">1 refinado T6</td><td className="p-3">1 refinado T7</td></tr>
                <tr><td className="p-3 border-r border-white/5 font-bold text-orange-400">Tier 8</td><td className="p-3 font-bold">7 brutos T8</td><td className="p-3 font-bold text-orange-400">1 refinado T7</td><td className="p-3 font-bold">1 refinado T8</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 bg-[var(--mw-primary)]/10 border-l-4 border-[var(--mw-primary)] p-4 rounded-r">
            <p className="text-sm font-bold text-[var(--mw-gold-bright)] uppercase tracking-widest mb-1 flex items-center gap-2"><Target size={14}/> Estratégia do Buy Order</p>
            <p className="text-[var(--mw-text-muted)] text-sm">Geralmente compensa muito mais <strong>Comprar ativamente os Sub-recursos com BuyOrders nas Cidades</strong> do que sentar e começar do refinado T2 até empilhar um T8.</p>
          </div>
        </Card>
      </section>

      {/* Seção 4 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--mw-gold-bright)] flex items-center gap-2">
          <span className="text-[var(--mw-text-muted)] font-mono text-sm">04</span> LPB e RRR: A Matemática do Lucro
        </h2>
        <Card className="p-6 space-y-4">
          <p className="text-[var(--mw-text-main)] font-medium">Correção Definitiva Guias Defasados</p>
          <p className="text-[var(--mw-text-muted)] text-sm">
            Muitos guias do youtube ditam Base 15% RRR linear absoluto. O correto matemático das bases Cidades Royal é o <strong>Local Production Bonus (LPB) de 18% para 58%</strong>. A fórmula exata RRR devolutiva para Albion é hiperbólica: <code className="bg-[#101012] px-2 py-0.5 rounded text-amber-400 select-all font-bold">RRR = 1 - 1 / (1 + LPB/100)</code>
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap text-[var(--mw-text-main)]">
              <thead>
                <tr className="border-b border-white/10 text-[var(--mw-text-muted)] uppercase tracking-widest font-bold">
                  <th className="p-3">Local de Refino</th>
                  <th className="p-3">Bônus Adotado LPB</th>
                  <th className="p-3 text-cyan-400">RRR Sem Foco</th>
                  <th className="p-3 text-orange-400">RRR Com Max Foco</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                <tr className="hover:bg-white/5">
                  <td className="p-3 font-sans opacity-70">Cidade S/ Bônus Especial</td>
                  <td className="p-3 opacity-70">18%</td>
                  <td className="p-3 opacity-70">~15.3%</td>
                  <td className="p-3 opacity-70">~44.2%</td>
                </tr>
                <tr className="hover:bg-white/5 bg-[var(--mw-gold-primary)]/5">
                  <td className="p-3 font-sans text-[var(--mw-gold-primary)] font-bold">Cidade com Bônus Correto</td>
                  <td className="p-3">58%</td>
                  <td className="p-3 text-cyan-400 font-bold">~36.7%</td>
                  <td className="p-3 text-orange-400 font-bold">~53.9%</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-3 font-sans opacity-60">Ilha Pessoal / Gui Id</td>
                  <td className="p-3 opacity-60">0%</td>
                  <td className="p-3 opacity-60 text-red-400">0%</td>
                  <td className="p-3 opacity-60">~39%</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-3 font-sans">Guild Hideout BZ (Sem Core)</td>
                  <td className="p-3">15%</td>
                  <td className="p-3">~13%</td>
                  <td className="p-3">~31.6%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[var(--mw-text-muted)] text-sm">
            <span className="text-white font-bold">Nota do Foco:</span> O botão adicionar &quot;Focus&quot; na UI insere fixos <strong className="text-white">+59% no LPB</strong> (Soma do 58% para 117% na Cidade Bônus), porém o crescimento final é em curva decrescente para 53.9% de Taxa de Retorno de Material RRR.
          </p>
        </Card>
      </section>

      {/* Seção 5 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--mw-gold-bright)] flex items-center gap-2">
          <span className="text-[var(--mw-text-muted)] font-mono text-sm">05</span> Recursos Encantados: A Exceção Oculta
        </h2>
        <Card className="p-6 space-y-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
             <Zap size={250} className="text-cyan-400" />
          </div>
          <p className="text-[var(--mw-text-main)] w-full md:w-3/4 relative z-10">
            A regra dourada de Refinos Mágicos Enchanted (.1, .2, .3, .4 Outlands). Fornecem +100 IP por elevação, são altissimamente procurados.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 relative z-10">
             <div className="bg-[#151518] p-4 rounded-lg border border-cyan-500/30">
                <h3 className="font-bold text-white mb-2 uppercase tracking-widest text-sm flex items-center gap-2"><Info size={14}/> Regra T4.x (Exclusiva)</h3>
                <p className="text-sm text-[var(--mw-text-muted)]">O T4 encantado (Ex: T4.2 e T4.3) <strong>FORÇA</strong> a exigência de sub-recurso <strong className="text-cyan-400">T3 FLAT (.0)</strong> mundano livre de mágica! É a única excessão no jogo todo.</p>
             </div>
             <div className="bg-[#151518] p-4 rounded-lg border border-[var(--mw-gold-primary)]/30">
                <h3 className="font-bold text-white mb-2 uppercase tracking-widest text-sm flex items-center gap-2"><Info size={14}/> Regra T5 a T8</h3>
                <p className="text-sm text-[var(--mw-text-muted)]">O sub-recurso T-1 deve acompanhar EXATAMENTE o mesmo nível de encantamento matemático. <br/><span className="text-[var(--mw-gold-bright)]">Bruto T6.3 exige Sub-recurso Refinado T5.3.</span></p>
             </div>
          </div>

          <div className="mt-4 bg-rose-500/10 border-l-4 border-rose-500 p-4 rounded-r relative z-10">
            <p className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-2"><ShieldAlert size={14}/> A Exceção da Pedra de Construção</p>
            <p className="text-rose-100/70 text-sm">Pedra Mágica <strong>NÃO gera blocos encantados T5.1</strong>. As pedras coloridas (Enchanted rock) atuam apenas como um mero multiplicador quantitativo final. (.1 Rende 2x; .2 Rende 4x; .3 Rende Absurdos 8x blocos).</p>
          </div>
        </Card>
      </section>

      {/* Seção 6 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--mw-gold-bright)] flex items-center gap-2">
          <span className="text-[var(--mw-text-muted)] font-mono text-sm">06</span> Impostos e Prejuízos Ocultos
        </h2>
        <Card className="p-6 space-y-4">
          <p className="text-[var(--mw-text-main)]">
            Todo lucro que parece existir na folha superficial é brutalmente assassinado por Setup Fees de Mercado de taxas Cidadãs.
          </p>
          <ul className="list-disc list-inside space-y-2 text-[var(--mw-text-muted)] p-4 bg-[#101012] rounded">
            <li><strong>Imposto Vendas Marketplace:</strong> Cobrança de 8% p/ jogadores base, cai de 50% p/ <strong className="text-white">4% fixo</strong> aos sortudos c/ Premium Status. A Tax incide no Produto Venda.</li>
            <li><strong>Setup-Fee Mercado Sell Orders:</strong> Taxa basal perdida sem dó! Toda &quot;Edição&quot; em sua ordem queima taxa, por isso não faça lutinhas de mercado 1 pratinha em 1 pratinha (Cut by -1s). Deixe rodar dias fixo.</li>
            <li><strong>A Taxa do Refiner-Mafia Cartel:</strong> Plote Cidadão cobra um uso em % sob o &quot;Item Value Code&quot;. Taxas entre 0 a 30%. Evite se estiver acima de 12%.</li>
            <li><strong>Custos Moeda Bruta Pura (Silver sink):</strong> T3+ arranca prata purista do banco pessoal para bater a bigorna a cada finalização de tela.</li>
          </ul>
        </Card>
      </section>

      {/* Seção 7 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--mw-gold-bright)] flex items-center gap-2">
          <span className="text-[var(--mw-text-muted)] font-mono text-sm">07</span> Logística Avançada (Red Zone Risks)
        </h2>
        <Card className="p-6 space-y-4 bg-gradient-to-br from-[var(--mw-card)] to-[#151518]">
          <p className="text-[var(--mw-text-main)] font-bold mb-2">Compre na Zona de Abundância. Refine na Cidade do Bônus. Venda onde falta.</p>
          
          <div className="flex flex-col md:flex-row gap-4 relative">
             <div className="flex-1 bg-black/40 p-4 border border-white/5 rounded">
                <div className="text-sm font-black uppercase text-amber-500 mb-2 border border-amber-500/30 px-2 py-0.5 rounded w-fit">1. Supply Setup (A)</div>
                <p className="text-sm text-white/70">Abrasque <strong className="text-white">Buy Orders</strong> extensas bem distantes das Zonas Finais Opcão 1. Preços menores 10-30% descontos.</p>
             </div>
             
             <div className="flex-1 bg-black/40 p-4 border border-[var(--mw-gold-primary)]/20 rounded">
                <div className="text-sm font-black uppercase text-[var(--mw-gold-bright)] mb-2 border border-[var(--mw-gold-primary)]/30 px-2 py-0.5 rounded w-fit">2. Station Refinery (B)</div>
                <p className="text-sm text-white/70">Dirija via T8 Ox pela zona Blue. Refine tudo sem dó com Foco se estiver entre T6 e T8 e armazene na cidade.</p>
             </div>
             
             <div className="flex-1 bg-black/40 p-4 border border-orange-500/20 rounded">
                <div className="text-sm font-black uppercase text-orange-400 mb-2 border border-orange-500/30 px-2 py-0.5 rounded w-fit">3. O Destino Red Zone (C)</div>
                <p className="text-sm text-white/70">A venda magna ocorre em Caerleon (Black Market) com sell orders finais e altíssimos preços de BlackMarket NPCs puxando o preço nas Alturas.</p>
             </div>
          </div>
          
          <p className="text-sm text-rose-300/80 italic mt-2 text-center">Risco Zonas Vermelhas: Carregamentos perigosos aos PK Gankers. Use ursos de transporte blindados (Bear) para não ser rasgado entre mapas de Outpost.</p>
        </Card>
      </section>

      {/* Seção 8 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--mw-gold-bright)] flex items-center gap-2">
          <span className="text-[var(--mw-text-muted)] font-mono text-sm">08</span> Foco: O Santo Graal do Craft (ROI)
        </h2>
        <Card className="p-6 space-y-4">
          <p className="text-[var(--mw-text-main)]">
            A Mente do Refinador entende que a regeneração limitrofe do Foco Premium (Exatos 10k Diários) é a engrenagem principal de capital livre do Jogo.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-3">
               <div className="bg-[#151518] p-3 text-sm font-mono border-l-2 border-emerald-500 rounded-r">
                 <span className="text-white/50 block mb-1">Taxa Silver Per Focus (SPF)</span>
                 <span className="text-emerald-400 block font-bold">Salved Silver ÷ Qtde Foco Exigida</span>
               </div>
               <p className="text-sm text-[var(--mw-text-muted)]">
                 <strong>O Uso Perfeito:</strong> Nunca utilize foco em T2 ou T3. Gastos com retornos pifios abaixo de de 1 ou 2 Pratas por Tick. O foco real brilha escalonadamente em <strong className="text-orange-400">T7 e T8</strong> encantados para obter retornos dezenas de milhões massivos de volta (podendo gerar gigantes 100~300 Pratas SPF!).
               </p>
            </div>
            
            <div className="space-y-3">
               <h3 className="font-bold text-white text-sm uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2"><Target size={14}/> Max-Level &quot;30.000 Foco Cap&quot;</h3>
               <p className="text-sm text-[var(--mw-text-muted)]">
                 Pode armazenar no máximo 30.000 (Trés Dias Off-line Premium). Logar e processar antes do limite estourar garante uma injeção gigante no montante e mantem seu SPF e rentabilidade em alto mar.
               </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Seção 9 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--mw-gold-bright)] flex items-center gap-2">
          <span className="text-[var(--mw-text-muted)] font-mono text-sm">09</span> Destiny Board &quot;Spec-Nodes&quot;
        </h2>
        <Card className="p-6 space-y-4">
          <p className="text-[var(--mw-text-main)]">
            Sua árvore começa com &quot;Trainee Craftsman&quot;, seguindo aos nodes de especialização em &quot;Journeyman Refiner&quot; T4 à T8.
          </p>
          <ul className="list-decimal list-inside space-y-2 text-[var(--mw-text-muted)] text-sm">
             <li><strong className="text-emerald-400">Mastery Individuales (Por Tier)</strong>: A evolução Mastery liberta os patamares, não adianta ter Lvl 100 Mastery T5 pensando abater gigantescamente os focus necessários em recursos de Refinos do T6. Foque Especialidades Fatiadas de verticalmente no Node específico.</li>
             <li><strong className="text-orange-400">Teto Absoluto do Eficiency Level (100+)</strong>: O teto mágico (Level Max T4 a T8 Spec), leva as reduções do 40.000 Points Efetivos! Isto esmaga o gasto basal do Foco aos absurdos meros <strong className="text-white">6,25% custo original bruto </strong> do jogo base!</li>
             <li><strong className="text-rose-400">Proibição Explícita dos Livros de Insight</strong>: Impossivel pular fases usando Tomes pra essa arvore craft/refining! É tudo no músculo de processamentos manuais.</li>
          </ul>
        </Card>
      </section>

      {/* Seção 10 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--mw-gold-bright)] flex items-center gap-2">
          <span className="text-[var(--mw-text-muted)] font-mono text-sm">10</span> Trabalhadores (Laborers & Journals)
        </h2>
        <Card className="p-6 space-y-4 border-emerald-900/40 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
             <Book size={180} />
          </div>
          <p className="text-[var(--mw-text-main)] font-bold">Laborers Islands e Retornos Bônus Fantasma</p>
          <div className="bg-rose-500/10 border-l-4 border-rose-500 p-4 rounded-r mt-4 relative z-10">
            <p className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-2"><ShieldAlert size={14}/> Warning! A Restrição Refinadora (Craft Vs Refining) </p>
            <p className="text-rose-100/70 text-sm">
               <strong>REFINO PURO NÃO PREENCHE NUNCA JOURNALS DE CRAFTING!!!</strong>. Para Refinadores puros, O benefício dos Labourers provêm majoritariamente em seu Capital-Flux: Comprar Livros &quot;Cheios de terceiros e Vendedores&quot; e deixá-los processando diários (Dando +150% felicidades C/ Moveis) dentro das dezenas da ilhas atadas! Crie Tinkeres ou Black-Smith em guild halls maximizando as Felicidades (A yield volta os Refinados).
            </p>
          </div>
          <p className="text-[var(--mw-text-muted)] text-sm mt-3 relative z-10">Mantenha os diários atordoados caso deseje adentrar o ciclo total e você mesmo fabricar armaduras depois do refino final base.</p>
        </Card>
      </section>

      {/* Seção 11 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--mw-gold-bright)] flex items-center gap-2">
          <span className="text-[var(--mw-text-muted)] font-mono text-sm">11</span> Hideouts Módulos Avançados (Black Zones)
        </h2>
        <Card className="p-6 space-y-4">
          <p className="text-[var(--mw-text-main)]">A Matemática Quebra a Banca Central com as Zonas-Negras-Endgame.</p>
          
          <div className="overflow-x-auto my-4">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-[var(--mw-text-muted)] uppercase tracking-widest font-bold">
                  <th className="p-3">Hideout Power Level Core</th>
                  <th className="p-3">LPB (Básico Adicionado)</th>
                  <th className="p-3 text-[var(--mw-gold-bright)]">LPB (No Bioma Perfeito)</th>
                  <th className="p-3">RRR Natural S/ Foco</th>
                  <th className="p-3 text-orange-400">RRR Max Foqueado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[var(--mw-text-main)]">
                <tr className="hover:bg-white/5"><td className="p-3">Level 0 Básico BZ / RoZ</td><td className="p-3">15%</td><td className="p-3 text-[var(--mw-gold-primary)]">15%</td><td className="p-3">~13%</td><td className="p-3 text-orange-400">~31.6%</td></tr>
                <tr className="hover:bg-white/5"><td className="p-3">Level Médio Core</td><td className="p-3">~20%</td><td className="p-3 text-[var(--mw-gold-primary)]">~35%</td><td className="p-3">~17%</td><td className="p-3 text-orange-400">~41%</td></tr>
                <tr className="hover:bg-rose-500/10 bg-rose-500/5"><td className="p-3 font-bold text-rose-400">Power Level Máximo Absoluto</td><td className="p-3">~26%</td><td className="p-3 text-[var(--mw-gold-primary)] font-bold">Teto Total 56%</td><td className="p-3 font-bold text-emerald-400">~35.9%</td><td className="p-3 font-bold text-orange-500">RRR Máxima ~53%</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-[var(--mw-text-muted)] mt-2">Valerão mais nas mega-alianças full PvP pra evitar o Royal-Cartel 0 impostos mas requer comboios gigantes com Mamutes atolados por Gankers full-loot.</p>
        </Card>
      </section>

      {/* Seção 12 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--mw-gold-bright)] flex items-center gap-2">
          <span className="text-[var(--mw-text-muted)] font-mono text-sm">12</span> Daily Production Bonus (Shift+X)
        </h2>
        <Card className="p-6 space-y-4">
           <div className="flex items-center gap-4 text-[var(--mw-gold-bright)]">
             <LayoutDashboard size={24} />
             <span className="font-bold">Ciclos Fixos e Diários Globais</span>
           </div>
           <p className="text-[var(--mw-text-main)] text-sm">
             Diariamente (Previsivelmente sem RNG Aleatórios), 2 Itens ou Brutos são alocados no Livro do Game Menu com bônus assombrosos Extras de Atividade Produtivo Global (<strong className="text-emerald-400">+10% Até Extraordiarios +20% Produção</strong>).
           </p>
           <p className="text-[var(--mw-text-muted)] text-sm italic">
             O Impacto de Mercado Massivo: Se Refina couro HOJE e o couro está 20%+, as Zonas enlatam. As ordens ficam lotadas e os preços caiem em queda livre - Segure. Refine e aguarde a próxima 48H para desovar os couros nos Crafites necessitados de Caerleon Central.
           </p>
        </Card>
      </section>
      
      {/* Seção 13 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--mw-gold-bright)] flex items-center gap-2">
          <span className="text-[var(--mw-text-muted)] font-mono text-sm">13</span> A Segunda Aba (Transmutador)
        </h2>
        <Card className="p-6 space-y-4 bg-[#101012] border border-cyan-900/30">
          <div className="flex items-start gap-4">
             <ArrowUpCircle size={28} className="text-cyan-400 mt-1 shrink-0" />
             <div>
                <p className="text-[var(--mw-text-main)] font-bold mb-2">Transmutation Mechanism</p>
                <p className="text-[var(--mw-text-muted)] text-sm mb-4">
                  Presente e oculta nas Próprias estações normais citadinas. A segunda Aba transforma recursos (Saber usar é o que dita o Mercado Fechado).
                </p>
                <div className="space-y-2">
                   <p className="text-sm text-[var(--mw-text-muted)]"><strong className="text-emerald-400">Tier Progress UP:</strong> Requer 2x ou mais bruto do baixo e prata grossa para empurra-lo prum Tier acima na tabela T4+ (Regla T7.0 é carissimo).</p>
                   <p className="text-sm text-[var(--mw-text-muted)]"><strong className="text-orange-400">Enchantment Level UP:</strong> A conversão pura (ex .1 par .2 e .2 a .3 Prístine) não usa materiais antigos. Cobra 100% EXCLUSIVO Silver puro da Algibeira - Maior ralo de deflação (Silver-Sink) do mundo Albionense! Uso justificado somente quando recursos T7.3+ Escassos.</p>
                </div>
             </div>
          </div>
        </Card>
      </section>

      {/* Seção 14 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--mw-gold-bright)] flex items-center gap-2">
          <span className="text-[var(--mw-text-muted)] font-mono text-sm">14</span> Vá Para a Aba &apos;Calculadora&apos;
        </h2>
        <Card className="p-6">
          <p className="text-[var(--mw-text-muted)]">A calculadora completa de refino dinâmico foi movida para sua própria aba, para melhor usabilidade e clareza.</p>
        </Card>
      </section>

      {/* Seção 15 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--mw-gold-bright)] flex items-center gap-2">
          <span className="text-[var(--mw-text-muted)] font-mono text-sm">15</span> Escalonamento Massivo (Automação de Bancos)
        </h2>
        <Card className="p-6 space-y-4">
          <p className="text-[var(--mw-text-main)]">O Crescimento Final rumo ao Titulo Trilionário passa do Single-Player para Corporativismo de Frotas de Refinos de Mult-Characters.</p>
          <ul className="list-decimal list-inside text-sm space-y-3 text-[var(--mw-text-muted)]">
            <li><strong className="text-white">Char Alternativos (Alts Tethers)</strong>: Ter 3-6 Personagens sob regime Premium Custa 30M InGame Gold, Porém Retornam diários os mesmos 30x10k pontinhos focos (Que estourados ao Teto 100/100 Spec Tree = Printadoras Infinitas de Silver).</li>
            <li><strong className="text-[var(--mw-gold-bright)]">The Plots Monopoly</strong>: Contratos nas Capitais, Investimentos no Cartéis fechados pra reduzir impostos as centenas fixos, ter Plot particular e monopolizar a rua. Reduz taxa na metade rentável.</li>
            <li><strong className="text-purple-400">Guild Diplomática Caerleonense</strong>: Manter 1 personagem parado nos Bancos Ocultos Blackzone só de passagem transportes/Mammoths e atrativos mercantes de T8 Puros que jorram no mercado sem precisar coletar arriscado a própria pele em PK Fights.</li>
          </ul>
        </Card>
      </section>

      {/* Seção 16 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--mw-gold-bright)] flex items-center gap-2">
          <span className="text-[var(--mw-text-muted)] font-mono text-sm">16</span> O Livro dos Erros (Táticas Anti-Drenagens)
        </h2>
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap text-[var(--mw-text-main)]">
              <thead>
                <tr className="border-b border-rose-500/30 text-rose-400 uppercase tracking-widest font-bold bg-rose-500/5">
                  <th className="p-3">Erro Crasso de Iniciante</th>
                  <th className="p-3">Motivo Financeiro Atrelado</th>
                  <th className="p-3 font-bold text-emerald-400">Correção Ouro/Especialista</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-rose-500/5">
                  <td className="p-3 font-medium">Refinar Cego pelo Tax Fee</td>
                  <td className="p-3 opacity-80">(Não notar bancada batendo a 24% na GUI)</td>
                  <td className="p-3 text-[var(--mw-text-muted)]">Checar Tenda no (M), Refinar após Nutrition da barraca e Menor Tax Fee possivel da capital.</td>
                </tr>
                <tr className="hover:bg-rose-500/5">
                  <td className="p-3 font-medium">Bater o Premium Foco T2/T3 Base</td>
                  <td className="p-3 opacity-80">As margens unitárias de pratas base são piadas 10 Pratinhas.</td>
                  <td className="p-3 text-[var(--mw-text-muted)]">Gastar unicamente em T5.1 Prá Cima ou T8.1 Que geram lucros avassaladores gigantes per Tick.</td>
                </tr>
                <tr className="hover:bg-rose-500/5">
                  <td className="p-3 font-medium">Paciência com a Venda Local</td>
                  <td className="p-3 opacity-80">Mercados superabastecidos destonam os Preços Base da Royal Zone inteira de Produção.</td>
                  <td className="p-3 text-[var(--mw-text-muted)]">Caminhe em comboiros pros hubs esvasiados de matérias como the Black Market Hub em Caerleon.</td>
                </tr>
                <tr className="hover:bg-rose-500/5">
                  <td className="p-3 font-medium text-purple-400">Esquecer da Exceção Aberrante (T4 Encantada Mixes)</td>
                  <td className="p-3 opacity-80">Pagar horores em T3.2 mágico do market pra enfiar no Bruto mágico T4.2 pra refinar e a UI recusar fechar transação.</td>
                  <td className="p-3 font-bold text-white uppercase">Sempre compre o flat (.0) mundano T3 regular pra parear no craft de Bruto T4 Magic! Nunca use T3 encantado pro 4.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>

    </div>
  );
}
