/**
 * Meta Ad Library DOM Extraction & Normalization Adapter
 * Operates safely inside Content Scripts and local browser automation contexts.
 */

import type { ScrapedAdCandidate, ExtensionLead, ExtensionResearchRun } from './types.ts';
import { LeadRelevanceEngine } from './relevanceEngine.ts';
import type { ResearchIntent } from './relevanceEngine.ts';

/**
 * Checks whether a given URL is a Meta Ad Library search or listing page.
 */
export function isMetaAdLibraryUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const isFbHost = host === 'facebook.com' || host.endsWith('.facebook.com');
    return isFbHost && parsed.pathname.includes('/ads/library');
  } catch {
    return false;
  }
}

/**
 * Detects whether Meta's anti-bot challenge, CAPTCHA, or login wall is active.
 */
export function checkForBotChallenge(doc: Document): { isBlocked: boolean; reason?: string; code?: 'CHALLENGED' | 'RATE_LIMITED' } {
  const text = doc.body ? doc.body.innerText : '';

  if (text.includes('Security Check') || text.includes('Enter the characters you see below')) {
    return { isBlocked: true, reason: 'Meta Security Check / CAPTCHA challenge presented.', code: 'CHALLENGED' };
  }

  if (text.includes('You’re Temporarily Blocked') || text.includes('You are temporarily blocked') || text.includes('Rate limit exceeded') || text.includes('Too Many Requests')) {
    return { isBlocked: true, reason: 'Meta access temporarily rate-limited.', code: 'RATE_LIMITED' };
  }

  if (text.includes('Log In to Facebook') && doc.querySelectorAll('input[type="password"]').length > 0) {
    // Only blocked if ad library content is completely obscured by mandatory login wall
    const hasAdCards = Array.from(doc.querySelectorAll('span, div')).some(
      el => el.textContent && el.textContent.includes('Library ID:')
    );
    if (!hasAdCards) {
      return { isBlocked: true, reason: 'Meta mandatory login dialog restricting public ad library access.', code: 'CHALLENGED' };
    }
  }

  return { isBlocked: false };
}

/**
 * Extracts and decodes external destination URLs from Meta redirect shims
 * (e.g. https://l.facebook.com/l.php?u=https%3A%2F%2Fexample.com%2F...&h=...)
 */
export function extractUrlFromShim(rawHref: string): { destinationUrl?: string; domain?: string } {
  if (!rawHref || typeof rawHref !== 'string') return {};

  let targetUrl = rawHref.trim();

  try {
    const parsed = new URL(targetUrl);
    const host = parsed.hostname.toLowerCase();

    // Check for Meta link shim
    if (host.includes('facebook.com') && (parsed.pathname === '/l.php' || parsed.pathname.includes('/l.php'))) {
      const uParam = parsed.searchParams.get('u');
      if (uParam) {
        targetUrl = decodeURIComponent(uParam);
      }
    }

    const finalParsed = new URL(targetUrl);
    const finalHost = finalParsed.hostname.toLowerCase();

    // Exclude Facebook internal domains
    const fbInternalDomains = [
      'facebook.com',
      'fb.com',
      'fb.me',
      'meta.com',
      'messenger.com',
      'instagram.com',
      'threads.net',
      'whatsapp.com'
    ];

    const isInternal = fbInternalDomains.some(
      domain => finalHost === domain || finalHost.endsWith('.' + domain)
    );

    if (isInternal) {
      // Instagram links can sometimes be the primary destination profile
      if (finalHost.includes('instagram.com')) {
        return {
          destinationUrl: targetUrl,
          domain: 'instagram.com'
        };
      }
      return {};
    }

    const cleanDomain = finalHost.replace(/^www\./, '');
    return {
      destinationUrl: targetUrl,
      domain: cleanDomain
    };
  } catch {
    return {};
  }
}

/**
 * Extracts Facebook page identifier and canonical URL
 */
export function extractFacebookPageInfo(href: string, linkText?: string): { pageUrl?: string; pageName?: string } {
  if (!href) return {};

  try {
    const parsed = new URL(href);
    const host = parsed.hostname.toLowerCase();
    if (!host.includes('facebook.com') && !host.includes('fb.com')) return {};

    const path = parsed.pathname;
    // Exclude generic ad library navigation or policy links
    if (
      path === '/' ||
      path.startsWith('/ads/') ||
      path.startsWith('/policy') ||
      path.startsWith('/help') ||
      path.startsWith('/settings') ||
      path.startsWith('/legal') ||
      path.includes('terms')
    ) {
      return {};
    }

    // Canonical link
    const cleanUrl = `https://www.facebook.com${path}`;
    return {
      pageUrl: cleanUrl,
      pageName: linkText?.trim() || undefined
    };
  } catch {
    return {};
  }
}

/**
 * Robust extraction of rendered ad cards from Meta Ad Library DOM
 */
export function extractAdCardsFromDocument(doc: Document, observedKeyword?: string): ScrapedAdCandidate[] {
  const candidates: ScrapedAdCandidate[] = [];
  const seenLibraryIds = new Set<string>();

  // Find all elements containing "Library ID:"
  const allElements = Array.from(doc.querySelectorAll('div, span'));
  const idElements = allElements.filter(el => {
    return el.children.length === 0 && el.textContent && el.textContent.includes('Library ID:');
  });

  for (const idEl of idElements) {
    const text = idEl.textContent || '';
    const match = text.match(/Library ID:\s*([0-9]+)/i);
    if (!match) continue;

    const libraryId = match[1];
    if (seenLibraryIds.has(libraryId)) continue;
    seenLibraryIds.add(libraryId);

    // Locate the parent card container
    let container: HTMLElement | null = idEl as HTMLElement;
    let cardRoot: HTMLElement | null = null;

    // Traverse upwards to locate the ad card container
    while (container && container.parentElement && container.parentElement !== doc.body) {
      // Typically the ad card container has several child divs and has some height
      if (
        container.parentElement.children.length > 3 &&
        container.querySelectorAll('a').length > 0 &&
        container.offsetHeight > 150
      ) {
        cardRoot = container;
        break;
      }
      container = container.parentElement;
    }

    if (!cardRoot) {
      // Fallback: 8 levels up
      let fallback = idEl.parentElement;
      for (let i = 0; i < 7; i++) {
        if (fallback && fallback.parentElement && fallback.parentElement !== doc.body) {
          fallback = fallback.parentElement;
        }
      }
      cardRoot = (fallback as HTMLElement) || (idEl as HTMLElement);
    }

    const cardFullText = cardRoot.innerText || cardRoot.textContent || '';

    // Status: Active vs Inactive
    const isActive = !cardFullText.includes('Inactive') && (cardFullText.includes('Active') || true);

    // Started running date
    let startedRunning = '';
    const dateMatch = cardFullText.match(/Started running on ([^\n~·]+)/i);
    if (dateMatch) {
      startedRunning = dateMatch[1].trim();
    } else {
      const rangeMatch = cardFullText.match(/([0-9]{1,2}\s+[A-Za-z]{3}\s+[0-9]{4}\s*-\s*[0-9]{1,2}\s+[A-Za-z]{3}\s+[0-9]{4})/i);
      if (rangeMatch) startedRunning = rangeMatch[1].trim();
    }

    // Has multiple versions
    const hasMultipleVersions = cardFullText.includes('This ad has multiple versions');

    // Page Name and Facebook Page URL
    let pageName = 'Unknown Advertiser';
    let facebookPageUrl: string | undefined;
    let facebookPageId: string | undefined;

    const links = Array.from(cardRoot.querySelectorAll('a'));

    // Scan links for Facebook page link
    for (const link of links) {
      const href = link.href || '';
      const linkText = link.innerText || link.textContent || '';
      const fbInfo = extractFacebookPageInfo(href, linkText);
      if (fbInfo.pageUrl) {
        facebookPageUrl = fbInfo.pageUrl;
        if (linkText && linkText.trim() && !pageName || pageName === 'Unknown Advertiser') {
          pageName = linkText.trim();
        }
        // Check for numeric ID in path
        const idMatch = fbInfo.pageUrl.match(/facebook\.com\/([0-9]{5,})/);
        if (idMatch) facebookPageId = idMatch[1];
        break;
      }
    }

    // Fallback for page name: search for text before "Sponsored"
    if (pageName === 'Unknown Advertiser') {
      const sponsoredIndex = cardFullText.indexOf('Sponsored');
      if (sponsoredIndex > 0) {
        const textBefore = cardFullText.substring(0, sponsoredIndex).trim();
        const lines = textBefore.split('\n').map(l => l.trim()).filter(Boolean);
        const lastLine = lines.pop();
        if (lastLine && lastLine.length > 1 && !lastLine.includes('Library ID') && !lastLine.includes('Active')) {
          pageName = lastLine;
        }
      }
    }

    // Extract Destination Website URL & Domain
    let destinationUrl: string | undefined;
    let destinationDomain: string | undefined;
    let ctaText: string | undefined;

    for (const link of links) {
      const href = link.href || '';
      const dest = extractUrlFromShim(href);
      if (dest.destinationUrl) {
        destinationUrl = dest.destinationUrl;
        destinationDomain = dest.domain;
        const text = (link.innerText || link.textContent || '').trim();
        if (text && text.length < 50) {
          ctaText = text.split('\n').pop()?.trim();
        }
        break;
      }
    }

    // CTA Text fallback (common buttons)
    if (!ctaText) {
      const ctaPatterns = ['Learn more', 'Shop Now', 'Sign Up', 'Contact Us', 'Apply Now', 'Book Now', 'Get Quote', 'Download'];
      for (const pattern of ctaPatterns) {
        if (cardFullText.includes(pattern)) {
          ctaText = pattern;
          break;
        }
      }
    }

    // Body copy snippet
    let bodyCopy = '';
    const bodyMatch = cardFullText.match(/Sponsored\s*\n([\s\S]{10,350})/);
    if (bodyMatch) {
      bodyCopy = bodyMatch[1].trim().replace(/\n+/g, ' ');
    } else {
      bodyCopy = cardFullText.substring(0, 200).replace(/\n+/g, ' ');
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

/**
 * Deduplicates and aggregates candidates into clean, unified lead records.
 * If intent is provided, candidates are strictly evaluated for relevance:
 * RELEVANT candidates are accepted, while NOT_RELEVANT and UNCERTAIN candidates are filtered out.
 */
export function aggregateCandidatesToLeads(
  candidates: ScrapedAdCandidate[],
  locationCode: string,
  locationName: string,
  maxResults: number,
  existingLeads: ExtensionLead[] = [],
  intent?: ResearchIntent
): {
  leads: ExtensionLead[];
  totalAdsCount: number;
  rejectedCount: number;
  uncertainCount: number;
  evaluatedCount: number;
  counters: {
    rawAds: number;
    normalizedCandidates: number;
    relevantCandidates: number;
    uncertainCandidates: number;
    notRelevantCandidates: number;
    duplicatesRemoved: number;
    finalUniqueLeads: number;
    reasonCodes: Record<string, number>;
  };
} {
  // Group all candidates by normalized advertiser name
  const candidateGroups = new Map<string, ScrapedAdCandidate[]>();
  let totalAdsCount = 0;
  const reasonCodes: Record<string, number> = {};

  for (const cand of candidates) {
    totalAdsCount++;
    const cleanName = (cand.pageName || 'Unknown Advertiser').trim();
    if (!cleanName || cleanName === 'Unknown Advertiser') continue;

    const key = cleanName.toLowerCase();
    const group = candidateGroups.get(key) || [];
    group.push(cand);
    candidateGroups.set(key, group);
  }

  const leadMap = new Map<string, ExtensionLead>();

  // Initialize with existing leads
  for (const lead of existingLeads) {
    leadMap.set(lead.canonicalName.toLowerCase(), { ...lead });
  }

  let rejectedCount = 0;
  let uncertainCount = 0;
  let evaluatedCount = 0;

  for (const [key, cands] of candidateGroups.entries()) {
    evaluatedCount++;
    const primaryCand = cands[0];
    const cleanName = primaryCand.pageName.trim();

    // 1. Evaluate relevance if research intent is provided
    const evalResult = intent ? LeadRelevanceEngine.evaluateEntity(cleanName, cands, intent) : null;

    if (intent && evalResult) {
      const code = evalResult.reasonCode || 'UNKNOWN';
      reasonCodes[code] = (reasonCodes[code] || 0) + 1;

      if (evalResult.decision === 'NOT_RELEVANT') {
        rejectedCount++;
        continue;
      }
      if (evalResult.decision === 'UNCERTAIN') {
        uncertainCount++;
        // Strict Gate v2 policy: UNCERTAIN candidates are excluded from final accepted leads
        continue;
      }
    }

    // 2. Candidate is RELEVANT (or no intent was provided for raw aggregation)
    const existing = leadMap.get(key);

    if (existing) {
      existing.activeAdCount += cands.length;
      for (const cand of cands) {
        if (!existing.adLibraryIds.includes(cand.libraryId)) {
          existing.adLibraryIds.push(cand.libraryId);
        }
        if (cand.observedKeyword && !existing.matchedKeywords.includes(cand.observedKeyword)) {
          existing.matchedKeywords.push(cand.observedKeyword);
        }
        if (!existing.facebookPageUrl && cand.facebookPageUrl) {
          existing.facebookPageUrl = cand.facebookPageUrl;
          existing.facebookPageState = 'found';
        }
        if (!existing.destinationUrl && cand.destinationUrl) {
          existing.destinationUrl = cand.destinationUrl;
          existing.destinationDomain = cand.destinationDomain;
          existing.websiteState = 'found';
        }
        if (!existing.sampleCopy && cand.bodyCopy) {
          existing.sampleCopy = cand.bodyCopy;
        }
        if (!existing.sampleCta && cand.ctaText) {
          existing.sampleCta = cand.ctaText;
        }
      }

      if (evalResult) {
        existing.relevanceScore = Math.max(existing.relevanceScore || 0, evalResult.score);
        existing.relevanceDecision = evalResult.decision;
        existing.relevanceConfidence = evalResult.confidence;
        existing.relevanceReasons = evalResult.reasons;
        existing.relevanceMatchedTerms = evalResult.matchedTerms;
        existing.relevanceEvidence = evalResult.evidence;
        existing.relevanceStrategyVersion = evalResult.strategyVersion;
        existing.engineVersion = evalResult.engineVersion;
        existing.presetVersion = evalResult.presetVersion;
      }
    } else {
      if (leadMap.size >= maxResults) {
        // Quota reached for unique relevant leads
        continue;
      }

      // Consolidate best fields across candidate cards
      const bestFbUrl = cands.find(c => Boolean(c.facebookPageUrl))?.facebookPageUrl;
      const bestDestCand = cands.find(c => Boolean(c.destinationUrl));
      const bestDestUrl = bestDestCand?.destinationUrl;
      const bestDestDomain = bestDestCand?.destinationDomain;
      const bestCopy = cands.find(c => Boolean(c.bodyCopy))?.bodyCopy;
      const bestCta = cands.find(c => Boolean(c.ctaText))?.ctaText;

      const adIds = Array.from(new Set(cands.map(c => c.libraryId).filter(Boolean)));
      const matchedKws = Array.from(new Set(cands.map(c => c.observedKeyword).filter(Boolean) as string[]));

      const fbState = bestFbUrl ? 'found' : 'not_found';
      const webState = bestDestUrl ? 'found' : 'not_found';

      const lead: ExtensionLead = {
        id: `lead_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        name: cleanName,
        canonicalName: cleanName,
        facebookPageName: cleanName,
        facebookPageUrl: bestFbUrl,
        facebookPageState: fbState,
        destinationUrl: bestDestUrl,
        destinationDomain: bestDestDomain,
        websiteState: webState,
        activeAdCount: cands.length,
        adLibraryIds: adIds,
        adLibraryUrl: adIds[0] ? `https://www.facebook.com/ads/library/?id=${adIds[0]}` : undefined,
        matchedKeywords: matchedKws.length > 0 ? matchedKws : (intent?.primaryKeywords?.slice(0, 1) || []),
        locationCode,
        locationName,
        status: webState === 'found' ? 'QUALIFIED' : 'REVIEW_REQUIRED',
        discoveredAt: new Date().toISOString(),
        sampleCopy: bestCopy,
        sampleCta: bestCta,
        relevanceScore: evalResult?.score,
        relevanceDecision: evalResult?.decision,
        relevanceConfidence: evalResult?.confidence,
        relevanceReasons: evalResult?.reasons,
        relevanceMatchedTerms: evalResult?.matchedTerms,
        relevanceEvidence: evalResult?.evidence,
        relevanceStrategyVersion: evalResult?.strategyVersion,
        engineVersion: evalResult?.engineVersion,
        presetVersion: evalResult?.presetVersion
      };

      leadMap.set(key, lead);
    }
  }

  const finalLeads = Array.from(leadMap.values());
  const duplicatesRemoved = totalAdsCount - finalLeads.length;

  return {
    leads: finalLeads,
    totalAdsCount,
    rejectedCount,
    uncertainCount,
    evaluatedCount,
    counters: {
      rawAds: totalAdsCount,
      normalizedCandidates: evaluatedCount,
      relevantCandidates: finalLeads.length,
      uncertainCandidates: uncertainCount,
      notRelevantCandidates: rejectedCount,
      duplicatesRemoved: Math.max(0, duplicatesRemoved),
      finalUniqueLeads: finalLeads.length,
      reasonCodes
    }
  };
}

/**
 * Sanitizes field to prevent formula injection in Excel/CSV
 * (=, +, -, @, \t, \r)
 */
export function sanitizeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();

  // Protect against spreadsheet formula injection
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generates RFC-compliant and formula-safe CSV from leads
 */
export function exportLeadsToCsv(leads: ExtensionLead[], run?: ExtensionResearchRun): string {
  const metaHeader = run
    ? `# Research Run: ${run.researchName} | Mode: ${run.mode} | Requested Quota: ${run.targetLeadCount} | Final Relevant Leads: ${run.leads.length} | Status: ${run.status} | Stop Reason: ${run.stopReason || 'N/A'} | Engine Version: ${run.engineVersion || 'strict-v2'}\r\n`
    : '';

  const headers = [
    'Lead Name',
    'Facebook Page Name',
    'Facebook Page URL',
    'Facebook Page Status',
    'Website Domain',
    'Destination URL',
    'Website Status',
    'Active Ads Count',
    'Matched Keywords',
    'Location Code',
    'Location Name',
    'Ad Library IDs',
    'Meta Ad Library URL',
    'Relevance Decision',
    'Relevance Score',
    'Relevance Confidence',
    'Relevance Matched Terms',
    'Relevance Explanation',
    'Engine Version',
    'Status',
    'Discovered At',
    'Sample Copy',
    'Sample CTA'
  ];

  const rows = leads.map(l => [
    sanitizeCsvField(l.name),
    sanitizeCsvField(l.facebookPageName),
    sanitizeCsvField(l.facebookPageUrl || ''),
    sanitizeCsvField(l.facebookPageState),
    sanitizeCsvField(l.destinationDomain || ''),
    sanitizeCsvField(l.destinationUrl || ''),
    sanitizeCsvField(l.websiteState),
    sanitizeCsvField(l.activeAdCount),
    sanitizeCsvField(l.matchedKeywords.join('; ')),
    sanitizeCsvField(l.locationCode),
    sanitizeCsvField(l.locationName),
    sanitizeCsvField(l.adLibraryIds.join('; ')),
    sanitizeCsvField(l.adLibraryUrl || ''),
    sanitizeCsvField(l.relevanceDecision || 'RELEVANT'),
    sanitizeCsvField(l.relevanceScore !== undefined ? `${(l.relevanceScore * 100).toFixed(0)}%` : '100%'),
    sanitizeCsvField(l.relevanceConfidence || 'HIGH'),
    sanitizeCsvField(l.relevanceMatchedTerms ? l.relevanceMatchedTerms.join('; ') : ''),
    sanitizeCsvField(l.relevanceReasons ? l.relevanceReasons.slice(0, 2).join(' | ') : ''),
    sanitizeCsvField(l.engineVersion || 'strict-v2'),
    sanitizeCsvField(l.status),
    sanitizeCsvField(l.discoveredAt),
    sanitizeCsvField(l.sampleCopy || ''),
    sanitizeCsvField(l.sampleCta || '')
  ]);

  return metaHeader + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
}
