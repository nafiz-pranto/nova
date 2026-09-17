import { SectionItem, StateTransition, ContractDefinition, DatabaseTable } from '../types';

export const SPEC_SECTIONS: SectionItem[] = [
  { id: 'adr', number: 1, title: 'Architecture Decision Record (ADR)', subtitle: 'Foundational architectural decisions, bounds & invariants', category: 'core' },
  { id: 'system-architecture', number: 2, title: 'System Architecture', subtitle: 'Context, containers, and boundary isolation', category: 'architecture' },
  { id: 'responsibility-matrix', number: 3, title: 'Component Responsibility Matrix', subtitle: 'Strict separation of concerns across tiers', category: 'architecture' },
  { id: 'domain-model', number: 4, title: 'Domain Model (Entity-Centric)', subtitle: 'Decoupling Advertisers, Ads, Observations & Leads', category: 'data' },
  { id: 'data-flow', number: 5, title: 'End-to-End Data Flow', subtitle: 'Acquisition to normalization, persistence & export', category: 'data' },
  { id: 'state-machines', number: 6, title: 'Job / Run State Machine', subtitle: 'Deterministic transitions & non-circumvention guards', category: 'core' },
  { id: 'browser-worker', number: 7, title: 'Browser Worker Architecture', subtitle: 'Isolated headless Chromium runtime via Playwright', category: 'architecture' },
  { id: 'meta-adapter', number: 8, title: 'Meta Ad Library Adapter Boundary', subtitle: 'Encapsulated selectors, DOM queries & change detection', category: 'architecture' },
  { id: 'internal-contracts', number: 9, title: 'Internal Contracts & Schemas', subtitle: 'Strict schema-first IPC/RPC message specifications', category: 'core' },
  { id: 'database-architecture', number: 10, title: 'Database Architecture (PostgreSQL)', subtitle: 'Transactional schemas, idempotency keys & provenance', category: 'data' },
  { id: 'verification-architecture', number: 11, title: 'Verification Architecture', subtitle: 'Safe public website resolution & strict SSRF defense', category: 'architecture' },
  { id: 'qualification-architecture', number: 12, title: 'Qualification & Scoring Engine', subtitle: 'Pluggable multi-signal lead scoring model', category: 'core' },
  { id: 'extension-dashboard', number: 13, title: 'Extension & Dashboard Architecture', subtitle: 'Manifest V3 client decoupled from automation core', category: 'architecture' },
  { id: 'security-threat-model', number: 14, title: 'Security Threat Model', subtitle: 'STRIDE analysis, SSRF barriers & export sanitization', category: 'security' },
  { id: 'privacy-data-governance', number: 15, title: 'Privacy & Data Governance', subtitle: 'Public data boundary & data minimization rules', category: 'security' },
  { id: 'observability', number: 16, title: 'Observability & Telemetry', subtitle: 'Structured logs, metrics, alerts & drift detection', category: 'operations' },
  { id: 'reliability-recovery', number: 17, title: 'Reliability & Recovery Model', subtitle: 'Idempotent checkpoints, crash isolation & budgets', category: 'operations' },
  { id: 'testing-strategy', number: 18, title: 'Testing Strategy & Golden Fixtures', subtitle: 'Pyramid, mock browser DOM fixtures & regression', category: 'operations' },
  { id: 'cicd-deployment', number: 19, title: 'CI/CD & Deployment Topology', subtitle: 'Multi-stage delivery, Docker containers & health probes', category: 'operations' },
  { id: 'repository-blueprint', number: 20, title: 'Repository Blueprint', subtitle: 'Monorepo workspace layout & strict dependency rules', category: 'architecture' },
  { id: 'technology-decision-table', number: 21, title: 'Technology Decision Table', subtitle: 'Evaluations, trade-offs, selected vs rejected stacks', category: 'core' },
  { id: 'open-risks-assumptions', number: 22, title: 'Open Risks & Assumptions', subtitle: 'Explicit platform risks, drift mitigations & bounds', category: 'security' },
  { id: 'acceptance-checklist', number: 23, title: 'Architectural Acceptance Checklist', subtitle: 'Validation of all 26 mandatory acceptance constraints', category: 'core' },
  { id: 'handoff-contract', number: 24, title: 'Phase-01 Handoff Contract', subtitle: 'Machine-readable JSON specification consumed by Phase 02', category: 'handoff' },
];

export const STATE_TRANSITIONS: StateTransition[] = [
  { from: 'CREATED', to: 'QUEUED', trigger: 'Job queued into persistent broker', guard: 'Valid Job Payload & Idempotency Key' },
  { from: 'QUEUED', to: 'STARTING', trigger: 'Worker claims job & acquires browser lease', guard: 'Worker Health Healthy & Concurrency < Max' },
  { from: 'QUEUED', to: 'CANCELLED', trigger: 'Operator cancels job before execution', guard: 'Authorized user token' },
  { from: 'STARTING', to: 'NAVIGATING', trigger: 'Chromium context spawned & base URL requested', guard: 'Browser init success' },
  { from: 'STARTING', to: 'FAILED', trigger: 'Browser spawn timeout or process crash', guard: 'Retry budget exhausted' },
  { from: 'NAVIGATING', to: 'COLLECTING', trigger: 'Public Ad Library page loaded and search initialized', guard: 'Page state validated & search container present' },
  { from: 'NAVIGATING', to: 'CHALLENGED', trigger: 'Security verification or challenge detected', guard: 'Challenge detector triggers' },
  { from: 'NAVIGATING', to: 'BLOCKED', trigger: 'Explicit HTTP 403/429/Access Block rendered', guard: 'Block signature detected' },
  { from: 'NAVIGATING', to: 'FAILED', trigger: 'Navigation timeout or DNS resolution failure', guard: 'Exhausted transient retries' },
  { from: 'COLLECTING', to: 'VALIDATING', trigger: 'Ad batch extracted from active DOM scroll position', guard: 'Raw records non-empty' },
  { from: 'COLLECTING', to: 'COMPLETED', trigger: 'Target ad count reached or end of scroll reached cleanly', guard: 'End-of-results sentinel verified' },
  { from: 'COLLECTING', to: 'CHALLENGED', trigger: 'Challenge modal/page encountered during extraction', guard: 'Non-circumvent policy: halt immediately' },
  { from: 'COLLECTING', to: 'BLOCKED', trigger: 'Block page encountered during extraction', guard: 'Non-circumvent policy: halt immediately' },
  { from: 'COLLECTING', to: 'PAUSED', trigger: 'Operator issues pause request or quota limit reached', guard: 'Graceful pause token' },
  { from: 'VALIDATING', to: 'CHECKPOINTING', trigger: 'Records normalized and validated through level A-E schemas', guard: 'Zero unhandled validation errors' },
  { from: 'VALIDATING', to: 'FAILED', trigger: 'Schema change detector triggers (drift detected)', guard: 'Unexpected UI state threshold exceeded' },
  { from: 'CHECKPOINTING', to: 'COLLECTING', trigger: 'Batch written to Postgres with cursor state updated', guard: 'DB transaction committed' },
  { from: 'CHECKPOINTING', to: 'PARTIAL', trigger: 'Max items reached without reaching end of search', guard: 'Target limit reached' },
  { from: 'PAUSED', to: 'QUEUED', trigger: 'Operator resumes paused job with persisted checkpoint', guard: 'Checkpoint state valid' },
  { from: 'CHALLENGED', to: 'PAUSED', trigger: 'Recorded state, operator notified, checkpoint frozen', guard: 'Never automated: requires human operator review' },
  { from: 'BLOCKED', to: 'FAILED', trigger: 'Blocked run persisted with provenance, alerts sent', guard: 'Never rotate IPs or bypass' },
];

export const CONTRACT_LIST: ContractDefinition[] = [
  {
    name: 'CreateJob',
    version: '1.0.0',
    purpose: 'Accept a public research job with search query, filters, target limits, and execution policies.',
    idempotency: 'Enforced via client-generated idempotency_key (UUIDv4) stored in scrape_jobs.',
    requestSchema: {
      type: 'object',
      required: ['idempotency_key', 'search_query', 'country_code', 'ad_type', 'max_ads'],
      properties: {
        idempotency_key: { type: 'string', format: 'uuid' },
        search_query: { type: 'string', minLength: 1, maxLength: 250 },
        country_code: { type: 'string', pattern: '^[A-Z]{2}$', default: 'ALL' },
        ad_type: { type: 'string', enum: ['ALL_ADS', 'POLITICAL_AND_ISSUE_ADS'] },
        advertiser_page_id: { type: 'string', nullable: true },
        max_ads: { type: 'integer', minimum: 1, maximum: 5000 },
        enable_landing_verification: { type: 'boolean', default: false },
        scoring_profile_id: { type: 'string', default: 'default_b2b_v1' }
      }
    },
    responseSchema: {
      type: 'object',
      required: ['job_id', 'status', 'created_at'],
      properties: {
        job_id: { type: 'string', format: 'uuid' },
        status: { type: 'string', enum: ['CREATED', 'QUEUED'] },
        created_at: { type: 'string', format: 'date-time' }
      }
    },
    errorBehavior: 'Returns 400 Bad Request on malformed inputs; returns 409 Conflict with existing job_id if idempotency_key matches.'
  },
  {
    name: 'StartRun',
    version: '1.0.0',
    purpose: 'Worker claims a queued job or checkpoint, launching an isolated Chromium execution run.',
    idempotency: 'Worker lease with TTL and monotonic lease tokens.',
    requestSchema: {
      type: 'object',
      required: ['run_id', 'job_id', 'worker_id', 'adapter_version', 'checkpoint'],
      properties: {
        run_id: { type: 'string', format: 'uuid' },
        job_id: { type: 'string', format: 'uuid' },
        worker_id: { type: 'string' },
        adapter_version: { type: 'string' },
        checkpoint: { type: 'object', nullable: true }
      }
    },
    responseSchema: {
      type: 'object',
      required: ['run_id', 'status', 'lease_expires_at'],
      properties: {
        run_id: { type: 'string', format: 'uuid' },
        status: { type: 'string', enum: ['STARTING', 'NAVIGATING'] },
        lease_expires_at: { type: 'string', format: 'date-time' }
      }
    },
    errorBehavior: 'Rejects execution if job is already in terminal state or claimed by active lease.'
  },
  {
    name: 'BatchExtractedRecords',
    version: '1.0.0',
    purpose: 'Worker transmits a batch of extracted public ad records with raw provenance to the ingestion pipeline.',
    idempotency: 'Deduplicated at database level by (run_id, batch_sequence) and ad library ID.',
    requestSchema: {
      type: 'object',
      required: ['run_id', 'batch_sequence', 'records', 'observed_at'],
      properties: {
        run_id: { type: 'string', format: 'uuid' },
        batch_sequence: { type: 'integer', minimum: 1 },
        observed_at: { type: 'string', format: 'date-time' },
        records: {
          type: 'array',
          items: {
            type: 'object',
            required: ['ad_library_id', 'advertiser_name', 'ad_text', 'first_seen_text', 'public_page_url'],
            properties: {
              ad_library_id: { type: 'string', pattern: '^[0-9]+$' },
              advertiser_name: { type: 'string' },
              advertiser_page_id: { type: 'string', nullable: true },
              ad_text: { type: 'string' },
              headline: { type: 'string', nullable: true },
              cta_text: { type: 'string', nullable: true },
              destination_url: { type: 'string', format: 'uri', nullable: true },
              first_seen_text: { type: 'string' },
              platforms_listed: { type: 'array', items: { type: 'string' } },
              provenance: { type: 'object' }
            }
          }
        }
      }
    },
    responseSchema: {
      type: 'object',
      required: ['run_id', 'batch_sequence', 'accepted_count', 'duplicate_count', 'rejected_count'],
      properties: {
        run_id: { type: 'string', format: 'uuid' },
        batch_sequence: { type: 'integer' },
        accepted_count: { type: 'integer' },
        duplicate_count: { type: 'integer' },
        rejected_count: { type: 'integer' }
      }
    },
    errorBehavior: 'Atomic ingestion failure rolls back batch; worker will retry from last confirmed checkpoint.'
  },
  {
    name: 'ChallengeDetected',
    version: '1.0.0',
    purpose: 'Immediately notifies orchestrator of anti-bot challenge or security block page. Triggers instant halt without bypass.',
    idempotency: 'Idempotent state update; sets run state to CHALLENGED or BLOCKED.',
    requestSchema: {
      type: 'object',
      required: ['run_id', 'challenge_type', 'detected_at', 'evidence_hash'],
      properties: {
        run_id: { type: 'string', format: 'uuid' },
        challenge_type: { type: 'string', enum: ['CAPTCHA_DETECTED', 'RATE_LIMIT_PAGE', 'LOGIN_REQUIRED', 'IP_BLOCK_PAGE', 'UNKNOWN_SECURITY_CHALLENGE'] },
        detected_at: { type: 'string', format: 'date-time' },
        page_title: { type: 'string' },
        evidence_hash: { type: 'string' },
        last_checkpoint: { type: 'object' }
      }
    },
    responseSchema: {
      type: 'object',
      required: ['action_taken', 'job_status'],
      properties: {
        action_taken: { type: 'string', enum: ['HALT_AND_FREEZE_CHECKPOINT'] },
        job_status: { type: 'string', enum: ['CHALLENGED', 'BLOCKED'] }
      }
    },
    errorBehavior: 'Terminal for current automated execution; emits high-priority alert to Sentry/PagerDuty and halts worker.'
  },
  {
    name: 'CheckpointUpdated',
    version: '1.0.0',
    purpose: 'Commits scroll depth, cursor tokens, processed counts, and DOM pagination markers.',
    idempotency: 'Monotonically increasing sequence number prevents stale updates.',
    requestSchema: {
      type: 'object',
      required: ['run_id', 'sequence_number', 'cursor_token', 'cumulative_count'],
      properties: {
        run_id: { type: 'string', format: 'uuid' },
        sequence_number: { type: 'integer' },
        cursor_token: { type: 'string' },
        cumulative_count: { type: 'integer' },
        timestamp: { type: 'string', format: 'date-time' }
      }
    },
    responseSchema: {
      type: 'object',
      required: ['acknowledged', 'sequence_number'],
      properties: {
        acknowledged: { type: 'boolean' },
        sequence_number: { type: 'integer' }
      }
    },
    errorBehavior: 'Stale sequence number returns HTTP 409 and instructs worker to resync state.'
  }
];

export const DATABASE_TABLES: DatabaseTable[] = [
  {
    name: 'advertisers',
    description: 'First-class business entity representing advertisers observed in the public Meta Ad Library.',
    primaryKey: 'id (UUIDv4)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', classification: 'DERIVED', description: 'Internal canonical ID' },
      { name: 'source_platform', type: 'VARCHAR(32)', constraints: 'NOT NULL DEFAULT \'META_AD_LIBRARY\'', classification: 'NORMALIZED', description: 'Origin ad platform' },
      { name: 'platform_page_id', type: 'VARCHAR(64)', constraints: 'UNIQUE NULLABLE', classification: 'PUBLIC_UI_OBSERVED', description: 'Public Meta Page ID if exposed' },
      { name: 'canonical_name', type: 'VARCHAR(255)', constraints: 'NOT NULL', classification: 'NORMALIZED_FROM_PUBLIC_DATA', description: 'Clean trimmed business name' },
      { name: 'observed_name_raw', type: 'TEXT', constraints: 'NOT NULL', classification: 'PUBLIC_UI_OBSERVED', description: 'Raw observed display name' },
      { name: 'profile_url', type: 'TEXT', constraints: 'NULLABLE', classification: 'PUBLIC_UI_OBSERVED', description: 'Public profile URL' },
      { name: 'first_observed_at', type: 'TIMESTAMPTZ', constraints: 'NOT NULL DEFAULT NOW()', classification: 'DERIVED', description: 'Initial observation timestamp' },
      { name: 'last_observed_at', type: 'TIMESTAMPTZ', constraints: 'NOT NULL DEFAULT NOW()', classification: 'DERIVED', description: 'Most recent scrape observation' },
      { name: 'identity_confidence', type: 'VARCHAR(24)', constraints: 'NOT NULL DEFAULT \'STRONG\'', classification: 'DERIVED', description: 'EXACT, STRONG, PROBABLE, UNCERTAIN' }
    ],
    indices: [
      'CREATE UNIQUE INDEX idx_advertisers_page_id ON advertisers(platform_page_id) WHERE platform_page_id IS NOT NULL',
      'CREATE INDEX idx_advertisers_canonical_name ON advertisers(canonical_name)',
      'CREATE INDEX idx_advertisers_last_observed ON advertisers(last_observed_at DESC)'
    ]
  },
  {
    name: 'ads',
    description: 'Individual advertisement creatives with Ad Library ID, copy, and destination links.',
    primaryKey: 'id (UUIDv4)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', classification: 'DERIVED', description: 'Internal canonical ad record ID' },
      { name: 'ad_library_id', type: 'VARCHAR(64)', constraints: 'NOT NULL UNIQUE', classification: 'PUBLIC_UI_OBSERVED', description: 'Exact public Ad Library identifier (Level 1 Identity)' },
      { name: 'advertiser_id', type: 'UUID', constraints: 'NOT NULL REFERENCES advertisers(id)', classification: 'DERIVED', description: 'Foreign key to advertiser' },
      { name: 'ad_text_raw', type: 'TEXT', constraints: 'NULLABLE', classification: 'PUBLIC_UI_OBSERVED', description: 'Raw primary ad copy' },
      { name: 'ad_text_clean', type: 'TEXT', constraints: 'NULLABLE', classification: 'NORMALIZED_FROM_PUBLIC_DATA', description: 'Trimmed, normalized ad copy' },
      { name: 'headline', type: 'VARCHAR(512)', constraints: 'NULLABLE', classification: 'PUBLIC_UI_OBSERVED', description: 'Card title or headline' },
      { name: 'cta_type', type: 'VARCHAR(64)', constraints: 'NULLABLE', classification: 'NORMALIZED_FROM_PUBLIC_DATA', description: 'Normalized call-to-action (e.g., LEARN_MORE)' },
      { name: 'destination_url_raw', type: 'TEXT', constraints: 'NULLABLE', classification: 'PUBLIC_UI_OBSERVED', description: 'Raw destination URL' },
      { name: 'destination_domain', type: 'VARCHAR(255)', constraints: 'NULLABLE', classification: 'NORMALIZED_FROM_PUBLIC_DATA', description: 'Clean host (e.g., acme.com)' },
      { name: 'start_date_observed', type: 'DATE', constraints: 'NULLABLE', classification: 'NORMALIZED_FROM_PUBLIC_DATA', description: 'Publicly listed start date' },
      { name: 'platforms_json', type: 'JSONB', constraints: 'NOT NULL DEFAULT \'[]\'', classification: 'NORMALIZED_FROM_PUBLIC_DATA', description: 'FB, IG, Messenger, Audience Network' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'NOT NULL DEFAULT NOW()', classification: 'DERIVED', description: 'Record insertion time' }
    ],
    indices: [
      'CREATE UNIQUE INDEX idx_ads_ad_library_id ON ads(ad_library_id)',
      'CREATE INDEX idx_ads_advertiser_id ON ads(advertiser_id)',
      'CREATE INDEX idx_ads_destination_domain ON ads(destination_domain)'
    ]
  },
  {
    name: 'ad_observations',
    description: 'Temporal append-only audit trail recording every time an ad is seen in a scrape run.',
    primaryKey: 'id (UUIDv4)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', classification: 'DERIVED', description: 'Observation ID' },
      { name: 'ad_id', type: 'UUID', constraints: 'NOT NULL REFERENCES ads(id)', classification: 'DERIVED', description: 'Associated Ad record' },
      { name: 'run_id', type: 'UUID', constraints: 'NOT NULL REFERENCES scrape_runs(id)', classification: 'DERIVED', description: 'Associated Scrape Run' },
      { name: 'observed_at', type: 'TIMESTAMPTZ', constraints: 'NOT NULL DEFAULT NOW()', classification: 'DERIVED', description: 'Time observed on DOM' },
      { name: 'batch_sequence', type: 'INTEGER', constraints: 'NOT NULL', classification: 'DERIVED', description: 'Worker batch number' },
      { name: 'dom_position', type: 'INTEGER', constraints: 'NULLABLE', classification: 'DERIVED', description: 'Ordinal position in search results' },
      { name: 'raw_payload_hash', type: 'CHAR(64)', constraints: 'NOT NULL', classification: 'DERIVED', description: 'SHA-256 of extracted raw object' }
    ],
    indices: [
      'CREATE INDEX idx_observations_ad_run ON ad_observations(ad_id, run_id)',
      'CREATE INDEX idx_observations_run_id ON ad_observations(run_id)'
    ]
  },
  {
    name: 'landing_entities',
    description: 'Business destination entity resolved from destination URL. Target of verification.',
    primaryKey: 'id (UUIDv4)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', classification: 'DERIVED', description: 'Entity ID' },
      { name: 'advertiser_id', type: 'UUID', constraints: 'NOT NULL REFERENCES advertisers(id)', classification: 'DERIVED', description: 'Associated Advertiser' },
      { name: 'canonical_domain', type: 'VARCHAR(255)', constraints: 'NOT NULL', classification: 'NORMALIZED_FROM_PUBLIC_DATA', description: 'Normalized root domain' },
      { name: 'raw_landing_url', type: 'TEXT', constraints: 'NOT NULL', classification: 'PUBLIC_UI_OBSERVED', description: 'Original ad link URL' },
      { name: 'final_redirect_url', type: 'TEXT', constraints: 'NULLABLE', classification: 'DERIVED', description: 'URL after safe public redirects' },
      { name: 'verification_status', type: 'VARCHAR(32)', constraints: 'NOT NULL DEFAULT \'PENDING\'', classification: 'DERIVED', description: 'PENDING, VERIFIED, FAILED, BLOCKED_SSRF' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', constraints: 'NOT NULL DEFAULT NOW()', classification: 'DERIVED', description: 'Last state change' }
    ],
    indices: [
      'CREATE UNIQUE INDEX idx_landing_advertiser_domain ON landing_entities(advertiser_id, canonical_domain)',
      'CREATE INDEX idx_landing_domain ON landing_entities(canonical_domain)'
    ]
  },
  {
    name: 'lead_qualifications',
    description: 'Evaluated qualification tier, scores, individual signals, and rationale for a business lead.',
    primaryKey: 'id (UUIDv4)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', classification: 'DERIVED', description: 'Qualification record ID' },
      { name: 'advertiser_id', type: 'UUID', constraints: 'NOT NULL REFERENCES advertisers(id)', classification: 'DERIVED', description: 'Evaluated business' },
      { name: 'score', type: 'NUMERIC(5,2)', constraints: 'NOT NULL', classification: 'DERIVED', description: 'Composite score 0.00 to 100.00' },
      { name: 'qualification_tier', type: 'VARCHAR(32)', constraints: 'NOT NULL', classification: 'DERIVED', description: 'TIER_1_HOT, TIER_2_WARM, TIER_3_COLD, DISQUALIFIED' },
      { name: 'score_version', type: 'VARCHAR(32)', constraints: 'NOT NULL', classification: 'DERIVED', description: 'Scoring algorithm version' },
      { name: 'signals_json', type: 'JSONB', constraints: 'NOT NULL', classification: 'DERIVED', description: 'Ad volume, CTA variety, longevity, domain validity' },
      { name: 'rationale', type: 'TEXT', constraints: 'NOT NULL', classification: 'DERIVED', description: 'Transparent human-readable breakdown' },
      { name: 'evaluated_at', type: 'TIMESTAMPTZ', constraints: 'NOT NULL DEFAULT NOW()', classification: 'DERIVED', description: 'Scoring timestamp' }
    ],
    indices: [
      'CREATE INDEX idx_qual_advertiser_tier ON lead_qualifications(advertiser_id, qualification_tier)',
      'CREATE INDEX idx_qual_score ON lead_qualifications(score DESC)'
    ]
  },
  {
    name: 'scrape_jobs',
    description: 'Master definition of a research job created by user or schedule.',
    primaryKey: 'id (UUIDv4)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', classification: 'DERIVED', description: 'Job ID' },
      { name: 'idempotency_key', type: 'VARCHAR(64)', constraints: 'NOT NULL UNIQUE', classification: 'DERIVED', description: 'Client idempotency token' },
      { name: 'search_query', type: 'VARCHAR(255)', constraints: 'NOT NULL', classification: 'DERIVED', description: 'Target search terms' },
      { name: 'country_code', type: 'VARCHAR(8)', constraints: 'NOT NULL', classification: 'DERIVED', description: 'Country filter' },
      { name: 'status', type: 'VARCHAR(32)', constraints: 'NOT NULL DEFAULT \'CREATED\'', classification: 'DERIVED', description: 'Current FSM State' },
      { name: 'target_count', type: 'INTEGER', constraints: 'NOT NULL', classification: 'DERIVED', description: 'Target max ads to collect' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'NOT NULL DEFAULT NOW()', classification: 'DERIVED', description: 'Creation time' },
      { name: 'completed_at', type: 'TIMESTAMPTZ', constraints: 'NULLABLE', classification: 'DERIVED', description: 'Completion time' }
    ],
    indices: [
      'CREATE UNIQUE INDEX idx_jobs_idempotency ON scrape_jobs(idempotency_key)',
      'CREATE INDEX idx_jobs_status ON scrape_jobs(status)'
    ]
  },
  {
    name: 'scrape_runs',
    description: 'Concrete execution attempts of a job by a browser worker.',
    primaryKey: 'id (UUIDv4)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', classification: 'DERIVED', description: 'Run ID' },
      { name: 'job_id', type: 'UUID', constraints: 'NOT NULL REFERENCES scrape_jobs(id)', classification: 'DERIVED', description: 'Parent Job' },
      { name: 'worker_id', type: 'VARCHAR(64)', constraints: 'NOT NULL', classification: 'DERIVED', description: 'Worker instance ID' },
      { name: 'adapter_version', type: 'VARCHAR(32)', constraints: 'NOT NULL', classification: 'DERIVED', description: 'Meta adapter version' },
      { name: 'schema_version', type: 'VARCHAR(32)', constraints: 'NOT NULL', classification: 'DERIVED', description: 'Ingestion schema version' },
      { name: 'status', type: 'VARCHAR(32)', constraints: 'NOT NULL DEFAULT \'STARTING\'', classification: 'DERIVED', description: 'Current run status' },
      { name: 'items_collected', type: 'INTEGER', constraints: 'NOT NULL DEFAULT 0', classification: 'DERIVED', description: 'Accepted count' },
      { name: 'block_state', type: 'VARCHAR(32)', constraints: 'NULLABLE', classification: 'DERIVED', description: 'CAPTCHA, 403, 429, etc.' },
      { name: 'checkpoint_state', type: 'JSONB', constraints: 'NULLABLE', classification: 'DERIVED', description: 'Cursor & scroll state' },
      { name: 'started_at', type: 'TIMESTAMPTZ', constraints: 'NOT NULL DEFAULT NOW()', classification: 'DERIVED', description: 'Run start' },
      { name: 'ended_at', type: 'TIMESTAMPTZ', constraints: 'NULLABLE', classification: 'DERIVED', description: 'Run termination' }
    ],
    indices: [
      'CREATE INDEX idx_runs_job_status ON scrape_runs(job_id, status)',
      'CREATE INDEX idx_runs_worker ON scrape_runs(worker_id)'
    ]
  }
];

export const PHASE_01_HANDOFF_JSON = {
  phase: 1,
  status: "architecture_defined",
  architecture_version: "1.0.0-strict-prod",
  specification_timestamp: "2026-09-16T01:25:00Z",
  repository_blueprint: [
    { path: "apps/dashboard", role: "Operator UI (React + Vite)", allowed_deps: ["packages/contracts", "packages/domain"], forbidden_deps: ["packages/browser-worker", "playwright"] },
    { path: "apps/browser-worker", role: "Isolated Playwright Chromium Execution Node", allowed_deps: ["packages/contracts", "packages/meta-adapter", "packages/observability"], forbidden_deps: ["apps/dashboard", "packages/database"] },
    { path: "apps/orchestrator", role: "Job Scheduling, Queue Management, FSM Ingestion", allowed_deps: ["packages/contracts", "packages/domain", "packages/database", "packages/verification", "packages/scoring"], forbidden_deps: ["playwright", "packages/meta-adapter"] },
    { path: "packages/domain", role: "Pure Domain Entities, Aggregates & Rules", allowed_deps: [], forbidden_deps: ["playwright", "pg", "express"] },
    { path: "packages/contracts", role: "Zod / JSON Schemas for IPC/RPC Contracts", allowed_deps: ["zod"], forbidden_deps: ["playwright", "pg"] },
    { path: "packages/meta-adapter", role: "Isolated Meta DOM Selectors, Locators & Extraction", allowed_deps: ["packages/contracts", "playwright-core"], forbidden_deps: ["packages/database", "apps/dashboard"] },
    { path: "packages/normalization", role: "Pure Deterministic Field Normalizers", allowed_deps: [], forbidden_deps: ["playwright"] },
    { path: "packages/validation", role: "Levels A-E Data Quality & Semantic Validators", allowed_deps: ["packages/contracts"], forbidden_deps: ["playwright"] },
    { path: "packages/verification", role: "SSRF-Safe Public Website Verification Service", allowed_deps: ["packages/contracts"], forbidden_deps: ["playwright", "packages/meta-adapter"] },
    { path: "packages/scoring", role: "Pluggable Business Lead Qualification Engine", allowed_deps: ["packages/domain"], forbidden_deps: ["playwright"] },
    { path: "packages/database", role: "PostgreSQL Drizzle/Kysely Schemas & Migrations", allowed_deps: ["packages/domain"], forbidden_deps: ["playwright", "packages/meta-adapter"] },
    { path: "packages/observability", role: "Structured JSON Logger, OpenTelemetry Metrics & Alerts", allowed_deps: [], forbidden_deps: [] },
    { path: "tests/fixtures", role: "Deterministic Golden DOM Snapshots & Mock Server", allowed_deps: [], forbidden_deps: [] }
  ],
  services: [
    { name: "browser-worker", transport: "gRPC / HTTP Job Worker Contract", responsibility: "Executes headless Playwright session; emits raw extracted records and checkpoints; halts on challenge" },
    { name: "orchestrator", transport: "Redis BullMQ / PostgreSQL Job Queue", responsibility: "Maintains FSM state, receives batches, executes normalization, coordinates verification and persistence" },
    { name: "verification-service", transport: "Internal HTTP Microservice", responsibility: "Safely resolves destination domains with RFC1918 blocking, DNS validation, and timeout budgets" },
    { name: "dashboard-api", transport: "REST / Server-Sent Events", responsibility: "Exposes job monitoring, lead lists, review queue, and export generation" }
  ],
  interfaces: [
    "IBrowserWorker { executeJob(jobRequest): AsyncIterable<WorkerEvent> }",
    "IMetaAdapter { navigate(searchParams): Promise<NavigationState>; extractBatch(): Promise<RawAdBatch>; detectChallenge(): ChallengeType | null }",
    "INormalizer { normalize(raw: RawAdRecord): NormalizedAdRecord }",
    "IValidator { validate(record: NormalizedAdRecord): ValidationResult }",
    "IVerifier { verify(domain: string, rawUrl: string): Promise<VerificationOutcome> }",
    "ILeadScorer { score(advertiser: AdvertiserAggregate): QualificationResult }"
  ],
  domain_entities: [
    "Advertiser (Canonical identity, page ID, confidence)",
    "Ad (Ad Library ID, clean copy, CTA, domain)",
    "AdObservation (Temporal observation record, run ID, DOM index, hash)",
    "LandingEntity (Canonical domain, resolution status, verification evidence)",
    "LeadQualification (Score, tier, signals, transparent rationale)",
    "ScrapeJob (Master research request, criteria, target bounds)",
    "ScrapeRun (Specific worker attempt, cursor state, block state)",
    "ScrapeCheckpoint (Committed offset, idempotency sequence)",
    "SystemEvent (Error log, UI drift alert, telemetry event)"
  ],
  state_machines: [
    {
      name: "ScrapeJobFSM",
      states: ["CREATED", "QUEUED", "STARTING", "NAVIGATING", "COLLECTING", "VALIDATING", "CHECKPOINTING", "PAUSED", "BLOCKED", "CHALLENGED", "COMPLETED", "PARTIAL", "FAILED", "CANCELLED"],
      initial: "CREATED",
      terminals: ["COMPLETED", "PARTIAL", "FAILED", "CANCELLED"],
      immutable_rule: "A BLOCKED or CHALLENGED state MUST NOT automatically retry or transition back to COLLECTING without human review."
    }
  ],
  contracts: [
    "CreateJob v1.0.0",
    "GetJobStatus v1.0.0",
    "StartRun v1.0.0",
    "WorkerHeartbeat v1.0.0",
    "BatchExtractedRecords v1.0.0",
    "CheckpointUpdated v1.0.0",
    "ChallengeDetected v1.0.0",
    "RunCompleted v1.0.0",
    "RunFailed v1.0.0",
    "VerificationRequest v1.0.0",
    "QualificationRequest v1.0.0",
    "ExportRequest v1.0.0"
  ],
  database_entities: [
    "advertisers",
    "ads",
    "ad_observations",
    "landing_entities",
    "verification_results",
    "lead_qualifications",
    "scrape_jobs",
    "scrape_runs",
    "scrape_checkpoints",
    "export_jobs",
    "provenance_records"
  ],
  security_constraints: [
    "Zero bypass / Zero CAPTCHA solving / Zero proxy evasion.",
    "Strict SSRF defense: DNS resolution with CIDR filtering blocking 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16, and cloud metadata 169.254.169.254.",
    "Export CSV formula injection sanitization (prefixing =, +, -, @, \\t, \\r with single quote).",
    "No storage of browser cookies or session credentials in operational tables."
  ],
  privacy_constraints: [
    "Public Data Boundary strictly enforced: only PUBLIC_UI_OBSERVED data accepted.",
    "Data minimization: collect only business advertiser identity and public marketing copy.",
    "Reject and drop any private targeting, personal demographic profiles, or private personal data.",
    "Default retention policy: raw DOM snapshots purged after 30 days; audit logs retained 90 days."
  ],
  testing_requirements: [
    "100% unit test coverage on normalization, validation, and URL canonicalization.",
    "Deterministic golden DOM fixtures covering 10 distinct page states (multi-ad, empty, pagination, challenge, schema drift).",
    "No live Meta requests in automated CI pipelines.",
    "Contract testing between worker and orchestrator using pact/schema assertions."
  ],
  meta_adapter_boundary: {
    rule: "Meta-specific DOM selectors, CSS classes, and page interactions are 100% encapsulated inside packages/meta-adapter.",
    isolation_guarantee: "Replacing packages/meta-adapter requires ZERO changes to domain models, database, scoring, or dashboard.",
    drift_detection: "Empty result sets with missing end-of-results DOM sentinel must throw UI_CHANGE exception rather than returning 0 ads."
  },
  browser_worker_requirements: [
    "Headless Playwright + Chromium with deterministic timeout budgets.",
    "Locator-based queries with semantic role fallbacks (getByRole, getByText).",
    "No blind sleep() calls; use web-first assertions and auto-waiting.",
    "Explicit memory management: single browser context per job, garbage collected on completion.",
    "Instant process SIGTERM handling with checkpoint flushes within 5000ms."
  ],
  known_unknowns: [
    "Meta Ad Library continuous frontend DOM updates (requires versioned selector map).",
    "Rate of challenge presentation on public IP addresses (requires conservative pacing budgets: 3000ms minimum scroll interval).",
    "Regional variation in Ad Library UI layout across EU vs US (requires country-specific golden test fixtures)."
  ],
  risks: [
    { risk: "Meta UI structural redesign", impact: "HIGH", mitigation: "Drift detection alert halts run with UI_CHANGE error; Golden fixture suite isolates broken selector in <30 minutes" },
    { risk: "Public IP throttling / 429", impact: "MEDIUM", mitigation: "Deterministic exponential backoff; max 2 attempts; then safe pause and alert" },
    { risk: "SSRF vulnerability via malicious ad destination URLs", impact: "CRITICAL", mitigation: "Dedicated verification proxy with pre-flight DNS pinning and private subnet firewall" }
  ],
  decisions: [
    "Monorepo selected with pnpm workspaces for strict boundary enforcement.",
    "PostgreSQL selected as primary ACID transactional store with JSONB support.",
    "Playwright chosen for Locator API, auto-waiting, and process reliability.",
    "Zod chosen for type-safe runtime contract validation."
  ],
  phase_2_required_inputs: [
    "Implement packages/meta-adapter with versioned selector registry.",
    "Implement apps/browser-worker runtime daemon consuming StartRun contract.",
    "Build golden fixture replay harness using Playwright route interception.",
    "Provide verified DOM contract assertions for Meta Ad Library search results container."
  ]
};
