(() => {
  // src/extension/metaAdapter.ts
  function checkForBotChallenge(doc) {
    const text = doc.body ? doc.body.innerText : "";
    if (text.includes("Security Check") || text.includes("Enter the characters you see below")) {
      return { isBlocked: true, reason: "Meta CAPTCHA / Security Check challenge presented." };
    }
    if (text.includes("You\u2019re Temporarily Blocked") || text.includes("You are temporarily blocked")) {
      return { isBlocked: true, reason: "Meta IP or rate limit temporarily blocked request." };
    }
    if (text.includes("Log In to Facebook") && doc.querySelectorAll('input[type="password"]').length > 0) {
      const hasAdCards = Array.from(doc.querySelectorAll("span, div")).some(
        (el) => el.textContent && el.textContent.includes("Library ID:")
      );
      if (!hasAdCards) {
        return { isBlocked: true, reason: "Meta mandatory login dialog blocking public ad library access." };
      }
    }
    return { isBlocked: false };
  }
  function extractUrlFromShim(rawHref) {
    if (!rawHref || typeof rawHref !== "string") return {};
    let targetUrl = rawHref.trim();
    try {
      const parsed = new URL(targetUrl);
      const host = parsed.hostname.toLowerCase();
      if (host.includes("facebook.com") && (parsed.pathname === "/l.php" || parsed.pathname.includes("/l.php"))) {
        const uParam = parsed.searchParams.get("u");
        if (uParam) {
          targetUrl = decodeURIComponent(uParam);
        }
      }
      const finalParsed = new URL(targetUrl);
      const finalHost = finalParsed.hostname.toLowerCase();
      const fbInternalDomains = [
        "facebook.com",
        "fb.com",
        "fb.me",
        "meta.com",
        "messenger.com",
        "instagram.com",
        "threads.net",
        "whatsapp.com"
      ];
      const isInternal = fbInternalDomains.some(
        (domain) => finalHost === domain || finalHost.endsWith("." + domain)
      );
      if (isInternal) {
        if (finalHost.includes("instagram.com")) {
          return {
            destinationUrl: targetUrl,
            domain: "instagram.com"
          };
        }
        return {};
      }
      const cleanDomain = finalHost.replace(/^www\./, "");
      return {
        destinationUrl: targetUrl,
        domain: cleanDomain
      };
    } catch {
      return {};
    }
  }
  function extractFacebookPageInfo(href, linkText) {
    if (!href) return {};
    try {
      const parsed = new URL(href);
      const host = parsed.hostname.toLowerCase();
      if (!host.includes("facebook.com") && !host.includes("fb.com")) return {};
      const path = parsed.pathname;
      if (path === "/" || path.startsWith("/ads/") || path.startsWith("/policy") || path.startsWith("/help") || path.startsWith("/settings") || path.startsWith("/legal") || path.includes("terms")) {
        return {};
      }
      const cleanUrl = `https://www.facebook.com${path}`;
      return {
        pageUrl: cleanUrl,
        pageName: linkText?.trim() || void 0
      };
    } catch {
      return {};
    }
  }
  function extractAdCardsFromDocument(doc, observedKeyword) {
    const candidates = [];
    const seenLibraryIds = /* @__PURE__ */ new Set();
    const allElements = Array.from(doc.querySelectorAll("div, span"));
    const idElements = allElements.filter((el) => {
      return el.children.length === 0 && el.textContent && el.textContent.includes("Library ID:");
    });
    for (const idEl of idElements) {
      const text = idEl.textContent || "";
      const match = text.match(/Library ID:\s*([0-9]+)/i);
      if (!match) continue;
      const libraryId = match[1];
      if (seenLibraryIds.has(libraryId)) continue;
      seenLibraryIds.add(libraryId);
      let container = idEl;
      let cardRoot = null;
      while (container && container.parentElement && container.parentElement !== doc.body) {
        if (container.parentElement.children.length > 3 && container.querySelectorAll("a").length > 0 && container.offsetHeight > 150) {
          cardRoot = container;
          break;
        }
        container = container.parentElement;
      }
      if (!cardRoot) {
        let fallback = idEl.parentElement;
        for (let i = 0; i < 7; i++) {
          if (fallback && fallback.parentElement && fallback.parentElement !== doc.body) {
            fallback = fallback.parentElement;
          }
        }
        cardRoot = fallback || idEl;
      }
      const cardFullText = cardRoot.innerText || cardRoot.textContent || "";
      const isActive = !cardFullText.includes("Inactive") && (cardFullText.includes("Active") || true);
      let startedRunning = "";
      const dateMatch = cardFullText.match(/Started running on ([^\n~·]+)/i);
      if (dateMatch) {
        startedRunning = dateMatch[1].trim();
      } else {
        const rangeMatch = cardFullText.match(/([0-9]{1,2}\s+[A-Za-z]{3}\s+[0-9]{4}\s*-\s*[0-9]{1,2}\s+[A-Za-z]{3}\s+[0-9]{4})/i);
        if (rangeMatch) startedRunning = rangeMatch[1].trim();
      }
      const hasMultipleVersions = cardFullText.includes("This ad has multiple versions");
      let pageName = "Unknown Advertiser";
      let facebookPageUrl;
      let facebookPageId;
      const links = Array.from(cardRoot.querySelectorAll("a"));
      for (const link of links) {
        const href = link.href || "";
        const linkText = link.innerText || link.textContent || "";
        const fbInfo = extractFacebookPageInfo(href, linkText);
        if (fbInfo.pageUrl) {
          facebookPageUrl = fbInfo.pageUrl;
          if (linkText && linkText.trim() && !pageName || pageName === "Unknown Advertiser") {
            pageName = linkText.trim();
          }
          const idMatch = fbInfo.pageUrl.match(/facebook\.com\/([0-9]{5,})/);
          if (idMatch) facebookPageId = idMatch[1];
          break;
        }
      }
      if (pageName === "Unknown Advertiser") {
        const sponsoredIndex = cardFullText.indexOf("Sponsored");
        if (sponsoredIndex > 0) {
          const textBefore = cardFullText.substring(0, sponsoredIndex).trim();
          const lines = textBefore.split("\n").map((l) => l.trim()).filter(Boolean);
          const lastLine = lines.pop();
          if (lastLine && lastLine.length > 1 && !lastLine.includes("Library ID") && !lastLine.includes("Active")) {
            pageName = lastLine;
          }
        }
      }
      let destinationUrl;
      let destinationDomain;
      let ctaText;
      for (const link of links) {
        const href = link.href || "";
        const dest = extractUrlFromShim(href);
        if (dest.destinationUrl) {
          destinationUrl = dest.destinationUrl;
          destinationDomain = dest.domain;
          const text2 = (link.innerText || link.textContent || "").trim();
          if (text2 && text2.length < 50) {
            ctaText = text2.split("\n").pop()?.trim();
          }
          break;
        }
      }
      if (!ctaText) {
        const ctaPatterns = ["Learn more", "Shop Now", "Sign Up", "Contact Us", "Apply Now", "Book Now", "Get Quote", "Download"];
        for (const pattern of ctaPatterns) {
          if (cardFullText.includes(pattern)) {
            ctaText = pattern;
            break;
          }
        }
      }
      let bodyCopy = "";
      const bodyMatch = cardFullText.match(/Sponsored\s*\n([\s\S]{10,350})/);
      if (bodyMatch) {
        bodyCopy = bodyMatch[1].trim().replace(/\n+/g, " ");
      } else {
        bodyCopy = cardFullText.substring(0, 200).replace(/\n+/g, " ");
      }
      candidates.push({
        libraryId,
        pageName,
        facebookPageUrl,
        facebookPageId,
        destinationUrl,
        destinationDomain,
        isActive,
        startedRunning,
        hasMultipleVersions,
        bodyCopy: bodyCopy.substring(0, 300),
        ctaText,
        observedKeyword,
        rawText: cardFullText.substring(0, 200)
      });
    }
    return candidates;
  }

  // src/extension/content-script.ts
  console.log("[Meta Ad Library Scraper] Content script active on:", window.location.href);
  try {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: "CONTENT_SCRIPT_READY",
        payload: { url: window.location.href, timestamp: Date.now() }
      }).catch(() => {
      });
    }
  } catch {
  }
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "SCAN_AND_EXTRACT") {
        const keyword = message.payload?.keyword || "";
        const shouldScroll = message.payload?.scroll ?? true;
        const challenge = checkForBotChallenge(document);
        if (challenge.isBlocked) {
          sendResponse({
            type: "CHALLENGE_DETECTED",
            reason: challenge.reason
          });
          return true;
        }
        const candidates = extractAdCardsFromDocument(document, keyword);
        if (shouldScroll) {
          const prevScrollY = window.scrollY;
          window.scrollBy({ top: 1200, behavior: "smooth" });
          setTimeout(() => {
            const updatedCandidates = extractAdCardsFromDocument(document, keyword);
            sendResponse({
              type: "CANDIDATES_COLLECTED",
              payload: {
                candidates: updatedCandidates,
                count: updatedCandidates.length,
                scrolled: window.scrollY > prevScrollY,
                atBottom: window.innerHeight + window.scrollY >= document.body.offsetHeight - 200
              }
            });
          }, 1200);
          return true;
        }
        sendResponse({
          type: "CANDIDATES_COLLECTED",
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
})();
//# sourceMappingURL=content-script.js.map
