"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { adminLogin, adminVerify2FA } from "@/services/adminService";
import { toast } from "react-hot-toast";
import { LogIn, Key, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await adminLogin(formData);

      
      if (res.data?.user && res.data.user.role !== "admin") {
        toast.error("Unauthorized: Admin access required.");
        return;
      }

      if (res.twoFactorRequired) {
        setShow2FA(true);
        setUserId(res.userId);
      } else {
        toast.success("Identity verified. Welcome, Administrator.");
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminVerify2FA(userId, token);
      toast.success("Security check passed.");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid 2FA code.");
    } finally {
      setLoading(false);
    }
  };

  if (show2FA) {
    return (
      <AuthLayout
        title="Elevated Security"
        subtitle="Please enter the 6-digit administrative token."
      >
        <form onSubmit={handle2FAVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-charcoal-warm font-sans flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Token
            </label>
            <input
              type="text"
              required
              className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 text-center text-3xl tracking-[0.4em] font-mono outline-none focus:ring-2 focus:ring-terracotta/20"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-terracotta w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Confirm Identity"} <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Admin Portal"
      subtitle="Authorized access to Topic AI infrastructure."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-charcoal-warm font-sans flex items-center gap-2">
            <LogIn className="w-4 h-4" /> Administrator Email
          </label>
          <input
            type="email"
            required
            className="input-warm"
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
            className="input-warm"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-terracotta w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Login"} <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </AuthLayout>
  );
}
