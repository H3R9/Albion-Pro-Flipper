import { useState, useCallback, useEffect } from 'react';
import { fetchMarketData, fetchBatchVolume } from './api';
import {
  analyzeBlackTrades,
  analyzeRoyalBM,
  analyzeEnchanting,
  analyzeBuyOrderTrades,
  applyDemandScore,
  MarketData,
  TradeResult,
} from './analysis';
import { getItemsByCategory, filterItems } from './items';
import { ROYAL_CITIES } from './utils';

export function useAlbionData() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 100, text: '' });
  const [results, setResults] = useState<TradeResult[]>([]);
  const [globalEnchantMaterials, setGlobalEnchantMaterials] = useState<MarketData[]>([]);

  const preloadEnchantMaterials = async () => {
    const mats = [];
    for (let t = 4; t <= 8; t++) {
      mats.push(`T${t}_RUNE`, `T${t}_SOUL`, `T${t}_RELIC`, `T${t}_SHARD_AVALONIAN`);
    }
    try {
      const data = await fetchMarketData(mats, [...ROYAL_CITIES, 'Caerleon']);
      setGlobalEnchantMaterials(data);
    } catch (e) {
      console.error('Error preloading enchant materials', e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      preloadEnchantMaterials();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const scan = useCallback(
    async (
      currentTab: 'black' | 'royal' | 'enchant' | 'buyorders',
      category: string,
      tierFilter: string,
      enchantFilter: string,
      settings: any,
      filters: any
    ) => {
      if (isScanning) return;
      setIsScanning(true);
      setResults([]);
      setProgress({ current: 0, total: 100, text: 'Iniciando scan...' });

      try {
        let itemIds = getItemsByCategory(category);

        if (tierFilter !== 'all' || enchantFilter !== 'all') {
          itemIds = filterItems(itemIds, tierFilter, enchantFilter);
        }

        let locations: string[];
        if (currentTab === 'black') locations = ['Caerleon', 'Black Market'];
        else if (currentTab === 'enchant') locations = [...ROYAL_CITIES, 'Caerleon', 'Black Market'];
        else if (currentTab === 'buyorders') locations = [...ROYAL_CITIES, 'Caerleon', 'Black Market'];
        else locations = [...ROYAL_CITIES, 'Black Market'];

        let currentEnchantMaterials = globalEnchantMaterials;
        if (currentTab === 'enchant') {
          setProgress({ current: 0, total: 100, text: 'Atualizando preços de materiais (Runas/Almas)...' });
          const mats = [];
          for (let t = 4; t <= 8; t++) {
            mats.push(`T${t}_RUNE`, `T${t}_SOUL`, `T${t}_RELIC`, `T${t}_SHARD_AVALONIAN`);
          }
          const locationsEnchant = [...ROYAL_CITIES, 'Caerleon'];
          currentEnchantMaterials = await fetchMarketData(mats, locationsEnchant);
          setGlobalEnchantMaterials(currentEnchantMaterials);
        }

        const chunkSize = 200;
        let allData: MarketData[] = [];
        let allResults: TradeResult[] = [];

        for (let i = 0; i < itemIds.length; i += chunkSize) {
          const chunkIds = itemIds.slice(i, i + chunkSize);
          setProgress({
            current: i,
            total: itemIds.length,
            text: `Analisando ${Math.min(i + chunkSize, itemIds.length)} de ${itemIds.length} itens...`,
          });

          const chunkData = await fetchMarketData(chunkIds, locations);
          allData.push(...chunkData);

          let chunkResults: TradeResult[] = [];
          switch (currentTab) {
            case 'black':
              chunkResults = analyzeBlackTrades(chunkData, settings, filters);
              break;
            case 'royal':
              chunkResults = analyzeRoyalBM(chunkData, settings, filters);
              break;
            case 'buyorders':
              chunkResults = analyzeBuyOrderTrades(chunkData, settings, filters);
              break;
          }

          if (chunkResults.length > 0) {
            allResults.push(...chunkResults);
            allResults.sort((a, b) => b.score - a.score);
            setResults([...allResults]);
          }
        }

        if (currentTab === 'enchant') {
          setProgress({ current: itemIds.length, total: itemIds.length, text: 'Processando encantamentos...' });
          allResults = analyzeEnchanting(allData, settings, filters, currentEnchantMaterials);
          setResults([...allResults]);
        }

        // Fetch Volumes for all results (or at least top 1000 since it is fast now)
        if (allResults.length > 0) {
          setProgress({ current: 100, total: 100, text: 'Buscando informações de volume...' });
          // Fast now: 1000 items / 50 = 20 requests * 0.2s = 4 seconds!
          const topIds = allResults.slice(0, 2000).map((r) => r.itemId);
          const volumes = await fetchBatchVolume(topIds);

          allResults.forEach((r) => {
            if (volumes.has(r.itemId)) {
              r.volume24h = volumes.get(r.itemId);
            }
          });

          allResults = applyDemandScore(allResults);
          setResults([...allResults]);
        }

        setProgress({ current: 100, total: 100, text: 'Scan completo.' });
      } catch (e) {
        console.error('Scan error:', e);
        setProgress({ current: 0, total: 100, text: 'Erro durante o scan.' });
      } finally {
        setIsScanning(false);
      }
    },
    [isScanning, globalEnchantMaterials]
  );

  return { scan, isScanning, progress, results, setResults };
}
