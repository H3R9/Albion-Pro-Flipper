export const CITIES = [
  'Caerleon',
  'Bridgewatch',
  'Fort Sterling',
  'Lymhurst',
  'Martlock',
  'Thetford',
  'Brecilien',
];
export const ROYAL_CITIES = [
  'Caerleon',
  'Bridgewatch',
  'Fort Sterling',
  'Lymhurst',
  'Martlock',
  'Thetford',
];
export const ALL_LOCATIONS = [...CITIES, 'Black Market'];
export const TIERS = [4, 5, 6, 7, 8];
export const ENCHANTS = [0, 1, 2, 3, 4];

export const ROUTE_INFO: Record<string, { zone: string; zoneLabel: string; riskPct: number; emoji: string }> = {
  Caerleon: { zone: 'red', zoneLabel: 'Zona Vermelha', riskPct: 0.08, emoji: '🔴' },
  Bridgewatch: { zone: 'yellow', zoneLabel: 'Zona Amarela', riskPct: 0.0, emoji: '🟡' },
  'Fort Sterling': { zone: 'yellow', zoneLabel: 'Zona Amarela', riskPct: 0.0, emoji: '🟡' },
  Lymhurst: { zone: 'yellow', zoneLabel: 'Zona Amarela', riskPct: 0.0, emoji: '🟡' },
  Martlock: { zone: 'yellow', zoneLabel: 'Zona Amarela', riskPct: 0.0, emoji: '🟡' },
  Thetford: { zone: 'yellow', zoneLabel: 'Zona Amarela', riskPct: 0.0, emoji: '🟡' },
};

export function getEnchantMaterialId(tier: number, enchantLevel: number) {
  if (tier < 4 || enchantLevel < 1 || enchantLevel > 4) return null;
  const mats: Record<number, string> = { 1: 'RUNE', 2: 'SOUL', 3: 'RELIC', 4: 'SHARD_AVALONIAN' };
  return `T${tier}_${mats[enchantLevel]}`;
}

export function getEnchantResourceCount(itemId: string) {
  if (
    itemId.includes('_HEAD') ||
    itemId.includes('_SHOES') ||
    itemId.includes('_CAPE') ||
    itemId.includes('_OFF_')
  )
    return 96;
  if (itemId.includes('_ARMOR') || itemId.includes('_BAG')) return 192;
  if (itemId.includes('_2H_')) return 384;
  return 288; // Arma 1H fallback
}

export const QUALITY_MAP: Record<number, { name: string; namePT: string; color: string; css: string }> = {
  1: { name: 'Normal', namePT: 'Normal', color: '#a0a0a0', css: 'badge-quality-normal' },
  2: { name: 'Good', namePT: 'Bom', color: '#50c060', css: 'badge-quality-good' },
  3: { name: 'Outstanding', namePT: 'Excelente', color: '#5090d0', css: 'badge-quality-outstanding' },
  4: { name: 'Excellent', namePT: 'Excepcional', color: '#c080f0', css: 'badge-quality-excellent' },
  5: { name: 'Masterpiece', namePT: 'Obra-prima', color: '#f0c050', css: 'badge-quality-masterpiece' },
};

export const API_BASES = {
  west: 'https://west.albion-online-data.com/api/v2/stats/prices',
  americas: 'https://west.albion-online-data.com/api/v2/stats/prices', // same as west
  east: 'https://east.albion-online-data.com/api/v2/stats/prices',
  asia: 'https://east.albion-online-data.com/api/v2/stats/prices', // same as east
  europe: 'https://europe.albion-online-data.com/api/v2/stats/prices',
};

export const RENDER_BASE = 'https://render.albiononline.com/v1/item';

export const TIER_NAMES: Record<number, string> = {
  4: 'Adepto',
  5: 'Perito',
  6: 'Mestre',
  7: 'Grão-mestre',
  8: 'Ancião',
};

export function formatPrice(num: number) {
  if (!num || num <= 0) return '—';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(2) + 'k';
  return num.toLocaleString('pt-BR');
}

export function formatProfit(num: number) {
  if (num === 0 || num === undefined || num === null) return '—';
  const prefix = num > 0 ? '+' : '';
  if (Math.abs(num) >= 1_000_000) return prefix + (num / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(num) >= 1_000) return prefix + (num / 1_000).toFixed(2) + 'k';
  return prefix + num.toLocaleString('pt-BR');
}

export function formatSilver(num: number) {
  if (!num || num === 0) return '—';
  return Math.floor(num).toLocaleString('pt-BR');
}

export function formatTimeAgo(dateStr: string | null) {
  if (!dateStr || dateStr.startsWith('0001')) return '???';
  const utcDateStr = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
  const date = new Date(utcDateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 0) return 'agora';
  
  if (diffSec < 60) return `${diffSec}s atrás`;
  if (diffSec < 3600) {
    const min = Math.floor(diffSec / 60);
    const sec = diffSec % 60;
    return `${min}m e ${sec}s atrás`;
  }
  if (diffSec < 86400) {
    const h = Math.floor(diffSec / 3600);
    const min = Math.floor((diffSec % 3600) / 60);
    return `${h}h e ${min}m atrás`;
  }
  return `${Math.floor(diffSec / 86400)}d atrás`;
}

export function getAgeMinutes(dateStr: string | null) {
  if (!dateStr || dateStr.startsWith('0001')) return 9999;
  const utcDateStr = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
  return Math.floor((new Date().getTime() - new Date(utcDateStr).getTime()) / 1000 / 60);
}

export function parseItemId(itemId: string) {
  const tierMatch = itemId.match(/^T(\d+)/);
  const tier = tierMatch ? parseInt(tierMatch[1], 10) : 0;
  const enchant = itemId.includes('@') ? parseInt(itemId.split('@')[1], 10) : 0;
  return { tier, enchant };
}

export function getBaseItemId(itemId: string) {
  return itemId.split('@')[0];
}

export function getItemIconUrl(itemId: string, quality: number = 1, size: number = 64) {
  return `${RENDER_BASE}/${itemId}.png?size=${size}&quality=${quality}`;
}

export function getQualityInfo(quality: number) {
  return QUALITY_MAP[quality] || QUALITY_MAP[1];
}

export function calculateProfit(buyPrice: number, sellPrice: number, sellTax = 4, setupFee = 2.5, isBM = false) {
  if (isBM) return sellPrice - buyPrice;
  const totalTaxRate = (sellTax + setupFee) / 100;
  return sellPrice * (1 - totalTaxRate) - buyPrice;
}

export function calculateMargin(buyPrice: number, profit: number) {
  if (!buyPrice || buyPrice <= 0) return 0;
  return (profit / buyPrice) * 100;
}

export function calculateTax(sellPrice: number, taxRate = 4) {
  return Math.floor(sellPrice * (taxRate / 100));
}

export function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
