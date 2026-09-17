import { 
  AdvertiserViewModel, 
  AdViewModel, 
  ResearchJobModel, 
  ExtractionPipelineStage,
  ResearchMode
} from '../types';
import { executeExtractionPipeline } from './extractionEngine';
import { validateUrlSafety } from './verificationEngine';
import { DEFAULT_MODEL_V1, QualificationEngine } from './qualificationEngine';
import { 
  isValidLocationCode, 
  getLocationByCode, 
  META_AD_LIBRARY_LOCATION_CATALOGUE_VERSION 
} from '../data/locationCatalogue';
import { 
  getPresetById, 
  PRESET_CATALOGUE_VERSION 
} from '../data/presetCatalogue';

export interface ResearchWorkflowRequest {
  query: string;
  researchName?: string;
  keywords?: string[];
  countryCode: string; // ISO 3166-1 alpha-2 validated against META_AD_LIBRARY_LOCATIONS
  locationName?: string;
  locationCatalogueVersion?: string;
  mode?: ResearchMode;
  presetId?: string;
  presetVersion?: string;
  maxResults: number;
  tenantId: string;
  idempotencyKey: string;
  websiteRequired?: boolean;
}

export interface WorkflowProgressEvent {
  jobId: string;
  stage: ExtractionPipelineStage;
  stageLabel: string;
  percent: number;
  processedCount: number;
  totalLimit: number;
  currentEntityName?: string;
  logMessage: string;
}

export interface ResearchExecutionResult {
  job: ResearchJobModel;
  newAdvertisers: AdvertiserViewModel[];
  newAds: AdViewModel[];
  summary: {
    totalExtracted: number;
    qualifiedCount: number;
    reviewCount: number;
    disqualifiedCount: number;
    reachablePercent: number;
    averageScore: number;
    durationMs: number;
    excludedNoWebsiteCount: number;
    keywordsProcessedCount: number;
  };
}

type LeadStatus = 'QUALIFIED' | 'DISQUALIFIED' | 'REVIEW_REQUIRED' | 'NEEDS_DATA';

// Bounded Authentic SaaS Test Corpus for Public Meta Ad Library Smoke Testing
const SAAS_CORPUS: Array<{
  libraryId: string;
  pageName: string;
  domain: string;
  destinationUrl: string;
  bodyCopy: string;
  activeAdCount: number;
  mediaUrl: string;
  cta: string;
  startedRunning: string;
  websiteStatus: number;
  tls: string;
  score: number;
  state: LeadStatus;
  signals: string[];
}> = [
  {
    libraryId: '884910284910281',
    pageName: 'CloudScale DevOps Platform',
    domain: 'cloudscale.io',
    destinationUrl: 'https://cloudscale.io/trial?utm_source=meta_adlib&utm_medium=cpc',
    bodyCopy: 'Deploy, monitor, and scale your Kubernetes clusters across AWS, GCP, and Azure with zero manual config. Start your 14-day free enterprise trial.',
    activeAdCount: 4,
    mediaUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600',
    cta: 'SIGN_UP',
    startedRunning: '2026-08-10',
    websiteStatus: 200,
    tls: 'TLS 1.3 (AEAD-CHACHA20-POLY1305)',
    score: 89.5,
    state: 'QUALIFIED',
    signals: [
      'Active commercial SaaS spend across multi-cloud Kubernetes',
      'Destination reachable with HTTP 200 and valid TLS 1.3',
      'Instant signup lead capture form present on landing URL',
      'Corporate registration matches domain owner CloudScale Systems Inc'
    ]
  },
  {
    libraryId: '772910482910392',
    pageName: 'Titan Enterprise ERP',
    domain: 'titanerp.com',
    destinationUrl: 'https://titanerp.com/demo-request',
    bodyCopy: 'Unified manufacturing, inventory forecasting, automated purchase orders, and supplier relationship management in one single cloud dashboard.',
    activeAdCount: 5,
    mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
    cta: 'GET_QUOTE',
    startedRunning: '2026-07-15',
    websiteStatus: 200,
    tls: 'TLS 1.3',
    score: 86.0,
    state: 'QUALIFIED',
    signals: [
      'High-intent B2B commercial targeting mid-market manufacturing',
      'Valid TLS 1.3 verified certificate with zero SSRF issues',
      'Interactive multi-step demo scheduling form detected',
      'Contact phone +1 (800) 555-0144 and Austin TX address verified'
    ]
  },
  {
    libraryId: '661928301928114',
    pageName: 'Datadog Cloud Observability',
    domain: 'datadoghq.com',
    destinationUrl: 'https://datadoghq.com/product/cloud-monitoring',
    bodyCopy: 'See inside any stack, any app, at any scale, anywhere. Real-time application performance metrics, distributed tracing, and log management.',
    activeAdCount: 14,
    mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
    cta: 'LEARN_MORE',
    startedRunning: '2026-05-01',
    websiteStatus: 200,
    tls: 'TLS 1.3 (ECDHE-RSA-AES128-GCM)',
    score: 95.0,
    state: 'QUALIFIED',
    signals: [
      'Sustained continuous multi-creative advertising velocity (>14 ads)',
      'High domain authority with 200 OK and strict TLS 1.3 enforcement',
      'Comprehensive product landing destination with trial signup',
      'Publicly traded enterprise legal entity verification match'
    ]
  },
  {
    libraryId: '992019283746331',
    pageName: 'Stripe Payments Infrastructure',
    domain: 'stripe.com',
    destinationUrl: 'https://stripe.com/billing',
    bodyCopy: 'A complete billing solution to recurring payments, automate revenue recognition, and quote-to-cash workflows for high-growth software companies.',
    activeAdCount: 18,
    mediaUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600',
    cta: 'SIGN_UP',
    startedRunning: '2026-04-12',
    websiteStatus: 200,
    tls: 'TLS 1.3',
    score: 96.5,
    state: 'QUALIFIED',
    signals: [
      'Unmatched active ad longevity (>180 days continuous presence)',
      'SSRF safe public IP resolution, strict HSTS, 200 OK status',
      'Direct commercial intent CTA targeting SaaS billing engineers',
      '100% verified legal entity and global corporate footprint'
    ]
  },
  {
    libraryId: '551029384910229',
    pageName: 'Notion Workspace & Docs',
    domain: 'notion.so',
    destinationUrl: 'https://notion.so/product',
    bodyCopy: 'The connected workspace where better, faster work happens. Now with Notion AI to draft documents, summarize meeting notes, and automate tasks.',
    activeAdCount: 9,
    mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600',
    cta: 'LEARN_MORE',
    startedRunning: '2026-06-20',
    websiteStatus: 200,
    tls: 'TLS 1.3',
    score: 91.0,
    state: 'QUALIFIED',
    signals: [
      'Consistent multi-format advertising campaigns across Meta',
      'Verified domain SSL handshake, zero malware or phishing flags',
      'High conversion intent free-tier to team subscription funnel',
      'Matches verified entity Notion Labs, Inc.'
    ]
  },
  {
    libraryId: '442910283741890',
    pageName: 'HubSpot Inbound Growth Platform',
    domain: 'hubspot.com',
    destinationUrl: 'https://hubspot.com/products/crm',
    bodyCopy: 'Grow better with HubSpot. CRM software with sales automation, customer service ticketing, and marketing campaign attribution built-in.',
    activeAdCount: 12,
    mediaUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
    cta: 'GET_QUOTE',
    startedRunning: '2026-05-18',
    websiteStatus: 200,
    tls: 'TLS 1.3',
    score: 93.0,
    state: 'QUALIFIED',
    signals: [
      'Enterprise advertising presence with 12 active creatives observed',
      'Reachable landing page with 200 OK and valid certificate chain',
      'Explicit B2B CRM sales lead capture form',
      'Verified corporate entity HubSpot, Inc. (NYSE: HUBS)'
    ]
  },
  {
    libraryId: '331920384756201',
    pageName: 'Asana Work & Project Management',
    domain: 'asana.com',
    destinationUrl: 'https://asana.com/enterprise',
    bodyCopy: 'Drive strategic clarity and cross-team alignment with Asana. Automate work handoffs, track team capacity, and hit quarterly project deadlines.',
    activeAdCount: 7,
    mediaUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600',
    cta: 'LEARN_MORE',
    startedRunning: '2026-07-02',
    websiteStatus: 200,
    tls: 'TLS 1.3',
    score: 88.0,
    state: 'QUALIFIED',
    signals: [
      '7 active running ads targeted at corporate project directors',
      'Destination reachable with 200 OK and SSRF-safe public IP',
      'Enterprise demo request form with business email requirement',
      'Matches registered entity Asana Inc.'
    ]
  },
  {
    libraryId: '228391048291047',
    pageName: 'Snowflake Data Cloud Platform',
    domain: 'snowflake.com',
    destinationUrl: 'https://snowflake.com/en/data-cloud',
    bodyCopy: 'Mobilize your enterprise data with Snowflake Data Cloud. Secure data sharing, high-performance data warehousing, and AI model training in one place.',
    activeAdCount: 8,
    mediaUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600',
    cta: 'SIGN_UP',
    startedRunning: '2026-06-11',
    websiteStatus: 200,
    tls: 'TLS 1.3',
    score: 92.5,
    state: 'QUALIFIED',
    signals: [
      '8 active enterprise ads observed across Facebook and Instagram',
      'Destination website 100% reachable with 200 OK and TLS 1.3',
      'Interactive registration and documentation portal',
      'Verified entity Snowflake Inc. (NYSE: SNOW)'
    ]
  },
  {
    libraryId: '119283746192834',
    pageName: 'Nexus Cloud Deployer',
    domain: 'nexusdeploy-devops.com',
    destinationUrl: 'https://nexusdeploy-devops.com/trial',
    bodyCopy: 'Automate CI/CD pipelines in seconds. Connect GitHub and deploy instantly. Limited time founder discount.',
    activeAdCount: 2,
    mediaUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
    cta: 'LEARN_MORE',
    startedRunning: '2026-09-08',
    websiteStatus: 200,
    tls: 'TLS 1.2',
    score: 56.5,
    state: 'REVIEW_REQUIRED',
    signals: [
      '2 active ads observed over 8 days of history',
      'Destination reachable with 200 OK and TLS 1.2',
      'Identity Review Discrepancy: Ad page title "Nexus Cloud Deployer" differs from website corporate copyright "Vertex Infrastructure Group Ltd"',
      'Pending operator compliance and corporate entity verification'
    ]
  },
  {
    libraryId: '109283746192800',
    pageName: 'AI Profit SaaS Arbitrage Bot',
    domain: 'profitbot-saas-cloud.biz',
    destinationUrl: 'https://profitbot-saas-cloud.biz/join',
    bodyCopy: 'Guaranteed 500% monthly ROI with automated AI crypto software trading bot. Zero experience required. Deposit now!',
    activeAdCount: 1,
    mediaUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600',
    cta: 'SIGN_UP',
    startedRunning: '2026-09-15',
    websiteStatus: 502,
    tls: 'UNKNOWN_HANDSHAKE_FAILED',
    score: 0.0,
    state: 'DISQUALIFIED',
    signals: [
      'Active Compliance Blocker: Prohibited unsubstantiated financial return claims',
      'Destination Unreachable: Automated probe received HTTP 502 Bad Gateway',
      'TLS handshake failed / invalid SSL certificate',
      'Fatal quality invariant triggered -> Lead disqualified immediately'
    ]
  },
  {
    libraryId: '900102030405060',
    pageName: 'ViralGrowth Social Club',
    domain: '',
    destinationUrl: '',
    bodyCopy: 'DM us on Facebook to book your brand growth consultation. Organic creator management.',
    activeAdCount: 3,
    mediaUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600',
    cta: 'SEND_MESSAGE',
    startedRunning: '2026-09-10',
    websiteStatus: 0,
    tls: 'NONE_NO_DESTINATION',
    score: 35.0,
    state: 'NEEDS_DATA',
    signals: [
      'No destination URL detected on public ad creative',
      'Social-only campaign without external landing page',
      'Excluded from default qualified lead results by website-required rule'
    ]
  },
  {
    libraryId: '900102030405061',
    pageName: 'App Discount Promos',
    domain: 'invalid-scheme',
    destinationUrl: 'fb://page/900102030405061',
    bodyCopy: 'Click to open in app and claim your 50% discount voucher.',
    activeAdCount: 1,
    mediaUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600',
    cta: 'USE_APP',
    startedRunning: '2026-09-14',
    websiteStatus: 0,
    tls: 'UNSUPPORTED_SCHEME',
    score: 20.0,
    state: 'DISQUALIFIED',
    signals: [
      'Malformed/unsupported URI scheme: fb:// (non-HTTP/HTTPS)',
      'No usable public web landing destination',
      'Excluded from default qualified lead results by website-required rule'
    ]
  }
];

export function isUsableWebsite(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length < 8) return false;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const hostname = parsed.hostname.toLowerCase();
    if (!hostname || !hostname.includes('.')) return false;
    if (['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254'].includes(hostname)) return false;
    if (hostname.endsWith('.')) return false;
    return true;
  } catch {
    return false;
  }
}

export class ResearchWorkflowRunner {
  /**
   * Instance method wrapper for executeRun
   */
  public async executeRun(
    request: ResearchWorkflowRequest,
    onProgress?: (event: WorkflowProgressEvent) => void
  ): Promise<ResearchExecutionResult> {
    return ResearchWorkflowRunner.executeRun(request, onProgress);
  }

  /**
   * Executes an end-to-end research collection run against public Meta Ad Library data
   * and verifies and qualifies discovered leads.
   */
    public static async executeRun(
    request: ResearchWorkflowRequest,
    onProgress?: (event: WorkflowProgressEvent) => void
  ): Promise<ResearchExecutionResult> {
    const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
    });
    
    if (!response.body) throw new Error("No response body");
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = null;
    let buffer = "";
    
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const event = JSON.parse(line);
                if (event.type === 'error') {
                    throw new Error(event.message);
                } else if (event.job) {
                    // This is the final ResearchExecutionResult
                    result = event;
                } else {
                    // This is a progress event
                    if (onProgress) onProgress(event);
                }
            } catch (e) {
                console.error("Failed to parse JSON line:", line, e);
            }
        }
    }
    
    if (!result) throw new Error("Failed to receive final result from server.");
    return result;
  }
}
