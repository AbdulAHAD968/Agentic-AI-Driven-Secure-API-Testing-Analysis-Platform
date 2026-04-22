"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { login, verifyLogin2FA } from "@/services/authService";
import { toast } from "react-hot-toast";
import { LogIn, Key, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await login(formData);
      if (res.twoFactorRequired) {
        setShow2FA(true);
        setUserId(res.userId);
        toast.success("Please provide your 2FA code.");
      } else {
        toast.success("Welcome back!");
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
      await verifyLogin2FA(userId, token);
      toast.success("Welcome back!");
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
        title="Double-check it's you" 
        subtitle="Enter the 6-digit code from your authenticator app."
      >
        <form onSubmit={handle2FAVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-charcoal-warm font-sans flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Authentication Code
            </label>
            <input 
              type="text" 
              required
              className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all font-sans text-center text-2xl tracking-[0.5em] font-semibold"
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
            {loading ? "Verifying..." : "Verify Code"} <ArrowRight className="w-5 h-5" />
          </button>
          
          <button 
            type="button"
            className="w-full text-center text-sm text-stone-gray hover:text-near-black transition-colors"
            onClick={() => setShow2FA(false)}
          >
            Back to login
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Enter your details to access your account."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-charcoal-warm font-sans flex items-center gap-2">
            <LogIn className="w-4 h-4" /> Email address
          </label>
          <input 
            type="email" 
            required
            className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all font-sans"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-charcoal-warm font-sans flex items-center gap-2">
              <Key className="w-4 h-4" /> Password
            </label>
            <Link href="/forgot-password" size="sm" className="text-sm text-stone-gray hover:text-near-black transition-colors italic">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required
              className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all font-sans"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
            <button 
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-gray hover:text-near-black transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-terracotta w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Continue"} <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-sm text-stone-gray font-sans">
          Don't have an account?{" "}
          <Link href="/signup" className="text-near-black font-semibold hover:text-terracotta transition-colors underline underline-offset-4">
            Sign up for free
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
