export const SECTION_TEXTS: Record<string, { title: string; content: string }> = {
  'adr': {
    title: '# 1. ARCHITECTURE DECISION RECORD (ADR)',
    content: `## ADR-001: Strict Separation of Browser Worker from Application & Domain
- **Status:** APPROVED & MANDATORY
- **Context:** Meta Ad Library DOM selectors and page lifecycles fluctuate frequently. Coupling browser automation logic to dashboard components or domain entities leads to cascading system-wide breakage whenever Meta updates markup.
- **Decision:** The browser worker is decoupled as an independent service exposing a minimal RPC contract (\`executeJob(jobRequest) -> AsyncIterable<WorkerEvent>\`). Meta-specific selector logic is strictly quarantined inside \`packages/meta-adapter\`. The domain model and dashboard MUST NOT import Playwright or reference Meta DOM selectors.
- **Consequences:** The Meta adapter can be upgraded, hot-patched, or replaced without altering persistence schemas, qualification scoring, or operator UI.

## ADR-002: Zero-Circumvention, Zero-Evasion Policy
- **Status:** APPROVED & MANDATORY
- **Context:** Scraping public advertising platforms often faces rate limiting, automated challenges (CAPTCHAs), and IP blocks. Bypassing these controls through proxy rotation, stealth fingerprinting, or automated CAPTCHA solvers violates platform terms, introduces severe legal/contractual liability, and degrades deterministic operations.
- **Decision:** The system strictly prohibits automated bypass, stealth spoofing, proxy cycling for evasion, and CAPTCHA solving. If a challenge or block page is encountered, the worker immediately freezes its cursor checkpoint, logs a structured \`ChallengeDetected\` event with cryptographic page evidence, transitions the job state to \`CHALLENGED\` or \`BLOCKED\`, alerts human operators, and halts automated execution.
- **Consequences:** Absolute compliance with defensive boundaries, deterministic auditability, and preservation of job checkpoints for operator review.

## ADR-003: Entity-Centric Domain Model (Decoupling Ads from Leads)
- **Status:** APPROVED & MANDATORY
- **Context:** A common antipattern in ad scrapers is modeling "one ad = one lead". However, an active business advertiser may run 50 distinct ad variations across Instagram, Facebook, and Messenger over several months.
- **Decision:** Lead identity is strictly anchored at the Business/Advertiser entity level. Individual advertisements are transient creative assets belonging to an Advertiser. Scraped instances are recorded as immutable \`AdObservation\` records to preserve temporal provenance without duplicate lead creation.
- **Consequences:** Clean deduplication, historical longevity tracking, and high-precision lead scoring based on aggregate marketing signals.`
  },
  'system-architecture': {
    title: '# 2. SYSTEM ARCHITECTURE',
    content: `## 2.1 High-Level Architecture Overview
The platform operates as a distributed, modular, multi-tier system governed by clean architecture principles:
\`\`\`
   +-------------------------------------------------------------+
   |                  Operator Tier (Client)                     |
   |   - Web Dashboard (React/Vite)                              |
   |   - Chrome Manifest V3 Extension (Job Dispatcher / Monitor) |
   +------------------------------+------------------------------+
                                  |
                                  | HTTPS / JSON Schema Contracts
                                  v
   +-------------------------------------------------------------+
   |               Application & Orchestration Tier              |
   |   - Job Orchestrator & FSM Engine (Node.js/TypeScript)      |
   |   - Ingestion Pipeline (Normalization & Validation A-E)     |
   |   - Verification Service (Isolated SSRF-Hardened Proxy)     |
   |   - Lead Scoring Engine (Pluggable Multi-Signal Evaluator)  |
   +------------------------------+------------------------------+
                                  |
                                  | Internal gRPC / IPC Contract
                                  v
   +-------------------------------------------------------------+
   |                  Browser Automation Tier                    |
   |   - Browser Worker Daemon (Headless Chromium / Playwright)   |
   |   - Meta Ad Library Adapter (DOM Selectors, Auto-Waiting)   |
   |   - Checkpointing & Non-Circumvention Challenge Watcher     |
   +------------------------------+------------------------------+
                                  |
                                  | Transactional Ingestion
                                  v
   +-------------------------------------------------------------+
   |                     Persistence Tier                        |
   |   - PostgreSQL 16 (Relational Entities & Unique Constraints)|
   |   - S3-Compatible Object Store (Raw DOM Golden Snapshots)   |
   |   - OpenTelemetry Collector (Structured Logs & Metrics)     |
   +-------------------------------------------------------------+
\`\`\`

## 2.2 Boundary Guarantees
1. **Dashboard-to-Worker Decoupling:** The dashboard communicates solely with the Orchestrator via versioned REST/SSE endpoints. It has zero knowledge of Playwright or browser processes.
2. **Adapter Isolation:** The \`Meta Ad Library Adapter\` is isolated behind the \`IMetaAdapter\` interface. If Meta changes its page layout, ONLY this package requires maintenance.
3. **SSRF Quarantine:** The \`Verification Service\` runs on a dedicated subnet with egress firewall rules preventing access to internal network spaces (RFC 1918, RFC 3927, link-local, and cloud metadata 169.254.169.254).`
  },
  'responsibility-matrix': {
    title: '# 3. COMPONENT RESPONSIBILITY MATRIX',
    content: `| Component | Primary Responsibility | Explicitly Forbidden Responsibilities | Dependencies Allowed |
| :--- | :--- | :--- | :--- |
| **A. Client / Dashboard** | Renders job states, lead lists, review queues, exports | No scraping selectors, no direct DB queries, no Playwright | \`packages/contracts\`, REST API |
| **B. Orchestrator** | Schedules jobs, enforces FSM transitions, coordinates pipeline | No browser automation, no raw DOM manipulation | \`packages/contracts\`, \`packages/domain\`, DB |
| **C. Browser Worker** | Runs headless Chromium, executes navigation, yields batches | No DB writes, no lead scoring, no dashboard notifications | \`packages/contracts\`, \`packages/meta-adapter\` |
| **D. Meta Adapter** | Encapsulates Meta DOM locators, auto-waiting, scroll loops | No DB calls, no business scoring, no bypass logic | \`playwright-core\`, \`packages/contracts\` |
| **E. Normalization** | Pure deterministic cleanup (whitespace, domain extraction, dates) | No I/O, no network calls, no guessing missing fields | Pure TypeScript functions |
| **F. Validation Layer** | Structural (A), Field (B), Semantic (C), Source (D), Entity (E) | No data mutation; only validation passes or errors | \`packages/contracts\` |
| **G. Identity & Deduplication** | Level 1 (ID), Level 2 (Page), Level 3 (Signature), Level 4 (Review) | Never silently merge uncertain fuzzy matches | \`packages/domain\` |
| **H. Verification Service** | Resolves destination landing pages with strict SSRF defense | No private WHOIS lookups, no unauthorized credential probing | HTTP client, DNS resolver with CIDR filter |
| **I. Lead Qualification** | Scores businesses using transparent, versioned multi-signal weights | No arbitrary magic formulas, no live web scraping | \`packages/domain\` |
| **J. Persistence Layer** | Enforces relational constraints, unique indexes, ACID transactions | No browser automation logic | \`pg\`, \`drizzle-orm\` / \`kysely\` |
| **K. Export Layer** | Generates CSV, JSON, and Parquet with formula-injection defenses | No raw sensitive internal metadata leakage | \`packages/domain\` |
| **L. Observability Layer** | Emits JSON logs, OpenTelemetry metrics, Sentry error events | No logging of secrets, cookies, or PII | OpenTelemetry SDK |`
  },
  'domain-model': {
    title: '# 4. DOMAIN MODEL (ENTITY-CENTRIC)',
    content: `## 4.1 The Fundamental Modeling Invariant
The system adheres to the strict entity hierarchy:
\`\`\`
  [Advertiser] (Business Entity)
       |
       +---> 1:N [Ad] (Creative Asset / Ad Library ID)
       |           |
       |           +---> 1:N [AdObservation] (Temporal scrape sightings)
       |
       +---> 1:N [LandingEntity] (Destination Domain & Public Website)
       |           |
       |           +---> 1:N [VerificationResult] (SSRF-safe check evidence)
       |
       +---> 1:1 [LeadQualification] (Composite score, tier, rationale)
\`\`\`

## 4.2 Entity Definitions
- **Advertiser:** Represents the legal or commercial enterprise paying for ads. Identified primarily by public Meta Page ID and canonicalized business name.
- **Ad:** Represents a unique creative message. Identified by exact Meta Ad Library ID (\`ad_library_id\`). Retains visible copy, headline, CTA button label, and observed platforms.
- **AdObservation:** An append-only audit record capturing a specific occurrence of an Ad in a Scrape Run at a specific DOM scroll index and timestamp.
- **LandingEntity:** Represents the web property promoted in the ad. Contains normalized root domain, final resolved URL, and verification status.
- **VerificationResult:** Audit log of a verification probe, containing HTTP status, SSL certificate validity, DNS resolution evidence, and latency.
- **LeadQualification:** Evaluated score (0-100), qualification tier (Tier 1 Hot, Tier 2 Warm, Tier 3 Cold, Disqualified), signal vector, and human-readable explanation.`
  },
  'state-machines': {
    title: '# 6. JOB / RUN STATE MACHINE',
    content: `## 6.1 Formal Finite State Machine (FSM)
The Scrape Job lifecycle is governed by a deterministic state machine with strict transitions:

\`\`\`
               +-----------+
               |  CREATED  |
               +-----+-----+
                     | Validated payload
                     v
               +-----------+
               |  QUEUED   +--------+ (Operator Cancel)
               +-----+-----+        |
                     | Worker lease |
                     v              v
               +-----------+  +-----------+
               | STARTING  |  | CANCELLED |
               +-----+-----+  +-----------+
                     | Browser ready
                     v
  +----------->+------------+
  |            | NAVIGATING +--------+ (Challenge/Block)
  |            +-----+------+        |
  |                  | Page ready    v
  |                  v         +-------------+
  |            +------------+  | CHALLENGED/ |
  |   +------->| COLLECTING |  |   BLOCKED   |
  |   |        +-----+------+  +------+------+
  |   | Batch        | Batch ready    | Stop & Alert
  |   | committed    v                v
  |   |        +------------+  +-------------+
  |   +--------+ VALIDATING |  |   PAUSED /  |
  |            +-----+------+  |   FAILED    |
  |                  | Validated
  |                  v
  |            +---------------+
  +------------+ CHECKPOINTING |
               +-----+---------+
                     | Target reached / End of search
                     v
               +-----------+
               | COMPLETED |
               +-----------+
\`\`\`

## 6.2 Non-Circumvention Invariants
- **Rule 1:** Any detection of CAPTCHA, HTTP 403, HTTP 429, or Access Challenge causes an immediate transition to \`CHALLENGED\` or \`BLOCKED\`.
- **Rule 2:** The state machine strictly forbids automatic transitions from \`CHALLENGED\` or \`BLOCKED\` back to \`COLLECTING\` or \`NAVIGATING\`.
- **Rule 3:** Resumption requires human operator review of the frozen checkpoint and explicit approval.`
  },
  'meta-adapter': {
    title: '# 8. META AD LIBRARY ADAPTER BOUNDARY',
    content: `## 8.1 Adapter Contract Interface
The adapter exposes an isolated TypeScript interface:
\`\`\`typescript
export interface IMetaAdapter {
  navigateSearch(params: SearchParameters): Promise<NavigationResult>;
  waitForResultsContainer(): Promise<ContainerState>;
  extractVisibleAdCards(): Promise<RawExtractedAdCard[]>;
  advanceScroll(): Promise<ScrollResult>;
  detectChallengeOrBlock(): ChallengeDetectionResult | null;
  verifyResultsSentinel(): Promise<SentinelState>;
}
\`\`\`

## 8.2 Locator Strategy (Semantic-First with Fallback)
1. **Primary Strategy:** User-facing role locators (e.g. \`page.getByRole('heading', { level: 3 })\`, \`page.getByRole('button', { name: /Learn More|Shop Now|Contact Us/i })\`).
2. **Secondary Fallback:** Stable accessibility text locators (\`page.getByText('Library ID:', { exact: false })\`, \`page.getByText('Started running on', { exact: false })\`).
3. **Change-Detection Sentinel:** The adapter verifies that if a search yields 0 items, the page explicitly displays the confirmed "No ads match your search criteria" text container. If neither ad cards nor the zero-result container are found, it triggers a \`UI_CHANGE\` exception rather than reporting zero results.`
  },
  'security-threat-model': {
    title: '# 14. SECURITY THREAT MODEL',
    content: `## 14.1 Threat Model (STRIDE Methodology)
- **Spoofing / Identity:** Unauthorized job submission. *Mitigation:* API Gateway authentication with HMAC signature tokens and role-based permissions (RBAC).
- **Tampering:** Malicious payloads in search queries or ad destination URLs. *Mitigation:* Strict Zod schema validation; URL sanitization.
- **Repudiation:** Disputed data origin or invalid scrape claims. *Mitigation:* Immutable \`ad_observations\` audit table with cryptographic payload hash (\`SHA-256\`) and run provenance.
- **Information Disclosure:** Accidental exposure of internal infrastructure during landing page verification (SSRF). *Mitigation:* Egress firewall blocking private subnets (RFC 1918, RFC 3927, link-local, cloud metadata).
- **Denial of Service:** Worker crash loops due to unbounded memory consumption or infinite scroll loops. *Mitigation:* Bounded max scroll depth, 5-minute hard timeout per run, and automated worker restart on memory threshold (>1.5 GB).
- **Elevation of Privilege:** Malicious formulas in CSV export targeting Excel/Sheets. *Mitigation:* Prefix any cell starting with \`=\`, \`+\`, \`-\`, \`@\`, \`\\t\`, \`\\r\` with an apostrophe (\`'\`).`
  },
  'handoff-contract': {
    title: '# 24. PHASE-01 HANDOFF CONTRACT',
    content: `The Phase 01 specification is packaged as a complete, machine-readable JSON structure detailing all boundaries, schemas, database tables, and implementation contracts for Phase 02. See the interactive JSON exporter in the workbench tab.`
  }
};
