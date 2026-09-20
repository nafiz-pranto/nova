/**
 * Chrome MV3 Service Worker
 * Manages research runs, tab orchestration, extraction loop, deduplication, and persistence in chrome.storage.local
 */

import type {
  ExtensionMessage,
  ExtensionResearchRun,
  ExtensionLead,
  StartResearchPayload,
  ScrapedAdCandidate
} from './types.ts';
import { aggregateCandidatesToLeads } from './metaAdapter.ts';
import { compileResearchIntent, RELEVANCE_STRATEGY_VERSION, RELEVANCE_ENGINE_VERSION } from './relevanceEngine.ts';

console.log('[Meta Ad Library Scraper] Service Worker initializing...');

// Constants for state integrity
const SCHEMA_VERSION = 1;
const STALE_JOB_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

// In-memory cancellation flags (keyed by runId)
const cancelledRuns = new Set<string>();

/**
 * Persists active run state to chrome.storage.local
 */
async function saveActiveRun(run: ExtensionResearchRun): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    run.lastUpdatedAt = new Date().toISOString();
    run.schemaVersion = SCHEMA_VERSION;
    await chrome.storage.local.set({
      activeResearchRun: run,
      meta_scraper_active_run: run
    });
  }
}

/**
 * Detects and marks stale jobs as RECOVERY_REQUIRED
 */
async function checkStaleJobs(): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;

  const data = await chrome.storage.local.get(['activeResearchRun']);
  const run = data.activeResearchRun as ExtensionResearchRun | undefined;

  if (run && ['STARTING', 'NAVIGATING', 'COLLECTING', 'NORMALIZING'].includes(run.status)) {
    const lastUpdate = new Date(run.lastUpdatedAt).getTime();
    const now = Date.now();

    if (now - lastUpdate > STALE_JOB_THRESHOLD_MS) {
      console.warn('[service-worker] Detected stale job:', run.runId);
      run.status = 'RECOVERY_REQUIRED';
      run.stopReason = 'BROWSER_INTERRUPTED';
      run.logs.push({
        timestamp: new Date().toLocaleTimeString(),
        message: 'Research session was interrupted due to browser inactivity or background worker restart. Recovery required.',
        stage: 'SYSTEM'
      });
      await saveActiveRun(run);
      await appendToHistory(run);
    }
  }
}

/**
 * Appends completed run to research history
 */
async function appendToHistory(run: ExtensionResearchRun): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get(['researchHistory', 'meta_scraper_history']);
    const history: ExtensionResearchRun[] = Array.isArray(data.researchHistory)
      ? data.researchHistory
      : Array.isArray(data.meta_scraper_history) ? data.meta_scraper_history : [];
    // Keep last 30 runs
    const updated = [run, ...history.filter(h => h.runId !== run.runId)].slice(0, 30);
    await chrome.storage.local.set({
      researchHistory: updated,
      meta_scraper_history: updated
    });
  }
}

/**
 * Emits progress event to any active extension views (sidepanel/popup)
 */
function broadcastProgress(run: ExtensionResearchRun, stage: string, logMessage: string): void {
  const timestamp = new Date().toLocaleTimeString();
  run.logs.push({ timestamp, message: logMessage, stage });
  // Keep logs bounded
  if (run.logs.length > 50) {
    run.logs = run.logs.slice(-50);
  }

  saveActiveRun(run).catch(() => {});

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: 'RESEARCH_PROGRESS',
      payload: {
        runId: run.runId,
        status: run.status,
        leadCount: run.leads.length,
        maxResults: run.maxResults,
        totalAdsInspected: run.totalAdsInspected,
        logMessage,
        run
      }
    }).catch(() => {
      // No popup/sidepanel open right now; state is safely preserved in chrome.storage.local
    });
  }
}

/**
 * Helper to wait for a tab to finish loading
 */
function waitForTabLoad(tabId: number, timeoutMs = 25000): Promise<void> {
  return new Promise(async (resolve) => {
    let resolved = false;

    try {
      const currentTab = await chrome.tabs.get(tabId);
      if (currentTab && currentTab.status === 'complete') {
        resolved = true;
        resolve();
        return;
      }
    } catch {}

    const listener = (updatedTabId: number, changeInfo: { status?: string }) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        if (!resolved) {
          resolved = true;
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      }
    };

    chrome.tabs.onUpdated.addListener(listener);

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }, timeoutMs);
  });
}

/**
 * Helper to delay execution
 */
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Main research execution pipeline in Chrome Extension
 */
async function executeResearchPipeline(
  payload: StartResearchPayload,
  providedRunId?: string,
  providedRun?: ExtensionResearchRun
): Promise<ExtensionResearchRun> {
  const runId = providedRunId || `run_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  cancelledRuns.delete(runId);

  const keywords = payload.keywords.map(k => k.trim()).filter(Boolean);
  const countryCode = payload.countryCode || 'US';
  const targetLeadCount = Math.max(1, payload.maxResults || 10);

  const researchIntent = compileResearchIntent(
    payload.mode,
    keywords,
    payload.presetId,
    countryCode
  );

  const initialRun: ExtensionResearchRun = providedRun || {
    runId,
    researchName: payload.researchName || `${payload.mode === 'PRESET' ? payload.presetName || 'Preset' : keywords[0]} in ${payload.locationName}`,
    mode: payload.mode,
    presetId: payload.presetId,
    presetName: payload.presetName,
    keywords,
    countryCode,
    locationName: payload.locationName,
    maxResults: targetLeadCount,
    status: 'STARTING',
    leads: [],
    rejectedLeadsCount: 0,
    uncertainLeadsCount: 0,
    relevanceStrategyVersion: RELEVANCE_STRATEGY_VERSION,
    engineVersion: RELEVANCE_ENGINE_VERSION,
    counters: {
      rawAds: 0,
      normalizedCandidates: 0,
      relevantCandidates: 0,
      uncertainCandidates: 0,
      notRelevantCandidates: 0,
      duplicatesRemoved: 0,
      finalUniqueLeads: 0
    },
    logs: [],
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    totalAdsInspected: 0,
    targetLeadCount
  };

  await saveActiveRun(initialRun);
  broadcastProgress(initialRun, 'STARTING', `Research initiated for ${targetLeadCount} leads in ${payload.locationName}...`);

  let currentTabId: number | null = null;
  let allCandidates: ScrapedAdCandidate[] = initialRun.allCandidates || [];

  const startKi = initialRun.activeKeywordIndex || 0;
  let isStalled = false;

  try {
    for (let ki = startKi; ki < keywords.length; ki++) {
      if (cancelledRuns.has(runId)) break;
      if (initialRun.leads.length >= targetLeadCount) break;

      const currentKeyword = keywords[ki];
      initialRun.activeKeywordIndex = ki;
      initialRun.status = 'NAVIGATING';

      const searchUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${encodeURIComponent(countryCode)}&q=${encodeURIComponent(currentKeyword)}`;
      broadcastProgress(initialRun, 'NAVIGATING', `Opening Meta Ad Library for "${currentKeyword}" in ${countryCode}...`);

      if (!currentTabId) {
        const tab = await chrome.tabs.create({ url: searchUrl, active: false });
        currentTabId = tab.id || null;
      } else {
        await chrome.tabs.update(currentTabId, { url: searchUrl });
      }

      if (!currentTabId) {
        throw new Error('Failed to create or update browser tab for research.');
      }

      await waitForTabLoad(currentTabId);
      // Give DOM extra settle time for dynamic scripts
      await wait(3000);

      initialRun.status = 'COLLECTING';
      broadcastProgress(initialRun, 'COLLECTING', `Connected to Ad Library. Starting ad collection for "${currentKeyword}"...`);

      let consecutiveNoNewCards = 0;
      let scrollAttempts = 0;
      // Scale max scroll iterations with requested quota while respecting source exhaustion
      const maxScrolls = Math.max(25, Math.ceil(targetLeadCount * 3));

      while (scrollAttempts < maxScrolls && !cancelledRuns.has(runId)) {
        if (initialRun.leads.length >= targetLeadCount) break;

        scrollAttempts++;

        // Verify target research tab has not been closed by user
        try {
          const tabCheck = await chrome.tabs.get(currentTabId);
          if (!tabCheck) {
            initialRun.status = 'BROWSER_TAB_CLOSED';
            initialRun.stopReason = 'BROWSER_TAB_CLOSED';
            broadcastProgress(initialRun, 'BROWSER_TAB_CLOSED', 'Ad Library tab was closed during research.');
            break;
          }
        } catch {
          initialRun.status = 'BROWSER_TAB_CLOSED';
          initialRun.stopReason = 'BROWSER_TAB_CLOSED';
          broadcastProgress(initialRun, 'BROWSER_TAB_CLOSED', 'Ad Library tab was closed during research.');
          break;
        }

        // Send scan command to content script in the tab
        let response: any = null;
        try {
          response = await chrome.tabs.sendMessage(currentTabId, {
            type: 'SCAN_AND_EXTRACT',
            payload: { keyword: currentKeyword, scroll: true }
          });
        } catch (err: any) {
          // Content script might need dynamic injection if not yet auto-injected
          try {
            await chrome.scripting.executeScript({
              target: { tabId: currentTabId },
              files: ['content-script.js']
            });
            await wait(1000);
            response = await chrome.tabs.sendMessage(currentTabId, {
              type: 'SCAN_AND_EXTRACT',
              payload: { keyword: currentKeyword, scroll: true }
            });
          } catch (scriptErr: any) {
            broadcastProgress(initialRun, 'COLLECTING', `Tab communication retry: ${scriptErr.message}`);
          }
        }

        if (response && response.type === 'CHALLENGE_DETECTED') {
          const isRateLimit = response.code === 'RATE_LIMITED' || (response.reason && response.reason.includes('rate limit'));
          initialRun.status = isRateLimit ? 'RATE_LIMITED' : 'CHALLENGED';
          initialRun.challengeReason = response.reason || 'Meta Ad Library security challenge presented.';
          initialRun.stopReason = isRateLimit ? 'RATE_LIMITED' : 'CHALLENGED';
          broadcastProgress(initialRun, initialRun.status, `Access restricted: ${initialRun.challengeReason}`);
          await saveActiveRun(initialRun);
          await appendToHistory(initialRun);
          return initialRun;
        }

        const candidates: ScrapedAdCandidate[] = (response && response.payload && response.payload.candidates) || [];

        if (candidates.length > 0) {
          const prevCandidatesCount = allCandidates.length;
          // Merge newly found candidates
          for (const cand of candidates) {
            if (!allCandidates.some(c => c.libraryId === cand.libraryId)) {
              allCandidates.push(cand);
            }
          }

          const newlyAdded = allCandidates.length - prevCandidatesCount;
          if (newlyAdded === 0) {
            consecutiveNoNewCards++;
          } else {
            consecutiveNoNewCards = 0;
          }

          // Aggregate, Deduplicate & Evaluate Relevance
          const aggregated = aggregateCandidatesToLeads(
            allCandidates,
            countryCode,
            payload.locationName,
            targetLeadCount,
            [],
            researchIntent
          );

          initialRun.leads = aggregated.leads;
          initialRun.totalAdsInspected = allCandidates.length;
          initialRun.allCandidates = allCandidates;
          initialRun.rejectedLeadsCount = aggregated.rejectedCount;
          initialRun.uncertainLeadsCount = aggregated.uncertainCount;
          initialRun.counters = aggregated.counters;

          broadcastProgress(
            initialRun,
            'COLLECTING',
            `Observed ${initialRun.leads.length} unique relevant leads from ${allCandidates.length} ads (${aggregated.rejectedCount} irrelevant filtered, scroll ${scrollAttempts})...`
          );

          if (initialRun.leads.length >= targetLeadCount) {
            broadcastProgress(initialRun, 'NORMALIZING', `Target lead quota of ${targetLeadCount} reached.`);
            break;
          }

          if (response.payload && response.payload.atBottom && consecutiveNoNewCards >= 2) {
            broadcastProgress(initialRun, 'COLLECTING', `Reached end of public search results for "${currentKeyword}".`);
            break;
          }

          if (consecutiveNoNewCards >= 3) {
            isStalled = true;
            broadcastProgress(initialRun, 'COLLECTING', `No additional ad cards loaded for "${currentKeyword}". Moving forward.`);
            break;
          }
        } else {
          broadcastProgress(initialRun, 'COLLECTING', `Waiting for ad cards to render (attempt ${scrollAttempts})...`);
          await wait(2000);
        }
      }
    }

    // Finalize state
    if (cancelledRuns.has(runId)) {
      initialRun.status = 'CANCELLED';
      initialRun.stopReason = 'USER_CANCELLED';
      broadcastProgress(initialRun, 'CANCELLED', `Research was explicitly cancelled by user.`);
    } else if (initialRun.stopReason === 'BROWSER_TAB_CLOSED' || initialRun.status === 'BROWSER_TAB_CLOSED') {
      initialRun.status = 'BROWSER_TAB_CLOSED';
      initialRun.stopReason = 'BROWSER_TAB_CLOSED';
      broadcastProgress(initialRun, 'BROWSER_TAB_CLOSED', `Research halted because the Ad Library tab was closed.`);
    } else if (initialRun.status === 'CHALLENGED' || initialRun.status === 'RATE_LIMITED' || initialRun.status === 'BLOCKED') {
      // Preserve security challenge or rate-limit state
    } else {
      if (initialRun.leads.length >= targetLeadCount) {
        initialRun.status = 'COMPLETED';
        initialRun.stopReason = 'TARGET_REACHED';
      } else {
        initialRun.status = 'PARTIAL';
        if (allCandidates.length === 0) {
          initialRun.stopReason = 'NO_NEW_RESULTS_OBSERVED';
        } else if (isStalled) {
          initialRun.stopReason = 'SOURCE_PROGRESS_STALLED';
        } else {
          initialRun.stopReason = 'SOURCE_EXHAUSTED';
        }
      }
      initialRun.completedAt = new Date().toISOString();
      broadcastProgress(
        initialRun,
        initialRun.status,
        `Research finished (${initialRun.status} / ${initialRun.stopReason}): ${initialRun.leads.length} of ${targetLeadCount} requested unique relevant leads observed from ${initialRun.totalAdsInspected} public ads.`
      );
    }

  } catch (err: any) {
    initialRun.status = 'FAILED';
    initialRun.stopReason = 'FAILED';
    initialRun.challengeReason = err.message || 'Unexpected error occurred during research.';
    broadcastProgress(initialRun, 'FAILED', `Error: ${initialRun.challengeReason}`);
  } finally {
    // Optionally close the automated research tab
    if (currentTabId) {
      try {
        await chrome.tabs.remove(currentTabId);
      } catch {}
    }

    initialRun.completedAt = new Date().toISOString();
    await saveActiveRun(initialRun);
    await appendToHistory(initialRun);

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'RESEARCH_COMPLETED',
        payload: { run: initialRun }
      }).catch(() => {});
    }
  }

  return initialRun;
}

// Global Message Listener
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
    if (message.type === 'START_RESEARCH') {
      // Duplicate execution prevention
      chrome.storage.local.get(['activeResearchRun'], (data) => {
        const activeRun = data.activeResearchRun as ExtensionResearchRun | undefined;
        if (activeRun && ['STARTING', 'NAVIGATING', 'COLLECTING', 'NORMALIZING'].includes(activeRun.status)) {
          const lastUpdate = new Date(activeRun.lastUpdatedAt).getTime();
          if (Date.now() - lastUpdate < STALE_JOB_THRESHOLD_MS) {
            sendResponse({ success: false, error: 'A research job is already active.' });
            return;
          }
        }

        const runId = `run_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        const targetLeadCount = Math.max(1, message.payload.maxResults || 10);
        const keywords = message.payload.keywords.map(k => (k || '').trim()).filter(Boolean);

        const initialRun: ExtensionResearchRun = {
          runId,
          researchName: message.payload.researchName || `${message.payload.mode === 'PRESET' ? message.payload.presetName || 'Preset' : keywords[0]} in ${message.payload.locationName}`,
          mode: message.payload.mode,
          presetId: message.payload.presetId,
          presetName: message.payload.presetName,
          keywords,
          countryCode: message.payload.countryCode || 'US',
          locationName: message.payload.locationName,
          maxResults: targetLeadCount,
          status: 'STARTING',
          leads: [],
          rejectedLeadsCount: 0,
          uncertainLeadsCount: 0,
          relevanceStrategyVersion: RELEVANCE_STRATEGY_VERSION,
          engineVersion: RELEVANCE_ENGINE_VERSION,
          counters: {
            rawAds: 0,
            normalizedCandidates: 0,
            relevantCandidates: 0,
            uncertainCandidates: 0,
            notRelevantCandidates: 0,
            duplicatesRemoved: 0,
            finalUniqueLeads: 0
          },
          logs: [],
          startedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          schemaVersion: SCHEMA_VERSION,
          totalAdsInspected: 0,
          targetLeadCount
        };

        // Persist immediate starting state
        saveActiveRun(initialRun).catch(() => {});

        // Launch async pipeline in background
        executeResearchPipeline(message.payload, runId, initialRun).catch(err => {
          console.error('[service-worker] Background pipeline error:', err);
        });

        // Respond immediately with created run and runId
        sendResponse({ success: true, runId, run: initialRun });
      });
      return true; // async sendResponse
    }

    if (message.type === 'STOP_RESEARCH' || message.type === 'CANCEL_RESEARCH') {
      const runId = message.payload?.runId;
      if (runId) {
        cancelledRuns.add(runId);
      }
      chrome.storage.local.get(['activeResearchRun'], (data: Record<string, any>) => {
        if (data && data.activeResearchRun) {
          const run = data.activeResearchRun as ExtensionResearchRun;
          run.status = 'CANCELLED';
          run.stopReason = 'USER_CANCELLED';
          saveActiveRun(run).catch(() => {});
        }
      });
      sendResponse({ success: true, message: 'Cancellation signal sent.' });
      return false;
    }

    if (message.type === 'GET_STATE') {
      chrome.storage.local.get(['activeResearchRun'], (result) => {
        sendResponse({ activeResearchRun: result.activeResearchRun || null });
      });
      return true;
    }

    if (message.type === 'GET_HISTORY') {
      chrome.storage.local.get(['researchHistory'], (result) => {
        sendResponse({ history: result.researchHistory || [] });
      });
      return true;
    }

    if (message.type === 'CLEAR_HISTORY') {
      chrome.storage.local.set({ researchHistory: [] }, () => {
        sendResponse({ success: true });
      });
      return true;
    }

    return false;
  });
}

// Initialize on service worker boot
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener(() => {
    console.log('[Meta Ad Library Scraper] Extension installed successfully.');
  });
}

// Perform stale job check on startup
checkStaleJobs().catch(err => console.error('[service-worker] checkStaleJobs error:', err));
