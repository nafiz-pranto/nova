/**
 * Lead Relevance & Semantic Filtering Engine — Strict Relevance Gate v2
 * Strategy Version: 2 ("strict-v2")
 *
 * Local, deterministic, explainable evidence-based classification for public Meta Ad Library candidates.
 * Operates without external AI APIs, cloud backends, or probabilistic models.
 *
 * PIPELINE FLOW:
 * RAW RESULT
 *   -> CANDIDATE NORMALIZATION
 *   -> ENTITY IDENTITY EVIDENCE
 *   -> POSITIVE CATEGORY EVIDENCE
 *   -> COMMERCIAL INTENT EVIDENCE
 *   -> CONFLICT & CONTRADICTION EVIDENCE
 *   -> EVIDENCE SUFFICIENCY GATE (Hard Gate)
 *   -> THREE-WAY CLASSIFICATION (RELEVANT | UNCERTAIN | NOT_RELEVANT)
 *   -> SCORE & CONFIDENCE
 *   -> ENTITY-LEVEL AGGREGATION & DEDUPLICATION
 *   -> FINAL LEADS (Strictly RELEVANT only)
 */

import type {
  ScrapedAdCandidate,
  ResearchMode,
  RelevanceDecision,
  RelevanceConfidence,
  EvidenceStrength,
  EvidenceType,
  EvidenceSource,
  StructuredEvidence
} from './types.ts';
import { RESEARCH_PRESETS } from '../data/presetCatalogue.ts';

export const RELEVANCE_STRATEGY_VERSION = 2;
export const RELEVANCE_ENGINE_VERSION = 'strict-v2';

export type {
  RelevanceDecision,
  RelevanceConfidence,
  EvidenceStrength,
  EvidenceType,
  EvidenceSource,
  StructuredEvidence
};

export interface ResearchIntent {
  mode: ResearchMode;
  keywords: string[];
  presetId?: string;
  presetName?: string;
  presetVersion?: string;
  targetIndustry?: string;
  targetSubIndustry?: string;
  primaryKeywords?: string[];
  secondaryKeywords?: string[];
  exclusions?: string[];
  locationCode?: string;
}

export interface CandidateEvidence {
  query?: string;
  queryTerms?: string[];
  advertiserName: string;
  adText?: string;
  destinationUrl?: string;
  destinationDomain?: string;
  facebookPageName?: string;
  facebookPageUrl?: string;
  ctaText?: string;
  matchedKeyword?: string;
  researchLocation?: string;
  optionalContext?: Record<string, unknown>;
}

export interface NormalizedEvidence {
  normalizedAdvertiserTokens: string[];
  normalizedAdTextTokens: string[];
  normalizedDomain: string;
  normalizedUrlSlug: string;
  normalizedPageNameTokens: string[];
  normalizedCta: string;
  advertiserText: string;
  adCopyText: string;
}

export interface EvidenceBreakdown {
  advertiserNameScore: number;
  adCopyScore: number;
  destinationScore: number;
  facebookPageScore: number;
  commercialScore: number;
  negativePenalty: number;
}

export interface RelevanceEvaluation {
  decision: RelevanceDecision;
  confidence: RelevanceConfidence;
  score: number; // 0.0 to 1.0 (normalized supporting metric)
  reasons: string[];
  matchedKeywords: string[];
  matchedTerms: string[];
  negativeSignals: string[];
  evidence: StructuredEvidence[];
  conflicts: StructuredEvidence[];
  evidenceBreakdown: EvidenceBreakdown;
  strategyVersion: number;
  engineVersion: string;
  presetVersion?: string;
  reasonCode: string;
}

// Bounded Category Taxonomy definition for generalizable, multi-category support
export interface BoundedCategoryTaxonomy {
  category: string;
  rootTerms: string[];
  productServiceTerms: string[];
  industryDescriptors: string[];
  conflictingCategories: string[];
}

export const BOUNDED_TAXONOMY: Record<string, BoundedCategoryTaxonomy> = {
  furniture: {
    category: 'furniture',
    rootTerms: ['furniture', 'furnishing', 'furnishings', 'furnish'],
    productServiceTerms: [
      'chair', 'table', 'desk', 'sofa', 'couch', 'bed', 'mattress', 'cabinet',
      'wardrobe', 'dining', 'bench', 'drawer', 'drawers', 'stool', 'bookshelf',
      'shelf', 'shelves', 'almirah', 'cupboard', 'recliner', 'credenza',
      'workstation', 'seating', 'lounge', 'headboard', 'nightstand', 'dresser',
      'vanity', 'sideboard', 'armchair', 'futon', 'loveseat', 'ottoman',
      'sectional', 'ergonomic chair', 'standing desk', 'bedroom set'
    ],
    industryDescriptors: [
      'furniture store', 'furniture retailer', 'furniture manufacturer',
      'furniture studio', 'home furniture', 'office furniture', 'wood furniture',
      'custom furniture', 'living room', 'bedroom set', 'dining room'
    ],
    conflictingCategories: ['sports', 'healthcare', 'politics', 'gaming', 'casino', 'education', 'news_media']
  },
  restaurant: {
    category: 'restaurant',
    rootTerms: ['restaurant', 'dining', 'eatery', 'bistro', 'cafe', 'food'],
    productServiceTerms: [
      'menu', 'cuisine', 'chef', 'catering', 'takeaway', 'takeout', 'delivery',
      'breakfast', 'lunch', 'dinner', 'brunch', 'burger', 'pizza', 'pasta',
      'steak', 'seafood', 'dessert', 'cocktails', 'wine', 'appetizers', 'buffet'
    ],
    industryDescriptors: [
      'fine dining', 'casual dining', 'restaurant & bar', 'cafe & bakery', 'culinary'
    ],
    conflictingCategories: ['sports', 'politics', 'gaming', 'casino']
  },
  dental: {
    category: 'dental',
    rootTerms: ['dentist', 'dental', 'orthodontist', 'orthodontics'],
    productServiceTerms: [
      'teeth', 'tooth', 'invisalign', 'braces', 'whitening', 'implants',
      'cleaning', 'denture', 'crown', 'veneer', 'extraction', 'cavity', 'oral surgery'
    ],
    industryDescriptors: ['dental clinic', 'dental practice', 'family dentistry'],
    conflictingCategories: ['sports', 'politics', 'gaming', 'furniture']
  },
  roofing: {
    category: 'roofing',
    rootTerms: ['roof', 'roofing', 'roofer'],
    productServiceTerms: [
      'shingles', 'gutters', 'siding', 'leak repair', 'metal roof', 'tile roof',
      'flat roof', 'roof inspection', 'roof replacement', 'flashing', 'soffit'
    ],
    industryDescriptors: ['roofing contractor', 'roofing company', 'roofing specialists'],
    conflictingCategories: ['sports', 'politics', 'gaming']
  },
  real_estate: {
    category: 'real_estate',
    rootTerms: ['real estate', 'realty', 'realtor', 'property', 'properties'],
    productServiceTerms: [
      'apartment', 'condo', 'townhouse', 'villa', 'homes for sale', 'open house',
      'mortgage', 'brokerage', 'leasing', 'tenant', 'landlord', 'commercial space'
    ],
    industryDescriptors: ['real estate agency', 'property group', 'real estate broker'],
    conflictingCategories: ['sports', 'politics', 'gaming']
  },
  marketing_agency: {
    category: 'marketing_agency',
    rootTerms: ['marketing agency', 'digital marketing', 'advertising agency', 'media agency'],
    productServiceTerms: [
      'seo', 'ppc', 'lead generation', 'social media marketing', 'branding',
      'content marketing', 'web design', 'growth marketing', 'performance marketing'
    ],
    industryDescriptors: ['creative agency', 'marketing partner', 'growth agency'],
    conflictingCategories: ['sports', 'politics', 'gaming']
  },
  clothing: {
    category: 'clothing',
    rootTerms: ['clothing', 'apparel', 'fashion', 'wear', 'garments'],
    productServiceTerms: [
      'dress', 'shirt', 'pants', 't-shirt', 'jacket', 'hoodie', 'shoes',
      'footwear', 'denim', 'jeans', 'boutique', 'suits', 'outfit', 'swimwear'
    ],
    industryDescriptors: ['clothing brand', 'fashion boutique', 'apparel store'],
    conflictingCategories: ['sports_team', 'politics', 'gaming']
  },
  fitness: {
    category: 'fitness',
    rootTerms: ['fitness', 'gym', 'workout', 'training'],
    productServiceTerms: [
      'personal trainer', 'crossfit', 'bodybuilding', 'weightlifting', 'cardio',
      'yoga', 'pilates', 'membership', 'strength training', 'coaching'
    ],
    industryDescriptors: ['fitness center', 'health club', 'gym & fitness'],
    conflictingCategories: ['politics', 'gaming', 'casino']
  },
  saas: {
    category: 'saas',
    rootTerms: ['saas', 'cloud software', 'business software', 'software platform'],
    productServiceTerms: [
      'crm', 'erp', 'pipeline', 'workflow automation', 'subscription',
      'enterprise software', 'dashboard', 'analytics tool', 'b2b platform'
    ],
    industryDescriptors: ['b2b saas', 'software provider', 'cloud solution'],
    conflictingCategories: ['sports', 'politics', 'casino']
  },
  construction: {
    category: 'construction',
    rootTerms: ['construction', 'contractor', 'builder', 'remodeling'],
    productServiceTerms: [
      'renovation', 'drywall', 'masonry', 'excavation', 'framing', 'general contractor',
      'commercial building', 'home addition', 'deck building', 'demolition'
    ],
    industryDescriptors: ['construction company', 'building contractors'],
    conflictingCategories: ['sports', 'politics', 'gaming']
  },
  photography: {
    category: 'photography',
    rootTerms: ['photography', 'photographer', 'photoshoot'],
    productServiceTerms: [
      'portrait', 'wedding photography', 'headshots', 'studio portrait',
      'videography', 'photo session', 'commercial photography', 'event photography'
    ],
    industryDescriptors: ['photo studio', 'photography services'],
    conflictingCategories: ['sports_team', 'politics', 'gaming']
  },
  hvac: {
    category: 'hvac',
    rootTerms: ['hvac', 'air conditioning', 'heating', 'cooling', 'ventilation'],
    productServiceTerms: [
      'furnace', 'heat pump', 'duct', 'ductwork', 'ac repair', 'thermostat',
      'compressor', 'refrigerant', 'boiler', 'air filter'
    ],
    industryDescriptors: ['hvac contractor', 'heating repair', 'ac installation'],
    conflictingCategories: ['sports', 'politics', 'gaming']
  }
};

// Cross-domain negative categories to catch clear contradictions
export interface NegativeCategoryDefinition {
  category: string;
  terms: string[];
  entityTokens: string[];
  penalty: number;
}

export const NEGATIVE_CATEGORIES: NegativeCategoryDefinition[] = [
  {
    category: 'sports',
    terms: [
      'manchester united', 'premier league', 'football club', 'soccer team',
      'cricket board', 'champions league', 'matchday', 'fifa', 'uefa',
      'nba', 'nfl', 'sports club', 'women team', 'head coach', 'stadium'
    ],
    entityTokens: ['fc', 'united', 'stadium', 'club', 'league', 'team', 'cricket', 'football', 'fifa', 'uefa'],
    penalty: -0.65
  },
  {
    category: 'healthcare',
    terms: [
      'health support community', 'saved my husband', 'seventy-nine',
      'cancer treatment', 'diabetes remedy', 'chronic illness', 'prescription drug',
      'patient clinical', 'health injustice', 'clinical trial', 'disease cure',
      'medical hospital', 'dental care clinic'
    ],
    entityTokens: ['hospital', 'clinic', 'medical', 'pharma', 'health', 'doctor', 'patient'],
    penalty: -0.65
  },
  {
    category: 'politics',
    terms: [
      'political campaign', 'election rally', 'vote for', 'parliament member',
      'political party', 'candidate for senate', 'citizens for governance',
      'ballot initiative', 'party congress'
    ],
    entityTokens: ['party', 'senate', 'parliament', 'campaign', 'governance', 'election', 'voters'],
    penalty: -0.65
  },
  {
    category: 'gaming_casino',
    terms: [
      'online casino', 'slot machine', 'jackpot betting', 'poker chips',
      'crypto casino', 'betting odds', 'spin to win', 'roulette online'
    ],
    entityTokens: ['casino', 'betting', 'poker', 'slots', 'jackpot'],
    penalty: -0.65
  },
  {
    category: 'news_media',
    terms: [
      'breaking news', 'daily news', 'news network', 'news channel',
      'broadcasting station', 'journalism report', 'magazine online'
    ],
    entityTokens: ['news', 'media', 'journal', 'broadcasting', 'times', 'chronicle', 'gazette'],
    penalty: -0.55
  },
  {
    category: 'education',
    terms: [
      'university admissions', 'undergraduate degree', 'campus tuition',
      'public school district', 'college alumni', 'academic curriculum'
    ],
    entityTokens: ['university', 'college', 'school', 'academy', 'campus', 'alumni'],
    penalty: -0.55
  },
  {
    category: 'charity_ngo',
    terms: [
      'charity relief', 'humanitarian aid', 'donation campaign',
      'non-profit organization', 'relief fund', 'donate now to support'
    ],
    entityTokens: ['charity', 'foundation', 'relief', 'humanitarian', 'donation', 'ngo'],
    penalty: -0.55
  }
];

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could', 'did',
  'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is',
  'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no',
  'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she',
  'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
  'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with',
  'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Normalizes an English word: singularizes standard plural endings.
 */
export function stemToken(token: string): string {
  const t = token.toLowerCase().trim();
  if (t.length <= 3) return t;

  if (t.endsWith('ies') && t.length > 4) {
    return t.substring(0, t.length - 3) + 'y';
  }
  if (t.endsWith('ses') || t.endsWith('xes') || t.endsWith('zes') || t.endsWith('ches') || t.endsWith('shes')) {
    return t.substring(0, t.length - 2);
  }
  if (t.endsWith('s') && !t.endsWith('ss') && !t.endsWith('us') && !t.endsWith('is')) {
    return t.substring(0, t.length - 1);
  }
  return t;
}

/**
 * Splits text into normalized, stemmed significant tokens.
 */
export function tokenizeText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/[\s-]+/)
    .map(w => w.trim())
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w))
    .map(stemToken);
}

/**
 * Extracts URL slug / path segments.
 */
export function extractUrlTokens(urlStr?: string): string[] {
  if (!urlStr) return [];
  try {
    const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    const pathAndQuery = `${url.pathname} ${url.search}`.replace(/[/?&=_.-]/g, ' ');
    return tokenizeText(pathAndQuery);
  } catch {
    return tokenizeText(urlStr.replace(/[/?&=_.-]/g, ' '));
  }
}

/**
 * Cleans and normalizes candidate evidence.
 */
export function normalizeEvidence(evidence: CandidateEvidence): NormalizedEvidence {
  const rawAdvertiser = (evidence.advertiserName || '').trim();
  const rawAdCopy = (evidence.adText || '').trim();
  const rawPageName = (evidence.facebookPageName || '').trim();
  const rawCta = (evidence.ctaText || '').trim();

  let rawDomain = (evidence.destinationDomain || '').toLowerCase().trim();
  if (!rawDomain && evidence.destinationUrl) {
    try {
      const u = new URL(evidence.destinationUrl.startsWith('http') ? evidence.destinationUrl : `https://${evidence.destinationUrl}`);
      rawDomain = u.hostname.replace(/^(www\.|m\.|l\.)/, '');
    } catch {
      rawDomain = '';
    }
  }

  return {
    normalizedAdvertiserTokens: tokenizeText(rawAdvertiser),
    normalizedAdTextTokens: tokenizeText(rawAdCopy),
    normalizedDomain: rawDomain,
    normalizedUrlSlug: evidence.destinationUrl ? extractUrlTokens(evidence.destinationUrl).join(' ') : '',
    normalizedPageNameTokens: tokenizeText(rawPageName),
    normalizedCta: rawCta.toLowerCase(),
    advertiserText: rawAdvertiser.toLowerCase(),
    adCopyText: rawAdCopy.toLowerCase()
  };
}

/**
 * Compiles a comprehensive ResearchIntent from user input or preset.
 */
export function compileResearchIntent(
  mode: ResearchMode,
  keywords: string[],
  presetId?: string,
  locationCode = 'US'
): ResearchIntent {
  const cleanKeywords = keywords.map(k => k.trim()).filter(Boolean);

  if (mode === 'PRESET' && presetId) {
    const preset = RESEARCH_PRESETS.find(p => p.preset_id === presetId);
    if (preset) {
      return {
        mode: 'PRESET',
        keywords: preset.primary_keywords,
        presetId: preset.preset_id,
        presetName: preset.name,
        presetVersion: preset.version,
        targetIndustry: preset.industry,
        targetSubIndustry: preset.sub_industry,
        primaryKeywords: preset.primary_keywords,
        secondaryKeywords: preset.secondary_keywords,
        exclusions: preset.optional_exclusions || [],
        locationCode
      };
    }
  }

  return {
    mode: 'CUSTOM',
    keywords: cleanKeywords,
    primaryKeywords: cleanKeywords,
    secondaryKeywords: [],
    exclusions: [],
    locationCode
  };
}

/**
 * Lead Relevance Engine — Strict Relevance Gate v2
 */
export class LeadRelevanceEngine {
  public static readonly VERSION = RELEVANCE_STRATEGY_VERSION;
  public static readonly ENGINE_VERSION = RELEVANCE_ENGINE_VERSION;
  public static compileResearchIntent = compileResearchIntent;

  /**
   * Evaluates a single candidate ad against the research intent using the Multi-Stage Pipeline.
   */
  public static evaluateCandidate(
    candidate: ScrapedAdCandidate,
    intent: ResearchIntent
  ): RelevanceEvaluation {
    const evidence: CandidateEvidence = {
      advertiserName: candidate.pageName,
      adText: candidate.bodyCopy,
      destinationUrl: candidate.destinationUrl,
      destinationDomain: candidate.destinationDomain,
      facebookPageName: candidate.pageName,
      facebookPageUrl: candidate.facebookPageUrl,
      ctaText: candidate.ctaText,
      matchedKeyword: candidate.observedKeyword
    };

    return this.evaluateEvidence(evidence, intent);
  }

  /**
   * Evaluates structured candidate evidence against research intent.
   * Deterministic, explainable, and bounded.
   */
  public static evaluateEvidence(
    evidence: CandidateEvidence,
    intent: ResearchIntent
  ): RelevanceEvaluation {
    const normalized = normalizeEvidence(evidence);

    const structuredEvidence: StructuredEvidence[] = [];
    const conflicts: StructuredEvidence[] = [];
    const reasons: string[] = [];
    const matchedKeywords: string[] = [];
    const matchedTerms: string[] = [];
    const negativeSignals: string[] = [];

    // All query phrases across primary and secondary keywords
    const allQueryPhrases = [
      ...(intent.primaryKeywords || intent.keywords || []),
      ...(intent.secondaryKeywords || [])
    ].map(k => k.toLowerCase().trim()).filter(Boolean);

    // Resolve taxonomy categories for active query phrases
    const activeTaxonomies: BoundedCategoryTaxonomy[] = [];
    for (const [key, tax] of Object.entries(BOUNDED_TAXONOMY)) {
      if (
        allQueryPhrases.some(phrase =>
          phrase.includes(key) ||
          tax.rootTerms.some(rt => phrase.includes(rt))
        )
      ) {
        activeTaxonomies.push(tax);
      }
    }

    // If query does not match any built-in taxonomy, dynamically construct a bounded taxonomy
    if (activeTaxonomies.length === 0 && allQueryPhrases.length > 0) {
      const dynamicRoots: string[] = [];
      const dynamicStems: string[] = [];
      for (const phrase of allQueryPhrases) {
        dynamicRoots.push(phrase);
        for (const tok of tokenizeText(phrase)) {
          dynamicStems.push(tok);
        }
      }
      activeTaxonomies.push({
        category: allQueryPhrases[0],
        rootTerms: Array.from(new Set(dynamicRoots)),
        productServiceTerms: Array.from(new Set(dynamicStems)),
        industryDescriptors: allQueryPhrases,
        conflictingCategories: ['sports', 'healthcare', 'politics', 'gaming', 'casino']
      });
    }

    // Core target tokens from query phrases and active taxonomy root terms
    const coreQueryTokens = new Set<string>();
    for (const phrase of allQueryPhrases) {
      for (const t of tokenizeText(phrase)) {
        coreQueryTokens.add(t);
      }
    }
    for (const tax of activeTaxonomies) {
      for (const rt of tax.rootTerms) {
        for (const t of tokenizeText(rt)) {
          coreQueryTokens.add(t);
        }
      }
    }

    // Product and service terms across active taxonomies
    const productTerms = new Set<string>();
    for (const tax of activeTaxonomies) {
      for (const t of tax.productServiceTerms) {
        productTerms.add(stemToken(t));
      }
    }

    // -------------------------------------------------------------
    // STAGE 1: CONFLICT & CONTRADICTION EVIDENCE
    // -------------------------------------------------------------
    let negativePenalty = 0;

    // A. Check Preset Exclusions
    if (intent.exclusions && intent.exclusions.length > 0) {
      for (const excl of intent.exclusions) {
        const exclLower = excl.toLowerCase();
        if (
          normalized.advertiserText.includes(exclLower) ||
          normalized.adCopyText.includes(exclLower) ||
          normalized.normalizedDomain.includes(exclLower)
        ) {
          const reason = `Matched preset exclusion rule: "${excl}"`;
          negativeSignals.push(reason);
          conflicts.push({
            type: 'CONTRADICTION',
            strength: 'STRONG',
            source: 'advertiser_name',
            reason,
            matchedSignal: excl,
            reasonCode: 'REJECT_PRESET_EXCLUSION'
          });
          negativePenalty -= 0.55;
          break;
        }
      }
    }

    // B. Check Cross-Domain Negative Categories
    for (const negCat of NEGATIVE_CATEGORIES) {
      // Skip if the user query itself is specifically about this category
      const isQueryRelatedToNegCat = allQueryPhrases.some(q =>
        negCat.terms.some(t => q.includes(t)) ||
        q.includes(negCat.category) ||
        (negCat.category === 'sports' && (q.includes('football') || q.includes('cricket') || q.includes('sports')))
      );
      if (isQueryRelatedToNegCat) continue;

      // 1. Unrelated entity identity contradiction (e.g. Manchester United, Dental Care clinic, Casino)
      let entityContradictionTerm: string | undefined;
      for (const term of negCat.terms) {
        if (normalized.advertiserText.includes(term) || normalized.normalizedDomain.includes(term.replace(/\s+/g, ''))) {
          entityContradictionTerm = term;
          break;
        }
      }

      if (entityContradictionTerm) {
        const reason = `Advertiser entity identity belongs to unrelated category (${negCat.category}): "${entityContradictionTerm}"`;
        negativeSignals.push(reason);
        conflicts.push({
          type: 'CONTRADICTION',
          strength: 'STRONG',
          source: 'advertiser_name',
          reason,
          matchedSignal: entityContradictionTerm,
          reasonCode: 'REJECT_CONTRADICTION_IDENTITY'
        });
        negativePenalty += negCat.penalty;
        continue;
      }

      // 2. Unrelated terms in ad copy or page identity
      for (const term of negCat.terms) {
        if (
          normalized.adCopyText.includes(term) ||
          normalized.normalizedDomain.includes(term.replace(/\s+/g, ''))
        ) {
          const reason = `Unrelated ${negCat.category} signal detected in candidate ad context: "${term}"`;
          negativeSignals.push(reason);
          conflicts.push({
            type: 'NEGATIVE_CATEGORY',
            strength: 'STRONG',
            source: 'ad_text',
            reason,
            matchedSignal: term,
            reasonCode: 'REJECT_CONFLICT'
          });
          negativePenalty += negCat.penalty;
          break;
        }
      }
    }

    // Cap negative penalty
    negativePenalty = Math.max(-0.80, negativePenalty);

    // -------------------------------------------------------------
    // STAGE 2: ENTITY IDENTITY EVIDENCE
    // -------------------------------------------------------------
    let advertiserNameScore = 0;
    let hasStrongEntityMatch = false;
    let hasModerateEntityMatch = false;

    // Exact phrase match in advertiser name
    for (const phrase of allQueryPhrases) {
      if (normalized.advertiserText.includes(phrase)) {
        advertiserNameScore = 0.40;
        hasStrongEntityMatch = true;
        matchedKeywords.push(phrase);
        matchedTerms.push(phrase);
        const reason = `Advertiser name explicitly contains target category query "${phrase}"`;
        reasons.push(reason);
        structuredEvidence.push({
          type: 'ENTITY_IDENTITY',
          strength: 'STRONG',
          source: 'advertiser_name',
          reason,
          matchedSignal: phrase,
          reasonCode: 'SIGNAL_ENTITY_NAME_EXACT'
        });
        break;
      }
    }

    if (!hasStrongEntityMatch) {
      // Check core query token stems in advertiser name
      const matchedTokensInName = normalized.normalizedAdvertiserTokens.filter(t => coreQueryTokens.has(t));
      if (matchedTokensInName.length > 0) {
        advertiserNameScore = 0.30;
        hasStrongEntityMatch = true;
        matchedTerms.push(...matchedTokensInName);
        const reason = `Advertiser name contains core target keyword stem(s): ${matchedTokensInName.join(', ')}`;
        reasons.push(reason);
        structuredEvidence.push({
          type: 'ENTITY_IDENTITY',
          strength: 'STRONG',
          source: 'advertiser_name',
          reason,
          matchedSignal: matchedTokensInName.join(', '),
          reasonCode: 'SIGNAL_ENTITY_NAME_CORE'
        });
      } else {
        // Check if advertiser name contains category product terms (e.g. "Woodcraft Chairs", "ErgoDesk", "Seating Lounge")
        const productTokensInName = normalized.normalizedAdvertiserTokens.filter(t => productTerms.has(t));
        const matchedSubstringProduct = Array.from(productTerms).filter(
          pt => pt.length >= 4 && normalized.advertiserText.includes(pt)
        );
        const combinedProductMatches = Array.from(new Set([...productTokensInName, ...matchedSubstringProduct]));

        if (combinedProductMatches.length > 0) {
          advertiserNameScore = 0.25;
          hasModerateEntityMatch = true;
          matchedTerms.push(...combinedProductMatches);
          const reason = `Advertiser name contains target product term(s): ${combinedProductMatches.join(', ')}`;
          reasons.push(reason);
          structuredEvidence.push({
            type: 'ENTITY_IDENTITY',
            strength: 'MODERATE',
            source: 'advertiser_name',
            reason,
            matchedSignal: combinedProductMatches.join(', '),
            reasonCode: 'SIGNAL_ENTITY_NAME_PRODUCT'
          });
        }
      }
    }

    // Destination domain entity check
    let destinationScore = 0;
    let hasDomainCategoryMatch = false;

    if (normalized.normalizedDomain) {
      const domainHasQuery = allQueryPhrases.some(p =>
        normalized.normalizedDomain.includes(p.replace(/\s+/g, ''))
      );
      const domainHasProduct = Array.from(productTerms).some(t =>
        t.length >= 4 && normalized.normalizedDomain.includes(t)
      );

      if (domainHasQuery) {
        destinationScore = 0.20;
        hasDomainCategoryMatch = true;
        const reason = `Destination domain "${normalized.normalizedDomain}" explicitly contains target query`;
        reasons.push(reason);
        structuredEvidence.push({
          type: 'ENTITY_IDENTITY',
          strength: 'STRONG',
          source: 'destination_domain',
          reason,
          matchedSignal: normalized.normalizedDomain,
          reasonCode: 'SIGNAL_DOMAIN_QUERY_EXACT'
        });
      } else if (domainHasProduct) {
        destinationScore = 0.15;
        hasDomainCategoryMatch = true;
        const reason = `Destination domain "${normalized.normalizedDomain}" contains category product term`;
        reasons.push(reason);
        structuredEvidence.push({
          type: 'ENTITY_IDENTITY',
          strength: 'MODERATE',
          source: 'destination_domain',
          reason,
          matchedSignal: normalized.normalizedDomain,
          reasonCode: 'SIGNAL_DOMAIN_PRODUCT'
        });
      }
    }

    // Facebook page identity handle
    let facebookPageScore = 0;
    if (evidence.facebookPageUrl) {
      const pageUrlLower = evidence.facebookPageUrl.toLowerCase();
      const pageHasQuery = allQueryPhrases.some(p => pageUrlLower.includes(p.replace(/\s+/g, '')));
      if (pageHasQuery) {
        facebookPageScore = hasStrongEntityMatch ? 0.05 : 0.12;
        const reason = `Facebook Page handle/URL reinforces target category identity`;
        reasons.push(reason);
        structuredEvidence.push({
          type: 'ENTITY_IDENTITY',
          strength: 'MODERATE',
          source: 'facebook_page',
          reason,
          matchedSignal: evidence.facebookPageUrl,
          reasonCode: 'SIGNAL_PAGE_HANDLE'
        });
      }
    }

    // -------------------------------------------------------------
    // STAGE 3: POSITIVE CATEGORY EVIDENCE (Ad Copy & Catalog)
    // -------------------------------------------------------------
    let adCopyScore = 0;
    let adCopyHasPhraseMatch = false;

    for (const phrase of allQueryPhrases) {
      if (normalized.adCopyText.includes(phrase)) {
        adCopyScore += 0.20;
        adCopyHasPhraseMatch = true;
        if (!matchedKeywords.includes(phrase)) matchedKeywords.push(phrase);
        if (!matchedTerms.includes(phrase)) matchedTerms.push(phrase);
        const reason = `Ad copy directly mentions target query "${phrase}"`;
        reasons.push(reason);
        structuredEvidence.push({
          type: 'CATEGORY_MATCH',
          strength: 'MODERATE',
          source: 'ad_text',
          reason,
          matchedSignal: phrase,
          reasonCode: 'SIGNAL_COPY_PHRASE'
        });
        break;
      }
    }

    // Search for specific product and service terms in copy
    const foundProductTermsInCopy = Array.from(productTerms).filter(t =>
      normalized.normalizedAdTextTokens.includes(t) ||
      (t.length >= 4 && normalized.adCopyText.includes(t))
    );

    let hasProductCatalogEvidence = false;
    if (foundProductTermsInCopy.length > 0) {
      const sampleTerms = foundProductTermsInCopy.slice(0, 5);
      matchedTerms.push(...sampleTerms);

      if (foundProductTermsInCopy.length >= 2) {
        // Multiple specific product terms provide strong catalog evidence (e.g. table, sofa, chair, bed)
        hasProductCatalogEvidence = true;
        const copyAdd = Math.min(0.35, 0.15 + (foundProductTermsInCopy.length - 1) * 0.06);
        adCopyScore += copyAdd;
        const reason = `Ad copy contains specific category product catalog: ${sampleTerms.join(', ')}`;
        reasons.push(reason);
        structuredEvidence.push({
          type: 'CATEGORY_MATCH',
          strength: 'STRONG',
          source: 'ad_text',
          reason,
          matchedSignal: sampleTerms.join(', '),
          reasonCode: 'SIGNAL_COPY_PRODUCT_CATALOG'
        });
      } else {
        adCopyScore += 0.12;
        const reason = `Ad copy mentions category product term: ${sampleTerms[0]}`;
        reasons.push(reason);
        structuredEvidence.push({
          type: 'CATEGORY_MATCH',
          strength: 'WEAK',
          source: 'ad_text',
          reason,
          matchedSignal: sampleTerms[0],
          reasonCode: 'SIGNAL_COPY_SINGLE_PRODUCT'
        });
      }
    } else if (!adCopyHasPhraseMatch) {
      const matchedTokensInCopy = normalized.normalizedAdTextTokens.filter(t => coreQueryTokens.has(t));
      if (matchedTokensInCopy.length > 0) {
        adCopyScore += 0.10;
        matchedTerms.push(...matchedTokensInCopy);
        const reason = `Ad copy mentions keyword stem(s): ${matchedTokensInCopy.join(', ')}`;
        reasons.push(reason);
        structuredEvidence.push({
          type: 'CATEGORY_MATCH',
          strength: 'WEAK',
          source: 'ad_text',
          reason,
          matchedSignal: matchedTokensInCopy.join(', '),
          reasonCode: 'SIGNAL_COPY_STEM_ONLY'
        });
      }
    }

    adCopyScore = Math.min(0.40, adCopyScore);

    // Check destination URL slug for product context
    let hasUrlSlugProduct = false;
    if (normalized.normalizedUrlSlug) {
      const slugHasProduct = Array.from(productTerms).some(t =>
        t.length >= 4 && normalized.normalizedUrlSlug.includes(t)
      );
      const slugHasQuery = Array.from(coreQueryTokens).some(t =>
        normalized.normalizedUrlSlug.includes(t)
      );
      if (slugHasProduct || slugHasQuery) {
        hasUrlSlugProduct = true;
        destinationScore = Math.max(destinationScore, 0.12);
        const reason = `Destination URL path contains target product category context`;
        reasons.push(reason);
        structuredEvidence.push({
          type: 'CATEGORY_MATCH',
          strength: 'MODERATE',
          source: 'destination_url',
          reason,
          matchedSignal: normalized.normalizedUrlSlug.substring(0, 50),
          reasonCode: 'SIGNAL_URL_SLUG_MATCH'
        });
      }
    }

    // -------------------------------------------------------------
    // STAGE 4: COMMERCIAL INTENT EVIDENCE
    // -------------------------------------------------------------
    let commercialScore = 0;
    const commercialCtas = ['shop now', 'buy now', 'order now', 'get quote', 'contact us', 'order'];
    const hasCommercialCta = commercialCtas.includes(normalized.normalizedCta);
    if (hasCommercialCta) {
      commercialScore += 0.05;
      structuredEvidence.push({
        type: 'COMMERCIAL_INTENT',
        strength: 'MODERATE',
        source: 'cta_text',
        reason: `Commercial action call-to-action ("${evidence.ctaText}")`,
        matchedSignal: evidence.ctaText,
        reasonCode: 'SIGNAL_COMMERCIAL_INTENT_CTA'
      });
    }

    const hasPricingInCopy = /(price|discount|sale|off|taka|bdt|usd|\$|€|£|warranty|deal|buy|shop)/i.test(normalized.adCopyText);
    if (hasPricingInCopy) {
      commercialScore = Math.min(0.10, commercialScore + 0.05);
      structuredEvidence.push({
        type: 'COMMERCIAL_INTENT',
        strength: 'MODERATE',
        source: 'ad_text',
        reason: `Commercial pricing, transaction, or sale language observed in ad copy`,
        reasonCode: 'SIGNAL_COMMERCIAL_INTENT_PRICE'
      });
    }

    // -------------------------------------------------------------
    // STAGE 5: EVIDENCE SUFFICIENCY GATE (Hard Gate)
    // -------------------------------------------------------------
    const rawPositiveScore = advertiserNameScore + adCopyScore + destinationScore + facebookPageScore + commercialScore;
    const totalScore = Math.max(0, Math.min(1.0, rawPositiveScore + negativePenalty));

    let decision: RelevanceDecision = 'UNCERTAIN';
    let confidence: RelevanceConfidence = 'LOW';
    let reasonCode = 'UNCERTAIN_AMBIGUOUS_ENTITY';

    // A. Check Hard Contradictions / Exclusions first
    const hasStrongConflict = conflicts.some(c => c.type === 'CONTRADICTION' && c.strength === 'STRONG') || negativePenalty <= -0.30;

    if (hasStrongConflict) {
      decision = 'NOT_RELEVANT';
      confidence = 'HIGH';
      reasonCode = conflicts[0]?.reasonCode || 'REJECT_CONFLICT';
      reasons.unshift(`Disqualified by Hard Contradiction Gate: ${negativeSignals.join('; ')}`);
    } else {
      // B. Evaluate Evidence Sufficiency Rules (Phase 6)
      // Rule 1: Ad copy alone or single keyword match is NEVER enough for RELEVANT
      const hasOnlyWeakKeywordInCopy = !hasStrongEntityMatch && !hasModerateEntityMatch && !hasDomainCategoryMatch && !hasProductCatalogEvidence;

      if (hasOnlyWeakKeywordInCopy) {
        if (totalScore < 0.18) {
          decision = 'NOT_RELEVANT';
          confidence = 'HIGH';
          reasonCode = 'REJECT_INSUFFICIENT_EVIDENCE';
          reasons.push(`Classified as NOT_RELEVANT: No entity or category evidence found.`);
        } else {
          // A candidate with only a loose keyword match without business identity confirmation remains UNCERTAIN
          decision = 'UNCERTAIN';
          confidence = 'LOW';
          reasonCode = 'UNCERTAIN_KEYWORD_ONLY';
          reasons.push(`Classified as UNCERTAIN: Mentioned keyword but lacks independent entity or product evidence.`);
        }
      } else {
        // Evaluate Positive Sufficiency Criteria:
        // Criterion 1: Strong Entity Identity (name contains category or core stem) + at least 1 supporting signal
        const hasSupportingSignal = (
          adCopyScore >= 0.10 ||
          destinationScore >= 0.12 ||
          commercialScore >= 0.05 ||
          facebookPageScore >= 0.05 ||
          hasProductCatalogEvidence
        );

        const passesCriterion1 = hasStrongEntityMatch && hasSupportingSignal;

        // Criterion 2: Moderate Entity Identity (e.g. name has product term "Seating", "ErgoDesk") + ad copy/destination evidence
        const passesCriterion2 = hasModerateEntityMatch && (adCopyScore >= 0.15 || destinationScore >= 0.12 || hasProductCatalogEvidence);

        // Criterion 3: Legitimate business without keyword in name (False Negative protection)
        // Requires multi-term product catalog in copy + corroborating destination or commercial signal
        const passesCriterion3 = hasProductCatalogEvidence && (
          destinationScore >= 0.12 ||
          hasUrlSlugProduct ||
          hasDomainCategoryMatch ||
          (adCopyScore >= 0.25 && commercialScore >= 0.05)
        );

        if ((passesCriterion1 || passesCriterion2 || passesCriterion3) && totalScore >= 0.35) {
          decision = 'RELEVANT';
          const hasMultiDimensionalCorroboration = (
            (hasStrongEntityMatch && hasSupportingSignal) ||
            (hasProductCatalogEvidence && destinationScore >= 0.12 && commercialScore >= 0.05)
          );
          confidence = (totalScore >= 0.60 || hasMultiDimensionalCorroboration) ? 'HIGH' : 'MEDIUM';
          reasonCode = passesCriterion1 ? 'ACCEPT_STRONG_ENTITY_MATCH' : 'ACCEPT_MULTI_SIGNAL_MATCH';
          reasons.push(
            `Qualified as RELEVANT: ${
              passesCriterion1
                ? 'Strong entity identity confirmed with supporting product/commercial evidence'
                : passesCriterion3
                ? 'Category product catalog verified with commercial corroboration'
                : 'Entity and category evidence meet sufficiency standards'
            } (Confidence: ${confidence})`
          );
        } else if (totalScore < 0.22) {
          decision = 'NOT_RELEVANT';
          confidence = totalScore < 0.12 ? 'HIGH' : 'MEDIUM';
          reasonCode = 'REJECT_CATEGORY_MISMATCH';
          reasons.push(`Classified as NOT_RELEVANT: Insufficient category evidence (Score: ${(totalScore * 100).toFixed(0)}%)`);
        } else {
          decision = 'UNCERTAIN';
          confidence = 'LOW';
          reasonCode = 'UNCERTAIN_AMBIGUOUS_ENTITY';
          reasons.push(`Classified as UNCERTAIN: Evidence is ambiguous or insufficient to confirm business vertical.`);
        }
      }
    }

    // Deduplicate matched keywords
    if (evidence.matchedKeyword && !matchedKeywords.includes(evidence.matchedKeyword)) {
      if (decision === 'RELEVANT') {
        matchedKeywords.push(evidence.matchedKeyword);
      }
    }

    return {
      decision,
      confidence,
      score: Math.round(totalScore * 100) / 100,
      reasons,
      matchedKeywords,
      matchedTerms: Array.from(new Set(matchedTerms)),
      negativeSignals,
      evidence: structuredEvidence,
      conflicts,
      evidenceBreakdown: {
        advertiserNameScore,
        adCopyScore,
        destinationScore,
        facebookPageScore,
        commercialScore,
        negativePenalty
      },
      strategyVersion: RELEVANCE_STRATEGY_VERSION,
      engineVersion: RELEVANCE_ENGINE_VERSION,
      presetVersion: intent.presetVersion,
      reasonCode
    };
  }

  /**
   * Entity-Level Evaluation: Evaluates multiple ad cards for an advertiser entity
   * to produce the consolidated entity relevance decision without duplicate inflation.
   */
  public static evaluateEntity(
    advertiserName: string,
    candidates: ScrapedAdCandidate[],
    intent: ResearchIntent
  ): RelevanceEvaluation {
    if (candidates.length === 0) {
      return this.evaluateEvidence({ advertiserName }, intent);
    }

    // 1. Evaluate all candidate cards
    const evaluations = candidates.map(c => this.evaluateCandidate(c, intent));

    // 2. Hard Gate: Disqualify entity if ANY ad reveals a strong contradiction
    const allConflicts = evaluations.flatMap(e => e.conflicts);
    const hasEntityContradiction = allConflicts.some(
      c => c.type === 'CONTRADICTION' && c.strength === 'STRONG'
    );
    const allNegativeSignals = Array.from(new Set(evaluations.flatMap(e => e.negativeSignals)));
    const maxNegativePenalty = Math.min(...evaluations.map(e => e.evidenceBreakdown.negativePenalty));

    if (hasEntityContradiction || maxNegativePenalty <= -0.30) {
      const worstEval = evaluations.find(e => e.evidenceBreakdown.negativePenalty <= -0.30) || evaluations[0];
      return {
        ...worstEval,
        decision: 'NOT_RELEVANT',
        confidence: 'HIGH',
        negativeSignals: allNegativeSignals,
        conflicts: allConflicts,
        reasons: [
          `Entity disqualified across ${candidates.length} ad(s) due to hard contradiction: ${allNegativeSignals.join('; ')}`
        ],
        reasonCode: 'REJECT_CONTRADICTION_IDENTITY',
        engineVersion: RELEVANCE_ENGINE_VERSION,
        strategyVersion: RELEVANCE_STRATEGY_VERSION
      };
    }

    // 3. Multi-Ad Deduplication: Deduplicate identical ad copy to prevent artificial inflation
    const seenCopyHashes = new Set<string>();
    const distinctAds: ScrapedAdCandidate[] = [];
    for (const c of candidates) {
      const copyNormalized = (c.bodyCopy || '').toLowerCase().trim().replace(/\s+/g, ' ').substring(0, 100);
      if (!seenCopyHashes.has(copyNormalized)) {
        seenCopyHashes.add(copyNormalized);
        distinctAds.push(c);
      }
    }

    // 4. Find the best individual evaluation
    evaluations.sort((a, b) => b.score - a.score);
    const bestEval = evaluations[0];

    // Combine matched keywords and terms across all ads
    const combinedKeywords = Array.from(new Set(evaluations.flatMap(e => e.matchedKeywords)));
    const combinedTerms = Array.from(new Set(evaluations.flatMap(e => e.matchedTerms)));
    const allEvidence = Array.from(
      new Map(evaluations.flatMap(e => e.evidence).map(ev => [`${ev.type}:${ev.source}:${ev.reasonCode}`, ev])).values()
    );

    let consolidatedScore = bestEval.score;
    let decision = bestEval.decision;
    let confidence = bestEval.confidence;
    let reasonCode = bestEval.reasonCode;

    // 5. Distinct Multi-Ad Confirmation Boost (only if distinct ads corroborate the category)
    const distinctSupportingAds = distinctAds.filter(ad => {
      const ev = LeadRelevanceEngine.evaluateCandidate(ad, intent);
      return ev.decision === 'RELEVANT' || ev.evidence.some(e => e.type === 'CATEGORY_MATCH');
    });

    if (allNegativeSignals.length === 0 && distinctSupportingAds.length > 1) {
      // Boost proportional to distinct products/ads without unbounded inflation
      const multiCardBoost = Math.min(0.12, (distinctSupportingAds.length - 1) * 0.04);
      consolidatedScore = Math.min(1.0, consolidatedScore + multiCardBoost);

      if (decision === 'UNCERTAIN' && consolidatedScore >= 0.40 && (bestEval.evidenceBreakdown.advertiserNameScore > 0 || bestEval.evidenceBreakdown.adCopyScore >= 0.25)) {
        decision = 'RELEVANT';
        reasonCode = 'ACCEPT_MULTI_SIGNAL_MATCH';
      }

      if (consolidatedScore >= 0.60) {
        confidence = 'HIGH';
      }

      allEvidence.push({
        type: 'ENTITY_IDENTITY',
        strength: 'STRONG',
        source: 'entity_aggregation',
        reason: `Entity confirmed across ${distinctSupportingAds.length} distinct category ads`,
        matchedSignal: `${distinctSupportingAds.length} distinct ads`,
        reasonCode: 'SIGNAL_MULTI_AD_CORROBORATION'
      });
    }

    return {
      ...bestEval,
      decision,
      confidence,
      score: Math.round(consolidatedScore * 100) / 100,
      matchedKeywords: combinedKeywords.length > 0 ? combinedKeywords : bestEval.matchedKeywords,
      matchedTerms: combinedTerms,
      evidence: allEvidence,
      conflicts: allConflicts,
      reasons: [
        `Entity evaluated across ${candidates.length} ad card(s) (${distinctAds.length} distinct): status ${decision} (${(consolidatedScore * 100).toFixed(0)}%)`,
        ...bestEval.reasons
      ],
      reasonCode,
      strategyVersion: RELEVANCE_STRATEGY_VERSION,
      engineVersion: RELEVANCE_ENGINE_VERSION
    };
  }
}
