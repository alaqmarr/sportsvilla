import { describe, test, expect, GatewayAnalyticsCalculator, TransactionRecord } from '../harness';

describe('Tier 1 - Feature F6: Razorpay Analytics Dashboard Data & Aggregations', () => {
  const mockNow = new Date('2026-09-06T12:00:00.000Z');

  const sampleTxs: TransactionRecord[] = [
    {
      id: 'tx_rzp_1',
      bookingId: 'bk_1',
      memberId: 'm_1',
      gateway: 'RAZORPAY',
      gatewayOrderId: 'order_1',
      gatewayPaymentId: 'pay_1',
      amount: 1000,
      currency: 'INR',
      status: 'SUCCESS',
      createdAt: '2026-09-06T08:00:00.000Z',
      updatedAt: '2026-09-06T08:05:00.000Z'
    },
    {
      id: 'tx_rzp_2',
      bookingId: 'bk_2',
      memberId: 'm_2',
      gateway: 'RAZORPAY',
      gatewayOrderId: 'order_2',
      gatewayPaymentId: 'pay_2',
      amount: 1500,
      currency: 'INR',
      status: 'SUCCESS',
      createdAt: '2026-09-05T10:00:00.000Z',
      updatedAt: '2026-09-05T10:05:00.000Z'
    },
    {
      id: 'tx_rzp_3',
      bookingId: 'bk_3',
      memberId: 'm_3',
      gateway: 'RAZORPAY',
      gatewayOrderId: 'order_3',
      gatewayPaymentId: null,
      amount: 500,
      currency: 'INR',
      status: 'FAILED',
      createdAt: '2026-09-06T09:00:00.000Z',
      updatedAt: '2026-09-06T09:01:00.000Z'
    },
    {
      id: 'tx_rzp_4',
      bookingId: 'bk_4',
      memberId: 'm_4',
      gateway: 'RAZORPAY',
      gatewayOrderId: 'order_4',
      gatewayPaymentId: null,
      amount: 800,
      currency: 'INR',
      status: 'PENDING',
      createdAt: '2026-09-06T11:45:00.000Z',
      updatedAt: '2026-09-06T11:45:00.000Z'
    },
    // Non-Razorpay transaction to verify gateway isolation
    {
      id: 'tx_pp_1',
      bookingId: 'bk_5',
      memberId: 'm_5',
      gateway: 'PHONEPE',
      gatewayOrderId: 'pp_1',
      gatewayPaymentId: 'pay_pp_1',
      amount: 2000,
      currency: 'INR',
      status: 'SUCCESS',
      createdAt: '2026-09-06T07:00:00.000Z',
      updatedAt: '2026-09-06T07:05:00.000Z'
    }
  ];

  test('T1.6.1: Aggregates total Razorpay volume accurately from SUCCESS transactions only', () => {
    const summary = GatewayAnalyticsCalculator.calculate(sampleTxs, 'RAZORPAY', 'all', mockNow);
    // Only tx_rzp_1 (1000) and tx_rzp_2 (1500) = 2500. PhonePe tx (2000) excluded.
    expect(summary.totalVolume).toBe(2500);
    expect(summary.totalSuccessCount).toBe(2);
  });

  test('T1.6.2: Calculates Razorpay success rate accurately', () => {
    const summary = GatewayAnalyticsCalculator.calculate(sampleTxs, 'RAZORPAY', 'all', mockNow);
    // 2 SUCCESS, 1 FAILED -> Total Decided = 3. 2/3 = 66.67% -> 67%
    expect(summary.successRate).toBe(67);
    expect(summary.totalFailedCount).toBe(1);
    expect(summary.failedVolume).toBe(500);
    expect(summary.totalPendingCount).toBe(1);
  });

  test('T1.6.3: Filters Razorpay transactions by time ranges: today vs all', () => {
    const todaySummary = GatewayAnalyticsCalculator.calculate(sampleTxs, 'RAZORPAY', 'today', mockNow);
    // Today: tx_rzp_1 (SUCCESS, 1000), tx_rzp_3 (FAILED, 500), tx_rzp_4 (PENDING, 800)
    expect(todaySummary.totalVolume).toBe(1000);
    expect(todaySummary.totalSuccessCount).toBe(1);
    expect(todaySummary.totalFailedCount).toBe(1);
    expect(todaySummary.totalPendingCount).toBe(1);
    // 1 success, 1 failed = 50%
    expect(todaySummary.successRate).toBe(50);
  });

  test('T1.6.4: Produces daily trend aggregation buckets sorted chronologically', () => {
    const summary = GatewayAnalyticsCalculator.calculate(sampleTxs, 'RAZORPAY', 'all', mockNow);
    expect(summary.trend.length).toBe(2);
    expect(summary.trend[0].date).toBe('2026-09-05');
    expect(summary.trend[0].volume).toBe(1500);
    expect(summary.trend[0].successCount).toBe(1);

    expect(summary.trend[1].date).toBe('2026-09-06');
    expect(summary.trend[1].volume).toBe(1000);
    expect(summary.trend[1].successCount).toBe(1);
    expect(summary.trend[1].failedCount).toBe(1);
  });

  test('T1.6.5: Generates status distribution slices with proper theme colors', () => {
    const summary = GatewayAnalyticsCalculator.calculate(sampleTxs, 'RAZORPAY', 'all', mockNow);
    const dist = summary.statusDistribution;

    const successSlice = dist.find(d => d.name === 'Success')!;
    expect(successSlice).toBeDefined();
    expect(successSlice.value).toBe(2);
    expect(successSlice.color).toBe('#10B981'); // Emerald green

    const failedSlice = dist.find(d => d.name === 'Failed')!;
    expect(failedSlice).toBeDefined();
    expect(failedSlice.value).toBe(1);
    expect(failedSlice.color).toBe('#EF4444'); // Red

    const pendingSlice = dist.find(d => d.name === 'Pending')!;
    expect(pendingSlice).toBeDefined();
    expect(pendingSlice.value).toBe(1);
    expect(pendingSlice.color).toBe('#F59E0B'); // Amber
  });
});
