/**
 * Bulk Data Storage Layer for LeadNoria (Phase 2)
 *
 * Implements structured, high-scale persistence via IndexedDB ('leadnoria-research')
 * with a resilient in-memory fallback for non-browser/test execution environments.
 *
 * Stores:
 * - runs: authoritative run configs and summaries
 * - ads: individual raw scraped ad records keyed by [runId, libraryId]
 * - entities: deduplicated candidate/lead records keyed by [runId, canonicalKey]
 * - evidence: structured relevance evidence records keyed by [runId, canonicalKey]
 * - checkpoints: incremental recovery snapshots keyed by [runId, batchIndex]
 * - dedupIndex: lookup entries for seen ad IDs and entity keys
 */

import type { ExtensionLead, ExtensionResearchRun, ScrapedAdCandidate } from './types.ts';

const DB_NAME = 'leadnoria-research';
const DB_VERSION = 1;

export interface BulkBatchPayload {
  batchIndex: number;
  ads: ScrapedAdCandidate[];
  entities: ExtensionLead[];
  evidence?: Array<{ canonicalKey: string; evidence: any }>;
  checkpoint: {
    runId: string;
    batchIndex: number;
    timestamp: string;
    activeKeywordIndex: number;
    currentKeyword: string;
    rawAdsCount: number;
    normalizedCandidatesCount: number;
    uniqueEntitiesCount: number;
    relevantEntitiesCount: number;
    uncertainEntitiesCount: number;
    notRelevantEntitiesCount: number;
    duplicatesRemovedCount: number;
    finalUniqueRelevantLeads: number;
    seenLibraryIdsCount: number;
    seenEntityKeysCount: number;
  };
}

export interface StorageStats {
  runId: string;
  totalAds: number;
  totalEntities: number;
  totalRelevantLeads: number;
  totalCheckpoints: number;
  estimatedBytes: number;
}

// In-memory fallback structures when IndexedDB is unavailable (e.g. Node test environments)
class MemoryStoreFallback {
  runs = new Map<string, ExtensionResearchRun>();
  ads = new Map<string, ScrapedAdCandidate & { runId: string }>(); // key: `${runId}_${libraryId}`
  entities = new Map<string, ExtensionLead & { runId: string; canonicalKey: string }>(); // key: `${runId}_${canonicalKey}`
  evidence = new Map<string, any>(); // key: `${runId}_${canonicalKey}`
  checkpoints = new Map<string, any>(); // key: `${runId}_${batchIndex}`
  dedupAds = new Map<string, Set<string>>(); // runId -> Set<libraryId>
  dedupEntities = new Map<string, Set<string>>(); // runId -> Set<canonicalKey>

  async saveRun(run: ExtensionResearchRun): Promise<void> {
    this.runs.set(run.runId, JSON.parse(JSON.stringify(run)));
  }

  async getRun(runId: string): Promise<ExtensionResearchRun | null> {
    const r = this.runs.get(runId);
    return r ? JSON.parse(JSON.stringify(r)) : null;
  }

  async saveBatch(runId: string, payload: BulkBatchPayload): Promise<void> {
    if (!this.dedupAds.has(runId)) this.dedupAds.set(runId, new Set());
    if (!this.dedupEntities.has(runId)) this.dedupEntities.set(runId, new Set());
    const adSet = this.dedupAds.get(runId)!;
    const entSet = this.dedupEntities.get(runId)!;

    for (const ad of payload.ads) {
      this.ads.set(`${runId}_${ad.libraryId}`, { ...ad, runId });
      adSet.add(ad.libraryId);
    }

    for (const ent of payload.entities) {
      const canonicalKey = ent.canonicalName ? ent.canonicalName.toLowerCase() : ent.name.toLowerCase();
      this.entities.set(`${runId}_${canonicalKey}`, { ...ent, runId, canonicalKey });
      entSet.add(canonicalKey);
    }

    if (payload.evidence) {
      for (const ev of payload.evidence) {
        this.evidence.set(`${runId}_${ev.canonicalKey}`, ev.evidence);
      }
    }

    this.checkpoints.set(`${runId}_${payload.batchIndex}`, payload.checkpoint);
  }

  async getAllRelevantLeads(runId: string): Promise<ExtensionLead[]> {
    const results: ExtensionLead[] = [];
    for (const [key, ent] of this.entities.entries()) {
      if (key.startsWith(`${runId}_`)) {
        if (!ent.relevanceDecision || ent.relevanceDecision === 'RELEVANT') {
          results.push(JSON.parse(JSON.stringify(ent)));
        }
      }
    }
    return results;
  }

  async getEntity(runId: string, canonicalKey: string): Promise<ExtensionLead | null> {
    const ent = this.entities.get(`${runId}_${canonicalKey.toLowerCase()}`);
    return ent ? JSON.parse(JSON.stringify(ent)) : null;
  }

  async getSeenAdIds(runId: string): Promise<Set<string>> {
    return new Set(this.dedupAds.get(runId) || []);
  }

  async getSeenEntityKeys(runId: string): Promise<Set<string>> {
    return new Set(this.dedupEntities.get(runId) || []);
  }

  async getLatestCheckpoint(runId: string): Promise<any | null> {
    let latestIndex = -1;
    let latestCp: any = null;
    for (const [key, cp] of this.checkpoints.entries()) {
      if (key.startsWith(`${runId}_`)) {
        if (cp.batchIndex > latestIndex) {
          latestIndex = cp.batchIndex;
          latestCp = cp;
        }
      }
    }
    return latestCp ? JSON.parse(JSON.stringify(latestCp)) : null;
  }

  async getStorageStats(runId: string): Promise<StorageStats> {
    let totalAds = 0;
    let totalEntities = 0;
    let totalRelevant = 0;
    let totalCheckpoints = 0;
    let bytes = 0;

    for (const [k, v] of this.ads.entries()) {
      if (k.startsWith(`${runId}_`)) {
        totalAds++;
        bytes += JSON.stringify(v).length;
      }
    }
    for (const [k, v] of this.entities.entries()) {
      if (k.startsWith(`${runId}_`)) {
        totalEntities++;
        if (!v.relevanceDecision || v.relevanceDecision === 'RELEVANT') totalRelevant++;
        bytes += JSON.stringify(v).length;
      }
    }
    for (const [k, v] of this.checkpoints.entries()) {
      if (k.startsWith(`${runId}_`)) {
        totalCheckpoints++;
        bytes += JSON.stringify(v).length;
      }
    }

    return {
      runId,
      totalAds,
      totalEntities,
      totalRelevantLeads: totalRelevant,
      totalCheckpoints,
      estimatedBytes: bytes
    };
  }

  async clearRun(runId: string): Promise<void> {
    this.runs.delete(runId);
    this.dedupAds.delete(runId);
    this.dedupEntities.delete(runId);
    for (const k of Array.from(this.ads.keys())) {
      if (k.startsWith(`${runId}_`)) this.ads.delete(k);
    }
    for (const k of Array.from(this.entities.keys())) {
      if (k.startsWith(`${runId}_`)) this.entities.delete(k);
    }
    for (const k of Array.from(this.evidence.keys())) {
      if (k.startsWith(`${runId}_`)) this.evidence.delete(k);
    }
    for (const k of Array.from(this.checkpoints.keys())) {
      if (k.startsWith(`${runId}_`)) this.checkpoints.delete(k);
    }
  }
}

const memoryFallback = new MemoryStoreFallback();

function hasIndexedDB(): boolean {
  return typeof indexedDB !== 'undefined' && indexedDB !== null;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDB()) {
      return reject(new Error('IndexedDB not available'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      // 1. runs store
      if (!db.objectStoreNames.contains('runs')) {
        db.createObjectStore('runs', { keyPath: 'runId' });
      }

      // 2. ads store
      if (!db.objectStoreNames.contains('ads')) {
        const adStore = db.createObjectStore('ads', { keyPath: ['runId', 'libraryId'] });
        adStore.createIndex('by_run', 'runId', { unique: false });
      }

      // 3. entities store (leads)
      if (!db.objectStoreNames.contains('entities')) {
        const entStore = db.createObjectStore('entities', { keyPath: ['runId', 'canonicalKey'] });
        entStore.createIndex('by_run', 'runId', { unique: false });
        entStore.createIndex('by_run_decision', ['runId', 'relevanceDecision'], { unique: false });
      }

      // 4. evidence store
      if (!db.objectStoreNames.contains('evidence')) {
        const evStore = db.createObjectStore('evidence', { keyPath: ['runId', 'canonicalKey'] });
        evStore.createIndex('by_run', 'runId', { unique: false });
      }

      // 5. checkpoints store
      if (!db.objectStoreNames.contains('checkpoints')) {
        const cpStore = db.createObjectStore('checkpoints', { keyPath: ['runId', 'batchIndex'] });
        cpStore.createIndex('by_run', 'runId', { unique: false });
      }

      // 6. dedupIndex store
      if (!db.objectStoreNames.contains('dedupIndex')) {
        const dedupStore = db.createObjectStore('dedupIndex', { keyPath: ['runId', 'idType', 'idVal'] });
        dedupStore.createIndex('by_run', 'runId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Initializes the bulk store. Safe to call multiple times.
 */
export async function initBulkStore(): Promise<boolean> {
  if (!hasIndexedDB()) {
    return false;
  }
  try {
    const db = await openDB();
    db.close();
    return true;
  } catch (err) {
    console.warn('[bulkStore] IndexedDB init failed, using memory fallback:', err);
    return false;
  }
}

/**
 * Saves authoritative run record
 */
export async function saveRunRecord(run: ExtensionResearchRun): Promise<void> {
  if (!hasIndexedDB()) {
    return memoryFallback.saveRun(run);
  }

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('runs', 'readwrite');
      tx.objectStore('runs').put(run);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    return memoryFallback.saveRun(run);
  }
}

/**
 * Atomically saves a processed batch into IndexedDB (or fallback)
 */
export async function saveBatch(runId: string, payload: BulkBatchPayload): Promise<void> {
  if (!hasIndexedDB()) {
    return memoryFallback.saveBatch(runId, payload);
  }

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(['ads', 'entities', 'evidence', 'checkpoints', 'dedupIndex'], 'readwrite');

      const adStore = tx.objectStore('ads');
      const entStore = tx.objectStore('entities');
      const evStore = tx.objectStore('evidence');
      const cpStore = tx.objectStore('checkpoints');
      const dedupStore = tx.objectStore('dedupIndex');

      // 1. Persist raw ads
      for (const ad of payload.ads) {
        adStore.put({ ...ad, runId });
        dedupStore.put({ runId, idType: 'AD_ID', idVal: ad.libraryId });
      }

      // 2. Persist updated/new entities
      for (const ent of payload.entities) {
        const canonicalKey = ent.canonicalName ? ent.canonicalName.toLowerCase() : ent.name.toLowerCase();
        entStore.put({ ...ent, runId, canonicalKey });
        dedupStore.put({ runId, idType: 'ENTITY_KEY', idVal: canonicalKey });
      }

      // 3. Persist evidence if provided
      if (payload.evidence) {
        for (const ev of payload.evidence) {
          evStore.put({ runId, canonicalKey: ev.canonicalKey, evidence: ev.evidence });
        }
      }

      // 4. Persist batch checkpoint
      cpStore.put({ ...payload.checkpoint, runId, batchIndex: payload.batchIndex });

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    return memoryFallback.saveBatch(runId, payload);
  }
}

/**
 * Retrieves all final unique relevant leads for a research run
 */
export async function getAllRelevantLeads(runId: string): Promise<ExtensionLead[]> {
  if (!hasIndexedDB()) {
    return memoryFallback.getAllRelevantLeads(runId);
  }

  try {
    const db = await openDB();
    return await new Promise<ExtensionLead[]>((resolve, reject) => {
      const tx = db.transaction('entities', 'readonly');
      const store = tx.objectStore('entities');
      const index = store.index('by_run');
      const request = index.getAll(runId);

      request.onsuccess = () => {
        db.close();
        const records = (request.result || []) as Array<ExtensionLead & { relevanceDecision?: string }>;
        const relevant = records.filter(r => !r.relevanceDecision || r.relevanceDecision === 'RELEVANT');
        resolve(relevant);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    return memoryFallback.getAllRelevantLeads(runId);
  }
}

/**
 * Gets a single entity by canonical name key
 */
export async function getEntity(runId: string, canonicalKey: string): Promise<ExtensionLead | null> {
  const normKey = canonicalKey.toLowerCase();
  if (!hasIndexedDB()) {
    return memoryFallback.getEntity(runId, normKey);
  }

  try {
    const db = await openDB();
    return await new Promise<ExtensionLead | null>((resolve, reject) => {
      const tx = db.transaction('entities', 'readonly');
      const store = tx.objectStore('entities');
      const request = store.get([runId, normKey]);

      request.onsuccess = () => {
        db.close();
        resolve(request.result || null);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    return memoryFallback.getEntity(runId, normKey);
  }
}

/**
 * Returns set of seen ad library IDs for fast deduplication
 */
export async function getSeenAdIds(runId: string): Promise<Set<string>> {
  if (!hasIndexedDB()) {
    return memoryFallback.getSeenAdIds(runId);
  }

  try {
    const db = await openDB();
    return await new Promise<Set<string>>((resolve, reject) => {
      const tx = db.transaction('dedupIndex', 'readonly');
      const store = tx.objectStore('dedupIndex');
      const index = store.index('by_run');
      const request = index.getAll(runId);

      request.onsuccess = () => {
        db.close();
        const items = (request.result || []) as Array<{ idType: string; idVal: string }>;
        const ids = new Set<string>();
        for (const it of items) {
          if (it.idType === 'AD_ID') ids.add(it.idVal);
        }
        resolve(ids);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    return memoryFallback.getSeenAdIds(runId);
  }
}

/**
 * Returns set of seen canonical entity keys for fast deduplication
 */
export async function getSeenEntityKeys(runId: string): Promise<Set<string>> {
  if (!hasIndexedDB()) {
    return memoryFallback.getSeenEntityKeys(runId);
  }

  try {
    const db = await openDB();
    return await new Promise<Set<string>>((resolve, reject) => {
      const tx = db.transaction('dedupIndex', 'readonly');
      const store = tx.objectStore('dedupIndex');
      const index = store.index('by_run');
      const request = index.getAll(runId);

      request.onsuccess = () => {
        db.close();
        const items = (request.result || []) as Array<{ idType: string; idVal: string }>;
        const keys = new Set<string>();
        for (const it of items) {
          if (it.idType === 'ENTITY_KEY') keys.add(it.idVal);
        }
        resolve(keys);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    return memoryFallback.getSeenEntityKeys(runId);
  }
}

/**
 * Retrieves latest checkpoint for a run
 */
export async function getLatestCheckpoint(runId: string): Promise<any | null> {
  if (!hasIndexedDB()) {
    return memoryFallback.getLatestCheckpoint(runId);
  }

  try {
    const db = await openDB();
    return await new Promise<any | null>((resolve, reject) => {
      const tx = db.transaction('checkpoints', 'readonly');
      const store = tx.objectStore('checkpoints');
      const index = store.index('by_run');
      const request = index.getAll(runId);

      request.onsuccess = () => {
        db.close();
        const items = (request.result || []) as any[];
        if (items.length === 0) return resolve(null);
        items.sort((a, b) => b.batchIndex - a.batchIndex);
        resolve(items[0]);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    return memoryFallback.getLatestCheckpoint(runId);
  }
}

/**
 * Returns diagnostic storage metrics for a run
 */
export async function getStorageStats(runId: string): Promise<StorageStats> {
  if (!hasIndexedDB()) {
    return memoryFallback.getStorageStats(runId);
  }

  try {
    const db = await openDB();
    return await new Promise<StorageStats>((resolve, reject) => {
      const tx = db.transaction(['ads', 'entities', 'checkpoints'], 'readonly');
      const adStore = tx.objectStore('ads').index('by_run');
      const entStore = tx.objectStore('entities').index('by_run');
      const cpStore = tx.objectStore('checkpoints').index('by_run');

      const reqAds = adStore.count(runId);
      const reqEnts = entStore.getAll(runId);
      const reqCps = cpStore.count(runId);

      tx.oncomplete = () => {
        db.close();
        const adsCount = reqAds.result || 0;
        const ents = (reqEnts.result || []) as Array<ExtensionLead & { relevanceDecision?: string }>;
        const relevantCount = ents.filter(e => !e.relevanceDecision || e.relevanceDecision === 'RELEVANT').length;
        const cpsCount = reqCps.result || 0;

        // Approx size estimate: ~300 bytes per ad, ~500 bytes per entity
        const estimatedBytes = adsCount * 300 + ents.length * 500 + cpsCount * 200;

        resolve({
          runId,
          totalAds: adsCount,
          totalEntities: ents.length,
          totalRelevantLeads: relevantCount,
          totalCheckpoints: cpsCount,
          estimatedBytes
        });
      };

      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    return memoryFallback.getStorageStats(runId);
  }
}

/**
 * Clears data for a research run
 */
export async function clearRunData(runId: string): Promise<void> {
  if (!hasIndexedDB()) {
    return memoryFallback.clearRun(runId);
  }

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(['runs', 'ads', 'entities', 'evidence', 'checkpoints', 'dedupIndex'], 'readwrite');
      tx.objectStore('runs').delete(runId);

      // Delete by index
      const stores = ['ads', 'entities', 'evidence', 'checkpoints', 'dedupIndex'];
      for (const storeName of stores) {
        const store = tx.objectStore(storeName);
        const index = store.index('by_run');
        const req = index.openCursor(IDBKeyRange.only(runId));
        req.onsuccess = (event: any) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      }

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    return memoryFallback.clearRun(runId);
  }
}
