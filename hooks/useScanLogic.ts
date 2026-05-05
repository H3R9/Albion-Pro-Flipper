import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useAlbionData } from '@/lib/albion/useAlbionData';
import { usePersistedState } from '@/hooks/usePersistedState';
import { useFilteredResults } from '@/hooks/useFilteredResults';
import { scanSettingsSchema, scanFiltersSchema } from '@/lib/validation';
import { ScanTab, ScanFilters, ScanSettings, TradeResult, AlertSettings } from '@/lib/albion/types';
import { requestNotificationPermission, sendNotification, playNotificationSound, sendWebhookMessage } from '@/lib/alerts';
import { useInterval } from '@/hooks/useInterval';
import { toast } from 'sonner';

export function useScanLogic() {
  const { scan, isScanning, progress, results } = useAlbionData();

  const [currentTab, setCurrentTab] = usePersistedState<ScanTab>('apf_currentTab', 'mats');
  const [scanMode, setScanMode] = usePersistedState<ScanTab>('apf_scanMode', 'enchant');
  const [category, setCategory] = usePersistedState<string>('apf_category', 'all');
  const [tier, setTier] = usePersistedState<string>('apf_tier', 'all');
  const [enchant, setEnchant] = usePersistedState<string>('apf_enchant', 'all');
  const [quality, setQuality] = usePersistedState<ScanFilters['quality']>('apf_quality', 'all');
  const [search, setSearch] = useState('');
  
  const [settings, setSettings] = usePersistedState<ScanSettings>('apf_settings', { maxAge: 10080, minProfit: 0, minMargin: 0 }, scanSettingsSchema);
  const [alertsEnabled, setAlertsEnabled] = usePersistedState('apf_alertsEnabled', false);
  
  // Custom new states for AutoRefresh and Advanced Alerts
  const [autoRefreshInterval, setAutoRefreshInterval] = usePersistedState<number | null>('apf_autoRefresh', null);
  const [nextRefreshTime, setNextRefreshTime] = useState<number | null>(null);
  
  const [alertSettings, setAlertSettings] = usePersistedState<AlertSettings>('apf_alertSettings', {
    minProfit: 50000,
    minMargin: 20,
    cities: ['Caerleon']
  });

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
    scan(scanMode, category, tier, enchant, settings, { city: 'all', quality });
  }, [currentTab, scanMode, category, tier, enchant, settings, quality, scan, isConfigValid]);

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

  const [newPulseKeys, setNewPulseKeys] = useState<Set<string>>(new Set());

  // Auto Refresh Check logic
  useInterval(() => {
     if (isScanning || currentTab !== 'enchant' || !autoRefreshInterval) return;
     if (nextRefreshTime && Date.now() >= nextRefreshTime) {
         handleScan();
         setNextRefreshTime(Date.now() + autoRefreshInterval * 1000);
     }
  }, 1000);

  // Setup Next Refresh Time when enabling interval or finishing scan
  useEffect(() => {
      setTimeout(() => {
          if (autoRefreshInterval && currentTab === 'enchant' && !isScanning) {
              if (!nextRefreshTime || Date.now() >= nextRefreshTime) {
                 setNextRefreshTime(Date.now() + autoRefreshInterval * 1000);
              }
          } else {
              if (!autoRefreshInterval) setNextRefreshTime(null);
          }
      }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefreshInterval, currentTab, isScanning]);

  useEffect(() => {
    if (isScanning || results.length === 0 || !alertsEnabled) return;
    
    let highestProfit = 0;
    let bestResult: TradeResult | null = null;
    const currentKeys = new Set<string>();
    
    const locallyNewKeys = new Set<string>();

    for (const r of results) {
      const oppKey = `${r.itemId}-${r.sourceCity || r.baseCity}-${Math.floor(r.buyPrice / 1000)}`;
      currentKeys.add(oppKey);
      
      if (!previousResultsRef.current.has(oppKey)) {
        locallyNewKeys.add(oppKey);
        const profit = r.profit;
        
        const cityMatch = alertSettings.cities.length === 0 || alertSettings.cities.includes('all') || alertSettings.cities.includes(r.sourceCity) || alertSettings.cities.includes(r.baseCity || '');

        if (profit >= alertSettings.minProfit && r.margin >= alertSettings.minMargin && cityMatch) {
          if (profit > highestProfit) {
            highestProfit = profit;
            bestResult = r;
          }
        }
      }
    }

    if (bestResult) {
      playNotificationSound();
      const title = `🔥 HOT DEAL Encontrado!`;
      const body = `Lucro Limpo: +${highestProfit.toLocaleString('pt-BR')} Prata (Margem: ${bestResult.margin.toFixed(1)}%) na rota ${bestResult.sourceCity || bestResult.baseCity} ➡️ ${bestResult.destCity}`;
      sendNotification(title, { body });
      
      // Dispatch Webhook
      if (alertSettings.webhookUrl) {
        sendWebhookMessage(alertSettings.webhookUrl, {
          username: "Aureus Black Market Scanner",
          avatar_url: "https://i.imgur.com/4M34hiw.png",
          embeds: [{
            title: `💎 Nova Oportunidade: ${bestResult.itemId}`,
            color: 16766720, // var(--mw-gold-bright) approx
            fields: [
              { name: "Lucro", value: `+${highestProfit.toLocaleString('pt-BR')} Prata`, inline: true },
              { name: "Margem", value: `${bestResult.margin.toFixed(1)}%`, inline: true },
              { name: "Rota", value: `${bestResult.sourceCity || bestResult.baseCity} ➡️ ${bestResult.destCity}`, inline: false }
            ],
            footer: { text: "Scan Automático Aureus Analytics" }
          }]
        });
      }
    }

    previousResultsRef.current = currentKeys;
    if (locallyNewKeys.size > 0 || newPulseKeys.size > 0) {
       setTimeout(() => setNewPulseKeys(locallyNewKeys), 0);
    }
  }, [results, isScanning, alertsEnabled, alertSettings.minProfit, alertSettings.minMargin, alertSettings.cities, alertSettings.webhookUrl, newPulseKeys.size]);

  const filteredResults = useFilteredResults(results, search);

  return {
    isScanning,
    progress,
    results,
    filteredResults,
    currentTab, setCurrentTab,
    scanMode, setScanMode,
    category, setCategory,
    tier, setTier,
    enchant, setEnchant,
    quality, setQuality,
    search, setSearch,
    settings, setSettings,
    alertsEnabled, toggleAlerts,
    autoRefreshInterval, setAutoRefreshInterval,
    nextRefreshTime,
    alertSettings, setAlertSettings,
    newPulseKeys,
    handleScan,
    isConfigValid
  };
}
