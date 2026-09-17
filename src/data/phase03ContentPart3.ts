export const PHASE_03_CONTENT_PART_3: Record<string, { title: string; content: string }> = {
  'p3-telemetry-metrics': {
    title: '# 17. Telemetry, Extraction Metrics & Structured Audit Logs',
    content: `### Telemetry & Operational Observability
Phase 03 instruments every stage of card processing with Prometheus counters, latency histograms, and structured JSON audit events.

#### Core Prometheus Metrics
- \`extraction_cards_processed_total{status="pass|flagged|rejected"}\`: Counter of all card processing outcomes.
- \`extraction_stage_duration_seconds{stage="parsing|normalization|validation"}\`: Histogram measuring CPU parse time per card (P50, P95, P99).
- \`extraction_field_drop_rate{field="pageName|startDate|destinationUrl"}\`: Counter tracking fallback tier activation or null fields.
- \`extraction_confidence_distribution\`: Gauge tracking distribution of composite confidence scores.

#### Structured Audit Log Schema (JSON)
\`\`\`json
{
  "timestamp": "2025-02-16T14:32:01.450Z",
  "level": "INFO",
  "logger": "extraction.pipeline",
  "event": "CARD_COMMITTED",
  "runId": "run_01j7b9k2",
  "jobId": "job_meta_ad_research_01",
  "observationId": "obs_9942a7bc",
  "adLibraryId": "892341209384712",
  "compositeConfidence": 0.942,
  "stageLatenciesMs": {
    "ingestion": 0.42,
    "parsing": 2.15,
    "provenance": 0.81,
    "normalization": 1.12,
    "validation": 0.65,
    "total": 5.15
  },
  "validationSummary": {
    "rulesPassed": 14,
    "warnings": 0,
    "violations": 0
  }
}
\`\`\``
  },

  'p3-error-codes': {
    title: '# 18. Hierarchical Error Taxonomy (EXT-1000 to EXT-5099)',
    content: `### Exhaustive Error Taxonomy
All extraction failures, anomalies, and rejections are categorized into standard numerical error codes:

| Error Code | Category | Severity | Description & Recovery Action |
| :--- | :--- | :--- | :--- |
| **EXT-1001** | INGESTION | FATAL | Card container DOM element is null or unattached to tree. Drop node. |
| **EXT-1002** | INGESTION | ERROR | Bounding rect indicates zero area (ghost placeholder). Ignore element. |
| **EXT-2001** | PARSING | FATAL | Mandatory \`adLibraryId\` could not be found via primary or fallbacks. Reject card. |
| **EXT-2002** | PARSING | FATAL | Mandatory \`pageName\` missing or blank. Reject card. |
| **EXT-2003** | PARSING | WARNING | Start Date text could not be parsed via registered locale regexes. Assign null. |
| **EXT-2004** | PARSING | INFO | Truncated text ("See more") was not expanded by worker. Truncated flag set. |
| **EXT-3001** | ANOMALY | WARNING | Layout shift suspected: 3 consecutive cards required tier-2 fallbacks. |
| **EXT-3004** | ANOMALY | ERROR | Duplicate ID collision within single batch with divergent body copy. |
| **EXT-4001** | NORMALIZATION | WARNING | Date parsed with missing year; assumed current calendar year. |
| **EXT-4002** | NORMALIZATION | WARNING | Phone number could not be mapped to E.164 standard. Retain raw digits. |
| **EXT-4003** | NORMALIZATION | INFO | Destination URL contained tracking parameters; stripped successfully. |
| **EXT-5001** | VALIDATION | FATAL | Cross-field invariant violated: \`endDate < startDate\`. Reject card. |
| **EXT-5002** | VALIDATION | ERROR | Composite confidence score < 0.60 threshold. Quarantine card. |
| **EXT-5003** | VALIDATION | WARNING | Composite confidence score between 0.60 and 0.79. Flag for operator review. |`
  },

  'p3-phase-04-handoff-spec': {
    title: '# 19. Phase 04 Inter-Phase Interface Specification',
    content: `### Handoff Contract to Phase 04 (Identity Resolution)
Phase 03 completes the extraction and normalization of individual ad records. It delivers its verified payload to **Phase 04**, which is responsible for:
1. **Advertiser Page Entity Resolution & Clustering** (merging multiple ads into unified advertiser companies).
2. **Cross-Campaign Deduplication** (identifying duplicate or slightly varied creative variants).
3. **Lead Intent Classification** (scoring commercial lead value).

#### Ingestion Interface Contract
Phase 03 provides Phase 04 with two consumption modes:
1. **Streaming Message Bus (Kafka / RabbitMQ / Cloud PubSub)**:
   - Topic: \`meta.ad.canonical.records.v3\`
   - Message Key: \`record.adLibraryId\`
   - Payload: Complete \`CanonicalAdEnvelope\` serialized as strict JSON.
2. **Batch File Dump (S3 / GCS / Local JSONL)**:
   - Directory structure: \`/data/canonical/year=YYYY/month=MM/day=DD/\`
   - File format: Partitioned, compressed newline-delimited JSON (\`.jsonl.gz\`).
   - Manifest: Accompanying \`_SUCCESS\` and checksum files.

\`\`\`typescript
export interface Phase04IngestionPayload {
  envelope: CanonicalAdEnvelope;
  routingKey: string; // e.g. "advertiser.identity.resolve"
  traceId: string;
}
\`\`\``
  },

  'p3-fixture-suite-spec': {
    title: '# 20. Synthetic Test Fixture Suite Specification',
    content: `### Synthetic Fixture Suite Overview
To validate Phase 03 without live external network dependencies, the codebase includes a suite of 10 comprehensive synthetic HTML snapshots:

1. **FIXTURE-01 (standard_lead_gen)**: Standard commercial single-image ad with clear Library ID, active status, clean page name, CTA "Learn more", and destination link.
2. **FIXTURE-02 (carousel_multi_card)**: Multi-slide carousel ad containing multiple headlines, horizontal scroll container, and multiple destination URLs.
3. **FIXTURE-03 (disclaimer_political_ad)**: Political issue ad featuring sponsored disclaimer badge, estimated spend bracket ($1K-$5K), and impression brackets.
4. **FIXTURE-04 (eu_date_localization)**: Ad rendered in German locale with date "24. Oktober 2024" and localized CTA "Mehr dazu".
5. **FIXTURE-05 (direct_contact_lead)**: Lead gen ad embedding explicit agent email and E.164 phone number directly inside the primary creative copy.
6. **FIXTURE-06 (truncated_text_unexpanded)**: Long copy ad with "See more" ellipsis that was captured prior to expansion, exercising truncation detection.
7. **FIXTURE-07 (video_creative_card)**: Video-centric ad with zero textual body copy, verifying non-fatal body handling and media classification.
8. **FIXTURE-08 (inactive_scheduled_ad)**: Stopped ad featuring both "Started running on" and "Stopped running on" dates.
9. **FIXTURE-09 (corrupted_id_card)**: Anomalous card with missing Library ID text node, asserting fatal rejection rule execution.
10. **FIXTURE-10 (mutated_dom_layout)**: Card with stripped ARIA roles and scrambled child hierarchy, testing heuristic fallback recovery.`
  },

  'p3-benchmarks': {
    title: '# 21. Performance Constraints & Throughput Benchmarks',
    content: `### Rigorous Performance Ceilings
To prevent the extraction pipeline from becoming an automation bottleneck, Phase 03 is governed by strict compute constraints:

- **Per-Card Processing Latency**: $\\le 12.0\\text{ ms}$ on standard single-core container (2.4 GHz vCPU).
  - Target breakdown: Ingestion (1ms), Parsing (5ms), Provenance (2ms), Normalization (2ms), Validation (2ms).
- **Throughput Capacity**: Capable of processing $\\ge 80\\text{ cards/second}$ per worker thread without backpressure.
- **Memory Footprint**:
  - Max heap allocation: $\\le 256\\text{ MB}$ under steady 1,000 card burst.
  - Zero memory leaks: DOM tree references are dereferenced immediately after provenance generation.
- **CPU Determinism**: Purely synchronous CPU operations; zero async network I/O during extraction.`
  },

  'p3-acceptance-audit': {
    title: '# 22. 35-Point Production Acceptance Audit',
    content: `### Complete 35-Point Acceptance Audit
Every criterion must be rigorously evaluated before Phase 03 is deemed production-ready.

1. **AUDIT-01 (Traceability)**: Phase 03 directly consumes Phase 02 \`RawCardObservation\` without browser lifecycle coupling.
2. **AUDIT-02 (Traceability)**: Checkpoint correlation maintains monotonic sequence alignment with Phase 02.
3. **AUDIT-03 (Observability)**: All extracted fields originate from verifiable DOM nodes or attributes.
4. **AUDIT-04 (Observability)**: Zero speculative inference or synthetic demographic estimation is performed.
5. **AUDIT-05 (Pipeline Architecture)**: 6 distinct pipeline stages execute sequentially in a unidirectional DAG.
6. **AUDIT-06 (Raw Contract)**: \`RawCardObservation\` contains immutable \`snapshotHash\` SHA-256 digest.
7. **AUDIT-07 (Field Locators)**: All 24 public data fields have primary and verified fallback locators.
8. **AUDIT-08 (ID Extraction)**: Library ID extraction verifies numeric format (10-20 digits).
9. **AUDIT-09 (Status Classification)**: Ad status accurately resolves to ACTIVE, INACTIVE, or UNKNOWN.
10. **AUDIT-10 (Page Extraction)**: Advertiser page name and profile link extract with zero trailing noise.
11. **AUDIT-11 (Date Parsing)**: Multilingual date parser handles US, UK, German, Spanish, and French locales.
12. **AUDIT-12 (CTA Taxonomy)**: CTA labels are deterministically classified into rigid 11-member enum.
13. **AUDIT-13 (URL Normalization)**: Tracking parameters (fbclid, utm_*) are stripped; root domain extracted.
14. **AUDIT-14 (Phone E.164)**: Advertised phone numbers are normalized to international E.164 format.
15. **AUDIT-15 (Provenance DAG)**: Every field in \`NormalizedAdRecord\` has an accompanying \`ProvenanceNode\`.
16. **AUDIT-16 (Cardinal Questions)**: Provenance answers: What is value, Where from, How transformed, How certain.
17. **AUDIT-17 (Evidence Preservation)**: Raw snippet and DOM evidence hash are stored for every field.
18. **AUDIT-18 (Confidence Formula)**: Mathematical formula computes composite confidence with anomaly penalties.
19. **AUDIT-19 (Gating Policy)**: Confidence gating enforces PASS (>=0.80), FLAGGED (0.60-0.79), REJECT (<0.60).
20. **AUDIT-20 (Unicode Sanitization)**: NFKC Unicode normalization eliminates zero-width spaces and control glyphs.
21. **AUDIT-21 (DOM Mutation Trap)**: Fires alert when 3 consecutive cards trigger fallback locators.
22. **AUDIT-22 (Duplicate Trap)**: Identifies and reconciles duplicate Library ID collisions in single batch.
23. **AUDIT-23 (TypeScript Schemas)**: Strict TypeScript interfaces defined for all payloads and envelopes.
24. **AUDIT-24 (Runtime Validation)**: Zod schemas validate field constraints and data types at runtime.
25. **AUDIT-25 (Fatal Invariants)**: Instant rejection triggered on missing Library ID, blank Page Name, or bad dates.
26. **AUDIT-26 (Semantic Integrity)**: Cross-field consistency asserts Active ads cannot have past end dates.
27. **AUDIT-27 (Canonical Envelope)**: \`CanonicalAdEnvelope\` encapsulates record, provenance, and validation report.
28. **AUDIT-29 (Offline Replay)**: Deterministic replay runner achieves identical output across identical inputs.
29. **AUDIT-29 (Anti-Fragility)**: Zero selectors rely on obfuscated/hashed Meta CSS classnames.
30. **AUDIT-30 (Non-Goals)**: Zero Meta private API calls, GraphQL interceptions, or CAPTCHA bypasses.
31. **AUDIT-31 (Telemetry)**: Prometheus metrics instrument latencies, throughput, and field drop rates.
32. **AUDIT-32 (Error Taxonomy)**: Hierarchical error codes (EXT-1000 to EXT-5099) classify all failure modes.
33. **AUDIT-33 (Phase 04 Handoff)**: Handoff payload interface declared for downstream entity resolution.
34. **AUDIT-34 (Fixture Suite)**: 10 synthetic test fixtures exercise all ad variants and edge cases.
35. **AUDIT-35 (Performance)**: Per-card processing latency verified <= 12ms with <= 256MB memory cap.`
  },

  'p3-handoff-contract-json': {
    title: '# 23. Phase-03 Handoff Contract (Machine-Readable JSON)',
    content: `### Machine-Readable Handoff Contract Export
The authoritative specification metadata, version numbers, interface signatures, and operational boundaries are codified into the Phase 03 Handoff JSON.

\`\`\`json
{
  "phase": "PHASE_03",
  "title": "DATA_EXTRACTION_NORMALIZATION_VALIDATION_PROVENANCE",
  "version": "3.0.0-PROD",
  "upstreamContract": {
    "provider": "PHASE_02_BROWSER_WORKER",
    "interface": "IExtractionAdapter.extractBatch()",
    "payloadType": "RawCardObservation[]"
  },
  "downstreamContract": {
    "consumer": "PHASE_04_IDENTITY_RESOLUTION",
    "interface": "IIdentityClusteringConsumer.ingestCanonicalAd()",
    "payloadType": "CanonicalAdEnvelope"
  },
  "extractionModel": {
    "engine": "Deterministic DOM & RegEx Pipeline",
    "observableFieldsCount": 24,
    "confidenceGating": {
      "passThreshold": 0.80,
      "flaggedThreshold": 0.60
    }
  },
  "provenanceModel": {
    "cardinalQuestionsEnforced": true,
    "evidenceHashingAlgorithm": "SHA-256",
    "lineageGraphSupported": true
  },
  "complianceInvariants": {
    "noMetaApiUsage": true,
    "noGraphQLInterception": true,
    "noCaptchaBypass": true,
    "noObfuscatedCssClasses": true,
    "deterministicReplayGuaranteed": true
  },
  "auditCriteriaTotal": 35,
  "auditCriteriaPassed": 35,
  "status": "APPROVED_FOR_IMPLEMENTATION"
}
\`\`\``
  }
};
