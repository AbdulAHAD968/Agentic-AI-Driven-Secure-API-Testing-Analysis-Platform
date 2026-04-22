"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { 
  Loader2, 
  FileBarChart2, 
  TrendingUp, 
  ShieldAlert, 
  ShieldCheck, 
  ChevronRight,
  PieChart as PieIcon,
  BarChart3,
  AlertTriangle
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend
} from "recharts";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true
});

const SEVERITY_COLORS = {
  critical: "#dc2626", 
  high: "#ea580c",    
  medium: "#d97706",  
  low: "#2563eb",     
  info: "#4b5563"     
};

export default function ReportsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalVulnerabilities: 0,
    criticalIssues: 0,
    grade: "N/A",
    score: 0,
    totalProjects: 0,
    severityCounts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("/projects");
      const completedProjects = res.data.data.filter(p => p.scanStatus === "completed");
      setProjects(completedProjects);
    } catch (err) {
      toast.error("Failed to load security reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/projects/stats/overview");
      setStats(res.data.data);
    } catch (err) {
      console.error("Stats fetch failed", err);
    }
  };

  const pieData = Object.entries(stats.severityCounts)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name: name.toUpperCase(), value }));

  const barData = projects.slice(0, 10).map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 17) + "..." : p.name,
    critical: p.findingsSummary?.critical || 0,
    high: p.findingsSummary?.high || 0,
    medium: p.findingsSummary?.medium || 0
  }));

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
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-near-black rounded-[32px] p-8 text-ivory flex flex-col justify-center">
                    <TrendingUp className="w-6 h-6 text-terracotta mb-4" />
                    <p className="text-xs opacity-60 mb-1">Total Vulnerabilities</p>
                    <p className="text-3xl font-serif">{stats.totalVulnerabilities}</p>
                    <p className="text-[9px] font-mono mt-4 text-green-400 uppercase tracking-widest">Global Aggregate</p>
                  </div>
                  <div className="bg-ivory border border-border-cream rounded-[32px] p-8 shadow-whisper flex flex-col justify-center">
                    <ShieldAlert className="w-6 h-6 text-terracotta mb-4" />
                    <p className="text-xs text-stone-gray mb-1">Critical & High</p>
                    <p className="text-3xl font-serif text-near-black">{stats.criticalIssues}</p>
                    <p className="text-[9px] font-mono mt-4 text-terracotta uppercase tracking-widest">Action Items</p>
                  </div>
                  <div className="bg-ivory border border-border-cream rounded-[32px] p-8 shadow-whisper flex flex-col justify-center">
                    <ShieldCheck className="w-6 h-6 text-green-600 mb-4" />
                    <p className="text-xs text-stone-gray mb-1">Defense Grade</p>
                    <p className="text-3xl font-serif text-near-black">{stats.grade}</p>
                    <p className="text-[9px] font-mono mt-4 text-near-black/40 uppercase tracking-widest">Score: {stats.score}</p>
                  </div>
                  
                  
                  <div className="bg-ivory border border-border-cream rounded-[32px] p-6 shadow-whisper relative min-h-[180px]">
                    <p className="absolute top-6 left-6 text-[10px] font-mono text-stone-gray uppercase tracking-widest">Severity Distribution</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="60%"
                          innerRadius={35}
                          outerRadius={50}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name.toLowerCase()]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                
                <div className="bg-ivory border border-border-cream rounded-[32px] p-8 shadow-whisper flex flex-col">
                  <h3 className="text-lg font-serif text-near-black mb-10 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-terracotta" /> Project Risk Comparison
                  </h3>
                  <div className="flex-grow h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={barData} 
                        layout="vertical"
                        margin={{ left: 20, right: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                        <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          fontSize={11} 
                          width={120}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(234, 88, 12, 0.05)' }}
                          contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        />
                        <Legend iconType="circle" verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                        <Bar dataKey="critical" stackId="a" fill={SEVERITY_COLORS.critical} radius={[0, 0, 0, 0]} barSize={20} />
                        <Bar dataKey="high" stackId="a" fill={SEVERITY_COLORS.high} radius={[0, 0, 0, 0]} barSize={20} />
                        <Bar dataKey="medium" stackId="a" fill={SEVERITY_COLORS.medium} radius={[0, 6, 6, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-center text-stone-gray font-mono mt-6 uppercase tracking-widest">
                    Showing comparative risk for top {barData.length} active projects
                  </p>
                </div>

                
                <div className="bg-ivory border border-border-cream rounded-[40px] p-8 shadow-whisper">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-serif text-near-black">Ready Analysis</h2>
                  </div>
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
                           <div className="text-center px-4 py-2 bg-red-50 rounded-xl border border-red-100 min-w-[66px]">
                             <p className="text-xs font-mono font-bold text-red-600">{project.findingsSummary?.critical || 0}</p>
                             <p className="text-[8px] uppercase tracking-tighter opacity-60">Critical</p>
                           </div>
                           <div className="text-center px-4 py-2 bg-orange-50 rounded-xl border border-orange-100 min-w-[66px]">
                             <p className="text-xs font-mono font-bold text-orange-600">{project.findingsSummary?.high || 0}</p>
                             <p className="text-[8px] uppercase tracking-tighter opacity-60">High</p>
                           </div>
                           <div className="text-center px-4 py-2 bg-stone-50 rounded-xl border border-stone-100 min-w-[66px]">
                             <p className="text-xs font-mono font-bold text-stone-600">{project.findingsSummary?.medium || 0}</p>
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
