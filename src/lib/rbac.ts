// Granular Role-Based Access Control (RBAC) Library for SportsVilla

export interface AdminUser {
  id?: string;
  email?: string;
  name?: string | null;
  role?: string; // "SUPERADMIN" | "ADMIN"
  permissions?: string; // Comma-separated string of permission keys
  isActive?: boolean;
}

export interface PermissionModule {
  id: string;
  name: string;
  description: string;
  viewKey: string;
  manageKey?: string;
}

export interface PermissionCategory {
  title: string;
  modules: PermissionModule[];
}

// Hierarchical modules organized from smallest to biggest operational impact
export const RBAC_CATEGORIES: PermissionCategory[] = [
  {
    title: "Operations",
    modules: [
      {
        id: "calendar",
        name: "Booking Calendar",
        description: "View and manage daily turf schedule & availability",
        viewKey: "view:calendar",
        manageKey: "manage:calendar",
      },
      {
        id: "bookings",
        name: "Turf Bookings",
        description: "View bookings, confirm slots, and manage reservations",
        viewKey: "view:bookings",
        manageKey: "manage:bookings",
      },
      {
        id: "checkin",
        name: "Entry Check-in",
        description: "QR scan and customer venue check-ins",
        viewKey: "view:checkin",
        manageKey: "manage:checkin",
      },
      {
        id: "attendance",
        name: "Attendance Kiosk",
        description: "Member check-in kiosk and daily attendance logs",
        viewKey: "view:attendance",
        manageKey: "manage:attendance",
      },
      {
        id: "tournaments",
        name: "Tournaments",
        description: "Organize tournaments, brackets, and team registrations",
        viewKey: "view:tournaments",
        manageKey: "manage:tournaments",
      },
    ],
  },
  {
    title: "Management",
    modules: [
      {
        id: "members",
        name: "Members Directory",
        description: "Customer database, family accounts, and profiles",
        viewKey: "view:members",
        manageKey: "manage:members",
      },
      {
        id: "wallets",
        name: "Member Wallets",
        description: "Member wallet balances, recharges, and transactions",
        viewKey: "view:wallets",
        manageKey: "manage:wallets",
      },
      {
        id: "plans",
        name: "Memberships & Plans",
        description: "Subscription plans, pricing, and active memberships",
        viewKey: "view:plans",
        manageKey: "manage:plans",
      },
      {
        id: "coupons",
        name: "Coupons & Discounts",
        description: "Promotional discount codes, validity, and usage limits",
        viewKey: "view:coupons",
        manageKey: "manage:coupons",
      },
      {
        id: "banners",
        name: "Homepage Banners",
        description: "Mobile & web promotional hero banners",
        viewKey: "view:banners",
        manageKey: "manage:banners",
      },
      {
        id: "loyalty",
        name: "Loyalty Leaderboard",
        description: "Loyalty points, achievements, and leaderboard rankings",
        viewKey: "view:loyalty",
        manageKey: "manage:loyalty",
      },
      {
        id: "sports",
        name: "Sports Setup",
        description: "Available sports, rules, and icon configurations",
        viewKey: "view:sports",
        manageKey: "manage:sports",
      },
      {
        id: "turfs",
        name: "Grounds & Turfs",
        description: "Turf arenas, pricing per slot, and capacities",
        viewKey: "view:turfs",
        manageKey: "manage:turfs",
      },
      {
        id: "whatsapp",
        name: "WhatsApp CRM & Bots",
        description: "Live WhatsApp conversations, auto-reply, and broadcast templates",
        viewKey: "view:whatsapp",
        manageKey: "manage:whatsapp",
      },
    ],
  },
  {
    title: "Reports & Analytics",
    modules: [
      {
        id: "reports",
        name: "Analytics & Reports",
        description: "Revenue reports, utilization charts, and exportable data",
        viewKey: "view:reports",
        manageKey: "manage:reports",
      },
    ],
  },
  {
    title: "System & Governance",
    modules: [
      {
        id: "settings",
        name: "Global Settings",
        description: "Company details, contact numbers, and site configurations",
        viewKey: "view:settings",
        manageKey: "manage:settings",
      },
      {
        id: "logs",
        name: "Application Logs",
        description: "System error logs, debugging, and webhook traces",
        viewKey: "view:logs",
        manageKey: "manage:logs",
      },
      {
        id: "versions",
        name: "Mobile App Versions",
        description: "Manage Android/iOS build versions and forced updates",
        viewKey: "view:versions",
        manageKey: "manage:versions",
      },
      {
        id: "audit",
        name: "Audit Logs",
        description: "Track administrator activities and audit trails",
        viewKey: "view:audit",
        manageKey: "manage:audit",
      },
      {
        id: "server",
        name: "Server Status",
        description: "SQLite database health, backups, and server diagnostics",
        viewKey: "view:server",
        manageKey: "manage:server",
      },
      {
        id: "admins",
        name: "Role & Admin Users",
        description: "Manage admin accounts, roles, and granular RBAC permissions",
        viewKey: "manage:admins",
        manageKey: "manage:admins",
      },
    ],
  },
];

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

  const routePermissionMap: Record<string, string> = {
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
    "/settings": "view:settings",
    "/app-logs": "view:logs",
    "/app-versions": "view:versions",
    "/audit": "view:audit",
    "/server": "view:server",
    "/admin": "manage:admins",
  };

  for (const [routePrefix, permKey] of Object.entries(routePermissionMap)) {
    if (pathname.startsWith(routePrefix)) {
      return hasPermission(admin, permKey);
    }
  }

  // If route is not explicitly mapped in RBAC, allow access by default for admin users
  return true;
}
