"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { FiHome, FiUsers, FiMapPin, FiActivity, FiLayers, FiShield, FiFileText, FiMenu, FiX, FiUser, FiCalendar, FiServer, FiLogOut, FiSettings, FiCalendar as FiCalendar2, FiAward, FiCheckCircle, FiTag, FiCreditCard, FiSmartphone } from "react-icons/fi";
import { signOut } from "next-auth/react";
import LinkComponent from "next/link";
import Image from "next/image";

export function Navigation({ children }: { children: React.ReactNode }) {
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
        { href: "/reports/member", label: "Member Reports", icon: <FiUser /> },
        { href: "/reports/attendance", label: "Attendance Reports", icon: <FiCalendar /> },
        { href: "/reports/memberships", label: "Membership Reports", icon: <FiLayers /> },
      ]
    },
    {
      title: "System",
      links: [
        { href: "/audit", label: "Audit Logs", icon: <FiShield /> },
        { href: "/admin", label: "Manage Admins", icon: <FiShield /> },
        { href: "/settings", label: "Settings", icon: <FiSettings /> },
        { href: "/app-versions", label: "App Versions", icon: <FiSmartphone /> },
        { href: "/server", label: "Server Health", icon: <FiServer /> },
        { href: "/app-logs", label: "System Logs", icon: <FiFileText /> },
      ]
    }
  ];

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

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        w-64 bg-[#161923] border-r border-[#2a2d3e] py-6 flex flex-col gap-2 shrink-0 h-screen fixed top-0 left-0 z-50 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col mb-8 px-6">
          <div className="flex justify-between items-center">
            <div className="font-['Outfit'] text-xl font-black text-orange-500 tracking-wider uppercase hidden lg:block">
              <Image src="/long-logo.png" alt="SportsVilla" width={160} height={40} unoptimized className="h-10 w-auto object-contain" />
            </div>
            <div className="font-['Outfit'] text-xl font-black text-orange-500 tracking-wider uppercase lg:hidden">
              MENU
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 lg:hidden">
              <FiX size={24} />
            </button>
          </div>
          {currentTime && (
            <div className="text-xs font-medium text-gray-500 mt-1 hidden lg:block">
              {currentTime}
            </div>
          )}
        </div>
        
        <nav className="flex flex-col gap-5 flex-1 overflow-y-auto px-3 pb-4 styled-scrollbar">
          {linkGroups.map((group, index) => (
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
                    pathname === link.href
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
        <div className="mt-auto pt-6 pb-2 border-t border-[#2a2d3e]">
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer border-none bg-transparent"
          >
            <FiLogOut className="text-lg" />
            Sign Out
          </button>
        </div>
      </aside>
      
      <main className="flex-1 p-4 lg:p-10 w-full lg:max-w-[calc(100vw-16rem)] lg:ml-64 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
