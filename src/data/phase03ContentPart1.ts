export const PHASE_03_CONTENT_PART_1: Record<string, { title: string; content: string }> = {
  'p3-traceability': {
    title: '# 01. Phase-02 Traceability & Upstream Contract',
    content: `### Architectural Traceability to Phase 02 Browser Worker
Phase 03 does NOT initiate browser instances, manage network contexts, manipulate scroll positions, or execute page-level search queries. Those responsibilities are strictly bound to the **Phase 02 Browser Worker** (Playwright execution daemon).

Instead, Phase 03 implements the downstream **Data Extraction, Normalization, Validation & Provenance Engine**. It interfaces directly with Phase 02 via two distinct upstream interfaces:

1. **\`IExtractionAdapter.extractBatch()\` Invocation**: When the Phase 02 worker transitions from \`RESULTS_READY\` to \`RESULTS_STABILIZING\` to \`EXTRACTION_STARTED\`, it passes an isolated snapshot of raw DOM card elements (or pre-extracted raw card observation envelopes) to Phase 03.
2. **Deterministic Checkpoint Correlation**: Every card observation emitted by Phase 03 is tagged with the Phase 02 \`jobId\`, \`runId\`, \`sequenceNumber\`, and \`batchSequence\`. If Phase 02 encounters a defensive block or rate limit and freezes, Phase 03 guarantees that all card records up to the exact last committed checkpoint are deterministically validated and committed, with zero duplicate ingestion or orphaned records.

### Contractual Guarantees Inherited from Phase 02
Phase 03 relies upon the following authoritative guarantees established in Phase 02:

- **Stable DOM Tree**: Phase 02 guarantees that before handing a card DOM node to Phase 03, the page has achieved DOM stillness for at least 650ms (\`RESULTS_STABILIZING\`), ensuring no in-flight lazy-hydration or dynamic font reflow is mutating the element.
- **Card Boundary Isolation**: Phase 02 identifies each ad card root container via semantic locators (\`div[role="article"]\` or verified fallback \`div[data-testid="ad-card"]\`) and captures its absolute bounding client rectangle.
- **Defensive Safety Decoupling**: If Phase 02 detects an access challenge, login barrier, or block, it emits \`CHALLENGE_DETECTED\` or \`BLOCKED\` and terminates navigation. Phase 03 never interacts with security barriers; it operates purely as an offline or in-process deterministic transformer.

\`\`\`typescript
export interface Phase02ToPhase03HandoffPayload {
  jobId: string;
  runId: string;
  workerId: string;
  batchSequence: number;
  scrollOffset: number;
  extractedCards: RawCardObservation[];
  captureTimestamp: string;
}
\`\`\``
  },

  'p3-observability-model': {
    title: '# 02. Public-Data Assumptions & Observability Model',
    content: `### Philosophy of Public Observability
In public web extraction, there is a fundamental distinction between:
1. **Legitimately Observable Evidence**: Content rendered directly into the Document Object Model (DOM) as textual nodes, standard semantic HTML attributes (\`href\`, \`aria-label\`, \`src\`), or rendered metadata badges visible to any unauthenticated public visitor.
2. **Fabricated or Speculative Inferences**: Unverified assumptions regarding an advertiser's intent, private CRM endpoints, hidden backends, unrendered campaign IDs, or speculative targeting demographics.

Phase 03 enforces the **Strict Observability Rule**:
> *"If an attribute or datum cannot be traced to a verifiable DOM node, attribute, or deterministic mathematical derivation thereof, it MUST NOT be emitted in the canonical record. Nullability is vastly superior to fiction."*

### Matrix of Public Observability in Meta Ad Library

| Field Name | Publicly Observable? | Observable Source | Fallback Strategy |
| :--- | :--- | :--- | :--- |
| **Ad Library ID** | YES | Direct text badge \`Library ID: [0-9]+\` | Structural card footer metadata regex |
| **Status (Active/Inactive)** | YES | Text badge (\`Active\` / \`Inactive\`) & SVG icon status | Fail validation if unidentifiable |
| **Page Name** | YES | Header anchor link text \`a[role="link"]\` | Page header text container |
| **Page Profile URL** | YES | \`href\` attribute on page header link | Extracted page name fallback |
| **Start Date** | YES | Text string \`Started running on [Month Day, Year]\` | Multilingual regex parser (US/EU) |
| **End Date** | CONDITIONAL | Present only on inactive or scheduled ads | \`null\` if still running |
| **Primary Ad Copy** | YES | Container with \`div[style*="white-space: pre-wrap"]\` | First substantial paragraph in card |
| **Truncated Text ("See more")** | YES | Clickable button \`role="button", name="See more"\` | Phase 02 expands before handoff |
| **Call To Action (CTA)** | YES | Button or anchor element inside card footer | Classified to standard CTA taxonomy |
| **Destination URL** | CONDITIONAL | \`href\` on CTA button or media wrapper link | Cleaned domain fallback or \`null\` |
| **Platforms (FB, IG, etc.)** | YES | SVG icons with \`aria-label\` or platform titles | Array of verified platform tokens |
| **Disclaimer / Sponsor** | CONDITIONAL | Required only on Social Issues, Elections or Politics | \`null\` on commercial lead gen ads |
| **Targeting Demographics** | NO (UNAUTHENTICATED) | Not rendered in public unauthenticated card view | Explicitly excluded (\`null\`) |
| **Actual Ad Spend ($)** | CONDITIONAL | Range rendered only for political/disclaimer ads | Estimated min/max range or \`null\` |
| **Impressions Count** | CONDITIONAL | Range rendered only for political/disclaimer ads | Estimated min/max range or \`null\` |

### The "Zero Speculation" Invariant
Any attempt to calculate or guess targeting parameters, unobservable conversion rates, or private advertiser emails without explicit text in the ad creative is classified as an architectural breach.`
  },

  'p3-pipeline-architecture': {
    title: '# 03. Extraction Pipeline Architecture (6 Stages)',
    content: `### The 6-Stage Deterministic Extraction Pipeline
Data transformation inside Phase 03 executes as a strictly sequential, unidirectional Directed Acyclic Graph (DAG). Every card passes through six explicit stages:

\`\`\`
[1. INGESTION] -> [2. PARSING] -> [3. PROVENANCE MAPPING] -> [4. NORMALIZATION] -> [5. VALIDATION] -> [6. EMISSION]
\`\`\`

#### Stage 1: Raw Ingestion & Boundary Snapshotting
- Receives the DOM node or serialized HTML string from Phase 02.
- Calculates SHA-256 checksum over the raw outer HTML.
- Extracts spatial geometry (\`boundingClientRect\`) to detect off-screen rendering anomalies.
- Assigns immutable \`observationId\` UUIDv4.

#### Stage 2: Semantic Field Parsing & Extraction
- Iterates through the registered selector catalog for each public field.
- Executes primary semantic locators (\`aria-label\`, \`role\`, clean text matching).
- If primary locator yields null, executes verified secondary and structural fallbacks in order.
- Captures raw textual substrings and attribute values before any sanitization.

#### Stage 3: Provenance Graph Construction
- For each extracted field, creates an immutable \`ProvenanceNode\`.
- Answers the 4 cardinal provenance questions:
  1. What is the extracted raw value?
  2. Exactly which selector or DOM path supplied it?
  3. What transformations have been applied?
  4. What is the mathematical confidence score?
- Links field nodes into a per-card provenance DAG.

#### Stage 4: Deterministic Normalization
- Applies mathematical, deterministic standardizations (no LLM, no nondeterministic regex):
  - Dates: Parses multilingual strings to ISO-8601 \`YYYY-MM-DD\`.
  - Phone numbers: Normalizes to international E.164 standard (\`+1XXXXXXXXXX\`).
  - URLs: Strips marketing UTM telemetry parameters (\`utm_source\`, \`fbclid\`, \`gclid\`), canonicalizes hostnames.
  - CTA strings: Classifies into a rigid 11-member enum taxonomy.
  - Unicode: Normalizes via Unicode Standard Annex #15 (NFKC normalization).

#### Stage 5: Multi-Tiered Validation & Integrity Enforcement
- Runs strict schema and invariant checks:
  - Fatal Rules: Mandatory \`adLibraryId\` format, non-empty \`pageName\`, valid ISO start date.
  - Cross-field Consistency: End date must not precede start date; Active ads cannot have past end dates.
  - Confidence Gate: Composite card confidence must meet >= 0.80 for automated promotion.

#### Stage 6: Canonical Record & Provenance Envelope Emission
- Wraps the validated record into a \`CanonicalAdEnvelope\`.
- Emits to downstream Phase 04 queue and local append-only JSONL storage.
- Records structured telemetry metrics.`
  },

  'p3-raw-observation-contract': {
    title: '# 04. Raw Card Observation Contract',
    content: `### Contract Definition: RawCardObservation
The raw observation envelope represents the unadulterated, frozen evidence captured directly from the browser runtime before any transformation or interpretation occurs.

\`\`\`typescript
export interface RawCardObservation {
  /** Unique UUIDv4 identifying this specific card snapshot */
  observationId: string;
  
  /** Parent extraction job identifier */
  jobId: string;
  
  /** Upstream Phase 02 browser worker run identifier */
  runId: string;
  
  /** Monotonic checkpoint sequence index */
  batchSequence: number;
  
  /** 0-based card index within the current page batch */
  cardIndex: number;
  
  /** UTC timestamp in ISO-8601 format when the DOM node was captured */
  capturedAt: string;
  
  /** Complete outerHTML string of the card container element */
  rawOuterHtml: string;
  
  /** InnerText representation with layout line breaks preserved */
  rawTextContent: string;
  
  /** SHA-256 hex digest of rawOuterHtml for cryptographic evidence verification */
  snapshotHash: string;
  
  /** Spatial bounding box of the card at time of capture */
  boundingClientRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  /** All root HTML attributes observed on the container (e.g. data-ad-id, role, class) */
  observedAttributes: Record<string, string>;
}
\`\`\`

### Immutability & Audit Guarantee
Once instantiated, a \`RawCardObservation\` is treated as read-only. Downstream transformation stages must never mutate this object. The \`snapshotHash\` allows any auditor in Phase 03 or downstream in Phase 04 to verify that the raw evidence has not been tampered with or corrupted in memory.`
  },

  'p3-field-extraction-spec': {
    title: '# 05. Field-by-Field Extraction Specification',
    content: `### Detailed Extraction Locators & Strategies
Phase 03 establishes explicit locator chains for all 24 public data fields. Each field defines:
- Primary Locator (Semantic, Role, or ARIA-based)
- Fallback Tier 1 (Structural or Text-based)
- Fallback Tier 2 (Scoped CSS or Parent-relative)
- Failure Behavior (FATAL vs NULL_ALLOWED)

#### 1. Ad Library ID
- **Target**: Unique numeric Meta Ad Library identifier.
- **Primary Locator**: Text node matching regex \`/Library ID:\\s*(\\d+)/i\`.
- **Fallback 1**: Attribute \`[data-ad-id]\` on root container or child element.
- **Fallback 2**: Anchor tag URL containing parameter \`?id=(\\d+)\`.
- **Failure Behavior**: **FATAL**. If missing, card cannot be identified.

#### 2. Ad Status (Active / Inactive)
- **Target**: Boolean/Enum operational state.
- **Primary Locator**: \`span[role="status"], div[role="status"]\` containing "Active" or "Inactive".
- **Fallback 1**: Direct text search in card header for token \`"Active"\` or \`"Inactive"\`.
- **Fallback 2**: SVG icon \`aria-label\` containing status indicator.
- **Failure Behavior**: Default to \`UNKNOWN\` with confidence penalty (-0.15).

#### 3. Advertiser Page Name
- **Target**: Public Facebook/Instagram Page Name.
- **Primary Locator**: Header link \`a[role="link"]\` within the first 200px of card height.
- **Fallback 1**: \`span\` containing page title preceding the "Sponsored" label.
- **Fallback 2**: Image \`alt\` text on advertiser avatar image \`img[alt]\`.
- **Failure Behavior**: **FATAL**. Unidentified advertiser is invalid.

#### 4. Advertiser Page Profile URL
- **Target**: Canonical Facebook/Instagram Page URL.
- **Primary Locator**: \`href\` attribute on header link \`a[role="link"]\`.
- **Fallback 1**: Derived from avatar link wrapper.
- **Failure Behavior**: \`null\` allowed; fallback to page search.

#### 5. Start Date & End Date
- **Target**: Campaign lifecycle timestamps.
- **Primary Locator**: Text node matching \`/Started running on\\s+([A-Za-z0-9,\\s]+)/\`.
- **Multilingual Support**: Supports German (\`Läuft seit\`), Spanish (\`En circulación desde\`), French (\`Diffusion commencée le\`).
- **End Date Locator**: Text node matching \`/Stopped running on\\s+([A-Za-z0-9,\\s]+)/\`.
- **Failure Behavior**: Start Date missing = **ERROR** (confidence penalty -0.30); End Date missing = normal for active ads.

#### 6. Primary Ad Creative Text (Body Copy)
- **Target**: Main marketing copy.
- **Primary Locator**: Container with style \`white-space: pre-wrap\` or \`div[data-testid="ad-body"]\`.
- **Fallback 1**: First text container exceeding 40 characters in card body.
- **Failure Behavior**: \`""\` allowed only if creative media is purely video or image.

#### 7. Call To Action (CTA) & Destination Link
- **Target**: Lead generation conversion hook.
- **Primary Locator**: Interactive element \`a[role="button"], button\` within the card action bar.
- **Destination URL**: \`href\` on CTA button or outer card anchor.
- **Failure Behavior**: CTA missing = categorized as \`OTHER\` or \`null\`. Destination URL missing = \`null\`.`
  },

  'p3-provenance-graph': {
    title: '# 06. Provenance Graph & Field-Level Lineage DAG',
    content: `### The 4 Cardinal Questions of Data Lineage
For every single property in the canonical record, Phase 03 constructs a cryptographically anchored **Provenance Node** that answers:

1. **What is the value?** The exact extracted and normalized output.
2. **Where did it come from?** The precise DOM element selector, HTML attribute name, or regex capture group.
3. **How was it transformed?** The step-by-step list of pure transformation functions applied.
4. **How certain are we?** The calculated confidence score (0.00 to 1.00) with written algorithmic rationale.

### Provenance Node Data Structure
\`\`\`typescript
export interface ProvenanceNode {
  field: string;
  value: unknown;
  rawSnippet: string;
  sourceLocator: string;
  strategy: SelectorStrategy | 'SYNTHETIC_DERIVATION' | 'REGEX_EXTRACTION';
  captureTimestamp: string;
  transformations: string[];
  confidenceScore: number; // 0.00 to 1.00
  confidenceRationale: string;
  domEvidenceHash: string;
}
\`\`\`

### Example Lineage Trace for \`startDateIso\`
\`\`\`json
{
  "field": "startDateIso",
  "value": "2025-02-14",
  "rawSnippet": "Started running on Feb 14, 2025",
  "sourceLocator": "div[role='article'] >> text=/Started running on/",
  "strategy": "SEMANTIC_TEXT",
  "captureTimestamp": "2025-02-16T14:32:01.450Z",
  "transformations": [
    "regex_match: /Started running on\\\\s+(.+)/i",
    "trim_whitespace",
    "parse_date_locale: en-US",
    "format_iso_8601: YYYY-MM-DD"
  ],
  "confidenceScore": 0.98,
  "confidenceRationale": "Matched primary semantic text regex and successfully parsed standard US locale date",
  "domEvidenceHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
\`\`\`

### Auditing & Dispute Resolution
By preserving the \`rawSnippet\` and \`domEvidenceHash\` alongside the normalized output, Phase 03 ensures that if an upstream client questions a lead's phone number or advertiser name, the system can instantly generate a forensic audit receipt displaying the exact HTML characters from which the datum was extracted.`
  },

  'p3-confidence-scoring': {
    title: '# 07. Ambiguity & Confidence Scoring Engine',
    content: `### Mathematical Confidence Formulation
Every extracted field receives an individual confidence score $C_i \\in [0.00, 1.00]$. The composite card confidence $C_{card}$ is calculated as a weighted harmonic mean penalized by missing non-fatal fields or anomalous layout shifts:

$$C_{card} = \\frac{\\sum_{i=1}^{n} w_i}{\\sum_{i=1}^{n} \\frac{w_i}{C_i}} - P_{anomalies}$$

Where $w_i$ represents the architectural importance weight of field $i$:

| Field | Weight ($w_i$) | Strategy Baseline ($C_{base}$) | Fallback Penalty |
| :--- | :--- | :--- | :--- |
| **adLibraryId** | 0.25 | Primary: 1.00 | Fallback 1: -0.05, Regex: -0.10 |
| **pageName** | 0.20 | Primary: 1.00 | Fallback 1: -0.10, Fallback 2: -0.20 |
| **startDateIso** | 0.15 | Primary: 0.98 | Multilingual regex: -0.05 |
| **bodyText** | 0.15 | Primary: 0.95 | Layout fallback: -0.15 |
| **ctaNormalizedCategory** | 0.10 | Exact taxonomy match: 0.95 | Fuzzy match: -0.20 |
| **destinationUrl** | 0.10 | Direct href: 0.95 | Text extraction: -0.25 |
| **platforms** | 0.05 | SVG aria-label: 0.98 | Generic fallback: -0.20 |

### Anomaly Penalties ($P_{anomalies}$)
- Card container missing semantic \`role="article"\`: **-0.10**
- Truncated text could not be expanded: **-0.05**
- Unrecognized date format requiring heuristic fallback: **-0.15**
- Contradictory status indicators (e.g. text says Active but end date in past): **-0.25**

### Automated Gating Policy
- **$C_{card} \\ge 0.80$ (PASS)**: Automatically emitted to Phase 04 canonical ingestion stream.
- **$0.60 \\le C_{card} < 0.80$ (FLAGGED)**: Emitted to Phase 04 with \`FLAGGED_REVIEW\` status for supervised operator review.
- **$C_{card} < 0.60$ (REJECTED)**: Dropped from lead pipeline; quarantined in anomaly database for selector review.`
  },

  'p3-normalization-rules': {
    title: '# 08. Deterministic Normalization Rules',
    content: `### Deterministic Standardization Rules
Normalization in Phase 03 is purely deterministic, reproducible, and verifiable. It rejects all stochastic operations.

#### 1. Date Normalization (ISO-8601)
- All human-readable date strings are converted to \`YYYY-MM-DD\`.
- Handles multiple formats:
  - English (US): \`"Oct 24, 2024"\` $\\rightarrow$ \`"2024-10-24"\`
  - English (UK/EU): \`"24 Oct 2024"\` $\\rightarrow$ \`"2024-10-24"\`
  - German: \`"24. Oktober 2024"\` $\\rightarrow$ \`"2024-10-24"\`
  - Spanish: \`"24 de octubre de 2024"\` $\\rightarrow$ \`"2024-10-24"\`
  - French: \`"24 octobre 2024"\` $\\rightarrow$ \`"2024-10-24"\`
- If year is omitted in source UI (e.g. \`"Oct 24"\`), assumes current calendar year with an explicit provenance transformation tag.

#### 2. Phone Number Normalization (E.164)
- Identifies phone numbers in body copy or direct contact cards using regex.
- Strips punctuation, dashes, spaces, and brackets.
- Applies country-code heuristics based on advertiser locale (defaults to \`+1\` for US).
- Formats strictly as \`+[country_code][national_number]\` (e.g. \`+14155552671\`).

#### 3. URL Canonicalization & Telemetry Stripping
- Extracts raw URL from CTA button or body link.
- Resolves relative URLs against \`https://www.facebook.com\`.
- Strips common ad-tracking query parameters:
  - \`fbclid\`, \`utm_source\`, \`utm_medium\`, \`utm_campaign\`, \`utm_term\`, \`utm_content\`, \`gclid\`, \`msclkid\`.
- Extracts clean root domain (e.g. \`getsolarquote.com\`) for lead deduplication.

#### 4. Call To Action (CTA) Categorization Taxonomy
Maps diverse localized or custom button labels to a closed 11-member enum:
- \`"Learn more"\`, \`"En savoir plus"\`, \`"Mehr dazu"\` $\\rightarrow$ \`LEARN_MORE\`
- \`"Sign up"\`, \`"S'inscrire"\`, \`"Registrieren"\` $\\rightarrow$ \`SIGN_UP\`
- \`"Contact us"\`, \`"Nous contacter"\` $\\rightarrow$ \`CONTACT_US\`
- \`"Apply now"\`, \`"Postuler"\` $\\rightarrow$ \`APPLY_NOW\`
- \`"Get quote"\`, \`"Demander un devis"\` $\\rightarrow$ \`GET_QUOTE\`
- \`"Book now"\`, \`"Réserver"\` $\\rightarrow$ \`BOOK_NOW\`
- \`"Download"\`, \`"Télécharger"\` $\\rightarrow$ \`DOWNLOAD\`
- \`"Send message"\`, \`"Envoyer un message"\` $\\rightarrow$ \`SEND_MESSAGE\`
- \`"Shop now"\`, \`"Acheter"\` $\\rightarrow$ \`SHOP_NOW\`
- \`"Subscribe"\`, \`"S'abonner"\` $\\rightarrow$ \`SUBSCRIBE\`
- All others $\\rightarrow$ \`OTHER\`

#### 5. Unicode NFKC Normalization
- Normalizes all extracted strings using Unicode Normalization Form KC (Compatibility Decomposition followed by Canonical Composition).
- Eliminates zero-width spaces (\`\\u200B\`), non-breaking spaces (\`\\u00A0\`), soft hyphens (\`\\u00AD\`), and curly quotes (\`“\` $\\rightarrow$ \`"\`).`
  }
};
