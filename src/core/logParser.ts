export interface ParsedLogEntry {
  timestamp: string;
  action: string;
  fullId: string;
  baseId: string;
  bagNum: number;
  slotId: number | null;
  pageId: number | null;
}

const CONFIG_KEY = 'fenix_config';

/**
 * Load the entire config from localStorage
 */
function loadConfig(): any {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to read config from localStorage:', error);
  }
  return {};
}

/**
 * Save the entire config to localStorage
 */
function saveConfig(config: any): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save config to localStorage:', error);
    throw error;
  }
}

/**
 * Get settings from localStorage
 */
export function getSettings(): { includeTax?: boolean } {
  const config = loadConfig();
  return config.settings || {};
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: { includeTax?: boolean }): void {
  const config = loadConfig();
  config.settings = { ...config.settings, ...settings };
  saveConfig(config);
}

function extractBaseId(fullId: string): string {
  return fullId.split('_')[0];
}

/** Treat all stash/inventory tab pages (100+) as tracked inventory pages. */
function isTrackedBagPage(pageId: number | null): boolean {
  return pageId !== null && pageId >= 100;
}

/**
 * Parse a BagMgr@:InitBagData line
 * Format: BagMgr@:InitBagData PageId = 102 SlotId = 1 ConfigBaseId = 100300 Num = 320
 */
function parseInitBagDataLine(line: string): ParsedLogEntry | null {
  if (!line.includes('BagMgr@:InitBagData')) return null;

  const pageMatch = line.match(/PageId\s*=\s*(\d+)/);
  const pageId = pageMatch ? parseInt(pageMatch[1]) : null;
  
  if (!isTrackedBagPage(pageId)) {
    return null;
  }

  const slotMatch = line.match(/SlotId\s*=\s*(\d+)/);
  const slotId = slotMatch ? parseInt(slotMatch[1]) : null;

  const baseIdMatch = line.match(/ConfigBaseId\s*=\s*(\d+)/);
  if (!baseIdMatch) return null;
  const baseId = baseIdMatch[1];

  const numMatch = line.match(/Num\s*=\s*(\d+)/);
  if (!numMatch) return null;
  const bagNum = parseInt(numMatch[1]);

  const timestampMatch = line.match(/\[([\d\.\-:]+)\]/);
  const timestamp = timestampMatch ? timestampMatch[1] : 'unknown';

  // For InitBagData, we create a synthetic fullId (since it doesn't have one)
  // We use baseId + pageId + slotId + timestamp to make it unique
  const fullId = `${baseId}_init_${pageId}_${slotId}_${timestamp}`;

  return {
    timestamp,
    action: 'Add',
    fullId,
    baseId,
    bagNum,
    slotId,
    pageId
  };
}

export function parseLogLine(line: string): ParsedLogEntry | null {
  const idMatch = line.match(/Id=([^\s]+)/);
  if (!idMatch) return null;
  
  const fullId = idMatch[1];
  const baseId = extractBaseId(fullId);

  let action = 'Unknown';
  if (line.includes('ItemChange@ Add')) action = 'Add';
  else if (line.includes('ItemChange@ Update')) action = 'Update';
  else if (line.includes('ItemChange@ Remove')) action = 'Remove';
  else if (line.includes('ItemChange@ Delete')) action = 'Delete';

  // Delete entries may not include BagNum
  const bagMatch = line.match(/BagNum=(\d+)/);
  let bagNum = 0;
  if (bagMatch) {
    bagNum = parseInt(bagMatch[1]);
  } else if (action !== 'Delete') {
    return null;
  }

  // Match both "PageId=" and "in PageId=" formats
  const pageMatch = line.match(/in\s+PageId\s*=\s*(\d+)/) || line.match(/PageId\s*=\s*(\d+)/);
  const pageId = pageMatch ? parseInt(pageMatch[1]) : null;
  
  if (!isTrackedBagPage(pageId)) {
    return null;
  }

  const timestampMatch = line.match(/\[([\d\.\-:]+)\]/);
  const timestamp = timestampMatch ? timestampMatch[1] : 'unknown';
  const slotMatch = line.match(/SlotId\s*=\s*(\d+)/);
  const slotId = slotMatch ? parseInt(slotMatch[1]) : null;

  return {
    timestamp,
    action,
    fullId,
    baseId,
    bagNum,
    slotId,
    pageId
  };
}

/**
 * Parse log file content (from uploaded file)
 */
export function parseLogContent(logContent: string): ParsedLogEntry[] {
  const lines = logContent.split('\n');

  // First, check if there's a ResetItemsLayout event (sort operation)
  // Look for the most recent ResetItemsLayout start/end pair
  let lastResetItemsLayoutStart = -1;
  let lastResetItemsLayoutEnd = -1;

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.includes('ItemChange@ ProtoName=ResetItemsLayout end') && lastResetItemsLayoutEnd === -1) {
      lastResetItemsLayoutEnd = i;
    }
    if (line.includes('ItemChange@ ProtoName=ResetItemsLayout start') && lastResetItemsLayoutStart === -1 && lastResetItemsLayoutEnd !== -1) {
      lastResetItemsLayoutStart = i;
      break;
    }
  }

  // If we found a ResetItemsLayout event, capture BagMgr@:InitBagData entries for tracked pages
  // AND also capture any ItemChange entries (like PickItems) that come after
  if (lastResetItemsLayoutStart !== -1 && lastResetItemsLayoutEnd !== -1) {
    const entries: ParsedLogEntry[] = [];
    
    // Look for InitBagData entries after the ResetItemsLayout end
    // Search until we hit another ResetItemsLayout start, or reach end of file
    // Use a larger initial window (500 lines) to ensure we capture all InitBagData entries
    // for tracked pages, but continue searching if needed
    const initialSearchEnd = Math.min(lastResetItemsLayoutEnd + 500, lines.length);
    const foundTrackedInitPages = new Set<number>();
    
    // First pass: collect InitBagData entries within initial window
    for (let i = lastResetItemsLayoutEnd; i < initialSearchEnd; i++) {
      const line = lines[i];
      
      // Stop if we hit another ResetItemsLayout start (new sort operation)
      if (line.includes('ItemChange@ ProtoName=ResetItemsLayout start')) {
        break;
      }
      
      // Parse InitBagData entries for tracked pages
      const parsed = parseInitBagDataLine(line);
      if (parsed) {
        // Check if we already have this slot (avoid duplicates)
        const existingIndex = entries.findIndex(e => 
          e.pageId === parsed.pageId && 
          e.slotId === parsed.slotId && 
          e.slotId !== null && 
          parsed.slotId !== null
        );
        
        if (existingIndex >= 0) {
          // Replace with newer entry (keep the latest)
          entries[existingIndex] = parsed;
        } else {
          entries.push(parsed);
        }
        
        if (parsed.pageId !== null) foundTrackedInitPages.add(parsed.pageId);
      }
    }
    
    // Continue scanning to catch all tracked pages and potential late InitBagData entries
    for (let i = initialSearchEnd; i < lines.length; i++) {
      const line = lines[i];

      // Stop if we hit another ResetItemsLayout start (new sort operation)
      if (line.includes('ItemChange@ ProtoName=ResetItemsLayout start')) {
        break;
      }

      const parsed = parseInitBagDataLine(line);
      if (parsed) {
        const existingIndex = entries.findIndex(e => 
          e.pageId === parsed.pageId && 
          e.slotId === parsed.slotId && 
          e.slotId !== null && 
          parsed.slotId !== null
        );

        if (existingIndex >= 0) {
          entries[existingIndex] = parsed;
        } else {
          entries.push(parsed);
        }
        if (parsed.pageId !== null) foundTrackedInitPages.add(parsed.pageId);
      }

      // Once we've seen multiple tracked pages and no nearby InitBagData lines, stop scanning.
      if (foundTrackedInitPages.size >= 2) {
        let hasNearbyInit = false;
        for (let j = i + 1; j < Math.min(i + 50, lines.length); j++) {
          if (lines[j].includes('BagMgr@:InitBagData')) {
            hasNearbyInit = true;
            break;
          }
          if (lines[j].includes('ItemChange@ ProtoName=ResetItemsLayout start')) {
            break;
          }
        }
        if (!hasNearbyInit) break;
      }
    }
    
    // ALSO collect all ItemChange entries after the ResetItemsLayout end
    // This includes PickItems events and other item updates that happen after sorting
    for (let i = lastResetItemsLayoutEnd; i < lines.length; i++) {
      const line = lines[i];
      
      // Stop if we hit another ResetItemsLayout start (new sort operation)
      if (line.includes('ItemChange@ ProtoName=ResetItemsLayout start')) {
        break;
      }
      
      // Parse ItemChange entries (Add, Update, Remove, Delete) that come after the sort
      if (line.includes('ItemChange@') && line.includes('Id=')) {
        const parsed = parseLogLine(line);
        if (parsed) {
          // First, check if we already have this exact fullId (for ItemChange entries)
          // This handles cases where the same item instance appears multiple times - keep the latest
          const duplicateIndex = entries.findIndex(e => e.fullId === parsed.fullId);
          if (duplicateIndex >= 0) {
            // Replace with newer entry (same fullId, but might have updated quantity)
            entries[duplicateIndex] = parsed;
          } else {
            // If this ItemChange entry corresponds to a slot we already have (from InitBagData or another ItemChange),
            // prefer the ItemChange entry (it's more recent and accurate)
            // Match by baseId + pageId + slotId to identify the same physical item stack
            // This handles cases where InitBagData shows quantity 600, then ItemChange@ Update shows quantity 664
            // Also handles multiple ItemChange updates for the same slot (replace older with newer)
            if (parsed.slotId !== null) {
              const existingIndex = entries.findIndex(e => 
                e.baseId === parsed.baseId &&
                e.pageId === parsed.pageId && 
                e.slotId === parsed.slotId && 
                e.slotId !== null
              );
              if (existingIndex >= 0) {
                // Replace existing entry (InitBagData or older ItemChange) with more recent ItemChange entry
                // The ItemChange entry has the updated quantity (or represents a new state)
                entries[existingIndex] = parsed;
              } else {
                // This is a new item instance (not in InitBagData, not in same slot, not a duplicate ItemChange)
                entries.push(parsed);
              }
            } else {
              // ItemChange entry without slotId - add it if not already present (rare case)
              entries.push(parsed);
            }
          }
        }
      }
    }
    
    // If we found entries, return them
    // These represent the complete state after sorting plus any updates (like PickItems)
    if (entries.length > 0) {
      return entries;
    }
    // If no entries found, fall through to normal processing
  }

  // Fall back to normal processing (find last reset for tracked pages)
  const lastResetsByPage = new Map<number, number>();

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    const resetMatch = line.match(/ItemChange@\s+Reset\s+PageId=(\d+)/);
    if (!resetMatch) continue;
    const pageId = parseInt(resetMatch[1]);
    if (!isTrackedBagPage(pageId)) continue;
    if (!lastResetsByPage.has(pageId)) {
      lastResetsByPage.set(pageId, i);
    }
  }

  let startIndex = Infinity;
  lastResetsByPage.forEach((value) => {
    if (value < startIndex) startIndex = value;
  });

  const relevantLines = startIndex === Infinity ? lines : lines.slice(startIndex);

  const entries: ParsedLogEntry[] = [];

  for (const line of relevantLines) {
    if (line.includes('ItemChange@') && line.includes('Id=')) {
      const parsed = parseLogLine(line);
      if (parsed) entries.push(parsed);
    }
  }

  return entries;
}
