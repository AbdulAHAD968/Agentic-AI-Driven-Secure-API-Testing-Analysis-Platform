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
      } catch (err) {
        /**
         * [Error Handling / API4:2023 - Unrestricted Resource Consumption]
         * Only redirect to /login for genuine auth failures (401 Unauthorized,
         * 403 Forbidden). Transient errors — rate limiting (429), server errors
         * (5xx), or network timeouts — must NOT redirect, otherwise a temporary
         * spike in API traffic causes an infinite login/dashboard bounce loop:
         * ProtectedRoute → 429 → /login → active Ory session → /dashboard →
         * ProtectedRoute → 429 → /login → ...
         */
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          router.replace("/login");
        } else {
          // Transient error — leave the user where they are; they are still
          // authenticated via Ory; the backend will recover momentarily.
          setIsAuthenticated(true);
        }
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
