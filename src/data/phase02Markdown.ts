export interface Phase02Section {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  category: 'traceability' | 'architecture' | 'navigation' | 'reliability' | 'testing' | 'handoff';
}

export const PHASE_02_SECTIONS: Phase02Section[] = [
  { id: "p2-traceability", number: 1, title: "# 1. PHASE 01 TRACEABILITY", subtitle: "Traceability matrix linking Phase 02 decisions directly to Phase 01 ADRs and boundaries", category: "traceability" },
  { id: "p2-worker-arch", number: 2, title: "# 2. BROWSER WORKER ARCHITECTURE", subtitle: "C4 container model and structural boundaries of apps/browser-worker", category: "architecture" },
  { id: "p2-module-matrix", number: 3, title: "# 3. MODULE RESPONSIBILITY MATRIX", subtitle: "Explicit boundaries between generic worker modules and Meta-specific adapters", category: "architecture" },
  { id: "p2-worker-lifecycle", number: 4, title: "# 4. WORKER LIFECYCLE", subtitle: "Process management, heartbeat emission, and lease renewal loops", category: "architecture" },
  { id: "p2-browser-lifecycle", number: 5, title: "# 5. BROWSER / CONTEXT / PAGE LIFECYCLE", subtitle: "Strict isolation policies: one BrowserContext per scrape job", category: "architecture" },
  { id: "p2-nav-engine", number: 6, title: "# 6. NAVIGATION ENGINE", subtitle: "Preconditions, postconditions, and actions for public search navigation", category: "navigation" },
  { id: "p2-meta-adapter", number: 7, title: "# 7. META ADAPTER CONTRACT", subtitle: "Complete TypeScript interface specifications for INavigationAdapter and IExtractionAdapter", category: "navigation" },
  { id: "p2-page-fsm", number: 8, title: "# 8. PAGE STATE MACHINE", subtitle: "15-state deterministic page FSM with multi-signal evidence verification", category: "navigation" },
  { id: "p2-selector-strategy", number: 9, title: "# 9. SELECTOR STRATEGY", subtitle: "Semantic role hierarchy, auto-waiting, and elimination of arbitrary sleeps", category: "navigation" },
  { id: "p2-selector-registry", number: 10, title: "# 10. SELECTOR REGISTRY DESIGN", subtitle: "Centralized, versioned selector repository with automated diagnostic fallbacks", category: "navigation" },
  { id: "p2-search-model", number: 11, title: "# 11. SEARCH / FILTER EXECUTION MODEL", subtitle: "Fast-fail parameter validation and UI form interaction procedures", category: "navigation" },
  { id: "p2-stabilization", number: 12, title: "# 12. RESULT STABILIZATION MODEL", subtitle: "DOM mutation settling, card count stabilization, and hydration wait loops", category: "navigation" },
  { id: "p2-pagination", number: 13, title: "# 13. PAGINATION / INCREMENTAL COLLECTION", subtitle: "Safe scroll incrementation, batch offset indexing, and end-of-results sentinel confirmation", category: "navigation" },
  { id: "p2-detection", number: 14, title: "# 14. CHALLENGE / BLOCK / LOGIN DETECTION", subtitle: "Zero-evasion defense: instant halt, freeze checkpoint, and operator alert", category: "reliability" },
  { id: "p2-extraction-orch", number: 15, title: "# 15. EXTRACTION ORCHESTRATION", subtitle: "Raw card DOM isolation, provenance capture, and raw record packaging for Phase 03", category: "architecture" },
  { id: "p2-checkpoint", number: 16, title: "# 16. CHECKPOINT / RESUME MODEL", subtitle: "Monotonic cursor persistence, idempotency hashing, and deterministic resumption", category: "reliability" },
  { id: "p2-retry-timeout", number: 17, title: "# 17. RETRY / TIMEOUT / BACKOFF MODEL", subtitle: "Bounded exponential backoff with jitter for transient errors; zero retries for blocks", category: "reliability" },
  { id: "p2-cancellation", number: 18, title: "# 18. CANCELLATION / SHUTDOWN", subtitle: "Cooperative cancellation tokens, SIGTERM interceptors, and orphan process cleanup", category: "reliability" },
  { id: "p2-error-taxonomy", number: 19, title: "# 19. ERROR TAXONOMY IMPLEMENTATION", subtitle: "Structured error classes with severity, retryability flags, and diagnostic payloads", category: "reliability" },
  { id: "p2-observability", number: 20, title: "# 20. OBSERVABILITY EVENTS & METRICS", subtitle: "28 structured telemetry events and OpenTelemetry performance gauges", category: "reliability" },
  { id: "p2-security", number: 21, title: "# 21. SECURITY MODEL", subtitle: "Subprocess sandboxing, safe credential exclusion, and restricted network egress", category: "reliability" },
  { id: "p2-testing-arch", number: 22, title: "# 22. TESTING ARCHITECTURE", subtitle: "Multi-tiered test harness: Unit, Component, Fixture Replay, and Integration", category: "testing" },
  { id: "p2-fixture-design", number: 23, title: "# 23. FIXTURE DESIGN", subtitle: "10 synthetic HTML DOM snapshots reproducing normal, edge, and failure states", category: "testing" },
  { id: "p2-repo-changes", number: 24, title: "# 24. REPOSITORY / FILE CHANGES", subtitle: "File-level change plan across monorepo packages with risk assessments", category: "architecture" },
  { id: "p2-implementation-plan", number: 25, title: "# 25. IMPLEMENTATION PLAN", subtitle: "Staged execution roadmap for Phase 02 components and dependencies", category: "architecture" },
  { id: "p2-acceptance", number: 26, title: "# 26. ACCEPTANCE CHECKLIST", subtitle: "Formal verification of 31 Phase 02 technical acceptance criteria", category: "testing" },
  { id: "p2-handoff", number: 27, title: "# 27. PHASE-02 HANDOFF CONTRACT", subtitle: "Machine-readable Phase 02 JSON contract consumed by Phase 03", category: "handoff" }
];
