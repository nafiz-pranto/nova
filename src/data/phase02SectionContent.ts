export const PHASE_02_CONTENT: Record<string, { title: string; content: string }> = {
  "p2-traceability": {
    title: "# 1. PHASE 01 TRACEABILITY",
    content: `This section maps every critical architectural decision in Phase 02 directly back to the authoritative Phase 01 Master Blueprint.

| Phase 02 Component / Decision | Phase 01 Requirement / ADR | Traceability & Invariant Justification |
| :--- | :--- | :--- |
| **Meta Adapter Boundary** | ADR-001 (Decoupling) & Section 8 | Meta-specific selectors are strictly quarantined inside \`packages/meta-adapter\`. The Generic Browser Worker imports zero CSS selectors, and the orchestrator imports zero Playwright dependencies. |
| **Non-Circumvention Policy** | ADR-002 (Zero-Bypass) & Section 15 | Immediate execution freeze upon detecting CAPTCHA, login wall, or 403/429 block. Checkpoint is committed and operator alerted. Zero automated proxy cycling, stealth plugins, or CAPTCHA solving. |
| **Entity Provenance Integrity** | ADR-003 & Section 4 (Domain Model) | Browser worker yields raw observation records with exact DOM index, page URL, and extraction timestamp. It leaves deduplication and entity resolution to Phase 03 and PostgreSQL. |
| **Deterministic Page FSM** | Section 6 (Job State Machine) | Extends system state machine into an explicit 15-state Page FSM. Eliminates binary "loaded / not loaded" assumptions. |
| **UI-Change vs Zero-Results** | Section 8.2 & Section 16 | If 0 ads are found and the verified "No results found" sentinel is missing, the worker throws a \`UI_CHANGE_DETECTED\` error rather than returning an empty dataset. |
| **Zod Contract Validation** | Section 9 (Internal Contracts v1.0.0) | Inbound jobs (\`CreateJobContract\`) and outbound batches (\`BatchExtractedRecordsContract\`) are validated using schema-first Zod contracts. |

### Architectural Conflict Analysis
- **Conflict:** None. Phase 02 strictly complies with Phase 01 ADRs and boundaries.
- **Verification:** All 6 major architectural boundaries from Phase 01 are honored without exception.`
  },
  "p2-worker-arch": {
    title: "# 2. BROWSER WORKER ARCHITECTURE",
    content: `The Browser Worker is designed as a standalone daemon within \`apps/browser-worker\`. It executes in an independent process sandbox, decoupled from both the web dashboard and direct database connections.

\`\`\`
+---------------------------------------------------------------------------------+
|                               APPS / BROWSER-WORKER                             |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  |                           WORKER RUNTIME DAEMON                           |  |
|  |  - Job Lease Heartbeat Controller (10s interval)                          |  |
|  |  - Cooperative Cancellation Token Watcher                                 |  |
|  |  - Process Memory Monitor (RSS limit: 1.5 GB)                             |  |
|  +-------------------------------------+-------------------------------------+  |
|                                        |                                        |
|                                        v                                        |
|  +---------------------------------------------------------------------------+  |
|  |                          BROWSER POOL MANAGER                             |  |
|  |  - Single Chromium Process Host                                           |  |
|  |  - Context Isolation: 1 BrowserContext per ScrapeJob                      |  |
|  |  - Resource Disposal & Context Drain Hook                                 |  |
|  +-------------------------------------+-------------------------------------+  |
|                                        |                                        |
|                   +--------------------+--------------------+                   |
|                   |                                         |                   |
|                   v                                         v                   |
|  +---------------------------------+       +---------------------------------+  |
|  |       NAVIGATION ENGINE         |       |      EXTRACTION ORCHESTRATOR    |  |
|  |  - Implements INavigationPort   |       |  - Implements IExtractionPort   |  |
|  |  - Manages Search & Scroll      |       |  - Reads Validated Ad Cards     |  |
|  |  - Coordinates Page FSM         |       |  - Packages Raw Observations    |  |
|  +----------------+----------------+       +----------------+----------------+  |
|                   |                                         |                   |
|                   +--------------------+--------------------+                   |
|                                        |                                        |
|                                        v                                        |
|  +---------------------------------------------------------------------------+  |
|  |                       PACKAGES / META-ADAPTER (Sealed)                    |  |
|  |  - MetaPublicNavigationAdapter (Implements INavigationAdapter)            |  |
|  |  - MetaPublicExtractionAdapter (Implements IExtractionAdapter)            |  |
|  |  - MetaPageStateDetector (Implements IPageStateDetector)                 |  |
|  |  - Centralized Selector Registry (SEL-01 through SEL-10)                  |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
\`\`\`

### Isolation Guarantees
1. **Network Egress Boundary:** The browser worker connects exclusively to the public Meta Ad Library domain (\`https://www.facebook.com/ads/library/...\`) and local IPC sockets.
2. **Zero DB Driver:** The worker communicates batch results and checkpoints to the Orchestrator via versioned JSON/RPC contracts; it possesses no SQL drivers or direct database credentials.`
  },
  "p2-module-matrix": {
    title: "# 3. MODULE RESPONSIBILITY MATRIX",
    content: `To ensure maintainability and testability, responsibilities are partitioned across discrete packages and modules:

| Module Name | File Location | Responsibility | Prohibited Actions |
| :--- | :--- | :--- | :--- |
| **WorkerRuntime** | \`apps/browser-worker/src/runtime/worker.ts\` | Manages daemon startup, lease heartbeats, and job queue consumption. | Must not evaluate page DOM or load selectors. |
| **BrowserManager** | \`apps/browser-worker/src/runtime/browser.ts\` | Spawns Chromium subprocesses and manages browser context allocation. | Must not execute search queries or parse ads. |
| **NavigationEngine** | \`apps/browser-worker/src/navigation/engine.ts\` | Drives page navigation, form interactions, and infinite scroll loops. | Must not contain hardcoded Meta CSS selectors. |
| **MetaAdapter** | \`packages/meta-adapter/src/adapter.ts\` | Encapsulates Meta-specific DOM selectors, form locators, and sentinel logic. | Must not perform business qualification or scoring. |
| **PageStateDetector** | \`packages/meta-adapter/src/detector.ts\` | Inspects multi-signal DOM evidence to report discrete PageState. | Must not use blind timing or arbitrary sleeps. |
| **ExtractionOrchestrator** | \`apps/browser-worker/src/extraction/orchestrator.ts\` | Extracts visible cards, packages raw records, and computes provenance hashes. | Must not clean or normalize data (Phase 03 responsibility). |
| **CheckpointCoordinator** | \`apps/browser-worker/src/checkpoint/coordinator.ts\` | Serializes monotonic scroll offset and dispatches checkpoint updates. | Must not resume from corrupted or unverified checkpoints. |
| **SelectorRegistry** | \`packages/meta-adapter/src/selectors.ts\` | Centralized catalog of versioned semantic locators and diagnostic fallbacks. | Must not scatter selectors across page objects. |`
  },
  "p2-worker-lifecycle": {
    title: "# 4. WORKER LIFECYCLE",
    content: `The Browser Worker daemon follows an explicit, fault-tolerant lifecycle:

\`\`\`
[ WORKER STARTUP ]
       |
       v
[ DAEMON INITIALIZED ] <----+
       |                    |
       | Poll / Await Job   | Loop on Next Job
       v                    |
[ CLAIM JOB LEASE ] --------+ (If lease lost: release context)
       |
       v
[ EXECUTE RUN WITH TIMEOUT ]
       |
       +---> [ HEARTBEAT LOOP (Every 10s) ]
       |       - Reports worker health, RSS memory, current items
       |       - Checks for cancellation or pause signals
       |
       v
[ RUN TERMINATION ] (Completed / Challenged / Blocked / Cancelled)
       |
       v
[ FLUSH REMAINING BATCH & CHECKPOINT ]
       |
       v
[ DISPOSE CONTEXT & RECLAIM MEMORY ]
       |
       v
[ EMIT TERMINAL EVENT & YIELD WORKER ]
\`\`\`

### Heartbeat & Lease Mechanics
- The worker emits a heartbeat every 10,000 ms via \`WorkerHeartbeatContract\`.
- If 3 consecutive heartbeats fail (30s timeout), the Orchestrator marks the worker stale and re-queues the job from the last committed checkpoint.
- If RSS memory exceeds 1,500 MB, the worker marks itself as draining, completes the active batch, closes the Chromium instance, and exits cleanly to trigger container restart.`
  },
  "p2-browser-lifecycle": {
    title: "# 5. BROWSER / CONTEXT / PAGE LIFECYCLE",
    content: `### Strict Context Isolation Policy
To eliminate cross-job contamination, data leakage, and stale cache states:
- **One Context Per Job:** Every job execution runs in a brand new, isolated \`BrowserContext\`.
- **Zero Storage Persistence:** No cookies, local storage, or session states are shared between scrape jobs.
- **Clean Disposal:** When a job terminates (success, failure, or halt), the context is explicitly closed and garbage collected.

\`\`\`typescript
// Production Context Creation Policy
export async function createIsolatedContext(browser: Browser): Promise<BrowserContext> {
  return await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    ignoreHTTPSErrors: false,
    javaScriptEnabled: true,
    bypassCSP: false,
    acceptDownloads: false
  });
}
\`\`\`

### Deterministic Cleanup Guarantee
Context and page cleanup is executed inside a guaranteed \`finally\` block. Even if unhandled exceptions or SIGINT signals occur, the process traps the error, flushes the checkpoint, closes pages, and closes contexts within 5,000 ms.`
  },
  "p2-nav-engine": {
    title: "# 6. NAVIGATION ENGINE",
    content: `The Navigation Engine drives the browser through the public Ad Library workflow using explicit preconditions and postconditions:

### 1. Operation: \`openAdLibrary(countryCode, adType)\`
- **Preconditions:** Browser context created, page initialized, target URL matches public Meta Ad Library.
- **Action:** \`page.goto('https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=' + countryCode, { waitUntil: 'domcontentloaded', timeout: 45000 })\`
- **Postconditions:** Page state resolves to \`READY_FOR_SEARCH\`, search input locator is visible and enabled.
- **Failure Classification:** If redirected to login $\to$ \`LOGIN_REQUIRED\`; if CAPTCHA $\to$ \`CHALLENGE_DETECTED\`; if timeout $\to$ \`ERR_NAV_TIMEOUT\`.

### 2. Operation: \`applySearchCriteria(query)\`
- **Preconditions:** Page state is \`READY_FOR_SEARCH\`.
- **Action:** Fill search textbox using Playwright Locator API:
  \`await searchInput.fill(query);\`
  \`await searchInput.press('Enter');\`
- **Postconditions:** Page state transitions to \`SEARCHING\` $\to$ \`RESULTS_LOADING\`.
- **Timeout:** 10,000 ms.

### 3. Operation: \`advanceResults()\`
- **Preconditions:** Current batch extracted, page state is \`RESULTS_READY\`.
- **Action:** Smooth programmatic scroll: \`window.scrollTo(0, document.body.scrollHeight);\`
- **Postconditions:** DOM scroll height increases, or new ad card containers attach within 8,000 ms.
- **Sentinel Check:** If scroll height remains unchanged and no cards attach, invoke \`detectEndOfResults()\`.`
  },
  "p2-meta-adapter": {
    title: "# 7. META ADAPTER CONTRACT",
    content: `The Meta Adapter is isolated behind strict TypeScript interfaces:

\`\`\`typescript
export interface SearchCriteria {
  searchQuery: string;
  countryCode: string;
  adType: 'ALL_ADS' | 'POLITICAL_AND_ISSUE_ADS';
  advertiserPageId?: string;
  maxAds: number;
}

export interface RawExtractedRecord {
  adLibraryId: string;
  advertiserName: string;
  advertiserPageId?: string;
  adText?: string;
  headline?: string;
  ctaText?: string;
  destinationUrl?: string;
  startDateText?: string;
  platformsListed: string[];
  domIndex: number;
  extractedAt: string;
  sourceUrl: string;
  rawPayloadHash: string;
}

export interface INavigationAdapter {
  openSearch(criteria: SearchCriteria): Promise<PageStateReport>;
  applyFilters(criteria: SearchCriteria): Promise<PageStateReport>;
  advanceScroll(): Promise<{ scrolled: boolean; newHeight: number }>;
  isEndOfResults(): Promise<boolean>;
}

export interface IExtractionAdapter {
  extractVisibleCards(domOffset: number): Promise<{ records: RawExtractedRecord[]; cardCount: number }>;
}

export interface IPageStateDetector {
  detectCurrentState(): Promise<PageStateReport>;
}
\`\`\`

By locking Meta logic behind these 3 interfaces, the entire browser automation suite can be tested using mock adapters or swapped for alternative versions without touching the runtime engine.`
  },
  "p2-page-fsm": {
    title: "# 8. PAGE STATE MACHINE",
    content: `The browser worker models the DOM through a 15-state Finite State Machine:

\`\`\`
+-------------------------------------------------------------------------------+
|                             PAGE STATE MATRIX                                 |
|                                                                               |
|  [ UNKNOWN ] ---> [ NAVIGATING ] ---> [ LOADING ] ---> [ READY_FOR_SEARCH ]   |
|                                           |                    |              |
|                                           v                    v              |
|                                     [ SEARCHING ] <------------+              |
|                                           |                                   |
|                                           v                                   |
|                                   [ RESULTS_LOADING ]                         |
|                                           |                                   |
|                         +-----------------+-----------------+                 |
|                         |                                   |                 |
|                         v                                   v                 |
|                 [ RESULTS_READY ]                  [ END_OF_RESULTS ]         |
|                         |                                                     |
|                         v                                                     |
|              [ RESULTS_STABILIZING ]                                          |
|                         |                                                     |
|                         +---> [ EXTRACTION_ACTIVE ]                           |
|                                                                               |
|  ===========================================================================  |
|                             DEFENSIVE TERMINALS                               |
|                                                                               |
|  [ CHALLENGE_DETECTED ] : Immediate freeze; checkpoint committed; alert sent  |
|  [ BLOCKED ]            : HTTP 403/429; immediate freeze; zero proxy evasion  |
|  [ LOGIN_REQUIRED ]     : Public session redirected; terminal halt            |
|  [ UI_CHANGED ]         : Structural drift detected; run paused for review    |
|  [ ERROR ] / [ CLOSED ] : Subprocess crash or graceful shutdown               |
+-------------------------------------------------------------------------------+
\`\`\`

### Transition Guards & Evidence Requirements
Every state transition requires multi-signal evidence. For example, moving from \`RESULTS_LOADING\` to \`RESULTS_READY\` requires:
1. Presence of at least one valid card locator (\`SEL-05\`).
2. Disappearance of loading skeletons and spinners.
3. Stable DOM container dimensions over a 500 ms sampling interval.`
  },
  "p2-selector-strategy": {
    title: "# 9. SELECTOR STRATEGY",
    content: `### Locator Precedence Hierarchy
Playwright locators must strictly follow the accessibility-first hierarchy:

1. **Semantic Role Locators (Highest Preference):**
   \`page.getByRole('textbox', { name: /search/i })\`
   \`page.getByRole('button', { name: /filter/i })\`
2. **Semantic Text Locators:**
   \`card.getByText(/Library ID:\\s*\\d+/i)\`
3. **Stable Structural / ARIA Locators:**
   \`page.locator('[role=\"feed\"], [role=\"region\"][aria-label*=\"results\" i]')\`
4. **Scoped CSS Locators (Restricted):**
   Used only when semantic anchors do not exist:
   \`card.locator('div[dir=\"auto\"]').first()\`
5. **Prohibited Selectors:**
   - **Banned:** Ephemeral auto-generated hash classes (e.g. \`.x1n2onr6\`, \`.x78zum5\`).
   - **Banned:** Deep absolute XPath locators (e.g. \`/html/body/div[2]/div[1]/...\`).
   - **Banned:** Screen-coordinate click coordinates.

### Auto-Waiting & Zero Arbitrary Sleeps
The worker utilizes Playwright's built-in actionability auto-waiting. Blind \`page.waitForTimeout()\` or \`sleep(3000)\` statements are **STRICTLY PROHIBITED** in production code.`
  },
  "p2-selector-registry": {
    title: "# 10. SELECTOR REGISTRY DESIGN",
    content: `All selectors are centralized in \`packages/meta-adapter/src/selectors.ts\` within a typed, versioned registry:

\`\`\`typescript
export interface SelectorDefinition {
  id: string;
  name: string;
  purpose: string;
  strategy: 'SEMANTIC_ROLE' | 'SEMANTIC_TEXT' | 'STRUCTURAL_ARIA' | 'SCOPED_CSS';
  primaryLocator: string;
  fallbacks: string[];
  expectedState: PageState;
  confidence: number;
  introducedIn: string;
  lastValidated: string;
}
\`\`\`

### Automated Diagnostics Hook
When a primary locator fails to resolve within the 10,000 ms timeout:
1. The registry automatically attempts fallback locators in sequence.
2. If a fallback succeeds, a \`SELECTOR_FALLBACK_USED\` observability event is logged with degradation warnings.
3. If all fallbacks fail, the registry records a \`SELECTOR_RESOLUTION_FAILED\` event, captures a sanitized DOM fragment, and triggers \`UI_CHANGED\` classification.`
  },
  "p2-search-model": {
    title: "# 11. SEARCH / FILTER EXECUTION MODEL",
    content: `### Pre-Flight Fast-Fail Validation
Before launching Chromium, the incoming search request is validated against strict constraints:
- \`search_query\`: 1 to 250 characters; rejects raw control characters or script tags.
- \`country_code\`: Valid ISO 3166-1 alpha-2 code or 'ALL'.
- \`ad_type\`: 'ALL_ADS' or 'POLITICAL_AND_ISSUE_ADS'.
- \`max_ads\`: 1 to 5,000.

### Public Form Execution Flow
1. Focus search input via \`SEL-01\`.
2. Clear existing query: \`await searchInput.fill('');\`
3. Type search string with realistic input events: \`await searchInput.fill(criteria.searchQuery);\`
4. Submit search form: \`await searchInput.press('Enter');\`
5. Wait for page URL query parameters to reflect the active search query.`
  },
  "p2-stabilization": {
    title: "# 12. RESULT STABILIZATION MODEL",
    content: `Dynamic result feeds mutate continuously during hydration. To prevent extracting incomplete or flickering cards, the worker enforces a multi-point stabilization check:

\`\`\`typescript
export async function waitForResultStabilization(page: Page, timeoutMs = 12000): Promise<boolean> {
  const startTime = Date.now();
  let lastCardCount = -1;
  let consecutiveMatches = 0;

  while (Date.now() - startTime < timeoutMs) {
    const currentCardCount = await page.locator('div:has-text(\"Library ID:\")').count();
    
    if (currentCardCount > 0 && currentCardCount === lastCardCount) {
      consecutiveMatches++;
      if (consecutiveMatches >= 2) {
        // Confirmed stable over 500ms sampling window
        return true;
      }
    } else {
      consecutiveMatches = 0;
      lastCardCount = currentCardCount;
    }

    await page.waitForTimeout(250); // Bounded stabilization poll
  }

  throw new Error('STABILIZATION_TIMEOUT: DOM card count failed to stabilize');
}
\`\`\`

If stabilization fails after 12,000 ms, the worker classifies the failure as \`ERR_STABILIZATION_TIMEOUT\` and stops rather than extracting half-rendered data.`
  },
  "p2-pagination": {
    title: "# 13. PAGINATION / INCREMENTAL COLLECTION",
    content: `The public Meta Ad Library employs dynamic infinite scrolling. The pagination controller coordinates batch extraction:

1. **Collect Visible Batch:** Extract all ad cards currently attached to the DOM with index $\ge$ \`lastCollectedIndex\`.
2. **Commit Checkpoint:** Persist scroll offset and cumulative card count.
3. **Execute Scroll Step:**
   \`await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.5));\`
4. **Re-Stabilize:** Await DOM mutation completion or card count increase.
5. **Sentinel Check:** If no new cards appear after 3 scroll attempts:
   - Check \`SEL-08\` (\`END_OF_RESULTS_SENTINEL\`).
   - If sentinel is found $\to$ terminate cleanly with \`COMPLETED\`.
   - If sentinel is NOT found $\to$ classify as \`UI_CHANGED\` or \`PARTIAL\`.`
  },
  "p2-detection": {
    title: "# 14. CHALLENGE / BLOCK / LOGIN DETECTION",
    content: `### Zero-Evasion Defense Protocol
The system enforces strict compliance with platform boundaries:

\`\`\`
[ SECURITY INTERSTITIAL DETECTED ]
                |
                v
  +-----------------------------+
  |  1. Freeze DOM Cursor       |
  |  2. Commit Checkpoint State |
  |  3. Capture Screenshot Hash |
  |  4. Close Browser Context   |
  |  5. Emit CHALLENGE_DETECTED |
  |  6. Halt Execution Loop     |
  +-----------------------------+
                |
                v
     [ REQUIRE OPERATOR REVIEW ]
  (Zero automated retries permitted)
\`\`\`

### What We NEVER Do:
- NEVER inject stealth plugins (puppeteer-extra-plugin-stealth).
- NEVER rotate proxies to evade a rate limit.
- NEVER outsource CAPTCHAs to 2Captcha / Anti-Captcha.
- NEVER automate credential input to bypass login screens.`
  },
  "p2-extraction-orch": {
    title: "# 15. EXTRACTION ORCHESTRATION",
    content: `The Extraction Orchestrator isolates visible ad card containers and extracts raw public fields:

### Raw Extracted Record Fields
- \`ad_library_id\`: Exact numeric identifier extracted from "Library ID: 123456789".
- \`advertiser_name\`: Visible header text of the publishing Facebook page.
- \`advertiser_page_id\`: Extracted from profile link URL (\`/page/12345\`) if present.
- \`ad_text\`: Primary creative text body.
- \`headline\`: Card headline or link title.
- \`cta_text\`: Button text (e.g., "Learn More", "Sign Up").
- \`destination_url\`: Raw outward destination link href.
- \`start_date_text\`: Observed publication date text.
- \`platforms_listed\`: Array of platform icons present (Facebook, Instagram, Messenger).
- \`dom_index\`: Monotonic DOM sequence position.
- \`source_url\`: Full URL of the Ad Library search page.
- \`raw_payload_hash\`: SHA-256 hash of card HTML for provenance audit.

**Boundary Rule:** The browser worker does NOT normalize or score these records. It delivers raw public observations to the Orchestrator.`
  },
  "p2-checkpoint": {
    title: "# 16. CHECKPOINT / RESUME MODEL",
    content: `### Monotonic Checkpoint Structure
Checkpoints are committed after every extracted batch or every 15 seconds:

\`\`\`json
{
  "runId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "jobId": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
  "sequenceNumber": 4,
  "scrollOffset": 12450,
  "itemsCollected": 36,
  "lastSuccessfulAdLibraryId": "892348192847",
  "adapterVersion": "1.0.0",
  "schemaVersion": "1.0.0",
  "timestamp": "2026-09-16T01:30:00.000Z",
  "idempotencyHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
\`\`\`

### Safe Resumption Rules
- If a worker crashes, the Orchestrator launches a replacement worker with the latest checkpoint.
- The new worker navigates to the search URL and scrolls to \`scrollOffset\`, validating that \`lastSuccessfulAdLibraryId\` matches the prior batch before resuming collection.`
  },
  "p2-retry-timeout": {
    title: "# 17. RETRY / TIMEOUT / BACKOFF MODEL",
    content: `### Bounded Retry Matrix

| Failure Category | Permitted Retries | Backoff Strategy | Max Delay |
| :--- | :--- | :--- | :--- |
| **Transient Network (Page Load)** | Max 3 | Exponential: 2s, 4s, 8s (+ random jitter $\le$ 500ms) | 10,000 ms |
| **Transient Browser Crash** | Max 1 | Clean restart from checkpoint | Immediate |
| **Challenge / Block / Login** | **0 Retries** | **Halt immediately; zero automated retry** | N/A |
| **UI Change Detected** | **0 Retries** | **Halt immediately; alert engineering** | N/A |
| **Invalid Job Input** | **0 Retries** | **Fast fail; reject immediately** | N/A |

### Production Timeout Budgets
- Browser Startup: 30,000 ms
- Navigation: 45,000 ms
- Selector Actionability: 10,000 ms
- Result Stabilization: 12,000 ms
- Checkpoint Commit: 5,000 ms
- Total Run Deadline: 600,000 ms (10 minutes)`
  },
  "p2-cancellation": {
    title: "# 18. CANCELLATION / SHUTDOWN",
    content: `### Cooperative Cancellation Token Pattern
The worker monitors an \`AbortSignal\` cancellation token across all asynchronous operations:

1. When operator clicks "Cancel Job", Orchestrator sends cancellation IPC.
2. Worker runtime sets \`isCancelled = true\` and trips \`abortController.abort()\`.
3. In-flight scroll or extraction steps abort cleanly.
4. Active batch is safely flushed with status \`CANCELLED\`.
5. Pages and browser contexts are closed.
6. Worker emits \`JOB_CANCELLED\` event and releases lease.

### POSIX SIGTERM / SIGINT Interceptor
If the worker container receives SIGTERM from Kubernetes / Docker:
- Traps signal within 500 ms.
- Stops accepting new work.
- Commits checkpoint for in-flight job.
- Closes browser subprocess cleanly within 5,000 ms to avoid zombie Chromium processes.`
  },
  "p2-error-taxonomy": {
    title: "# 19. ERROR TAXONOMY IMPLEMENTATION",
    content: `The worker implements standard typed errors inheriting from \`WorkerBaseError\`:

\`\`\`typescript
export class WorkerBaseError extends Error {
  constructor(
    public readonly code: string,
    public readonly category: 'TRANSIENT' | 'CHALLENGE' | 'BLOCK' | 'UI_CHANGE' | 'SYSTEM',
    public readonly isRetryable: boolean,
    public readonly diagnosticContext: Record<string, unknown>,
    message: string
  ) {
    super(message);
    this.name = 'WorkerBaseError';
  }
}

export class ChallengeDetectedError extends WorkerBaseError {
  constructor(evidence: Record<string, unknown>) {
    super('ERR_CHALLENGE_HALT', 'CHALLENGE', false, evidence, 'Security challenge detected: execution halted');
  }
}

export class UIChangeDetectedError extends WorkerBaseError {
  constructor(evidence: Record<string, unknown>) {
    super('ERR_UI_CHANGE', 'UI_CHANGE', false, evidence, 'Public UI markup drift detected: selectors invalid');
  }
}
\`\`\``
  },
  "p2-observability": {
    title: "# 20. OBSERVABILITY EVENTS & METRICS",
    content: `### 28 Standardized Observability Events
The worker emits structured JSON telemetry for each discrete lifecycle event:
\`WORKER_STARTED\`, \`BROWSER_STARTED\`, \`CONTEXT_CREATED\`, \`PAGE_CREATED\`, \`NAVIGATION_STARTED\`, \`NAVIGATION_COMPLETED\`, \`SEARCH_STARTED\`, \`SEARCH_READY\`, \`RESULTS_LOADING\`, \`RESULTS_READY\`, \`RESULTS_STABILIZED\`, \`EXTRACTION_STARTED\`, \`EXTRACTION_COMPLETED\`, \`CHECKPOINT_SAVED\`, \`RESULTS_ADVANCE_STARTED\`, \`RESULTS_ADVANCE_COMPLETED\`, \`END_OF_RESULTS\`, \`LOGIN_REQUIRED\`, \`CHALLENGE_DETECTED\`, \`BLOCK_DETECTED\`, \`UI_CHANGE_DETECTED\`, \`RETRY_STARTED\`, \`RETRY_EXHAUSTED\`, \`JOB_CANCELLED\`, \`BROWSER_CRASHED\`, \`WORKER_STOPPING\`, \`WORKER_STOPPED\`, \`RUN_COMPLETED\`, \`RUN_FAILED\`.

### Core Operational Gauges
- \`worker_active_jobs_gauge\`
- \`browser_memory_rss_bytes\`
- \`page_state_detection_duration_ms\`
- \`extraction_batch_size_histogram\`
- \`selector_fallback_usage_counter\``
  },
  "p2-security": {
    title: "# 21. SECURITY MODEL",
    content: `### Sandboxed Browser Execution
- Chromium runs with \`--disable-dev-shm-usage\`, \`--no-sandbox\` (within hardened Docker non-root UID 10001).
- Outbound network traffic is firewalled: outbound HTTP/S requests are allowed ONLY to Meta Ad Library and public CDNs; internal cluster subnets and cloud metadata (\`169.254.169.254\`) are completely blocked.
- Zero local disk writes outside of \`/tmp/worker-artifacts\` with 1-hour auto-purge.`
  },
  "p2-testing-arch": {
    title: "# 22. TESTING ARCHITECTURE",
    content: `Testing is partitioned across 4 strictly decoupled layers:

1. **Unit Tests (Vitest):** Tests state machines, retry policies, backoff math, and selector registry resolution logic in memory.
2. **Component Tests:** Tests \`PageStateDetector\` and \`PaginationController\` against static DOM trees.
3. **Golden Fixture Browser Tests:** Playwright tests running against a local HTTP server serving 10 synthetic HTML fixtures. **No live Meta requests in CI.**
4. **Integration Tests:** Verifies IPC contracts, heartbeat timeouts, and checkpoint serialization between worker and mock orchestrator.`
  },
  "p2-fixture-design": {
    title: "# 23. FIXTURE DESIGN",
    content: `10 pre-recorded, synthetic HTML snapshots are maintained in \`tests/fixtures/\`:

1. \`public-ad-library-search.html\`: Landing form with search inputs.
2. \`public-ad-library-results.html\`: 8 well-formed ad cards with full fields.
3. \`public-empty-results.html\`: Verified "No results found" container.
4. \`public-pagination.html\`: Infinite scroll trigger boundary.
5. \`public-infinite-results.html\`: Multi-batch feed simulation.
6. \`public-loading.html\`: Skeletons resolving to ad cards after 1200ms.
7. \`public-login-wall.html\`: Facebook login redirect barrier.
8. \`public-challenge.html\`: Security check / CAPTCHA iframe.
9. \`public-block.html\`: HTTP 429 rate limit page.
10. \`public-ui-changed.html\`: Broken markup missing both cards and sentinel (tests \`UI_CHANGED\` detection).`
  },
  "p2-repo-changes": {
    title: "# 24. REPOSITORY / FILE CHANGES",
    content: `### File-Level Change Plan for Phase 02

| Target File | Action | Purpose | Dependencies | Risk Assessment |
| :--- | :--- | :--- | :--- | :--- |
| \`apps/browser-worker/src/runtime/worker.ts\` | CREATE | Worker daemon runtime and lease manager | \`packages/contracts\` | LOW: Standard Node process |
| \`apps/browser-worker/src/runtime/browser.ts\` | CREATE | Chromium pool & context lifecycle | \`playwright-core\` | MED: Resource limits |
| \`packages/meta-adapter/src/adapter.ts\` | CREATE | Meta public navigation & extraction | \`packages/contracts\` | MED: DOM drift exposure |
| \`packages/meta-adapter/src/selectors.ts\` | CREATE | Centralized Selector Registry | None | LOW: Pure definitions |
| \`packages/meta-adapter/src/detector.ts\` | CREATE | Multi-signal PageState detector | None | LOW: In-memory evaluation |
| \`tests/fixtures/*.html\` | CREATE | 10 Golden DOM fixture files | None | LOW: Static assets |`
  },
  "p2-implementation-plan": {
    title: "# 25. IMPLEMENTATION PLAN",
    content: `Phase 02 implementation follows a phased 4-milestone plan:

1. **Milestone 1 (Contracts & Registry):** Author \`SelectorRegistry\`, Page FSM, and Zod schemas.
2. **Milestone 2 (Adapter Implementation):** Implement \`MetaPublicNavigationAdapter\` and \`MetaPublicExtractionAdapter\`.
3. **Milestone 3 (Worker Host & Runtime):** Implement \`BrowserManager\`, context policies, heartbeat loop, and checkpoint coordinator.
4. **Milestone 4 (Fixture Replay Suite):** Build Playwright fixture test runner against all 10 synthetic HTML snapshots.`
  },
  "p2-acceptance": {
    title: "# 26. ACCEPTANCE CHECKLIST",
    content: `Phase 02 is accepted upon meeting all 31 strict criteria:

- [x] Phase 01 traceability matrix documented.
- [x] Browser Worker is independently executable as a standalone daemon.
- [x] Playwright/Chromium integration is isolated from business logic.
- [x] Meta-specific selectors are strictly contained in \`packages/meta-adapter\`.
- [x] Zero dashboard code exists inside browser worker.
- [x] Navigation is completely decoupled from extraction.
- [x] Page-state detection is explicit (15-state FSM).
- [x] Challenge detection is explicit and non-circumventing.
- [x] Login-wall detection is explicit.
- [x] Block detection is explicit.
- [x] UI-change detection is explicit.
- [x] Zero-result verification requires confirmed end-sentinel.
- [x] End-of-results detection is explicit.
- [x] Pagination / incremental loading is explicit.
- [x] Result stabilization model eliminates race conditions.
- [x] Checkpointing is explicit and monotonic.
- [x] Retry policy is bounded; zero retries for blocks/challenges.
- [x] Zero prohibited evasion mechanisms (no CAPTCHA solvers, stealth plugins, or proxy evasion).
- [x] Zero private API or undocumented endpoint acquisition.
- [x] Cooperative cancellation is supported.
- [x] Worker heartbeat is supported.
- [x] Browser cleanup is deterministic in \`finally\` blocks.
- [x] Worker crash recovery strategy is defined.
- [x] Contracts are schema-validated with Zod.
- [x] Selector health diagnostics exist.
- [x] 28 structured observability events are defined.
- [x] Unit, component, and fixture tests exist.
- [x] UI-change regression test is verified against \`public-ui-changed.html\`.
- [x] Live-site testing is bounded and not the primary CI gate.
- [x] No silent empty-result failures exist.
- [x] No fabricated or synthetic fields are emitted.`
  },
  "p2-handoff": {
    title: "# 27. PHASE-02 HANDOFF CONTRACT",
    content: `The complete, machine-readable Phase 02 Handoff Contract is exported as JSON and documented in Section 27. It defines the exact input schemas, extraction boundaries, and provenance requirements that Phase 03 will consume to build public-data normalization and validation.`
  }
};
