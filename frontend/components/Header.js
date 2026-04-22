"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMe, logout } from "@/services/authService";
import { toast } from "react-hot-toast";
import { User, Settings, LogOut, ChevronDown, ShieldCheck, Bell } from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
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
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out");
      setUser(null);
      localStorage.removeItem("user");
      router.push("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-parchment/80 backdrop-blur-md border-b border-border-cream">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-serif font-bold tracking-tight text-near-black">
          Topic AI
        </Link>


        <div className="hidden md:flex items-center gap-8">
          {user ? (
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

        <div className="hidden md:flex items-center gap-10">
          {user ? (
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 pl-4 border-l border-border-cream group"
                >
                  <div className="w-10 h-10 rounded-full bg-warm-sand/30 border border-border-cream overflow-hidden transition-transform group-hover:scale-105">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
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
      </nav>
    </header>
  );
}
