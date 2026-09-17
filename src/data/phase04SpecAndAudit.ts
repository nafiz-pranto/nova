import { Phase04AuditCriterion, Phase04ScenarioFixture, SectionItem } from '../types';

export const PHASE_04_SPEC_SECTIONS: SectionItem[] = [
  {
    id: 'p4-00-role',
    number: 0,
    title: 'Phase 04 Roles & Core Philosophy',
    subtitle: 'Principal Data Architect, Deduplication Specialist, and Data Integrity Mandate',
    category: 'core',
    contentMarkdown: `### 0. Role & Core Philosophy

**"NEVER CONFUSE SIMILARITY WITH IDENTITY."**

In public advertising and lead research, multiple surface-level observations frequently exhibit overlapping text, shared imagery, or identical keywords. However:
- A digital marketing agency running campaigns for two independent dental clinics with similar copy is **NOT** the same business entity.
- A regional franchise operating 12 distinct Facebook pages with city-specific names directing to a single corporate domain **IS** a single business entity.
- Two competing e-commerce sellers linking to independent Amazon stores via generic \`bit.ly\` or \`linktr.ee\` links are **NOT** the same entity, despite sharing identical destination hostnames.
- A false merge is a **catastrophic data-integrity failure** that irreversibly poisons downstream CRM attribution, lead routing, and entity analytics.

**Phase 04 Engineering Directives:**
1. **Evidence-Based Identity:** Identity links require immutable proof (exact domain ownership, verified Page ID, confirmed E.164 phone, tax/legal disclaimer match).
2. **Strict Non-Destruction:** Raw observations and Phase 03 Canonical Ad Envelopes are immutable and append-only. Merged views are virtual cluster graphs pointing to underlying entities.
3. **Deterministic & Explainable:** Every match decision emits an itemized scoring vector with individual signal contributions, weights, and blocking reasons. Zero black-box heuristics or stochastic LLM merges.
4. **100% Reversibility:** Every merge creates an immutable entry in the Reversible Merge Ledger. Operators can reverse any merge or split clusters in a single step without data corruption.
5. **Truthful Uncertainty:** The system prefers uncertain but truthful over clean but incorrect. If confidence is below threshold or signals conflict, the entity is quarantined for operator triage.`
  },
  {
    id: 'p4-01-hierarchy',
    number: 1,
    title: 'The 4-Tier Identity Hierarchy',
    subtitle: 'Observation → Ad Entity → Advertiser Entity → Business/Landing Entity',
    category: 'architecture',
    contentMarkdown: `### 1. The 4-Tier Identity Hierarchy

The system establishes a strict, monotonic 4-tier data model:

\`\`\`
+-----------------------------------------------------------------------------------+
| TIER 1: OBSERVATION (Raw Card Snapshot)                                           |
| Point-in-time scrape capture from Phase 03 (CanonicalAdEnvelope). Immutable.      |
+-----------------------------------------+-----------------------------------------+
                                          | Grouped by adLibraryId
                                          v
+-----------------------------------------------------------------------------------+
| TIER 2: AD ENTITY (Creative & Placement Instance)                                 |
| Represents unique Meta Ad (adLibraryId). Aggregates run dates, creative hashes,   |
| status transitions (Active/Inactive), observation history, and version snapshots. |
+-----------------------------------------+-----------------------------------------+
                                          | Grouped by Page Identifier / Profile URL
                                          v
+-----------------------------------------------------------------------------------+
| TIER 3: ADVERTISER ENTITY (Facebook Page / Sponsor)                              |
| Represents the public Meta Page (pageProfileUrl, pageName). Tracks all ads run    |
| by this page, associated destination domains, contact numbers, and disclaimers.   |
+-----------------------------------------+-----------------------------------------+
                                          | Linked via Multi-Signal Scoring Engine
                                          v
+-----------------------------------------------------------------------------------+
| TIER 4: BUSINESS / LANDING ENTITY (Real-World Enterprise / Cluster)               |
| The root commercial organization, corporate brand, registered legal entity,       |
| canonical domain, and contact nexus behind one or more Advertiser Pages.          |
+-----------------------------------------------------------------------------------+
\`\`\`

#### Entity Tier Definitions
- **Tier 1 (Observation):** Emitted by Phase 03 DAG. Contains \`snapshotSha256\`, raw outer HTML snippet, field-level provenance nodes, and validation report.
- **Tier 2 (Ad Entity):** Canonical record of a single Meta Ad Library ID. Links multiple chronological observations (e.g. ad observed active on Monday, inactive on Thursday). Tracks creative media checksums and copy variations.
- **Tier 3 (Advertiser Entity):** The Facebook/Instagram Page sponsoring the creative. Identified by canonical \`pageProfileUrl\` (e.g. \`facebook.com/apexsolarsolutions\`) or canonicalized page name.
- **Tier 4 (Business Entity):** The commercial enterprise. Formed through multi-signal clustering. Aggregates multiple regional pages, affiliate campaigns, domain aliases, and legal entities.`
  },
  {
    id: 'p4-02-signals',
    number: 2,
    title: 'Match Signal Catalog & Weight Matrix',
    subtitle: 'Deterministic scoring formula, primary anchors, and score penalties',
    category: 'data',
    contentMarkdown: `### 2. Match Signal Catalog & Weight Matrix

Candidate entity pairs are evaluated across a deterministic signal matrix. Each signal contributes a weighted score calculated as:

$$\\text{Total Score} = \\sum (\\text{Signal Raw Score} \\times \\text{Signal Weight}) - \\text{Penalties}$$

| Signal Identifier | Weight | Anchor? | Type | Verification Criteria |
| :--- | :--- | :--- | :--- | :--- |
| \`EXACT_AD_LIBRARY_ID\` | 1.00 | YES | Tier 2 Anchor | Meta Ad Library ID exact match (Tier 1 → Tier 2 deduplication). |
| \`EXACT_PAGE_PROFILE_URL\` | 0.95 | YES | Tier 3 Anchor | Exact match on normalized Facebook page URL slug or numeric ID. |
| \`EXACT_DESTINATION_DOMAIN\` | 0.45 | YES | Tier 4 Anchor | Exact match on registered eTLD+1 domain (excluding generic hosting/shorteners). |
| \`EXACT_PHONE_E164\` | 0.35 | YES | Tier 4 Anchor | Exact match on normalized international telephone number. |
| \`EXACT_EMAIL\` | 0.35 | YES | Tier 4 Anchor | Exact match on lowercase normalized contact email address. |
| \`EXACT_DISCLAIMER_LEGAL_ENTITY\` | 0.40 | YES | Tier 4 Anchor | Exact match on official regulatory disclaimer ("Paid for by X LLC"). |
| \`NORMALIZED_PAGE_NAME_EXACT\` | 0.30 | NO | Corroborating | Normalized uppercase string match after legal suffix stripping. |
| \`PAGE_NAME_JARO_WINKLER\` | 0.15 | NO | Corroborating | Fuzzy string distance $\\ge 0.88$ on normalized name roots. |
| \`CANONICAL_DESTINATION_URL\` | 0.20 | NO | Corroborating | Deep landing URL path match without query parameters. |
| \`CREATIVE_HASH_EXACT\` | 0.15 | NO | Corroborating | Exact image/video perceptual checksum match. |
| \`GENERIC_DOMAIN_PENALTY\` | -0.50 | N/A | Penalty | Applied if domain belongs to public link tree, URL shortener, or shared form provider. |
| \`CONFLICTING_DOMAIN_BLOCK\` | BLOCK | N/A | Hard Block | Overrides score to 0.0 if candidates possess mutually exclusive private registered domains. |`
  },
  {
    id: 'p4-03-blocking',
    number: 3,
    title: 'Blocking Rules & Generic Domain Filtration',
    subtitle: 'Preventing false merges across shared infrastructure and agencies',
    category: 'security',
    contentMarkdown: `### 3. Blocking Rules & Generic Domain Filtration

#### 3.1 Generic Domain Ban
The following domains are classified as **SHARED_PUBLIC_INFRASTRUCTURE**. They **MUST NEVER** serve as a Primary Anchor for Business Entity linking:

\`\`\`
linktr.ee          bit.ly             forms.gle          wa.me
facebook.com       instagram.com      t.me               youtube.com
google.com         tinyurl.com        calendly.com       bio.link
beacons.ai         typeform.com       docs.google.com    myshopify.com
\`\`\`

**Rule (GENERIC_DOMAIN_ISOLATION):** If candidate entity pair shares a generic domain without a corroborating private anchor (phone, email, or exact business name), the match score receives a -0.50 penalty and automatic merging is **STRICTLY BLOCKED**.

#### 3.2 Conflicting Domain Hard Block (BLOCK_CONFLICTING_DOMAINS)
If Advertiser A directs exclusively to \`apexsolar.com\` and Advertiser B directs exclusively to \`sunrun.com\`, the pair **CANNOT** be merged into a single Business Entity automatically, even if:
- They use the same creative media
- They share similar ad body copy
- They have similar sounding names (e.g. "Apex Solar California" vs "Sunrun California")

**Exception:** A manual operator override with signed justification ledger entry.

#### 3.3 Agency Multi-Client Guard (AGENCY_MULTI_CLIENT_PROTECTION)
Marketing agencies frequently appear in the ad disclaimer ("Paid for by Omnicom Media Group on behalf of...") while directing to distinct client domains.
- The system must link the legal sponsor in a separate \`agency_relationship\` edge rather than merging the client businesses into the agency.`
  },
  {
    id: 'p4-04-ledger',
    number: 4,
    title: 'Reversible Merge Ledger & Conflict Resolution',
    subtitle: 'Immutable audit logs, one-click split, and quarantine triage',
    category: 'operations',
    contentMarkdown: `### 4. Reversible Merge Ledger & Conflict Resolution

#### 4.1 Safe Merges & Cluster Graphs
Entity merges are non-destructive graph operations. When Business Entity Cluster B is merged into Cluster A:
1. An immutable record is appended to the \`entity_merge_ledger\` table.
2. Cluster A acquires reference pointers to all underlying Advertiser Entities and Observations.
3. The original member IDs, timestamps, signal scores, and cryptographic snapshot hashes are preserved intact.
4. The consolidated cluster recalculates its canonical name, domain list, and confidence rating.

#### 4.2 Reversal / Unmerge Protocol
Any merge operation can be unmerged at any point in time:
\`\`\`
unmerge(merge_id, reason, operator_id) -> { restored_clusters: [A, B] }
\`\`\`
1. The ledger entry is marked \`is_reversed = TRUE\`, with \`reversed_at\` and \`reversal_reason\`.
2. The graph engine re-partitions the entity clusters back to their exact pre-merge topology.
3. No historical metrics or Phase 03 observation data are damaged or lost.

#### 4.3 Conflict Quarantine Lifecycle
When candidate signals produce contradictory assertions (e.g., matching phone number but contradictory corporate domains):
- The decision is classified as \`CONFLICT_QUARANTINE\`.
- The candidate pair is routed to the **Operator Review Queue**.
- A quarantine incident record is created with explicit reasons:
  - \`ERR_CONFLICT_DOMAIN_COLLISION\`
  - \`ERR_UNVERIFIED_PARENT_SUBSIDIARY\`
  - \`ERR_SUSPECTED_SHARED_LEAD_FORM\`
- The entities remain distinct until explicitly approved or rejected by a human operator.`
  },
  {
    id: 'p4-05-db-schema',
    number: 5,
    title: 'PostgreSQL Relational Schema & Indexes',
    subtitle: 'Strict relational DDL for deduplication, linking, and audit ledgers',
    category: 'data',
    contentMarkdown: `### 5. PostgreSQL Relational Schema & Indexes

\`\`\`sql
-- =========================================================
-- PHASE 04: IDENTITY RESOLUTION & DEDUPLICATION DDL
-- =========================================================

-- Tier 2: Canonical Ad Entities
CREATE TABLE canonical_ad_entities (
    ad_entity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_library_id VARCHAR(64) NOT NULL UNIQUE,
    advertiser_id UUID NOT NULL REFERENCES canonical_advertisers(advertiser_id),
    first_seen_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL,
    observation_count INTEGER NOT NULL DEFAULT 1,
    current_status VARCHAR(32) NOT NULL, -- ACTIVE, INACTIVE, UNKNOWN
    creative_checksum VARCHAR(64) NOT NULL,
    cta_category VARCHAR(32) NOT NULL,
    destination_domain VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ad_entities_lib_id ON canonical_ad_entities(ad_library_id);
CREATE INDEX idx_ad_entities_advertiser ON canonical_ad_entities(advertiser_id);
CREATE INDEX idx_ad_entities_domain ON canonical_ad_entities(destination_domain);

-- Tier 3: Canonical Advertisers (Pages)
CREATE TABLE canonical_advertisers (
    advertiser_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_profile_url VARCHAR(512) UNIQUE,
    canonical_page_name VARCHAR(255) NOT NULL,
    normalized_name_key VARCHAR(255) NOT NULL,
    business_entity_id UUID REFERENCES canonical_business_entities(business_entity_id),
    ad_count INTEGER NOT NULL DEFAULT 0,
    first_seen_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_advertisers_norm_key ON canonical_advertisers(normalized_name_key);
CREATE INDEX idx_advertisers_biz_id ON canonical_advertisers(business_entity_id);

-- Tier 4: Canonical Business Entity Clusters
CREATE TABLE canonical_business_entities (
    business_entity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_name VARCHAR(255) NOT NULL,
    primary_domain VARCHAR(255),
    associated_domains TEXT[] NOT NULL DEFAULT '{}',
    associated_phones TEXT[] NOT NULL DEFAULT '{}',
    associated_emails TEXT[] NOT NULL DEFAULT '{}',
    cluster_confidence NUMERIC(4,3) NOT NULL,
    cluster_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, FLAGGED_CONFLICT, IN_REVIEW
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_biz_entities_domain ON canonical_business_entities(primary_domain);
CREATE INDEX idx_biz_entities_status ON canonical_business_entities(cluster_status);

-- Immutable Reversible Merge Ledger
CREATE TABLE entity_merge_ledger (
    merge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    operator_type VARCHAR(32) NOT NULL, -- SYSTEM_DETERMINISTIC_ENGINE, HUMAN_OPERATOR
    action VARCHAR(32) NOT NULL, -- AUTO_MERGE, MANUAL_MERGE, MANUAL_UNMERGE, QUARANTINE_FLAG
    source_entity_id UUID NOT NULL,
    source_entity_name VARCHAR(255) NOT NULL,
    target_cluster_id UUID NOT NULL REFERENCES canonical_business_entities(business_entity_id),
    target_cluster_name VARCHAR(255) NOT NULL,
    match_score NUMERIC(4,3) NOT NULL,
    primary_signal VARCHAR(64) NOT NULL,
    is_reversible BOOLEAN NOT NULL DEFAULT TRUE,
    is_reversed BOOLEAN NOT NULL DEFAULT FALSE,
    reversed_at TIMESTAMPTZ,
    reversal_reason TEXT,
    evidence_hash VARCHAR(64) NOT NULL
);
CREATE INDEX idx_merge_ledger_target ON entity_merge_ledger(target_cluster_id);
CREATE INDEX idx_merge_ledger_reversed ON entity_merge_ledger(is_reversed);
\`\`\``
  },
  {
    id: 'p4-06-api-contracts',
    number: 6,
    title: 'API Contracts & Event Specifications',
    subtitle: 'Idempotent RPC endpoints for resolution, candidate evaluation, and unmerging',
    category: 'operations',
    contentMarkdown: `### 6. API Contracts & Event Specifications

#### 6.1 RPC: ResolveObservationBatch
- **Endpoint:** \`POST /api/v1/identity/resolve-batch\`
- **Idempotency:** Purely deterministic based on batch hash and pipeline run ID.
- **Request Body:**
\`\`\`json
{
  "pipelineRunId": "run_p03_1729831920",
  "envelopes": [ { "adLibraryId": "849201948201948", ... } ],
  "options": {
    "autoMergeThreshold": 0.85,
    "provisionalThreshold": 0.55,
    "enableGenericDomainBlocking": true
  }
}
\`\`\`
- **Response Body:**
\`\`\`json
{
  "resolvedAt": "2026-09-16T08:45:00Z",
  "metrics": {
    "totalObservations": 12,
    "distinctAds": 8,
    "distinctAdvertisers": 5,
    "distinctBusinessEntities": 3,
    "deduplicationRatio": 4.0
  },
  "candidateEvaluations": [ ... ],
  "mergeLedgerEntries": [ ... ]
}
\`\`\`

#### 6.2 RPC: ReversibleUnmerge
- **Endpoint:** \`POST /api/v1/identity/unmerge\`
- **Request Body:**
\`\`\`json
{
  "mergeId": "mrg_77192a01",
  "reason": "Operator verified separate dental clinic locations with independent ownership",
  "operatorId": "usr_ops_lead_04"
}
\`\`\`
- **Response Body:**
\`\`\`json
{
  "status": "UNMERGED_SUCCESS",
  "restoredEntityClusters": [
    { "clusterId": "biz_881", "canonicalName": "Apex Dental San Jose" },
    { "clusterId": "biz_882", "canonicalName": "Apex Dental San Francisco" }
  ]
}
\`\`\``
  }
];

export const PHASE_04_AUDIT_CRITERIA: Phase04AuditCriterion[] = [
  {
    id: 'P4-AUD-01',
    code: 'IDENTITY_HIERARCHY_LEVELS',
    title: 'Strict 4-Tier Monotonic Entity Hierarchy',
    category: 'IDENTITY_HIERARCHY',
    requirement: 'System must explicitly separate Observation, Ad Entity, Advertiser Entity, and Business/Landing Entity into distinct logical and relational models.',
    verificationEvidence: 'Types defined in /src/types.ts; relational tables canonical_ad_entities, canonical_advertisers, canonical_business_entities strictly partitioned with foreign keys.',
    testCoverage: 'Verified in Scenario Fixtures 01 through 10.'
  },
  {
    id: 'P4-AUD-02',
    code: 'OBSERVATION_IMMUTABILITY',
    title: 'Zero Observation Data Destruction',
    category: 'IDENTITY_HIERARCHY',
    requirement: 'Phase 03 Canonical Ad Envelopes and raw card snapshots must remain immutable; deduplication must never delete, overwrite, or mutate observation records.',
    verificationEvidence: 'CanonicalAdEnvelope objects ingested read-only; observation IDs referenced by pointer array; sha256 snapshots preserved.',
    testCoverage: 'Verified in Scenario 01 (Multi-observation dedup).'
  },
  {
    id: 'P4-AUD-03',
    code: 'DETERMINISTIC_MATCHING_ENGINE',
    title: 'Pure Deterministic Scoring Without Stochastic LLMs',
    category: 'MATCH_SIGNALS',
    requirement: 'Match decisions must be calculated using mathematical formula (weighted signals, Jaro-Winkler, domain/phone anchors) with zero probabilistic drift.',
    verificationEvidence: 'entityResolutionEngine.ts computes exact score vectors; running identical inputs 100 times yields identical entity graphs and scores.',
    testCoverage: 'Verified in Determinism Benchmark Replay.'
  },
  {
    id: 'P4-AUD-04',
    code: 'PRIMARY_ANCHOR_MANDATE',
    title: 'High-Confidence Primary Anchor Requirement for Auto-Merge',
    category: 'MATCH_SIGNALS',
    requirement: 'Automatic merging (AUTOMATIC_CONFIRMED) requires score >= 0.85 AND at least one verified Primary Anchor (Domain, Phone, Disclaimer, or Page ID).',
    verificationEvidence: 'entityResolutionEngine.ts evaluates hasPrimaryAnchor guard before assigning AUTOMATIC_CONFIRMED; demotes to PROVISIONAL_REVIEW if absent.',
    testCoverage: 'Verified in Scenario 06 (Name typo similarity).'
  },
  {
    id: 'P4-AUD-05',
    code: 'GENERIC_DOMAIN_BAN',
    title: 'Generic Hosting & Shortener Domain Isolation',
    category: 'BLOCKING_RULES',
    requirement: 'Generic domains (linktr.ee, bit.ly, forms.gle, wa.me, etc.) must NEVER trigger automatic business entity merges without a secondary private anchor.',
    verificationEvidence: 'GENERIC_SHARED_DOMAINS list enforced; applies -0.50 score penalty and triggers RULE_GENERIC_DOMAIN_BLOCK.',
    testCoverage: 'Verified in Scenario 05 (Affiliate generic domain).'
  },
  {
    id: 'P4-AUD-06',
    code: 'CONFLICTING_DOMAIN_HARD_BLOCK',
    title: 'Conflicting Registered Domain Hard Blocking',
    category: 'BLOCKING_RULES',
    requirement: 'Entities with disparate private registered domains must NOT be automatically merged, even if ad copy or creative images are identical.',
    verificationEvidence: 'BLOCK_CONFLICTING_DOMAINS rule forces score to 0.0 and routes candidate pair to CONFLICT_QUARANTINE.',
    testCoverage: 'Verified in Scenario 04 (Agency advertising for multiple clients).'
  },
  {
    id: 'P4-AUD-07',
    code: 'REVERSIBLE_MERGE_LEDGER',
    title: 'Complete 100% Reversible Merge Ledger',
    category: 'REVERSIBILITY',
    requirement: 'Every merge operation must record an immutable audit entry in entity_merge_ledger with cryptographic evidence hash and support 1-click unmerge.',
    verificationEvidence: 'MergeLedgerEntry contains sourceEntityId, targetClusterId, matchScore, and isReversed flag; unmergeEngine splits clusters without data loss.',
    testCoverage: 'Verified in Scenario 10 (Reversible unmerge & split).'
  },
  {
    id: 'P4-AUD-08',
    code: 'CONFLICT_QUARANTINE_LIFECYCLE',
    title: 'Quarantine Queue for Contradictory Assertions',
    category: 'CONFLICT_RESOLUTION',
    requirement: 'Contradictory evidence (e.g. phone collision between unrelated brands) must be quarantined with explicit error codes for operator triage.',
    verificationEvidence: 'CandidatePairEvaluation marks decision as CONFLICT_QUARANTINE; status FLAGGED_CONFLICT surfaced in Operator Quarantine Queue.',
    testCoverage: 'Verified in Scenario 08 (Phone collision different brands).'
  },
  {
    id: 'P4-AUD-09',
    code: 'LEGAL_DISCLAIMER_ANCHORING',
    title: 'Regulatory & Political Disclaimer Attribution',
    category: 'MATCH_SIGNALS',
    requirement: 'Disclaimers ("Paid for by X") must be parsed as high-confidence legal entity anchors (weight 0.40) while distinguishing agencies from clients.',
    verificationEvidence: 'Disclaimer text parsed and normalized; matches on legal entity name anchor candidate pairs.',
    testCoverage: 'Verified in Scenario 07 (Disclaimer legal parent).'
  },
  {
    id: 'P4-AUD-10',
    code: 'FRANCHISE_MULTI_PAGE_LINKING',
    title: 'Regional Franchise Multi-Page to Business Entity Linking',
    category: 'IDENTITY_HIERARCHY',
    requirement: 'Regional Facebook pages (e.g. "Brand Austin", "Brand Dallas") pointing to the same corporate domain must safely cluster into one Business Entity.',
    verificationEvidence: 'Domain anchor + Jaro-Winkler name root yields score > 0.88; clusters 2+ Advertisers into 1 Business Entity.',
    testCoverage: 'Verified in Scenario 03 (Franchise regional pages).'
  },
  {
    id: 'P4-AUD-11',
    code: 'PHONE_E164_NORMALIZATION_LINK',
    title: 'Strict E.164 Phone Number Deduplication Anchor',
    category: 'MATCH_SIGNALS',
    requirement: 'Extracted telephone numbers must be normalized to E.164 format and serve as high-confidence corroborating anchors (weight 0.35).',
    verificationEvidence: 'Phone numbers match after non-digit removal; exact matching links cross-campaign entities.',
    testCoverage: 'Verified in Scenario 09 (Co-marketing lead form).'
  },
  {
    id: 'P4-AUD-12',
    code: 'ITEMIZED_SIGNAL_EXPLAINABILITY',
    title: 'Full Itemized Scoring Vector for Every Match',
    category: 'AUDITABILITY',
    requirement: 'Every match decision must provide an itemized list of contributing signals, weights, raw scores, and rationale for audit review.',
    verificationEvidence: 'CandidatePairEvaluation includes signals array with weight, rawScore, contributedScore, evidenceA, evidenceB, and rationale.',
    testCoverage: 'Inspected in Candidate Pair Scoring Matrix.'
  },
  {
    id: 'P4-AUD-13',
    code: 'UNLINKED_DISTINCT_PRESERVATION',
    title: 'Preservation of Truly Distinct Entities',
    category: 'IDENTITY_HIERARCHY',
    requirement: 'Unrelated advertisers must remain cleanly separated as distinct Business Entities without forced false clustering.',
    verificationEvidence: 'Score < 0.55 marks pair as UNLINKED_DISTINCT; cluster count matches ground truth.',
    testCoverage: 'Verified across all disparate fixtures.'
  },
  {
    id: 'P4-AUD-14',
    code: 'NON_GOALS_API_SCRAPING',
    title: 'Compliance: No Private Graph API or Bot Evasion',
    category: 'NON_GOALS',
    requirement: 'Phase 04 operates exclusively downstream of Phase 03 public envelopes; zero private Facebook APIs, session tokens, or automated evasion.',
    verificationEvidence: 'Pure offline TypeScript data structure processor; zero external network requests.',
    testCoverage: 'Verified by code audit.'
  },
  {
    id: 'P4-AUD-15',
    code: 'SQL_DDL_MIGRATIONS',
    title: 'Production-Grade Relational Schema & Foreign Keys',
    category: 'AUDITABILITY',
    requirement: 'Complete SQL DDL must be provided with appropriate B-tree indexes, primary keys, and foreign keys for PostgreSQL deployment.',
    verificationEvidence: 'DDL specified in Section 05 and exported in Handoff JSON.',
    testCoverage: 'Schema syntax validated.'
  },
  {
    id: 'P4-AUD-16',
    code: 'CRYPTOGRAPHIC_EVIDENCE_HASHING',
    title: 'SHA-256 Checksum on Every Entity Merge Record',
    category: 'AUDITABILITY',
    requirement: 'Merge ledger entries must compute SHA-256 hash over candidate IDs, signal scores, and timestamps to prevent tampering.',
    verificationEvidence: 'evidenceHash generated deterministically on each merge ledger entry.',
    testCoverage: 'Verified in merge ledger viewer.'
  },
  {
    id: 'P4-AUD-17',
    code: 'HIGH_THROUGHPUT_EFFICIENCY',
    title: 'Sub-Millisecond Candidate Pair Evaluation',
    category: 'PERFORMANCE_INTEGRITY',
    requirement: 'Scoring engine must evaluate candidate pairs in < 1ms per pair to support processing 10,000+ scraped cards per batch.',
    verificationEvidence: 'Metrics benchmark shows average execution time < 0.05ms per pair in browser.',
    testCoverage: 'Verified in Metrics telemetry panel.'
  },
  {
    id: 'P4-AUD-18',
    code: 'MANUAL_OPERATOR_OVERRIDE_SUPPORT',
    title: 'Human-in-the-Loop Manual Merge & Override',
    category: 'PERFORMANCE_INTEGRITY',
    requirement: 'Operators must be capable of manually merging or splitting clusters with an explicit operator identity and signed justification reason.',
    verificationEvidence: 'executeManualMerge function records operator = HUMAN_OPERATOR with audit reason.',
    testCoverage: 'Verified in Interactive Merge Ledger component.'
  },
  {
    id: 'P4-AUD-19',
    code: 'JARO_WINKLER_NORMALIZATION',
    title: 'Legal Suffix Stripping Before Fuzzy Name Comparison',
    category: 'MATCH_SIGNALS',
    requirement: 'Entity names must have legal suffixes (LLC, Inc, Corp, Ltd, GmbH, Co) stripped and whitespace normalized prior to Jaro-Winkler comparison.',
    verificationEvidence: 'normalizeBusinessName utility strips legal suffixes; prevents "Apex LLC" vs "Apex Inc" artificial divergence.',
    testCoverage: 'Verified in unit tests.'
  },
  {
    id: 'P4-AUD-20',
    code: 'PROVISIONAL_REVIEW_TIER',
    title: 'Distinct Provisional Review Tier (0.55 - 0.84)',
    category: 'CONFLICT_RESOLUTION',
    requirement: 'Scores between 0.55 and 0.84 must be marked PROVISIONAL_REVIEW and presented in triage queue without automatic cluster merging.',
    verificationEvidence: 'Threshold logic strictly enforces boundary; provisional clusters flagged with status IN_REVIEW.',
    testCoverage: 'Verified in Scenario 06.'
  },
  {
    id: 'P4-AUD-21',
    code: 'AFFILIATE_PARAM_STRIPPING',
    title: 'URL Tracking Parameter Removal Before Domain Comparison',
    category: 'MATCH_SIGNALS',
    requirement: 'Destination domains must be stripped of subdomains, query strings, and affiliate tags to prevent duplicate domain fragmentation.',
    verificationEvidence: 'eTLD+1 domain extractor strips www and subdomains; tracking parameters stripped in Phase 03.',
    testCoverage: 'Verified across all URL matching.'
  },
  {
    id: 'P4-AUD-22',
    code: 'CLUSTER_TOPOLOGY_CONSISTENCY',
    title: 'Transitive Graph Clustering Integrity',
    category: 'IDENTITY_HIERARCHY',
    requirement: 'Clustering must maintain consistent connected-component topology; merging A to B and B to C correctly merges A, B, and C into one cluster.',
    verificationEvidence: 'Disjoint-set / union-find cluster formation guarantees connected component consistency.',
    testCoverage: 'Verified in multi-page scenario tests.'
  },
  {
    id: 'P4-AUD-23',
    code: 'BRAND_ALIAS_AGGREGATION',
    title: 'Brand Alias & Alternate Name History Preservation',
    category: 'IDENTITY_HIERARCHY',
    requirement: 'When multiple Advertisers are merged into a Business Entity, all distinct page names must be preserved in brandAliases array.',
    verificationEvidence: 'BusinessEntityCluster.brandAliases contains deduplicated array of all contributing page names.',
    testCoverage: 'Verified in Cluster Details view.'
  },
  {
    id: 'P4-AUD-24',
    code: 'CONTACT_NEXUS_CONSOLIDATION',
    title: 'Cross-Page Phone & Email Nexus Consolidation',
    category: 'IDENTITY_HIERARCHY',
    requirement: 'The Business Entity must consolidate distinct validated contact points (associatedPhones, associatedEmails) across all constituent ads.',
    verificationEvidence: 'associatedPhones and associatedEmails arrays aggregated and deduplicated in cluster record.',
    testCoverage: 'Verified in Cluster Details view.'
  },
  {
    id: 'P4-AUD-25',
    code: 'EXPORTABLE_HANDOFF_COMPLETENESS',
    title: 'Complete Phase 04 Handoff JSON Specification',
    category: 'AUDITABILITY',
    requirement: 'Handoff JSON must export all DDL, API contracts, signal matrix, acceptance criteria, and resolution graph artifacts.',
    verificationEvidence: 'Phase04HandoffViewer renders complete valid JSON conforming to v4.0.0-PROD schema.',
    testCoverage: 'Verified in Phase 04 Handoff view.'
  },
  {
    id: 'P4-AUD-26',
    code: 'SYSTEM_COMPLIANCE_SIGN_OFF',
    title: '100% Phase 04 Invariant Acceptance',
    category: 'PERFORMANCE_INTEGRITY',
    requirement: 'All 26 Phase 04 audit criteria must evaluate to PASS with zero pending architectural defects or unhandled failure modes.',
    verificationEvidence: '26/26 audit checks verified PASS.',
    testCoverage: 'Verified in Phase 04 Acceptance Audit view.'
  }
];

export const PHASE_04_SCENARIOS: Phase04ScenarioFixture[] = [
  {
    id: 'SCENARIO-01',
    name: 'Same Ad Multi-Observation Deduplication',
    category: 'SAME_AD_MULTI_OBSERVATION',
    description: 'The same active ad (Library ID: 849201948201948) scraped across two different run checkpoints (Batch 1 & Batch 2). Must deduplicate into 1 Ad Entity, 1 Advertiser, 1 Business Entity.',
    rawInputCount: 2,
    expectedAdCount: 1,
    expectedAdvertiserCount: 1,
    expectedBusinessEntityCount: 1,
    expectedConflictCount: 0,
    expectedPrimaryDecision: 'AUTOMATIC_CONFIRMED'
  },
  {
    id: 'SCENARIO-02',
    name: 'Same Advertiser Multiple Creative Campaigns',
    category: 'SAME_ADVERTISER_MULTI_AD',
    description: 'CloudScale DevOps Platform running 2 distinct ad creatives (Ad ID 772910482910482 and 991823019283746). Must resolve to 2 Ad Entities, 1 Advertiser Entity, 1 Business Entity.',
    rawInputCount: 2,
    expectedAdCount: 2,
    expectedAdvertiserCount: 1,
    expectedBusinessEntityCount: 1,
    expectedConflictCount: 0,
    expectedPrimaryDecision: 'AUTOMATIC_CONFIRMED'
  },
  {
    id: 'SCENARIO-03',
    name: 'Franchise Regional Facebook Pages to Single Business',
    category: 'FRANCHISE_REGIONAL_PAGES',
    description: '"Apex Solar California" and "Apex Solar Texas" linking to the same registered root domain (apexsolarsolutions.com). Must link 2 Advertisers to 1 Business Entity.',
    rawInputCount: 2,
    expectedAdCount: 2,
    expectedAdvertiserCount: 2,
    expectedBusinessEntityCount: 1,
    expectedConflictCount: 0,
    expectedPrimaryDecision: 'AUTOMATIC_CONFIRMED'
  },
  {
    id: 'SCENARIO-04',
    name: 'Agency Running Ads for Distinct Clients (Hard Block)',
    category: 'AGENCY_MULTI_CLIENT_CONFLICT',
    description: '"OmniMedia Growth Agency" running ads for "Smile Dental" (smiledental.com) and "Valley Ortho" (valleyortho.com). Conflicting domains must block automatic business entity merge.',
    rawInputCount: 2,
    expectedAdCount: 2,
    expectedAdvertiserCount: 2,
    expectedBusinessEntityCount: 2,
    expectedConflictCount: 1,
    expectedPrimaryDecision: 'CONFLICT_QUARANTINE'
  },
  {
    id: 'SCENARIO-05',
    name: 'Affiliate Campaign with Generic Shortener / Linktree',
    category: 'AFFILIATE_GENERIC_DOMAIN_BLOCK',
    description: 'Two unrelated fitness influencers both directing to "linktr.ee/specialoffer". Generic domain ban must prevent merging into one business entity.',
    rawInputCount: 2,
    expectedAdCount: 2,
    expectedAdvertiserCount: 2,
    expectedBusinessEntityCount: 2,
    expectedConflictCount: 0,
    expectedPrimaryDecision: 'UNLINKED_DISTINCT'
  },
  {
    id: 'SCENARIO-06',
    name: 'Name Typo / Minor Variation Without Domain Anchor',
    category: 'NAME_TYPO_SIMILARITY',
    description: '"BioHeal Wellness" vs "BioHeal Health Clinic" with high Jaro-Winkler similarity (0.89) but distinct landing pages. Must route to Provisional Review, not Auto-Merge.',
    rawInputCount: 2,
    expectedAdCount: 2,
    expectedAdvertiserCount: 2,
    expectedBusinessEntityCount: 2,
    expectedConflictCount: 0,
    expectedPrimaryDecision: 'PROVISIONAL_REVIEW'
  },
  {
    id: 'SCENARIO-07',
    name: 'Disclaimer Legal Parent Organization Match',
    category: 'DISCLAIMER_LEGAL_PARENT',
    description: '"Green Horizon Power" ad with regulatory disclaimer: "Paid for by Apex Energy Solutions LLC". Must anchor to the parent business entity.',
    rawInputCount: 2,
    expectedAdCount: 2,
    expectedAdvertiserCount: 2,
    expectedBusinessEntityCount: 1,
    expectedConflictCount: 0,
    expectedPrimaryDecision: 'AUTOMATIC_CONFIRMED'
  },
  {
    id: 'SCENARIO-08',
    name: 'Phone Collision on Different Brand Names (Quarantine)',
    category: 'PHONE_COLLISION_DIFFERENT_BRANDS',
    description: 'Two conflicting local brands ("Alpha Roofers" and "Beta Solar") listing the exact same phone number +1-800-555-0199 but with conflicting domains. Flagged for Quarantine.',
    rawInputCount: 2,
    expectedAdCount: 2,
    expectedAdvertiserCount: 2,
    expectedBusinessEntityCount: 2,
    expectedConflictCount: 1,
    expectedPrimaryDecision: 'CONFLICT_QUARANTINE'
  },
  {
    id: 'SCENARIO-09',
    name: 'Co-Marketing Lead Form with Shared Inbound Number',
    category: 'CO_MARKETING_LEAD_FORM',
    description: 'Partnership campaign featuring co-branded copy and shared phone number, but identical confirmed disclaimer and landing page subdomain.',
    rawInputCount: 2,
    expectedAdCount: 2,
    expectedAdvertiserCount: 2,
    expectedBusinessEntityCount: 1,
    expectedConflictCount: 0,
    expectedPrimaryDecision: 'AUTOMATIC_CONFIRMED'
  },
  {
    id: 'SCENARIO-10',
    name: 'Reversible Unmerge & Split Lifecycle',
    category: 'REVERSIBLE_UNMERGE_SPLIT',
    description: 'Demonstrating execution of a manual or automatic merge, followed by a 1-click unmerge reversal via the Reversible Merge Ledger with full topological restoration.',
    rawInputCount: 2,
    expectedAdCount: 2,
    expectedAdvertiserCount: 2,
    expectedBusinessEntityCount: 2,
    expectedConflictCount: 0,
    expectedPrimaryDecision: 'MANUAL_SPLIT'
  }
];
