"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { resetPassword } from "@/services/authService";
import { toast } from "react-hot-toast";
import { Key, ArrowRight, ShieldCheck } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      toast.success("Password reset successfully!");
      router.push("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid Link" subtitle="This password reset link is invalid.">
        <div className="text-center py-8">
          <p className="text-olive-gray mb-8">Please request a new reset link from the login page.</p>
          <button onClick={() => router.push("/login")} className="btn-warm-sand w-full py-4">
            Back to Login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Create new password" 
      subtitle="Your new password must be at least 8 characters long."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-charcoal-warm font-sans flex items-center gap-2">
            <Key className="w-4 h-4" /> New Password
          </label>
          <input 
            type="password" 
            required
            className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all font-sans"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-charcoal-warm font-sans flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Confirm Password
          </label>
          <input 
            type="password" 
            required
            className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all font-sans"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            minLength={8}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-terracotta w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"} <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
