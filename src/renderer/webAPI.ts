// Web API adapter - replaces Electron IPC for web version

import { InventoryItem, ItemDatabase, PriceCache } from './types.js';
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

// Initialize services
export async function initializeWebAPI(): Promise<void> {
  // Load item database
  itemDatabase = await loadItemDatabase();
  
  // Initialize price sync service
  priceSyncService = new PriceSyncService();
  
  // Load price cache
  const priceCache = await loadPriceCache((options) => 
    priceSyncService ? priceSyncService.syncPrices(options) : Promise.resolve({})
  );
  
  // Initialize inventory manager
  inventoryManager = new InventoryManager(itemDatabase, priceCache);
  
  // Start price sync interval (every hour)
  setInterval(async () => {
    if (priceSyncService) {
      const cloudCache = await priceSyncService.syncPrices();
      if (inventoryManager) {
        const localCache = inventoryManager.getPriceCacheAsObject();
        // Merge cloud prices into local cache
        for (const [baseId, cloudEntry] of Object.entries(cloudCache)) {
          const localEntry = localCache[baseId];
          if (!localEntry || cloudEntry.timestamp > localEntry.timestamp) {
            inventoryManager.updatePrice(baseId, cloudEntry.price, cloudEntry.listingCount, cloudEntry.timestamp);
          }
        }
        await savePriceCache(inventoryManager.getPriceCacheAsObject());
        notifyInventoryUpdate();
      }
    }
  }, 60 * 60 * 1000); // 1 hour
  
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

  onMaximizeStateChanged(_callback: (isMaximized: boolean) => void): void {
    // No-op in web version
  },

  async getMaximizeState(): Promise<boolean> {
    return false;
  },

  toggleOverlayWidget(): void {
    // No-op in web version
  },

  updateOverlayWidget(_data: { duration: number; hourly: number; total: number; isHourlyMode: boolean; isPaused: boolean }): void {
    // No-op in web version
  },

  onWidgetPauseHourly(_callback: () => void): void {
    // No-op in web version
  },

  onWidgetResumeHourly(_callback: () => void): void {
    // No-op in web version
  }
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
          await savePriceCache(inventoryManager.getPriceCacheAsObject());
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
