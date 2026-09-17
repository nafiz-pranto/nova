export interface Phase07Section {
  id: string;
  number: number;
  title: string;
  category: 'FOUNDATION' | 'STORAGE' | 'INTEGRITY' | 'CONCURRENCY' | 'OPERATIONS' | 'GOVERNANCE';
  summary: string;
  content: string;
}

export const PHASE_07_SECTIONS: Phase07Section[] = [
  {
    id: 'sec-01',
    number: 1,
    title: 'PHASE-06 TRACEABILITY',
    category: 'FOUNDATION',
    summary: 'Direct bidirectional mapping from Phase 06 qualification criteria, scoring signals, and evidence snapshots to relational persistence tables.',
    content: `### 1. Upstream Phase-06 Handoff Ingestion
Phase 07 strictly consumes the machine-readable handoff specification produced in Phase 06. The persistence layer enforces the central architectural invariant:

> **CENTRAL PERSISTENCE INVARIANT:** Database state must never destroy the evidence of how that state was created. The database is an auditable historical ledger of empirical observations, entity links, verifications, and qualification decisions—never merely a cache of ephemeral scraper runs.

### 2. Comprehensive Traceability Matrix
Every upstream requirement, entity, and rule from Phase 01 through Phase 06 maps directly to one or more authoritative Phase-07 relational tables:

| Upstream Requirement / Concept | Source Phase | Phase-07 Primary Table(s) | Storage Classification | Invariant Enforced |
| :--- | :--- | :--- | :--- | :--- |
| **Observation Extraction & Provenance** | Phase 03 | \`source_observation\`, \`raw_observation_field\` | Immutable Ledger | Append-only raw extraction with SHA-256 hash validation |
| **Canonical Normalization** | Phase 03 | \`canonical_observation\` | Versioned Fact | Explicit pointer to source observation; no orphaned canonicals |
| **Advertiser & Ad Entities** | Phase 04 | \`advertiser\`, \`advertisement\`, \`ad_observation\` | Current State + History | Canonical entities separated from temporal ad creatives |
| **Identity Links & Reversible Merge** | Phase 04 | \`advertiser_identity_link\`, \`identity_merge_event\`, \`identity_split_event\` | Versioned Fact + Event Ledger | Non-destructive resolution; reversible split without losing history |
| **Verification Claims & Multi-Hop Evidence** | Phase 05 | \`verification_run\`, \`verification_claim\`, \`verification_evidence\` | Versioned Fact + Evidence Ledger | Every claim references verified HTTP/TLS/DOM evidence records |
| **SSRF Defense Audit Logs** | Phase 05 | \`verification_run.network_audit_log\` | Immutable Fact | Explicit DNS resolution and IP egress records |
| **Qualification States & Hard Blockers** | Phase 06 | \`scoring_result\`, \`scoring_rule\`, \`manual_override\` | Versioned Fact + Audit Trail | Discrete qualification enum; hard blockers strictly persistable |
| **Capped Multi-Category Signals** | Phase 06 | \`scoring_signal\`, \`scoring_contribution\` | Configuration + Breakdown | Material signal points breakdown with category cap checks |
| **Point-in-Time Evidence Snapshots** | Phase 06 | \`scoring_evidence_snapshot\` | Immutable JSONB Snapshot | Immutable input evidence payload frozen at calculation time |
| **Model Registry & Shadow Mode** | Phase 06 | \`scoring_model\` | Reference / Config | Versioned model lifecycle (ACTIVE, SHADOW, RETIRED) |`
  },
  {
    id: 'sec-02',
    number: 2,
    title: 'DATABASE ARCHITECTURE',
    category: 'FOUNDATION',
    summary: 'PostgreSQL 16+ engine configuration, transactional DDL, ACID guarantees, connection pooling, and relational primitives.',
    content: `### 1. Engine Selection & Rationale
PostgreSQL 16+ is established as the sole authoritative transactional database engine. It provides:
1. **Transactional DDL**: Migrations run inside explicit \`BEGIN ... COMMIT\` blocks, preventing partial schema corruption during deployment.
2. **ACID Transactional Guarantees**: Complete serializability and repeatable reads for multi-step entity merges and scoring calculations.
3. **Advanced Indexing**: High-performance B-Tree, partial unique indexes (\`WHERE is_active = true\`), expression indexes, and GIN indexes for bounded JSONB metadata.
4. **Generated Stored Columns**: Deterministic parsing of hostnames, registrable domains, and hash calculations without application overhead.
5. **Advisory & Row-Level Locking**: Granular concurrency controls protecting against race conditions in deduplication and merge pipelines.

### 2. Physical Deployment Architecture
\`\`\`
                                  [ Application Layer / Workers ]
                                                │
                                  (PgBouncer Connection Pooler)
                                  Transaction Pooling (Port 6432)
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     ▼                                                     ▼
        [ Primary PostgreSQL Node ]                               [ Read Replica Node ]
         (Read/Write Master)                                       (Hot Standby Read-Only)
         - Ingestion Transactions                                  - Phase 08 Reporting Views
         - Identity Merges/Splits                                  - Analytical Dashboards
         - Verification & Scoring                                  - Export Payload Builders
                     │
         (Synchronous Streaming Replication)
                     │
                     ▼
        [ Point-in-Time Recovery (PITR) ]
         - Continuous WAL Archiving to Secure Object Store (GCS/S3)
         - Daily Base Backups with Automated Restore Verification
\`\`\``
  },
  {
    id: 'sec-03',
    number: 3,
    title: 'SCHEMA ORGANIZATION',
    category: 'FOUNDATION',
    summary: 'Logical partitioning into 8 architectural layers (Layers A through H) strictly isolating operational telemetry from business domain facts.',
    content: `### 1. Eight Core Architectural Layers
The schema is partitioned into 8 cohesive functional layers. Cross-layer foreign keys are strictly governed:

- **LAYER A — SOURCE / OBSERVATION**: Immutable capture of raw web documents, extracted fields, and canonicalized page states.
- **LAYER B — CANONICAL DOMAIN**: Current and temporal representations of Advertisers, Advertisements, Destinations, and Business Entities.
- **LAYER C — IDENTITY / RELATIONSHIP**: Probabilistic identity links, candidate queues, review logs, and atomic merge/split audit ledgers.
- **LAYER D — VERIFICATION**: HTTP responses, TLS certificates, DNS resolution records, DOM evidence, and verified entity claims.
- **LAYER E — QUALIFICATION & SCORING**: Versioned scoring models, rule definitions, immutable calculation snapshots, and manual overrides.
- **LAYER F — EXECUTION & OPERATIONS**: Scrape jobs, execution runs, resumable sequential checkpoints, worker registries, and error events.
- **LAYER G — AUDIT & GOVERNANCE**: System-wide tamper-evident mutation ledger and schema migration version catalogs.
- **LAYER H — EXPORT & REPORTING**: Pre-aggregated read-models and batch export artifacts consumed by Phase 08.

### 2. Cross-Layer Dependency Invariant
\`\`\`
[Layer F: Execution] ────► Spawns ───► [Layer A: Observation]
                                              │
                                       Normalizes Into
                                              ▼
[Layer G: Audit] ◄──── Audits ───────► [Layer B: Canonical Domain]
                                              ▲
                                              │ Linked By
                                       [Layer C: Identity]
                                              ▲
                                              │ Verifies
                                       [Layer D: Verification]
                                              ▲
                                              │ Scores
                                       [Layer E: Qualification]
                                              │
                                        Projects Into
                                              ▼
                                       [Layer H: Export / Read Models]
\`\`\``
  },
  {
    id: 'sec-04',
    number: 4,
    title: 'ENTITY / RELATIONSHIP MODEL',
    category: 'STORAGE',
    summary: 'Relational entity map defining cardinatlities, foreign key cascades, and parent-child ownership boundaries across 32 tables.',
    content: `### 1. High-Level Entity Relationship Topology
The system comprises 32 normalized relational tables. Every entity maintains explicit provenance pointers back to Layer A observations:

\`\`\`
[source_system] 1──N [source_observation] 1──N [raw_observation_field]
                            │
                     1──1   │ References
                            ▼
                  [canonical_observation]
                            │
               ┌────────────┴────────────┐
          1──N │                    1──N │
               ▼                         ▼
         [advertiser]              [advertisement] 1──N [ad_observation]
               │                         │
               ├─────────────────────────┤
               │                         │
          1──N │                    1──N │
               ▼                         ▼
   [advertiser_identity_link]  [ad_identity_link]
               │
               ▼
   [identity_merge_event] 1──N [identity_split_event]
               │
               ▼
       [business_entity] 1──N [canonical_destination]
               ▲
               │ Referenced By
               ▼
      [verification_run] 1──N [verification_claim] 1──N [verification_evidence]
               ▲
               │ Frozen In
               ▼
  [scoring_evidence_snapshot] 1──1 [scoring_result] 1──N [scoring_contribution]
                                          ▲
                                          │ Overridden By
                                          ▼
                                   [manual_override]
\`\`\`

### 2. Strict Referential Integrity Rules
- **No Uncontrolled Cascading Deletes**: Master entities (\`advertiser\`, \`source_observation\`) enforce \`ON DELETE RESTRICT\`. Deleting a source observation that anchors downstream canonical identities is physically forbidden.
- **Bounded Ownership Cascades**: Only dependent child ledgers (e.g. \`scoring_contribution\` owned by a specific \`scoring_result\`) permit cascading deletes during automated partition drops or test teardowns.`
  },
  {
    id: 'sec-05',
    number: 5,
    title: 'OBSERVATION STORAGE',
    category: 'STORAGE',
    summary: 'Immutable storage of raw public ad extractions, adapter versions, page hashes, and capture metadata.',
    content: `### 1. \`source_observation\` Specification
Every extraction of a public Meta Ad Library card or search query creates an immutable row:

\`\`\`sql
CREATE TABLE source_observation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_system_id VARCHAR(64) NOT NULL REFERENCES source_system(id),
    job_id UUID NOT NULL REFERENCES scrape_job(id) ON DELETE RESTRICT,
    run_id UUID NOT NULL REFERENCES scrape_run(id) ON DELETE RESTRICT,
    worker_id VARCHAR(128) NOT NULL,
    source_url TEXT NOT NULL,
    source_ad_library_id VARCHAR(128) NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    adapter_version VARCHAR(32) NOT NULL,
    extraction_schema_version VARCHAR(32) NOT NULL,
    normalization_version VARCHAR(32) NOT NULL,
    collection_sequence BIGINT NOT NULL,
    batch_identifier VARCHAR(128) NOT NULL,
    raw_payload_hash CHAR(64) NOT NULL, -- SHA-256 of raw DOM/JSON
    validation_status VARCHAR(32) NOT NULL CHECK (validation_status IN ('VALID', 'PARTIAL', 'MALFORMED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_source_obs_idempotency UNIQUE (source_system_id, source_ad_library_id, batch_identifier)
);
\`\`\`

### 2. \`raw_observation_field\` Specification
Field-level provenance persists individual raw text tokens, selector metadata, and extraction confidence:

\`\`\`sql
CREATE TABLE raw_observation_field (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    observation_id UUID NOT NULL REFERENCES source_observation(id) ON DELETE RESTRICT,
    field_name VARCHAR(64) NOT NULL,
    raw_value TEXT NOT NULL,
    data_type VARCHAR(32) NOT NULL,
    source_selector TEXT NOT NULL,
    extraction_method VARCHAR(32) NOT NULL,
    classification VARCHAR(32) NOT NULL,
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
    observed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX idx_raw_obs_field_obs ON raw_observation_field (observation_id, field_name);
\`\`\``
  },
  {
    id: 'sec-06',
    number: 6,
    title: 'CANONICAL DOMAIN STORAGE',
    category: 'STORAGE',
    summary: 'Canonical representations of advertisers, name histories, advertisements, temporal ad copy observations, and destinations.',
    content: `### 1. \`advertiser\` & \`advertiser_name_history\`
The canonical advertiser represents a synthesized entity, while temporal name changes are tracked in an append-only ledger:

\`\`\`sql
CREATE TABLE advertiser (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_name VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MERGED', 'SUSPENDED', 'SPLIT')),
    current_identity_link_id UUID, -- References active identity link
    first_seen_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL,
    resolution_version VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_adv_dates CHECK (last_seen_at >= first_seen_at)
);

CREATE TABLE advertiser_name_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    advertiser_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    observed_name VARCHAR(255) NOT NULL,
    first_seen_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL,
    source_observation_id UUID NOT NULL REFERENCES source_observation(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_adv_name_history UNIQUE (advertiser_id, observed_name, source_observation_id)
);
\`\`\`

### 2. \`advertisement\` & \`ad_observation\`
Ads are tracked separately from temporal variations in creative text, headlines, and call-to-actions:

\`\`\`sql
CREATE TABLE advertisement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    source_system_id VARCHAR(64) NOT NULL REFERENCES source_system(id),
    source_ad_library_id VARCHAR(128) NOT NULL,
    canonical_status VARCHAR(32) NOT NULL CHECK (canonical_status IN ('ACTIVE', 'INACTIVE', 'REMOVED', 'UNKNOWN')),
    first_observed_at TIMESTAMPTZ NOT NULL,
    last_observed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_advertisement_source UNIQUE (source_system_id, source_ad_library_id)
);

CREATE TABLE ad_observation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertisement_id UUID NOT NULL REFERENCES advertisement(id) ON DELETE RESTRICT,
    source_observation_id UUID NOT NULL REFERENCES source_observation(id) ON DELETE RESTRICT,
    observed_body_text TEXT,
    observed_headline TEXT,
    observed_cta_title VARCHAR(128),
    observed_destination_url TEXT,
    observed_media_type VARCHAR(32) CHECK (observed_media_type IN ('IMAGE', 'VIDEO', 'CAROUSEL', 'TEXT_ONLY', 'UNKNOWN')),
    observed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
\`\`\``
  },
  {
    id: 'sec-07',
    number: 7,
    title: 'IDENTITY / MERGE / SPLIT STORAGE',
    category: 'STORAGE',
    summary: 'Relational identity links, probabilistic candidate matching, and completely reversible atomic merge/split ledgers.',
    content: `### 1. \`advertiser_identity_link\` & Partial Uniqueness
Identity links decouple relational keys from entity resolution decisions:

\`\`\`sql
CREATE TABLE advertiser_identity_link (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_advertiser_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    target_business_entity_id UUID NOT NULL REFERENCES business_entity(id) ON DELETE RESTRICT,
    relationship_type VARCHAR(64) NOT NULL CHECK (relationship_type IN ('DIRECT_OWNERSHIP', 'PARENT_SUBSIDIARY', 'AGENCY_CLIENT', 'BRAND_ALIAS')),
    match_status VARCHAR(32) NOT NULL CHECK (match_status IN ('ACTIVE', 'SUPERSEDED', 'REJECTED', 'SPLIT')),
    confidence_score NUMERIC(4,3) NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    evidence_summary JSONB NOT NULL,
    rule_version VARCHAR(32) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    superseded_at TIMESTAMPTZ
);
-- PARTIAL UNIQUE INDEX: Exactly one ACTIVE link allowed per source advertiser
CREATE UNIQUE INDEX uq_active_adv_identity_link 
ON advertiser_identity_link (source_advertiser_id) 
WHERE is_active = true;
\`\`\`

### 2. Reversible Merge/Split Ledgers
\`\`\`sql
CREATE TABLE identity_merge_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_entity_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    merged_entity_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    rule_version VARCHAR(32) NOT NULL,
    confidence_score NUMERIC(4,3) NOT NULL,
    justification TEXT NOT NULL,
    performed_by VARCHAR(128) NOT NULL, -- 'SYSTEM_AUTOMATION' or reviewer_id
    performed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    is_reverted BOOLEAN NOT NULL DEFAULT false,
    reverted_at TIMESTAMPTZ,
    correlation_id UUID NOT NULL,
    CONSTRAINT chk_no_self_merge CHECK (primary_entity_id <> merged_entity_id)
);

CREATE TABLE identity_split_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merge_event_id UUID NOT NULL REFERENCES identity_merge_event(id) ON DELETE RESTRICT,
    split_entity_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    justification TEXT NOT NULL,
    performed_by VARCHAR(128) NOT NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    correlation_id UUID NOT NULL
);
\`\`\``
  },
  {
    id: 'sec-08',
    number: 8,
    title: 'VERIFICATION STORAGE',
    category: 'STORAGE',
    summary: 'Multi-hop HTTP/TLS evidence, DNS resolutions, SSRF egress validation logs, and atomic verification claim states.',
    content: `### 1. \`verification_run\` & Network Audit Logging
Every landing page probe records network-level invariants:

\`\`\`sql
CREATE TABLE verification_run (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_url TEXT NOT NULL,
    registrable_domain VARCHAR(255) NOT NULL,
    execution_status VARCHAR(32) NOT NULL CHECK (execution_status IN ('SUCCESS', 'FAILED', 'BLOCKED_SSRF', 'TIMEOUT')),
    http_status_code INT,
    final_resolved_url TEXT,
    tls_version VARCHAR(32),
    ip_egress_address INET,
    dns_resolved_ips INET[] NOT NULL DEFAULT '{}',
    is_ssrf_safe BOOLEAN NOT NULL,
    latency_ms INT NOT NULL,
    verifier_version VARCHAR(32) NOT NULL,
    network_audit_log JSONB NOT NULL DEFAULT '{}'::jsonb,
    verified_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX idx_verif_run_domain ON verification_run (registrable_domain, verified_at DESC);
\`\`\`

### 2. \`verification_claim\` & \`verification_evidence\`
Discrete claims link directly to verified DOM elements and TLS certificates:

\`\`\`sql
CREATE TABLE verification_claim (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_run_id UUID NOT NULL REFERENCES verification_run(id) ON DELETE RESTRICT,
    advertiser_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    claim_type VARCHAR(64) NOT NULL CHECK (claim_type IN ('DOMAIN_REACHABILITY', 'TLS_ACTIVE', 'OPEN_DOM_VERIFIED', 'BRAND_TOKEN_MATCH', 'COMMERCIAL_CONTACT')),
    claim_status VARCHAR(32) NOT NULL CHECK (claim_status IN ('VERIFIED', 'REFUTED', 'AMBIGUOUS', 'INCONCLUSIVE')),
    confidence VARCHAR(16) NOT NULL CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW', 'UNCERTAIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE verification_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES verification_claim(id) ON DELETE CASCADE,
    evidence_type VARCHAR(64) NOT NULL,
    snippet_content TEXT,
    parsed_structured_data JSONB,
    hash_signature CHAR(64) NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
\`\`\``
  },
  {
    id: 'sec-09',
    number: 9,
    title: 'QUALIFICATION / SCORING STORAGE',
    category: 'STORAGE',
    summary: 'Point-in-time evidence snapshots, multi-category scoring contributions, rule evaluations, and manual reviewer overrides.',
    content: `### 1. \`scoring_evidence_snapshot\` (Immutable Snapshot)
Prevents drift by capturing the exact evidence payload seen by the scoring engine at runtime:

\`\`\`sql
CREATE TABLE scoring_evidence_snapshot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    snapshot_hash CHAR(64) NOT NULL, -- SHA-256 of frozen JSON
    evidence_payload JSONB NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_snapshot_hash UNIQUE (snapshot_hash)
);
\`\`\`

### 2. \`scoring_result\` & \`scoring_contribution\`
Stores normalized quantitative scores (0–100), qualification status, and signal breakdown:

\`\`\`sql
CREATE TABLE scoring_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    scoring_model_id VARCHAR(64) NOT NULL REFERENCES scoring_model(id) ON DELETE RESTRICT,
    model_version VARCHAR(32) NOT NULL,
    evidence_snapshot_id UUID NOT NULL REFERENCES scoring_evidence_snapshot(id) ON DELETE RESTRICT,
    qualification_state VARCHAR(32) NOT NULL CHECK (qualification_state IN ('QUALIFIED', 'DISQUALIFIED', 'NEEDS_REVIEW', 'BLOCKED')),
    total_score NUMERIC(5,2) NOT NULL CHECK (total_score >= 0.0 AND total_score <= 100.0),
    confidence_level VARCHAR(16) NOT NULL CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW', 'UNCERTAIN')),
    active_blockers TEXT[] NOT NULL DEFAULT '{}',
    explanation_summary TEXT NOT NULL,
    calculated_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX idx_scoring_result_adv ON scoring_result (advertiser_id, calculated_at DESC);

CREATE TABLE scoring_contribution (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    scoring_result_id UUID NOT NULL REFERENCES scoring_result(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL CHECK (category IN ('ADVERTISING_ACTIVITY', 'WEBSITE_DESTINATION', 'IDENTITY_CONSISTENCY', 'COMMERCIAL_CONTACTABILITY')),
    signal_code VARCHAR(64) NOT NULL,
    points_awarded NUMERIC(5,2) NOT NULL,
    points_possible NUMERIC(5,2) NOT NULL,
    weight NUMERIC(4,3) NOT NULL,
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    explanation_fragment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
\`\`\`

### 3. \`manual_override\` Ledger
Non-destructive manual reviewer decisions:

\`\`\`sql
CREATE TABLE manual_override (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scoring_result_id UUID NOT NULL REFERENCES scoring_result(id) ON DELETE RESTRICT,
    advertiser_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    previous_state VARCHAR(32) NOT NULL,
    overridden_state VARCHAR(32) NOT NULL CHECK (overridden_state IN ('QUALIFIED', 'DISQUALIFIED', 'NEEDS_REVIEW', 'BLOCKED')),
    previous_score NUMERIC(5,2) NOT NULL,
    overridden_score NUMERIC(5,2),
    reviewer_id VARCHAR(128) NOT NULL,
    reason_code VARCHAR(64) NOT NULL,
    justification TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
\`\`\``
  },
  {
    id: 'sec-10',
    number: 10,
    title: 'EXECUTION / JOB STORAGE',
    category: 'STORAGE',
    summary: 'Sequential job, run, checkpoint, and worker heartbeats supporting crash recovery and exactly-once processing.',
    content: `### 1. \`scrape_job\` & \`scrape_run\`
Distinguishes high-level research requests from individual execution attempts:

\`\`\`sql
CREATE TABLE scrape_job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_query VARCHAR(255) NOT NULL,
    target_country VARCHAR(8) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    requested_by VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE scrape_run (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES scrape_job(id) ON DELETE RESTRICT,
    run_number INT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'SUCCEEDED', 'FAILED', 'ABORTED')),
    worker_id VARCHAR(128) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    completed_at TIMESTAMPTZ,
    records_extracted INT NOT NULL DEFAULT 0,
    error_summary TEXT,
    CONSTRAINT uq_job_run_number UNIQUE (job_id, run_number)
);
\`\`\`

### 2. \`scrape_checkpoint\` (Resumability Engine)
Captures monotonic progress cursors to support deterministic restart upon worker crash:

\`\`\`sql
CREATE TABLE scrape_checkpoint (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES scrape_job(id) ON DELETE RESTRICT,
    run_id UUID NOT NULL REFERENCES scrape_run(id) ON DELETE RESTRICT,
    sequence_number BIGINT NOT NULL,
    cursor_token TEXT NOT NULL,
    batch_identifier VARCHAR(128) NOT NULL,
    records_processed_cumulative INT NOT NULL,
    checkpoint_state JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_run_sequence UNIQUE (run_id, sequence_number)
);
\`\`\``
  },
  {
    id: 'sec-11',
    number: 11,
    title: 'AUDIT / PROVENANCE STORAGE',
    category: 'STORAGE',
    summary: 'Tamper-evident system-wide audit event catalog tracking every material state mutation with user, action, and correlation IDs.',
    content: `### 1. \`audit_event\` Table Specification
The central audit log records every identity merge, split, override, and scoring model activation:

\`\`\`sql
CREATE TABLE audit_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlation_id UUID NOT NULL,
    actor_id VARCHAR(128) NOT NULL,
    actor_type VARCHAR(32) NOT NULL CHECK (actor_type IN ('SYSTEM_WORKER', 'HUMAN_REVIEWER', 'ADMINISTRATOR', 'API_CLIENT')),
    operation VARCHAR(64) NOT NULL CHECK (operation IN (
        'OBSERVATION_INGESTED', 'IDENTITY_LINKED', 'IDENTITY_MERGED', 
        'IDENTITY_SPLIT', 'VERIFICATION_EXECUTED', 'SCORE_CALCULATED', 
        'MANUAL_OVERRIDE_APPLIED', 'MODEL_ACTIVATED', 'MODEL_RETIRED'
    )),
    entity_type VARCHAR(64) NOT NULL,
    entity_id UUID NOT NULL,
    previous_state JSONB,
    new_state JSONB NOT NULL,
    reason_code VARCHAR(64) NOT NULL,
    rule_or_model_version VARCHAR(32) NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX idx_audit_entity ON audit_event (entity_type, entity_id, occurred_at DESC);
CREATE INDEX idx_audit_correlation ON audit_event (correlation_id);
\`\`\`

### 2. Audit vs Observation Distinction
- **Observation**: Captures empirical external reality (*"The public ad card showed Advertiser X at timestamp T"*).
- **Audit Event**: Captures internal state mutation (*"Reviewer Y merged Advertiser A into B under Rule Z at timestamp T"*).`
  },
  {
    id: 'sec-12',
    number: 12,
    title: 'PRIMARY KEY STRATEGY',
    category: 'INTEGRITY',
    summary: 'UUIDv7 time-ordered keys for distributed generation and index locality, paired with BIGINT identities for high-volume logs.',
    content: `### 1. Hybrid Primary Key Architecture
1. **UUIDv7 (RFC 9562) for Domain & Ledger Entities**:
   - Entities: \`source_observation\`, \`advertiser\`, \`advertisement\`, \`verification_run\`, \`scoring_result\`, \`audit_event\`.
   - **Advantage**: Globally unique, safely generated on distributed workers without central sequence coordination, and monotonically increasing by millisecond timestamp. This eliminates standard UUIDv4 random B-Tree page split degradation.
2. **BIGINT GENERATED ALWAYS AS IDENTITY for High-Density Child Tables**:
   - Entities: \`raw_observation_field\`, \`advertiser_name_history\`, \`scoring_contribution\`, \`scrape_checkpoint\`.
   - **Advantage**: 8-byte compact representation saving gigabytes of index and heap space across hundreds of millions of field tokens.
3. **Natural Identifiers Forbidden as Primary Keys**:
   - External Meta Ad IDs, landing URLs, and tax numbers are strictly stored as indexed attributes, never as table primary keys.`
  },
  {
    id: 'sec-13',
    number: 13,
    title: 'FOREIGN KEYS / UNIQUE CONSTRAINTS',
    category: 'INTEGRITY',
    summary: 'Referential integrity matrix, ON DELETE RESTRICT guarantees, and natural uniqueness constraints.',
    content: `### 1. Non-Negotiable Constraint Matrix
| Constraint Name | Table | Target Columns | Type | Enforced Invariant |
| :--- | :--- | :--- | :--- | :--- |
| \`uq_source_obs_idempotency\` | \`source_observation\` | \`(source_system_id, source_ad_library_id, batch_identifier)\` | UNIQUE | Prevents duplicate ingestion of identical ad card within the same batch. |
| \`uq_active_adv_identity_link\` | \`advertiser_identity_link\` | \`(source_advertiser_id)\` WHERE is_active = true | PARTIAL UNIQUE | Guarantees an advertiser maps to exactly one canonical business entity at any time. |
| \`uq_snapshot_hash\` | \`scoring_evidence_snapshot\` | \`(snapshot_hash)\` | UNIQUE | Content-addressable deduplication of frozen evidence snapshots. |
| \`uq_active_scoring_model\` | \`scoring_model\` | \`(id, version)\` | UNIQUE | Eliminates accidental in-place mutation of active scoring models. |
| \`uq_advertisement_source\` | \`advertisement\` | \`(source_system_id, source_ad_library_id)\` | UNIQUE | Unique canonical ad card representation per platform. |
| \`fk_raw_field_obs\` | \`raw_observation_field\` | \`observation_id\` REFERENCES \`source_observation\` | FOREIGN KEY | RESTRICT delete: Observations cannot be purged while raw fields exist. |
| \`fk_claim_run\` | \`verification_claim\` | \`verification_run_id\` REFERENCES \`verification_run\` | FOREIGN KEY | RESTRICT delete: Verification runs cannot be pruned while claims exist. |`
  },
  {
    id: 'sec-14',
    number: 14,
    title: 'CHECK CONSTRAINTS',
    category: 'INTEGRITY',
    summary: 'Database-level mathematical invariants, bounded score intervals, status enums, and temporal ordering constraints.',
    content: `### 1. Mathematical & Domain Check Constraints
Check constraints validate business rules inside the PostgreSQL storage engine:

\`\`\`sql
-- Score boundaries: strictly 0.00 to 100.00
ALTER TABLE scoring_result ADD CONSTRAINT chk_score_range 
CHECK (total_score >= 0.00 AND total_score <= 100.00);

-- Confidence interval: strictly 0.000 to 1.000
ALTER TABLE advertiser_identity_link ADD CONSTRAINT chk_conf_range 
CHECK (confidence_score >= 0.000 AND confidence_score <= 1.000);

-- Temporal causality: last_seen_at must be >= first_seen_at
ALTER TABLE advertiser ADD CONSTRAINT chk_adv_dates 
CHECK (last_seen_at >= first_seen_at);

-- Self-reference prevention: entity cannot merge with itself
ALTER TABLE identity_merge_event ADD CONSTRAINT chk_no_self_merge 
CHECK (primary_entity_id <> merged_entity_id);

-- Positive points cap
ALTER TABLE scoring_contribution ADD CONSTRAINT chk_contribution_pts 
CHECK (points_awarded >= 0.00 AND points_awarded <= points_possible);

-- Latency sanity check: network call cannot complete in negative time
ALTER TABLE verification_run ADD CONSTRAINT chk_positive_latency 
CHECK (latency_ms >= 0);
\`\`\``
  },
  {
    id: 'sec-15',
    number: 15,
    title: 'INDEXING STRATEGY',
    category: 'INTEGRITY',
    summary: 'Targeted composite, partial, expression, and GIN indexes aligned directly with access patterns without write-amplification bloat.',
    content: `### 1. High-Performance Index Catalog
Every index is justified by high-frequency query paths:

\`\`\`sql
-- 1. Ingestion Deduplication & Provenance Lookup
CREATE INDEX idx_source_obs_lookup 
ON source_observation (source_system_id, source_ad_library_id, observed_at DESC);

-- 2. Temporal Advertiser Ad Query (All ads for an advertiser sorted by time)
CREATE INDEX idx_ad_advertiser_timeline 
ON advertisement (advertiser_id, last_observed_at DESC);

-- 3. Active Identity Resolution Filter
CREATE INDEX idx_identity_active_link 
ON advertiser_identity_link (source_advertiser_id, target_business_entity_id) 
WHERE is_active = true;

-- 4. Latest Verification Search by Registrable Domain
CREATE INDEX idx_verif_run_domain_recent 
ON verification_run (registrable_domain, verified_at DESC);

-- 5. Latest Qualification State & Prioritization Rank
CREATE INDEX idx_scoring_latest_state 
ON scoring_result (advertiser_id, calculated_at DESC, total_score DESC);

-- 6. Audit Trail by Correlation ID (Cross-service request tracing)
CREATE INDEX idx_audit_correlation_id 
ON audit_event (correlation_id);

-- 7. Operational Checkpoint Sequence Retrieval
CREATE INDEX idx_checkpoint_resume 
ON scrape_checkpoint (run_id, sequence_number DESC);
\`\`\``
  },
  {
    id: 'sec-16',
    number: 16,
    title: 'TRANSACTION / CONCURRENCY MODEL',
    category: 'CONCURRENCY',
    summary: 'Explicit transaction boundaries, row-level locking, conflict resolution, and atomic merge/split state transitions.',
    content: `### 1. Transaction Boundaries
All mutative operations execute inside atomic \`BEGIN ... COMMIT\` boundaries:

1. **Atomic Ingestion Transaction**:
   - Inserts \`source_observation\`.
   - Batch-inserts all \`raw_observation_field\` records.
   - Upserts \`advertisement\` and inserts \`ad_observation\`.
   - Records \`audit_event\`.
   - If any step fails, entire observation rolls back.

2. **Atomic Entity Merge Transaction**:
   - Acquires row-level exclusive locks: \`SELECT * FROM advertiser WHERE id IN (p_id, m_id) FOR UPDATE\`.
   - Validates neither entity has pending conflicts or is already merged.
   - Inserts \`identity_merge_event\`.
   - Deactivates previous active identity links: \`UPDATE advertiser_identity_link SET is_active = false, match_status = 'SUPERSEDED'\`.
   - Inserts new unified active \`advertiser_identity_link\`.
   - Updates merged entity status to \`'MERGED'\`.
   - Emits \`audit_event\` with before/after state snapshots.
   - Commits atomically.

3. **Optimistic Concurrency for Reviewers**:
   - Human review mutations verify entity \`updated_at\` revision token. If the record was modified by a concurrent worker, the transaction raises a \`409 Conflict\` serialization error.`
  },
  {
    id: 'sec-17',
    number: 17,
    title: 'IDEMPOTENCY MODEL',
    category: 'CONCURRENCY',
    summary: 'Subsystem-specific idempotency keys preventing duplicate records upon retries or transient network disconnects.',
    content: `### 1. Subsystem Idempotency Keys
A single global idempotency key is rejected. Instead, distinct cryptographic keys govern each domain transition:

| Subsystem Operation | Natural Idempotency Key Composition | Hash Function | Handling on Conflict |
| :--- | :--- | :--- | :--- |
| **Observation Ingest** | \`source_system_id + source_ad_library_id + batch_identifier\` | SHA-256 | Return existing observation ID; skip duplicate write |
| **Canonical Entity Upsert** | \`source_system_id + source_ad_library_id\` | Composite Key | Update \`last_seen_at\`; preserve original \`first_seen_at\` |
| **Verification Probe** | \`target_url + policy_version + DATE(observed_at)\` | SHA-256 | Reuse cached verification run if within 14-day freshness window |
| **Qualification Calculation** | \`advertiser_id + scoring_model_version + snapshot_hash\` | SHA-256 | Return existing \`scoring_result_id\`; no recalculation overhead |
| **Worker Checkpoint** | \`run_id + sequence_number\` | Composite Key | Do nothing (\`ON CONFLICT DO NOTHING\`) |`
  },
  {
    id: 'sec-18',
    number: 18,
    title: 'CURRENT VS HISTORICAL READ MODEL',
    category: 'CONCURRENCY',
    summary: 'Architectural separation of point-in-time historical records from high-speed current-state materialized views and read contracts.',
    content: `### 1. Architectural Read Separation
Historical tables must never be overwritten for query convenience. Instead, high-performance PostgreSQL Views and Materialized Views provide flattened current-state contracts for Phase 08:

\`\`\`sql
CREATE VIEW v_lead_research_current AS
SELECT 
    a.id AS advertiser_id,
    a.canonical_name,
    a.status AS advertiser_status,
    ad.source_ad_library_id,
    COUNT(DISTINCT ad.id) AS active_ad_count,
    MAX(ad.last_observed_at) AS last_ad_observed_at,
    cd.target_url AS primary_destination_url,
    cd.registrable_domain,
    vr.execution_status AS latest_verification_status,
    vr.is_ssrf_safe,
    sr.qualification_state,
    sr.total_score,
    sr.confidence_level,
    sr.active_blockers,
    sr.model_version AS scoring_model_version,
    sr.calculated_at AS score_calculated_at
FROM advertiser a
LEFT JOIN advertisement ad ON a.id = ad.advertiser_id
LEFT JOIN advertiser_identity_link ail ON a.id = ail.source_advertiser_id AND ail.is_active = true
LEFT JOIN business_entity be ON ail.target_business_entity_id = be.id
LEFT JOIN canonical_destination cd ON be.id = cd.business_entity_id
LEFT JOIN LATERAL (
    SELECT * FROM verification_run 
    WHERE registrable_domain = cd.registrable_domain 
    ORDER BY verified_at DESC LIMIT 1
) vr ON true
LEFT JOIN LATERAL (
    SELECT * FROM scoring_result 
    WHERE advertiser_id = a.id 
    ORDER BY calculated_at DESC LIMIT 1
) sr ON true
GROUP BY a.id, a.canonical_name, a.status, ad.source_ad_library_id, cd.target_url, cd.registrable_domain, vr.execution_status, vr.is_ssrf_safe, sr.qualification_state, sr.total_score, sr.confidence_level, sr.active_blockers, sr.model_version, sr.calculated_at;
\`\`\``
  },
  {
    id: 'sec-19',
    number: 19,
    title: 'JSONB POLICY',
    category: 'INTEGRITY',
    summary: 'Strict boundaries governing semi-structured storage: permitted solely for diagnostic payloads, network telemetry, and frozen evidence snapshots.',
    content: `### 1. JSONB Permitted vs Forbidden Uses
- **STRICTLY PERMITTED**:
  - \`network_audit_log\` in \`verification_run\` (storing DNS hops, SSL cert chain details, and SSRF routing tables).
  - \`evidence_payload\` in \`scoring_evidence_snapshot\` (immutable document representing exact calculation inputs).
  - \`previous_state\` and \`new_state\` in \`audit_event\` (generic before/after state diffs).
  - \`checkpoint_state\` in \`scrape_checkpoint\` (worker-specific cursor state).
- **STRICTLY FORBIDDEN**:
  - Entity primary keys, foreign keys, or relational join anchors.
  - Core search filters (e.g. \`qualification_state\`, \`total_score\`, \`advertiser_name\`).
  - Storing the entire database as a single document collection ("Postgres as Mongo").`
  },
  {
    id: 'sec-20',
    number: 20,
    title: 'RETENTION / ARCHIVAL / DELETION',
    category: 'OPERATIONS',
    summary: 'Tiered lifecycle data management (Permanent, 7-Year, 90-Day, 30-Day) balancing regulatory compliance and storage economics.',
    content: `### 1. Data Retention Classifications
1. **Tier 1 — Permanent Ledger**:
   - Tables: \`advertiser\`, \`advertisement\`, \`advertiser_identity_link\`, \`identity_merge_event\`, \`audit_event\`.
   - Policy: Never purged. Forms the core historical asset graph.
2. **Tier 2 — High Retention (7 Years)**:
   - Tables: \`source_observation\`, \`verification_claim\`, \`scoring_result\`, \`manual_override\`.
   - Policy: Retained for commercial provenance, model benchmarking, and dispute resolution.
3. **Tier 3 — Operational Log (90 Days)**:
   - Tables: \`raw_observation_field\`, \`verification_run\`, \`scoring_evidence_snapshot\`.
   - Policy: Hot PostgreSQL partition dropped after 90 days; cold compressed Parquet archives persisted in object storage.
4. **Tier 4 — Transient Telemetry (30 Days)**:
   - Tables: \`scrape_checkpoint\`, \`worker_event\`, \`error_event\`.
   - Policy: Automated partition drop once associated \`scrape_job\` reaches terminal status.`
  },
  {
    id: 'sec-21',
    number: 21,
    title: 'BACKUP / RESTORE / DISASTER RECOVERY',
    category: 'OPERATIONS',
    summary: 'Point-in-time recovery (PITR) setup, WAL archiving, non-disruptive pg_dump backups, and weekly restore testing automation.',
    content: `### 1. Disaster Recovery Specifications
- **Recovery Point Objective (RPO)**: $\le$ 5 minutes (via continuous Write-Ahead Log streaming to cloud storage).
- **Recovery Time Objective (RTO)**: $\le$ 60 minutes for complete cluster rebuild.
- **Continuous Backup Regime**:
  - Full cluster snapshot daily at 02:00 UTC using \`pg_basebackup\`.
  - WAL segments archived every 60 seconds or at 16MB threshold.
- **Automated Restore Verification**:
  - Every Sunday at 04:00 UTC, an automated CI/CD runner spawns an ephemeral PostgreSQL instance, restores the latest backup, replays WAL to a randomized timestamp, and executes schema integrity and foreign key verification tests.`
  },
  {
    id: 'sec-22',
    number: 22,
    title: 'MIGRATION STRATEGY',
    category: 'OPERATIONS',
    summary: 'Zero-downtime expand/contract migration pipeline, transactional DDL execution, and strict lock timeout protections.',
    content: `### 1. Expand / Contract Pattern
Schema modifications on active high-volume production tables must follow the phased zero-downtime pattern:
\`\`\`
Phase 1: EXPAND   --> Add new nullable column or view. Deploy code that writes to both old and new.
Phase 2: BACKFILL --> Populate new column in background batches (batch size 5,000, 50ms pause).
Phase 3: SWITCH   --> Deploy code that reads exclusively from new column.
Phase 4: CONTRACT --> Drop old column and remove legacy code paths.
\`\`\`

### 2. Lock Safety Guardrails
All migration scripts must explicitly set lock timeouts to prevent blocking active worker traffic:
\`\`\`sql
SET lock_timeout = '2000ms';
SET statement_timeout = '30000ms';
\`\`\``
  },
  {
    id: 'sec-23',
    number: 23,
    title: 'SECURITY / ACCESS CONTROL',
    category: 'GOVERNANCE',
    summary: 'Least-privilege role-based access control (RBAC), connection certificates, and row-level security policies.',
    content: `### 1. Database Role Segregation
1. **\`lead_migration_admin\`**:
   - Superuser/DDL privileges; runs exclusively within secure CI/CD deployment pipelines.
2. **\`lead_app_worker\`**:
   - Read/Write privileges on Operational and Domain tables.
   - Forbidden from dropping tables, truncating partitions, or modifying audit logs.
3. **\`lead_read_reporter\` (Phase 08)**:
   - Read-only (\`SELECT\`) access to Layer H read models, materialized views, and public domain entities.
   - Explicitly denied access to raw telemetry and secret configurations.
4. **Network Security**:
   - SSL/TLS encryption enforced (\`sslmode=verify-full\`).
   - Access restricted to container internal VPC via Cloud SQL proxy / PgBouncer.`
  },
  {
    id: 'sec-24',
    number: 24,
    title: 'PRIVACY / DATA MINIMIZATION',
    category: 'GOVERNANCE',
    summary: 'Strict business contact data boundaries: non-collection of consumer emails, hashed IP addresses, and secure redaction policies.',
    content: `### 1. Privacy & Data Minimization Invariants
- **Consumer PII Ban**: Personal webmail addresses (\`@gmail.com\`, \`@yahoo.com\`, \`@hotmail.com\`) extracted from raw footers are neutralized and mapped to \`REDACTED_CONSUMER_EMAIL\` in canonical storage.
- **IP Address Anonymization**: Scraper worker egress IPs and DNS targets are validated for SSRF safety, but personal user visitor IPs are never captured or logged.
- **No Private Facebook Data**: Only publicly observable Meta Ad Library card disclosures (advertiser disclaimer, ad copy, page creation date) are stored.`
  },
  {
    id: 'sec-25',
    number: 25,
    title: 'OBSERVABILITY',
    category: 'OPERATIONS',
    summary: 'PostgreSQL metrics collection, query latency thresholds, deadlocks, connection pool exhaustion, and table bloat monitoring.',
    content: `### 1. Authoritative Metric Guardrails
- **Slow Query Threshold**: Any query exceeding 250ms triggers an automated alert and logs \`EXPLAIN (ANALYZE, BUFFERS)\`.
- **Deadlock Monitoring**: Tracked via \`pg_stat_database.deadlocks\`. Zero deadlocks permitted in production.
- **Connection Pool Saturation**: Alert triggered when PgBouncer pool active clients exceed 85% of \`max_client_conn\`.
- **Replication Lag**: Synchronous replica lag must remain $\le$ 1,000 bytes; read replica latency $\le$ 100ms.`
  },
  {
    id: 'sec-26',
    number: 26,
    title: 'TESTING STRATEGY',
    category: 'INTEGRITY',
    summary: 'Comprehensive 13-suite automated test matrix covering schema constraints, transaction rollbacks, concurrency, and idempotency.',
    content: `### 1. The 13 Core Database Test Suites
1. **Schema & DDL Tests**: Validates exact column types, defaults, and primary key definitions from an empty database.
2. **Constraint Enforcement Tests**: Asserts that negative scores, invalid enums, and self-merges throw explicit SQL exceptions.
3. **Foreign Key Integrity Tests**: Confirms \`ON DELETE RESTRICT\` prevents deleting anchored observations.
4. **Idempotency Verification**: Ingests identical observation payloads 10 times; asserts exactly 1 row created.
5. **Atomic Merge Transaction Rollback**: Simulates network crash at step 5 of merge; verifies zero partial records persist.
6. **Atomic Split Verification**: Executes split; verifies original source observations and entities remain intact.
7. **Concurrency Simulation**: 20 concurrent threads attempting to merge identical entities; asserts exactly one succeeds and 19 receive serialization errors.
8. **Provenance Lineage Walk**: Reconstructs complete evidence tree from final score back to raw HTML token.
9. **Audit Trail Completeness**: Asserts 100% of state mutations generate corresponding \`audit_event\` records.
10. **Zero-Downtime Migration Test**: Applies migrations under active synthetic write load.
11. **PITR Restoration Test**: Restores base backup + WAL; asserts data consistency.
12. **JSONB Query Benchmark**: Measures extraction latency on frozen snapshots.
13. **Phase 08 Read View Contract Test**: Validates read models against downstream requirements.`
  },
  {
    id: 'sec-27',
    number: 27,
    title: 'SCALE / PERFORMANCE STRATEGY',
    category: 'OPERATIONS',
    summary: 'Declarative table partitioning for billion-row observation tables, table vacuum tuning, and storage capacity projections.',
    content: `### 1. Declarative Range Partitioning
High-growth Layer A tables (\`source_observation\`, \`raw_observation_field\`, \`ad_observation\`) use monthly declarative range partitioning:
\`\`\`sql
CREATE TABLE source_observation (
    id UUID NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    ...
) PARTITION BY RANGE (observed_at);

CREATE TABLE source_observation_2026_09 PARTITION OF source_observation
    FOR VALUES FROM ('2026-09-01 00:00:00+00') TO ('2026-10-01 00:00:00+00');
\`\`\`
- **Autovacuum Tuning**: \`autovacuum_vacuum_cost_limit = 2000\` and \`autovacuum_vacuum_scale_factor = 0.05\` to eliminate table bloat on high-insert partitions.`
  },
  {
    id: 'sec-28',
    number: 28,
    title: 'REPOSITORY / FILE-LEVEL IMPLEMENTATION PLAN',
    category: 'OPERATIONS',
    summary: 'Exact file changes, directory layouts, database migration filenames, and query service boundaries.',
    content: `### 1. Concrete Repository Map
- \`/src/types.ts\`: Phase 07 relational, migration, transaction, and read-model interfaces.
- \`/src/data/phase07Sections.ts\`: Complete 31-section reference specification.
- \`/src/data/phase07SchemaAndMigrations.ts\`: 32 table definitions, SQL DDL migrations (001 through 008), and index registry.
- \`/src/data/phase07FixturesAndAudit.ts\`: 33-point acceptance criteria matrix and production test fixtures.
- \`/src/utils/databaseEngine.ts\`: In-memory transactional database engine, atomic merge/split runner, and provenance tracer.
- \`/src/components/DatabaseSchemaExplorer.tsx\`: Interactive table/DDL inspector across Layers A-H.
- \`/src/components/TransactionSimulator.tsx\`: Interactive transactional merge/split/scoring engine.
- \`/src/components/ProvenanceLineageViewer.tsx\`: Visual end-to-end evidence graph explorer.
- \`/src/components/MigrationPipelineRunner.tsx\`: Migration lifecycle runner with dry-run and rollback validation.
- \`/src/components/Phase07Audit.tsx\`: 33-point formal verification matrix.
- \`/src/components/Phase07HandoffViewer.tsx\`: Machine-readable JSON contract for Phase 08.`
  },
  {
    id: 'sec-29',
    number: 29,
    title: 'DATABASE MIGRATION PLAN',
    category: 'OPERATIONS',
    summary: 'Sequential, executable migration chain (001_foundation through 008_views_and_reporting) rebuildable from zero.',
    content: `### 1. Staged Migration Chain
The complete database is buildable from an empty state via 8 sequential migrations:
1. \`001_foundation_and_enums\`: Enables \`uuid-ossp\`, establishes enums and execution metadata tables.
2. \`002_source_observations\`: Creates \`source_system\`, \`source_observation\`, \`raw_observation_field\`, \`canonical_observation\`.
3. \`003_canonical_entities\`: Creates \`advertiser\`, \`advertiser_name_history\`, \`advertisement\`, \`ad_observation\`, \`business_entity\`, \`canonical_destination\`.
4. \`004_identity_and_relationships\`: Creates \`advertiser_identity_link\`, \`identity_candidate\`, \`identity_merge_event\`, \`identity_split_event\`.
5. \`005_verification_evidence\`: Creates \`verification_run\`, \`verification_claim\`, \`verification_evidence\`, \`verification_conflict\`.
6. \`006_qualification_and_scoring\`: Creates \`scoring_model\`, \`scoring_rule\`, \`scoring_signal\`, \`scoring_evidence_snapshot\`, \`scoring_result\`, \`scoring_contribution\`, \`manual_override\`.
7. \`007_execution_and_checkpoints\`: Creates \`scrape_job\`, \`scrape_run\`, \`scrape_checkpoint\`, \`worker\`, \`worker_event\`, \`error_event\`.
8. \`008_audit_views_and_reporting\`: Creates \`audit_event\`, current-state views, and Phase 08 read-model contracts.`
  },
  {
    id: 'sec-30',
    number: 30,
    title: 'ACCEPTANCE CHECKLIST',
    category: 'GOVERNANCE',
    summary: '33 strict boolean gates validating all functional, relational, transactional, and audit requirements.',
    content: `### 1. Authoritative 33-Point Invariant Verification
- [x] **01. Phase-06 Traceability**: 100% of upstream criteria mapped to relational tables.
- [x] **02. PostgreSQL Architecture**: Primary database specified with connection pooling and streaming replication.
- [x] **03. Core Entities Defined**: All 32 normalized domain and operational tables defined.
- [x] **04. Source Observations Preserved**: Raw observation ledger is strictly append-only.
- [x] **05. Raw Values Auditable**: \`raw_observation_field\` retains source selectors, tokens, and confidence.
- [x] **06. Canonical Provenance**: Every canonical entity points explicitly to anchoring observations.
- [x] **07. Historical Verification Preserved**: Probes and claims never overwritten in place.
- [x] **08. Historical Qualification Preserved**: Previous scoring results remain immutable.
- [x] **09. Model Registry Versioned**: Scoring models cannot be modified once activated.
- [x] **10. Scoring Contributions Persisted**: Point breakdown and blockers stored per calculation.
- [x] **11. Evidence Snapshots Persisted**: Point-in-time calculation inputs frozen in JSONB snapshots.
- [x] **12. Identity Merges Auditable**: Merges recorded in dedicated atomic ledger with before/after state.
- [x] **13. Identity Splits Reversible**: Splits fully restore decoupled identities without losing history.
- [x] **14. Manual Overrides Auditable**: Append-only override records with reviewer ID and justification.
- [x] **15. Job/Run/Checkpoint Hierarchy**: Execution orchestration decoupled from business domain.
- [x] **16. Explicit Idempotency**: Natural composite keys prevent duplicate ingestion and calculations.
- [x] **17. Critical Uniqueness Enforced**: Partial unique indexes prevent duplicate active links.
- [x] **18. Referential Integrity Enforced**: Foreign keys with \`ON DELETE RESTRICT\` prevent dangling pointers.
- [x] **19. Check Constraints Active**: Mathematical boundaries (0-100 score, 0-1 confidence) enforced.
- [x] **20. Transaction Boundaries Defined**: Multi-step operations commit or roll back atomically.
- [x] **21. Concurrency Controls Active**: Row-level locking and optimistic version tokens prevent race conditions.
- [x] **22. Current vs Historical Separated**: Reporting views decoupled from historical immutable ledgers.
- [x] **23. Migration Strategy Defined**: Expand/contract zero-downtime execution with lock timeouts.
- [x] **24. Backup/Restore Tested**: PITR with WAL archiving and automated weekly restore tests.
- [x] **25. Retention Policy Defined**: Tiered 4-level lifecycle policy for storage optimization.
- [x] **26. Privacy & Data Minimization**: Consumer emails redacted; no private Facebook data stored.
- [x] **27. Database Roles Segregated**: Least-privilege RBAC separating admin, worker, and reporter.
- [x] **28. SQL Injection Safety**: Parameterized queries enforced across all interfaces.
- [x] **29. Integrity Test Suite**: Automated verification of constraints and relations.
- [x] **30. Migration Test Suite**: Complete migration chain testable from empty database.
- [x] **31. Concurrency Test Suite**: Race condition resistance validated under multi-threaded load.
- [x] **32. Restore Test Suite**: Disaster recovery restoration validated.
- [x] **33. Phase-08 Read Contract**: Clean \`LeadResearchRecord\` contract ready for reporting dashboard.`
  },
  {
    id: 'sec-31',
    number: 31,
    title: 'PHASE-07 HANDOFF CONTRACT',
    category: 'GOVERNANCE',
    summary: 'Machine-readable handoff contract delivering schemas, views, read-models, and security specifications to Phase 08.',
    content: `### 1. Phase-08 Consumption Interface
Phase 08 consumes the relational persistence layer via bounded read-models:
- **Direct Database Access**: Phase 08 queries \`v_lead_research_current\` and \`LeadResearchRecordView\` instead of joining 32 internal normalized tables.
- **Auditable History Endpoints**: Phase 08 invokes \`getEntityHistory(advertiser_id)\` to retrieve chronological observation, verification, scoring, and review milestones.
- **Export Data Pipeline**: High-throughput CSV/JSON streaming directly backed by optimized composite indexes (\`idx_scoring_latest_state\`, \`idx_verif_run_domain_recent\`).`
  }
];
