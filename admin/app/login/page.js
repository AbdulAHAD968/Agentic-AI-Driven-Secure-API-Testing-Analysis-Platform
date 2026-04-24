"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { createLoginFlow, submitLogin, getSession, logout } from "@/services/adminService";
import { toast } from "react-hot-toast";
import { LogIn, Key, ArrowRight, ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get("error") === "unauthorized";
  const [loading, setLoading] = useState(false);
  const [flow, setFlow] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const initFlow = async () => {
      // If we landed here because the admin guard rejected us, DO NOT auto-
      // redirect back to /dashboard just because a session exists — that's the
      // exact bounce loop that hammered Ory into rate-limiting us. Stay on this
      // page and show the "log out / try another account" UI.
      if (!unauthorized) {
        const existing = await getSession();
        if (existing?.active) {
          router.replace("/dashboard");
          return;
        }
      }

      try {
        const flowData = await createLoginFlow();
        setFlow(flowData);
      } catch (err) {
        console.error("Error initializing login flow:", err);
        console.error("Ory response body:", JSON.stringify(err.response?.data, null, 2));

        const reason = err.response?.data?.error?.reason || err.response?.data?.error?.message;
        if (!unauthorized && reason && /session/i.test(reason)) {
          router.replace("/dashboard");
          return;
        }

        // Don't spam toast on the unauthorized view — the inline banner tells
        // the user exactly what's going on. createLoginFlow 400s here because
        // an active non-admin session already exists; that's expected.
        if (!unauthorized) {
          toast.error(reason || "Failed to initialize security flow.");
        }
      }
    };
    initFlow();
  }, [router, unauthorized]);

  const handleLogoutAndRetry = async () => {
    setLoggingOut(true);
    await logout();
    try { localStorage.removeItem("user"); } catch {}
    window.location.href = "/login";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!flow) return;

    setLoading(true);
    try {
      const csrfToken = flow.ui.nodes.find(node => node.attributes.name === "csrf_token")?.attributes.value;
      console.log("Submitting Admin Login with CSRF:", csrfToken);
      
      if (!csrfToken) {
        toast.error("Security token missing. Please refresh the page.");
        setLoading(false);
        return;
      }

      await submitLogin(flow.id, formData, csrfToken);

      // Simple admin check (can be enhanced with Ory traits later)
      // For now, if the session is created, we allow access
      toast.success("Identity verified. Welcome, Administrator.");
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      console.error("Ory response body:", JSON.stringify(err.response?.data, null, 2));

      const uiMessages = err.response?.data?.ui?.messages || [];
      const nodeMessages = (err.response?.data?.ui?.nodes || [])
        .flatMap(node => (node.messages || []).map(m => ({
          text: m.text,
          field: node.attributes?.name,
        })));

      const allMessages = [
        ...uiMessages.map(m => m.text),
        ...nodeMessages.map(m => m.field ? `${m.field}: ${m.text}` : m.text),
      ];
      const message = allMessages[0] || err.response?.data?.error?.reason || err.response?.data?.error?.message || "Invalid credentials.";
      toast.error(message);

      // Ory invalidates the flow after certain failures (410/403). Re-init so
      // the user can retry without a stale csrf token. 400 usually means bad
      // credentials — keep the existing flow so they can fix and retry.
      if (err.response?.status === 410 || err.response?.status === 403) {
        try {
          const flowData = await createLoginFlow();
          setFlow(flowData);
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Admin Portal"
      subtitle="Authorized access to Topic AI infrastructure."
    >
      {unauthorized && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <p className="font-semibold mb-1">This account doesn't have admin access.</p>
            <p className="text-red-700/90">
              You're signed in, but your role isn't <code className="font-mono text-xs">admin</code>. Log out and sign in with an admin account, or ask a backend maintainer to promote this email.
            </p>
            <button
              type="button"
              onClick={handleLogoutAndRetry}
              disabled={loggingOut}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-500 text-white text-xs font-semibold px-3 py-2 hover:bg-red-600 disabled:opacity-50"
            >
              {loggingOut ? "Logging out…" : "Log out and try another account"}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-charcoal-warm font-sans flex items-center gap-2">
            <LogIn className="w-4 h-4" /> Administrator Email
          </label>
          <input
            type="email"
            required
            className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-terracotta/20 font-sans"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="admin@topicai.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-charcoal-warm font-sans flex items-center gap-2">
            <Key className="w-4 h-4" /> Secure Password
          </label>
          <input
            type="password"
            required
            className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-terracotta/20 font-sans"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !flow}
          className="btn-terracotta w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Login"} <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </AuthLayout>
  );
}
