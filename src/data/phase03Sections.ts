export interface Phase03Section {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  category: 'traceability' | 'pipeline' | 'provenance' | 'schema' | 'validation' | 'replay' | 'audit' | 'handoff';
}

export const PHASE_03_SECTIONS: Phase03Section[] = [
  {
    id: 'p3-traceability',
    number: 1,
    title: '# 01. Phase-02 Traceability & Upstream Contract',
    subtitle: 'Binding Phase 03 extraction to Phase 02 Browser Worker checkpoints, event stream, and locator boundaries.',
    category: 'traceability'
  },
  {
    id: 'p3-observability-model',
    number: 2,
    title: '# 02. Public-Data Assumptions & Observability Model',
    subtitle: 'Strict boundaries of public web rendering: what is reliably observable vs unobservable illusions.',
    category: 'traceability'
  },
  {
    id: 'p3-pipeline-architecture',
    number: 3,
    title: '# 03. Extraction Pipeline Architecture (6 Stages)',
    subtitle: 'Deterministic 6-stage DAG: Ingestion, Parsing, Lineage Mapping, Normalization, Validation, and Canonical Emission.',
    category: 'pipeline'
  },
  {
    id: 'p3-raw-observation-contract',
    number: 4,
    title: '# 04. Raw Card Observation Contract',
    subtitle: 'Data structure for raw card snapshots, boundary rects, SHA-256 evidence hashing, and DOM isolation.',
    category: 'schema'
  },
  {
    id: 'p3-field-extraction-spec',
    number: 5,
    title: '# 05. Field-by-Field Extraction Specification',
    subtitle: 'Exhaustive semantic locators, fallback tiers, attribute parsing, and extraction failure rules for 24 public fields.',
    category: 'pipeline'
  },
  {
    id: 'p3-provenance-graph',
    number: 6,
    title: '# 06. Provenance Graph & Field-Level Lineage DAG',
    subtitle: '4 cardinal provenance questions: Value, Source Locator, Transformation History, and Confidence Rationale.',
    category: 'provenance'
  },
  {
    id: 'p3-confidence-scoring',
    number: 7,
    title: '# 07. Ambiguity & Confidence Scoring Engine',
    subtitle: 'Mathematical confidence weighting formula, penalty deductions, and gating thresholds (Pass, Flagged, Reject).',
    category: 'provenance'
  },
  {
    id: 'p3-normalization-rules',
    number: 8,
    title: '# 08. Deterministic Normalization Rules',
    subtitle: 'Standardization rules: ISO-8601 dates, E.164 phones, UTM removal, CTA taxonomy, and Unicode NFKC.',
    category: 'pipeline'
  },
  {
    id: 'p3-evidence-capture-policy',
    number: 9,
    title: '# 09. Evidence Capture & Snapshot Retention Policy',
    subtitle: 'DOM node containment, binary hashing, snippet sanitization, and cryptographic immutability boundaries.',
    category: 'provenance'
  },
  {
    id: 'p3-anomaly-detection',
    number: 10,
    title: '# 10. Anomaly Detection & Layout Mutation Traps',
    subtitle: 'Trap triggers for DOM re-renders, missing containers, unexpected disclaimer injections, and rate limits.',
    category: 'validation'
  },
  {
    id: 'p3-schema-contracts',
    number: 11,
    title: '# 11. Schema Contracts & TypeScript / Zod Definitions',
    subtitle: 'Strict TypeScript interfaces and runtime validation schemas governing raw, normalized, and canonical states.',
    category: 'schema'
  },
  {
    id: 'p3-validation-rules',
    number: 12,
    title: '# 12. Multi-Tiered Validation & Invariant Enforcement',
    subtitle: 'Fatal vs Non-Fatal validation taxonomy, cross-field integrity assertions, and quarantine policies.',
    category: 'validation'
  },
  {
    id: 'p3-canonical-emission',
    number: 13,
    title: '# 13. Canonical Record Emission Contract',
    subtitle: 'The authoritative CanonicalAdEnvelope data payload emitted to downstream queues and databases.',
    category: 'schema'
  },
  {
    id: 'p3-replay-harness',
    number: 14,
    title: '# 14. Offline Replay Harness & Determinism Proof',
    subtitle: 'Zero-network local fixture evaluation ensuring identical DOM inputs produce byte-identical canonical JSON.',
    category: 'replay'
  },
  {
    id: 'p3-resilience-mutations',
    number: 15,
    title: '# 15. Resilience to Minor UI Mutations',
    subtitle: 'Heuristic fallback chains, anti-obfuscation rules, and resilience against Meta CSS class name churning.',
    category: 'pipeline'
  },
  {
    id: 'p3-non-goals',
    number: 16,
    title: '# 16. Non-Goals & Absolute Boundaries',
    subtitle: 'Explicit non-goals: Zero private APIs, zero CAPTCHA bypasses, zero stealth proxies, zero speculative hallucination.',
    category: 'traceability'
  },
  {
    id: 'p3-telemetry-metrics',
    number: 17,
    title: '# 17. Telemetry, Extraction Metrics & Structured Audit Logs',
    subtitle: 'Prometheus metrics, latency timers, field drop rates, and JSON-structured audit event schemas.',
    category: 'audit'
  },
  {
    id: 'p3-error-codes',
    number: 18,
    title: '# 18. Hierarchical Error Taxonomy (EXT-1000 to EXT-5099)',
    subtitle: 'Classified extraction error codes, severity levels, retry classifications, and alerting escalation paths.',
    category: 'validation'
  },
  {
    id: 'p3-phase-04-handoff-spec',
    number: 19,
    title: '# 19. Phase 04 Inter-Phase Interface Specification',
    subtitle: 'Contractual handoff specification for Phase 04 Identity Resolution, Page Clustering, and Lead Deduplication.',
    category: 'handoff'
  },
  {
    id: 'p3-fixture-suite-spec',
    number: 20,
    title: '# 20. Synthetic Test Fixture Suite Specification',
    subtitle: 'Catalog of 10 synthetic test scenarios covering all ad variants, languages, disclaimers, and edge cases.',
    category: 'replay'
  },
  {
    id: 'p3-benchmarks',
    number: 21,
    title: '# 21. Performance Constraints & Throughput Benchmarks',
    subtitle: 'Parsing time ceilings (<=12ms/card), heap allocations, garbage collection constraints, and streaming backpressure.',
    category: 'pipeline'
  },
  {
    id: 'p3-acceptance-audit',
    number: 22,
    title: '# 22. 35-Point Production Acceptance Audit',
    subtitle: 'Exhaustive 35-item formal checklist verifying mathematical correctness, integrity, and safety.',
    category: 'audit'
  },
  {
    id: 'p3-handoff-contract-json',
    number: 23,
    title: '# 23. Phase-03 Handoff Contract (Machine-Readable JSON)',
    subtitle: 'Complete JSON export declaring phase metadata, schema versions, adapter contracts, and operational parameters.',
    category: 'handoff'
  }
];
