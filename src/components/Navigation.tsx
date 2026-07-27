"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { FiHome, FiUsers, FiMapPin, FiActivity, FiLayers, FiShield, FiFileText, FiMenu, FiX, FiUser, FiCalendar, FiServer, FiLogOut, FiSettings, FiCalendar as FiCalendar2, FiAward, FiCheckCircle, FiTag, FiCreditCard, FiSmartphone, FiMessageSquare, FiHeart, FiZap } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { signOut } from "next-auth/react";
import LinkComponent from "next/link";
import Image from "next/image";
import { canViewPage, AdminUser } from "@/lib/rbac";

export function Navigation({
  children,
  admin,
}: {
  children: React.ReactNode;
  admin?: AdminUser | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const lastSyncRef = useRef<number>(Date.now());

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Update IST Clock
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + " IST");
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + " IST");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Global Auto-Sync Polling
  useEffect(() => {
    // Only poll if not on the public member portal or the secondary display
    if (pathname.startsWith('/m/') || pathname === '/display') return;

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
      } catch (e) {
        // ignore fetch errors silently
      }
    }, 5000); // Check for new data every 5 seconds (reduced from 2s for performance)

    return () => clearInterval(interval);
  }, [pathname, router]);

  const linkGroups = [
    {
      title: "Core",
      links: [
        { href: "/", label: "Dashboard", icon: <FiHome /> },
      ]
    },
    {
      title: "Operations",
      links: [
        { href: "/calendar", label: "Booking Calendar", icon: <FiCalendar2 /> },
        { href: "/bookings", label: "Turf Bookings", icon: <FiCalendar2 /> },
        { href: "/checkin", label: "Entry Check-in", icon: <FiCheckCircle /> },
        { href: "/attendance", label: "Attendance Kiosk", icon: <FiShield /> },
        { href: "/tournaments", label: "Tournaments", icon: <FiAward /> },
      ]
    },
    {
      title: "Management",
      links: [
        { href: "/members", label: "Members Directory", icon: <FiUsers /> },
        { href: "/wallets", label: "Member Wallets", icon: <FiCreditCard /> },
        { href: "/plans", label: "Memberships", icon: <FiLayers /> },
        { href: "/coupons", label: "Coupons", icon: <FiTag /> },
        { href: "/banners", label: "Homepage Banners", icon: <FiTag /> },
        { href: "/loyalty", label: "Loyalty Leaderboard", icon: <FiAward /> },
        { href: "/sports", label: "Sports", icon: <FiActivity /> },
        { href: "/turfs", label: "Grounds & Turfs", icon: <FiMapPin /> },
      ]
    },
    {
      title: "Reports",
      links: [
        { href: "/reports/revenue", label: "Revenue Dashboard", icon: <FiFileText /> },
        { href: "/whatsapp/dashboard", label: "WhatsApp Analytics", icon: <FaWhatsapp className="text-[#25D366] text-base" /> },
        { href: "/reports/member", label: "Member Reports", icon: <FiUser /> },
        { href: "/reports/attendance", label: "Attendance Reports", icon: <FiCalendar /> },
        { href: "/reports/memberships", label: "Membership Reports", icon: <FiLayers /> },
      ]
    },
    {
      title: "WhatsApp",
      links: [
        { href: "/whatsapp-admin", label: "Live CRM Chat", icon: <FaWhatsapp className="text-[#25D366] text-base" /> },
        { href: "/whatsapp-admin/health", label: "Health & Config", icon: <FiHeart /> },
        { href: "/whatsapp-admin/templates", label: "Templates Tester", icon: <FiLayers /> },
        { href: "/whatsapp-admin/events", label: "Event Triggers", icon: <FiZap /> },
        { href: "/whatsapp/dashboard", label: "Analytics Dashboard", icon: <FiActivity /> },
      ]
    },
    {
      title: "System",
      links: [
        { href: "/audit", label: "Audit Logs", icon: <FiShield /> },
        { href: "/admin", label: "Role & Admin Users", icon: <FiShield /> },
        { href: "/settings", label: "Settings", icon: <FiSettings /> },
        { href: "/app-versions", label: "App Versions", icon: <FiSmartphone /> },
        { href: "/server", label: "Server Health", icon: <FiServer /> },
        { href: "/app-logs", label: "System Logs", icon: <FiFileText /> },
      ]
    }
  ];

  const filteredLinkGroups = linkGroups
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => canViewPage(admin, link.href)),
    }))
    .filter((group) => group.links.length > 0);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f1117] overflow-x-hidden">
      {/* Mobile Topbar */}
      <div className="lg:hidden bg-[#161923] border-b border-[#2a2d3e] p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex flex-col">
          <div className="font-['Outfit'] text-lg font-black text-orange-500 tracking-wider uppercase">
            <Image src="/long-logo.png" alt="SportsVilla" width={180} height={44} unoptimized className="h-10 w-auto object-contain" />
          </div>
          {currentTime && (
            <div className="text-[10px] font-medium text-gray-500 mt-0.5">
              {currentTime}
            </div>
          )}
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white p-2">
          {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#161923] border-r border-[#2a2d3e] flex flex-col z-50 transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6 pb-4 flex flex-col">
          <div className="font-['Outfit'] text-2xl font-black text-orange-500 tracking-wider uppercase">
            <Image src="/long-logo.png" alt="SportsVilla" width={200} height={48} unoptimized className="h-11 w-auto object-contain" />
          </div>
          {currentTime && (
            <div className="text-xs font-medium text-gray-500 mt-1 hidden lg:block">
              {currentTime}
            </div>
          )}
        </div>
        
        <nav className="flex flex-col gap-5 flex-1 overflow-y-auto px-3 pb-4 styled-scrollbar">
          {filteredLinkGroups.map((group, index) => (
            <div key={index} className="flex flex-col gap-1">
              {group.title !== "Core" && (
                <div className="px-3 mb-1 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                  {group.title}
                </div>
              )}
              {group.links.map(link => (
                <LinkComponent
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    (link.href === "/" ? pathname === "/" : pathname === link.href || (link.href !== "/whatsapp/dashboard" && pathname.startsWith(link.href + "/")))
                      ? 'bg-orange-500/10 text-orange-400 border-l-[3px] border-orange-500 rounded-l-none'
                      : 'text-gray-400 hover:bg-[#1c1f2e] hover:text-white'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </LinkComponent>
              ))}
            </div>
          ))}
        </nav>
        <div className="mt-auto pt-4 pb-2 border-t border-[#2a2d3e] px-3 space-y-2">
          {admin && (
            <div className="px-3 py-2 bg-[#0f1117] rounded-lg border border-[#2a2d3e] flex items-center justify-between">
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{admin.name || admin.email}</p>
                <p className="text-[10px] text-gray-500 truncate">{admin.email}</p>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                  admin.role === "SUPERADMIN"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                }`}
              >
                {admin.role || "ADMIN"}
              </span>
            </div>
          )}
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer border-none bg-transparent"
          >
            <FiLogOut className="text-lg" />
            Sign Out
          </button>
        </div>
      </aside>
      
      <main
        className={`flex-1 w-full lg:max-w-[calc(100vw-16rem)] lg:ml-64 overflow-x-hidden ${
          pathname.startsWith("/whatsapp-admin") ? "p-0" : "p-4 lg:p-10"
        }`}
      >
        {!canViewPage(admin, pathname) ? (
          <div className="max-w-xl mx-auto my-16 bg-[#161923] border border-[#2a2d3e] rounded-2xl p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto text-2xl">
              <FiShield />
            </div>
            <h2 className="text-xl font-bold font-['Outfit'] text-white">Access Denied</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              You do not have permission to view or manage this module. Your current role is{" "}
              <span className="font-semibold text-orange-400">{admin?.role || "ADMIN"}</span>.
            </p>
            <p className="text-xs text-gray-500">
              Please contact a Superadmin if you require access to this page.
            </p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
