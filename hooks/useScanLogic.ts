import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useAlbionData } from '@/lib/albion/useAlbionData';
import { usePersistedState } from '@/hooks/usePersistedState';
import { useFilteredResults } from '@/hooks/useFilteredResults';
import { scanSettingsSchema, scanFiltersSchema } from '@/lib/validation';
import { ScanTab, ScanFilters, ScanSettings, TradeResult } from '@/lib/albion/types';
import { requestNotificationPermission, sendNotification } from '@/lib/alerts';
import { toast } from 'sonner';

export function useScanLogic() {
  const { scan, isScanning, progress, results } = useAlbionData();

  const [currentTab, setCurrentTab] = usePersistedState<ScanTab>('apf_currentTab', 'mats');
  const [category, setCategory] = usePersistedState<string>('apf_category', 'all');
  const [tier, setTier] = usePersistedState<string>('apf_tier', 'all');
  const [enchant, setEnchant] = usePersistedState<string>('apf_enchant', 'all');
  const [quality, setQuality] = usePersistedState<ScanFilters['quality']>('apf_quality', 'all');
  const [search, setSearch] = useState('');
  
  const [settings, setSettings] = usePersistedState<ScanSettings>('apf_settings', { maxAge: 10080, minProfit: 0, minMargin: 0 }, scanSettingsSchema);
  const [alertsEnabled, setAlertsEnabled] = usePersistedState('apf_alertsEnabled', false);
  const previousResultsRef = useRef<Set<string>>(new Set());

  const isConfigValid = useMemo(() => {
    try {
      scanSettingsSchema.parse(settings);
      scanFiltersSchema.parse({ city: 'all', quality });
      return true;
    } catch {
      return false;
    }
  }, [settings, quality]);

  const handleScan = useCallback(() => {
    if (currentTab === 'mats' || currentTab === 'planner' || !isConfigValid) return;
    scan(currentTab, category, tier, enchant, settings, { city: 'all', quality });
  }, [currentTab, category, tier, enchant, settings, quality, scan, isConfigValid]);

  const toggleAlerts = async () => {
    if (!alertsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setAlertsEnabled(true);
        sendNotification('Alertas Ativados', { body: 'Você receberá notificações sobre grandes oportunidades no Black Market.' });
      } else {
        toast.warning('Permissão de notificação negada ou não suportada.');
      }
    } else {
      setAlertsEnabled(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (alertsEnabled && currentTab === 'enchant' && !isScanning) {
      interval = setInterval(() => {
        handleScan();
      }, 5 * 60 * 1000);
    }
    return () => clearInterval(interval);
  }, [alertsEnabled, currentTab, isScanning, handleScan]);

  useEffect(() => {
    if (isScanning || results.length === 0 || !alertsEnabled) return;
    
    let highestProfit = 0;
    let bestResult: TradeResult | null = null;
    const currentKeys = new Set<string>();

    for (const r of results) {
      const oppKey = `${r.itemId}-${r.sourceCity || r.baseCity}-${Math.floor(r.buyPrice / 1000)}`;
      currentKeys.add(oppKey);
      
      if (!previousResultsRef.current.has(oppKey)) {
        const profit = r.sellPrice - r.buyPrice - (r.baseCost || 0);
        if (profit > 300000 && r.margin > 20) {
          if (profit > highestProfit) {
            highestProfit = profit;
            bestResult = r;
          }
        }
      }
    }

    if (bestResult) {
      sendNotification(`Oportunidade Encontrada!`, { 
        body: `Lucro de +${highestProfit.toLocaleString('pt-BR')} Prata (Margem: ${bestResult.margin.toFixed(1)}%)` 
      });
    }

    previousResultsRef.current = currentKeys;
  }, [results, isScanning, alertsEnabled]);

  const filteredResults = useFilteredResults(results, search);

  return {
    isScanning,
    progress,
    results,
    filteredResults,
    currentTab, setCurrentTab,
    category, setCategory,
    tier, setTier,
    enchant, setEnchant,
    quality, setQuality,
    search, setSearch,
    settings, setSettings,
    alertsEnabled, toggleAlerts,
    handleScan,
    isConfigValid
  };
}
