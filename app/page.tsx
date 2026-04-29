'use client';

import React from 'react';
import { MaterialsTracker } from '@/components/albion/MaterialsTracker';
import { EnchantAiChat } from '@/components/albion/EnchantAiChat';
import { InventoryPlanner } from '@/components/albion/InventoryPlanner';
import { SavedReports } from '@/components/albion/SavedReports';
import { PARENT_CATEGORIES, CATEGORIES, getAllItemIds } from '@/lib/albion/items';
import { TIERS, ENCHANTS } from '@/lib/albion/utils';
import { Search, Loader2, PlayCircle, Box } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { cn } from "@/lib/utils";
import { VirtualizedResultsList } from '@/components/albion/VirtualizedResultsList';
import { useScanLogic } from '@/hooks/useScanLogic';
import { ScanControls } from '@/components/scan/ScanControls';
import { ScanFiltersTopBar } from '@/components/scan/ScanFilters';

import dynamic from 'next/dynamic';

const HomeContent = dynamic(() => import('@/components/HomeContent'), {
  ssr: false,
});

export default function Page() {
  return <HomeContent />;
}

