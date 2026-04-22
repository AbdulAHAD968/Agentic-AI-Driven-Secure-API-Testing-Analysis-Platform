"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/services/authService";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2, Shield, Plus, Play, LayoutDashboard, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true
});

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "", file: null });
  const [scanningId, setScanningId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
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
      toast.success("Project uploaded successfully");
      fetchProjects();
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const triggerScan = async (id) => {
    setScanningId(id);
    try {
      await api.post(`/projects/${id}/scan`);
      toast.success("Scan started");
      fetchProjects();
    } catch (err) {
      toast.error("Scan failed");
    } finally {
      setScanningId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-parchment">
        <Header />
        <main className="flex-grow py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-terracotta font-mono text-xs uppercase tracking-widest font-bold mb-2">Workspace</p>
                <h1 className="text-4xl font-serif text-near-black">Security Projects</h1>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-terracotta px-6 py-2.5 text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> New Project
              </button>
            </header>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-10 h-10 text-terracotta animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-ivory border border-border-cream rounded-[32px] p-24 text-center shadow-whisper">
                <Shield className="w-16 h-16 text-border-cream mx-auto mb-6" />
                <h2 className="text-2xl font-serif text-near-black mb-2">No projects yet</h2>
                <p className="text-stone-gray mb-8">Upload your source code to begin automated security analysis.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="btn-terracotta px-8 py-3"
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div key={project._id} className="bg-ivory border border-border-cream rounded-[32px] p-6 shadow-whisper group hover:border-terracotta/30 transition-all flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        project.scanStatus === 'completed' ? 'bg-green-50 text-green-600' : 'bg-warm-sand/50 text-terracotta'
                      }`}>
                        {scanningId === project._id ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <Shield className="w-6 h-6" />
                        )}
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-1 rounded-full uppercase tracking-tighter ${
                        project.scanStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {project.scanStatus}
                      </span>
                    </div>
                    <h3 className="text-xl font-serif text-near-black mb-2">{project.name}</h3>
                    <p className="text-sm text-stone-gray line-clamp-2 mb-6 flex-grow">{project.description}</p>
                    
                    <div className="pt-6 border-t border-border-cream/50 flex items-center justify-between">
                      <p className="text-[10px] text-stone-gray/60 font-mono">
                        {project.lastScan ? `Scanned ${new Date(project.lastScan).toLocaleDateString()}` : 'Never scanned'}
                      </p>
                      <div className="flex gap-2">
                        {project.scanStatus === 'completed' && (
                          <button 
                            onClick={() => router.push(`/dashboard/projects/${project._id}`)}
                            className="bg-ivory border border-border-cream text-near-black p-2 rounded-xl hover:border-terracotta transition-colors"
                            title="View Report"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => triggerScan(project._id)}
                          disabled={scanningId === project._id}
                          className="bg-terracotta/10 text-terracotta p-2 rounded-xl hover:bg-terracotta hover:text-ivory transition-colors disabled:opacity-50"
                          title="Run AI Scan"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
              <div className="bg-ivory border border-border-cream rounded-[40px] p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-3xl font-serif text-near-black mb-2">Secure Upload</h3>
                <p className="text-stone-gray text-sm mb-8">Send your source code to the ephemeral sandbox for analysis.</p>
                <form onSubmit={handleUpload} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-mono mb-2 uppercase tracking-widest opacity-60">Project Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Fintech API"
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      className="w-full bg-warm-sand/20 border border-border-cream rounded-2xl px-5 py-4 outline-none focus:border-terracotta/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono mb-2 uppercase tracking-widest opacity-60">Description</label>
                    <textarea 
                      required
                      placeholder="Describe the architecture or tech stack..."
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      className="w-full bg-warm-sand/20 border border-border-cream rounded-2xl px-5 py-4 outline-none focus:border-terracotta/50 h-32 resize-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono mb-2 uppercase tracking-widest opacity-60">Source Code (ZIP/JS/PY)</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        required
                        onChange={(e) => setNewProject({...newProject, file: e.target.files[0]})}
                        className="w-full text-sm text-stone-gray file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-mono file:bg-terracotta file:text-ivory hover:file:opacity-90 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-grow btn-warm-sand py-4 rounded-2xl"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-grow btn-terracotta py-4 rounded-2xl"
                    >
                      Start Analysis
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
