// src/extension/metaAdapter.ts
function aggregateCandidatesToLeads(candidates, locationCode, locationName, maxResults, existingLeads = []) {
  const leadMap = /* @__PURE__ */ new Map();
  for (const lead of existingLeads) {
    leadMap.set(lead.canonicalName.toLowerCase(), { ...lead });
  }
  let totalAdsCount = 0;
  for (const cand of candidates) {
    totalAdsCount++;
    const cleanName = (cand.pageName || "Unknown Advertiser").trim();
    if (!cleanName || cleanName === "Unknown Advertiser") continue;
    const key = cleanName.toLowerCase();
    const existing = leadMap.get(key);
    if (existing) {
      existing.activeAdCount += 1;
      if (!existing.adLibraryIds.includes(cand.libraryId)) {
        existing.adLibraryIds.push(cand.libraryId);
      }
      if (cand.observedKeyword && !existing.matchedKeywords.includes(cand.observedKeyword)) {
        existing.matchedKeywords.push(cand.observedKeyword);
      }
      if (!existing.facebookPageUrl && cand.facebookPageUrl) {
        existing.facebookPageUrl = cand.facebookPageUrl;
        existing.facebookPageState = "found";
      }
      if (!existing.destinationUrl && cand.destinationUrl) {
        existing.destinationUrl = cand.destinationUrl;
        existing.destinationDomain = cand.destinationDomain;
        existing.websiteState = "found";
      }
      if (!existing.sampleCopy && cand.bodyCopy) {
        existing.sampleCopy = cand.bodyCopy;
      }
      if (!existing.sampleCta && cand.ctaText) {
        existing.sampleCta = cand.ctaText;
      }
    } else {
      if (leadMap.size >= maxResults) {
        continue;
      }
      const fbState = cand.facebookPageUrl ? "found" : "not_found";
      const webState = cand.destinationUrl ? "found" : "not_found";
      const lead = {
        id: `lead_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        name: cleanName,
        canonicalName: cleanName,
        facebookPageName: cleanName,
        facebookPageUrl: cand.facebookPageUrl,
        facebookPageState: fbState,
        destinationUrl: cand.destinationUrl,
        destinationDomain: cand.destinationDomain,
        websiteState: webState,
        activeAdCount: 1,
        adLibraryIds: [cand.libraryId],
        adLibraryUrl: cand.libraryId ? `https://www.facebook.com/ads/library/?id=${cand.libraryId}` : void 0,
        matchedKeywords: cand.observedKeyword ? [cand.observedKeyword] : [],
        locationCode,
        locationName,
        status: webState === "found" ? "QUALIFIED" : "REVIEW_REQUIRED",
        discoveredAt: (/* @__PURE__ */ new Date()).toISOString(),
        sampleCopy: cand.bodyCopy,
        sampleCta: cand.ctaText
      };
      leadMap.set(key, lead);
    }
  }
  return {
    leads: Array.from(leadMap.values()),
    totalAdsCount
  };
}

// src/extension/service-worker.ts
console.log("[Meta Ad Library Scraper] Service Worker initializing...");
var cancelledRuns = /* @__PURE__ */ new Set();
async function saveActiveRun(run) {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ activeResearchRun: run });
  }
}
async function appendToHistory(run) {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get(["researchHistory"]);
    const history = Array.isArray(data.researchHistory) ? data.researchHistory : [];
    const updated = [run, ...history.filter((h) => h.runId !== run.runId)].slice(0, 30);
    await chrome.storage.local.set({ researchHistory: updated });
  }
}
function broadcastProgress(run, stage, logMessage) {
  const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString();
  run.logs.push({ timestamp, message: logMessage, stage });
  if (run.logs.length > 50) {
    run.logs = run.logs.slice(-50);
  }
  saveActiveRun(run).catch(() => {
  });
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: "RESEARCH_PROGRESS",
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
    });
  }
}
function waitForTabLoad(tabId, timeoutMs = 25e3) {
  return new Promise(async (resolve) => {
    let resolved = false;
    try {
      const currentTab = await chrome.tabs.get(tabId);
      if (currentTab && currentTab.status === "complete") {
        resolved = true;
        resolve();
        return;
      }
    } catch {
    }
    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
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
var wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function executeResearchPipeline(payload) {
  const runId = `run_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  cancelledRuns.delete(runId);
  const keywords = payload.keywords.map((k) => k.trim()).filter(Boolean);
  const countryCode = payload.countryCode || "US";
  const targetLeadCount = Math.max(1, payload.maxResults || 10);
  const initialRun = {
    runId,
    researchName: payload.researchName || `${payload.mode === "PRESET" ? payload.presetName || "Preset" : keywords[0]} in ${payload.locationName}`,
    mode: payload.mode,
    presetId: payload.presetId,
    presetName: payload.presetName,
    keywords,
    countryCode,
    locationName: payload.locationName,
    maxResults: targetLeadCount,
    status: "STARTING",
    leads: [],
    logs: [],
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    totalAdsInspected: 0,
    targetLeadCount
  };
  await saveActiveRun(initialRun);
  broadcastProgress(initialRun, "STARTING", `Research initiated for ${targetLeadCount} leads in ${payload.locationName}...`);
  let currentTabId = null;
  let allCandidates = [];
  try {
    for (let ki = 0; ki < keywords.length; ki++) {
      if (cancelledRuns.has(runId)) break;
      if (initialRun.leads.length >= targetLeadCount) break;
      const currentKeyword = keywords[ki];
      initialRun.activeKeywordIndex = ki;
      initialRun.status = "NAVIGATING";
      const searchUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${encodeURIComponent(countryCode)}&q=${encodeURIComponent(currentKeyword)}`;
      broadcastProgress(initialRun, "NAVIGATING", `Opening Meta Ad Library for "${currentKeyword}" in ${countryCode}...`);
      if (!currentTabId) {
        const tab = await chrome.tabs.create({ url: searchUrl, active: false });
        currentTabId = tab.id || null;
      } else {
        await chrome.tabs.update(currentTabId, { url: searchUrl });
      }
      if (!currentTabId) {
        throw new Error("Failed to create or update browser tab for research.");
      }
      await waitForTabLoad(currentTabId);
      await wait(3e3);
      initialRun.status = "COLLECTING";
      broadcastProgress(initialRun, "COLLECTING", `Connected to Ad Library. Starting ad collection for "${currentKeyword}"...`);
      let consecutiveNoNewCards = 0;
      let scrollAttempts = 0;
      const maxScrolls = 12;
      while (scrollAttempts < maxScrolls && !cancelledRuns.has(runId)) {
        if (initialRun.leads.length >= targetLeadCount) break;
        scrollAttempts++;
        let response = null;
        try {
          response = await chrome.tabs.sendMessage(currentTabId, {
            type: "SCAN_AND_EXTRACT",
            payload: { keyword: currentKeyword, scroll: true }
          });
        } catch (err) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId: currentTabId },
              files: ["content-script.js"]
            });
            await wait(1e3);
            response = await chrome.tabs.sendMessage(currentTabId, {
              type: "SCAN_AND_EXTRACT",
              payload: { keyword: currentKeyword, scroll: true }
            });
          } catch (scriptErr) {
            broadcastProgress(initialRun, "COLLECTING", `Tab communication retry: ${scriptErr.message}`);
          }
        }
        if (response && response.type === "CHALLENGE_DETECTED") {
          initialRun.status = "BLOCKED";
          initialRun.challengeReason = response.reason || "Meta Ad Library bot protection detected.";
          initialRun.stopReason = "CHALLENGE_DETECTED";
          broadcastProgress(initialRun, "BLOCKED", `Access blocked: ${initialRun.challengeReason}`);
          await saveActiveRun(initialRun);
          await appendToHistory(initialRun);
          return initialRun;
        }
        const candidates = response && response.payload && response.payload.candidates || [];
        if (candidates.length > 0) {
          const prevCandidatesCount = allCandidates.length;
          for (const cand of candidates) {
            if (!allCandidates.some((c) => c.libraryId === cand.libraryId)) {
              allCandidates.push(cand);
            }
          }
          const newlyAdded = allCandidates.length - prevCandidatesCount;
          if (newlyAdded === 0) {
            consecutiveNoNewCards++;
          } else {
            consecutiveNoNewCards = 0;
          }
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
            "COLLECTING",
            `Collected ${initialRun.leads.length} unique leads from ${allCandidates.length} ad cards (scroll ${scrollAttempts})...`
          );
          if (initialRun.leads.length >= targetLeadCount) {
            broadcastProgress(initialRun, "NORMALIZING", `Target lead quota of ${targetLeadCount} reached.`);
            break;
          }
          if (response.payload && response.payload.atBottom) {
            broadcastProgress(initialRun, "COLLECTING", `Reached end of search results for "${currentKeyword}".`);
            break;
          }
          if (consecutiveNoNewCards >= 3) {
            broadcastProgress(initialRun, "COLLECTING", `No additional ad cards loaded for "${currentKeyword}". Moving forward.`);
            break;
          }
        } else {
          broadcastProgress(initialRun, "COLLECTING", `Waiting for ad cards to render (attempt ${scrollAttempts})...`);
          await wait(2e3);
        }
      }
    }
    if (cancelledRuns.has(runId)) {
      initialRun.status = "CANCELLED";
      initialRun.stopReason = "USER_CANCELLED";
      broadcastProgress(initialRun, "CANCELLED", `Research was cancelled by operator.`);
    } else {
      initialRun.status = "COMPLETED";
      initialRun.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      broadcastProgress(
        initialRun,
        "COMPLETED",
        `Research completed successfully: ${initialRun.leads.length} unique leads discovered.`
      );
    }
  } catch (err) {
    initialRun.status = "FAILED";
    initialRun.stopReason = err.message || "Unexpected error occurred during research.";
    broadcastProgress(initialRun, "FAILED", `Error: ${initialRun.stopReason}`);
  } finally {
    if (currentTabId) {
      try {
        await chrome.tabs.remove(currentTabId);
      } catch {
      }
    }
    initialRun.completedAt = (/* @__PURE__ */ new Date()).toISOString();
    await saveActiveRun(initialRun);
    await appendToHistory(initialRun);
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: "RESEARCH_COMPLETED",
        payload: { run: initialRun }
      }).catch(() => {
      });
    }
  }
  return initialRun;
}
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "START_RESEARCH") {
      executeResearchPipeline(message.payload).then((run) => {
        sendResponse({ success: true, run });
      }).catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
      return true;
    }
    if (message.type === "STOP_RESEARCH") {
      const runId = message.payload?.runId;
      if (runId) {
        cancelledRuns.add(runId);
      }
      sendResponse({ success: true, message: "Cancellation signal sent." });
      return false;
    }
    if (message.type === "GET_STATE") {
      chrome.storage.local.get(["activeResearchRun"], (result) => {
        sendResponse({ activeResearchRun: result.activeResearchRun || null });
      });
      return true;
    }
    if (message.type === "GET_HISTORY") {
      chrome.storage.local.get(["researchHistory"], (result) => {
        sendResponse({ history: result.researchHistory || [] });
      });
      return true;
    }
    if (message.type === "CLEAR_HISTORY") {
      chrome.storage.local.set({ researchHistory: [] }, () => {
        sendResponse({ success: true });
      });
      return true;
    }
    return false;
  });
}
chrome.runtime?.onInstalled?.addListener(() => {
  console.log("[Meta Ad Library Scraper] Extension installed successfully.");
});
//# sourceMappingURL=service-worker.js.map
