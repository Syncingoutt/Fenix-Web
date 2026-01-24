import { DailyPricePoint, PriceCache } from './database';

const DB_NAME = 'fenix_price_history';
const DB_VERSION = 1;
const STORE_NAME = 'priceHistory';

interface PriceHistoryRecord {
  baseId: string;
  history: DailyPricePoint[];
  updatedAt: number;
}

function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openPriceHistoryDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDbAvailable()) {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'baseId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadPriceHistoryMap(): Promise<Record<string, DailyPricePoint[]>> {
  try {
    if (!isIndexedDbAvailable()) {
      return {};
    }
    const db = await openPriceHistoryDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const records = await requestToPromise(store.getAll());
    db.close();
    const historyMap: Record<string, DailyPricePoint[]> = {};
    for (const record of records as PriceHistoryRecord[]) {
      if (record?.baseId && Array.isArray(record.history)) {
        historyMap[record.baseId] = record.history;
      }
    }
    return historyMap;
  } catch (error) {
    console.error('Failed to load price history from IndexedDB:', error);
    return {};
  }
}

export async function savePriceHistoryMap(histories: Record<string, DailyPricePoint[]>): Promise<void> {
  try {
    if (!isIndexedDbAvailable()) {
      return;
    }
    const db = await openPriceHistoryDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const now = Date.now();

    Object.entries(histories).forEach(([baseId, history]) => {
      store.put({ baseId, history, updatedAt: now } as PriceHistoryRecord);
    });

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  } catch (error) {
    console.error('Failed to save price history to IndexedDB:', error);
  }
}

export function mergePriceHistory(
  history: DailyPricePoint[] | undefined,
  price: number,
  timestamp: number
): DailyPricePoint[] {
  const existing = Array.isArray(history) ? [...history] : [];
  const bucket = Math.floor(timestamp / (6 * 60 * 60 * 1000)) * (6 * 60 * 60 * 1000);
  const sixHourKey = new Date(bucket).toISOString().slice(0, 13) + ':00:00';

  const idx = existing.findIndex(point => point.date === sixHourKey);
  if (idx >= 0) {
    existing[idx] = { date: sixHourKey, price };
  } else {
    existing.push({ date: sixHourKey, price });
  }

  existing.sort((a, b) => a.date.localeCompare(b.date));
  if (existing.length > 28) {
    return existing.slice(existing.length - 28);
  }
  return existing;
}

export async function updatePriceHistoryCache(prices: PriceCache): Promise<PriceCache> {
  const historyMap = await loadPriceHistoryMap();
  const updatedHistories: Record<string, DailyPricePoint[]> = {};
  const updatedPrices: PriceCache = {};

  for (const [baseId, entry] of Object.entries(prices)) {
    const history = mergePriceHistory(historyMap[baseId], entry.price, entry.timestamp);
    updatedHistories[baseId] = history;
    updatedPrices[baseId] = {
      ...entry,
      history
    };
  }

  if (Object.keys(updatedHistories).length > 0) {
    await savePriceHistoryMap(updatedHistories);
  }

  return updatedPrices;
}
