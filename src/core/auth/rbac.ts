// Granular Role-Based Access Control (RBAC) Evaluator for SportsVilla
import { AdminUser, PERMISSIONS, Permission, RBAC_CATEGORIES, PermissionCategory, PermissionModule } from "./rbac-definitions";

export { RBAC_CATEGORIES, PERMISSIONS };
export type { AdminUser, Permission, PermissionCategory, PermissionModule };

export const routePermissionMap: Record<string, string> = {
  "/calendar": "view:calendar",
  "/bookings": "view:bookings",
  "/checkin": "view:checkin",
  "/attendance": "view:attendance",
  "/tournaments": "view:tournaments",
  "/members": "view:members",
  "/wallets": "view:wallets",
  "/plans": "view:plans",
  "/coupons": "view:coupons",
  "/banners": "view:banners",
  "/loyalty": "view:loyalty",
  "/sports": "view:sports",
  "/turfs": "view:turfs",
  "/whatsapp-admin": "view:whatsapp",
  "/whatsapp/dashboard": "view:whatsapp",
  "/whatsapp": "view:whatsapp",
  "/reports": "view:reports",
  "/razorpay": "view:reports",
  "/phonepe": "view:reports",
  "/settings": "view:settings",
  "/app-logs": "view:logs",
  "/app-versions": "view:versions",
  "/audit": "view:audit",
  "/server": "view:server",
  "/admin/nfc": "view:nfc",
  "/nfc": "view:nfc",
  "/admin": "manage:admins",
};

/**
 * Check if an admin user has a specific granular permission.
 * By default, any admin with role = "SUPERADMIN" has unrestricted access.
 */
export function hasPermission(
  admin: AdminUser | null | undefined,
  permissionKey: string
): boolean {
  if (!admin || admin.isActive === false) return false;
  if (admin.role === "SUPERADMIN") return true;

  if (!admin.permissions) return false;
  const userPerms = admin.permissions
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  // If checking for a view permission, having either view:module or manage:module grants view access
  if (permissionKey.startsWith("view:")) {
    const moduleName = permissionKey.replace("view:", "");
    return (
      userPerms.includes(permissionKey) ||
      userPerms.includes(`manage:${moduleName}`)
    );
  }

  return userPerms.includes(permissionKey);
}

/**
 * Map pathname to required view permission and check access.
 */
export function canViewPage(
  admin: AdminUser | null | undefined,
  pathname: string
): boolean {
  if (!admin || admin.isActive === false) return false;
  if (admin.role === "SUPERADMIN") return true;

  // Root dashboard is visible to any active admin
  if (pathname === "/" || pathname === "" || pathname === "/dashboard") {
    return true;
  }

  for (const [routePrefix, permKey] of Object.entries(routePermissionMap)) {
    if (pathname.startsWith(routePrefix)) {
      return hasPermission(admin, permKey);
    }
  }

  // If route is not explicitly mapped in RBAC, allow access by default for admin users
  return true;
}
