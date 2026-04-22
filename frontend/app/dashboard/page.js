"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/services/authService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, LayoutDashboard, BrainCircuit, Users, Zap, ArrowUpRight, Plus, Shield, ShieldAlert, Trash2, Play } from "lucide-react";
import axios from "axios";

// API helper
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true
});

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "", file: null });
  const [scanningId, setScanningId] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchProjects();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await getMe();
      setUser(res.data);
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", newProject.name);
    formData.append("description", newProject.description);
    formData.append("code", newProject.file);

    try {
      await api.post("/projects", formData);
      setIsModalOpen(false);
      setNewProject({ name: "", description: "", file: null });
      fetchProjects();
    } catch (err) {
      alert("Failed to upload project");
    }
  };

  const triggerScan = async (id) => {
    setScanningId(id);
    try {
      await api.post(`/projects/${id}/scan`);
      fetchProjects();
    } catch (err) {
      alert("Scan failed");
    } finally {
      setScanningId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-terracotta animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: "Total Projects", value: projects.length.toString(), icon: Zap, trend: "Stable" },
    { label: "Scans Completed", value: projects.filter(p => p.scanStatus === "completed").length.toString(), icon: BrainCircuit, trend: "Live" },
    { label: "Critical Findings", value: "8", icon: ShieldAlert, trend: "+2" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-parchment">
      <Header />
      <main className="flex-grow py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-terracotta font-mono text-xs uppercase tracking-widest font-bold mb-2">Workspace Overview</p>
              <h1 className="text-4xl font-serif text-near-black">Welcome back, {user?.name.split(' ')[0]}</h1>
            </div>
            <div className="flex gap-4">
              <button className="btn-warm-sand px-6 py-2.5 text-sm">Audit Logs</button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-terracotta px-6 py-2.5 text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> New Project
              </button>
            </div>
          </header>

          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-ivory border border-border-cream rounded-3xl p-8 max-w-lg w-full shadow-2xl">
                <h3 className="text-2xl font-serif mb-6">Secure Code Upload</h3>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono mb-2 uppercase opacity-60">Project Name</label>
                    <input 
                      type="text" 
                      required
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 outline-none focus:border-terracotta/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono mb-2 uppercase opacity-60">Description</label>
                    <textarea 
                      required
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 outline-none focus:border-terracotta/50 h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono mb-2 uppercase opacity-60">Source Code (ZIP/JS/PY)</label>
                    <input 
                      type="file" 
                      required
                      onChange={(e) => setNewProject({...newProject, file: e.target.files[0]})}
                      className="w-full text-sm text-stone-gray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-mono file:bg-terracotta file:text-ivory hover:file:opacity-90"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-grow btn-warm-sand py-3"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-grow btn-terracotta py-3"
                    >
                      Start Upload
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {stats.map((stat, i) => (
              <div key={i} className="bg-ivory border border-border-cream rounded-3xl p-8 shadow-whisper group hover:border-terracotta/30 transition-all cursor-default">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-warm-sand/50 rounded-2xl flex items-center justify-center text-terracotta group-hover:scale-110 transition-transform">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{stat.trend}</span>
                </div>
                <p className="text-stone-gray text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-serif text-near-black">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 bg-ivory border border-border-cream rounded-[32px] p-8 shadow-whisper">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif text-near-black">Security Projects</h2>
                <div className="flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-2" />
                   <span className="text-xs font-mono opacity-60">Live Vault System</span>
                </div>
              </div>
              <div className="space-y-6">
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-border-cream mx-auto mb-4" />
                    <p className="text-stone-gray italic">No projects found. Upload source code to begin analysis.</p>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div key={project._id} className="flex items-center gap-6 p-6 rounded-2xl hover:bg-warm-sand/10 transition-colors border border-border-cream/50 relative group">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        project.scanStatus === 'completed' ? 'bg-green-50 text-green-600' : 'bg-warm-sand/50 text-terracotta'
                      }`}>
                        {scanningId === project._id ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <Shield className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-3">
                          <p className="text-near-black font-semibold">{project.name}</p>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                            project.scanStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'
                          }`}>
                            {project.scanStatus}
                          </span>
                        </div>
                        <p className="text-xs text-stone-gray line-clamp-1 mt-1">{project.description}</p>
                        <p className="text-[10px] text-stone-gray/60 font-mono mt-2">
                          Last Scan: {project.lastScan ? new Date(project.lastScan).toLocaleString() : 'Never'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {project.scanStatus === 'completed' ? (
                          <button 
                            onClick={() => router.push(`/dashboard/projects/${project._id}`)}
                            className="bg-ivory border border-border-cream text-near-black p-2 rounded-lg hover:border-terracotta transition-colors"
                            title="View Report"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                          </button>
                        ) : null}
                        <button 
                          onClick={() => triggerScan(project._id)}
                          disabled={scanningId === project._id}
                          className="bg-terracotta/10 text-terracotta p-2 rounded-lg hover:bg-terracotta hover:text-ivory transition-colors disabled:opacity-50"
                          title="Run AI Scan"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            
            <div className="bg-near-black rounded-[32px] p-8 text-ivory shadow-whisper flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10">
                <h2 className="text-2xl font-serif mb-6">Service Health</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-2 opacity-60">
                      <span>API Latency</span>
                      <span>42ms</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-terracotta w-[85%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-2 opacity-60">
                      <span>Inference Load</span>
                      <span>18%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 w-[18%]" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs opacity-40 font-serif italic mt-12 relative z-10">All systems operational.</p>
              
              
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-terracotta/5 rounded-full blur-3xl pointer-events-none group-hover:bg-terracotta/10 transition-all duration-700" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
