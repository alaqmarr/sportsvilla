"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import LinkComponent from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import {
  FiHome,
  FiUsers,
  FiMapPin,
  FiActivity,
  FiLayers,
  FiShield,
  FiFileText,
  FiMenu,
  FiX,
  FiUser,
  FiCalendar,
  FiServer,
  FiLogOut,
  FiSettings,
  FiAward,
  FiCheckCircle,
  FiTag,
  FiDatabase,
  FiCreditCard,
  FiSmartphone,
  FiHeart,
  FiZap,
  FiRadio,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { canViewPage } from "@/core/auth/rbac";
import { AdminUser } from "@/core/auth/rbac-definitions";
import { useNfc } from "@/components/nfc/NfcProvider";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Badge } from "@/components/admin/ui/Badge";

interface NavLinkItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  links: NavLinkItem[];
}

const STORAGE_KEY = "sv_admin_sidebar_collapsed";

const routeLabelMap: Record<string, string> = {
  admin: "Admin",
  nfc: "NFC",
  assign: "Assign Card",
  lookup: "Lookup Member",
  transactions: "Transactions Ledger",
  wallet: "Wallet POS",
  kiosk: "Check-in Kiosk",
  "app-logs": "System Logs",
  "app-versions": "App Versions",
  attendance: "Attendance Kiosk",
  audit: "Audit Logs",
  banners: "Homepage Banners",
  bookings: "Sports Bookings",
  calendar: "Booking Calendar",
  checkin: "Entry Check-in",
  coupons: "Coupons",
  loyalty: "Loyalty Leaderboard",
  members: "Members Directory",
  phonepe: "PhonePe Analytics",
  plans: "Membership Plans",
  razorpay: "Razorpay Analytics",
  reports: "Reports",
  revenue: "Revenue Analytics",
  member: "Member Reports",
  memberships: "Membership Reports",
  server: "Server Health",
  settings: "Settings",
  sports: "Sports",
  tournaments: "Tournaments",
  turfs: "Grounds & Turfs",
  wallets: "Member Wallets",
  whatsapp: "WhatsApp",
  dashboard: "Analytics Dashboard",
  "whatsapp-admin": "WhatsApp CRM",
  health: "Health & Diagnostics",
  templates: "Templates Tester",
  events: "Event Triggers",
};

export function Navigation({
  children,
  admin,
}: {
  children: React.ReactNode;
  admin?: AdminUser | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const lastSyncRef = useRef<number>(Date.now());
  const nfc = useNfc();

  // Initialize collapse state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "true") {
        setIsCollapsed(true);
      }
    } catch {
      // ignore localStorage errors in private modes
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // Update IST Clock
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }) + " IST"
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Global Auto-Sync Polling
  useEffect(() => {
    if (pathname.startsWith("/m/") || pathname === "/display") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/sync", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.latest > lastSyncRef.current) {
            lastSyncRef.current = data.latest;
            router.refresh();
          }
        }
      } catch {
        // ignore fetch errors silently
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [pathname, router]);

  // 6 Structured Grouped Nav Sections
  const linkGroups: NavGroup[] = useMemo(
    () => [
      {
        title: "Core",
        links: [
          { href: "/", label: "Dashboard", icon: <FiHome /> },
          { href: "/bookings", label: "Sports Bookings", icon: <FiCalendar /> },
          { href: "/calendar", label: "Booking Calendar", icon: <FiCalendar /> },
          { href: "/checkin", label: "Entry Check-in", icon: <FiCheckCircle /> },
          { href: "/attendance", label: "Attendance Kiosk", icon: <FiShield /> },
          { href: "/tournaments", label: "Tournaments", icon: <FiAward /> },
        ],
      },
      {
        title: "Members",
        links: [
          { href: "/members", label: "Members Directory", icon: <FiUsers /> },
          { href: "/wallets", label: "Member Wallets", icon: <FiCreditCard /> },
          { href: "/plans", label: "Memberships", icon: <FiLayers /> },
          { href: "/coupons", label: "Coupons", icon: <FiTag /> },
          { href: "/loyalty", label: "Loyalty Leaderboard", icon: <FiAward /> },
        ],
      },
      {
        title: "Revenue",
        links: [
          { href: "/reports/revenue", label: "Revenue Analytics", icon: <FiFileText /> },
          { href: "/razorpay", label: "Razorpay Transactions", icon: <FiCreditCard /> },
          { href: "/phonepe", label: "PhonePe Transactions", icon: <FiCreditCard /> },
          { href: "/reports/member", label: "Member Reports", icon: <FiUser /> },
          { href: "/reports/attendance", label: "Attendance Reports", icon: <FiCalendar /> },
          { href: "/reports/memberships", label: "Membership Reports", icon: <FiLayers /> },
        ],
      },
      {
        title: "WhatsApp",
        links: [
          { href: "/whatsapp-admin", label: "Live CRM Chat", icon: <FaWhatsapp /> },
          { href: "/whatsapp-admin/templates", label: "Templates Tester", icon: <FiLayers /> },
          { href: "/whatsapp-admin/events", label: "Event Triggers", icon: <FiZap /> },
          { href: "/whatsapp-admin/health", label: "Health & Config", icon: <FiHeart /> },
          { href: "/whatsapp/dashboard", label: "Analytics Dashboard", icon: <FiActivity /> },
        ],
      },
      {
        title: "Cards & NFC",
        links: [
          { href: "/admin/nfc/kiosk", label: "Check-in Kiosk", icon: <FiShield /> },
          { href: "/admin/nfc/assign", label: "Card Assignment", icon: <FiCreditCard /> },
          { href: "/admin/nfc/lookup", label: "Member Lookup", icon: <FiUser /> },
          { href: "/admin/nfc/wallet", label: "Wallet POS", icon: <FiZap /> },
          { href: "/admin/nfc/transactions", label: "NFC Ledger", icon: <FiFileText /> },
        ],
      },
      {
        title: "TV Signage",
        links: [
          { href: "/tv/screens", label: "TV Screens", icon: <FiRadio /> },
        ],
      },
      {
        title: "Settings & Tools",
        links: [
          { href: "/sports", label: "Sports Catalog", icon: <FiActivity /> },
          { href: "/turfs", label: "Grounds & Turfs", icon: <FiMapPin /> },
          { href: "/banners", label: "Homepage Banners", icon: <FiTag /> },
          { href: "/admin", label: "Role & Admin Users", icon: <FiShield /> },
          { href: "/settings", label: "General Settings", icon: <FiSettings /> },
          { href: "/settings/phonepe", label: "PhonePe Config", icon: <FiCreditCard /> },
          { href: "/backups", label: "Automated Backups", icon: <FiDatabase /> },
          { href: "/app-versions", label: "App Versions", icon: <FiSmartphone /> },
          { href: "/server", label: "Server Health", icon: <FiServer /> },
          { href: "/app-logs", label: "System Logs", icon: <FiFileText /> },
          { href: "/audit", label: "Audit Logs", icon: <FiShield /> },
        ],
      },
    ],
    []
  );

  const filteredLinkGroups = useMemo(() => {
    return linkGroups
      .map((group) => ({
        ...group,
        links: group.links.filter((link) => canViewPage(admin, link.href)),
      }))
      .filter((group) => group.links.length > 0);
  }, [linkGroups, admin]);

  // Derive dynamic breadcrumbs from current route pathname
  const breadcrumbs = useMemo(() => {
    if (pathname === "/") {
      return [{ label: "Dashboard", href: "/" }];
    }

    const segments = pathname.split("/").filter(Boolean);
    const crumbs: Array<{ label: string; href?: string }> = [
      { label: "Dashboard", href: "/" },
    ];

    let accHref = "";
    segments.forEach((seg, idx) => {
      accHref += `/${seg}`;
      const isLast = idx === segments.length - 1;
      const formattedLabel =
        routeLabelMap[seg] ||
        seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");

      crumbs.push({
        label: formattedLabel,
        href: isLast ? undefined : accHref,
      });
    });

    return crumbs;
  }, [pathname]);

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/whatsapp/dashboard") {
      return pathname === "/whatsapp/dashboard";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-sv-bg overflow-x-hidden font-sans text-sv-text">
      {/* Mobile Topbar */}
      <div className="lg:hidden bg-sv-surface border-b border-sv-border px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sv-sm">
        <div className="flex items-center gap-3">
          <LinkComponent href="/" className="flex items-center">
            <Image
              src="/long-logo.png"
              alt="SportsVilla"
              width={160}
              height={36}
              unoptimized
              className="h-8 w-auto object-contain"
            />
          </LinkComponent>
        </div>

        <div className="flex items-center gap-2">
          {currentTime && (
            <span className="text-[10px] font-mono text-sv-text-muted hidden sm:inline-block">
              {currentTime}
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 text-sv-text hover:bg-sv-surface-raised rounded-sv-sm transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileSidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Desktop & Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-sv-surface border-r border-sv-border flex flex-col z-50 transition-all duration-300 ease-sv-default ${
          // Mobile drawer logic
          isMobileSidebarOpen
            ? "translate-x-0 shadow-sv-xl w-64"
            : "-translate-x-full lg:translate-x-0"
        } ${
          // Desktop collapsed vs expanded width
          isCollapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        {/* Sidebar Header & Brand */}
        <div
          className={`h-16 border-b border-sv-border-subtle flex items-center justify-between px-4 flex-shrink-0 ${
            isCollapsed ? "lg:justify-center" : ""
          }`}
        >
          <LinkComponent
            href="/"
            className={`flex items-center gap-2 overflow-hidden transition-all ${
              isCollapsed ? "lg:hidden" : ""
            }`}
          >
            <Image
              src="/long-logo.png"
              alt="SportsVilla"
              width={180}
              height={40}
              unoptimized
              className="h-9 w-auto object-contain"
            />
          </LinkComponent>

          {/* Collapsed small logo mark */}
          {isCollapsed && (
            <LinkComponent
              href="/"
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-sv-md bg-sv-brand-subtle text-sv-brand font-black text-xl border border-sv-brand/30"
              title="SportsVilla Admin"
            >
              SV
            </LinkComponent>
          )}

          {/* Desktop Collapse Toggle Button */}
          <button
            type="button"
            onClick={toggleCollapse}
            className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-sv-sm text-sv-text-muted hover:text-sv-text hover:bg-sv-surface-hover border border-sv-border transition-colors cursor-pointer ${
              isCollapsed ? "mt-2" : ""
            }`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 styled-scrollbar">
          {filteredLinkGroups.map((group, gIdx) => (
            <div key={`group-${gIdx}`} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-sv-text-muted/80 select-none">
                  {group.title}
                </div>
              )}
              {isCollapsed && (
                <div
                  className="hidden lg:block my-2 border-t border-sv-border-subtle mx-2"
                  title={group.title}
                />
              )}

              {group.links.map((link) => {
                const active = isLinkActive(link.href);

                return (
                  <LinkComponent
                    key={link.href}
                    href={link.href}
                    title={isCollapsed ? link.label : undefined}
                    className={`flex items-center rounded-sv-sm text-sm font-medium transition-colors group relative ${
                      isCollapsed
                        ? "lg:justify-center lg:px-2 lg:py-2.5 px-3 py-2 gap-3"
                        : "px-3 py-2 gap-3"
                    } ${
                      active
                        ? "bg-sv-surface-raised text-sv-brand font-semibold shadow-sv-sm border border-sv-border"
                        : "text-sv-text-secondary hover:text-sv-text hover:bg-sv-surface-hover"
                    }`}
                  >
                    <span
                      className={`text-base flex-shrink-0 transition-transform duration-sv-fast group-hover:scale-110 ${
                        active ? "text-sv-brand" : "text-sv-text-muted group-hover:text-sv-text"
                      }`}
                    >
                      {link.icon}
                    </span>

                    <span
                      className={`truncate transition-opacity ${
                        isCollapsed ? "lg:hidden" : ""
                      }`}
                    >
                      {link.label}
                    </span>

                    {/* Active vertical pill indicator */}
                    {active && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sv-brand rounded-r-full"
                        aria-hidden="true"
                      />
                    )}
                  </LinkComponent>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer User Info & Sign Out */}
        <div className="mt-auto border-t border-sv-border-subtle p-3 space-y-2 bg-sv-surface-raised/40 flex-shrink-0">
          {admin && !isCollapsed && (
            <div className="px-2 py-1.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar
                  name={admin.name || admin.email}
                  role={admin.role}
                  size="sm"
                />
                <div className="truncate">
                  <p className="text-xs font-bold text-sv-text truncate">
                    {admin.name || admin.email}
                  </p>
                  <p className="text-[10px] text-sv-text-muted truncate">
                    {admin.email}
                  </p>
                </div>
              </div>

              <Badge
                variant={admin.role === "SUPERADMIN" ? "warning" : "info"}
                size="sm"
              >
                {admin.role === "SUPERADMIN" ? "SUPER" : "ADMIN"}
              </Badge>
            </div>
          )}

          {admin && isCollapsed && (
            <div className="hidden lg:flex justify-center py-1">
              <Avatar
                name={admin.name || admin.email}
                role={admin.role}
                showRoleBadge
                size="sm"
                title={`${admin.name || admin.email} (${admin.role})`}
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={isCollapsed ? "Sign Out" : undefined}
            className={`w-full flex items-center rounded-sv-sm text-xs font-semibold text-sv-text-muted hover:text-sv-error-text hover:bg-sv-error-subtle transition-colors cursor-pointer border border-transparent ${
              isCollapsed
                ? "lg:justify-center lg:p-2.5 p-2 gap-2"
                : "px-3 py-2 gap-2"
            }`}
          >
            <FiLogOut className="text-sm flex-shrink-0" />
            <span className={isCollapsed ? "lg:hidden" : ""}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Layout Container */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-sv-default ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Top Header Bar on Desktop */}
        <header className="sticky top-0 z-30 bg-sv-surface/90 backdrop-blur-md border-b border-sv-border px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shadow-sv-sm">
          {/* Breadcrumb Trail */}
          <nav aria-label="Route Breadcrumbs" className="flex items-center gap-1.5 text-xs text-sv-text-muted overflow-x-auto styled-scrollbar">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;

              return (
                <React.Fragment key={`top-crumb-${idx}`}>
                  {idx > 0 && (
                    <FiChevronRight className="text-sv-text-muted/60 text-[10px] flex-shrink-0" />
                  )}
                  {crumb.href && !isLast ? (
                    <LinkComponent
                      href={crumb.href}
                      className="hover:text-sv-brand transition-colors font-medium truncate max-w-[140px]"
                    >
                      {crumb.label}
                    </LinkComponent>
                  ) : (
                    <span
                      className={`truncate max-w-[180px] ${
                        isLast ? "text-sv-text font-bold" : ""
                      }`}
                    >
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Right Header Badges: NFC Status, Clock, Admin Profile */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Live IST Clock */}
            {currentTime && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-sv-text-muted font-mono bg-sv-surface-raised px-2.5 py-1 rounded-sv-sm border border-sv-border">
                <FiClock className="text-sv-text-muted text-[11px]" />
                <span>{currentTime}</span>
              </div>
            )}

            {/* NFC Status Indicator Pill */}
            <button
              type="button"
              onClick={() => {
                if (nfc.isWebNfcSupported && !nfc.isWebNfcActive) {
                  nfc.enableWebNfc();
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sv-sm text-xs font-semibold uppercase tracking-wider border transition-all ${
                nfc.isWebNfcActive
                  ? "bg-sv-success-subtle border-sv-success-border text-sv-success-text cursor-default"
                  : nfc.isWebNfcSupported
                  ? "bg-sv-warning-subtle border-sv-warning-border text-sv-warning-text hover:bg-sv-warning/20 cursor-pointer"
                  : nfc.isListening
                  ? "bg-sv-success-subtle border-sv-success-border text-sv-success-text cursor-default"
                  : "bg-sv-error-subtle border-sv-error-border text-sv-error-text cursor-default"
              }`}
              title={
                nfc.isWebNfcActive
                  ? "Mobile Web NFC is active"
                  : nfc.isWebNfcSupported
                  ? "Click to activate Mobile Web NFC"
                  : nfc.isListening
                  ? "USB keyboard wedge reader active"
                  : "NFC hardware unsupported"
              }
            >
              <FiRadio
                className={
                  nfc.isWebNfcActive || (nfc.isListening && !nfc.isWebNfcSupported)
                    ? "animate-pulse"
                    : ""
                }
              />
              <span className="hidden sm:inline">
                {nfc.isWebNfcActive
                  ? "Mobile NFC"
                  : nfc.isWebNfcSupported
                  ? "Tap to Enable NFC"
                  : nfc.isListening
                  ? "USB NFC"
                  : "No NFC"}
              </span>
            </button>

            {/* Admin Profile Pill */}
            {admin && (
              <div className="flex items-center gap-2 pl-2 border-l border-sv-border-subtle">
                <Avatar
                  name={admin.name || admin.email}
                  role={admin.role}
                  size="sm"
                />
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold text-sv-text leading-none truncate max-w-[120px]">
                    {admin.name || admin.email}
                  </p>
                  <span className="text-[10px] text-sv-brand font-semibold tracking-wider uppercase leading-none">
                    {admin.role}
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main
          className={`flex-1 w-full overflow-x-hidden ${
            pathname.startsWith("/whatsapp-admin") ||
            pathname.includes("/kiosk") ||
            pathname.startsWith("/admin/nfc")
              ? "p-0"
              : "p-4 sm:p-6 lg:p-8"
          }`}
        >
          {!canViewPage(admin, pathname) ? (
            <div className="max-w-md mx-auto my-16 bg-sv-surface border border-sv-border rounded-sv-lg p-8 text-center space-y-4 shadow-sv-lg">
              <div className="w-14 h-14 rounded-full bg-sv-error-subtle border border-sv-error-border flex items-center justify-center text-sv-error-text mx-auto text-2xl">
                <FiShield />
              </div>
              <h2 className="text-xl font-bold font-sans text-sv-text">
                Access Denied
              </h2>
              <p className="text-xs sm:text-sm text-sv-text-muted leading-relaxed">
                You do not have permission to view or manage this module. Your current role is{" "}
                <span className="font-semibold text-sv-brand">
                  {admin?.role || "ADMIN"}
                </span>.
              </p>
              <p className="text-xs text-sv-text-muted">
                Please contact a Superadmin if you require access to this page.
              </p>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
