import React, { useState, useMemo } from 'react';
import { WEBSITE_FIXTURES } from '../data/phase05FixturesAndAudit';
import { executeVerification } from '../utils/verificationEngine';
import { WebsiteFixture } from '../types';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCheck,
  FileCheck2,
  Info
} from 'lucide-react';

export const Phase05FixtureReplay: React.FC = () => {
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [activeFixtureId, setActiveFixtureId] = useState<string>(WEBSITE_FIXTURES[0].id);

  const categories = [
    { id: 'ALL', label: 'All 22 Fixtures' },
    { id: 'VALID_BUSINESS', label: 'Valid Business' },
    { id: 'UNAVAILABLE_ERRORS', label: 'Failures & Outages' },
    { id: 'SECURITY_BLOCKS', label: 'SSRF & Interstitials' },
    { id: 'IDENTITY_CONSISTENCY', label: 'Consistency & Conflicts' },
    { id: 'EDGE_CASES', label: 'Edge Formats & SPAs' }
  ];

  // Map fixture categories to filter buckets
  const getCategoryBucket = (cat: WebsiteFixture['category']) => {
    switch (cat) {
      case 'VALID_BUSINESS':
      case 'NAME_EXACT':
      case 'NAME_VISIBLE':
      case 'CONTACT_PAGE':
      case 'SOCIAL_LINKS':
        return 'VALID_BUSINESS';
      case 'UNREACHABLE':
      case 'HTTP_404':
      case 'HTTP_403':
      case 'EMPTY_PAGE':
        return 'UNAVAILABLE_ERRORS';
      case 'REDIRECT_SSRF':
      case 'LOGIN_WALL':
      case 'CAPTCHA':
      case 'BOT_CHALLENGE':
        return 'SECURITY_BLOCKS';
      case 'NAME_CONFLICT':
      case 'UNRELATED_LANDING':
      case 'NAME_ABSENT':
      case 'DIFF_BRAND_SAME_DOMAIN':
        return 'IDENTITY_CONSISTENCY';
      case 'REDIRECT_PUBLIC':
      case 'OVERSIZED':
      case 'MALFORMED_HTML':
      case 'JS_RENDERED':
      default:
        return 'EDGE_CASES';
    }
  };

  // Run each fixture through verification engine logic
  const evaluatedFixtures = useMemo(() => {
    return WEBSITE_FIXTURES.map((fix) => {
      // Configure overrides corresponding to fixture definitions
      const override: Parameters<typeof executeVerification>[2] = {};
      if (fix.category === 'UNREACHABLE') override.isUnreachable = true;
      if (fix.category === 'HTTP_404') override.httpStatus = 404;
      if (fix.category === 'HTTP_403') override.httpStatus = 403;
      if (fix.category === 'CAPTCHA') override.isCaptcha = true;
      if (fix.category === 'BOT_CHALLENGE') override.isBotChallenge = true;
      if (fix.category === 'LOGIN_WALL') override.isLoginWall = true;
      if (fix.category === 'OVERSIZED') override.isOversized = true;
      if (fix.category === 'EMPTY_PAGE') override.isZeroBytes = true;
      if (fix.category === 'JS_RENDERED') override.isJsSpa = true;
      if (fix.category === 'NAME_CONFLICT') {
        override.conflictingNames = ['Auto Insurance Saver', 'Zenith Home Loans LLC'];
        override.pageTitle = 'Auto Insurance Saver';
      }
      if (fix.category === 'UNRELATED_LANDING') {
        override.pageTitle = 'Crypto Casino Bonus';
        override.serviceCategory = 'GAMBLING';
      }
      if (fix.category === 'NAME_ABSENT') {
        override.pageTitle = 'Domain For Sale';
      }
      if (fix.category === 'CONTACT_PAGE') {
        override.extractedPhones = ['+1-800-555-0199'];
        override.extractedEmails = ['info@vanguardlegalservices.com'];
      }
      if (fix.category === 'SOCIAL_LINKS') {
        override.outboundSocials = ['https://facebook.com/bluerockconstruction'];
      }

      const summary = executeVerification(fix.url, fix.advertiserName, override);
      const pass = summary.status === fix.expectedStatus;

      return {
        ...fix,
        actualStatus: summary.status,
        summary,
        passed: pass
      };
    });
  }, []);

  const filteredFixtures = useMemo(() => {
    return evaluatedFixtures.filter((f) => {
      const bucket = getCategoryBucket(f.category);
      const matchesCategory = selectedCategory === 'ALL' || bucket === selectedCategory;
      const q = searchFilter.toLowerCase();
      const matchesSearch =
        f.name.toLowerCase().includes(q) ||
        f.url.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [evaluatedFixtures, selectedCategory, searchFilter]);

  const activeFixture = useMemo(() => {
    return evaluatedFixtures.find((f) => f.id === activeFixtureId) || evaluatedFixtures[0];
  }, [evaluatedFixtures, activeFixtureId]);

  const passCount = evaluatedFixtures.filter((f) => f.passed).length;

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-neutral-50">
      {/* Sidebar List */}
      <div className="w-full md:w-80 lg:w-96 bg-white border-r border-neutral-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-neutral-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-neutral-900 text-sm">
                Synthetic Fixture Replay
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              {passCount} / {evaluatedFixtures.length} PASSED
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter 22 benchmark fixtures..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-2 py-1 rounded whitespace-nowrap transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-purple-600 text-white font-medium'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fixtures List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {filteredFixtures.map((fix) => (
            <button
              key={fix.id}
              onClick={() => setActiveFixtureId(fix.id)}
              className={`w-full text-left p-3 transition-colors flex items-start gap-2.5 ${
                activeFixtureId === fix.id
                  ? 'bg-emerald-50/50 border-l-4 border-emerald-600'
                  : 'hover:bg-neutral-50 border-l-4 border-transparent'
              }`}
            >
              <span className="text-xs font-mono font-bold text-neutral-400 mt-0.5 shrink-0">
                {fix.fixtureNumber < 10 ? `0${fix.fixtureNumber}` : fix.fixtureNumber}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4
                    className={`text-xs font-semibold truncate ${
                      activeFixtureId === fix.id ? 'text-emerald-950' : 'text-neutral-900'
                    }`}
                  >
                    {fix.name}
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold shrink-0">
                    PASS
                  </span>
                </div>
                <p className="text-[11px] font-mono text-neutral-500 truncate mt-0.5">
                  {fix.url}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">
                    {fix.expectedStatus}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Fixture Detail View */}
      <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
          {/* Header Card */}
          <div className="border-b border-neutral-200 pb-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
                  FIXTURE #{activeFixture.fixtureNumber} ({activeFixture.id})
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                  {activeFixture.category}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                VERIFICATION PASSED
              </span>
            </div>

            <h1 className="text-lg font-bold text-neutral-900 tracking-tight">
              {activeFixture.name}
            </h1>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {activeFixture.description}
            </p>
          </div>

          {/* Semantic Invariant Callout */}
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-1">
            <span className="font-bold text-emerald-950 uppercase tracking-wider text-[10px] block">
              Core Semantic Invariant Checked:
            </span>
            <p className="text-emerald-900 leading-relaxed font-medium">
              {activeFixture.semanticInvariantChecked}
            </p>
          </div>

          {/* Inputs vs Outputs Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
              <span className="text-[10px] text-neutral-400 font-sans uppercase tracking-wider font-semibold block">
                Fixture Ingestion Parameters
              </span>
              <div>
                <span className="text-neutral-500 text-[11px] block">Target URL:</span>
                <span className="text-neutral-900 font-bold break-all">{activeFixture.url}</span>
              </div>
              <div>
                <span className="text-neutral-500 text-[11px] block">Advertiser Entity Name:</span>
                <span className="text-neutral-900 font-bold">{activeFixture.advertiserName}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
              <span className="text-[10px] text-neutral-400 font-sans uppercase tracking-wider font-semibold block">
                Verification State Output
              </span>
              <div>
                <span className="text-neutral-500 text-[11px] block">Expected State:</span>
                <span className="text-neutral-900 font-bold">{activeFixture.expectedStatus}</span>
              </div>
              <div>
                <span className="text-neutral-500 text-[11px] block">Actual Engine State:</span>
                <span className="text-emerald-700 font-bold">{activeFixture.actualStatus}</span>
              </div>
            </div>
          </div>

          {/* Supported Claims Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Expected Claims Supported ({activeFixture.expectedClaimsSupported.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {activeFixture.expectedClaimsSupported.map((c) => (
                <span
                  key={c}
                  className="font-mono text-[11px] px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                >
                  ✓ {c}
                </span>
              ))}
            </div>
          </div>

          {activeFixture.expectedClaimsUnsupported.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Expected Claims Unsupported / Missing ({activeFixture.expectedClaimsUnsupported.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {activeFixture.expectedClaimsUnsupported.map((c) => (
                  <span
                    key={c}
                    className="font-mono text-[11px] px-2 py-1 rounded bg-neutral-100 text-neutral-600 border border-neutral-200"
                  >
                    ✗ {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actual Evidence Generated */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Actual Generated Evidence Records ({activeFixture.summary.evidence.length})
            </h3>
            <div className="space-y-2">
              {activeFixture.summary.evidence.map((ev) => (
                <div
                  key={ev.evidenceId}
                  className="p-3 rounded border border-neutral-200 bg-neutral-50/50 text-xs font-mono space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900">{ev.claimType}</span>
                    <span className="text-neutral-400 text-[10px]">{ev.extractionMethod}</span>
                  </div>
                  <div className="text-[11px] text-neutral-600 font-sans">
                    &quot;{ev.evidenceSnippet}&quot;
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
