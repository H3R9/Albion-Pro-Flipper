import { useState, useEffect, useRef } from 'react';
import { TradeResult } from '@/lib/albion/types';
import { getItemFullName } from '@/lib/albion/items';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';

export interface RefreshEvent {
  timestamp: number;
  found: number;
}

export interface SessionStats {
  totalAnalyzed: number;
  highestProfit: number;
  bestRoi: number;
  bestCity: string;
  hottestCategory: string;
  profitDistribution: {
    '0-50k': number;
    '50-150k': number;
    '150-500k': number;
    '500k+': number;
  };
}

export function useSessionStats(results: TradeResult[], isScanning: boolean) {
  const [refreshes, setRefreshes] = useState<RefreshEvent[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalAnalyzed: 0,
    highestProfit: 0,
    bestRoi: 0,
    bestCity: '-',
    hottestCategory: '-',
    profitDistribution: { '0-50k': 0, '50-150k': 0, '150-500k': 0, '500k+': 0 }
  });
  
  const [isNewRecord, setIsNewRecord] = useState(false);
  const processedScansRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (isScanning || results.length === 0) return;

    const currentTimestamp = Date.now();
    // Avoid re-processing the same result set if we already did within the last 5 seconds
    if (refreshes.length > 0 && currentTimestamp - refreshes[0].timestamp < 5000) return;

    let runHighestProfit = 0;
    let runBestRoi = 0;
    const cityCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const dist = { '0-50k': 0, '50-150k': 0, '150-500k': 0, '500k+': 0 };

    for (const r of results) {
      const profit = r.adjustedProfit !== undefined ? r.adjustedProfit : r.profit;
      const roi = r.buyPrice > 0 ? (profit / r.buyPrice) * 100 : 0;

      if (profit > runHighestProfit) runHighestProfit = profit;
      if (roi > runBestRoi) runBestRoi = roi;

      const city = r.sourceCity || r.baseCity || 'Desconhecida';
      cityCounts[city] = (cityCounts[city] || 0) + 1;

      const isWeapon = r.itemId.includes('_MAIN_') || r.itemId.includes('_2H_');
      const isArmor = r.itemId.includes('_HEAD') || r.itemId.includes('_ARMOR') || r.itemId.includes('_SHOES');
      const cat = isWeapon ? 'Armas' : isArmor ? 'Armaduras' : 'Recursos/Outros';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      if (profit < 50000) dist['0-50k']++;
      else if (profit < 150000) dist['50-150k']++;
      else if (profit < 500000) dist['150-500k']++;
      else dist['500k+']++;
    }

    setTimeout(() => {
      setRefreshes(prev => {
        const newRefreshes = [{ timestamp: currentTimestamp, found: results.length }, ...prev];
        return newRefreshes.slice(0, 5);
      });
      
      setStats(prev => {
        const maxProfit = Math.max(prev.highestProfit, runHighestProfit);
        const maxRoi = Math.max(prev.bestRoi, runBestRoi);

        let bestCity = prev.bestCity;
        let maxCityCount = 0;
        for (const [c, count] of Object.entries(cityCounts)) {
          if (count > maxCityCount) {
            maxCityCount = count;
            bestCity = c;
          }
        }

        let hottestCat = prev.hottestCategory;
        let maxCatCount = 0;
        for (const [cat, count] of Object.entries(categoryCounts)) {
          if (count > maxCatCount) {
            maxCatCount = count;
            hottestCat = cat;
          }
        }

        return {
          totalAnalyzed: prev.totalAnalyzed + results.length,
          highestProfit: maxProfit,
          bestRoi: maxRoi,
          bestCity: bestCity !== '-' ? bestCity : '-',
          hottestCategory: hottestCat !== '-' ? hottestCat : '-',
          profitDistribution: {
            '0-50k': prev.profitDistribution['0-50k'] + dist['0-50k'],
            '50-150k': prev.profitDistribution['50-150k'] + dist['50-150k'],
            '150-500k': prev.profitDistribution['150-500k'] + dist['150-500k'],
            '500k+': prev.profitDistribution['500k+'] + dist['500k+'],
          }
        };
      });
    }, 0);

    // Save Top 3 flips to Firestore
    const saveTopFlips = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const topFlips = [...results]
        .sort((a, b) => (b.adjustedProfit || b.profit) - (a.adjustedProfit || a.profit))
        .slice(0, 3);

      for (const flip of topFlips) {
        const profit = flip.adjustedProfit || flip.profit;
        const roi = flip.buyPrice > 0 ? (profit / flip.buyPrice) * 100 : 0;
        
        try {
          // Verify if it's a new global personal record
          if (profit > runHighestProfit * 0.9 && profit > stats.highestProfit) {
            setIsNewRecord(true);
            setTimeout(() => setIsNewRecord(false), 5000);
          }

          await addDoc(collection(db, 'bestFlips'), {
            userId: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'Trader Anônimo',
            itemId: flip.itemId,
            itemName: getItemFullName(flip.itemId),
            profit: profit,
            roi: roi,
            sourceCity: flip.sourceCity || flip.baseCity || 'Desconhecida',
            createdAt: serverTimestamp()
          });
        } catch (error) {
          console.error("Error saving flip: ", error);
          // Do not crash the app
        }
      }
    };

    saveTopFlips();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, isScanning]);

  return { refreshes, stats, isNewRecord };
}
