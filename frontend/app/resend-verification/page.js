"use client";

import { useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { resendVerification } from "@/services/authService";
import { toast } from "react-hot-toast";
import { LogIn, ArrowRight } from "lucide-react";

export default function ResendVerificationPage() {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resendVerification(email);
      toast.success("Verification email resent!");
      setIsSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout 
        title="Email Sent" 
        subtitle={`We've resent the verification link to ${email}.`}
      >
        <div className="text-center py-8">
          <p className="text-olive-gray mb-8">
            Please check your inbox (and spam folder) to verify your account.
          </p>
          <Link href="/login" className="btn-warm-sand block w-full py-4 text-center">
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Resend Verification" 
      subtitle="Enter your email address and we'll send you another verification link."
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-terracotta w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Resend Link"} <ArrowRight className="w-5 h-5" />
        </button>

        <div className="text-center">
          <Link href="/login" className="text-sm text-stone-gray hover:text-near-black transition-colors italic font-sans">
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
