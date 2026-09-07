import { describe, test, expect, WebUIFormatter } from '../harness';

describe('Tier 1 - Feature F8: Web UI Payment State & Wallet Balance Display', () => {
  test('T1.8.1: Navbar wallet formatter displays directly in Rupees, preventing 100x multiplication bug', () => {
    const formatted = WebUIFormatter.formatNavbarWallet(50);
    // Must be ₹50, NEVER ₹5000
    expect(formatted).toBe('₹50');

    const formatted2 = WebUIFormatter.formatNavbarWallet(250.5);
    expect(formatted2).toBe('₹250.5');
  });

  test('T1.8.2: Navbar wallet formatter handles 0 and null balance gracefully as ₹0', () => {
    expect(WebUIFormatter.formatNavbarWallet(0)).toBe('₹0');
    expect(WebUIFormatter.formatNavbarWallet(null)).toBe('₹0');
    expect(WebUIFormatter.formatNavbarWallet(undefined)).toBe('₹0');
  });

  test('T1.8.3: Status badge renders Green Paid badge for paymentStatus PAID', () => {
    const badge = WebUIFormatter.formatBadge('PAID', 600, 0);
    expect(badge.label).toBe('Paid');
    expect(badge.color).toBe('green');
  });

  test('T1.8.4: Status badge renders Amber Partial badge with advance and due for paymentStatus PARTIAL', () => {
    const badge = WebUIFormatter.formatBadge('PARTIAL', 200, 400);
    expect(badge.label).toBe('Partial (₹200 Paid, ₹400 Due at Counter)');
    expect(badge.color).toBe('amber');
  });

  test('T1.8.5: Status badge renders Red Pay at Counter badge for paymentStatus UNPAID', () => {
    const badge = WebUIFormatter.formatBadge('UNPAID', 0, 600);
    expect(badge.label).toBe('Pay at Counter (₹600 Due)');
    expect(badge.color).toBe('red');
  });
});
