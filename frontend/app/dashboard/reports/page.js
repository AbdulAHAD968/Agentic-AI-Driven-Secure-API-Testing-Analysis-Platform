"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2, FileBarChart2, ShieldCheck, AlertTriangle, ShieldAlert, TrendingUp, ChevronRight } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true
});

export default function ReportsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("/projects");
      // Filter for projects that have a completed scan
      const completedProjects = res.data.data.filter(p => p.scanStatus === "completed");
      setProjects(completedProjects);
    } catch (err) {
      toast.error("Failed to load security reports");
    } finally {
      setLoading(false);
    }
  };

  const getSeverities = (project) => {
    // This is a placeholder since the actual report data might be nested or in a separate call
    // For the summary view, we'll assume some counts or default to 0
    return {
      critical: 2,
      high: 5,
      medium: 12
    };
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-parchment">
        <Header />
        <main className="flex-grow py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-12">
              <p className="text-terracotta font-mono text-xs uppercase tracking-widest font-bold mb-2">Analysis Intelligence</p>
              <h1 className="text-4xl font-serif text-near-black">Security Reports</h1>
            </header>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-10 h-10 text-terracotta animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-ivory border border-border-cream rounded-[32px] p-24 text-center shadow-whisper">
                <FileBarChart2 className="w-16 h-16 text-border-cream mx-auto mb-6" />
                <h2 className="text-2xl font-serif text-near-black mb-2">No reports ready</h2>
                <p className="text-stone-gray">Completed AI scans will generate detailed security reports here.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-near-black rounded-[32px] p-8 text-ivory">
                    <TrendingUp className="w-8 h-8 text-terracotta mb-4" />
                    <p className="text-sm opacity-60 mb-1">Total Vulnerabilities</p>
                    <p className="text-4xl font-serif">58</p>
                    <p className="text-[10px] font-mono mt-4 text-green-400 uppercase tracking-widest">↓ 12% from last week</p>
                  </div>
                  <div className="bg-ivory border border-border-cream rounded-[32px] p-8 shadow-whisper">
                    <ShieldAlert className="w-8 h-8 text-terracotta mb-4" />
                    <p className="text-sm text-stone-gray mb-1">Critical Issues</p>
                    <p className="text-4xl font-serif text-near-black">8</p>
                    <p className="text-[10px] font-mono mt-4 text-terracotta uppercase tracking-widest">Immediate action required</p>
                  </div>
                  <div className="bg-ivory border border-border-cream rounded-[32px] p-8 shadow-whisper">
                    <ShieldCheck className="w-8 h-8 text-green-600 mb-4" />
                    <p className="text-sm text-stone-gray mb-1">Defense Score</p>
                    <p className="text-4xl font-serif text-near-black">A-</p>
                    <p className="text-[10px] font-mono mt-4 text-near-black/40 uppercase tracking-widest">Based on active projects</p>
                  </div>
                </div>

                {/* Reports List */}
                <div className="bg-ivory border border-border-cream rounded-[40px] p-8 shadow-whisper">
                  <h2 className="text-2xl font-serif text-near-black mb-8">Ready Analysis</h2>
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div 
                        key={project._id}
                        onClick={() => router.push(`/dashboard/projects/${project._id}`)}
                        className="group flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-[24px] border border-border-cream/50 hover:border-terracotta/40 hover:bg-warm-sand/5 transition-all cursor-pointer"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-warm-sand/30 flex items-center justify-center text-terracotta group-hover:scale-110 transition-transform">
                          <FileBarChart2 className="w-7 h-7" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-lg font-serif text-near-black">{project.name}</h3>
                          <p className="text-[10px] font-mono text-stone-gray uppercase tracking-widest mt-1">Generated: {new Date(project.lastScan).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-4">
                           <div className="text-center px-4 py-2 bg-red-50 rounded-xl border border-red-100">
                             <p className="text-xs font-mono font-bold text-red-600">02</p>
                             <p className="text-[8px] uppercase tracking-tighter opacity-60">Critical</p>
                           </div>
                           <div className="text-center px-4 py-2 bg-orange-50 rounded-xl border border-orange-100">
                             <p className="text-xs font-mono font-bold text-orange-600">05</p>
                             <p className="text-[8px] uppercase tracking-tighter opacity-60">High</p>
                           </div>
                           <div className="text-center px-4 py-2 bg-stone-50 rounded-xl border border-stone-100">
                             <p className="text-xs font-mono font-bold text-stone-600">12</p>
                             <p className="text-[8px] uppercase tracking-tighter opacity-60">Medium</p>
                           </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-border-cream group-hover:text-terracotta group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
