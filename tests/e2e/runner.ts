import { registry, sharedTestDb } from './harness';

// Import all test suites to register them with the test engine
// Tier 1: Features F1 - F12
import './tier1-features/f01-transaction.test';
import './tier1-features/f02-harmonization.test';
import './tier1-features/f03-slot-lock.test';
import './tier1-features/f04-refund.test';
import './tier1-features/f05-rbac.test';
import './tier1-features/f06-razorpay-analytics.test';
import './tier1-features/f07-phonepe-analytics.test';
import './tier1-features/f08-web-ui-state.test';
import './tier1-features/f09-pac.test';
import './tier1-features/f10-mobile-tsc.test';
import './tier1-features/f11-mobile-state.test';
import './tier1-features/f12-wallet-otp.test';

// Tier 2: Boundary & Corner Cases
import './tier2-boundary/boundary-f01-f04.test';
import './tier2-boundary/boundary-f05-f08.test';
import './tier2-boundary/boundary-f09-f12.test';

// Tier 3: Cross-Feature Pairwise Integrations
import './tier3-pairwise/pairwise.test';

// Tier 4: Real-World Scenarios
import './tier4-scenarios/scenarios.test';

async function main() {
  console.log('================================================================================');
  console.log('  SPORTSVILLA E2E TEST SUITE RUNNER');
  console.log('  Payments Architecture, State Harmonization & Admin Gateway Analytics');
  console.log('================================================================================\n');

  console.log(`[INIT] Initialized isolated test SQLite database at tests/e2e/test_e2e.db`);
  console.log(`[INFO] Executing all Tiers (Tier 1: Feature Isolation, Tier 2: Boundary & Corner,`);
  console.log(`       Tier 3: Cross-Feature Pairwise, Tier 4: Real-World Workloads)...\n`);

  const startTime = Date.now();
  const { suites, totalPassed, totalFailed } = await registry.runAll();
  const duration = Date.now() - startTime;
  const totalAssertions = registry.getTotalAssertions();

  // Print Detailed Results by Suite
  console.log('--------------------------------------------------------------------------------');
  console.log('DETAILED TEST SUITE BREAKDOWN');
  console.log('--------------------------------------------------------------------------------');

  for (const suite of suites) {
    const icon = suite.failed === 0 ? '✓' : '✗';
    console.log(`\n${icon} [${suite.name}] (${suite.passed}/${suite.passed + suite.failed} passed, ${suite.durationMs}ms)`);
    for (const res of suite.results) {
      if (res.passed) {
        console.log(`    ✓ ${res.name} (${res.durationMs}ms)`);
      } else {
        console.log(`    ✗ ${res.name} (${res.durationMs}ms)`);
        if (res.error) {
          console.log(`        Error: ${res.error.message}`);
          if (res.error.stack) {
            const stackSnippet = res.error.stack.split('\n').slice(1, 4).join('\n');
            console.log(`        ${stackSnippet}`);
          }
        }
      }
    }
  }

  // Tier Aggregation Calculation
  let tier1Passed = 0, tier1Failed = 0;
  let tier2Passed = 0, tier2Failed = 0;
  let tier3Passed = 0, tier3Failed = 0;
  let tier4Passed = 0, tier4Failed = 0;

  for (const suite of suites) {
    if (suite.name.includes('Tier 1')) {
      tier1Passed += suite.passed;
      tier1Failed += suite.failed;
    } else if (suite.name.includes('Tier 2')) {
      tier2Passed += suite.passed;
      tier2Failed += suite.failed;
    } else if (suite.name.includes('Tier 3')) {
      tier3Passed += suite.passed;
      tier3Failed += suite.failed;
    } else if (suite.name.includes('Tier 4')) {
      tier4Passed += suite.passed;
      tier4Failed += suite.failed;
    }
  }

  console.log('\n================================================================================');
  console.log('TIER COVERAGE SUMMARY');
  console.log('================================================================================');
  console.log(`| Tier   | Category                        | Target | Passed | Failed | Status |`);
  console.log(`|--------|---------------------------------|--------|--------|--------|--------|`);
  console.log(`| Tier 1 | Core Feature Verification (F1-F12)| ≥60    | ${tier1Passed.toString().padEnd(6)} | ${tier1Failed.toString().padEnd(6)} | ${tier1Failed === 0 && tier1Passed >= 60 ? 'PASS ✓ ' : 'FAIL ✗ '} |`);
  console.log(`| Tier 2 | Boundary & Corner Cases (F1-F12)  | ≥60    | ${tier2Passed.toString().padEnd(6)} | ${tier2Failed.toString().padEnd(6)} | ${tier2Failed === 0 && tier2Passed >= 60 ? 'PASS ✓ ' : 'FAIL ✗ '} |`);
  console.log(`| Tier 3 | Cross-Feature Pairwise Integrations | ≥12  | ${tier3Passed.toString().padEnd(6)} | ${tier3Failed.toString().padEnd(6)} | ${tier3Failed === 0 && tier3Passed >= 12 ? 'PASS ✓ ' : 'FAIL ✗ '} |`);
  console.log(`| Tier 4 | Real-World Workload Scenarios    | ≥5     | ${tier4Passed.toString().padEnd(6)} | ${tier4Failed.toString().padEnd(6)} | ${tier4Failed === 0 && tier4Passed >= 5  ? 'PASS ✓ ' : 'FAIL ✗ '} |`);
  console.log(`| TOTAL  | All Test Assertions             | ≥137   | ${(tier1Passed + tier2Passed + tier3Passed + tier4Passed).toString().padEnd(6)} | ${(tier1Failed + tier2Failed + tier3Failed + tier4Failed).toString().padEnd(6)} | ${totalFailed === 0 ? 'PASS ✓ ' : 'FAIL ✗ '} |`);
  console.log('================================================================================');

  console.log(`\nFinal Verdict: ${totalFailed === 0 ? 'ALL TESTS PASSED (100%)' : `${totalFailed} TEST(S) FAILED`}`);
  console.log(`Total Test Cases Executed: ${totalPassed + totalFailed}`);
  console.log(`Total Individual Assertions Verified: ${totalAssertions}`);
  console.log(`Total Execution Time: ${duration}ms\n`);

  // Close database connection
  sharedTestDb.close();

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('[FATAL RUNNER ERROR]', err);
  sharedTestDb.close();
  process.exit(1);
});
