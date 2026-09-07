import { describe, test, expect, RBACRouter } from '../harness';

describe('Tier 1 - Feature F5: Admin RBAC Route Access for Gateways', () => {
  test('T1.5.1: Superadmin has unrestricted access to gateway analytics routes', () => {
    const superadmin = { role: 'SUPERADMIN', isActive: true, permissions: '' };
    expect(RBACRouter.canViewPage(superadmin, '/admin/razorpay')).toBe(true);
    expect(RBACRouter.canViewPage(superadmin, '/admin/phonepe')).toBe(true);
  });

  test('T1.5.2: Admin with view:reports permission is granted access to gateway analytics', () => {
    const reportsAdmin = { role: 'ADMIN', isActive: true, permissions: 'view:reports' };
    expect(RBACRouter.canViewPage(reportsAdmin, '/admin/razorpay')).toBe(true);
    expect(RBACRouter.canViewPage(reportsAdmin, '/admin/phonepe')).toBe(true);
  });

  test('T1.5.3: Admin without reports permission is denied access to gateway analytics', () => {
    const bookingsAdmin = { role: 'ADMIN', isActive: true, permissions: 'view:bookings,view:calendar' };
    expect(RBACRouter.canViewPage(bookingsAdmin, '/admin/razorpay')).toBe(false);
    expect(RBACRouter.canViewPage(bookingsAdmin, '/admin/phonepe')).toBe(false);
  });

  test('T1.5.4: Route precedence: /admin/razorpay and /admin/phonepe are NOT blocked by manage:admins', () => {
    // Admin has view:reports, but NOT manage:admins
    const reportsAdmin = { role: 'ADMIN', isActive: true, permissions: 'view:reports' };
    
    // In legacy buggy rbac, /admin/razorpay was caught by /admin prefix requiring manage:admins
    // Under F5 fix, /admin/razorpay requires view:reports, so this must return TRUE
    expect(RBACRouter.canViewPage(reportsAdmin, '/admin/razorpay')).toBe(true);
    expect(RBACRouter.canViewPage(reportsAdmin, '/admin/phonepe')).toBe(true);

    // But generic /admin/admins still requires manage:admins
    expect(RBACRouter.canViewPage(reportsAdmin, '/admin')).toBe(false);
  });

  test('T1.5.5: Inactive admin (isActive = false) is denied access unconditionally', () => {
    const inactiveSuperadmin = { role: 'SUPERADMIN', isActive: false, permissions: 'view:reports' };
    expect(RBACRouter.canViewPage(inactiveSuperadmin, '/admin/razorpay')).toBe(false);
    expect(RBACRouter.canViewPage(inactiveSuperadmin, '/admin/phonepe')).toBe(false);
  });
});
