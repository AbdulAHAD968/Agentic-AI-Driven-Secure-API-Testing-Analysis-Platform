"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Mail, MessageSquare, 
  Settings, ShieldAlert, LogOut, ChevronLeft, ChevronRight,
  Bell, FolderGit2, ClipboardList
} from "lucide-react";
import { logout } from "@/services/adminService";
import { toast } from "react-hot-toast";

export default function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Users", icon: Users, href: "/users" },
    { label: "Projects", icon: FolderGit2, href: "/projects" },
    { label: "Vulnerabilities", icon: ShieldAlert, href: "/vulnerabilities" },
    { label: "Audit Logs", icon: ClipboardList, href: "/audit" },
    { label: "Newsletter", icon: Mail, href: "/newsletter" },
    { label: "Notifications", icon: Bell, href: "/notifications" },
    { label: "Inquiries", icon: MessageSquare, href: "/inquiries" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Admin logged out");
      router.push("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <aside 
      className={`bg-ivory border-r border-border-cream h-screen sticky top-0 flex flex-col transition-all duration-300 z-50 ${
        isCollapsed ? "w-20 p-4" : "w-72 p-8"
      }`}
    >
      
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 w-6 h-6 bg-white border border-border-cream rounded-full flex items-center justify-center text-stone-gray hover:text-terracotta shadow-sm z-50 transition-colors"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      <div className={`mb-12 flex ${isCollapsed ? "justify-center" : "items-center"}`}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-terracotta rounded-lg flex items-center justify-center text-white font-bold shrink-0">T</div>
          {!isCollapsed && <span className="text-xl font-serif font-bold text-near-black">Topic Admin</span>}
        </Link>
      </div>

      <nav className="flex-grow space-y-2">
        {menuItems.map((item) => {
          const Active = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : ""}
              className={`flex items-center gap-3 rounded-xl transition-all duration-200 group ${
                isCollapsed ? "justify-center p-3" : "px-4 py-3"
              } ${
                Active 
                  ? "bg-warm-sand/40 text-terracotta font-medium shadow-sm" 
                  : "text-olive-gray hover:bg-warm-sand/20 hover:text-near-black"
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${Active ? "text-terracotta" : "text-stone-gray group-hover:text-near-black"}`} />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`pt-8 border-t border-border-cream space-y-4 flex flex-col ${isCollapsed ? "items-center" : ""}`}>
        <button 
          onClick={handleLogout}
          title={isCollapsed ? "Sign Out" : ""}
          className={`w-full flex items-center gap-3 rounded-xl transition-all text-olive-gray hover:text-red-500 hover:bg-red-50 ${
            isCollapsed ? "justify-center p-3" : "px-4 py-3"
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
