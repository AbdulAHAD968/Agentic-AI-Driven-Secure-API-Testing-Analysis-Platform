"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMe, logout } from "@/services/authService";
import { toast } from "react-hot-toast";
import { User, Settings, LogOut, ChevronDown, ShieldCheck, Bell, Menu, X } from "lucide-react";
import NotificationBell from "./NotificationBell";

const toCachedUser = (user) => ({
  name: user?.name || "",
  role: user?.role || "user",
  avatar: user?.avatar || "",
});

const safeAvatarUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
};

export default function Header() {
  const router = useRouter();
  // undefined = unknown (render skeleton), null = logged-out, object = logged-in.
  // SSR and first client render both see undefined so hydration matches.
  const [user, setUser] = useState(undefined);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Seed from localStorage synchronously so returning users see the
    // logged-in UI on the first paint, not the logged-out one.
    try {
      const cached = localStorage.getItem("user");
      if (cached) {
        // [Data Protection] Cache only non-sensitive display fields; auth remains in httpOnly cookies.
        setUser(toCachedUser(JSON.parse(cached)));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }

    checkAuth();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const checkAuth = async () => {
    try {
      const res = await getMe();
      if (res.success) {
        const displayUser = toCachedUser(res.data);
        setUser(displayUser);
        // [XSS Impact Reduction] Avoid storing full user/API response in localStorage.
        localStorage.setItem("user", JSON.stringify(displayUser));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    setUser(null);
    try {
      localStorage.removeItem("user");
    } catch {}
    toast.success("Logged out");
    // Hard reload so any server components / cached state pick up the cleared
    // cookies. router.push keeps the SPA tree warm and can leak auth UI.
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 bg-parchment/80 backdrop-blur-md border-b border-border-cream">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-serif font-bold tracking-tight text-near-black">
          Topic AI
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {user === undefined ? (
            <>
              <div className="h-4 w-16 bg-warm-sand/30 rounded animate-pulse" />
              <div className="h-4 w-16 bg-warm-sand/30 rounded animate-pulse" />
              <div className="h-4 w-16 bg-warm-sand/30 rounded animate-pulse" />
            </>
          ) : user ? (
            <>
              <Link href="/dashboard/projects" className="text-sm font-medium text-stone-gray hover:text-terracotta transition-colors">Projects</Link>
              <Link href="/dashboard/logs" className="text-sm font-medium text-stone-gray hover:text-terracotta transition-colors">Logs</Link>
              <Link href="/dashboard/reports" className="text-sm font-medium text-stone-gray hover:text-terracotta transition-colors">Reports</Link>
            </>
          ) : (
            <>
              <Link href="/overview" className="text-sm font-medium text-stone-gray hover:text-terracotta transition-colors">Overview</Link>
              <Link href="/pricing" className="text-sm font-medium text-stone-gray hover:text-terracotta transition-colors">Pricing</Link>
              <Link href="/models" className="text-sm font-medium text-stone-gray hover:text-terracotta transition-colors">Models</Link>
              <Link href="/docs" className="text-sm font-medium text-stone-gray hover:text-terracotta transition-colors">Docs</Link>
            </>
          )}
        </div>

        {/* Desktop Auth/User Area */}
        <div className="hidden md:flex items-center gap-10">
          {user === undefined ? (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-warm-sand/30 animate-pulse" />
              <div className="hidden lg:block space-y-1">
                <div className="h-3 w-24 bg-warm-sand/30 rounded animate-pulse" />
                <div className="h-2 w-16 bg-warm-sand/20 rounded animate-pulse" />
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 pl-4 border-l border-border-cream group"
                >
                  <div className="w-10 h-10 rounded-full bg-warm-sand/30 border border-border-cream overflow-hidden transition-transform group-hover:scale-105">
                    {safeAvatarUrl(user.avatar) ? (
                      <img src={safeAvatarUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-terracotta font-serif font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-semibold text-near-black leading-tight">{user.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-olive-gray font-bold">{user.role}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-stone-gray transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-ivory border border-border-cream rounded-2xl shadow-whisper py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-border-cream/50 lg:hidden">
                      <p className="text-sm font-semibold text-near-black">{user.name}</p>
                      <p className="text-xs text-olive-gray">{user.role}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-near-black hover:bg-warm-sand/20 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <ShieldCheck className="w-4 h-4 text-stone-gray" /> Dashboard
                    </Link>
                    <Link
                      href="/notifications"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-near-black hover:bg-warm-sand/20 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Bell className="w-4 h-4 text-stone-gray" /> Notifications
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-near-black hover:bg-warm-sand/20 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 text-stone-gray" /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-border-cream/50 mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-sm font-medium text-near-black hover:text-terracotta transition-colors">
                Sign in
              </Link>
              <Link href="/signup" className="btn-terracotta !py-2.5 !px-6 !text-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-near-black hover:text-terracotta transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-parchment border-b border-border-cream animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-8 space-y-6">
            <div className="flex flex-col gap-6">
              {user === undefined ? (
                <div className="space-y-4">
                  <div className="h-5 w-24 bg-warm-sand/30 rounded animate-pulse" />
                  <div className="h-5 w-24 bg-warm-sand/30 rounded animate-pulse" />
                  <div className="h-5 w-24 bg-warm-sand/30 rounded animate-pulse" />
                </div>
              ) : user ? (
                <>
                  <Link href="/dashboard/projects" className="text-lg font-serif text-near-black" onClick={() => setMobileMenuOpen(false)}>Projects</Link>
                  <Link href="/dashboard/logs" className="text-lg font-serif text-near-black" onClick={() => setMobileMenuOpen(false)}>Logs</Link>
                  <Link href="/dashboard/reports" className="text-lg font-serif text-near-black" onClick={() => setMobileMenuOpen(false)}>Reports</Link>
                  <Link href="/dashboard" className="text-lg font-serif text-terracotta font-bold" onClick={() => setMobileMenuOpen(false)}>My Dashboard</Link>
                </>
              ) : (
                <>
                  <Link href="/overview" className="text-lg font-serif text-near-black" onClick={() => setMobileMenuOpen(false)}>Overview</Link>
                  <Link href="/pricing" className="text-lg font-serif text-near-black" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                  <Link href="/models" className="text-lg font-serif text-near-black" onClick={() => setMobileMenuOpen(false)}>Models</Link>
                  <Link href="/docs" className="text-lg font-serif text-near-black" onClick={() => setMobileMenuOpen(false)}>Docs</Link>
                </>
              )}
            </div>
            
            <div className="pt-6 border-t border-border-cream">
              {user === undefined ? (
                <div className="h-12 w-full bg-warm-sand/20 rounded-xl animate-pulse" />
              ) : user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-red-500 font-bold"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link href="/login" className="w-full py-4 text-center border border-border-cream rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                    Sign in
                  </Link>
                  <Link href="/signup" className="btn-terracotta w-full py-4 text-center" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
