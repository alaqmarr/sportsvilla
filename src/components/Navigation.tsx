"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { FiHome, FiUsers, FiMapPin, FiActivity, FiLayers, FiShield, FiFileText, FiMenu, FiX, FiUser, FiCalendar, FiServer } from "react-icons/fi";
import LinkComponent from "next/link"; // Alias to avoid conflict

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
    // Only poll if not on the public member portal
    if (pathname.startsWith('/m/')) return;

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
    }, 2000); // Check for new data every 2 seconds

    return () => clearInterval(interval);
  }, [pathname, router]);

  // If we are on the public member portal, don't show the admin sidebar
  if (pathname.startsWith('/m/')) {
    return <>{children}</>;
  }

  const links = [
    { href: "/", label: "Dashboard", icon: <FiHome /> },
    { href: "/sports", label: "Sports", icon: <FiActivity /> },
    { href: "/turfs", label: "Grounds & Turfs", icon: <FiMapPin /> },
    { href: "/plans", label: "Memberships", icon: <FiLayers /> },
    { href: "/members", label: "Members Directory", icon: <FiUsers /> },
    { href: "/attendance", label: "Attendance Kiosk", icon: <FiShield /> },
    { href: "/reports/member", label: "Member Reports", icon: <FiUser /> },
    { href: "/reports/attendance", label: "Attendance Reports", icon: <FiCalendar /> },
    { href: "/reports/memberships", label: "Membership Reports", icon: <FiLayers /> },
    { href: "/server", label: "Server Health", icon: <FiServer /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f1117] overflow-x-hidden">
      {/* Mobile Topbar */}
      <div className="lg:hidden bg-[#161923] border-b border-[#2a2d3e] p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex flex-col">
          <div className="font-['Outfit'] text-lg font-black text-orange-500 tracking-wider uppercase">
            SPORTSVILLA
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
        w-64 bg-[#161923] border-r border-[#2a2d3e] p-6 flex flex-col gap-2 shrink-0 h-screen fixed lg:sticky top-0 z-50 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col mb-8 px-3">
          <div className="flex justify-between items-center">
            <div className="font-['Outfit'] text-xl font-black text-orange-500 tracking-wider uppercase hidden lg:block">
              SPORTSVILLA
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
        
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {links.map(link => (
            <LinkComponent
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-orange-500/10 text-orange-400 border-l-[3px] border-orange-500 rounded-l-none'
                  : 'text-gray-400 hover:bg-[#1c1f2e] hover:text-white'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </LinkComponent>
          ))}
        </nav>
      </aside>
      
      <main className="flex-1 p-4 lg:p-10 w-full lg:max-w-[calc(100vw-16rem)] overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
