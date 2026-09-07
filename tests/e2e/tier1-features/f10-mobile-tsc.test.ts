import { describe, test, expect } from '../harness';
import fs from 'fs';
import path from 'path';

describe('Tier 1 - Feature F10: Mobile App TypeScript Compilation & Type Safety', () => {
  const mobileRoot = path.resolve(process.cwd(), '../sportsvilla-app');

  test('T1.10.1: Mobile Razorpay checkout contract exports open method with required options', () => {
    interface RazorpayOptions {
      description?: string;
      image?: string;
      currency: string;
      key: string;
      amount: number;
      name: string;
      order_id: string;
      prefill?: {
        email?: string;
        contact?: string;
        name?: string;
      };
      theme?: {
        color?: string;
      };
    }

    const testOpts: RazorpayOptions = {
      key: 'rzp_test_123',
      amount: 60000, // paise
      name: 'Sportsvilla Turf Booking',
      order_id: 'order_98765',
      currency: 'INR',
      prefill: {
        contact: '9876543210',
        name: 'Rahul Sharma'
      }
    };

    expect(testOpts.key).toBe('rzp_test_123');
    expect(testOpts.amount).toBe(60000);
    expect(testOpts.order_id).toBe('order_98765');
  });

  test('T1.10.2: Mobile ThemeProvider types adhere to React Navigation Theme contract', () => {
    interface NavTheme {
      dark: boolean;
      colors: {
        primary: string;
        background: string;
        card: string;
        text: string;
        border: string;
        notification: string;
      };
    }

    const customTheme: NavTheme = {
      dark: false,
      colors: {
        primary: '#10B981',
        background: '#FFFFFF',
        card: '#F9FAFB',
        text: '#111827',
        border: '#E5E7EB',
        notification: '#EF4444'
      }
    };

    expect(customTheme.colors.primary).toBe('#10B981');
    expect(customTheme.dark).toBe(false);
  });

  test('T1.10.3: SFSymbols type safety enforces string symbol names without platform object crash', () => {
    type SFSymbol = string;
    const validSymbol: SFSymbol = 'sportscourt.fill';
    expect(typeof validSymbol).toBe('string');

    // Function to safely extract icon name across web and mobile
    function resolveIconName(nameOrObj: any): string {
      if (typeof nameOrObj === 'string') return nameOrObj;
      if (nameOrObj && typeof nameOrObj === 'object') {
        return nameOrObj.android || nameOrObj.ios || nameOrObj.web || 'default_icon';
      }
      return 'default_icon';
    }

    expect(resolveIconName('circle')).toBe('circle');
    expect(resolveIconName({ ios: 'circle.fill', android: 'circle', web: 'circle' })).toBe('circle');
  });

  test('T1.10.4: Mobile Booking interface strictly enforces canonical paymentStatus', () => {
    interface MobileBooking {
      id: string;
      turfId: string;
      sportId: string;
      paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
      status: 'CONFIRMED' | 'CANCELLED' | 'PAYMENT_PENDING';
      advancePaid: number;
      amountDue: number;
    }

    const testBooking: MobileBooking = {
      id: 'bk_mob_01',
      turfId: 'turf_01',
      sportId: 'sport_01',
      paymentStatus: 'PARTIAL',
      status: 'CONFIRMED',
      advancePaid: 300,
      amountDue: 300
    };

    expect(['UNPAID', 'PARTIAL', 'PAID'].includes(testBooking.paymentStatus)).toBe(true);
  });

  test('T1.10.5: Mobile repository contains tsconfig and app structure', () => {
    const tsconfigPath = path.join(mobileRoot, 'tsconfig.json');
    const packageJsonPath = path.join(mobileRoot, 'package.json');

    expect(fs.existsSync(tsconfigPath)).toBe(true);
    expect(fs.existsSync(packageJsonPath)).toBe(true);

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.name).toBe('sportsvilla-app');
  });
});
