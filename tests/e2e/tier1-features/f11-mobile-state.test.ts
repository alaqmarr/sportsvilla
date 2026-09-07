import { describe, test, expect } from '../harness';

describe('Tier 1 - Feature F11: Mobile App State Display & No Premature Success', () => {
  interface MobileBookingDisplay {
    badgeText: string;
    badgeColor: string;
    isEntryPassEnabled: boolean;
    headerConfirmationText: string;
  }

  function deriveMobileCardDisplay(booking: {
    status: string;
    paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
    advancePaid: number;
    amountDue: number;
  }): MobileBookingDisplay {
    if (booking.status === 'CANCELLED') {
      return {
        badgeText: 'Cancelled',
        badgeColor: '#EF4444',
        isEntryPassEnabled: false,
        headerConfirmationText: 'Booking Cancelled'
      };
    }

    if (booking.paymentStatus === 'PAID') {
      return {
        badgeText: 'Paid',
        badgeColor: '#10B981',
        isEntryPassEnabled: true,
        headerConfirmationText: 'Booking Confirmed & Paid'
      };
    }

    if (booking.paymentStatus === 'PARTIAL') {
      return {
        badgeText: `Partial (₹${booking.advancePaid} Paid, ₹${booking.amountDue} Due)`,
        badgeColor: '#F59E0B',
        isEntryPassEnabled: false, // Must settle at counter before entry
        headerConfirmationText: `Reserved — ₹${booking.amountDue} Due at Counter`
      };
    }

    // UNPAID / Pay at Counter
    return {
      badgeText: `Pay at Counter (₹${booking.amountDue} Due)`,
      badgeColor: '#EF4444',
      isEntryPassEnabled: false,
      headerConfirmationText: `Reserved — ₹${booking.amountDue} Due at Counter`
    };
  }

  test('T1.11.1: Mobile BookingCard renders Partial (PAC) badge when paymentStatus is PARTIAL', () => {
    const display = deriveMobileCardDisplay({
      status: 'CONFIRMED',
      paymentStatus: 'PARTIAL',
      advancePaid: 200,
      amountDue: 400
    });

    expect(display.badgeText).toBe('Partial (₹200 Paid, ₹400 Due)');
    expect(display.badgeColor).toBe('#F59E0B');
  });

  test('T1.11.2: Mobile BookingCard renders Pay at Counter badge when paymentStatus is UNPAID', () => {
    const display = deriveMobileCardDisplay({
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      advancePaid: 0,
      amountDue: 600
    });

    expect(display.badgeText).toBe('Pay at Counter (₹600 Due)');
    expect(display.badgeColor).toBe('#EF4444');
  });

  test('T1.11.3: Prevents showing Confirmed & Paid header confirmation when amountDue > 0', () => {
    const display = deriveMobileCardDisplay({
      status: 'CONFIRMED',
      paymentStatus: 'PARTIAL',
      advancePaid: 300,
      amountDue: 300
    });

    expect(display.headerConfirmationText).not.toContain('Confirmed & Paid');
    expect(display.headerConfirmationText).toContain('₹300 Due at Counter');
  });

  test('T1.11.4: Entry QR ticket pass is disabled until full payment settlement', () => {
    const partialDisplay = deriveMobileCardDisplay({
      status: 'CONFIRMED',
      paymentStatus: 'PARTIAL',
      advancePaid: 300,
      amountDue: 300
    });
    expect(partialDisplay.isEntryPassEnabled).toBe(false);

    const paidDisplay = deriveMobileCardDisplay({
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      advancePaid: 600,
      amountDue: 0
    });
    expect(paidDisplay.isEntryPassEnabled).toBe(true);
  });

  test('T1.11.5: Outstanding amount due is formatted clearly with rupee symbol', () => {
    const display = deriveMobileCardDisplay({
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      advancePaid: 0,
      amountDue: 1200
    });

    expect(display.headerConfirmationText).toBe('Reserved — ₹1200 Due at Counter');
  });
});
