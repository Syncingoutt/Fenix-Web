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

/**
 * Parse a BagMgr@:InitBagData line
 * Format: BagMgr@:InitBagData PageId = 102 SlotId = 1 ConfigBaseId = 100300 Num = 320
 */
function parseInitBagDataLine(line: string): ParsedLogEntry | null {
  if (!line.includes('BagMgr@:InitBagData')) return null;

  const pageMatch = line.match(/PageId\s*=\s*(\d+)/);
  const pageId = pageMatch ? parseInt(pageMatch[1]) : null;
  
  // Only process PageId 102 and 103
  if (pageId !== 102 && pageId !== 103) {
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

  const bagMatch = line.match(/BagNum=(\d+)/);
  if (!bagMatch) return null;
  const bagNum = parseInt(bagMatch[1]);

  const pageMatch = line.match(/PageId=(\d+)/);
  const pageId = pageMatch ? parseInt(pageMatch[1]) : null;
  
  if (pageId !== 102 && pageId !== 103) {
    return null;
  }

  const timestampMatch = line.match(/\[([\d\.\-:]+)\]/);
  const timestamp = timestampMatch ? timestampMatch[1] : 'unknown';

  let action = 'Unknown';
  if (line.includes('ItemChange@ Add')) action = 'Add';
  else if (line.includes('ItemChange@ Update')) action = 'Update';
  else if (line.includes('ItemChange@ Remove')) action = 'Remove';

  const slotMatch = line.match(/SlotId=(\d+)/);
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

  // If we found a ResetItemsLayout event, capture BagMgr@:InitBagData entries for both pages
  // AND also capture any ItemChange entries (like PickItems) that come after
  if (lastResetItemsLayoutStart !== -1 && lastResetItemsLayoutEnd !== -1) {
    const entries: ParsedLogEntry[] = [];
    
    // Look for InitBagData entries after the ResetItemsLayout end
    // Search until we hit another ResetItemsLayout start, or reach end of file
    // Use a larger initial window (500 lines) to ensure we capture all InitBagData entries
    // for pages 102 and 103, but continue searching if needed
    const initialSearchEnd = Math.min(lastResetItemsLayoutEnd + 500, lines.length);
    let foundInitBagData102 = false;
    let foundInitBagData103 = false;
    
    // First pass: collect InitBagData entries within initial window
    for (let i = lastResetItemsLayoutEnd; i < initialSearchEnd; i++) {
      const line = lines[i];
      
      // Stop if we hit another ResetItemsLayout start (new sort operation)
      if (line.includes('ItemChange@ ProtoName=ResetItemsLayout start')) {
        break;
      }
      
      // Parse InitBagData entries for PageId 102 and 103
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
        
        if (parsed.pageId === 102) foundInitBagData102 = true;
        if (parsed.pageId === 103) foundInitBagData103 = true;
      }
    }
    
    // If we didn't find InitBagData for both pages in initial window, continue searching
    // This handles cases where there are many items or other log entries between InitBagData lines
    if (!foundInitBagData102 || !foundInitBagData103) {
      for (let i = initialSearchEnd; i < lines.length; i++) {
        const line = lines[i];
        
        // Stop if we hit another ResetItemsLayout start (new sort operation)
        if (line.includes('ItemChange@ ProtoName=ResetItemsLayout start')) {
          break;
        }
        
        // Parse InitBagData entries for PageId 102 and 103
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
          
          if (parsed.pageId === 102) foundInitBagData102 = true;
          if (parsed.pageId === 103) foundInitBagData103 = true;
        }
        
        // Stop if we've found InitBagData for both pages and no more relevant entries likely
        // Continue a bit more to catch any stragglers (check 50 more lines after finding both)
        if (foundInitBagData102 && foundInitBagData103) {
          let checkMore = false;
          for (let j = i + 1; j < Math.min(i + 50, lines.length); j++) {
            if (lines[j].includes('BagMgr@:InitBagData')) {
              checkMore = true;
              break;
            }
            if (lines[j].includes('ItemChange@ ProtoName=ResetItemsLayout start')) {
              break;
            }
          }
          if (!checkMore) {
            break;
          }
        }
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
      
      // Parse ItemChange entries (Add, Update, Remove) that come after the sort
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

  // Fall back to normal processing (find last reset for each page)
  let lastReset102 = -1;
  let lastReset103 = -1;

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.includes('ItemChange@ Reset PageId=102') && lastReset102 === -1) {
      lastReset102 = i;
    }
    if (line.includes('ItemChange@ Reset PageId=103') && lastReset103 === -1) {
      lastReset103 = i;
    }
    if (lastReset102 !== -1 && lastReset103 !== -1) break;
  }

  const startIndex = Math.min(
    lastReset102 === -1 ? Infinity : lastReset102,
    lastReset103 === -1 ? Infinity : lastReset103
  );

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
