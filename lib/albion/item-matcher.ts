import ITEM_NAMES from './item-names.json';

const nameMap = new Map<string, string>();
const lowerCaseEntries = Object.entries(ITEM_NAMES).map(([id, name]) => [id, (name as string).toLowerCase()]);

for (const [id, name] of lowerCaseEntries) {
  nameMap.set(name as string, id);
}

export function matchItemName(extractedName: string): string | null {
  const normalized = extractedName.toLowerCase().trim();
  
  // Exact match
  if (nameMap.has(normalized)) return nameMap.get(normalized)!;
  
  // Try to find the closest match
  for (const [id, name] of lowerCaseEntries) {
     if ((name as string).includes(normalized) || normalized.includes(name as string)) {
         return id;
     }
  }

  // Very aggressive fallback: look at individual words
  const words = normalized.split(' ');
  if (words.length > 2) {
      for (const [id, name] of lowerCaseEntries) {
          const nameWords = (name as string).split(' ');
          let matches = 0;
          for (const w of words) {
              if (w.length > 3 && nameWords.some(nw => nw.includes(w))) {
                  matches++;
              }
          }
          if (matches >= 2) return id; // At least 2 words matched
      }
  }

  return null;
}
