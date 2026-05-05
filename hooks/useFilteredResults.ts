import { useMemo } from 'react';
import { TradeResult } from '@/lib/albion/types';
import { useDebounce } from './useDebounce';

export function useFilteredResults(results: TradeResult[], search: string) {
  const debouncedSearch = useDebounce(search, 300);

  const filteredResults = useMemo(() => {
    if (!debouncedSearch) return results;
    const s = debouncedSearch.toLowerCase();
    return results.filter(r => r.itemId.toLowerCase().includes(s));
  }, [results, debouncedSearch]);

  return filteredResults;
}
