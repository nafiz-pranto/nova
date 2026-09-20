# Changelog

All notable changes to the **Meta Ad Library Lead Scraper** Chrome Extension are documented in this file.

---

## [1.0.0] - 2026-09-20 (Final Release Gate)

### Core Capabilities
- **Local Chrome Extension (MV3)**: Standalone Manifest V3 Chrome Extension operating purely locally via `chrome.tabs`, `chrome.scripting`, `chrome.storage.local`, and `chrome.sidePanel`.
- **Public Meta Ad Library Automation**: Automated public search URL construction, page navigation, rendered DOM card detection, and adaptive infinite scroll continuation.
- **Deterministic Lead Relevance Engine (Strategy v1)**:
  - Local, explainable, rule-based classification replacing blind card acceptance.
  - Multi-tiered scoring evaluating advertiser name, ad copy catalog terms, destination domain context, and commercial CTAs.
  - Negative conflict penalties rejecting sports clubs, healthcare clinics, gaming ads, and non-target industry advertisers.
  - Entity-level multi-ad aggregation ensuring high catalog coverage while preserving zero false positives.
- **Identity Resolution & Deduplication**:
  - Automatically merges multiple ad cards from identical advertisers.
  - Accumulates active ad counts and aggregates observed ad library IDs.
  - Preserves multi-keyword associations without inflating lead counts.
- **Accurate Detection & Quota Discipline**:
  - Strictly distinguishes `found` vs `not_found` states for Facebook Pages and destination websites.
  - Decodes Facebook link shims (`l.facebook.com/l.php?u=...`).
  - Quota tracks unique relevant leads; dynamically continues scrolling until target quota is reached or results are exhausted.
  - Accurate operational stop reasons: `TARGET_REACHED`, `SOURCE_EXHAUSTED`, `NO_NEW_RESULTS`, `USER_CANCELLED`, `BLOCKED`, `FATAL_ERROR`.
- **Formula-Safe CSV & JSON Export**:
  - Full RFC-4180 compliance with injection defense against `=, +, -, @, \t, \r`.
  - Transparent export of relevance decisions, scores, confidence levels, and active ad metrics.
- **Distribution Packages**:
  - Unpacked build directory in `./extension`.
  - Production distribution archive in `./extension.zip` and `./dist/meta-ad-library-lead-scraper-v1.0.0.zip`.
  - Non-technical 21-step installation guide in `INSTALL_GUIDE.md`.
