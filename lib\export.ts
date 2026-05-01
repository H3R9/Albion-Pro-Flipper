import { TradeResult } from './albion/types';
import { formatSilver, parseItemId, getQualityInfo } from './albion/utils';
import { getItemFullName } from './albion/items';

/**
 * Export scan results as a CSV file
 */
export function exportToCSV(results: TradeResult[], filename?: string) {
  const headers = [
    'Item',
    'ID',
    'Tier',
    'Enchant',
    'Qualidade',
    'Tipo de Trade',
    'Cidade Origem',
    'Preço Compra',
    'Preço Venda (BM)',
    'Lucro Líquido',
    'Margem (%)',
    'Taxa',
    'Volume 24h',
    'Idade (min)',
    'Score',
    'Recomendação',
    'Zona da Rota'
  ];

  const rows = results.map(r => {
    const p = parseItemId(r.itemId);
    const qi = getQualityInfo(r.quality);
    return [
      getItemFullName(r.itemId),
      r.itemId,
      p.tier,
      p.enchant,
      qi.namePT,
      r.tradeType,
      r.sourceCity,
      r.buyPrice,
      r.sellPrice,
      r.profit,
      r.margin.toFixed(1),
      r.tax,
      r.volume24h ?? 0,
      r.worstAge.toFixed(0),
      r.flipScore?.totalScore ?? r.score,
      r.flipScore?.recommendation ?? '-',
      r.routeZone
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      const str = String(cell);
      // Escape commas and quotes in CSV
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `aureus_scan_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export results as a formatted text report
 */
export function exportToTextReport(results: TradeResult[]): string {
  const header = `═══════════════════════════════════════
  AUREUS MARKET ANALYTICS — RELATÓRIO
  ${new Date().toLocaleString('pt-BR')}
  Total: ${results.length} oportunidades
═══════════════════════════════════════\n\n`;

  const body = results.map((r, i) => {
    const p = parseItemId(r.itemId);
    const name = getItemFullName(r.itemId);
    return `#${i + 1} — ${name} (T${p.tier}.${p.enchant})
   Rota: ${r.sourceCity} → Caerleon (BM)
   Compra: ${formatSilver(r.buyPrice)} | Venda: ${formatSilver(r.sellPrice)}
   Lucro: ${formatSilver(r.profit)} (${r.margin.toFixed(1)}% margem)
   Volume: ${r.volume24h ?? '?'}/24h | Idade: ${r.worstAge.toFixed(0)} min
   Score: ${r.flipScore?.totalScore ?? r.score}/100 [${r.flipScore?.recommendation ?? '-'}]
   ${r.flipScore?.reason ?? ''}
`;
  }).join('\n');

  return header + body;
}

/**
 * Copy report to clipboard
 */
export async function copyReportToClipboard(results: TradeResult[]): Promise<boolean> {
  try {
    const report = exportToTextReport(results);
    await navigator.clipboard.writeText(report);
    return true;
  } catch {
    return false;
  }
}
