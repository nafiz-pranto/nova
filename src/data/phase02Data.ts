import { PageState, SelectorDefinition, TestFixture, WorkerEventType } from '../types';

export interface TraceabilityItem {
  id: string;
  phase01Ref: string;
  phase02Decision: string;
  rationale: string;
  safetyInvariant: string;
}

export const PHASE_01_TRACEABILITY: TraceabilityItem[] = [
  {
    id: "TR-01",
    phase01Ref: "ADR-001 (Strict Decoupling of Meta Browser Automation)",
    phase02Decision: "Meta-specific locators and URL logic are strictly sealed inside packages/meta-adapter. Generic Browser Worker depends only on INavigationAdapter and IExtractionAdapter.",
    rationale: "Prevents Playwright and DOM locator changes from cascading into orchestrator or domain entities.",
    safetyInvariant: "Zero CSS selectors or Playwright imports permitted in orchestrator, contracts, domain, or dashboard."
  },
  {
    id: "TR-02",
    phase01Ref: "ADR-002 (Zero-Bypass, Zero-Evasion Security Policy)",
    phase02Decision: "When challenge, login wall, or 403/429 block is detected, worker immediately halts execution, commits current checkpoint, and raises CHALLENGED/BLOCKED event.",
    rationale: "Compliance with strict legal and operational boundaries; avoids automated bot evasion loops.",
    safetyInvariant: "No proxy cycling, no stealth plugins, no CAPTCHA solving, and no automated challenge retries."
  },
  {
    id: "TR-03",
    phase01Ref: "ADR-003 (Entity-Centric Domain Modeling)",
    phase02Decision: "Browser worker extracts raw ad library IDs, page IDs, and clean text, preserving raw DOM index and observation timestamps for downstream deduplication.",
    rationale: "Ensures Phase 03 and orchestrator can separate advertiser business identity from ad creative variations.",
    safetyInvariant: "Worker does not merge records or discard duplicate sightings; it yields raw observations."
  },
  {
    id: "TR-04",
    phase01Ref: "Section 6 (Job FSM Engine) & Section 14 (Error Taxonomy)",
    phase02Decision: "Worker reports state transitions and errors using standardized 7 error classes and 14 FSM states.",
    rationale: "Maintains deterministic alignment between worker execution loop and database job state.",
    safetyInvariant: "Terminal FSM states cannot transition back to active collection without operator intervention."
  },
  {
    id: "TR-05",
    phase01Ref: "Section 8 (Meta Ad Library Adapter Boundary) & Section 16 (UI Change)",
    phase02Decision: "Empty search results with missing verified end-of-results sentinel triggers UI_CHANGE_DETECTED instead of returning empty array.",
    rationale: "Distinguishes 'no ads found' from 'markup changed / selectors broken'.",
    safetyInvariant: "Worker must never report false zero results when page structure fails validation."
  },
  {
    id: "TR-06",
    phase01Ref: "Section 9 (Internal Contracts v1.0.0)",
    phase02Decision: "Worker communicates with orchestrator using Zod-validated contracts (BatchExtractedRecordsContract, CheckpointUpdatedContract, etc.).",
    rationale: "Ensures type safety across the IPC boundary with strict runtime validation.",
    safetyInvariant: "Malformed inbound or outbound payloads fail fast at the process perimeter."
  }
];

export const PAGE_STATE_DEFINITIONS: {
  state: PageState;
  category: 'INITIALIZATION' | 'ACTIVE' | 'TERMINATION' | 'ATTENTION';
  description: string;
  allowedTransitions: PageState[];
  requiredEvidence: string[];
}[] = [
  {
    state: 'UNKNOWN',
    category: 'INITIALIZATION',
    description: 'Initial state before page is loaded or when DOM cannot be inspected.',
    allowedTransitions: ['NAVIGATING', 'ERROR', 'CLOSED'],
    requiredEvidence: ['Context initialized, no URL loaded']
  },
  {
    state: 'NAVIGATING',
    category: 'INITIALIZATION',
    description: 'Page load request initiated; waiting for HTTP response and DOM initialization.',
    allowedTransitions: ['LOADING', 'BLOCKED', 'ERROR', 'CLOSED'],
    requiredEvidence: ['page.goto() invoked', 'HTTP navigation request in flight']
  },
  {
    state: 'LOADING',
    category: 'INITIALIZATION',
    description: 'DOM loaded, top-level scripts executing, shell structure rendering.',
    allowedTransitions: ['READY_FOR_SEARCH', 'CHALLENGE_DETECTED', 'LOGIN_REQUIRED', 'BLOCKED', 'UI_CHANGED', 'ERROR'],
    requiredEvidence: ['Shell container present', 'Loading skeletons/spinners active']
  },
  {
    state: 'READY_FOR_SEARCH',
    category: 'INITIALIZATION',
    description: 'Search inputs and filters are interactive and ready for query submission.',
    allowedTransitions: ['SEARCHING', 'CHALLENGE_DETECTED', 'BLOCKED', 'UI_CHANGED', 'CLOSED'],
    requiredEvidence: ['Search input visible & enabled', 'Country/category dropdowns interactive']
  },
  {
    state: 'SEARCHING',
    category: 'ACTIVE',
    description: 'Search parameters submitted; waiting for initial result container update.',
    allowedTransitions: ['RESULTS_LOADING', 'CHALLENGE_DETECTED', 'BLOCKED', 'UI_CHANGED', 'ERROR'],
    requiredEvidence: ['Search form submitted / Enter pressed', 'URL query parameters updated']
  },
  {
    state: 'RESULTS_LOADING',
    category: 'ACTIVE',
    description: 'Result card placeholders visible or loading spinner active in result grid.',
    allowedTransitions: ['RESULTS_READY', 'END_OF_RESULTS', 'CHALLENGE_DETECTED', 'BLOCKED', 'UI_CHANGED'],
    requiredEvidence: ['Results container attached', 'Spinner or skeleton cards visible']
  },
  {
    state: 'RESULTS_READY',
    category: 'ACTIVE',
    description: 'Ad cards rendered in DOM; awaiting stabilization check before extraction.',
    allowedTransitions: ['RESULTS_STABILIZING', 'END_OF_RESULTS', 'CHALLENGE_DETECTED', 'BLOCKED', 'UI_CHANGED'],
    requiredEvidence: ['At least 1 valid ad card container attached', 'Loading indicators absent']
  },
  {
    state: 'RESULTS_STABILIZING',
    category: 'ACTIVE',
    description: 'Checking DOM mutation stillness and card count stability over 500ms window.',
    allowedTransitions: ['RESULTS_READY', 'UI_CHANGED', 'ERROR'],
    requiredEvidence: ['Card count identical across two 250ms samples', 'No active DOM mutations']
  },
  {
    state: 'END_OF_RESULTS',
    category: 'TERMINATION',
    description: 'Search results exhausted; confirmed by verified end-of-results sentinel or empty message.',
    allowedTransitions: ['CLOSED'],
    requiredEvidence: ['Verified "No results found" or end-sentinel element present in DOM']
  },
  {
    state: 'LOGIN_REQUIRED',
    category: 'ATTENTION',
    description: 'Login barrier or authentication wall presented to public browser session.',
    allowedTransitions: ['CLOSED'],
    requiredEvidence: ['Login form inputs present', 'Redirected to /login.php']
  },
  {
    state: 'CHALLENGE_DETECTED',
    category: 'ATTENTION',
    description: 'Interactive anti-bot challenge (CAPTCHA / identity verification) presented.',
    allowedTransitions: ['CLOSED'],
    requiredEvidence: ['CAPTCHA frame detected', 'Security check header matched']
  },
  {
    state: 'BLOCKED',
    category: 'ATTENTION',
    description: 'Access denied page, HTTP 403/429 status, or explicit platform rate limit block.',
    allowedTransitions: ['CLOSED'],
    requiredEvidence: ['HTTP 403/429 response', 'Block notice text in DOM']
  },
  {
    state: 'UI_CHANGED',
    category: 'ATTENTION',
    description: 'Critical DOM structural locators failed to resolve; results missing without sentinel.',
    allowedTransitions: ['CLOSED'],
    requiredEvidence: ['0 ads found AND end-sentinel absent', 'Structural card locators mismatch']
  },
  {
    state: 'ERROR',
    category: 'ATTENTION',
    description: 'Terminal browser engine error, context crash, or navigation failure.',
    allowedTransitions: ['CLOSED'],
    requiredEvidence: ['Browser process crash', 'Unrecoverable network timeout']
  },
  {
    state: 'CLOSED',
    category: 'TERMINATION',
    description: 'Browser context and page safely disposed; resources reclaimed.',
    allowedTransitions: [],
    requiredEvidence: ['Page and context closed cleanly']
  }
];

export const SELECTOR_REGISTRY: SelectorDefinition[] = [
  {
    id: "SEL-01",
    name: "SEARCH_INPUT",
    purpose: "Primary search input field in public Ad Library UI",
    strategy: "SEMANTIC_ROLE",
    primaryLocator: "page.getByRole('textbox', { name: /search/i })",
    fallbacks: [
      "page.getByPlaceholder(/search by keyword or advertiser/i)",
      "page.locator('input[type=\"search\"]')",
      "page.locator('input[aria-label*=\"search\" i]')"
    ],
    expectedState: "READY_FOR_SEARCH",
    confidence: 0.95,
    introducedIn: "v1.0.0",
    lastValidated: "2026-09-16",
    verificationStatus: "VERIFIED"
  },
  {
    id: "SEL-02",
    name: "COUNTRY_FILTER_TRIGGER",
    purpose: "Dropdown button to select country/region",
    strategy: "SEMANTIC_ROLE",
    primaryLocator: "page.getByRole('button', { name: /country|region/i })",
    fallbacks: [
      "page.locator('[data-testid=\"ad-library-country-filter\"]')",
      "page.locator('button[aria-haspopup=\"listbox\"]:has-text(\"All\")')"
    ],
    expectedState: "READY_FOR_SEARCH",
    confidence: 0.90,
    introducedIn: "v1.0.0",
    lastValidated: "2026-09-16",
    verificationStatus: "VERIFIED"
  },
  {
    id: "SEL-03",
    name: "AD_CATEGORY_TRIGGER",
    purpose: "Dropdown button to select ad category (All Ads vs Issues/Elections)",
    strategy: "SEMANTIC_ROLE",
    primaryLocator: "page.getByRole('button', { name: /ad category/i })",
    fallbacks: [
      "page.locator('[data-testid=\"ad-category-selector\"]')",
      "page.locator('button:has-text(\"All ads\")')"
    ],
    expectedState: "READY_FOR_SEARCH",
    confidence: 0.90,
    introducedIn: "v1.0.0",
    lastValidated: "2026-09-16",
    verificationStatus: "VERIFIED"
  },
  {
    id: "SEL-04",
    name: "RESULTS_CONTAINER",
    purpose: "Grid or container wrapping public ad cards",
    strategy: "STRUCTURAL_ARIA",
    primaryLocator: "page.locator('[role=\"feed\"], [role=\"region\"][aria-label*=\"results\" i]')",
    fallbacks: [
      "page.locator('[data-testid=\"ad-library-search-results\"]')",
      "page.locator('div:has(> div:has-text(\"Library ID:\"))').first()"
    ],
    expectedState: "RESULTS_READY",
    confidence: 0.88,
    introducedIn: "v1.0.0",
    lastValidated: "2026-09-16",
    verificationStatus: "VERIFIED"
  },
  {
    id: "SEL-05",
    name: "AD_CARD",
    purpose: "Individual advertisement card container",
    strategy: "STRUCTURAL_ARIA",
    primaryLocator: "page.locator('div:has-text(\"Library ID:\"):not(:has(div:has-text(\"Library ID:\")))')",
    fallbacks: [
      "page.locator('[data-testid=\"ad-card\"]')",
      "page.locator('article, div[role=\"article\"]')"
    ],
    expectedState: "RESULTS_READY",
    confidence: 0.92,
    introducedIn: "v1.0.0",
    lastValidated: "2026-09-16",
    verificationStatus: "VERIFIED"
  },
  {
    id: "SEL-06",
    name: "AD_LIBRARY_ID_TEXT",
    purpose: "Public Ad Library ID label and value",
    strategy: "SEMANTIC_TEXT",
    primaryLocator: "card.getByText(/Library ID:\\s*\\d+/i)",
    fallbacks: [
      "card.locator('span:has-text(\"ID:\")')",
      "card.locator(':text-matches(\"ID:\\\\s*\\\\d+\")')"
    ],
    expectedState: "RESULTS_READY",
    confidence: 0.96,
    introducedIn: "v1.0.0",
    lastValidated: "2026-09-16",
    verificationStatus: "VERIFIED"
  },
  {
    id: "SEL-07",
    name: "ADVERTISER_PAGE_HEADER",
    purpose: "Advertiser name link and profile link in card header",
    strategy: "SEMANTIC_ROLE",
    primaryLocator: "card.getByRole('link').filter({ hasText: /.+/ }).first()",
    fallbacks: [
      "card.locator('span[dir=\"auto\"]').first()",
      "card.locator('header a').first()"
    ],
    expectedState: "RESULTS_READY",
    confidence: 0.85,
    introducedIn: "v1.0.0",
    lastValidated: "2026-09-16",
    verificationStatus: "VERIFIED"
  },
  {
    id: "SEL-08",
    name: "END_OF_RESULTS_SENTINEL",
    purpose: "Explicit sentinel indicating no more results or zero results found",
    strategy: "SEMANTIC_TEXT",
    primaryLocator: "page.getByText(/no results found|you\\'ve reached the end/i)",
    fallbacks: [
      "page.locator('[data-testid=\"no-results-message\"]')",
      "page.locator('div:has-text(\"Try checking your spelling or using different keywords\")')"
    ],
    expectedState: "END_OF_RESULTS",
    confidence: 0.94,
    introducedIn: "v1.0.0",
    lastValidated: "2026-09-16",
    verificationStatus: "VERIFIED"
  },
  {
    id: "SEL-09",
    name: "CHALLENGE_DETECTION_LOCATOR",
    purpose: "Detects security interstitial or CAPTCHA frame",
    strategy: "SEMANTIC_ROLE",
    primaryLocator: "page.locator('iframe[src*=\"captcha\"], iframe[src*=\"challenge\"], #captcha-box')",
    fallbacks: [
      "page.getByText(/security check|enter the characters you see/i)",
      "page.locator('form[action*=\"checkpoint\"]')"
    ],
    expectedState: "CHALLENGE_DETECTED",
    confidence: 0.98,
    introducedIn: "v1.0.0",
    lastValidated: "2026-09-16",
    verificationStatus: "VERIFIED"
  },
  {
    id: "SEL-10",
    name: "LOGIN_WALL_LOCATOR",
    purpose: "Detects redirect to Facebook login or authentication wall",
    strategy: "SCOPED_CSS",
    primaryLocator: "page.locator('input[name=\"email\"][type=\"text\"], #login_form, form[action*=\"login\"]')",
    fallbacks: [
      "page.getByRole('button', { name: /log in/i })",
      "page.getByText(/log into facebook/i)"
    ],
    expectedState: "LOGIN_REQUIRED",
    confidence: 0.97,
    introducedIn: "v1.0.0",
    lastValidated: "2026-09-16",
    verificationStatus: "VERIFIED"
  }
];

export const TEST_FIXTURES_LIST: TestFixture[] = [
  {
    id: "FIX-01",
    name: "Normal Results Multi-Card",
    file: "public-ad-library-results.html",
    category: "RESULTS",
    expectedState: "RESULTS_READY",
    expectedCardCount: 8,
    description: "Standard public search result page with 8 well-formed ad cards, complete headers, CTA buttons, and start dates."
  },
  {
    id: "FIX-02",
    name: "Empty Results With Verified Sentinel",
    file: "public-empty-results.html",
    category: "EMPTY",
    expectedState: "END_OF_RESULTS",
    expectedCardCount: 0,
    description: "Confirmed zero-results page displaying the verified 'No results found' message. Must classify as END_OF_RESULTS, not UI_CHANGED."
  },
  {
    id: "FIX-03",
    name: "Broken DOM / UI Change Trigger",
    file: "public-ui-changed.html",
    category: "UI_CHANGE",
    expectedState: "UI_CHANGED",
    expectedCardCount: 0,
    description: "Results grid rendered with completely altered class attributes and no ad cards, but missing end-of-results sentinel. Must trigger UI_CHANGED."
  },
  {
    id: "FIX-04",
    name: "Interactive Challenge / CAPTCHA",
    file: "public-challenge.html",
    category: "CHALLENGE",
    expectedState: "CHALLENGE_DETECTED",
    expectedCardCount: 0,
    description: "Security check interstitial. Worker must detect within 1,000 ms, halt immediately, freeze checkpoint, and invoke zero automated retries."
  },
  {
    id: "FIX-05",
    name: "Platform Block HTTP 429",
    file: "public-block.html",
    category: "BLOCK",
    expectedState: "BLOCKED",
    expectedCardCount: 0,
    description: "Rate limit block page. Worker must classify as BLOCKED and freeze without proxy evasion."
  },
  {
    id: "FIX-06",
    name: "Authentication / Login Wall",
    file: "public-login-wall.html",
    category: "LOGIN",
    expectedState: "LOGIN_REQUIRED",
    expectedCardCount: 0,
    description: "Login redirect barrier. Worker must abort execution cleanly and record LOGIN_REQUIRED."
  },
  {
    id: "FIX-07",
    name: "Incremental Pagination Boundary",
    file: "public-pagination.html",
    category: "PAGINATION",
    expectedState: "RESULTS_READY",
    expectedCardCount: 16,
    description: "Simulates infinite scroll trigger point. Verifies auto-stabilization and duplicate batch offset detection."
  },
  {
    id: "FIX-08",
    name: "Delayed Dynamic Results",
    file: "public-loading.html",
    category: "RESULTS",
    expectedState: "RESULTS_READY",
    expectedCardCount: 4,
    description: "Initial skeleton state resolving to ad cards after 1,200 ms. Verifies auto-waiting without blind sleep."
  },
  {
    id: "FIX-09",
    name: "Initial Search Page Form",
    file: "public-ad-library-search.html",
    category: "SEARCH",
    expectedState: "READY_FOR_SEARCH",
    expectedCardCount: 0,
    description: "Public landing state with interactive search input, country selector, and category dropdown."
  },
  {
    id: "FIX-10",
    name: "Partial Ads with Missing Optional Fields",
    file: "public-missing-fields.html",
    category: "RESULTS",
    expectedState: "RESULTS_READY",
    expectedCardCount: 3,
    description: "Valid ad cards missing CTA button or headline. Downstream validators must accept with warnings."
  }
];

export const PHASE_02_HANDOFF_JSON = {
  phase: 2,
  status: "browser_worker_specification_complete",
  workerVersion: "2.0.0-prod",
  adapterVersion: "1.0.0-meta-public",
  contracts: {
    jobRequest: {
      schemaVersion: "v1.0.0",
      type: "CreateJobContract",
      validation: "ZodStrict",
      fields: ["idempotency_key", "search_query", "country_code", "ad_type", "max_ads"]
    },
    workerEvent: {
      schemaVersion: "v1.0.0",
      totalEventTypes: 28,
      mandatoryFields: ["eventId", "type", "jobId", "runId", "workerId", "timestamp", "sequence"]
    },
    extractionRequest: {
      schemaVersion: "v1.0.0",
      type: "ExtractionRequest",
      inputs: ["pageHandle", "offsetIndex", "batchLimit"]
    },
    extractionResponse: {
      schemaVersion: "v1.0.0",
      type: "BatchExtractedRecordsContract",
      output: ["records", "hasMore", "domScrollHeight", "sentinelObserved"]
    },
    checkpoint: {
      schemaVersion: "v1.0.0",
      type: "WorkerCheckpoint",
      fields: ["runId", "jobId", "sequenceNumber", "scrollOffset", "itemsCollected", "idempotencyHash"]
    },
    runResult: {
      schemaVersion: "v1.0.0",
      terminalStates: ["COMPLETED", "PARTIAL", "FAILED", "CANCELLED", "BLOCKED", "CHALLENGED"]
    }
  },
  pageStates: [
    "UNKNOWN", "NAVIGATING", "LOADING", "READY_FOR_SEARCH", "SEARCHING",
    "RESULTS_LOADING", "RESULTS_READY", "RESULTS_STABILIZING", "END_OF_RESULTS",
    "LOGIN_REQUIRED", "CHALLENGE_DETECTED", "BLOCKED", "UI_CHANGED", "ERROR", "CLOSED"
  ],
  navigationStates: [
    "UNINITIALIZED", "BROWSER_SPAWNED", "CONTEXT_INITIALIZED", "PAGE_NAVIGATED",
    "QUERY_SUBMITTED", "STREAMING_RESULTS", "SENTINEL_REACHED", "SHUTDOWN"
  ],
  errorCodes: [
    "ERR_NAV_TIMEOUT", "ERR_PAGE_LOAD_FAILED", "ERR_SELECTOR_DRIFT", "ERR_CHALLENGE_HALT",
    "ERR_BLOCK_HALT", "ERR_LOGIN_WALL", "ERR_UI_CHANGE", "ERR_STABILIZATION_TIMEOUT",
    "ERR_CHECKPOINT_FAILED", "ERR_WORKER_OOM"
  ],
  retryPolicy: {
    maxTransientRetries: 3,
    backoffBaseMs: 2000,
    backoffMultiplier: 2.0,
    jitterMaxMs: 500,
    retryableCategories: ["TRANSIENT_NETWORK", "TRANSIENT_BROWSER_CRASH"],
    prohibitedRetryCategories: ["CHALLENGE", "BLOCK", "LOGIN_WALL", "UI_CHANGE", "INVALID_INPUT"]
  },
  timeoutPolicy: {
    browserStartupMs: 30000,
    navigationMs: 45000,
    selectorActionMs: 10000,
    stateStabilizationMs: 12000,
    batchExtractionMs: 15000,
    checkpointCommitMs: 5000,
    heartbeatIntervalMs: 10000,
    totalRunDeadlineMs: 600000
  },
  challengePolicy: {
    actionOnChallenge: "HALT_IMMEDIATELY_AND_FREEZE_CHECKPOINT",
    automatedBypassPermitted: false,
    captchaSolvingPermitted: false,
    proxyRotationForEvasionPermitted: false,
    operatorResolutionRequired: true
  },
  checkpointPolicy: {
    frequency: "EVERY_BATCH_OR_15_SECONDS",
    monotonicKey: "sequenceNumber",
    idempotencyGuaranteed: true,
    safeResumeSupported: true
  },
  selectorRegistryContract: {
    selectorCount: 10,
    strategyHierarchy: ["SEMANTIC_ROLE", "SEMANTIC_TEXT", "STRUCTURAL_ARIA", "SCOPED_CSS"],
    diagnosticHookOnFailure: true
  },
  rawRecordContract: {
    fields: [
      "ad_library_id", "advertiser_name", "advertiser_page_id", "ad_text",
      "headline", "cta_text", "destination_url", "first_seen_text",
      "platforms_listed", "dom_index", "observed_at", "source_url"
    ],
    fabricationAllowed: false
  },
  provenanceRequirements: [
    "Must record raw source_url of the search page",
    "Must record exact extraction timestamp (ISO 8601)",
    "Must record worker_id, run_id, and adapter_version",
    "Must compute SHA-256 hash of raw extracted DOM fragment"
  ],
  testFixtures: [
    "public-ad-library-search.html",
    "public-ad-library-results.html",
    "public-empty-results.html",
    "public-pagination.html",
    "public-infinite-results.html",
    "public-loading.html",
    "public-login-wall.html",
    "public-challenge.html",
    "public-block.html",
    "public-ui-changed.html"
  ],
  knownUnknowns: [
    "Frequency of Meta CSS hash cycling (mitigated by Semantic Role & ARIA selectors)",
    "Rate of challenge presentation under headless vs headed execution",
    "Dynamic hydration latency variance during peak platform traffic"
  ],
  risks: [
    {
      risk: "DOM structural redesign of card feed",
      severity: "HIGH",
      mitigation: "UI_CHANGE classification halts run before emitting erroneous zero results"
    },
    {
      risk: "Sudden IP block by platform firewall",
      severity: "CRITICAL",
      mitigation: "Strict non-circumvention freeze preserves checkpoint and dispatches operator alert"
    }
  ],
  phase3RequiredInputs: [
    "RawAdRecord stream with exact source provenance",
    "Public field normalization rules (stripping UTM params, parsing relative dates)",
    "Data validation quality gates (Levels A-E)",
    "Database entity reconciliation (Advertiser vs Ad vs Observation)"
  ]
};
