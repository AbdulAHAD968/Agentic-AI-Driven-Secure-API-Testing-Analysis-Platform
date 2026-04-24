"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { createLoginFlow, submitLogin } from "@/services/adminService";
import { toast } from "react-hot-toast";
import { Mail, Key, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
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
        toast.error("Failed to initialize security flow.");
      } finally {
        setInitializing(false);
      }
    };
    initFlow();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!flow) return;
    
    setLoading(true);
    try {
      const csrfToken = flow.ui.nodes.find(node => node.attributes.name === "csrf_token")?.attributes.value;
      
      if (!csrfToken) {
        toast.error("Security token missing. Please refresh the page.");
        setLoading(false);
        return;
      }

      await submitLogin(flow.id, formData, csrfToken);

      toast.success("Identity verified. Welcome, Administrator.");
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      
      const uiMessages = err.response?.data?.ui?.messages;
      const nodeMessages = err.response?.data?.ui?.nodes
        ?.flatMap(node => node.messages || [])
        ?.map(m => m.text);
      
      const message = uiMessages?.[0]?.text || nodeMessages?.[0] || "Invalid credentials.";
      toast.error(message);

      // Re-initialize flow if expired
      if (err.response?.status === 410 || err.response?.status === 403) {
        setInitializing(true);
        const flowData = await createLoginFlow();
        setFlow(flowData);
        setInitializing(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <AuthLayout title="Initializing" subtitle="Preparing secure administrative environment...">
        <div className="flex justify-center py-12">
          <Loader2 className="w-10 h-10 text-terracotta animate-spin" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Secure Login"
      subtitle="Authorized personnel only. All access is logged and monitored."
    >

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-widest font-bold text-stone-gray ml-1 flex items-center gap-2">
            <Mail className="w-3 h-3" /> Admin Email
          </label>
          <div className="relative group">
            <input
              type="email"
              required
              className="w-full bg-warm-sand/20 border border-border-cream rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-near-black/5 focus:border-near-black transition-all font-sans text-near-black placeholder:text-stone-gray/30"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@topicai.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-widest font-bold text-stone-gray ml-1 flex items-center gap-2">
            <Key className="w-3 h-3" /> Security Password
          </label>
          <div className="relative group">
            <input
              type="password"
              required
              className="w-full bg-warm-sand/20 border border-border-cream rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-near-black/5 focus:border-near-black transition-all font-sans text-near-black placeholder:text-stone-gray/30"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !flow}
          className="w-full bg-near-black text-ivory py-4 rounded-2xl text-lg font-serif flex items-center justify-center gap-3 hover:bg-terracotta transition-all duration-500 shadow-lg hover:shadow-terracotta/20 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Verify Identity <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
        
        <div className="pt-6 flex items-center justify-center gap-2 text-[10px] text-stone-gray/60 font-bold uppercase tracking-widest">
          <ShieldCheck className="w-3 h-3 text-green-600" /> End-to-end encrypted session
        </div>
      </form>
    </AuthLayout>
  );
}
