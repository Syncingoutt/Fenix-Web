// Web API adapter - replaces Electron IPC for web version

import { InventoryItem, ItemDatabase, PriceCache, PriceHistoryPoint, PriceHistoryByItem } from './types.js';
import { InventoryManager } from '../core/inventory.js';
import { loadItemDatabase, loadPriceCache, savePriceCache } from '../core/database.js';
import { parseLogContent, getSettings, saveSettings } from '../core/logParser.js';
import { PriceSyncService } from '../core/priceSync.js';
import { FLAME_ELEMENTIUM_ID } from './constants.js';

// Global state
let inventoryManager: InventoryManager | null = null;
let itemDatabase: ItemDatabase | null = null;
let priceSyncService: PriceSyncService | null = null;
let realtimeTimerInterval: number | null = null;
let hourlyTimerInterval: number | null = null;
let realtimeSeconds = 0;
let hourlySeconds = 0;
let hourlyActive = false;
let hourlyPaused = false;
let timerCallbacks: Array<(data: { type: string; seconds: number }) => void> = [];
let inventoryUpdateCallbacks: Array<() => void> = [];
const INVENTORY_CACHE_KEY = 'fenix_inventory_cache';

function persistInventoryCacheIfNotEmpty(): void {
  if (!inventoryManager) return;
  const inventory = inventoryManager.getInventory();
  // Never clobber existing cache during startup with an empty snapshot.
  if (inventory.length === 0) return;
  localStorage.setItem(INVENTORY_CACHE_KEY, JSON.stringify(inventory));
}

// Initialize services
export async function initializeWebAPI(): Promise<void> {
  // Load item database
  itemDatabase = await loadItemDatabase();
  
  // Initialize price sync service
  priceSyncService = new PriceSyncService();
  await priceSyncService.setSyncEnabled(true);
  
  // Register callback for real-time price updates from onSnapshot
  priceSyncService.onPriceUpdate(async (cache) => {
    if (inventoryManager) {
      inventoryManager.applyPriceCache(cache);
      await savePriceCache(inventoryManager.getPriceCacheAsObject());
      persistInventoryCacheIfNotEmpty();
      notifyInventoryUpdate();
    }
  });
  
  // Load price cache
  const priceCache = await loadPriceCache((options) =>
    priceSyncService ? priceSyncService.syncPrices(options) : Promise.resolve({})
  );
  
  // Initialize inventory manager
  inventoryManager = new InventoryManager(itemDatabase, priceCache);

  // Ensure startup uses the freshest cloud prices before first render.
  if (priceSyncService && inventoryManager) {
    const startupCloudCache = await priceSyncService.syncPrices({ forceFull: true });
    if (Object.keys(startupCloudCache).length > 0) {
      inventoryManager.applyPriceCache(startupCloudCache);
      await savePriceCache(inventoryManager.getPriceCacheAsObject());
    }
  }

  // Restore cached inventory (if any)
  const cached = localStorage.getItem(INVENTORY_CACHE_KEY);
  if (cached && inventoryManager) {
    try {
      const parsed = JSON.parse(cached) as InventoryItem[];
      if (Array.isArray(parsed)) {
        inventoryManager.hydrateInventory(parsed);
        // Keep restored quantities but refresh values from the latest cached prices.
        inventoryManager.applyPriceCache(inventoryManager.getPriceCacheAsObject());
        notifyInventoryUpdate();
      }
    } catch (error) {
      console.warn('Failed to restore cached inventory:', error);
    }
  }
  
  // Start price sync interval (every 20 minutes)
  // Use forceFull to bypass cache and always fetch fresh snapshot
  setInterval(async () => {
    if (priceSyncService) {
      const cloudCache = await priceSyncService.syncPrices({ forceFull: true });
      if (inventoryManager) {
        inventoryManager.applyPriceCache(cloudCache);
        await savePriceCache(inventoryManager.getPriceCacheAsObject());
        persistInventoryCacheIfNotEmpty();
        notifyInventoryUpdate();
      }
    }
  }, 20 * 60 * 1000); // 20 minutes
  
  // Start realtime timer
  startRealtimeTimer();
}

// Timer management
function startRealtimeTimer(): void {
  if (realtimeTimerInterval) return;
  
  realtimeTimerInterval = window.setInterval(() => {
    realtimeSeconds++;
    timerCallbacks.forEach(cb => cb({ type: 'realtime', seconds: realtimeSeconds }));
  }, 1000);
}

function startHourlyTimer(): void {
  if (hourlyTimerInterval) return;
  
  hourlyTimerInterval = window.setInterval(() => {
    if (hourlyActive && !hourlyPaused) {
      hourlySeconds++;
      timerCallbacks.forEach(cb => cb({ type: 'hourly', seconds: hourlySeconds }));
    }
  }, 1000);
}

function stopHourlyTimer(): void {
  if (hourlyTimerInterval) {
    clearInterval(hourlyTimerInterval);
    hourlyTimerInterval = null;
  }
}

function notifyInventoryUpdate(): void {
  inventoryUpdateCallbacks.forEach(cb => cb());
}

// Web API implementation
export const webAPI = {
  async getInventory(): Promise<InventoryItem[]> {
    if (!inventoryManager) return [];
    const inventory = inventoryManager.getInventory();
    // Set Flame Elementium price to 1 FE
    return inventory.map(item => {
      if (item.baseId === FLAME_ELEMENTIUM_ID) {
        return { ...item, price: 1 };
      }
      return item;
    });
  },

  async getItemDatabase(): Promise<ItemDatabase> {
    if (!itemDatabase) {
      itemDatabase = await loadItemDatabase();
    }
    return itemDatabase;
  },

  async getPriceCache(): Promise<PriceCache> {
    if (!inventoryManager) return {};
    return inventoryManager.getPriceCacheAsObject();
  },

  async getPriceHistory(payload: { baseId: string; leagueId?: string; maxDays?: number; maxSnapshotDocs?: number }): Promise<PriceHistoryPoint[]> {
    if (!priceSyncService) return [];
    const baseId = payload?.baseId ?? '';
    const leagueId = payload?.leagueId;
    const maxDays = payload?.maxDays;
    const maxSnapshotDocs = payload?.maxSnapshotDocs;
    return priceSyncService.getPriceHistory({ baseId, leagueId, maxDays, maxSnapshotDocs });
  },

  async getPriceHistoryBatch(payload?: { leagueId?: string; maxDays?: number; maxSnapshotDocs?: number }): Promise<PriceHistoryByItem> {
    if (!priceSyncService) return {};
    const leagueId = payload?.leagueId;
    const maxDays = payload?.maxDays;
    const maxSnapshotDocs = payload?.maxSnapshotDocs;
    return priceSyncService.getPriceHistoryBatch({ leagueId, maxDays, maxSnapshotDocs });
  },

  getPriceCacheStatus(): { lastUpdated: number | null; lastError: string | null } {
    if (!priceSyncService) return { lastUpdated: null, lastError: 'Price sync not initialized' };
    return priceSyncService.getCacheStatus();
  },

  onInventoryUpdate(callback: () => void): void {
    inventoryUpdateCallbacks.push(callback);
  },

  startHourlyTimer(): void {
    hourlyActive = true;
    hourlyPaused = false;
    hourlySeconds = 0;
    startHourlyTimer();
  },

  pauseHourlyTimer(): void {
    hourlyPaused = true;
  },

  resumeHourlyTimer(): void {
    hourlyPaused = false;
  },

  stopHourlyTimer(): void {
    hourlyActive = false;
    hourlyPaused = false;
    hourlySeconds = 0;
    stopHourlyTimer();
  },

  resetRealtimeTimer(): void {
    realtimeSeconds = 0;
  },

  async getTimerState(): Promise<{ realtimeSeconds: number; hourlySeconds: number }> {
    return { realtimeSeconds, hourlySeconds };
  },

  onTimerTick(callback: (data: { type: string; seconds: number }) => void): void {
    timerCallbacks.push(callback);
  },

  async getAppVersion(): Promise<string> {
    return '2.4.0';
  },

  async checkForUpdates(): Promise<{ success: boolean; message?: string }> {
    return { success: false, message: 'Updates not available in web version' };
  },

  onUpdateStatus(_callback: (data: { status: string; message?: string; version?: string }) => void): void {
    // No-op in web version
  },

  onUpdateProgress(_callback: (percent: number) => void): void {
    // No-op in web version
  },

  onShowUpdateDialog(_callback: (data: { type: 'available' | 'downloaded'; version: string; currentVersion?: string }) => void): void {
    // No-op in web version
  },

  onUpdateDownloadedTransition(_callback: (data: { version: string }) => void): void {
    // No-op in web version
  },

  sendUpdateDialogResponse(_response: 'download' | 'restart' | 'later'): void {
    // No-op in web version
  },

  async isLogPathConfigured(): Promise<boolean> {
    // In web version, we check if a log has been uploaded
    return localStorage.getItem('fenix_log_uploaded') === 'true';
  },

  async selectLogFile(): Promise<string | null> {
    // This will be handled by file upload UI
    return null;
  },

  onShowLogPathSetup(_callback: () => void): void {
    // No-op - handled by UI
  },

  async getSettings(): Promise<{ includeTax?: boolean }> {
    return getSettings();
  },

  async saveSettings(settings: { includeTax?: boolean }): Promise<{ success: boolean; error?: string }> {
    try {
      saveSettings(settings);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to save settings' };
    }
  },

  async getUsernameInfo(): Promise<{ username?: string; tag?: string; displayName?: string; nextChangeAt?: number; canChange: boolean }> {
    return { canChange: false };
  },

  async setUsername(_username: string): Promise<{ success: boolean; error?: string; nextChangeAt?: number }> {
    return { success: false, error: 'Username not supported in web version' };
  },

  async getCloudSyncStatus(): Promise<{ enabled: boolean; consent: 'pending' | 'granted' | 'denied' }> {
    if (!priceSyncService) return { enabled: false, consent: 'pending' };
    return priceSyncService.getSyncStatus();
  },

  async setCloudSyncEnabled(enabled: boolean): Promise<{ success: boolean; error?: string }> {
    if (!priceSyncService) return { success: false, error: 'Price sync service not initialized' };
    try {
      await priceSyncService.setSyncEnabled(enabled);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update cloud sync setting' };
    }
  },

  onShowSyncConsent(_callback: () => void): void {
    // No-op - handled by UI
  },

  async testKeybind(_keybind: string): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Keybinds not supported in web version' };
  },

  onCloseSettingsModal(_callback: () => void): void {
    // No-op - handled by UI
  },

  onWindowModeChanged(_callback: (data: { fullscreenMode: boolean }) => void): void {
    // No-op in web version
  },

  minimizeWindow(): void {
    // No-op in web version
  },

  maximizeWindow(): void {
    // No-op in web version
  },

  closeWindow(): void {
    // No-op in web version
  },

  openExternal(url: string): void {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.warn('Failed to open external URL:', error);
    }
  },

  onMaximizeStateChanged(_callback: (isMaximized: boolean) => void): void {
    // No-op in web version
  },

  async getMaximizeState(): Promise<boolean> {
    return false;
  },

  // Overlay widget APIs are desktop-only and omitted in web build.
};

// File upload handler
export async function handleLogFileUpload(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const logEntries = parseLogContent(content);
        
        if (!inventoryManager || !itemDatabase) {
          await initializeWebAPI();
        }
        
        if (inventoryManager) {
          inventoryManager.buildInventory(logEntries);

          // Fetch latest prices after upload so user doesn't need refresh
          if (priceSyncService) {
            const cloudCache = await priceSyncService.syncPrices({ forceFull: true });
            inventoryManager.applyPriceCache(cloudCache);
          }

          await savePriceCache(inventoryManager.getPriceCacheAsObject());
          // Persist inventory for refresh restore
          localStorage.setItem(INVENTORY_CACHE_KEY, JSON.stringify(inventoryManager.getInventory()));
          localStorage.setItem('fenix_log_uploaded', 'true');
          notifyInventoryUpdate();
          resolve();
        } else {
          reject(new Error('Inventory manager not initialized'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}
