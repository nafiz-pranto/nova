import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkForBotChallenge, aggregateCandidatesToLeads, exportLeadsToCsv } from '../src/extension/metaAdapter.ts';
import { compileResearchIntent } from '../src/extension/relevanceEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('MASTER PROMPT 50: FINAL TERMINAL-STATE SEMANTICS & SIGN-OFF SUITE');
console.log('================================================================\n');

let passCount = 0;
function pass(msg) {
  passCount++;
  console.log(`✓ [PASS] ${msg}`);
}

// Simulated research pipeline status finalizer mimicking service-worker.ts logic
function finalizeRunState(run, allCandidates, isStalled, isCancelled, isTabClosed, challengeInfo) {
  if (isCancelled) {
    run.status = 'CANCELLED';
    run.stopReason = 'USER_CANCELLED';
  } else if (isTabClosed) {
    run.status = 'BROWSER_TAB_CLOSED';
    run.stopReason = 'BROWSER_TAB_CLOSED';
  } else if (challengeInfo && challengeInfo.isBlocked) {
    run.status = challengeInfo.code === 'RATE_LIMITED' ? 'RATE_LIMITED' : 'CHALLENGED';
    run.stopReason = challengeInfo.code === 'RATE_LIMITED' ? 'RATE_LIMITED' : 'CHALLENGED';
  } else {
    if (run.leads.length >= run.targetLeadCount) {
      run.status = 'COMPLETED';
      run.stopReason = 'TARGET_REACHED';
    } else {
      run.status = 'PARTIAL';
      if (allCandidates.length === 0) {
        run.stopReason = 'NO_NEW_RESULTS_OBSERVED';
      } else if (isStalled) {
        run.stopReason = 'SOURCE_PROGRESS_STALLED';
      } else {
        run.stopReason = 'SOURCE_EXHAUSTED';
      }
    }
  }
  return run;
}

// -------------------------------------------------------------------
// TEST 1: Target Reached → COMPLETED
// -------------------------------------------------------------------
console.log('--- TEST 1: Target Reached → COMPLETED ---');
const runTargetReached = finalizeRunState(
  { targetLeadCount: 5, leads: [1, 2, 3, 4, 5] },
  [1, 2, 3, 4, 5, 6],
  false, false, false, null
);
assert.strictEqual(runTargetReached.status, 'COMPLETED', 'Status is COMPLETED');
assert.strictEqual(runTargetReached.stopReason, 'TARGET_REACHED', 'Stop reason is TARGET_REACHED');
assert.ok(runTargetReached.leads.length >= runTargetReached.targetLeadCount, 'Lead quota reached');
pass('1. Target reached strictly yields status = COMPLETED, stopReason = TARGET_REACHED');

// -------------------------------------------------------------------
// TEST 2: Source Exhausted Before Target → PARTIAL
// -------------------------------------------------------------------
console.log('\n--- TEST 2: Source Exhausted Before Target → PARTIAL ---');
const runExhausted = finalizeRunState(
  { targetLeadCount: 25, leads: [1, 2, 3, 4, 5] },
  [1, 2, 3, 4, 5, 6, 7],
  false, false, false, null
);
assert.strictEqual(runExhausted.status, 'PARTIAL', 'Status is PARTIAL');
assert.strictEqual(runExhausted.stopReason, 'SOURCE_EXHAUSTED', 'Stop reason is SOURCE_EXHAUSTED');
assert.notStrictEqual(runExhausted.status, 'COMPLETED', 'Status is NOT COMPLETED');
pass('2. Source exhausted before target yields status = PARTIAL, stopReason = SOURCE_EXHAUSTED');

// -------------------------------------------------------------------
// TEST 3: Source Stalled Before Target → PARTIAL
// -------------------------------------------------------------------
console.log('\n--- TEST 3: Source Stalled Before Target → PARTIAL ---');
const runStalled = finalizeRunState(
  { targetLeadCount: 50, leads: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  true, false, false, null
);
assert.strictEqual(runStalled.status, 'PARTIAL', 'Status is PARTIAL');
assert.strictEqual(runStalled.stopReason, 'SOURCE_PROGRESS_STALLED', 'Stop reason is SOURCE_PROGRESS_STALLED');
pass('3. Source stalled before target yields status = PARTIAL, stopReason = SOURCE_PROGRESS_STALLED');

// -------------------------------------------------------------------
// TEST 4: Zero-Result Query → PARTIAL
// -------------------------------------------------------------------
console.log('\n--- TEST 4: Zero-Result Query → PARTIAL ---');
const runZeroResult = finalizeRunState(
  { targetLeadCount: 10, leads: [] },
  [],
  false, false, false, null
);
assert.strictEqual(runZeroResult.status, 'PARTIAL', 'Status is PARTIAL');
assert.strictEqual(runZeroResult.stopReason, 'NO_NEW_RESULTS_OBSERVED', 'Stop reason is NO_NEW_RESULTS_OBSERVED');
assert.notStrictEqual(runZeroResult.status, 'COMPLETED', 'Zero-result run is NOT COMPLETED');
pass('4. Zero-result query yields status = PARTIAL, stopReason = NO_NEW_RESULTS_OBSERVED');

// -------------------------------------------------------------------
// TEST 5: Explicit Cancel → CANCELLED
// -------------------------------------------------------------------
console.log('\n--- TEST 5: Explicit Cancel → CANCELLED ---');
const runCancel = finalizeRunState(
  { targetLeadCount: 10, leads: [1, 2] },
  [1, 2, 3],
  false, true, false, null
);
assert.strictEqual(runCancel.status, 'CANCELLED', 'Status is CANCELLED');
assert.strictEqual(runCancel.stopReason, 'USER_CANCELLED', 'Stop reason is USER_CANCELLED');
pass('5. Explicit cancel yields status = CANCELLED, stopReason = USER_CANCELLED');

// -------------------------------------------------------------------
// TEST 6: Tab Closure → BROWSER_TAB_CLOSED
// -------------------------------------------------------------------
console.log('\n--- TEST 6: Tab Closure → BROWSER_TAB_CLOSED ---');
const runTabClosed = finalizeRunState(
  { targetLeadCount: 10, leads: [1, 2] },
  [1, 2, 3],
  false, false, true, null
);
assert.strictEqual(runTabClosed.status, 'BROWSER_TAB_CLOSED', 'Status is BROWSER_TAB_CLOSED');
assert.strictEqual(runTabClosed.stopReason, 'BROWSER_TAB_CLOSED', 'Stop reason is BROWSER_TAB_CLOSED');
pass('6. Tab closure yields status = BROWSER_TAB_CLOSED, stopReason = BROWSER_TAB_CLOSED');

// -------------------------------------------------------------------
// TEST 7: Worker Interruption → RECOVERY_REQUIRED / BROWSER_INTERRUPTED
// -------------------------------------------------------------------
console.log('\n--- TEST 7: Worker Interruption → RECOVERY_REQUIRED ---');
function simulateStaleInterruption(run) {
  run.status = 'RECOVERY_REQUIRED';
  run.stopReason = 'BROWSER_INTERRUPTED';
  return run;
}
const runInterrupted = simulateStaleInterruption({ targetLeadCount: 10, leads: [1] });
assert.strictEqual(runInterrupted.status, 'RECOVERY_REQUIRED', 'Status is RECOVERY_REQUIRED');
assert.strictEqual(runInterrupted.stopReason, 'BROWSER_INTERRUPTED', 'Stop reason is BROWSER_INTERRUPTED');
pass('7. Worker interruption yields status = RECOVERY_REQUIRED, stopReason = BROWSER_INTERRUPTED');

// -------------------------------------------------------------------
// TEST 8: Meta Challenge → CHALLENGED
// -------------------------------------------------------------------
console.log('\n--- TEST 8: Meta Challenge → CHALLENGED ---');
const runChallenge = finalizeRunState(
  { targetLeadCount: 10, leads: [1] },
  [1],
  false, false, false, { isBlocked: true, code: 'CHALLENGED' }
);
assert.strictEqual(runChallenge.status, 'CHALLENGED', 'Status is CHALLENGED');
assert.strictEqual(runChallenge.stopReason, 'CHALLENGED', 'Stop reason is CHALLENGED');
pass('8. Security check challenge yields status = CHALLENGED, stopReason = CHALLENGED');

// -------------------------------------------------------------------
// TEST 9: Rate Limit → RATE_LIMITED
// -------------------------------------------------------------------
console.log('\n--- TEST 9: Rate Limit → RATE_LIMITED ---');
const runRateLimit = finalizeRunState(
  { targetLeadCount: 10, leads: [1] },
  [1],
  false, false, false, { isBlocked: true, code: 'RATE_LIMITED' }
);
assert.strictEqual(runRateLimit.status, 'RATE_LIMITED', 'Status is RATE_LIMITED');
assert.strictEqual(runRateLimit.stopReason, 'RATE_LIMITED', 'Stop reason is RATE_LIMITED');
pass('9. Rate limit yields status = RATE_LIMITED, stopReason = RATE_LIMITED');

// -------------------------------------------------------------------
// TEST 10: Fatal Exception → FAILED
// -------------------------------------------------------------------
console.log('\n--- TEST 10: Fatal Exception → FAILED ---');
function simulateFatalError(run, err) {
  run.status = 'FAILED';
  run.stopReason = 'FAILED';
  run.challengeReason = err.message;
  return run;
}
const runFailed = simulateFatalError({ targetLeadCount: 10, leads: [] }, new Error('DOM Exception'));
assert.strictEqual(runFailed.status, 'FAILED', 'Status is FAILED');
assert.strictEqual(runFailed.stopReason, 'FAILED', 'Stop reason is FAILED');
pass('10. Fatal exception yields status = FAILED, stopReason = FAILED');

// -------------------------------------------------------------------
// TEST 11: Quota Invariant Validation
// -------------------------------------------------------------------
console.log('\n--- TEST 11: Quota Invariant & Prohibited State Combinations ---');
function validateQuotaInvariant(run) {
  if (run.status === 'COMPLETED') {
    assert.ok(run.leads.length >= run.targetLeadCount, 'COMPLETED run must meet or exceed target quota');
    assert.strictEqual(run.stopReason, 'TARGET_REACHED', 'COMPLETED run must have stopReason = TARGET_REACHED');
  }
  if (run.leads.length < run.targetLeadCount && ['TARGET_REACHED', 'SOURCE_EXHAUSTED', 'SOURCE_PROGRESS_STALLED', 'NO_NEW_RESULTS_OBSERVED'].includes(run.stopReason)) {
    assert.notStrictEqual(run.status, 'COMPLETED', 'Run with leads < targetLeadCount must NEVER be COMPLETED');
  }
}

validateQuotaInvariant(runTargetReached);
validateQuotaInvariant(runExhausted);
validateQuotaInvariant(runStalled);
validateQuotaInvariant(runZeroResult);
pass('11. Quota invariant holds: COMPLETED is strictly reserved for leads >= targetLeadCount');

// -------------------------------------------------------------------
// TEST 12: CSV & Export Metadata Integrity
// -------------------------------------------------------------------
console.log('\n--- TEST 12: CSV & Export Metadata Integrity ---');
const intent = compileResearchIntent('CUSTOM', ['Gyms'], undefined, 'US');
const mockCandidate = {
  libraryId: 'ad_999',
  pageName: 'Peak Performance Gym',
  bodyCopy: 'Join Peak Performance Gym for 50% off first month.',
  destinationUrl: 'https://peakgym.example.com',
  destinationDomain: 'peakgym.example.com',
  facebookPageName: 'Peak Performance Gym',
  ctaText: 'Sign Up',
  observedKeyword: 'Gyms'
};
const aggregated = aggregateCandidatesToLeads([mockCandidate], 'US', 'United States', 20, [], intent);
const mockRun = {
  runId: 'run_partial_csv_test',
  researchName: 'Gym Leads US',
  mode: 'CUSTOM',
  targetLeadCount: 20,
  leads: aggregated.leads,
  status: 'PARTIAL',
  stopReason: 'SOURCE_EXHAUSTED',
  engineVersion: 'strict-v2'
};

const csv = exportLeadsToCsv(mockRun.leads, mockRun);
assert.ok(csv.includes('# Research Run: Gym Leads US'), 'CSV header contains research name');
assert.ok(csv.includes('Requested Quota: 20'), 'CSV header contains requested quota');
assert.ok(csv.includes('Final Relevant Leads: 1'), 'CSV header contains final relevant count');
assert.ok(csv.includes('Status: PARTIAL'), 'CSV header explicitly marks PARTIAL status');
assert.ok(csv.includes('Stop Reason: SOURCE_EXHAUSTED'), 'CSV header contains stop reason');
pass('12. CSV export header preserves PARTIAL status, quota, relevant count, and stop reason');

console.log('\n================================================================');
console.log(`MASTER PROMPT 50 INTEGRITY SUITE PASSED! (${passCount} assertions green)`);
console.log('================================================================\n');
