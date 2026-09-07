import { describe, test, expect, RBACRouter, GatewayAnalyticsCalculator, WebUIFormatter, TransactionRecord } from '../harness';

describe('Tier 2 - Boundary Cases: Features F5 - F8', () => {
  const mockNow = new Date('2026-09-06T12:00:00.000Z');

  // --------------------------------------------------------------------------
  // F5 Boundary Cases
  // --------------------------------------------------------------------------
  test('T2.F5.1: Trailing slash in route path (/admin/razorpay/) matches same as without slash', () => {
    const admin = { role: 'ADMIN', isActive: true, permissions: 'view:reports' };
    expect(RBACRouter.canViewPage(admin, '/admin/razorpay/')).toBe(true);
    expect(RBACRouter.canViewPage(admin, '/admin/phonepe/')).toBe(true);
  });

  test('T2.F5.2: Query parameters in route path (/admin/razorpay?range=30d) do not break RBAC matching', () => {
    const admin = { role: 'ADMIN', isActive: true, permissions: 'view:reports' };
    expect(RBACRouter.canViewPage(admin, '/admin/razorpay?range=30d&filter=all')).toBe(true);
  });

  test('T2.F5.3: Permissions string with arbitrary whitespace parses cleanly', () => {
    const admin = { role: 'ADMIN', isActive: true, permissions: '  view:reports  ,   view:bookings  ' };
    expect(RBACRouter.canViewPage(admin, '/admin/razorpay')).toBe(true);
  });

  test('T2.F5.4: Admin with null or undefined permissions defaults safely to false', () => {
    const admin = { role: 'ADMIN', isActive: true, permissions: undefined };
    expect(RBACRouter.canViewPage(admin, '/admin/razorpay')).toBe(false);
  });

  test('T2.F5.5: Deeply nested subpath (/admin/razorpay/transactions/tx_123) correctly inherits report permission', () => {
    const admin = { role: 'ADMIN', isActive: true, permissions: 'view:reports' };
    expect(RBACRouter.canViewPage(admin, '/admin/razorpay/transactions/tx_123')).toBe(true);
  });

  // --------------------------------------------------------------------------
  // F6 Boundary Cases
  // --------------------------------------------------------------------------
  test('T2.F6.1: Empty Razorpay dataset returns zero metrics and empty trend', () => {
    const summary = GatewayAnalyticsCalculator.calculate([], 'RAZORPAY', 'all', mockNow);
    expect(summary.totalVolume).toBe(0);
    expect(summary.totalSuccessCount).toBe(0);
    expect(summary.totalFailedCount).toBe(0);
    expect(summary.totalPendingCount).toBe(0);
    expect(summary.successRate).toBe(0);
    expect(summary.trend.length).toBe(0);
  });

  test('T2.F6.2: 100% failure rate correctly calculates 0% successRate', () => {
    const failedTxs: TransactionRecord[] = [
      { id: '1', bookingId: null, memberId: null, gateway: 'RAZORPAY', gatewayOrderId: null, gatewayPaymentId: null, amount: 500, currency: 'INR', status: 'FAILED', createdAt: '2026-09-06T10:00:00Z', updatedAt: '2026-09-06T10:00:00Z' },
      { id: '2', bookingId: null, memberId: null, gateway: 'RAZORPAY', gatewayOrderId: null, gatewayPaymentId: null, amount: 500, currency: 'INR', status: 'FAILED', createdAt: '2026-09-06T10:00:00Z', updatedAt: '2026-09-06T10:00:00Z' }
    ];
    const summary = GatewayAnalyticsCalculator.calculate(failedTxs, 'RAZORPAY', 'all', mockNow);
    expect(summary.successRate).toBe(0);
    expect(summary.totalFailedCount).toBe(2);
    expect(summary.totalSuccessCount).toBe(0);
  });

  test('T2.F6.3: 100% success rate correctly calculates 100% successRate', () => {
    const successTxs: TransactionRecord[] = [
      { id: '1', bookingId: null, memberId: null, gateway: 'RAZORPAY', gatewayOrderId: null, gatewayPaymentId: null, amount: 1000, currency: 'INR', status: 'SUCCESS', createdAt: '2026-09-06T10:00:00Z', updatedAt: '2026-09-06T10:00:00Z' }
    ];
    const summary = GatewayAnalyticsCalculator.calculate(successTxs, 'RAZORPAY', 'all', mockNow);
    expect(summary.successRate).toBe(100);
    expect(summary.totalSuccessCount).toBe(1);
  });

  test('T2.F6.4: Midnight boundary: transaction created at start of day is included in today range', () => {
    const midnightTx: TransactionRecord[] = [
      { id: '1', bookingId: null, memberId: null, gateway: 'RAZORPAY', gatewayOrderId: null, gatewayPaymentId: null, amount: 1200, currency: 'INR', status: 'SUCCESS', createdAt: '2026-09-06T00:00:01.000Z', updatedAt: '2026-09-06T00:00:01.000Z' }
    ];
    const summary = GatewayAnalyticsCalculator.calculate(midnightTx, 'RAZORPAY', 'today', mockNow);
    expect(summary.totalVolume).toBe(1200);
    expect(summary.totalSuccessCount).toBe(1);
  });

  test('T2.F6.5: Floating point paise volume sum maintains precision', () => {
    const txs: TransactionRecord[] = [
      { id: '1', bookingId: null, memberId: null, gateway: 'RAZORPAY', gatewayOrderId: null, gatewayPaymentId: null, amount: 10.10, currency: 'INR', status: 'SUCCESS', createdAt: '2026-09-06T10:00:00Z', updatedAt: '2026-09-06T10:00:00Z' },
      { id: '2', bookingId: null, memberId: null, gateway: 'RAZORPAY', gatewayOrderId: null, gatewayPaymentId: null, amount: 20.20, currency: 'INR', status: 'SUCCESS', createdAt: '2026-09-06T10:00:00Z', updatedAt: '2026-09-06T10:00:00Z' }
    ];
    const summary = GatewayAnalyticsCalculator.calculate(txs, 'RAZORPAY', 'all', mockNow);
    expect(summary.totalVolume).toBeCloseTo(30.30, 2);
  });

  // --------------------------------------------------------------------------
  // F7 Boundary Cases
  // --------------------------------------------------------------------------
  test('T2.F7.1: Empty PhonePe dataset returns 0 metrics safely', () => {
    const summary = GatewayAnalyticsCalculator.calculate([], 'PHONEPE', 'all', mockNow);
    expect(summary.totalVolume).toBe(0);
    expect(summary.successRate).toBe(0);
    expect(summary.statusDistribution.length).toBe(3);
  });

  test('T2.F7.2: Mixed PhonePe statuses (PENDING, SUCCESS, FAILED, ABANDONED) aggregate accurately', () => {
    const txs: TransactionRecord[] = [
      { id: '1', bookingId: null, memberId: null, gateway: 'PHONEPE', gatewayOrderId: null, gatewayPaymentId: null, amount: 1000, currency: 'INR', status: 'SUCCESS', createdAt: '2026-09-06T10:00:00Z', updatedAt: '2026-09-06T10:00:00Z' },
      { id: '2', bookingId: null, memberId: null, gateway: 'PHONEPE', gatewayOrderId: null, gatewayPaymentId: null, amount: 500, currency: 'INR', status: 'FAILED', createdAt: '2026-09-06T10:00:00Z', updatedAt: '2026-09-06T10:00:00Z' },
      { id: '3', bookingId: null, memberId: null, gateway: 'PHONEPE', gatewayOrderId: null, gatewayPaymentId: null, amount: 800, currency: 'INR', status: 'PENDING', createdAt: '2026-09-06T10:00:00Z', updatedAt: '2026-09-06T10:00:00Z' },
      { id: '4', bookingId: null, memberId: null, gateway: 'PHONEPE', gatewayOrderId: null, gatewayPaymentId: null, amount: 700, currency: 'INR', status: 'ABANDONED', createdAt: '2026-09-06T10:00:00Z', updatedAt: '2026-09-06T10:00:00Z' }
    ];
    const summary = GatewayAnalyticsCalculator.calculate(txs, 'PHONEPE', 'all', mockNow);
    expect(summary.totalVolume).toBe(1000);
    expect(summary.totalFailedCount).toBe(1);
    expect(summary.totalPendingCount).toBe(1);
  });

  test('T2.F7.3: Invalid timeRange parameter falls back safely to all', () => {
    const txs: TransactionRecord[] = [
      { id: '1', bookingId: null, memberId: null, gateway: 'PHONEPE', gatewayOrderId: null, gatewayPaymentId: null, amount: 1500, currency: 'INR', status: 'SUCCESS', createdAt: '2026-09-01T10:00:00Z', updatedAt: '2026-09-01T10:00:00Z' }
    ];
    const summary = GatewayAnalyticsCalculator.calculate(txs, 'PHONEPE', 'all' as any, mockNow);
    expect(summary.totalVolume).toBe(1500);
  });

  test('T2.F7.4: Large PhonePe transaction volume (₹500,000) aggregates without overflow', () => {
    const txs: TransactionRecord[] = [
      { id: '1', bookingId: null, memberId: null, gateway: 'PHONEPE', gatewayOrderId: null, gatewayPaymentId: null, amount: 500000, currency: 'INR', status: 'SUCCESS', createdAt: '2026-09-06T10:00:00Z', updatedAt: '2026-09-06T10:00:00Z' }
    ];
    const summary = GatewayAnalyticsCalculator.calculate(txs, 'PHONEPE', 'all', mockNow);
    expect(summary.totalVolume).toBe(500000);
  });

  test('T2.F7.5: Status distribution color palette maintains consistency across zero-counts', () => {
    const summary = GatewayAnalyticsCalculator.calculate([], 'PHONEPE', 'all', mockNow);
    expect(summary.statusDistribution[0].color).toBe('#10B981');
    expect(summary.statusDistribution[1].color).toBe('#EF4444');
    expect(summary.statusDistribution[2].color).toBe('#F59E0B');
  });

  // --------------------------------------------------------------------------
  // F8 Boundary Cases
  // --------------------------------------------------------------------------
  test('T2.F8.1: Navbar formatter handles zero balance explicitly as ₹0', () => {
    expect(WebUIFormatter.formatNavbarWallet(0)).toBe('₹0');
  });

  test('T2.F8.2: Navbar formatter handles fractional balance without losing precision', () => {
    expect(WebUIFormatter.formatNavbarWallet(45.75)).toBe('₹45.75');
  });

  test('T2.F8.3: Navbar formatter handles large wallet balance safely', () => {
    expect(WebUIFormatter.formatNavbarWallet(999999)).toBe('₹999999');
  });

  test('T2.F8.4: Badge formatter returns Unknown gray badge for unrecognized status strings', () => {
    const badge = WebUIFormatter.formatBadge('CORRUPTED_STATUS', 0, 0);
    expect(badge.label).toBe('Unknown');
    expect(badge.color).toBe('gray');
  });

  test('T2.F8.5: Badge formatter with 0 advance and 0 due handles display', () => {
    const badge = WebUIFormatter.formatBadge('PAID', 0, 0);
    expect(badge.label).toBe('Paid');
    expect(badge.color).toBe('green');
  });
});
