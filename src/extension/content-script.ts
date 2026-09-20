/**
 * Chrome Extension Content Script for Public Meta Ad Library
 * Runs inside the context of https://www.facebook.com/ads/library/*
 */

import { checkForBotChallenge, extractAdCardsFromDocument } from './metaAdapter.ts';
import type { ExtensionMessage } from './types.ts';

console.log('[Meta Ad Library Scraper] Content script active on:', window.location.href);

// Notify service worker that content script is initialized
try {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: 'CONTENT_SCRIPT_READY',
      payload: { url: window.location.href, timestamp: Date.now() }
    }).catch(() => {
      // Background worker might be sleeping; normal in MV3
    });
  }
} catch {
  // Graceful fallback
}

// Listen for commands from the extension Service Worker
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
    if (message.type === 'SCAN_AND_EXTRACT') {
      const keyword = message.payload?.keyword || '';
      const shouldScroll = message.payload?.scroll ?? true;

      // 1. Check for Bot Challenge / CAPTCHA / Login Wall
      const challenge = checkForBotChallenge(document);
      if (challenge.isBlocked) {
        sendResponse({
          type: 'CHALLENGE_DETECTED',
          reason: challenge.reason,
          code: challenge.code || 'CHALLENGED'
        });
        return true;
      }

      // 2. Extract visible cards before scroll
      const candidates = extractAdCardsFromDocument(document, keyword);

      // 3. If scroll requested, scroll down to trigger infinite scroll
      if (shouldScroll) {
        const prevScrollY = window.scrollY;
        window.scrollBy({ top: 1200, behavior: 'smooth' });

        // Wait for potential dynamic rendering
        setTimeout(() => {
          const updatedCandidates = extractAdCardsFromDocument(document, keyword);
          sendResponse({
            type: 'CANDIDATES_COLLECTED',
            payload: {
              candidates: updatedCandidates,
              count: updatedCandidates.length,
              scrolled: window.scrollY > prevScrollY,
              atBottom: window.innerHeight + window.scrollY >= document.body.offsetHeight - 200
            }
          });
        }, 1200);
        return true; // Asynchronous response
      }

      sendResponse({
        type: 'CANDIDATES_COLLECTED',
        payload: {
          candidates,
          count: candidates.length,
          scrolled: false,
          atBottom: false
        }
      });
      return true;
    }

    return false;
  });
}
