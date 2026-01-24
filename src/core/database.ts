export interface ItemData {
  name: string;
  tradable?: boolean; // Optional for backwards compatibility, defaults to true if not specified
  group?: string; // Optional group identifier (e.g., "compass", "none")
}

export interface ItemDatabase {
  [baseId: string]: ItemData;
}

// Price point for history (one entry per 6-hour interval)
export interface DailyPricePoint {
  date: string; // ISO datetime string: YYYY-MM-DDTHH:00:00 (UTC, rounded to 6-hour intervals)
  price: number;
}

export interface PriceCacheEntry {
  price: number;
  timestamp: number; // Unix timestamp in milliseconds
  listingCount?: number; // Optional: number of listings used for average
  history?: DailyPricePoint[]; // Optional: last 28 price points (7 days * 4 updates per day, one per 6-hour interval)
}

export interface PriceCache {
  [baseId: string]: PriceCacheEntry;
}

// Legacy format for migration
interface LegacyPriceCache {
  [baseId: string]: number | PriceCacheEntry;
}

export function mergePriceCaches(localCache: PriceCache, cloudCache: PriceCache): PriceCache {
  const merged: PriceCache = { ...localCache };

  for (const [baseId, cloudEntry] of Object.entries(cloudCache)) {
    const localEntry = localCache[baseId];
    const cloudListings = cloudEntry.listingCount ?? 0;
    const localListings = localEntry?.listingCount ?? 0;
    let decision = 'use-cloud';
    let reason = 'no local entry';

    if (localEntry) {
      if (cloudEntry.timestamp > localEntry.timestamp) {
        decision = 'use-cloud';
        reason = 'cloud newer';
      } else if (cloudEntry.timestamp < localEntry.timestamp) {
        decision = 'keep-local';
        reason = 'local newer';
      } else if (cloudListings > localListings) {
        decision = 'use-cloud';
        reason = 'equal timestamp, cloud has more listings';
      } else {
        decision = 'keep-local';
        reason = 'equal timestamp, local has same or more listings';
      }
    }

    if (decision === 'use-cloud') {
      merged[baseId] = {
        ...cloudEntry,
        ...(localEntry?.history && { history: localEntry.history })
      };
    }
  }

  return merged;
}

const PRICE_CACHE_KEY = 'fenix_price_cache';

/**
 * Load item database from JSON file (via fetch)
 */
export async function loadItemDatabase(): Promise<ItemDatabase> {
  try {
    const baseUrl = import.meta.env.BASE_URL || '/';
    let response = await fetch(`${baseUrl}item_database.json`);
    if (!response.ok) {
      throw new Error(`Failed to load item database: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load item database:', error);
    return {};
  }
}

/**
 * Load price cache from localStorage
 */
export async function loadPriceCache(
  cloudCacheProvider?: (options?: { forceFull?: boolean }) => Promise<PriceCache>
): Promise<PriceCache> {
  try {
    const stored = localStorage.getItem(PRICE_CACHE_KEY);
    let localCache: PriceCache = {};
    
    if (stored) {
      const rawCache: LegacyPriceCache = JSON.parse(stored);
      
      // Migrate old format to new format if needed
      const migratedCache: PriceCache = {};
      let migrationNeeded = false;
      
      for (const [baseId, value] of Object.entries(rawCache)) {
        if (typeof value === 'number') {
          // Old format - migrate to new structure with current timestamp
          migratedCache[baseId] = {
            price: value,
            timestamp: Date.now()
          };
          migrationNeeded = true;
        } else {
          // Already new format
          migratedCache[baseId] = value;
        }
      }
      
      if (migrationNeeded) {
        console.log('💰 Migrated price cache to new format with timestamps');
      }
      
      localCache = migratedCache;
    }

    if (!cloudCacheProvider) {
      return localCache;
    }

    try {
      const forceFull = Object.keys(localCache).length === 0;
      const cloudCache = await cloudCacheProvider({ forceFull });
      return mergePriceCaches(localCache, cloudCache);
    } catch (error) {
      console.error('Failed to load cloud price cache:', error);
      return localCache;
    }
  } catch (error) {
    console.error('Failed to load price cache:', error);
    return {};
  }
}

/**
 * Save price cache to localStorage
 */
export async function savePriceCache(cache: PriceCache): Promise<void> {
  try {
    localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save price cache:', error);
  }
}
