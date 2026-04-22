"use client";

import { useEffect, useState } from "react";
import AdminLayoutWrapper from "@/components/AdminLayoutWrapper";
import { getAllAdminProjects } from "@/services/adminService";
import { toast } from "react-hot-toast";
import { FolderGit2, Activity, ShieldAlert, Cpu } from "lucide-react";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await getAllAdminProjects();
      setProjects(res.data);
    } catch (err) {
      toast.error("Failed to load platform projects");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed": return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Completed</span>;
      case "scanning": return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">Scanning</span>;
      case "failed": return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Failed</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Pending</span>;
    }
  };

  return (
    <AdminLayoutWrapper>
      <div className="mb-12">
        <h1 className="text-4xl mb-2 flex items-center gap-3">
          <FolderGit2 className="w-8 h-8 text-terracotta" />
          Global Projects
        </h1>
        <p className="text-olive-gray font-sans cursor-default">Platform-wide overview of all codebases ingested into the DevSecOps AI Core.</p>
      </div>

      <div className="bg-ivory border border-border-cream rounded-[40px] shadow-whisper overflow-hidden text-near-black">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center">
             <Cpu className="w-10 h-10 animate-spin text-terracotta/50 mb-4" />
             <p className="text-stone-gray font-serif italic text-lg">Querying Platform Neural Cores...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-cream bg-warm-sand/20 text-xs uppercase tracking-widest text-stone-gray font-bold">
                  <th className="p-6">Project Name</th>
                  <th className="p-6">Owner</th>
                  <th className="p-6 text-center">Status</th>
                  <th className="p-6 text-center">Critical Issues</th>
                  <th className="p-6 text-right">Upload Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-cream">
                {projects.map((project) => {
                  const crit = project?.findingsSummary?.critical || 0;
                  const high = project?.findingsSummary?.high || 0;
                  const totalSevere = crit + high;

                  return (
                    <tr key={project._id} className="hover:bg-warm-sand/10 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-ivory border border-border-cream flex items-center justify-center text-terracotta group-hover:scale-110 transition-transform">
                             <Activity className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-base">{project.name}</p>
                            <p className="text-xs text-olive-gray font-sans w-48 truncate">{project.description || "No description provided"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 font-sans">
                         <p className="font-semibold text-sm">{project.user?.name || "Unknown"}</p>
                         <p className="text-xs text-stone-gray">{project.user?.email}</p>
                      </td>
                      <td className="p-6 text-center">
                        {getStatusBadge(project.scanStatus)}
                      </td>
                      <td className="p-6">
                        <div className="flex justify-center">
                          {totalSevere > 0 ? (
                            <span className="flex items-center gap-1 text-red-600 font-bold font-mono bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                              <ShieldAlert className="w-4 h-4" />
                              {totalSevere} Alert{totalSevere !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-green-600 text-xs font-bold uppercase tracking-widest">Clean</span>
                          )}
                        </div>
                      </td>
                      <td className="p-6 text-right text-sm text-olive-gray font-sans">
                        {new Date(project.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {projects.length === 0 && !loading && (
              <div className="py-20 text-center">
                 <p className="text-stone-gray italic text-sm">No projects exist on the platform.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayoutWrapper>
  );
}
