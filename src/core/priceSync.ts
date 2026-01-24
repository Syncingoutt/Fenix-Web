import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';
import { getFirestore, Firestore, collection, getDocs, Timestamp, query, where, orderBy, startAfter, limit, QueryConstraint } from 'firebase/firestore';
import { PriceCache, PriceCacheEntry } from './database';

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
  enabled: false,
  syncConsent: 'pending',
  firebase: {
    ...DEFAULT_FIREBASE_CONFIG
  }
};

const SYNC_CACHE_TTL_MS = 5000;

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
    if (!options?.forceFull && now - this.lastSyncAt < SYNC_CACHE_TTL_MS) {
      return this.lastSyncCache;
    }

    try {
      const cache: PriceCache = {};
      const cursorMs = this.lastSyncCursorMs ?? 0;
      const useIncremental = !options?.forceFull && cursorMs > 0;
      let maxUpdatedAtMs = useIncremental ? cursorMs : 0;
      
      if (useIncremental) {
        let lastDoc: unknown | null = null;
        let batchSize = 0;
        do {
          const constraints: QueryConstraint[] = [
            where('updatedAt', '>', Timestamp.fromMillis(cursorMs)),
            orderBy('updatedAt'),
            limit(500)
          ];
          if (lastDoc) {
            constraints.push(startAfter(lastDoc as any));
          }

          const snapshot = await getDocs(query(collection(this.db, 'prices'), ...constraints));
          batchSize = snapshot.size;
          if (batchSize === 0) break;

          snapshot.forEach(docSnap => {
            const data = docSnap.data() as Record<string, unknown>;
            const price = typeof data.price === 'number' ? data.price : null;
            const timestamp = typeof data.timestamp === 'number' ? data.timestamp : null;
            if (price === null || timestamp === null) return;
            const listingCount = typeof data.listingCount === 'number' ? data.listingCount : undefined;

            cache[docSnap.id] = {
              price,
              timestamp,
              ...(listingCount !== undefined && { listingCount })
            };

            const updatedAt = data.updatedAt;
            if (updatedAt instanceof Timestamp) {
              const updatedAtMs = updatedAt.toMillis();
              if (updatedAtMs > maxUpdatedAtMs) {
                maxUpdatedAtMs = updatedAtMs;
              }
            }
          });

          lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;
        } while (batchSize === 500);
      } else {
        const snapshot = await getDocs(collection(this.db, 'prices'));
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as Record<string, unknown>;
          const price = typeof data.price === 'number' ? data.price : null;
          const timestamp = typeof data.timestamp === 'number' ? data.timestamp : null;
          if (price === null || timestamp === null) return;
          const listingCount = typeof data.listingCount === 'number' ? data.listingCount : undefined;

          cache[docSnap.id] = {
            price,
            timestamp,
            ...(listingCount !== undefined && { listingCount })
          };

          const updatedAt = data.updatedAt;
          if (updatedAt instanceof Timestamp) {
            const updatedAtMs = updatedAt.toMillis();
            if (updatedAtMs > maxUpdatedAtMs) {
              maxUpdatedAtMs = updatedAtMs;
            }
          }
        });
      }

      if (maxUpdatedAtMs && maxUpdatedAtMs !== this.lastSyncCursorMs) {
        this.lastSyncCursorMs = maxUpdatedAtMs;
        if (this.config) {
          this.config.lastSyncCursorMs = maxUpdatedAtMs;
          saveCloudSyncConfig(this.config);
        }
      } else if (!this.lastSyncCursorMs || this.lastSyncCursorMs === 0) {
        // Fallback to avoid repeated full syncs if updatedAt is missing
        const fallbackCursor = Date.now() - 5 * 60 * 1000;
        this.lastSyncCursorMs = fallbackCursor;
        if (this.config) {
          this.config.lastSyncCursorMs = fallbackCursor;
          saveCloudSyncConfig(this.config);
        }
      }

      this.lastSyncAt = now;
      this.lastSyncCache = cache;
      return cache;
    } catch (error) {
      console.error('Failed to sync prices from cloud:', error);
      return {};
    }
  }
}
