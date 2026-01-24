import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';
import { getFirestore, Firestore, Timestamp, collection, getDocs } from 'firebase/firestore';
import { PriceCache, loadPriceCache } from './database';
import { updatePriceHistoryCache } from './priceHistoryStore';

type SyncConsent = 'pending' | 'granted' | 'denied';

interface CloudSyncConfig {
  enabled?: boolean;
  syncConsent?: SyncConsent;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    appId: string;
    messagingSenderId?: string;
    storageBucket?: string;
  };
  lastSyncCursorMs?: number;
}

const CONFIG_KEY = 'fenix_cloud_sync_config';
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAvz0DRZIJLNHQsHmPg7LaUq9s3N2eEQtg',
  authDomain: 'fenix-2c341.firebaseapp.com',
  projectId: 'fenix-2c341',
  appId: '1:387287127608:web:c4e5aa07b3b91389c5b8cd',
  messagingSenderId: '387287127608',
  storageBucket: 'fenix-2c341.firebasestorage.app'
};
const DEFAULT_CONFIG: CloudSyncConfig = {
  enabled: true,
  syncConsent: 'granted',
  firebase: {
    ...DEFAULT_FIREBASE_CONFIG
  }
};

const SYNC_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const PRICE_COLLECTION_PATH = 'prices';
const PRICE_LAST_SYNC_KEY = 'fenix_price_last_sync_at';

function parseTimestamp(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (value instanceof Timestamp) {
    return value.toMillis();
  }
  return null;
}

function loadLastSyncAt(): number {
  try {
    const stored = localStorage.getItem(PRICE_LAST_SYNC_KEY);
    const parsed = stored ? Number(stored) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function saveLastSyncAt(value: number): void {
  try {
    localStorage.setItem(PRICE_LAST_SYNC_KEY, String(value));
  } catch (error) {
    console.error('Failed to persist price sync timestamp:', error);
  }
}

function loadCloudSyncConfig(): CloudSyncConfig {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const raw = JSON.parse(stored);
      const mergedConfig: CloudSyncConfig = {
        ...DEFAULT_CONFIG,
        ...raw,
        firebase: {
          ...DEFAULT_CONFIG.firebase,
          ...(raw.firebase || {})
        }
      };
      return normalizeSyncConsent(applyDefaultFirebaseConfig(mergedConfig));
    }
  } catch (error) {
    console.error('Failed to read cloud sync config:', error);
  }
  return { ...DEFAULT_CONFIG };
}

function applyDefaultFirebaseConfig(config: CloudSyncConfig): CloudSyncConfig {
  const firebase = { ...config.firebase };
  let updated = false;

  (Object.keys(DEFAULT_FIREBASE_CONFIG) as Array<keyof typeof DEFAULT_FIREBASE_CONFIG>).forEach(key => {
    const value = firebase[key];
    if (!value || String(value).trim() === '') {
      firebase[key] = DEFAULT_FIREBASE_CONFIG[key];
      updated = true;
    }
  });

  return updated ? { ...config, firebase } : config;
}

function normalizeSyncConsent(config: CloudSyncConfig): CloudSyncConfig {
  let syncConsent = config.syncConsent;
  let enabled = config.enabled;

  if (!syncConsent) {
    syncConsent = 'pending';
  }

  if (syncConsent === 'pending') {
    enabled = false;
  } else if (syncConsent === 'granted') {
    enabled = true;
  } else if (syncConsent === 'denied') {
    enabled = false;
  }

  if (config.syncConsent === syncConsent && config.enabled === enabled) {
    return config;
  }

  return {
    ...config,
    syncConsent,
    enabled
  };
}

function saveCloudSyncConfig(config: CloudSyncConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save cloud sync config:', error);
  }
}

function hasFirebaseConfig(config: CloudSyncConfig): boolean {
  const firebase = config.firebase;
  return !!firebase.apiKey && !!firebase.authDomain && !!firebase.projectId && !!firebase.appId;
}

/**
 * Price Sync Service - Read-only version for web
 * Fetches prices from Firebase Firestore
 */
export class PriceSyncService {
  private config: CloudSyncConfig | null = null;
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private lastSyncAt = 0;
  private lastSyncCache: PriceCache = {};
  private initializing: Promise<boolean> | null = null;
  private lastSyncCursorMs: number | null = null;
  private lastCacheUpdatedAt: number | null = null;
  private lastCacheError: string | null = null;

  getSyncStatus(): { enabled: boolean; consent: SyncConsent } {
    if (!this.config) {
      this.config = loadCloudSyncConfig();
    }
    const normalized = normalizeSyncConsent(this.config);
    if (normalized !== this.config) {
      this.config = normalized;
      saveCloudSyncConfig(this.config);
    }
    const enabled = this.config.enabled === true;
    const consent = this.config.syncConsent ?? 'pending';
    return { enabled, consent };
  }

  async setSyncEnabled(enabled: boolean): Promise<void> {
    if (!this.config) {
      this.config = loadCloudSyncConfig();
    }
    const consent: SyncConsent = enabled ? 'granted' : 'denied';
    this.config.enabled = enabled;
    this.config.syncConsent = consent;
    saveCloudSyncConfig(this.config);

    if (enabled) {
      await this.initialize();
    }
  }

  async initialize(): Promise<boolean> {
    if (this.initializing) {
      return this.initializing;
    }

    this.initializing = this.initializeInternal();
    const result = await this.initializing;
    this.initializing = null;
    return result;
  }

  private async initializeInternal(): Promise<boolean> {
    this.config = loadCloudSyncConfig();
    if (typeof this.config.lastSyncCursorMs === 'number') {
      this.lastSyncCursorMs = this.config.lastSyncCursorMs;
    }

    if (!this.config.enabled) {
      return false;
    }

    if (!hasFirebaseConfig(this.config)) {
      console.warn('[sync] Firebase config missing. Sync disabled.');
      return false;
    }

    if (!this.app) {
      this.app = initializeApp(this.config.firebase);
    }

    if (!this.auth) {
      this.auth = getAuth(this.app);
    }

    if (!this.db) {
      this.db = getFirestore(this.app);
    }

    // Sign in anonymously if not already signed in
    if (!this.auth.currentUser) {
      try {
        await signInAnonymously(this.auth);
      } catch (error) {
        console.error('Failed to sign in anonymously:', error);
        return false;
      }
    }

    return true;
  }

  /**
   * Sync prices from Firebase (read-only)
   */
  async syncPrices(options?: { forceFull?: boolean }): Promise<PriceCache> {
    const ready = await this.initialize();
    if (!ready || !this.db) {
      return {};
    }

    const now = Date.now();
    if (!this.lastSyncAt) {
      this.lastSyncAt = loadLastSyncAt();
    }

    if (Object.keys(this.lastSyncCache).length === 0) {
      this.lastSyncCache = await loadPriceCache();
      if (Object.keys(this.lastSyncCache).length > 0) {
        const lastUpdated = Object.values(this.lastSyncCache)
          .map(entry => entry.timestamp)
          .filter(value => typeof value === 'number' && Number.isFinite(value))
          .reduce((max, value) => Math.max(max, value), 0);
        this.lastCacheUpdatedAt = lastUpdated || this.lastCacheUpdatedAt;
      }
    }

    if (!options?.forceFull && this.lastSyncAt && now - this.lastSyncAt < SYNC_CACHE_TTL_MS) {
      return this.lastSyncCache;
    }

    try {
      const snapshot = await getDocs(collection(this.db, PRICE_COLLECTION_PATH));
      const prices: PriceCache = {};
      let lastUpdatedAt: number | null = null;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        const price = typeof data.price === 'number' ? data.price : null;
        const timestamp = parseTimestamp(data.timestamp);

        if (price === null || timestamp === null) {
          return;
        }

        const listingCount = typeof data.listingCount === 'number' ? data.listingCount : undefined;
        prices[docSnap.id] = {
          price,
          timestamp,
          ...(listingCount !== undefined ? { listingCount } : {})
        };

        const updatedAt = parseTimestamp(data.updatedAt) ?? timestamp;
        if (updatedAt && (!lastUpdatedAt || updatedAt > lastUpdatedAt)) {
          lastUpdatedAt = updatedAt;
        }
      });

      const pricesWithHistory = await updatePriceHistoryCache(prices);
      this.lastSyncAt = now;
      saveLastSyncAt(now);
      this.lastSyncCache = pricesWithHistory;
      this.lastCacheUpdatedAt = lastUpdatedAt;
      this.lastCacheError = null;
      return pricesWithHistory;
    } catch (error) {
      console.error('Failed to sync prices from Firestore:', error);
      this.lastCacheError = 'Failed to read prices';
      return this.lastSyncCache;
    }
  }

  getCacheStatus(): { lastUpdated: number | null; lastError: string | null } {
    return { lastUpdated: this.lastCacheUpdatedAt, lastError: this.lastCacheError };
  }
}
