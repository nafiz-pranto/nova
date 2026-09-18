/**
 * Chrome MV3 Service Worker
 * Manages research runs, tab orchestration, extraction loop, deduplication, and persistence in chrome.storage.local
 */

import {
  ExtensionMessage,
  ExtensionResearchRun,
  ExtensionLead,
  StartResearchPayload,
  ScrapedAdCandidate
} from './types.ts';
import { aggregateCandidatesToLeads } from './metaAdapter.ts';

console.log('[Meta Ad Library Scraper] Service Worker initializing...');

// In-memory cancellation flags (keyed by runId)
const cancelledRuns = new Set<string>();

/**
 * Persists active run state to chrome.storage.local
 */
async function saveActiveRun(run: ExtensionResearchRun): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ activeResearchRun: run });
  }
}

/**
 * Appends completed run to research history
 */
async function appendToHistory(run: ExtensionResearchRun): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get(['researchHistory']);
    const history: ExtensionResearchRun[] = Array.isArray(data.researchHistory)
      ? data.researchHistory
      : [];
    // Keep last 30 runs
    const updated = [run, ...history.filter(h => h.runId !== run.runId)].slice(0, 30);
    await chrome.storage.local.set({ researchHistory: updated });
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
async function executeResearchPipeline(payload: StartResearchPayload): Promise<ExtensionResearchRun> {
  const runId = `run_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  cancelledRuns.delete(runId);

  const keywords = payload.keywords.map(k => k.trim()).filter(Boolean);
  const countryCode = payload.countryCode || 'US';
  const targetLeadCount = Math.max(1, payload.maxResults || 10);

  const initialRun: ExtensionResearchRun = {
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
    logs: [],
    startedAt: new Date().toISOString(),
    totalAdsInspected: 0,
    targetLeadCount
  };

  await saveActiveRun(initialRun);
  broadcastProgress(initialRun, 'STARTING', `Research initiated for ${targetLeadCount} leads in ${payload.locationName}...`);

  let currentTabId: number | null = null;
  let allCandidates: ScrapedAdCandidate[] = [];

  try {
    for (let ki = 0; ki < keywords.length; ki++) {
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
      const maxScrolls = 12;

      while (scrollAttempts < maxScrolls && !cancelledRuns.has(runId)) {
        if (initialRun.leads.length >= targetLeadCount) break;

        scrollAttempts++;

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
          initialRun.status = 'BLOCKED';
          initialRun.challengeReason = response.reason || 'Meta Ad Library bot protection detected.';
          initialRun.stopReason = 'CHALLENGE_DETECTED';
          broadcastProgress(initialRun, 'BLOCKED', `Access blocked: ${initialRun.challengeReason}`);
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

          // Aggregate & Deduplicate
          const aggregated = aggregateCandidatesToLeads(
            allCandidates,
            countryCode,
            payload.locationName,
            targetLeadCount
          );

          initialRun.leads = aggregated.leads;
          initialRun.totalAdsInspected = allCandidates.length;

          broadcastProgress(
            initialRun,
            'COLLECTING',
            `Collected ${initialRun.leads.length} unique leads from ${allCandidates.length} ad cards (scroll ${scrollAttempts})...`
          );

          if (initialRun.leads.length >= targetLeadCount) {
            broadcastProgress(initialRun, 'NORMALIZING', `Target lead quota of ${targetLeadCount} reached.`);
            break;
          }

          if (response.payload && response.payload.atBottom) {
            broadcastProgress(initialRun, 'COLLECTING', `Reached end of search results for "${currentKeyword}".`);
            break;
          }

          if (consecutiveNoNewCards >= 3) {
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
      broadcastProgress(initialRun, 'CANCELLED', `Research was cancelled by operator.`);
    } else {
      initialRun.status = 'COMPLETED';
      initialRun.completedAt = new Date().toISOString();
      broadcastProgress(
        initialRun,
        'COMPLETED',
        `Research completed successfully: ${initialRun.leads.length} unique leads discovered.`
      );
    }

  } catch (err: any) {
    initialRun.status = 'FAILED';
    initialRun.stopReason = err.message || 'Unexpected error occurred during research.';
    broadcastProgress(initialRun, 'FAILED', `Error: ${initialRun.stopReason}`);
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
      executeResearchPipeline(message.payload).then(run => {
        sendResponse({ success: true, run });
      }).catch(err => {
        sendResponse({ success: false, error: err.message });
      });
      return true; // Keep message channel open for async response
    }

    if (message.type === 'STOP_RESEARCH') {
      const runId = message.payload?.runId;
      if (runId) {
        cancelledRuns.add(runId);
      }
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
chrome.runtime?.onInstalled?.addListener(() => {
  console.log('[Meta Ad Library Scraper] Extension installed successfully.');
});
