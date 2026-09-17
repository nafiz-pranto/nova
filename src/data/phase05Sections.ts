export interface Phase05SpecSection {
  id: string;
  number: number;
  title: string;
  category:
    | 'TRACEABILITY'
    | 'SECURITY_SSRF'
    | 'RETRIEVAL_ARCHITECTURE'
    | 'EVIDENCE_MODEL'
    | 'CONSISTENCY_CONFLICT'
    | 'TEMPORAL_AUDIT'
    | 'TESTING_HANDOFF';
  summary: string;
  contentMarkdown: string;
}

export const PHASE_05_SPEC_SECTIONS: Phase05SpecSection[] = [
  {
    id: 'p5-sec-01',
    number: 1,
    title: 'PHASE-04 TRACEABILITY & SYSTEM BOUNDARIES',
    category: 'TRACEABILITY',
    summary: 'Direct lineage mapping from Phase 04 entity clusters and envelopes into verification targets and claim assertions.',
    contentMarkdown: `### 1. Lineage Contract from Phase 04

The Phase 05 Verification Subsystem does not discover entities independently or initiate open-ended crawling. It strictly ingests verified entities, canonical envelopes, and candidate pair clusters emitted by Phase 04:

\`\`\`
Phase-04 Entity / Envelope
       │
       ▼
Verification Target (Destination URL, Landing Page, Domain, Business Entity)
       │
       ▼
Verification Check (Claim Decomposition: Network, TLS, Content, Brand, Contact)
       │
       ▼
Field-Level Evidence (Source URL, Observed Value, Snippet, Extraction Method, Confidence)
       │
       ▼
Verification Conclusion (Multi-State Descriptor + Uncertainty + Conflicts)
       │
       ▼
Test Coverage (22 Synthetic Fixtures + 15 SSRF Attack Vectors)
\`\`\`

#### Field-Level Traceability Matrix
| Phase 04 Source Entity | Phase 05 Target | Verification Claims Evaluated | Evidence Class |
| :--- | :--- | :--- | :--- |
| \`CanonicalAdEnvelope.record.destinationUrl\` | \`AD_DESTINATION_URL\` | \`URL_SAFE\`, \`DOMAIN_RESOLVES\`, \`HTTPS_AVAILABLE\` | Technical Signal |
| \`CanonicalAdEnvelope.record.cleanDestinationDomain\` | \`DOMAIN_HOSTNAME\` | \`DOMAIN_RESOLVES\`, \`EMAIL_DOMAIN_CONSISTENT\` | Technical Signal |
| \`AdvertiserEntityRecord.canonicalPageName\` | \`ADVERTISER_IDENTITY\` | \`DESTINATION_MATCHES_ADVERTISER_NAME\` | Corroborating Signal |
| \`BusinessEntityCluster.canonicalName\` | \`BUSINESS_ENTITY\` | \`BUSINESS_NAME_VISIBLE\`, \`LEGAL_NAME_DISPLAYED\` | Anchor Evidence |
| \`Advertiser ↔ Destination Pair\` | \`ADVERTISER_DESTINATION_RELATIONSHIP\` | \`ADVERTISER_DESTINATION_CONSISTENT\`, \`SERVICE_CATEGORY_CONSISTENT\` | Consistency Check |
| Extracted Phones / Emails | \`PUBLIC_BUSINESS_INFO\` | \`CONTACT_INFO_PRESENT\`, \`PHONE_NUMBER_PUBLIC\`, \`ADDRESS_PUBLIC\` | Anchor Evidence |

#### Absolute System Decoupling
1. **Separation from Meta Scraper**: Website verification logic **never** runs inside the Playwright worker designated for Meta Ad Library card navigation.
2. **Untrusted Target Assumption**: Every destination URL originating from ad card text or landing link is treated as untrusted user input subject to mandatory SSRF filtering prior to dispatch.
3. **No Retroactive Entity Rewriting**: Phase 05 does not alter Phase 04 clusters; it publishes an independent verification envelope containing verified claims and conflict alerts.`
  },
  {
    id: 'p5-sec-02',
    number: 2,
    title: 'VERIFICATION SCOPE & NON-GOALS',
    category: 'TRACEABILITY',
    summary: 'Explicit functional ceiling: verified factual claims versus prohibited subjective opinion or reputation scoring.',
    contentMarkdown: `### 2. Strict Verification Scope

The verification engine establishes only whether publicly accessible evidence supports specific, measurable factual statements regarding an advertiser, landing URL, website domain, and business entity.

\`\`\`
OUTPUT = VERIFIED FACTS + EVIDENCE + CONFIDENCE + UNCERTAINTY
NOT = OPINION + ASSUMPTION + REPUTATION SCORE
\`\`\`

#### Supported Verification Targets
1. **Ad Destination URL**: Syntactic safety, protocol compliance, redirect chain, reachability.
2. **Landing Page**: Public accessibility, HTTP status, content type, text & meta tag presence.
3. **Domain / Hostname**: DNS A/AAAA resolution, public suffix boundary, email domain consistency.
4. **Advertiser Identity**: Exact and normalized token overlap between Facebook Page name and website title/footer.
5. **Apparent Business Entity**: Publicly displayed legal entity name, corporate registration disclaimer, copyright notices.
6. **Advertiser ↔ Destination Relationship**: Product/service alignment, public social links back to advertiser profile.
7. **Publicly Visible Business Information**: Business email, public phone, registered physical address.
8. **Public Website Health**: Response latency, certificate validity, canonical redirect resolution.

#### Immutable Non-Goals & Prohibitions
- **NO Meta API or Private Endpoints**: Zero utilization of Graph API, Marketing API, or internal token endpoints.
- **NO CAPTCHA / Anti-Bot Bypass**: If Cloudflare, Datadome, PerimeterX, or Google reCAPTCHA triggers, the target is flagged as \`BLOCKED\` or \`CAPTCHA_DETECTED\`. No automated solver or fingerprint spoofing is permitted.
- **NO Subjective Legitimacy Scoring**: The system never labels a company "trustworthy", "fraudulent", or "high quality".
- **NO Legal Ownership Assertions**: Unless an official government registry or explicit legal disclaimer is visibly quoted with source timestamp, "owned by" is forbidden.`
  },
  {
    id: 'p5-sec-03',
    number: 3,
    title: 'VERIFICATION CLAIM MODEL (DECOMPOSED CLAIMS)',
    category: 'EVIDENCE_MODEL',
    summary: 'Deconstruction of verification into 15 independent factual propositions rather than a single opaque boolean.',
    contentMarkdown: `### 3. Decomposed Claim Architecture

Under no circumstances does the engine emit a single \`verified = true|false\`. A binary flag conceals critical nuances (e.g., a website may be reachable, yet completely unrelated to the advertiser; or a website may be temporarily down, yet historical identity evidence is definitive).

\`\`\`
VerificationSummary
├── claims: [
│     Claim(URL_SAFE, supported: true, confidence: HIGH)
│     Claim(DOMAIN_RESOLVES, supported: true, confidence: HIGH)
│     Claim(HTTPS_AVAILABLE, supported: true, confidence: HIGH)
│     Claim(PAGE_REACHABLE, supported: true, confidence: HIGH)
│     Claim(BUSINESS_NAME_VISIBLE, supported: true, confidence: HIGH)
│     Claim(DESTINATION_MATCHES_ADVERTISER_NAME, supported: true, confidence: MEDIUM)
│     Claim(SERVICE_CATEGORY_CONSISTENT, supported: true, confidence: MEDIUM)
│     Claim(CONTACT_INFO_PRESENT, supported: false, confidence: HIGH)
│     Claim(LEGAL_NAME_DISPLAYED, supported: false, confidence: HIGH)
│   ]
├── evidence: [ ... ]
├── conflicts: [ ... ]
└── unresolvedClaims: [ ... ]
\`\`\`

#### The 15 Standard Claim Definitions
1. \`URL_SAFE\`: URL is well-formed http/https and passes all SSRF, loopback, private IP, and cloud metadata filters.
2. \`DOMAIN_RESOLVES\`: Hostname successfully resolves to public IPv4 or IPv6 addresses.
3. \`HTTPS_AVAILABLE\`: Transport Layer Security handshake succeeds with valid public PKI trust chain.
4. \`PAGE_REACHABLE\`: Web server returns HTTP 200–299 for initial request or bounded redirect sequence.
5. \`PAGE_CONTENT_ACCESSIBLE\`: HTML payload is valid, decodable text/html within byte limits and not an anti-bot challenge.
6. \`BUSINESS_NAME_VISIBLE\`: Clear brand or business title is visibly rendered in DOM title, H1, or logo text.
7. \`LEGAL_NAME_DISPLAYED\`: An explicit corporate designator (LLC, Inc, Ltd, GmbH) is present in footer or copyright.
8. \`CONTACT_INFO_PRESENT\`: At least one public communication channel (email, telephone, web form) is visible.
9. \`EMAIL_DOMAIN_CONSISTENT\`: Public contact email host matches the registrable domain of the landing page.
10. \`PHONE_NUMBER_PUBLIC\`: Valid E.164 phone number is prominently listed for customer contact.
11. \`ADDRESS_PUBLIC\`: Physical business street address or postal location is rendered on contact/about page.
12. \`SERVICE_CATEGORY_CONSISTENT\`: Core offerings described on destination match the ad creative context.
13. \`PUBLIC_PROFILE_LINK_PRESENT\`: Landing page explicitly links to the advertiser's Facebook/Instagram profile URL.
14. \`DESTINATION_MATCHES_ADVERTISER_NAME\`: Fuzzy/exact token match between Page name and observed site brand $\\ge 0.70$.
15. \`ADVERTISER_DESTINATION_CONSISTENT\`: Multi-factor synthesis corroborates that the page represents the advertiser.`
  },
  {
    id: 'p5-sec-04',
    number: 4,
    title: 'VERIFICATION STATE MODEL & DESCRIPTIVE STATUS',
    category: 'EVIDENCE_MODEL',
    summary: '11 categorical, descriptive verification lifecycle states without flattening into generic rankings.',
    contentMarkdown: `### 4. Categorical Verification States

Verification results are classified into descriptive operational states. These states reflect observed reality, not commercial quality:

\`\`\`
NOT_CHECKED ──► [SSRF Check] ──(Blocked)──► ERROR / BLOCKED
                     │
                 (Safe URL)
                     │
                     ▼
           [DNS & Reachability] ──(Down/404)──► UNAVAILABLE / INCONCLUSIVE
                     │
                 (Reachable)
                     │
                     ▼
           VERIFIED_PUBLIC_URL
           VERIFIED_DOMAIN_REACHABILITY
                     │
           [Content & Entity Extraction]
                     │
          ┌──────────┴────────────────────────┐
          ▼                                   ▼
(Brand & Offer Match)               (Contradictory / Spoofed)
          │                                   │
          ▼                                   ▼
VERIFIED_BUSINESS_IDENTITY_EVIDENCE   CONFLICTING_EVIDENCE
VERIFIED_ADVERTISER_DESTINATION_CONSISTENCY
\`\`\`

#### State Taxonomy
- \`NOT_CHECKED\`: Target is queued; no outbound network request has been performed.
- \`VERIFIED_PUBLIC_URL\`: Target URL is syntactically valid, public, and safe from SSRF.
- \`VERIFIED_DOMAIN_REACHABILITY\`: DNS resolves and web server responds with valid HTTP status.
- \`VERIFIED_BUSINESS_IDENTITY_EVIDENCE\`: Public page yields concrete brand, contact, or legal identity signals.
- \`VERIFIED_ADVERTISER_DESTINATION_CONSISTENCY\`: Both reachability and advertiser-to-destination identity consistency are supported by anchor evidence.
- \`PARTIALLY_VERIFIED\`: Site is reachable and partially consistent, but core contact or brand anchors are missing.
- \`CONFLICTING_EVIDENCE\`: Contradictory signals detected (e.g., ad promotes Real Estate, destination is Crypto Casino; or domain redirects to competitor).
- \`INCONCLUSIVE\`: Insufficient evidence to affirm or reject relationship (e.g., generic placeholder, Under Construction).
- \`UNAVAILABLE\`: Network timeout, DNS NXDOMAIN, or HTTP 404/500 encountered.
- \`BLOCKED\`: Target presented Cloudflare challenge, CAPTCHA, or HTTP 403 WAF block.
- \`ERROR\`: Unrecoverable execution exception (e.g., SSRF rejection, response payload exceeded 5MB limit).`
  },
  {
    id: 'p5-sec-05',
    number: 5,
    title: 'URL SAFETY & SSRF PROTECTION SUBSYSTEM',
    category: 'SECURITY_SSRF',
    summary: 'Zero-trust network layer blocking private IPs, loopbacks, cloud metadata (169.254.169.254), and DNS rebinding attacks.',
    contentMarkdown: `### 5. Mandatory SSRF & URL Safety Architecture

Destination URLs extracted from public ads are unauthenticated, untrusted inputs. Processing them directly without rigorous filtering opens internal container services, VPC metadata, and Kubernetes control planes to Server-Side Request Forgery (SSRF).

\`\`\`
Raw Candidate URL
       │
       ▼
1. Parse URL & Reject Non-Standard Schemes (Only http: & https: permitted)
       │
       ▼
2. Normalize Hostname & Filter URL-encoded / Octal / Hex representations
       │
       ▼
3. Strip Embedded Credentials (e.g., https://user:pass@example.com)
       │
       ▼
4. DNS Resolution (Query A & AAAA Records with system resolver)
       │
       ▼
5. Evaluate Resolved IP Addresses Against CIDR Blacklists:
   - 127.0.0.0/8 (IPv4 Loopback)
   - 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 (RFC 1918 Private)
   - 169.254.0.0/16 (Link-Local / AWS/GCP Metadata 169.254.169.254)
   - 0.0.0.0/8 (Broadcast / Current Network)
   - 100.64.0.0/10 (Shared CGNAT Space)
   - ::1/128 (IPv6 Loopback)
   - fc00::/7 (IPv6 Unique Local)
   - fe80::/10 (IPv6 Link-Local)
   - ::ffff:0:0/96 (IPv4-Mapped IPv6)
       │
       ▼
6. Re-evaluate on EVERY Redirect Step (Prevents DNS Rebinding & Open Redirect Hijacks)
       │
       ▼
Target Approved for Socket Dispatch
\`\`\`

#### Prohibited Protocol Handlers
The engine unconditionally aborts if the scheme is:
\`file:\`, \`data:\`, \`javascript:\`, \`chrome:\`, \`about:\`, \`blob:\`, \`ftp:\`, \`ldap:\`, \`gopher:\`, \`dict:\`.`
  },
  {
    id: 'p5-sec-06',
    number: 6,
    title: 'SAFE HTTP RETRIEVAL ARCHITECTURE',
    category: 'RETRIEVAL_ARCHITECTURE',
    summary: 'Fast, bounded, low-overhead HTTP client for static pages, headers, status codes, and lightweight DOM parsing.',
    contentMarkdown: `### 6. Safe HTTP Retrieval Engine (Primary Mode)

To protect system resources and minimize overhead, the Safe HTTP Retriever is always the default execution path. Full browser instantiation is reserved solely for JavaScript-dependent applications.

\`\`\`
[Safe HTTP Retriever]
  ├── Socket Connection Timeout: 5,000 ms
  ├── Read Stream Timeout: 10,000 ms
  ├── Max Response Body: 5,242,880 bytes (5 MB)
  ├── Streaming Abort: Terminates immediately upon Content-Length > 5MB
  ├── Accept Header: text/html,application/xhtml+xml,application/xml;q=0.9
  ├── User-Agent: Public Research Bot (Compliant Identity, No Stealth Header Spoofing)
  └── Redirect Limiter: Max 5 hops (Each hop re-runs SSRF checks)
\`\`\`

#### Streaming Byte-Budget Guard
If a server serves a decompression bomb or an ISO file disguised as HTML, the stream reader enforces:
\`\`\`typescript
if (accumulatedBytes > MAX_BYTES_LIMIT) {
  stream.destroy();
  throw new VerificationError('CONTENT_TOO_LARGE', 'Response exceeded 5MB threshold');
}
\`\`\`

#### Header Verification & TLS Pinning
The HTTP retriever records:
- Status code, Content-Type, Content-Length, Content-Encoding
- TLS version (TLS 1.2 or 1.3), cipher suite, certificate validity dates, issuer common name
- Canonical \`<link rel="canonical">\` and \`og:url\` tags.`
  },
  {
    id: 'p5-sec-07',
    number: 7,
    title: 'SAFE BROWSER RETRIEVAL ARCHITECTURE (PLAYWRIGHT)',
    category: 'RETRIEVAL_ARCHITECTURE',
    summary: 'Isolated, headless browser retriever for SPAs with zero anti-bot evasion, no stealth hacks, and strict navigation caps.',
    contentMarkdown: `### 7. Safe Browser Retrieval Engine (Secondary Mode)

Browser retrieval is invoked **only** when HTTP retrieval yields an empty root DOM container (e.g., \`<div id="root"></div>\` or \`<app-root></app-root>\`) indicating a client-side Single Page Application (React, Angular, Vue).

\`\`\`
               [Trigger Check]
       HTTP Body contains JS App shell
       AND visible text < 100 characters
                     │
                     ▼
          Launch Ephemeral Playwright Context
                     │
  ┌──────────────────┴──────────────────┐
  │ Context Configuration:              │
  │ - No stealth evasion scripts        │
  │ - No canvas / WebGL spoofing        │
  │ - Strict network route aborting:    │
  │     Abort images, fonts, media      │
  │     Block third-party trackers      │
  │ - Navigation timeout: 12,000 ms     │
  │ - DomContentLoaded wait state       │
  └──────────────────┬──────────────────┘
                     │
                     ▼
       Extract Evaluated Text & Meta
                     │
                     ▼
       Immediate Context Destruction
\`\`\`

#### Strict Separation from Meta Browser Worker
- The Verification Browser Worker operates in an isolated cgroup/process sandbox.
- It shares **no cookies, sessions, storage, or browser profiles** with the Meta scraping workers.
- If a Cloudflare challenge, Turnstile, or CAPTCHA appears, the browser **immediately terminates** and emits \`CHALLENGE_DETECTED\`. It does not attempt bypasses.`
  },
  {
    id: 'p5-sec-08',
    number: 8,
    title: 'REDIRECT, DNS & NETWORK SAFETY GUARDS',
    category: 'SECURITY_SSRF',
    summary: 'Comprehensive redirect hop inspection, maximum chain depth of 5, and DNS rebinding prevention.',
    contentMarkdown: `### 8. Redirect & DNS Rebinding Defenses

Attackers often leverage open redirects on trusted domains (e.g., \`https://google.com/url?q=http://169.254.169.254\`) or DNS rebinding (TTL = 0 changing from public IP to 127.0.0.1) to penetrate firewalls.

\`\`\`
Initial URL ──► [SSRF Check: Passed] ──► HTTP 301/302 Received
                                                │
                                                ▼
                                   Target: Location Header
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     ▼                                                     ▼
        Hop Count > MAX_HOPS (5)                              SSRF Check on Hop URL
                     │                                                     │
                     ▼                                                     ▼
        Error: REDIRECT_LIMIT                               Pass? ──No──► Error: SSRF_BLOCKED
                                                              │
                                                             Yes
                                                              │
                                                              ▼
                                                   Dispatch Next Connection
\`\`\`

#### Complete Redirect Audit Trail
For every redirect hop, the verification log records:
1. \`fromUrl\`: Origin URL
2. \`toUrl\`: Destination URL
3. \`httpStatus\`: 301, 302, 307, or 308
4. \`resolvedIp\`: IP address verified for that specific hop
5. \`latencyMs\`: Round-trip hop duration.`
  },
  {
    id: 'p5-sec-09',
    number: 9,
    title: 'WEBSITE PAGE-SCOPE POLICY & CRAWL BOUNDARIES',
    category: 'RETRIEVAL_ARCHITECTURE',
    summary: 'Strict limit of 1 to 3 pages per target: Landing URL, Same-Domain Homepage, and clearly linked Contact/About page.',
    contentMarkdown: `### 9. Bounded Page Scope & Crawl Boundaries

This system is a **verifier**, not a web search engine crawler. Recursive crawling of entire websites is strictly forbidden.

\`\`\`
Target Landing Page (Depth 0 - Required)
         │
         ├───────────────────────────────┐
         ▼                               ▼
Same-Domain Homepage (Depth 1)   Linked Contact/About Page (Depth 1)
   (Only if Landing lacks            (Only if Contact info is absent
    Business Identity evidence)       on Landing Page)
\`\`\`

#### Hard Operational Limits per Verification Job
- **Max Total Pages**: 3 pages maximum.
- **Max Crawl Depth**: 1 level from original destination.
- **Registrable Domain Barrier**: Crawling never crosses to another domain. If a contact page links to \`https://external-form.typeform.com\`, the link is recorded as evidence, but **never crawled**.
- **Max Cumulative Run Duration**: 25.0 seconds per verification target.
- **Robots.txt Adherence**: Checked before dispatching secondary pages. If \`/contact\` is disallowed, verification relies strictly on the landing page.`
  },
  {
    id: 'p5-sec-10',
    number: 10,
    title: 'BUSINESS IDENTITY EVIDENCE MODEL',
    category: 'EVIDENCE_MODEL',
    summary: 'Cryptographically linked, field-level evidence objects recording exact source page, snippet, extraction method, and timestamp.',
    contentMarkdown: `### 10. Structured Evidence Object Schema

Every assertion made by the verification engine is anchored to an immutable \`VerificationEvidence\` instance. Broad summaries without supporting evidence objects are invalid.

\`\`\`typescript
interface VerificationEvidence {
  evidenceId: string;            // UUIDv4
  targetType: VerificationTargetType; // e.g., 'LANDING_PAGE'
  targetId: string;              // Foreign key to candidate
  claimType: VerificationClaimType;   // e.g., 'BUSINESS_NAME_VISIBLE'
  sourceUrl: string;             // Exact URL where snippet was observed
  sourceDomain: string;          // Registrable domain
  observedValue: string | number | boolean; // Extracted value
  evidenceSnippet: string;       // Bounded text snippet (max 300 chars)
  extractionMethod:
    | 'HTTP_DOM_PARSER'
    | 'BROWSER_PAGE_EVAL'
    | 'DNS_QUERY'
    | 'TLS_HANDSHAKE'
    | 'HTTP_HEADER'
    | 'META_TAG';
  observedAt: string;            // ISO 8601 UTC
  retrievalStatus: number;       // e.g., 200
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  classification:
    | 'ANCHOR_EVIDENCE'
    | 'CORROBORATING_EVIDENCE'
    | 'TECHNICAL_SIGNAL'
    | 'DISCOVERY_SIGNAL';
  verificationVersion: string;   // e.g., '5.0.0-PROD'
}
\`\`\`

#### Snippet Bounding & Sanitization
Raw DOM text is bounded to 300 characters to prevent database bloat, and sanitized of HTML tags, script wrappers, and control characters before persistence.`
  },
  {
    id: 'p5-sec-11',
    number: 11,
    title: 'ADVERTISER-DESTINATION CONSISTENCY MATRIX',
    category: 'CONSISTENCY_CONFLICT',
    summary: 'Multi-signal comparison between Facebook Page profile and destination website brand, domain, and offer.',
    contentMarkdown: `### 11. Consistency Scoring & Signal Matrix

To establish whether a website corresponds to the advertiser, multiple corroborating signals are evaluated:

\`\`\`
[Advertiser Observation]                 [Website Observation]
   Page Name: "Apex Dental"                 Title: "Apex Dental Care"
   Ad Copy: "Invisalign special"            H1: "Family Dentistry & Aligners"
   Profile URL: fb.com/apexdental           Footer Link: facebook.com/apexdental
             │                                        │
             └───────────────────┬────────────────────┘
                                 │
                                 ▼
                     [Consistency Evaluation]
            Brand Name Similarity: 0.88 (Jaro-Winkler)
            Offer Category Match: 'DENTAL_CARE' == 'DENTAL_CARE'
            Social Anchor Match: EXACT_MATCH
                                 │
                                 ▼
        Conclusion: ADVERTISER_DESTINATION_CONSISTENT (HIGH Confidence)
\`\`\`

#### Consistency Classification Rubric
- **CONSISTENT**: Brand name match $\\ge 0.80$ AND (Service Category matches OR outbound social link matches Page profile).
- **PARTIALLY_CONSISTENT**: Brand name match between $0.60$ and $0.79$, or product category matches but brand is generic.
- **DIFFERENT**: Brand name and service category differ completely, with zero anchor links.
- **INSUFFICIENT_EVIDENCE**: Page is empty, parked domain, or under construction.
- **CONFLICTING**: Page explicitly represents a competing entity or third-party affiliate with conflicting identity.`
  },
  {
    id: 'p5-sec-12',
    number: 12,
    title: 'PUBLIC CONTACT & BUSINESS INFORMATION EXTRACTION',
    category: 'EVIDENCE_MODEL',
    summary: 'Regex and DOM patterns for business email, telephone, street address, and registered legal name.',
    contentMarkdown: `### 12. Public Contact Data Harvesting & Validation

Public contact details provide strong anchors for business existence. However, extraction must be constrained strictly to commercial identifiers:

\`\`\`
Page Content
    │
    ├── Regex: [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}
    │     └── Discard personal providers (gmail.com, yahoo.com, hotmail.com)
    │     └── Retain matching domain emails: contact@brand.com
    │
    ├── Regex: E.164 / North American / International Phone Patterns
    │     └── Normalize to E.164 (+1XXXXXXXXXX)
    │
    └── Postal Address Locator:
          └── Bounded to postal code + city + street address patterns
\`\`\`

#### Domain Consistency Rule
If the email domain matches the website domain (e.g. \`info@apexdental.com\` on \`apexdental.com\`), it supports \`EMAIL_DOMAIN_CONSISTENT\`. It does **not** prove legal corporate ownership, but serves as high-confidence identity corroboration.`
  },
  {
    id: 'p5-sec-13',
    number: 13,
    title: 'CROSS-SOURCE CONSISTENCY & SOCIAL ANCHORS',
    category: 'CONSISTENCY_CONFLICT',
    summary: 'Verification of outbound public social profile links to confirm advertiser brand linkage.',
    contentMarkdown: `### 13. Social & External Anchor Verification

When a landing page features social media icons linking to external networks:

\`\`\`
Website Footer ──► <a href="https://facebook.com/ApexDentalClinic">
                           │
                           ▼
                  Normalize Profile Path
                           │
                           ▼
          Compare with Phase 04 Ad Envelope:
          \`NormalizedAdRecord.pageProfileUrl\`
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
          MATCH                      MISMATCH
            │                           │
            ▼                           ▼
Claim: PUBLIC_PROFILE_LINK_PRESENT   Warning: Outbound profile links
Confidence: HIGH                     to alternative page name
\`\`\`

#### Strict Crawl Boundary on Social Networks
The engine records the relationship \`WEBSITE_LINKS_TO_PUBLIC_PROFILE\`. It **never navigates into Facebook or Instagram** from the external verifier, as that would risk session contamination or authentication walls.`
  },
  {
    id: 'p5-sec-14',
    number: 14,
    title: 'CONFLICT MODEL & ANOMALY DETECTION',
    category: 'CONSISTENCY_CONFLICT',
    summary: 'Deterministic identification of domain redirects, affiliate bridges, and brand identity contradictions.',
    contentMarkdown: `### 14. Conflict Taxonomy & Triage

Conflicts represent discrepancies between what the ad claims and what the destination exhibits. Conflicts do not automatically denote fraud; they mandate manual review.

\`\`\`
Conflict Types:
├── NAME_MISMATCH: Page title "Super Weight Loss" vs Advertiser "Acme Hardware"
├── DOMAIN_MISMATCH: Destination redirects from \`trustedbrand.com\` to \`sketchy-tracker.xyz\`
├── CONTENT_IRRELEVANT: Ad offers legal consultation, site is online gambling
├── MULTIPLE_INCONSISTENT_NAMES: Footer claims "Apex Ltd", header says "Zenith Corp"
├── SUSPICIOUS_REDIRECT: URL redirects across $\\ge 2$ distinct commercial domains
└── TEMPORAL_CHANGE: Domain content completely transformed since prior scrape
\`\`\`

#### Operational Handling
Whenever a conflict severity of \`CRITICAL\` is flagged, the overall status shifts to \`CONFLICTING_EVIDENCE\`, suppressing automatic lead qualification in Phase 06.`
  },
  {
    id: 'p5-sec-15',
    number: 15,
    title: 'TEMPORAL VERIFICATION & HISTORICAL AUDIT TRAILS',
    category: 'TEMPORAL_AUDIT',
    summary: 'Point-in-time observation records preserving historical state changes across periodic re-scrapes.',
    contentMarkdown: `### 15. Temporal Verification Principles

Websites are dynamic: a site online today may be parked next week.

\`\`\`
Observation Day 1:  HTTP 200 OK  ──► Claim: PAGE_REACHABLE = true
Observation Day 30: HTTP 404 Not ──► Claim: PAGE_REACHABLE = false
\`\`\`

#### Immutability Invariant
1. **Never Overwrite History**: Prior verification runs are retained as point-in-time audit snapshots.
2. **Superseding State**: A new verification run produces a new \`VerificationSummary\` referencing its specific \`checkedAt\` timestamp, superseding previous runs for current operational decisions without destroying historical evidence.
3. **Freshness Window**: Verification results are valid for **14 days**. After 14 days, the state is marked \`STALE\` and queued for re-verification upon subsequent ad impressions.`
  },
  {
    id: 'p5-sec-16',
    number: 16,
    title: 'CACHE POLICY & REQUEST COALESCING',
    category: 'RETRIEVAL_ARCHITECTURE',
    summary: 'Idempotency keys, multi-level memory/disk caching, and stampede prevention for shared domains.',
    contentMarkdown: `### 16. Verification Cache Architecture

Many ads from the same advertiser point to the identical landing page or root domain. Re-fetching the same page 50 times in 10 minutes degrades target servers and wastes bandwidth.

\`\`\`
Candidate URL ──► Generate Cache Key:
                    SHA256(canonicalUrl + verificationRuleVersion + retrievalMode)
                         │
                         ├── In Cache & Fresh (< 14 days)? ──Yes──► Return Cached Summary
                         │
                         └── No / Expired
                               │
                               ▼
                   [Request Coalescing]
                   If identical target is currently in flight:
                   Attach promise to active worker instead of duplicate socket
\`\`\`

#### Cache Invalidation Triggers
- Manual operator-invoked refresh.
- Detection of a new ad creative with a revised tracking parameter or path.
- Invalidation on rule/schema version upgrades.`
  },
  {
    id: 'p5-sec-17',
    number: 17,
    title: 'ERROR TAXONOMY & FAILURE SEMANTICS',
    category: 'TEMPORAL_AUDIT',
    summary: '22 granular error codes with strict semantic distinction between technical unavailability and non-existence.',
    contentMarkdown: `### 17. Error Taxonomy & Truthful Failure Semantics

A critical flaw in amateur verification pipelines is equating an HTTP error with business fraud or non-existence. Phase 05 mandates exact failure semantics:

\`\`\`
Observation: HTTP 404 Not Found
   CORRECT SEMANTICS:
     Claim(PAGE_REACHABLE, supported: false)
     Status: UNAVAILABLE
     Note: Destination path is unreachable at this moment.

   FORBIDDEN SEMANTICS:
     "Business does not exist"
     "Advertiser is illegitimate"
\`\`\`

#### Master Error Codes
1. \`INVALID_URL\`: URL fails RFC 3986 parse.
2. \`UNSUPPORTED_SCHEME\`: Scheme not http/https.
3. \`SSRF_BLOCKED\`: Hostname/IP in prohibited CIDR.
4. \`DNS_FAILURE\`: NXDOMAIN or resolver SERVFAIL.
5. \`CONNECTION_FAILURE\`: TCP SYN timeout / connection refused.
6. \`TLS_FAILURE\`: Expired or untrusted SSL certificate.
7. \`TIMEOUT\`: Read timeout (> 10,000ms).
8. \`HTTP_ACCESS_DENIED\`: HTTP 401 or 403.
9. \`HTTP_NOT_FOUND\`: HTTP 404.
10. \`HTTP_RATE_LIMITED\`: HTTP 429.
11. \`SERVER_ERROR\`: HTTP 500, 502, 503, 504.
12. \`LOGIN_REQUIRED\`: Interstitial authentication wall.
13. \`CAPTCHA_DETECTED\`: Google reCAPTCHA, hCaptcha, Turnstile.
14. \`BOT_CHALLENGE\`: Cloudflare 1020 / WAF challenge page.
15. \`CONTENT_PARSE_ERROR\`: Invalid or corrupt character encoding.
16. \`CONTENT_TOO_LARGE\`: Payload exceeded 5MB.
17. \`REDIRECT_LIMIT\`: More than 5 consecutive redirects.
18. \`DOMAIN_BOUNDARY_VIOLATION\`: Attempted cross-domain secondary crawl.
19. \`VERIFICATION_CONFLICT\`: Material contradiction between ad and site.
20. \`INSUFFICIENT_EVIDENCE\`: Empty page or unpopulated template.
21. \`POLICY_RESTRICTION\`: Robots.txt exclusion.
22. \`UNKNOWN\`: Unhandled runtime exception.`
  },
  {
    id: 'p5-sec-18',
    number: 18,
    title: 'PRIVACY & PII MINIMIZATION SPECIFICATION',
    category: 'SECURITY_SSRF',
    summary: 'Targeted data extraction discarding personal information while retaining only corporate commercial identifiers.',
    contentMarkdown: `### 18. PII Minimization & Data Hygiene

Landing pages may feature employee bios, testimonials, customer reviews, and personal email addresses.

\`\`\`
Scraped Page Text
       │
       ▼
[Privacy Filter Pipeline]
  1. Personal Email Filter:
     - Detect: \`john.doe@gmail.com\`, \`sarah99@yahoo.com\`
     - Action: DISCARD / REDACT
  2. Commercial Email Retainer:
     - Detect: \`support@company.com\`, \`info@company.com\`
     - Action: RETAIN
  3. Personal Phone Filter:
     - Detect: Mobile numbers in user comment threads
     - Action: DISCARD
  4. Commercial Header Phone:
     - Detect: Tel link in header/footer/contact block
     - Action: RETAIN
\`\`\`

#### Storage Minimization
Never store raw outerHTML of entire websites in verification summaries. Store only targeted 300-character evidence snippets directly supporting extracted claims.`
  },
  {
    id: 'p5-sec-19',
    number: 19,
    title: 'SECURITY THREAT MODEL & DEFENSE MATRIX',
    category: 'SECURITY_SSRF',
    summary: 'Comprehensive threat modeling covering SSRF, redirect loops, HTML script injection, and log poisoning.',
    contentMarkdown: `### 19. Security Threat Analysis

| Threat Vector | Attack Scenario | Implemented Defense Layer |
| :--- | :--- | :--- |
| **SSRF via Cloud Metadata** | Destination URL \`http://169.254.169.254/latest/meta-data/\` | Pre-socket IP resolution filter blocks \`169.254.0.0/16\`. |
| **DNS Rebinding** | Domain resolves to public IP first, then 127.0.0.1 on connect | IP is validated at socket connect time; zero-TTL pins IP. |
| **Open Redirect SSRF** | Public URL redirects to \`http://10.0.0.1/admin\` | Every 3xx redirect re-executes full SSRF evaluation. |
| **Decompression Bomb** | Gzip archive expanding to 10GB | Stream reader limits decompressed output to 5MB. |
| **DOM XSS Injection** | Extracted brand text contains \`<script>alert(1)</script>\` | All evidence snippets sanitized; React renders pure text nodes. |
| **Spreadsheet Formula Injection** | Brand text begins with \`=CMD('calc')\` or \`+SUM()\` | Prefix with single quote \`'\` upon handoff serialization. |
| **Browser Execution Abuse** | Page runs cryptocurrency miner or infinite while loop | Chromium context has 12s hard timeout and 512MB RAM cap. |`
  },
  {
    id: 'p5-sec-20',
    number: 20,
    title: 'OBSERVABILITY, AUDITABILITY & METRICS',
    category: 'TEMPORAL_AUDIT',
    summary: 'Telemetry metrics measuring DNS, TLS, TTFB, and extraction latency alongside immutable audit logs.',
    contentMarkdown: `### 20. Telemetry & Observability Pipeline

Every verification run records high-resolution timing and audit dimensions:

\`\`\`typescript
interface VerificationMetrics {
  dnsTimeMs: number;         // Time to resolve A/AAAA
  connectionTimeMs: number;  // TCP SYN/ACK duration
  tlsTimeMs: number;         // TLS handshake duration
  parseTimeMs: number;       // DOM / regex evaluation duration
  bytesRetrieved: number;    // Exact payload size in bytes
  pagesChecked: number;      // 1 to 3
  totalDurationMs: number;   // Wall-clock execution time
}
\`\`\`

#### Structured Audit Logging
All verification actions output structured JSON logs:
\`\`\`json
{
  "timestamp": "2026-09-16T02:00:00.000Z",
  "level": "INFO",
  "event": "VERIFICATION_COMPLETED",
  "targetUrl": "https://apexdental.com",
  "targetDomain": "apexdental.com",
  "claimsEvaluated": 15,
  "claimsSupported": 9,
  "status": "VERIFIED_ADVERTISER_DESTINATION_CONSISTENCY",
  "durationMs": 420
}
\`\`\``
  },
  {
    id: 'p5-sec-21',
    number: 21,
    title: 'TESTING STRATEGY & SUITE DESIGN',
    category: 'TESTING_HANDOFF',
    summary: 'Multi-layer automated testing covering SSRF defense unit tests, synthetic website fixtures, and failure semantics.',
    contentMarkdown: `### 21. Multi-Tier Testing Methodology

The verification system is validated across three distinct test suites:

1. **SSRF Security Suite**: 15 adversarial test vectors ensuring that zero internal or malicious URLs reach the network dispatcher.
2. **Synthetic Website Fixture Catalog**: 22 offline HTML/HTTP scenarios covering the entire spectrum of real-world landing page conditions (404, 403, Cloudflare, SPAs, redirects, login walls, mismatched brands).
3. **Failure Semantics Audit**: Automated assertions verifying that technical unavailability is never misreported as business invalidity.`
  },
  {
    id: 'p5-sec-22',
    number: 22,
    title: 'SYNTHETIC FIXTURE CATALOG (22 PRODUCTION SCENARIOS)',
    category: 'TESTING_HANDOFF',
    summary: 'Comprehensive benchmark catalog of 22 synthetic website fixtures fulfilling Section 59 requirements.',
    contentMarkdown: `### 22. Fixture Catalog (Section 59 Requirements)

The 22 benchmark fixtures rigorously model all specified conditions:

| # | Fixture Key | Scenario Name | Expected Status | Semantic Check |
| :- | :--- | :--- | :--- | :--- |
| 1 | \`FIX-01\` | Valid Business Website | \`VERIFIED_ADVERTISER_DESTINATION_CONSISTENCY\` | Full brand + contact match |
| 2 | \`FIX-02\` | Unreachable Host (Connection Refused) | \`UNAVAILABLE\` | Unreachable != invalid business |
| 3 | \`FIX-03\` | HTTP 404 Not Found | \`UNAVAILABLE\` | 404 != business does not exist |
| 4 | \`FIX-04\` | HTTP 403 Access Denied | \`BLOCKED\` | 403 recorded as access block |
| 5 | \`FIX-05\` | Allowed Public Redirect (HTTP -> HTTPS) | \`VERIFIED_PUBLIC_URL\` | Redirect re-validated |
| 6 | \`FIX-06\` | Redirect to External Allowed Public Domain | \`VERIFIED_PUBLIC_URL\` | Registrable domain hop logged |
| 7 | \`FIX-07\` | Malicious Redirect to Private IP (SSRF) | \`ERROR\` (SSRF_BLOCKED) | Redirect hop blocked |
| 8 | \`FIX-08\` | Authentication / Login Wall | \`BLOCKED\` (LOGIN_REQUIRED) | Wall not bypassed |
| 9 | \`FIX-09\` | Cloudflare Turnstile / CAPTCHA | \`BLOCKED\` (CAPTCHA_DETECTED) | CAPTCHA not bypassed |
| 10 | \`FIX-10\` | Bot Challenge Interstitial | \`BLOCKED\` (BOT_CHALLENGE) | Anti-bot evasion avoided |
| 11 | \`FIX-11\` | Business Name Visible in DOM | \`VERIFIED_BUSINESS_IDENTITY_EVIDENCE\` | Brand extracted from H1 |
| 12 | \`FIX-12\` | Business Name Absent / Parked Domain | \`INCONCLUSIVE\` | Absence != negative evidence |
| 13 | \`FIX-13\` | Conflicting Business Names | \`CONFLICTING_EVIDENCE\` | Multiple disparate names |
| 14 | \`FIX-14\` | Unrelated Landing Page Offer | \`CONFLICTING_EVIDENCE\` | Category mismatch flagged |
| 15 | \`FIX-15\` | Exact Brand Match with Ad | \`VERIFIED_ADVERTISER_DESTINATION_CONSISTENCY\` | High-confidence match |
| 16 | \`FIX-16\` | Different Brand, Shared Multi-Tenant Domain | \`PARTIALLY_VERIFIED\` | Domain shared; distinct entity |
| 17 | \`FIX-17\` | Public Contact Page with E.164 & Email | \`VERIFIED_BUSINESS_IDENTITY_EVIDENCE\` | Contact extracted safely |
| 18 | \`FIX-18\` | Public Outbound Social Profile Links | \`VERIFIED_ADVERTISER_DESTINATION_CONSISTENCY\` | Social anchor verified |
| 19 | \`FIX-19\` | Oversized Response (> 5MB) | \`ERROR\` (CONTENT_TOO_LARGE) | Stream terminated at 5MB |
| 20 | \`FIX-20\` | Malformed HTML Payload | \`PARTIALLY_VERIFIED\` | Resilient parser recovery |
| 21 | \`FIX-21\` | Client-Side JavaScript Rendered SPA | \`VERIFIED_BUSINESS_IDENTITY_EVIDENCE\` | Browser engine fallback |
| 22 | \`FIX-22\` | Completely Empty Page (0 Bytes) | \`INSUFFICIENT_EVIDENCE\` | Insufficient evidence state |`
  },
  {
    id: 'p5-sec-23',
    number: 23,
    title: 'FILE-LEVEL IMPLEMENTATION ARCHITECTURE',
    category: 'TESTING_HANDOFF',
    summary: 'Modular file organization, TypeScript interface locations, and utility isolation.',
    contentMarkdown: `### 23. File-Level Architecture

The Phase 05 implementation is structured across modular, token-bounded files:

- \`/src/types.ts\`: Complete verification interfaces, claim unions, error codes, and audit types.
- \`/src/data/phase05Sections.ts\`: 25 comprehensive architectural specification sections.
- \`/src/data/phase05FixturesAndAudit.ts\`: 22 synthetic fixtures, 15 SSRF attack vectors, and 30 acceptance criteria.
- \`/src/utils/verificationEngine.ts\`: Deterministic verification pipeline (10 layers, SSRF validator, consistency engine).
- \`/src/components/Phase05Reader.tsx\`: Interactive specification viewer with full search and category filtering.
- \`/src/components/VerificationPipelineSimulator.tsx\`: Interactive 10-layer verification execution engine.
- \`/src/components/SsrfSecurityMatrixViewer.tsx\`: Interactive SSRF security and protocol validator.
- \`/src/components/VerificationEvidenceInspector.tsx\`: Field-level claim and evidence inspector.
- \`/src/components/Phase05FixtureReplay.tsx\`: Automated test runner for all 22 benchmark fixtures.
- \`/src/components/Phase05Audit.tsx\`: 30-point engineering acceptance checklist with invariant validation.
- \`/src/components/Phase05HandoffViewer.tsx\`: Exportable Phase 05 -> Phase 06 handoff contract JSON.`
  },
  {
    id: 'p5-sec-24',
    number: 24,
    title: 'ACCEPTANCE CRITERIA & INVARIANT AUDIT',
    category: 'TESTING_HANDOFF',
    summary: 'Strict 30-point engineering checklist verifying adherence to all non-negotiable constraints.',
    contentMarkdown: `### 24. Acceptance Criteria Checklist (Section 69)

All 30 criteria must pass verification:
- [x] Phase-04 traceability exists.
- [x] Verification is claim-based.
- [x] Evidence is field/claim linked.
- [x] Source URL and timestamp are retained.
- [x] Website reachability is separate from identity verification.
- [x] Advertiser identity is separate from legal business identity.
- [x] Domain identity is separate from business identity.
- [x] SSRF protection is implemented and tested.
- [x] Redirect targets are revalidated.
- [x] Private/internal IPs are blocked.
- [x] Unsupported protocols are blocked.
- [x] Retrieval budgets exist.
- [x] Crawl scope is bounded.
- [x] Authentication walls are not bypassed.
- [x] CAPTCHAs/challenges are not bypassed.
- [x] No anti-bot evasion exists.
- [x] No hidden/private endpoint is used.
- [x] PII minimization exists.
- [x] Verification history is retained.
- [x] Verification rules are versioned.
- [x] Cache freshness is explicit.
- [x] Verification conflicts are represented.
- [x] Manual review exists.
- [x] Failure semantics are truthful.
- [x] Business-quality judgments are excluded.
- [x] Temporal verification is supported.
- [x] Security tests exist.
- [x] Website fixtures exist.
- [x] Identity-consistency tests exist.
- [x] Phase-06 handoff is explicit.`
  },
  {
    id: 'p5-sec-25',
    number: 25,
    title: 'PHASE-05 TO PHASE-06 HANDOFF CONTRACT',
    category: 'TESTING_HANDOFF',
    summary: 'Machine-readable schema and contract specification consumed by Phase 06 Lead Qualification.',
    contentMarkdown: `### 25. Phase 06 Handoff Contract Specification

Phase 06 consumes the verified factual outputs of Phase 05 to calculate lead qualification scores and sales priorities.

\`\`\`json
{
  "phase": 5,
  "status": "ACCEPTED_PRODUCTION_READY",
  "verificationSchemaVersion": "5.0.0-PROD",
  "verificationRuleVersion": "5.0.0-PROD",
  "retrieverVersion": "5.0.0-SAFE-HTTP-BROWSER",
  "parserVersion": "5.0.0-DOM-EXTRACTION",
  "claims": {
    "types": [
      "URL_SAFE", "DOMAIN_RESOLVES", "HTTPS_AVAILABLE", "PAGE_REACHABLE",
      "PAGE_CONTENT_ACCESSIBLE", "BUSINESS_NAME_VISIBLE", "LEGAL_NAME_DISPLAYED",
      "CONTACT_INFO_PRESENT", "EMAIL_DOMAIN_CONSISTENT", "PHONE_NUMBER_PUBLIC",
      "ADDRESS_PUBLIC", "SERVICE_CATEGORY_CONSISTENT", "PUBLIC_PROFILE_LINK_PRESENT",
      "DESTINATION_MATCHES_ADVERTISER_NAME", "ADVERTISER_DESTINATION_CONSISTENT"
    ]
  },
  "securityPolicy": {
    "allowedSchemes": ["http", "https"],
    "privateNetworkPolicy": "STRICT_BLOCK_RFC1918_RFC3927_RFC4193",
    "redirectPolicy": { "maxRedirects": 5, "revalidateEachHop": true },
    "sizeLimits": { "maxBytes": 5242880, "maxDomCharacters": 300000 },
    "timeoutLimits": { "connectionTimeoutMs": 5000, "totalTimeoutMs": 25000 },
    "crawlLimits": { "maxPages": 3, "maxDepth": 1, "domainBoundary": "SAME_REGISTRABLE_DOMAIN" }
  },
  "freshnessPolicy": { "ttlDays": 14, "staleBehavior": "RE_VERIFY_UPON_IMPRESSION" },
  "privacyPolicy": { "piiMinimization": true, "personalEmailFilter": true }
}
\`\`\`

#### Clear Boundary with Phase 06
Phase 05 provides **evidence, claims, confidence, and conflicts**. Phase 05 does **not** declare whether an advertiser is a "good lead" or "priority lead". That qualification logic belongs strictly to Phase 06.`
  }
];
