"use client";

import { useEffect, useState } from "react";
import AdminLayoutWrapper from "@/components/AdminLayoutWrapper";
import { getAllAdminVulnerabilities } from "@/services/adminService";
import { toast } from "react-hot-toast";
import { ShieldAlert, Activity, FileText, Filter, Cpu } from "lucide-react";

export default function AdminVulnerabilitiesPage() {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); 
  const [projectFilter, setProjectFilter] = useState("all");

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  const fetchVulnerabilities = async () => {
    try {
      const res = await getAllAdminVulnerabilities();
      
      
      const sorted = (res.data || []).sort((a, b) => {
        const severities = { "Critical": 5, "High": 4, "Medium": 3, "Low": 2, "Info": 1 };
        return (severities[b.severity] || 0) - (severities[a.severity] || 0);
      });
      
      setVulnerabilities(sorted);
    } catch (err) {
      toast.error("Failed to load platform vulnerabilities");
    } finally {
      setLoading(false);
    }
  };

  const uniqueProjects = Array.from(new Set(vulnerabilities.filter(v => v.project?._id).map(v => v.project._id)))
    .map(id => vulnerabilities.find(v => v.project._id === id).project);

  const filteredVulns = vulnerabilities.filter(v => {
    const matchesSeverity = filter === "all" || v.severity === filter;
    const matchesProject = projectFilter === "all" || v.project?._id === projectFilter;
    return matchesSeverity && matchesProject;
  });

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "Critical": return "bg-red-50 text-red-700 border-red-200";
      case "High": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Medium": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Low": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Info": return "bg-gray-50 text-gray-700 border-gray-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <AdminLayoutWrapper>
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl mb-2 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-terracotta" />
            Global Vulnerabilities
          </h1>
          <p className="text-olive-gray font-sans cursor-default">System-wide feed of all threats detected by the AI core across user applications.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-stone-gray" />
          
          <select 
            className="input-warm text-sm min-w-[150px] font-bold max-w-[200px] truncate"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="all">All Projects</option>
            {uniqueProjects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          <select 
            className="input-warm text-sm min-w-[150px] font-bold"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Only</option>
            <option value="Medium">Medium Only</option>
            <option value="Low">Low Only</option>
          </select>
        </div>
      </div>

      <div className="bg-ivory border border-border-cream rounded-[40px] shadow-whisper p-8">
        
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center">
             <Cpu className="w-10 h-10 animate-spin text-terracotta/50 mb-4" />
             <p className="text-stone-gray font-serif italic text-lg">Cross-referencing global telemetry...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVulns.map((vuln) => (
              <div 
                key={vuln._id}
                className={`border rounded-[24px] p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden transition-all hover:shadow-md ${getSeverityStyle(vuln.severity)}`}
              >
                
                <div className="md:w-64 shrink-0 border-r border-current/10 pr-6">
                   <div className="flex items-center gap-2 mb-2">
                     <span className="font-bold text-sm uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/50 border border-current/20">
                       {vuln.severity}
                     </span>
                     {vuln.cvssScore && (
                       <span className="font-mono text-xs opacity-70">CVSS {vuln.cvssScore}</span>
                     )}
                   </div>
                   <h3 className="font-serif text-xl leading-tight mb-4">{vuln.title}</h3>
                   
                   <div className="text-xs font-sans opacity-80 space-y-1">
                     <p className="font-bold uppercase tracking-widest text-[10px] opacity-50">Impacted Project</p>
                     <p className="truncate">{vuln.project?.name || "Unknown Project"}</p>
                     <p className="truncate">{vuln.project?.user?.email || "Unknown User"}</p>
                   </div>
                </div>

                
                <div className="flex-1 space-y-4">
                  <div className="bg-white/40 rounded-xl p-4 font-sans text-sm leading-relaxed">
                    <p>{vuln.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/40 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2 opacity-60">
                          <FileText className="w-4 h-4" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">Location</p>
                        </div>
                        <p className="font-mono text-sm break-all font-bold opacity-80">
                          {vuln.file} {vuln.line ? `(Line ${vuln.line})` : ''}
                        </p>
                     </div>
                     <div className="bg-white/40 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2 opacity-60">
                          <Activity className="w-4 h-4" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">Remediation</p>
                        </div>
                        <p className="text-sm font-sans truncate opacity-80" title={vuln.remediation}>
                          {vuln.remediation || "No immediate remediation available."}
                        </p>
                     </div>
                  </div>
                </div>

              </div>
            ))}

            {filteredVulns.length === 0 && !loading && (
              <div className="py-20 text-center">
                 <p className="text-stone-gray italic text-sm">No vulnerabilities match the current filter.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </AdminLayoutWrapper>
  );
}
