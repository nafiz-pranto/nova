export const PHASE_03_CONTENT_PART_2: Record<string, { title: string; content: string }> = {
  'p3-evidence-capture-policy': {
    title: '# 09. Evidence Capture & Snapshot Retention Policy',
    content: `### Evidence Preservation Architecture
To ensure legal defensibility, auditability, and reproducible research, Phase 03 enforces strict evidence capture policies.

#### 1. Isolated HTML Node Containment
- Phase 03 extracts and preserves the minimal enclosing DOM subtree for each card.
- Scripts, iframes, inline tracking beacons, and base64 video payloads are purged before hashing to prevent nondeterministic mutations and excessive memory consumption.
- The sanitized outer HTML is hashed via SHA-256:
  \`\`\`typescript
  const snapshotSha256 = crypto.createHash('sha256').update(sanitizedOuterHtml).digest('hex');
  \`\`\`

#### 2. Cold-Storage vs Hot-Storage Tiering
- **Hot Tier (PostgreSQL / In-Memory)**: Stores canonical fields, normalized scalars, and the structured \`ProvenanceGraph\` JSON.
- **Cold Tier (Append-Only Compressed JSONL / S3 / GCS)**: Stores raw outerHTML and visual bounding boxes referenced by \`rawSnapshotSha256\`.
- **Retention Schedule**:
  - Hot tier: Retained indefinitely for search and deduplication.
  - Cold tier: Retained for 90 days for forensic audit, then purged unless flagged for active research.

#### 3. Privacy & Sanitization Boundaries
- Unrelated third-party browser cookies, user session tokens, or local storage artifacts are NEVER captured.
- PII detected in creative text (e.g. advertiser agent contact numbers) is classified explicitly under \`leadGenIndicators\` and treated according to regional privacy compliance (GDPR/CCPA).`
  },

  'p3-anomaly-detection': {
    title: '# 10. Anomaly Detection & Layout Mutation Traps',
    content: `### Anomaly Traps and Defensive Circuit Breakers
The Meta Ad Library frontend is continuously tested by Meta's engineering teams through A/B testing and localized DOM refactors. Phase 03 establishes explicit runtime anomaly traps:

#### 1. DOM Mutation Trap
If 3 consecutive cards within a single batch fail primary semantic locators and fall back to structural/regex tiers, the pipeline fires:
\`\`\`
ALERT_UI_MUTATION_SUSPECTED (Code: EXT-3001)
\`\`\`
The batch is flagged, and an alert is dispatched to the Phase 02 worker to inspect whether the page DOM layout has fundamentally shifted.

#### 2. Card Fragmentation Trap
If a card container has an inner text length of fewer than 20 characters or a bounding height of less than 80px, it is classified as a ghost element or incomplete placeholder. The pipeline drops the node without corrupting the batch sequence.

#### 3. Duplicate ID Collision Trap
If an \`adLibraryId\` is extracted twice within the same page batch with differing body texts, the system records an anomaly:
\`\`\`
ANOMALY_DUPLICATE_ID_INCONSISTENCY (Code: EXT-3004)
\`\`\`
The cards are tagged with provenance timestamps, and the most complete record is retained while preserving both raw hashes for audit.

#### 4. Unexpected Disclaimer Injection
When an ad that is not classified as political suddenly exhibits a sponsored disclaimer or spend bracket, the anomaly handler dynamically expands the schema payload to capture the spend bracket without crashing the primary parser.`
  },

  'p3-schema-contracts': {
    title: '# 11. Schema Contracts & TypeScript / Zod Definitions',
    content: `### Authoritative Schema Definitions
Phase 03 defines strict TypeScript types mirrored by runtime Zod validation schemas to prevent data drift.

\`\`\`typescript
import { z } from 'zod';

export const CtaCategoryEnum = z.enum([
  'LEARN_MORE',
  'SIGN_UP',
  'CONTACT_US',
  'APPLY_NOW',
  'GET_QUOTE',
  'BOOK_NOW',
  'DOWNLOAD',
  'SEND_MESSAGE',
  'SHOP_NOW',
  'SUBSCRIBE',
  'OTHER'
]);

export const NormalizedAdRecordSchema = z.object({
  adLibraryId: z.string().regex(/^\\d{10,20}$/, 'Invalid Meta Ad Library numeric ID'),
  adStatus: z.enum(['ACTIVE', 'INACTIVE', 'UNKNOWN']),
  pageName: z.string().min(1, 'Page name cannot be empty'),
  pageProfileUrl: z.string().url().optional(),
  pageLikesCount: z.number().int().nonnegative().optional(),
  advertiserCategory: z.string().optional(),
  startDateIso: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/, 'Must be ISO-8601 date (YYYY-MM-DD)'),
  endDateIso: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/).optional(),
  bodyText: z.string(),
  truncatedTextExpanded: z.boolean(),
  ctaText: z.string().optional(),
  ctaNormalizedCategory: CtaCategoryEnum,
  destinationUrl: z.string().url().optional(),
  cleanDestinationDomain: z.string().optional(),
  creativeMediaCount: z.number().int().min(0),
  creativeMediaType: z.enum(['IMAGE', 'VIDEO', 'CAROUSEL', 'TEXT_ONLY', 'DHTML']),
  platforms: z.array(z.enum(['FACEBOOK', 'INSTAGRAM', 'AUDIENCE_NETWORK', 'MESSENGER'])),
  disclaimerText: z.string().optional(),
  spendRangeEstimated: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string()
  }).optional(),
  impressionsRangeEstimated: z.object({
    min: z.number(),
    max: z.number()
  }).optional(),
  leadGenIndicators: z.object({
    hasFormLeadHook: z.boolean(),
    hasDirectContactInfo: z.boolean(),
    extractedEmails: z.array(z.string().email()),
    extractedPhoneE164: z.array(z.string().regex(/^\\+[1-9]\\d{6,14}$/)),
    identifiedIntentSignals: z.array(z.string())
  })
});
\`\`\``
  },

  'p3-validation-rules': {
    title: '# 12. Multi-Tiered Validation & Invariant Enforcement',
    content: `### Validation Rule Hierarchy
Phase 03 divides validation into three strict tiers:

#### Tier 1: Fatal Invariant Rules (Instant Rejection)
If any of these rules are violated, the card cannot be salvaged and is immediately rejected from canonical emission:
- **RULE-FATAL-01**: \`adLibraryId\` must be non-empty, strictly numeric, and between 10 and 20 digits.
- **RULE-FATAL-02**: \`pageName\` must contain at least one non-whitespace character.
- **RULE-FATAL-03**: \`startDateIso\` must resolve to a valid calendar date between 2018-05-01 (Ad Library inception) and the current UTC date + 1 day.

#### Tier 2: Semantic Integrity Rules (Downgrade / Confidence Deduction)
Violations result in warnings and confidence penalties:
- **RULE-SEM-01**: If \`adStatus == 'ACTIVE'\`, \`endDateIso\` must be \`null\` or undefined.
- **RULE-SEM-02**: If \`endDateIso\` is present, \`endDateIso >= startDateIso\`.
- **RULE-SEM-03**: If \`destinationUrl\` is present, it must be a valid HTTP/HTTPS URL and not a \`javascript:\` pseudo-protocol.
- **RULE-SEM-04**: If \`creativeMediaType == 'CAROUSEL'\`, \`creativeMediaCount\` must be $\\ge 2$.

#### Tier 3: Format & Sanitization Assertions (Automatic Correction)
- **RULE-FMT-01**: Strip trailing query strings and hashes from \`pageProfileUrl\`.
- **RULE-FMT-02**: Normalize Unicode sequences to NFKC standard.
- **RULE-FMT-03**: Strip marketing tracking parameters from destination URLs.`
  },

  'p3-canonical-emission': {
    title: '# 13. Canonical Record Emission Contract',
    content: `### Envelope Specification: CanonicalAdEnvelope
The output of Phase 03 is the **CanonicalAdEnvelope**, a tamper-evident self-describing payload ready for consumption by Phase 04 (Identity Resolution) and Phase 05 (Storage).

\`\`\`typescript
export interface CanonicalAdEnvelope {
  /** Contract schema version */
  schemaVersion: '3.0.0-PROD';
  
  /** Unique execution run ID originating from Phase 02 Browser Worker */
  pipelineRunId: string;
  
  /** UUID of the raw observation evidence snapshot */
  observationId: string;
  
  /** Primary identifier from Meta Ad Library */
  adLibraryId: string;
  
  /** Composite confidence score between 0.00 and 1.00 */
  compositeConfidence: number;
  
  /** The fully normalized and validated ad record */
  record: NormalizedAdRecord;
  
  /** Field-by-field provenance map answering origin and transforms */
  provenanceGraph: Record<string, ProvenanceNode>;
  
  /** Complete audit of all validation checks performed */
  validationReport: ValidationReport;
  
  /** Cryptographic proof of the raw unedited DOM node */
  rawSnapshotSha256: string;
  
  /** UTC emission timestamp */
  emittedAt: string;
}
\`\`\`

### Idempotency Guarantee
The combination of \`adLibraryId\` and \`rawSnapshotSha256\` produces a deterministic idempotency key:
\`\`\`
idempotencyKey = sha256(adLibraryId + ":" + rawSnapshotSha256)
\`\`\`
If Phase 02 re-extracts the same card during pagination overlap or recovery restart, Phase 03 emits an identical idempotency key, allowing downstream sinks to execute zero-cost deduplication.`
  },

  'p3-replay-harness': {
    title: '# 14. Offline Replay Harness & Determinism Proof',
    content: `### Zero-Network Offline Replay Engine
A cornerstone requirement of Phase 03 is **100% deterministic offline replayability**. Given any historical HTML snapshot fixture, running the Phase 03 pipeline must yield byte-identical canonical JSON output across any environment, machine, or operating system.

#### Replay Test Harness Architecture
1. **Fixture Ingestion**: Replay runner loads raw HTML fixture files from \`/test/fixtures/cards/*.html\`.
2. **DOM Parser Binding**: In Node.js environments, JSDOM or Cheerio is bound; in browser environments, native \`DOMParser\` is utilized.
3. **Pipeline Invocation**: The exact production \`extractCard()\` and \`normalizeCard()\` functions are executed.
4. **Binary Comparison**: Emitted output is serialized with deterministic alphabetical key ordering and compared against the golden \`*.canonical.json\` artifact.

\`\`\`typescript
describe('Phase 03 Deterministic Replay Suite', () => {
  it('replays standard lead gen card with zero drift', async () => {
    const rawHtml = fs.readFileSync('test/fixtures/standard_lead_gen.html', 'utf8');
    const goldenJson = JSON.parse(fs.readFileSync('test/fixtures/standard_lead_gen.canonical.json', 'utf8'));
    
    const output = await extractionPipeline.processRawHtml(rawHtml);
    expect(output.record).toEqual(goldenJson.record);
    expect(output.compositeConfidence).toBeCloseTo(goldenJson.compositeConfidence, 4);
  });
});
\`\`\``
  },

  'p3-resilience-mutations': {
    title: '# 15. Resilience to Minor UI Mutations',
    content: `### Anti-Fragile Semantic Locator Hierarchy
Meta employs automated CSS minification that generates randomized class names (e.g. \`.x1n2onr6\`, \`.x1ja2u2z\`, \`.x78zum5\`). Any extraction system relying on these ephemeral classes will break within days.

Phase 03 enforces the **Strict Anti-Fragility Locator Hierarchy**:

1. **Semantic Roles & ARIA Attributes (Priority 1)**:
   - \`div[role="article"]\`
   - \`a[role="link"]\`
   - \`span[role="status"]\`
   - \`button[aria-label*="See more"]\`
2. **Accessible Names & Clean Text Relations (Priority 2)**:
   - Text matching invariant strings: \`"Library ID:"\`, \`"Started running on"\`, \`"Sponsored"\`.
3. **Structural Relative Hierarchy (Priority 3)**:
   - \`header > div:first-child > a\`
   - \`article > div:nth-child(2) > div:last-child\`
4. **Attribute Selectors (Priority 4)**:
   - \`[data-testid="ad-library-card"]\`
   - \`[data-ad-id]\`

### Prohibition of Obfuscated CSS Classes
The use of generated hashed classes (e.g. \`.x1...\`, \`.css-...\`) is strictly forbidden in Phase 03 selector definitions. Any PR introducing a selector containing hashed classnames is rejected by automated linting.`
  },

  'p3-non-goals': {
    title: '# 16. Non-Goals & Absolute Boundaries',
    content: `### Explicit Non-Goals & Architectural Hard Boundaries
To prevent scope creep, legal exposure, and technical debt, Phase 03 explicitly outlaws the following behaviors:

- **NON-GOAL 1: No Meta Private API or GraphQL Interception**: Phase 03 parses only publicly rendered DOM elements. It does not inspect network frames, decrypt private Facebook tokens, or reverse-engineer internal GraphQL endpoints.
- **NON-GOAL 2: No CAPTCHA or Challenge Solving**: If an access challenge appears, the pipeline halts immediately. It never attempts to bypass Cloudflare, reCAPTCHA, or Meta security screens.
- **NON-GOAL 3: No Stealth Evasion or Proxy Manipulation**: Phase 03 does not manage IP rotation, browser fingerprint spoofing, or canvas noise generation.
- **NON-GOAL 4: No PII Scraping from Non-Public Sources**: Only information openly published in the ad text (e.g., publicly advertised phone numbers or sales email addresses) is extracted. No external reverse-phone lookup or private profile scraping is performed.
- **NON-GOAL 5: No LLM / Hallucinatory Data Synthesis**: Field extraction and normalization use strictly deterministic parsing (regular expressions, date-fns, E.164 algorithms). Generative AI is prohibited from fabricating missing fields.`
  }
};
