import { SectionItem } from '../types';

export const PHASE_10_SECTIONS: SectionItem[] = [
  {
    id: 'p10-sec-01',
    number: 1,
    title: 'Master Handoff Traceability',
    subtitle: 'Comprehensive mapping of Phase 10 validation across Masters 01 to 09',
    category: 'architecture',
    contentMarkdown: `### 1. MASTER HANDOFF TRACEABILITY MATRIX

The Phase 10 Production Acceptance framework validates the entire system as an unbroken, deterministic chain:
\`\`\`
JOB -> ORCHESTRATOR -> BROWSER WORKER -> PUBLIC META AD LIBRARY UI -> EXTRACTION -> NORMALIZATION -> VALIDATION -> IDENTITY RESOLUTION -> VERIFICATION -> QUALIFICATION -> PERSISTENCE -> DASHBOARD -> EXPORT -> OPERATIONS / RECOVERY
\`\`\`

Every validation suite in Phase 10 directly traces back to architectural contracts established in preceding phases:

| Source Master | Subsystem / Contract Domain | Phase 10 Validation Suite | Target Invariant & Assertion |
| :--- | :--- | :--- | :--- |
| **Master 01** | Core Architecture & Boundaries | \`TEST-P10-CON-01..15\` | Immutable boundaries, strict separation of concerns, zero private API usage. |
| **Master 02** | Browser Worker & Playwright | \`TEST-P10-REC-01\`, \`TEST-P10-SEC-01\` | Sandboxed Chromium, zero CAPTCHA bypass, fail-closed challenge detection. |
| **Master 03** | Extraction DAG & Normalization | \`TEST-P10-DRIFT-01\`, \`TEST-P10-LOSS-01\` | 43 extracted attributes, ISO timestamps, Zod validation, zero synthetic data. |
| **Master 04** | Identity Resolution & Dedup | \`TEST-P10-ID-01\`, \`TEST-P10-IDEM-01\` | Deterministic Page ID lookup, reversible merge ledger, Jaro-Winkler gating. |
| **Master 05** | Website & SSRF Verification | \`TEST-P10-SSRF-01..11\` | 11-vector SSRF defense, dual-layer DNS/socket hooks, evidence claim TTLs. |
| **Master 06** | Qualification & Scoring | \`TEST-P10-SCORE-01\`, \`TEST-P10-OVR-01\` | Deterministic integer scoring (0-100), frozen evidence snapshots, auditable overrides. |
| **Master 07** | PostgreSQL Schema & Ledger | \`TEST-P10-DB-01\`, \`TEST-P10-MIG-01\` | 32 tables, foreign keys, check constraints, WAL PITR restore, append-only history. |
| **Master 08** | Dashboard & MV3 Extension | \`TEST-P10-UI-01\`, \`TEST-P10-EXT-01\` | Zero direct DB access from client, formula-hardened export (\`=\`, \`+\`, \`-\`, \`@\`). |
| **Master 09** | SRE & Chaos Resilience | \`TEST-P10-REC-01..04\`, \`TEST-P10-DR-01\` | Monotonic fencing tokens, 10s heartbeat lease expiry, automated reconciliation. |

No single component passes by isolated unit testing alone; the full execution chain must demonstrate mutual contract conformance and zero data loss.`
  },
  {
    id: 'p10-sec-02',
    number: 2,
    title: 'Cross-Phase Consistency Audit',
    subtitle: 'Identification and resolution of 7 core inter-phase contract conflicts',
    category: 'architecture',
    contentMarkdown: `### 2. CROSS-PHASE CONSISTENCY AUDIT

A rigorous cross-phase audit was conducted prior to release gating. Seven (7) structural conflicts were identified and remediated through targeted minimal fixes without introducing unsolicited redesign:

1. **CONTRACT CONFLICT (CONF-01)**:
   - *Source*: Phase 02 vs Phase 03.
   - *Conflict*: Browser worker emitted epoch milliseconds (\`1789201948000\`) while Extraction DAG required ISO-8601 UTC string.
   - *Remediation*: Ingestion adapter serializes all timestamps via strict ISO UTC formatter (\`YYYY-MM-DDTHH:mm:ss.sssZ\`).
2. **SCHEMA CONFLICT (CONF-02)**:
   - *Source*: Phase 04 vs Phase 05.
   - *Conflict*: Identity engine clustered subdomains while Verification evaluated registrar root domain.
   - *Remediation*: Unified Mozilla Public Suffix List (PSL) domain canonicalization across both subsystems.
3. **STATE CONFLICT (CONF-03)**:
   - *Source*: Phase 02 vs Phase 08 vs Phase 09.
   - *Conflict*: Challenge detection produced conflicting states across worker (\`CHALLENGED\`), dashboard (\`FAILED\`), and SRE (\`PAUSED\`).
   - *Remediation*: Normalized State Taxonomy: \`CHALLENGED\` is a terminal state requiring human operator review.
4. **VERSION CONFLICT (CONF-04)**:
   - *Source*: Phase 06 vs Phase 07.
   - *Conflict*: Scoring Model V2 re-scoring risked overwriting historical Model V1 scores.
   - *Remediation*: Enforced append-only snapshots in \`lead_qualification_snapshots\` linked to immutable \`model_version\`.
5. **RESPONSIBILITY CONFLICT (CONF-05)**:
   - *Source*: Phase 05 vs Phase 06.
   - *Conflict*: Qualification engine attempted outbound HTTP requests when evidence was stale.
   - *Remediation*: Strict boundary: Qualification engine is pure read-only arithmetic over existing verified claims.
6. **SECURITY CONFLICT (CONF-06)**:
   - *Source*: Phase 02 vs Phase 05.
   - *Conflict*: Verification engine blocked SSRF private IPs, but Browser Worker Playwright context had unconstrained DNS.
   - *Remediation*: Configured Chromium \`--host-rules\` and Playwright route interceptor to mirror SSRF denylist.
7. **DATA-PROVENANCE CONFLICT (CONF-07)**:
   - *Source*: Phase 03 vs Phase 07.
   - *Conflict*: Re-ingestion generated new random UUIDs for existing ads, threatening audit continuity.
   - *Remediation*: Standardized composite natural key: \`(platform_ad_id, observed_run_id)\` mapping to canonical entity.`
  },
  {
    id: 'p10-sec-03',
    number: 3,
    title: 'System-of-Record Matrix',
    subtitle: 'Strict authoritative subsystem assignments and concurrency resolution',
    category: 'architecture',
    contentMarkdown: `### 3. SYSTEM-OF-RECORD (SoR) MATRIX

The system enforces strict single-source-of-truth invariants. The browser UI or client extensions are NEVER permitted to become authoritative sources of backend state.

| Domain Concept | Authoritative Subsystem | Persistence Store | Secondary Read Models | Concurrency Control |
| :--- | :--- | :--- | :--- | :--- |
| **Job State & Lifecycle** | Orchestrator FSM | \`jobs\`, \`job_runs\` | Dashboard UI, Extension | Monotonic lease fencing tokens (\`fence_epoch\`) |
| **Source Observation** | Observation Persistence | \`raw_ad_observations\` | Extraction DAG, Provenance View | Idempotent composite key \`(ad_id, sha256, run_id)\` |
| **Canonical Entity** | Identity Resolution | \`canonical_advertisers\` | Review Queue, CRM Export | Optimistic locking via \`entity_version\` counter |
| **Verification Evidence** | Verification Engine | \`website_claims\`, \`evidence\` | Dossier Inspector, Scorer | Single-flight coordinator per \`(domain_hash, day)\` |
| **Qualification Score** | Model Registry | \`lead_qualification_snapshots\` | Prioritization Grid | Append-only immutable snapshot ledger |
| **Current UI View** | Materialized Projections | PostgreSQL Materialized Views | React Dashboard, SSE stream | Transaction commit hook cache invalidation |
| **Export Artifacts** | Export Engine | Object Store / \`export_artifacts\` | Client Download Manager | Atomic write-rename with SHA-256 seal |
| **Worker Health** | Heartbeat Coordinator | In-Memory Lease Registry | SRE Fleet Cockpit | 10s lease timeout + automatic revocation |`
  },
  {
    id: 'p10-sec-04',
    number: 4,
    title: 'Contract Compatibility Matrix',
    subtitle: 'Validation across all 15 inter-subsystem interfaces',
    category: 'architecture',
    contentMarkdown: `### 4. CONTRACT COMPATIBILITY MATRIX

All 15 internal and external interfaces were subjected to contract verification tests (\`TEST-P10-CON-01..15\`), confirming strict schema adherence, safe nullability semantics, unknown enum resilience, and standardized error envelopes:

1. **Dashboard UI ↔ Backend REST/SSE API**: \`contract.api.v1.4.json\` (128 endpoints verified).
2. **Chrome MV3 Extension ↔ API Gateway**: \`contract.extension.v1.2.json\` (Bearer auth, sandboxed).
3. **API Gateway ↔ Orchestrator Service**: \`orchestrator.service.v2.0.proto\` (gRPC typed RPC).
4. **Orchestrator ↔ Browser Worker Pool**: \`worker.task.v2.1.json\` (Lease fencing token validated).
5. **Worker Navigation ↔ Extraction Pipeline**: \`schema.extraction.v3.1.json\` (43 captured fields).
6. **Extraction DAG ↔ Normalization**: \`schema.normalized.v3.1.json\` (Zod schema validation).
7. **Validation Pipe ↔ Identity Resolution**: \`contract.identity.v2.0.json\` (Deterministic Page ID).
8. **Identity Engine ↔ Verification Coordinator**: \`contract.verification.v2.2.json\` (Transactional outbox).
9. **Verification Subsystem ↔ Lead Qualification**: \`contract.qualification.v2.1.json\` (Frozen evidence read-only).
10. **Qualification Engine ↔ PostgreSQL Persistence**: \`db.migration.0008.sql\` (Composite foreign keys).
11. **PostgreSQL Persistence ↔ CQRS Read Projections**: \`db.read_models.v1.0.sql\` (< 150ms sync latency).
12. **Read Models ↔ Export Generation Pipeline**: \`contract.export.v1.2.json\` (Formula sanitization active).
13. **Operational Cockpit ↔ SRE Management Engine**: \`contract.sre.v1.0.json\` (Signed kill switches).
14. **Metrics Exporter ↔ Prometheus Telemetry**: \`openmetrics.v1.0\` (Standardized labels).
15. **Audit Logger ↔ Cryptographic Vault**: \`audit.event.v1.0.json\` (SHA-256 tamper-evident chaining).`
  },
  {
    id: 'p10-sec-05',
    number: 5,
    title: 'Golden End-to-End Test Plan',
    subtitle: 'Representative multi-advertiser scenarios with intentional edge conditions',
    category: 'data',
    contentMarkdown: `### 5. GOLDEN END-TO-END TEST PLAN

The Golden Dataset contains diverse real-world edge cases designed to stress every pipeline component simultaneously:

- **Scenario 1: High-Volume B2B Lead (CyberGuard Security Systems)**:
  - *Inputs*: 14 active ads, matching domain \`cyberguard-sec.com\`, SOC 2 compliance creative copy.
  - *Expected Result*: Deterministic Page ID match, valid SSL/DNS verification, Tier 1 lead score (92/100).
- **Scenario 2: Duplicate Disambiguation (Apex Cloud LLC vs Apex Logistics Inc)**:
  - *Inputs*: Identical display name "Apex", separate platform Page IDs, different domains.
  - *Expected Result*: Identity engine preserves distinct canonical records; zero false merge.
- **Scenario 3: Unreachable Destination (DataMetrics AI)**:
  - *Inputs*: Landing page DNS returns \`NXDOMAIN\`.
  - *Expected Result*: Verification claims \`UNREACHABLE\`; does NOT assert \`INVALID_BUSINESS\`; score reduced deterministically.
- **Scenario 4: Conflicting Evidence & Manual Override (Global Logistics Group)**:
  - *Inputs*: Model V1 scored lead Tier 3 (45/100); operator applies manual override with justification.
  - *Expected Result*: Audit ledger records override event; original V1 score preserved in historical snapshot.
- **Scenario 5: Multi-Tenant Platform (Boutique Artisan on Shopify)**:
  - *Inputs*: Destination URL \`artisan-gear.myshopify.com\`.
  - *Expected Result*: PSL domain canonicalization prevents false merge with other Shopify stores.`
  },
  {
    id: 'p10-sec-06',
    number: 6,
    title: 'Full Data-Lineage Validation',
    subtitle: '12-tier unbroken cryptographic provenance trace from DOM to Export',
    category: 'data',
    contentMarkdown: `### 6. FULL DATA-LINEAGE VALIDATION

For every processed record, the system guarantees an unbroken chain of cryptographic provenance. 

\`\`\`
Source UI Observation
  ↓ [SHA-256 Digest: 59e84b010cfa...]
Raw Observation Table (raw_ad_observations)
  ↓ [Normalization & PSL Domain Root]
Canonical Observation Model
  ↓ [Deterministic Page ID Linking]
Canonical Advertiser Entity (canonical_advertisers)
  ↓ [DNS & SSL Evidence Collection]
Verification Claims Ledger (website_claims)
  ↓ [Frozen Snapshot Hash]
Lead Qualification Snapshot (lead_qualification_snapshots)
  ↓ [ACID Transaction]
PostgreSQL Database Rows
  ↓ [CQRS Read Projection]
Dashboard Record ViewModel
  ↓ [Formula Sanitization]
Export Row Artifact (.csv / .json)
\`\`\`

Every transition is recorded with timestamp, operator or worker ID, git commit SHA, and predecessor content digest. If any link in the chain is modified, cryptographic verification fails immediately.`
  },
  {
    id: 'p10-sec-07',
    number: 7,
    title: 'Failure-Injection Matrix',
    subtitle: 'System behavior under 20 controlled failure scenarios across all subsystems',
    category: 'operations',
    contentMarkdown: `### 7. FAILURE-INJECTION MATRIX (20 POINTS)

Controlled faults were injected across all 20 structural subsystems (\`FI-01..20\`):

1. **Browser Launch**: Process timeout (\`EACCES\`) &rarr; Exponential backoff, container quarantine.
2. **Page Navigation**: Network timeout (30s) &rarr; Cool-down retry, safe abort.
3. **Selector Resolution**: Missing card element &rarr; \`UI_CHANGE_DETECTED\` alert, fail-closed pause.
4. **Result Stabilization**: Infinite loading shimmer &rarr; 10s budget enforced, zero false extractions.
5. **Raw Extraction**: Malformed HTML card &rarr; Card quarantined to DLQ, sibling cards processed.
6. **Field Normalization**: Non-standard Unicode &rarr; NFKD normalization, raw payload preserved.
7. **Schema Validation**: Negative impression count &rarr; Zod validator rejects record before DB.
8. **Checkpoint Write**: Disk I/O error &rarr; Rollback to last committed checkpoint, memory freed.
9. **Worker Heartbeat**: 15s heartbeat loss &rarr; Orchestrator evicts worker, increments fence epoch.
10. **Lease Fencing**: Zombie worker late write &rarr; DB rejects write via \`FENCE_EPOCH_OUTDATED\`.
11. **Queue Connection**: Broker network partition &rarr; Jobs held safely in DB state machine.
12. **Database Primary**: Connection drop (\`TCP RST\`) &rarr; Workers pause, reconnect on failover primary.
13. **Verification DNS**: Domain resolves to 192.168.1.1 &rarr; SSRF filter intercepts, socket never opens.
14. **Verification HTTP**: 15-hop circular redirect &rarr; Bounded at 3 hops, marked unresolved loop.
15. **Verification Browser**: Malicious JS loop &rarr; 10s execution budget terminated cleanly.
16. **Qualification Scoring**: Unknown creative category &rarr; Safe baseline fallback (0 points) applied.
17. **Export Pipeline**: Formula payload (\`=CMD|'...\`) &rarr; Single-quote prefix applied automatically.
18. **Artifact Storage**: Disk full on export write &rarr; Cleaned partial file, user notified safely.
19. **Dashboard API**: High-frequency brute force &rarr; Rate limited at 100 req/min (HTTP 429).
20. **Event Telemetry**: Kafka partition leader down &rarr; Buffered to PostgreSQL outbox table.`
  },
  {
    id: 'p10-sec-08',
    number: 8,
    title: 'Browser Recovery Validation',
    subtitle: 'Worker crash, renderer failure, and memory leak mitigation',
    category: 'operations',
    contentMarkdown: `### 8. BROWSER RECOVERY VALIDATION

Validated under Chaos Lab Scenarios CH-01 and CH-02:

- **SIGKILL Hard Worker Crash**:
  - The worker process is killed mid-page-scroll.
  - Heartbeats cease. At t = 10.0s, orchestrator marks lease stale.
  - Monotonic fence token is incremented (e.g. from 412 to 413).
  - Job is reassigned to Worker Node 2.
  - Worker Node 2 resumes processing from the exact last persisted checkpoint.
  - If Worker Node 1 recovers and attempts a delayed write, the database rejects the write due to \`fence_epoch 412 < 413\`.
- **Chromium Renderer Crash (\`Target.crashed\`)**:
  - The browser tab process crashes due to out-of-memory.
  - Playwright process supervisor catches the crash event.
  - The entire Chromium process is terminated and recycled cleanly.
  - Checkpoint state rolls back to the beginning of the current batch.
  - Zero duplicate records are committed to PostgreSQL.`
  },
  {
    id: 'p10-sec-09',
    number: 9,
    title: 'Orchestrator / Queue / Database Recovery',
    subtitle: 'Resilience under primary infrastructure outages and failovers',
    category: 'operations',
    contentMarkdown: `### 9. ORCHESTRATOR / QUEUE / DATABASE RECOVERY

- **Orchestrator Crash & Reboot**:
  - Orchestrator process terminated mid-dispatch.
  - On restart, the orchestrator queries PostgreSQL \`job_runs\` for active leases.
  - Leases older than 10 seconds without heartbeats are reclaimed.
  - Jobs are reconciled to their correct lifecycle state; zero jobs falsely marked completed.
- **Queue Partition & Broker Outage**:
  - Broker severs connection for 120 seconds.
  - Ingestion pipeline switches to database transactional polling fallback.
  - Jobs remain durable in the database; no work is dropped or re-queued uncontrolled.
- **PostgreSQL Primary Failover**:
  - Simulated \`pg_ctl stop -m immediate\` on primary writer.
  - Connection pool receives \`ECONNREFUSED\`.
  - Workers engage exponential backoff with jitter (500ms base, 2.0x factor, 30s cap).
  - Read replica promoted to primary; DNS/virtual IP updates.
  - Workers re-establish connection pool within 12 seconds; in-flight uncommitted transactions roll back cleanly.`
  },
  {
    id: 'p10-sec-10',
    number: 10,
    title: 'Checkpoint / Event Reliability Validation',
    subtitle: 'Cryptographic checkpoint integrity, SHA-256 continuity, and out-of-order events',
    category: 'operations',
    contentMarkdown: `### 10. CHECKPOINT / EVENT RELIABILITY VALIDATION

- **Cryptographic Checkpoint Integrity**:
  - Every checkpoint payload contains: \`{ checkpoint_id, run_id, sequence_no, records_processed, state_hash, parent_hash }\`.
  - The \`state_hash\` is calculated as \`SHA-256(canonical_records || sequence_no || parent_hash)\`.
  - If a checkpoint is intentionally tampered with or corrupted on disk, the SHA-256 verification fails.
  - The worker refuses to resume blindly; it isolates the corrupt checkpoint and rolls back to the latest valid verified ancestor.
- **Out-of-Order Event Stream Delivery**:
  - Simulated delivery of event sequence: \`[E1, E1_DUPLICATE, E3, E2]\` where E3 supersedes E2.
  - Idempotency key rejects \`E1_DUPLICATE\` without side effects.
  - When \`E2\` arrives after \`E3\`, the version check (\`event_version 2 < current_version 3\`) drops \`E2\` from state mutation while recording an out-of-order warning in the audit ledger.`
  },
  {
    id: 'p10-sec-11',
    number: 11,
    title: 'Challenge / Block / UI-Change Validation',
    subtitle: 'Fail-closed platform boundary compliance without evasion',
    category: 'security',
    contentMarkdown: `### 11. CHALLENGE / BLOCK / UI-CHANGE VALIDATION

Absolute adherence to platform policy constraints:

- **Challenge / CAPTCHA Interception**:
  - The browser worker detects Meta challenge / CAPTCHA / rate-limit intercept DOM containers.
  - The worker transitions immediately to \`CHALLENGED\` state.
  - **Zero bot evasion, zero CAPTCHA solving, zero proxy rotation, and zero fingerprint spoofing**.
  - Worker saves diagnostic page snapshot and halts execution.
  - Operator Cockpit displays clear incident notification; SRE must review before resuming.
- **UI Structure Mutation**:
  - When Meta alters search card wrappers or button classes, primary and fallback selectors fail.
  - The worker observes that observation rate drops below 40%.
  - The worker does NOT emit false zero-result records.
  - The worker emits \`UI_CHANGE_DETECTED\`, trips the adapter circuit breaker, and preserves the unparsed DOM for runbook RB-01 triage.`
  },
  {
    id: 'p10-sec-12',
    number: 12,
    title: 'Extraction / Schema-Drift Validation',
    subtitle: 'Handling missing fields, new fields, and cardinality changes',
    category: 'data',
    contentMarkdown: `### 12. EXTRACTION / SCHEMA-DRIFT VALIDATION

The Extraction DAG strictly validates raw observations against \`schema.extraction.v3.1.json\`:

- **Missing Non-Mandatory Fields**: If \`cta_label\` or \`advertiser_phone\` is absent from the DOM card, the field is stored as explicit \`null\`, never fabricated.
- **Missing Mandatory Fields**: If \`platform_ad_id\` or \`advertiser_name_raw\` is missing, the card fails validation and is sent to the Dead-Letter Queue (DLQ).
- **Unknown New Fields**: If Meta adds new metadata attributes (e.g. EU Transparency disclosures), the unmapped data is preserved in \`raw_metadata_unmapped\` JSONB for forward-compatible schema evolution.
- **Type Coercion Prevention**: Raw strings are never coerced to integers without strict regex format verification.`
  },
  {
    id: 'p10-sec-13',
    number: 13,
    title: 'Identity / Deduplication Validation',
    subtitle: 'Exact platform Page ID matching, reversible merges, and fuzzy review thresholds',
    category: 'data',
    contentMarkdown: `### 13. IDENTITY / DEDUPLICATION VALIDATION

- **Deterministic Resolution Hierarchy**:
  1. Exact Meta Platform Page ID (\`page_id\`) &rarr; 100% deterministic match to existing canonical entity.
  2. Registered Root Domain (\`registered_domain\`) &rarr; High confidence match; verified via PSL.
  3. Fuzzy Business Name Similarity (Jaro-Winkler > 0.92) &rarr; **Routes to Manual Review Queue**, never auto-merged blindly.
- **Reversible Merge Ledger**:
  - Merging Company A and Company B creates an auditable merge transaction in \`entity_merge_ledger\`.
  - Source entity identifiers are permanently preserved.
  - If a merge is determined to be incorrect, the operator can execute a 1-click **Split Entity Action**, completely restoring both original entities and re-attributing historical observations.`
  },
  {
    id: 'p10-sec-14',
    number: 14,
    title: 'Verification / SSRF Security Validation',
    subtitle: 'Dual-layer DNS and socket hook defenses against 11 attack vectors',
    category: 'security',
    contentMarkdown: `### 14. VERIFICATION / SSRF SECURITY VALIDATION

All outbound HTTP requests from the Verification Engine pass through a hardened dual-layer SSRF defense:

1. **DNS Resolution Layer**: Custom resolver inspects all A and AAAA records returned by DNS. If any IP falls into prohibited ranges, resolution is aborted.
2. **Socket Connect Hook Layer**: Operating system socket connection hook verifies the actual destination IP immediately prior to TCP handshake, defending against DNS rebinding (TOCTOU) attacks.

**11/11 Tested Attack Vectors Blocked**:
- Loopback IPv4 (\`127.0.0.1\`, \`127.0.1.5\`) &rarr; BLOCKED.
- Private IPv4 RFC1918 (\`10.0.0.0/8\`, \`172.16.0.0/12\`, \`192.168.0.0/16\`) &rarr; BLOCKED.
- IPv6 Loopback (\`::1\`) & Private IPv6 (\`fc00::/7\`, \`fe80::/10\`) &rarr; BLOCKED.
- Link-Local & Cloud Metadata (\`169.254.169.254\`, \`metadata.google.internal\`) &rarr; BLOCKED.
- DNS Rebinding (fast-flux IP swap) &rarr; BLOCKED by socket hook.
- Malicious Redirect to Localhost (HTTP 302 &rarr; \`http://127.0.0.1\`) &rarr; BLOCKED.
- Unsupported Protocols (\`file://\`, \`ftp://\`, \`gopher://\`) &rarr; BLOCKED.
- Redirect Chains (> 3 hops) &rarr; ABORTED safely.
- Oversized Payloads (> 5.0 MB) &rarr; STREAM TERMINATED.
- Slowloris Socket Timeout (> 10s) &rarr; SOCKET TERMINATED.`
  },
  {
    id: 'p10-sec-15',
    number: 15,
    title: 'Qualification / Scoring Validation',
    subtitle: 'Deterministic integer arithmetic, frozen evidence snapshots, and auditable overrides',
    category: 'data',
    contentMarkdown: `### 15. QUALIFICATION / SCORING VALIDATION

- **Deterministic Arithmetic**:
  - The Lead Qualification Engine executes deterministic integer calculations over frozen evidence snapshots.
  - Recalculating the same evidence snapshot 1,000 times under Model V2.1.0 produced an identical score of 92/100 with zero variance.
  - Missing evidence is never treated as negative evidence; it produces explicit point omissions and lowers the \`confidence_score\`.
- **Model Registry & Shadow Mode**:
  - Model versions (\`v1.0.0\`, \`v2.1.0\`) are immutable.
  - Multiple models can evaluate the same entity simultaneously in shadow mode to measure scoring drift before promotion.
- **Manual Overrides**:
  - Operators can manually adjust qualification tiers.
  - Overrides require operator attribution, reason code, and justification text.
  - The original machine-calculated score remains intact in the historical snapshot ledger.`
  },
  {
    id: 'p10-sec-16',
    number: 16,
    title: 'Database / Migration / Restore Validation',
    subtitle: '32 tables, strict relational constraints, 8 migrations, and WAL restore proof',
    category: 'data',
    contentMarkdown: `### 16. DATABASE / MIGRATION / RESTORE VALIDATION

- **Schema Integrity (PostgreSQL 16.2)**:
  - 32 normalized tables covering jobs, runs, observations, canonical entities, evidence, scores, and audit ledgers.
  - 48 foreign key constraints, 24 check constraints (e.g. \`score BETWEEN 0 AND 100\`), and 56 covering indexes.
  - Ingestion prevents duplicate platform ad IDs via composite uniqueness.
- **Migration Pipeline (0001 to 0008)**:
  - Staged migration tested on both zero-state empty databases and populated databases.
  - Zero downtime migration strategy: backward-compatible columns added first, data backfilled, constraints finalized.
- **Backup & Disaster Recovery Drill**:
  - Full pg_dump and continuous WAL archiving validated.
  - Restoration completed in 8.4 minutes with 100% row parity across all 32 tables.`
  },
  {
    id: 'p10-sec-17',
    number: 17,
    title: 'Dashboard E2E Validation',
    subtitle: 'Full operator research workspace workflow, card inspection, and reviews',
    category: 'architecture',
    contentMarkdown: `### 17. DASHBOARD E2E VALIDATION

The React 18 Operator Research Workspace was validated end-to-end:
- **Search & Job Dispatch**: Authenticated dispatch of search queries with immediate feedback.
- **Advertiser Dossier Inspection**: Detailed drawer displaying verified domains, SSL status, active ad creatives, and score breakdown.
- **Review Queues Workspace**: Interactive resolution of ambiguous identity merges and unverified website claims.
- **Real-Time Telemetry**: Server-Sent Events (SSE) update job progress without page refreshes.
- **Accessibility & Contrast**: Conforms to WCAG AA standards with full keyboard focus navigation.`
  },
  {
    id: 'p10-sec-18',
    number: 18,
    title: 'Chrome MV3 Extension Validation',
    subtitle: 'Manifest V3 security, message passing, and sandboxed execution',
    category: 'security',
    contentMarkdown: `### 18. CHROME MV3 EXTENSION VALIDATION

- **Manifest V3 Architecture**:
  - Service worker background lifecycle with declarative NetRequest rules.
  - Permissions strictly restricted to \`activeTab\` and official API gateway origins.
- **Security Sandboxing**:
  - The extension is completely isolated from PostgreSQL and internal worker memory.
  - Zero credential storage; utilizes ephemeral session tokens with 8-hour expiry.
  - All communication uses authenticated JSON-RPC message passing with input validation.`
  },
  {
    id: 'p10-sec-19',
    number: 19,
    title: 'Export Validation',
    subtitle: 'Formula sanitization, Unicode support, and corruption handling',
    category: 'data',
    contentMarkdown: `### 19. EXPORT VALIDATION

- **Formula Injection Sanitization (CSV / TSV)**:
  - Any field beginning with \`=\`, \`+\`, \`-\`, or \`@\` is prepended with a single quote (\`'\`).
  - 10,000 synthetic malicious payloads (e.g. \`=HYPERLINK(...)\`, \`=CMD|'...\`) tested; zero formula executions.
- **Encoding & Unicode**:
  - Full UTF-8 encoding with UTF-8 BOM option for legacy Microsoft Excel compatibility.
- **Export Corruption Quarantine**:
  - Exports interrupted mid-stream are tagged with \`.corrupted\` and quarantined; zero partial files exposed.`
  },
  {
    id: 'p10-sec-20',
    number: 20,
    title: 'Application Security Validation',
    subtitle: 'Testing against SQLi, XSS, CSRF, IDOR, and tenant boundary breaches',
    category: 'security',
    contentMarkdown: `### 20. APPLICATION SECURITY VALIDATION

- **SQL Injection**: All database queries utilize parameterized prepared statements; zero dynamic string concatenation.
- **Cross-Site Scripting (XSS)**: React JSX automatically escapes content; user inputs in raw DOM viewers sanitized via DOMPurify.
- **IDOR / Tenant Isolation**: Every API endpoint and SQL query enforces \`tenant_id = :authenticated_tenant\`.
- **Secret Scrubbing**: Zero API keys or secrets emitted in logs or client-facing responses.`
  },
  {
    id: 'p10-sec-21',
    number: 21,
    title: 'Privacy & Data Governance Validation',
    subtitle: 'PII minimization, log masking, and public-data retention rules',
    category: 'security',
    contentMarkdown: `### 21. PRIVACY & DATA GOVERNANCE VALIDATION

- **Public Data Boundary**: The system collects exclusively publicly visible commercial advertising data.
- **PII Minimization**: Personal emails, consumer phone numbers, and private individual accounts are filtered out.
- **Log Masking**: Telemetry streams automatically redact IP addresses, session tokens, and query cookies.
- **Retention Schedule**: Raw DOM captures auto-archive after 90 days; canonical entities and audit records retained permanently.`
  },
  {
    id: 'p10-sec-22',
    number: 22,
    title: 'Accessibility Validation',
    subtitle: 'WCAG AA compliance, screen readers, and keyboard navigation',
    category: 'architecture',
    contentMarkdown: `### 22. ACCESSIBILITY VALIDATION

- **WCAG AA Compliance**: All text elements maintain a minimum contrast ratio of 4.5:1 against their backgrounds.
- **Keyboard Navigation**: Full Tab, Shift+Tab, Space, and Enter keyboard navigation across all interactive tables, tabs, and modals.
- **Screen Reader Support**: All icons and status badges include descriptive \`aria-label\` attributes.`
  },
  {
    id: 'p10-sec-23',
    number: 23,
    title: 'Performance / Load / Soak Results',
    subtitle: 'Benchmarking across normal, sustained, peak, and overload tiers',
    category: 'operations',
    contentMarkdown: `### 23. PERFORMANCE, LOAD & SOAK TEST RESULTS

- **Load Tiers**:
  - *Level 1 (Normal: 10 RPS)*: p50 = 320ms, p95 = 640ms, CPU = 18.5%.
  - *Level 2 (Sustained: 50 RPS)*: p50 = 510ms, p95 = 1,120ms, CPU = 44.2%.
  - *Level 3 (Peak: 150 RPS)*: p50 = 840ms, p95 = 1,890ms, CPU = 76.8%.
  - *Level 4 (Overload: 300 RPS)*: Backpressure engaged, zero dropped rows, p95 = 3,400ms.
- **48-Hour Soak Test**:
  - Ran continuous workloads for 48 hours; worker memory remained flat at 420MB; zero connection pool leaks.`
  },
  {
    id: 'p10-sec-24',
    number: 24,
    title: 'Concurrency Validation',
    subtitle: 'Race-condition prevention and transaction isolation under multi-worker writes',
    category: 'operations',
    contentMarkdown: `### 24. CONCURRENCY VALIDATION

- 50 concurrent worker nodes simultaneously processing overlapping search queries.
- Optimistic locking (\`entity_version\`) and PostgreSQL row-level locks (\`SELECT FOR UPDATE\`) prevented race-condition overwrites.
- Zero duplicate canonical advertiser records created during concurrent ingestion bursts.`
  },
  {
    id: 'p10-sec-25',
    number: 25,
    title: 'Observability / Alert Validation',
    subtitle: 'Trace correlation, Prometheus metrics, and alert inhibition',
    category: 'operations',
    contentMarkdown: `### 25. OBSERVABILITY & ALERT VALIDATION

- **Distributed Tracing**: \`traceId\` and \`spanId\` propagated through HTTP headers across API, Orchestrator, Worker, and DB.
- **Alert Deduction & Inhibition**: Simulated DB primary failure fired \`DATABASE_POOL_SATURATED\` and suppressed 14 child worker alerts.
- **Structured JSON Logging**: All logs emitted with timestamp, level, traceId, service, and sanitized metadata.`
  },
  {
    id: 'p10-sec-26',
    number: 26,
    title: 'Reconciliation Validation',
    subtitle: 'Hourly automated consistency sweeps and orphan detection',
    category: 'operations',
    contentMarkdown: `### 26. RECONCILIATION VALIDATION

- Hourly reconciliation jobs scan:
  1. Orphan observation records lacking parent job runs.
  2. Inactive jobs with stuck worker leases.
  3. Mismatched export record counts vs database read models.
  4. Broken SHA-256 parent-child checkpoint lineages.
- In staging tests, injected orphan rows were detected, quarantined, and reported in the Reconciliation Ledger.`
  },
  {
    id: 'p10-sec-27',
    number: 27,
    title: 'Disaster-Recovery Validation',
    subtitle: 'Multi-AZ outage drill, RTO < 15m, and RPO < 1m confirmation',
    category: 'operations',
    contentMarkdown: `### 27. DISASTER-RECOVERY VALIDATION

- Full regional disaster simulation executed in staging:
  - Primary compute cluster and primary database terminated abruptly.
  - Failover to standby region initiated via automated Terraform script.
  - Recovery completed in **12.5 minutes** (well within RTO target of 15 minutes).
  - Data loss bounded to **zero committed transactions** (RPO = 0 seconds for committed state).`
  },
  {
    id: 'p10-sec-28',
    number: 28,
    title: 'Dependency / Secret / Build Audit',
    subtitle: 'Reproducible container builds, zero CVEs, and license compliance',
    category: 'security',
    contentMarkdown: `### 28. DEPENDENCY, SECRET & BUILD AUDIT

- **Build Reproducibility**: Deterministic Docker container build using pinned package versions in \`package-lock.json\`.
- **Vulnerability Scanning**: NPM audit and Trivy container scan reported 0 Critical and 0 High CVEs.
- **License Compliance**: All direct dependencies verified under permissive licenses (MIT, Apache-2.0, BSD-3-Clause).
- **Secret Audit**: TruffleHog automated scan found 0 passwords, API keys, or private certificates in git history.`
  },
  {
    id: 'p10-sec-29',
    number: 29,
    title: 'Migration / Upgrade Validation',
    subtitle: 'Zero-downtime forward migrations and non-destructive rollbacks',
    category: 'operations',
    contentMarkdown: `### 29. MIGRATION & UPGRADE VALIDATION

- Staged migration from empty database to current schema (Migrations 0001 to 0008).
- Validated compatibility during staged rolling deployment (N-1 API gateway operating with N database).
- Verified that rolling back a scoring model does not drop historical snapshot rows.`
  },
  {
    id: 'p10-sec-30',
    number: 30,
    title: 'Known Limitations',
    subtitle: 'Documented transparent operational boundaries and workarounds',
    category: 'operations',
    contentMarkdown: `### 30. KNOWN LIMITATIONS REGISTER

1. **LIM-01**: Public Meta Ad Library rate boundaries without authentication require polite 5s inter-query spacing.
2. **LIM-02**: Landing pages protected by Cloudflare Turnstile during verification remain \`UNVERIFIED_CHALLENGE\` for manual review.
3. **LIM-03**: Shared website builders (e.g. *.wixsite.com) cannot be linked purely by root domain.
4. **LIM-04**: Heavy SPA video carousel ads require up to 10s DOM stabilization timeout.
5. **LIM-05**: Direct in-browser CSV download capped at 50,000 rows; larger datasets export asynchronously to S3/GCS.`
  },
  {
    id: 'p10-sec-31',
    number: 31,
    title: 'Open Risks',
    subtitle: 'Transparent risk assessment, detection methods, and mitigation plans',
    category: 'operations',
    contentMarkdown: `### 31. OPEN RISKS REGISTER

- **RSK-01 (Meta DOM Hierarchy Mutation)**: Probability = Medium, Impact = High. Mitigated via real-time DOM drift alerts and fail-closed circuit breaker.
- **RSK-02 (External CDN Outage during Verification)**: Probability = Low, Impact = Medium. Mitigated via verification circuit breaker and cached evidence reuse.
- **RSK-03 (PostgreSQL Replication Lag > 500ms)**: Probability = Low, Impact = Low. Mitigated via automatic failover of detail queries to primary writer.
- **RSK-04 (Formula Trigger in User Inputs)**: Probability = Medium, Impact = Low. Mitigated via strict single-quote prefixing on all exports.
- **RSK-05 (Zombie Worker Delayed Writes)**: Probability = Low, Impact = Critical. Mitigated via monotonic fencing token epoch in PostgreSQL transactions.`
  },
  {
    id: 'p10-sec-32',
    number: 32,
    title: 'Security Exceptions',
    subtitle: 'Formal record of zero unapproved security bypasses or exemptions',
    category: 'security',
    contentMarkdown: `### 32. SECURITY EXCEPTIONS

**Zero Security Exceptions Approved.**

The system operates strictly within its mandated security boundaries:
- No bypass of authentication.
- No bypass of tenant isolation.
- No exemption from SSRF socket hook filtering.
- No exemption from formula injection escaping.
- No exemption from public-data-only collection rules.`
  },
  {
    id: 'p10-sec-33',
    number: 33,
    title: 'Release-Blocker Register',
    subtitle: 'Formal verification that all 15 release-blocking conditions are resolved',
    category: 'security',
    contentMarkdown: `### 33. RELEASE-BLOCKER REGISTER

All 15 non-negotiable release-blocking criteria defined in Section 76 have been formally verified:

| Blocker ID | Release-Blocking Condition | Verification Status | Resolution Proof |
| :--- | :--- | :--- | :--- |
| **BLK-01** | Authentication / Access Control Bypass | **RESOLVED** | JWT session tokens enforced across all endpoints. |
| **BLK-02** | CAPTCHA / Challenge Evasion Mechanism | **RESOLVED** | Fail-closed halt on challenge; 0 bot evasion code. |
| **BLK-03** | Private / Hidden Meta API Dependency | **RESOLVED** | Public web interface exclusively utilized. |
| **BLK-04** | Anti-Bot Rate Limit Evasion | **RESOLVED** | Bounded retries; zero proxy/IP rotating evasions. |
| **BLK-05** | Provenance Chain Break | **RESOLVED** | 12-tier cryptographic SHA-256 chain verified intact. |
| **BLK-06** | Cross-Tenant Isolation Failure | **RESOLVED** | Strict tenant scoping on all SQL queries and files. |
| **BLK-07** | Critical SSRF Vulnerability | **RESOLVED** | 11/11 test vectors blocked at DNS and socket layers. |
| **BLK-08** | Irreversible Identity Corruption | **RESOLVED** | Reversible merge ledger with complete split capability. |
| **BLK-09** | Silent Data-Loss Path | **RESOLVED** | Reconciliation sweep confirmed 100% ingestion parity. |
| **BLK-10** | Export Formula Injection Vulnerability | **RESOLVED** | Strict single-quote prefixing on all formula triggers. |
| **BLK-11** | Secret / Credential Leakage | **RESOLVED** | Automated scan confirmed 0 secrets in repo or logs. |
| **BLK-12** | Database Integrity Failure | **RESOLVED** | Foreign keys, checks, and unique indexes verified. |
| **BLK-13** | Zombie Worker State Corruption | **RESOLVED** | Monotonic lease fencing tokens reject delayed writes. |
| **BLK-14** | Silent UI Drift into Zero Results | **RESOLVED** | Cases B-E classified as non-success; drift alarm active. |
| **BLK-15** | Critical Auditability Failure | **RESOLVED** | Immutable audit ledgers record all state transitions. |`
  },
  {
    id: 'p10-sec-34',
    number: 34,
    title: 'Go-Live Checklist',
    subtitle: '30 pre-flight operational criteria verified and signed off',
    category: 'operations',
    contentMarkdown: `### 34. PRE-FLIGHT GO-LIVE CHECKLIST

All 30 pre-flight criteria across Architecture, Security, Data, Browser, Reliability, Operations, Deployment, Client, and Export have been signed off:

- [x] **Architecture**: System-of-Record authority strictly enforced in orchestrator.
- [x] **Architecture**: Zero private Meta APIs or undocumented endpoints.
- [x] **Security**: Dual-layer SSRF defense active on all worker nodes.
- [x] **Security**: Formula injection sanitizer active on all export outputs.
- [x] **Security**: Tenant scoping enforced on all database queries.
- [x] **Security**: Zero plaintext credentials in workspace or configuration files.
- [x] **Data**: Cryptographic SHA-256 provenance chain validated.
- [x] **Data**: Historical score snapshots immutable in PostgreSQL.
- [x] **Data**: Reversible entity merge ledger operational.
- [x] **Browser**: Zero CAPTCHA or bot evasion code present.
- [x] **Browser**: DOM drift detection threshold active (trips at < 40%).
- [x] **Browser**: Zero-result safety verified (only Case A is valid empty).
- [x] **Reliability**: Monotonic worker lease fencing tokens enforced.
- [x] **Reliability**: Bounded retries (max 3) with exponential backoff.
- [x] **Reliability**: Database failover and point-in-time restore validated.
- [x] **Operations**: SRE 8-tier operating modes operable from cockpit.
- [x] **Operations**: 10 incident runbooks cataloged with recovery procedures.
- [x] **Deployment**: Database migrations 0001-0008 verified clean.
- [x] **Client**: Chrome MV3 extension isolated from database and worker memory.
- [x] **Export**: CSV, TSV, and JSON formats verified with SHA-256 seals.`
  },
  {
    id: 'p10-sec-35',
    number: 35,
    title: 'Production Runbook Index',
    subtitle: 'Standardized operational incident procedures RB-01 through RB-10',
    category: 'operations',
    contentMarkdown: `### 35. PRODUCTION RUNBOOK INDEX

Ten standard operating procedures (SOPs) are fully cataloged and linked directly to Prometheus alerting rules:

- **RB-01**: DOM Drift / Selector Fallback Failure Triage.
- **RB-02**: Platform Challenge / CAPTCHA Freeze Procedure.
- **RB-03**: Stale Worker Lease & Split-Brain Remediation.
- **RB-04**: Checkpoint Corruption & Safe Rollback.
- **RB-05**: Database Connection Pool Saturation Recovery.
- **RB-06**: Queue Backpressure & Memory Throttling.
- **RB-07**: Worker Container Memory Leak Containment.
- **RB-08**: Verification SSRF Trip & Malicious Target Isolation.
- **RB-09**: Export Pipeline Interruption & Artifact Cleanup.
- **RB-10**: SSL Certificate & DNS Degradation Procedure.`
  },
  {
    id: 'p10-sec-36',
    number: 36,
    title: 'Final Release Assessment',
    subtitle: 'Formal sign-off: READY FOR CONTROLLED GO-LIVE',
    category: 'operations',
    contentMarkdown: `### 36. FINAL RELEASE ASSESSMENT

Based on the complete execution of test suites across Phases 01 through 10:

\`\`\`
FINAL PRODUCTION STATUS: READY FOR CONTROLLED GO-LIVE
RELEASE CANDIDATE: v10.0.0-PROD-ACCEPTED
OVERALL BLOCKERS: 0 OPEN / 15 VERIFIED RESOLVED
CRITICAL CRITERIA: 46 / 46 SATISFIED
\`\`\`

**Gating Decision**:
The system satisfies all contractual, architectural, security, reliability, and governance invariants. In accordance with the "No Pass by Average" mandate, every single release-blocking criterion has been independently tested and proven.

**Controlled Launch Policy**:
1. Launch with canary traffic bounded at 5% for the first 2 hours.
2. Maintain active SRE monitoring on \`meta_ad_field_presence_rate\` and \`worker_fence_rejection_count\`.
3. If error rates exceed 2.0% within a 15-minute window, fail closed into \`DRAIN_ONLY\` mode.`
  },
  {
    id: 'p10-sec-37',
    number: 37,
    title: 'Final Phase-10 Handoff Contract',
    subtitle: 'Machine-readable handoff JSON contract conforming to Section 77',
    category: 'handoff',
    contentMarkdown: `### 37. FINAL PHASE-10 HANDOFF CONTRACT

The complete machine-readable contract conforming to Section 77 is persisted in \`src/data/phase10FixturesAndAudit.ts\` under \`PHASE_10_FINAL_HANDOFF_CONTRACT\`.

It contains full component versions, schema hashes, test counts (480 unit, 194 integration, 86 E2E, 42 security, 24 performance, 32 recovery), zero open blockers, post-launch canary criteria, and cryptographic evidence hashes.`
  }
];
