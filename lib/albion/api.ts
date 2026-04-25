import { API_BASES } from './utils';

let currentServer: keyof typeof API_BASES = 'americas';

export function setServer(server: keyof typeof API_BASES) {
  currentServer = server;
}
export function getServer() {
  return currentServer;
}
export function getApiBase() {
  return API_BASES[currentServer] || API_BASES.americas;
}

async function fetchWithRetry(url: string, retries = 3, delayMs = 1500): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url);
      if (response.status === 429 && i < retries) {
        const waitTime = delayMs * Math.pow(1.5, i);
        console.warn(`[429] Rate limit atingido. Esperando ${Math.floor(waitTime)}ms...`);
        await new Promise((r) => setTimeout(r, waitTime));
        continue;
      }
      return response;
    } catch (e) {
      if (i === retries) throw e;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error("Max retries exceeded");
}

export async function fetchMarketData(itemIds: string[], locations: string[], onProgress?: (c: number, t: number) => void) {
  const base = getApiBase();
  const locsParam = locations.slice().sort().join(',');

  const results: any[] = [];
  const idsToFetch = [...itemIds]; // Without caching layer for simplicity in this implementation

  if (idsToFetch.length === 0) {
    return results;
  }

  const chunks: string[][] = [];
  let currentChunk: string[] = [],
    currentLen = 0;
  const maxLen = 2800;

  for (const id of idsToFetch) {
    if (currentLen + id.length + 1 > maxLen && currentChunk.length > 0) {
      chunks.push([...currentChunk]);
      currentChunk = [id];
      currentLen = id.length;
    } else {
      currentChunk.push(id);
      currentLen += id.length + 1;
    }
  }
  if (currentChunk.length > 0) chunks.push(currentChunk);

  for (let i = 0; i < chunks.length; i++) {
    if (onProgress) onProgress(i + 1, chunks.length);
    const itemsParam = chunks[i].join(',');
    const url = `${base}/${itemsParam}.json?locations=${locsParam}&qualities=1,2,3,4,5`;

    try {
      const response = await fetchWithRetry(url, 3, 2000);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      results.push(...data);
    } catch (e: any) {
      console.warn(`Erro no lote ${i + 1}:`, e.message);
    }
    // Prevent rate limit
    await new Promise((r) => setTimeout(r, 600));
  }
  return results;
}

export async function fetchItemHistory(itemId: string) {
  const base = getApiBase().replace('/prices', '/history');
  const url = `${base}/${itemId}?locations=Black Market&time-scale=24`;

  try {
    const response = await fetchWithRetry(url, 2, 1000);
    if (!response.ok) return 0;
    const data = await response.json();

    let totalVolume = 0;
    if (data && data.length > 0) {
      for (const entry of data) {
        if (entry.data && Array.isArray(entry.data)) {
          for (const point of entry.data) {
            totalVolume += point.item_count || 0;
          }
        }
      }
    }
    return totalVolume;
  } catch (e: any) {
    console.warn('Erro ao buscar histórico:', e.message);
    return 0;
  }
}

export async function fetchBatchVolume(itemIds: string[]) {
  const result = new Map<string, number>();
  const toFetch = [...itemIds];

  if (toFetch.length === 0) return result;

  const chunkSize = 50;
  const chunks: string[][] = [];
  for (let i = 0; i < toFetch.length; i += chunkSize) {
    chunks.push(toFetch.slice(i, i + chunkSize));
  }

  const base = getApiBase().replace('/prices', '/history');

  for (const chunk of chunks) {
    const idList = chunk.join(',');
    const url = `${base}/${idList}?locations=Black Market&time-scale=24`;
    try {
      const res = await fetchWithRetry(url, 3, 2000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        for (const entry of data) {
          const itemId = entry.item_id;
          let vol = 0;
          if (entry.data && Array.isArray(entry.data)) {
            for (const pt of entry.data) {
              vol += pt.item_count || 0;
            }
          }
          result.set(itemId, (result.get(itemId) || 0) + vol);
        }
      }
    } catch (e) {
      // Ignora erro do chunk
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  return result;
}

export async function fetchPriceTrend(itemId: string) {
  const base = getApiBase().replace('/prices', '/history');
  const url = `${base}/${itemId}?locations=Black Market&time-scale=6`;

  try {
    const response = await fetchWithRetry(url);
    if (!response.ok) return null;
    const data = await response.json();

    if (!data || data.length === 0) return null;

    let points: any[] = [];
    for (const entry of data) {
      if (entry.data && Array.isArray(entry.data)) {
        points.push(...entry.data);
      }
    }
    if (points.length === 0) return null;

    points.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const latestTime = new Date(points[points.length - 1].timestamp).getTime();
    const splitTime = latestTime - 2 * 60 * 60 * 1000;

    let oldSum = 0,
      oldCount = 0;
    let newSum = 0,
      newCount = 0;

    points.forEach((pt) => {
      const ptTime = new Date(pt.timestamp).getTime();
      if (ptTime < splitTime) {
        oldSum += pt.avg_price;
        oldCount++;
      } else {
        newSum += pt.avg_price;
        newCount++;
      }
    });

    const avgOld = oldCount > 0 ? oldSum / oldCount : 0;
    const avgNew = newCount > 0 ? newSum / newCount : 0;
    const avgPrice = avgNew > 0 ? avgNew : avgOld;

    let trend = 'stable';
    let changePercent = 0;

    if (avgOld > 0 && avgNew > 0) {
      changePercent = ((avgNew - avgOld) / avgOld) * 100;
      if (changePercent > 5) trend = 'up';
      else if (changePercent < -5) trend = 'down';
    }

    return {
      trend,
      changePercent: parseFloat(changePercent.toFixed(1)),
      avgPrice: Math.floor(avgPrice),
      historyPoints: points.map((p) => p.avg_price),
    };
  } catch (e) {
    return null;
  }
}
