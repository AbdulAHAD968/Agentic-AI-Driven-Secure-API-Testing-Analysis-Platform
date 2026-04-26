"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/services/authService";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await getMe();
        if (res.success) {
          /**
           * [Authorization / RBAC] Admin users belong in the dedicated admin panel.
           * Redirecting to the admin URL (not back to /login) prevents an infinite
           * bounce loop: /login sees an active Ory session and immediately pushes
           * to /dashboard, which would send admins back to /login indefinitely.
           */
          if (res.data && res.data.role === "admin") {
            window.location.href = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
          } else {
            setIsAuthenticated(true);
          }
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-terracotta animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : null;
}
