export interface Phase06Section {
  number: number;
  title: string;
  category: 'FOUNDATION' | 'SIGNALS_AND_RULES' | 'SCORING_AND_CONFIDENCE' | 'OPERATIONS' | 'AUDIT_AND_HANDOFF';
  contentMarkdown: string;
}

export const PHASE_06_SECTIONS: Phase06Section[] = [
  {
    number: 1,
    title: 'PHASE-05 TRACEABILITY',
    category: 'FOUNDATION',
    contentMarkdown: `### 1. Architectural Lineage from Phase 05 to Phase 06

The Phase 06 Lead Qualification and Scoring subsystem operates strictly as an evidence consumer. It consumes the canonical entities, identity links, and verification artifacts produced by Phases 01 through 05.

\`\`\`
Phase 01: Architecture & Data Contracts
   ↓
Phase 02: Playwright Browser Worker & Anti-Evasion
   ↓
Phase 03: Public Data Extraction, Normalization & Provenance DAG
   ↓
Phase 04: Identity Resolution, Entity Linking & Reversible Merges
   ↓
Phase 05: Maximum Strict Advertiser, Website & Business Verification
   ↓ (VerificationSummary, EvidenceRecords, Claims, SSRF Clearances)
Phase 06: Evidence-Driven Lead Qualification, Scoring & Explainability
   ↓ (QualificationResult, ScoreContributions, Explanations, Audit Log)
Phase 07: Durable Storage, Persistence & Historical Registry
\`\`\`

#### Strict Evidence-to-Decision Mapping Invariant
Every mathematical contribution, qualification state, and natural-language explanation generated in Phase 06 MUST trace back to an observable verification claim or raw evidence record produced in Phase 05:

| Verification Claim (Phase 05) | Qualification Signal (Phase 06) | Scoring Rule | Score Contribution | Traceable Explanation |
| :--- | :--- | :--- | :--- | :--- |
| \`HTTP_200_OK\` + \`TLS_ACTIVE\` | \`SIG-WEB-02\` & \`SIG-WEB-03\` | \`RULE-WEB-02\`, \`RULE-WEB-03\` | +10 pts, +5 pts | "Destination URL reachable over HTTPS" |
| \`BRAND_NAME_VISIBLE\` | \`SIG-WEB-04\` | \`RULE-WEB-04\` | +10 pts | "DOM contains visible commercial content" |
| \`IDENTITY_CONSISTENCY == CONSISTENT\` | \`SIG-ID-01\` | \`RULE-ID-01\` | +15 pts | "Advertiser matches destination brand" |
| \`CORPORATE_EMAIL_MATCH\` | \`SIG-CNT-01\` | \`RULE-CNT-01\` | +5 pts | "Public corporate inquiry email displayed" |
| \`CRITICAL_IDENTITY_CONFLICT\` | \`BLOCKER-02\` | \`RULE-BLK-02\` | Blocker Triggered | "Severe contradictory identity detected" |`
  },
  {
    number: 2,
    title: 'QUALIFICATION TARGET',
    category: 'FOUNDATION',
    contentMarkdown: `### 2. Definition of the Scored Entity Target

#### Primary Target: Advertiser / Business Candidate (Cluster)
The fundamental unit of qualification and scoring in Phase 06 is the **Canonical Business Candidate / Advertiser Entity**, NOT an individual ad observation.

#### Target Definition Rationale:
1. **Ad Aggregation vs. Entity Identity**: A single business may run dozens or hundreds of active ads across multiple campaigns. Scoring individual ads leads to duplicated lead generation, inconsistent pipeline prioritization, and double-counting of organizational attributes.
2. **Ad-Level Signals as Aggregate Evidence**: Ad-level observations contribute to entity-level signals (such as \`canonicalAdCount\`, \`observedLongevityDays\`, and \`creativeSignaturesCount\`) through deterministic aggregation functions.
3. **Cluster Anchoring**: The scoring engine anchors to the canonical \`entityId\` established in Phase 04 identity resolution, maintaining complete lineage to all underlying observation IDs.`
  },
  {
    number: 3,
    title: 'QUALIFICATION VS SCORING MODEL',
    category: 'FOUNDATION',
    contentMarkdown: `### 3. Separation of Qualification, Scoring, and Prioritization

Phase 06 enforces a strict separation between three distinct operational concepts:

\`\`\`
1. QUALIFICATION (Boolean Gatekeeper)
   "Does this entity satisfy the mandatory baseline criteria for the workflow?"
   → Output: Status (e.g. QUALIFIED, NOT_ELIGIBLE, REVIEW_REQUIRED)

2. SCORING (Normalized Quantitative Measurement)
   "How strongly does the available verified evidence satisfy the scoring framework?"
   → Output: Score (0–100 integer) + Confidence (HIGH/MED/LOW/UNCERTAIN)

3. PRIORITIZATION (Operational Workflow Queueing)
   "In what sequence should qualified records be presented to operators or workflows?"
   → Output: Ordered List based on Configurable Policy (e.g. High Confidence First)
\`\`\`

#### Non-Negotiable Invariants:
- A high numerical score (e.g. 95/100) MUST NEVER bypass a hard qualification blocker.
- Qualification states represent rule satisfaction, NOT subjective quality judgments.
- Scoring measures evidence strength, NOT probability of commercial conversion.`
  },
  {
    number: 4,
    title: 'ELIGIBILITY RULES',
    category: 'FOUNDATION',
    contentMarkdown: `### 4. Eligibility Rules (Layer A)

Before evaluating scoring signals, the engine verifies fundamental eligibility:

1. **Non-Empty Advertiser Identity**: The entity must possess a canonical advertiser name extracted from public library records with confidence >= 0.70.
2. **At Least One Canonical Ad**: The entity must have at least one verified canonical ad observation in the research database.
3. **No Terminal Rejection Rule**: The entity must not have triggered an automated hard blocker or manual disqualification.

Entities failing eligibility are assigned status \`NOT_ELIGIBLE\` with score 0 and no further signal evaluations are executed.`
  },
  {
    number: 5,
    title: 'HARD BLOCKERS',
    category: 'FOUNDATION',
    contentMarkdown: `### 5. Hard Blockers Catalog

Hard blockers represent conditions that immediately disqualify an entity or require mandatory human review:

| Blocker ID | Severity | Condition | Action |
| :--- | :--- | :--- | :--- |
| \`BLOCKER-01\` | CRITICAL | Protocol Hazard or SSRF Attempt (file:, ftp:, private IP, metadata) | Immediate rejection (\`REJECTED_BY_RULE\`) |
| \`BLOCKER-02\` | CRITICAL | Irreconcilable Identity Contradiction between ad & destination | Route to \`REVIEW_REQUIRED\` with blocker flag |
| \`BLOCKER-03\` | CRITICAL | Zero Observable Canonical Ads (\`canonicalAdCount <= 0\`) | Assign \`NOT_ELIGIBLE\` |
| \`BLOCKER-04\` | CRITICAL | Missing Advertiser Name | Assign \`NOT_ELIGIBLE\` |
| \`BLOCKER-05\` | CONDITIONAL | Stale Critical Verification (>60 Days expired) | Route to \`REVIEW_REQUIRED\` for re-check |`
  },
  {
    number: 6,
    title: 'SIGNAL CATALOG',
    category: 'SIGNALS_AND_RULES',
    contentMarkdown: `### 6. Signal Catalog (4 Core Categories)

Phase 06 groups all observable business signals into four distinct categories:

#### Category 1: Advertising Activity (Cap: 30 Points)
- **\`SIG-ADV-01\` (Canonical Ad Volume)**: Scales by canonical ads (1 ad = 5 pts, 2–5 ads = 10 pts, 6+ ads = 15 pts). Max 15 pts.
- **\`SIG-ADV-02\` (Observed Longevity)**: Window between first and last observation (>=7d = 4 pts, >=30d = 7 pts, >=90d = 10 pts). Max 10 pts.
- **\`SIG-ADV-03\` (Multi-Platform Reach)**: Observed on multiple Meta properties (Facebook, Instagram, Audience Network). Max 5 pts.

#### Category 2: Website & Destination (Cap: 30 Points)
- **\`SIG-WEB-01\` (Destination Usability)**: Public valid HTTP/HTTPS URL present in ad. Max 5 pts.
- **\`SIG-WEB-02\` (HTTP Reachability)**: Verified 200 OK response under bounded retrieval budget. Max 10 pts.
- **\`SIG-WEB-03\` (TLS Certificate Security)**: Verified HTTPS encryption negotiated. Max 5 pts.
- **\`SIG-WEB-04\` (DOM Content Visibility)**: Open business text visible without login walls or blocking CAPTCHAs. Max 10 pts.

#### Category 3: Identity & Consistency (Cap: 25 Points)
- **\`SIG-ID-01\` (Brand Token Overlap)**: Normalized token match between advertiser candidate and landing brand. Max 15 pts.
- **\`SIG-ID-02\` (Domain Registration Alignment)**: Registered domain corresponds with advertiser. Max 10 pts.

#### Category 4: Business Contactability (Cap: 15 Points)
- **\`SIG-CNT-01\` (Public Corporate Email)**: Commercial domain-matched email (excludes @gmail, @yahoo). Max 5 pts.
- **\`SIG-CNT-02\` (E.164 Corporate Telephone)**: Public telephone number in international format. Max 5 pts.
- **\`SIG-CNT-03\` (Commercial Jurisdiction / Address)**: Physical headquarters address or defined service area. Max 5 pts.`
  },
  {
    number: 7,
    title: 'MISSING-DATA POLICY',
    category: 'SIGNALS_AND_RULES',
    contentMarkdown: `### 7. Explicit Missing-Data Policy

Missing data MUST NEVER be treated as affirmative negative evidence without a documented rule.

The engine classifies every signal into one of six states:
1. \`PRESENT\`: Verified evidence exists and is valid. Receives full score contribution.
2. \`ABSENT\`: Evidence was checked and confirmed absent. Receives 0 points.
3. \`UNKNOWN\`: Evidence has not yet been investigated or verified. Receives 0 points, lowers confidence score.
4. \`UNAVAILABLE\`: Source was temporarily unreachable (e.g. network timeout). Receives 0 points, prompts retry.
5. \`FAILED\`: Extraction or verification resulted in a syntax or protocol error. Receives 0 points.
6. \`NOT_APPLICABLE\`: Signal is irrelevant for this entity type (e.g. website signals for local walk-in businesses without digital presence). Excluded from confidence denominator.`
  },
  {
    number: 8,
    title: 'FRESHNESS MODEL',
    category: 'SIGNALS_AND_RULES',
    contentMarkdown: `### 8. Evidence Freshness & Time Decay

Verification artifacts decay over time as business websites update, domains expire, or campaigns conclude:

- **\`CURRENT\` (0–14 Days)**: Full weight (1.0x). Confidence multiplier: 1.0.
- **\`RECENT\` (15–30 Days)**: Full weight (1.0x). Confidence multiplier: 0.8.
- **\`STALE\` (>30 Days)**: Weight reduced or conditional blocker triggered. Confidence multiplier: 0.5. Re-verification queued.
- **\`UNKNOWN\`**: Missing timestamp. Confidence multiplier: 0.3.`
  },
  {
    number: 9,
    title: 'SIGNAL DEPENDENCY / DOUBLE-COUNTING POLICY',
    category: 'SIGNALS_AND_RULES',
    contentMarkdown: `### 9. Anti-Double-Counting Architecture & Category Caps

#### The Problem of Correlated Evidence:
A website that returns HTTP 200, supports HTTPS, and displays brand text all stem from a single underlying fact: "the business operates a functional website." Summing dozens of minor indicators would artificially inflate scores.

#### Safeguards Implemented:
1. **Hard Category Caps**:
   - Advertising Activity: Cap 30 pts.
   - Website Destination: Cap 30 pts.
   - Identity Consistency: Cap 25 pts.
   - Business Contactability: Cap 15 pts.
   - **Theoretical Maximum**: 100 points.
2. **Pre-Cap Clamping**: Raw points within a category are clamped at the category cap before being added to the overall score.
3. **Hierarchical Preconditions**: For example, \`SIG-WEB-02\` (HTTP Reachability) is a prerequisite for \`SIG-WEB-04\` (DOM Content Visibility).`
  },
  {
    number: 10,
    title: 'SCORE MODEL',
    category: 'SCORING_AND_CONFIDENCE',
    contentMarkdown: `### 10. Normalized Mathematical Scoring Model

The final score $S$ is bounded strictly between 0 and 100:

$$S = \\min\\left(100, \\sum_{c \\in \\text{Categories}} \\min(\\text{Cap}_c, \\text{RawScore}_c)\\right)$$

#### Score Range Interpretation:
- **75–100 (Strongly Evidenced)**: Robust, corroborated multi-channel advertising with consistent verified web destination and commercial contact coordinates.
- **50–74 (Moderately Evidenced)**: Active advertiser with verified core attributes, with some secondary coordinates unverified or absent.
- **30–49 (Minimally Evidenced)**: Single ad or unverified destination; requires manual investigation.
- **0–29 (Insufficient Evidence / Blocked)**: Lacks public coordinates or triggered blocking condition.`
  },
  {
    number: 11,
    title: 'WEIGHTING RATIONALE',
    category: 'SCORING_AND_CONFIDENCE',
    contentMarkdown: `### 11. Weighting Rationale & Empirical Calibration

All weights in Model V1 are explicitly labeled as \`INITIAL_HEURISTIC\` based on architectural risk boundaries.

- **Advertising Activity (30%)**: Reflects verified commitment to active marketing distribution without predicting campaign ROI.
- **Website & Destination (30%)**: Reflects digital infrastructure accessibility.
- **Identity Consistency (25%)**: Reflects entity coherence and anti-spoofing guarantees.
- **Contactability (15%)**: Reflects public commercial inquiry accessibility.

When longitudinal CRM outcome data becomes available in downstream deployments, weights will undergo empirical logistic regression calibration.`
  },
  {
    number: 12,
    title: 'CONFIDENCE MODEL',
    category: 'SCORING_AND_CONFIDENCE',
    contentMarkdown: `### 12. Independent Confidence Metric

Confidence is mathematically decoupled from the score:

$$\\text{Confidence} = \\frac{\\sum_{i} w_i \\cdot \\text{FreshnessFactor}_i \\cdot \\mathbb{I}(\\text{State}_i == \\text{PRESENT})}{\\sum_{i} w_i}$$

- **\`HIGH\` (>= 0.75)**: High density of corroborated, current evidence across multiple independent sources.
- **\`MEDIUM\` (0.50–0.74)**: Core signals verified, some optional attributes unknown.
- **\`LOW\` (0.30–0.49)**: Limited evidence available.
- **\`UNCERTAIN\` (< 0.30)**: High proportion of missing, stale, or conflicting evidence.`
  },
  {
    number: 13,
    title: 'QUALIFICATION STATES',
    category: 'SCORING_AND_CONFIDENCE',
    contentMarkdown: `### 13. Qualification State Transition Machine

The engine assigns each scored entity to one of seven discrete lifecycle states:

\`\`\`
          [Raw Entity]
               ↓
    [Eligibility Check] → Fails → [NOT_ELIGIBLE]
               ↓
     [Hard Blockers] → Triggers → [REJECTED_BY_RULE]
               ↓
   [Signal Evaluation]
               ↓
      [Conflict / Staleness?] → Yes → [REVIEW_REQUIRED]
               ↓
       [Score < 30?] → Yes → [INSUFFICIENT_EVIDENCE]
               ↓
     [Score >= 75 & Conf == HIGH & Consistent] → Yes → [VERIFIED_FOR_WORKFLOW]
               ↓
     [Score >= 45] → Yes → [QUALIFIED]
               ↓
     [Else] → [REVIEW_REQUIRED]
\`\`\``
  },
  {
    number: 14,
    title: 'EXPLANATION MODEL',
    category: 'SCORING_AND_CONFIDENCE',
    contentMarkdown: `### 14. Transparent, Factual Natural-Language Explanations

Every qualification result produces a declarative, human-readable explanation synthesizing:
1. Applied scoring model ID and semantic version.
2. Verified positive contributions and awarded points per category.
3. Explicit identification of missing non-mandatory evidence.
4. Active blockers or identity contradictions if present.
5. Record of manual overrides if applied by an operator.

*No opaque "black box" scores or subjective marketing adjectives are permitted.*`
  },
  {
    number: 15,
    title: 'REVIEW / MANUAL OVERRIDE',
    category: 'OPERATIONS',
    contentMarkdown: `### 15. Auditable Manual Override System

Human operators may override automated qualification decisions under strict governance rules:
- **Non-Destructive**: Overrides NEVER modify or delete underlying Phase 05 verification evidence.
- **Auditable Metadata**: Overrides must record \`overrideId\`, \`reviewer\`, \`appliedAt\`, \`previousStatus\`, \`newStatus\`, \`reason\`, and \`policyVersion\`.
- **Review Queue Routing**: Entities with conflicts or borderline confidence are automatically placed in the review queue.`
  },
  {
    number: 16,
    title: 'MODEL REGISTRY',
    category: 'OPERATIONS',
    contentMarkdown: `### 16. Scoring Model Registry & Lifecycle Management

All scoring models are registered in an immutable versioned registry:
- **\`DRAFT\`**: Under construction, cannot be used in production.
- **\`TESTING\`**: Executing unit and property tests.
- **\`SHADOW\`**: Running concurrently against production inputs without affecting workflow routing.
- **\`ACTIVE\`**: The authoritative model governing production qualification.
- **\`RETIRED\`**: Deprecated model preserved for historical audit re-scoring.`
  },
  {
    number: 17,
    title: 'DRY-RUN / SHADOW MODE',
    category: 'OPERATIONS',
    contentMarkdown: `### 17. Dry-Run Scoring & Shadow Mode Execution

- **Dry-Run**: Executes scoring in-memory against arbitrary input snapshots without persisting changes or mutating entity states.
- **Shadow Mode**: Evaluates candidate models (e.g. \`MODEL-V2-STRICT\`) in real time alongside \`MODEL-V1-BALANCED\`, generating telemetry comparisons before model promotion.`
  },
  {
    number: 18,
    title: 'MODEL IMPACT ANALYSIS',
    category: 'OPERATIONS',
    contentMarkdown: `### 18. Model Change Impact Analysis

Before any scoring model is promoted to \`ACTIVE\`, the system performs automated impact analysis over reference datasets:
- Score distribution drift (mean, median, standard deviation).
- State transition matrix (e.g. how many entities shift from \`QUALIFIED\` to \`REVIEW_REQUIRED\`).
- Explicit lists of newly qualified and newly disqualified entities.`
  },
  {
    number: 19,
    title: 'RE-SCORING / ROLLBACK',
    category: 'OPERATIONS',
    contentMarkdown: `### 19. Idempotent Batch Re-Scoring & Rollback

- **Idempotency**: Re-running the same model version against an immutable evidence snapshot yields bit-for-bit identical scores.
- **Safe Rollback**: Rolling back a model involves selecting a previous model version from the registry; existing historical scores are preserved with their original \`modelVersion\`.`
  },
  {
    number: 20,
    title: 'TEMPORAL / EVIDENCE SNAPSHOT MODEL',
    category: 'OPERATIONS',
    contentMarkdown: `### 20. Point-in-Time Evidence Snapshots

Each scoring execution captures a \`ScoringInputSnapshot\` containing:
- \`snapshotId\` (Cryptographic SHA-256 hash of input fields).
- Exact timestamp of calculation.
- References to Phase 05 verification check timestamps.
This ensures complete historical reproducibility for audits.`
  },
  {
    number: 21,
    title: 'SECURITY / PRIVACY MODEL',
    category: 'OPERATIONS',
    contentMarkdown: `### 21. Data Protection, Fairness & Privacy Architecture

- **Commercial Entity Focus**: The system qualifies business organizations, never natural persons.
- **Strict Prohibition on Sensitive Personal Data**: Scoring algorithms are forbidden from ingesting or inferring protected demographic characteristics (race, gender, religion, health, political affiliation).
- **No Personal PII Rewards**: Free consumer emails (@gmail, @yahoo) receive 0 points; only domain-matched commercial emails contribute.`
  },
  {
    number: 22,
    title: 'OBSERVABILITY',
    category: 'OPERATIONS',
    contentMarkdown: `### 22. Observability, Telemetry & Structured Logging

Every scoring operation emits structured telemetry:
- \`entityId\`, \`modelId\`, \`modelVersion\`.
- \`score\`, \`confidence\`, \`status\`.
- Execution latency in microseconds.
- Category breakdown and active blocker count.
Metrics are streamed to audit ledgers without logging private communication text.`
  },
  {
    number: 23,
    title: 'TESTING STRATEGY',
    category: 'AUDIT_AND_HANDOFF',
    contentMarkdown: `### 23. Comprehensive Testing Strategy

The qualification test suite comprises:
1. **Unit Tests**: Verifying individual signal rules, blockers, and missing-data handlers.
2. **Property Tests**: Testing determinism, monotonicity, and mathematical score boundaries (0 <= Score <= 100).
3. **Regression Tests**: Ensuring fixed bugs (e.g. PII reward prevention, double-counting) never recur.`
  },
  {
    number: 24,
    title: 'GOLDEN SCORING DATASET',
    category: 'AUDIT_AND_HANDOFF',
    contentMarkdown: `### 24. Curated Golden Scoring Benchmark Dataset

A reference suite of 16 curated test scenarios covering:
- Clean Enterprise Advertisers (High score, High confidence).
- Unreachable Destinations (404/500).
- Local Businesses without websites (fair missing data handling).
- Identity Contradictions and Spoofing attempts.
- Stale Verifications (>60 days).
- Adversarial SSRF / Protocol attacks.`
  },
  {
    number: 25,
    title: 'API / CONTRACT DEFINITIONS',
    category: 'AUDIT_AND_HANDOFF',
    contentMarkdown: `### 25. Standard Logical API Contracts

Defined contracts:
- \`QualificationRequest\`: Input snapshot and model selection.
- \`QualificationResult\`: Comprehensive scored output with explanations and signals.
- \`ManualOverrideRequest\`: Reviewer override command.
- \`ModelImpactEvaluationRequest\`: Multi-dataset comparative benchmarking.`
  },
  {
    number: 26,
    title: 'FILE-LEVEL IMPLEMENTATION PLAN',
    category: 'AUDIT_AND_HANDOFF',
    contentMarkdown: `### 26. Architectural File Breakdown

- \`/src/types.ts\`: Core interfaces for qualification, scoring, rules, snapshots, and audit criteria.
- \`/src/utils/qualificationEngine.ts\`: Deterministic scoring engine, model registry, blocker evaluator, and impact analyzer.
- \`/src/data/phase06Sections.ts\`: Authoritative 28-section specification text.
- \`/src/data/phase06FixturesAndAudit.ts\`: 16 golden datasets, 28 acceptance criteria, and Phase 07 handoff contract.
- \`/src/components/Phase06Reader.tsx\`: Specification reader UI.
- \`/src/components/QualificationSimulator.tsx\`: Interactive pipeline visualizer.
- \`/src/components/ModelRegistryAndImpactViewer.tsx\`: Model registry and shadow impact comparison.
- \`/src/components/PrioritizationMatrixViewer.tsx\`: Workflow prioritization queue.
- \`/src/components/Phase06GoldenReplay.tsx\`: Benchmark test runner.
- \`/src/components/Phase06Audit.tsx\`: 28-point acceptance audit.
- \`/src/components/Phase06HandoffViewer.tsx\`: Machine-readable Phase 07 handoff export.`
  },
  {
    number: 27,
    title: 'ACCEPTANCE CHECKLIST',
    category: 'AUDIT_AND_HANDOFF',
    contentMarkdown: `### 27. Acceptance Criteria Verification

Phase 06 satisfies all 28 acceptance criteria:
- Complete traceability to Phase 05.
- Strict separation of qualification, scoring, and prioritization.
- Deterministic explainability on every material contribution.
- Robust missing-data and freshness models.
- Mathematical bounds (0–100) and anti-double-counting caps.
- Auditable manual overrides and shadow model impact comparisons.`
  },
  {
    number: 28,
    title: 'PHASE-06 HANDOFF CONTRACT',
    category: 'AUDIT_AND_HANDOFF',
    contentMarkdown: `### 28. Phase 07 Persistence Handoff Contract

Provides structured JSON contract for Phase 07 database schema design:
- Schema for \`qualification_results\`.
- Schema for \`signal_contributions\`.
- Schema for \`evidence_snapshots\`.
- Schema for \`manual_overrides\`.
- Schema for \`model_registry\`.`
  }
];
