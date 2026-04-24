"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { createLoginFlow, submitLogin } from "@/services/authService";
import { toast } from "react-hot-toast";
import { LogIn, Key, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [flow, setFlow] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Initialize Ory Login Flow
    const initFlow = async () => {
      try {
        const flowData = await createLoginFlow();
        setFlow(flowData);
      } catch (err) {
        console.error("Error initializing login flow:", err);
        toast.error("Failed to initialize login. Please try again.");
      }
    };
    initFlow();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!flow) {
      toast.error("Login flow not initialized.");
      return;
    }

    setLoading(true);
    try {
      await submitLogin(flow.id, formData);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      // Handle Ory error messages
      const message = err.response?.data?.ui?.messages?.[0]?.text || "Invalid credentials.";
      toast.error(message);
      
      // If flow expired or needs refresh, re-initialize
      if (err.response?.status === 410 || err.response?.status === 403) {
        const flowData = await createLoginFlow();
        setFlow(flowData);
      }
    } finally {
      setLoading(false);
    }
  };

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
          disabled={loading || !flow}
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
