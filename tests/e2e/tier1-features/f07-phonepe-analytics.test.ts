import { describe, test, expect, GatewayAnalyticsCalculator, TransactionRecord } from '../harness';

describe('Tier 1 - Feature F7: PhonePe Analytics Dashboard Data & Aggregations', () => {
  const mockNow = new Date('2026-09-06T12:00:00.000Z');

  const sampleTxs: TransactionRecord[] = [
    {
      id: 'tx_pp_1',
      bookingId: 'bk_11',
      memberId: 'm_11',
      gateway: 'PHONEPE',
      gatewayOrderId: 'T_PP_1',
      gatewayPaymentId: 'PP_PAY_1',
      amount: 1800,
      currency: 'INR',
      status: 'SUCCESS',
      createdAt: '2026-09-06T09:00:00.000Z',
      updatedAt: '2026-09-06T09:05:00.000Z'
    },
    {
      id: 'tx_pp_2',
      bookingId: 'bk_12',
      memberId: 'm_12',
      gateway: 'PHONEPE',
      gatewayOrderId: 'T_PP_2',
      gatewayPaymentId: 'PP_PAY_2',
      amount: 2200,
      currency: 'INR',
      status: 'SUCCESS',
      createdAt: '2026-08-20T10:00:00.000Z', // 17 days ago
      updatedAt: '2026-08-20T10:05:00.000Z'
    },
    {
      id: 'tx_pp_3',
      bookingId: 'bk_13',
      memberId: 'm_13',
      gateway: 'PHONEPE',
      gatewayOrderId: 'T_PP_3',
      gatewayPaymentId: null,
      amount: 700,
      currency: 'INR',
      status: 'FAILED',
      createdAt: '2026-09-06T10:00:00.000Z',
      updatedAt: '2026-09-06T10:02:00.000Z'
    },
    {
      id: 'tx_pp_4',
      bookingId: 'bk_14',
      memberId: 'm_14',
      gateway: 'PHONEPE',
      gatewayOrderId: 'T_PP_4',
      gatewayPaymentId: null,
      amount: 1200,
      currency: 'INR',
      status: 'PENDING',
      createdAt: '2026-09-06T11:50:00.000Z',
      updatedAt: '2026-09-06T11:50:00.000Z'
    },
    // Cross-gateway records to ensure isolation
    {
      id: 'tx_rzp_x',
      bookingId: 'bk_15',
      memberId: 'm_15',
      gateway: 'RAZORPAY',
      gatewayOrderId: 'order_rzp_x',
      gatewayPaymentId: 'pay_rzp_x',
      amount: 5000,
      currency: 'INR',
      status: 'SUCCESS',
      createdAt: '2026-09-06T09:30:00.000Z',
      updatedAt: '2026-09-06T09:35:00.000Z'
    },
    {
      id: 'tx_wallet_x',
      bookingId: 'bk_16',
      memberId: 'm_16',
      gateway: 'WALLET',
      gatewayOrderId: null,
      gatewayPaymentId: null,
      amount: 300,
      currency: 'INR',
      status: 'SUCCESS',
      createdAt: '2026-09-06T09:40:00.000Z',
      updatedAt: '2026-09-06T09:40:00.000Z'
    }
  ];

  test('T1.7.1: Aggregates total PhonePe volume accurately from SUCCESS transactions', () => {
    const summary = GatewayAnalyticsCalculator.calculate(sampleTxs, 'PHONEPE', 'all', mockNow);
    // 1800 + 2200 = 4000
    expect(summary.totalVolume).toBe(4000);
    expect(summary.totalSuccessCount).toBe(2);
  });

  test('T1.7.2: Strictly excludes Razorpay (5000) and Wallet (300) transactions', () => {
    const summary = GatewayAnalyticsCalculator.calculate(sampleTxs, 'PHONEPE', 'all', mockNow);
    expect(summary.gateway).toBe('PHONEPE');
    // If Razorpay or Wallet leaked, totalVolume would be 9300
    expect(summary.totalVolume).toBe(4000);
    expect(summary.totalSuccessCount).toBe(2);
  });

  test('T1.7.3: Calculates PhonePe failed volume and failed count accurately', () => {
    const summary = GatewayAnalyticsCalculator.calculate(sampleTxs, 'PHONEPE', 'all', mockNow);
    expect(summary.totalFailedCount).toBe(1);
    expect(summary.failedVolume).toBe(700);
    // 2 success, 1 failed -> 2/3 = 67%
    expect(summary.successRate).toBe(67);
  });

  test('T1.7.4: Tracks pending PhonePe transactions awaiting webhook verification', () => {
    const summary = GatewayAnalyticsCalculator.calculate(sampleTxs, 'PHONEPE', 'all', mockNow);
    expect(summary.totalPendingCount).toBe(1);
  });

  test('T1.7.5: Correctly aggregates PhonePe 30d timeRange trend data', () => {
    const summary = GatewayAnalyticsCalculator.calculate(sampleTxs, 'PHONEPE', '30d', mockNow);
    // Both 2026-08-20 and 2026-09-06 fall within 30 days of 2026-09-06
    expect(summary.trend.length).toBe(2);
    expect(summary.trend[0].date).toBe('2026-08-20');
    expect(summary.trend[0].volume).toBe(2200);
    expect(summary.trend[1].date).toBe('2026-09-06');
    expect(summary.trend[1].volume).toBe(1800);
  });
});
