"use client";

import { useEffect, useState } from "react";
import AdminLayoutWrapper from "@/components/AdminLayoutWrapper";
import { getAdminAuditLogs } from "@/services/adminService";
import { toast } from "react-hot-toast";
import { 
  ClipboardList, CheckCircle2, XCircle, Clock,
  Search, Filter, Activity, User, Monitor
} from "lucide-react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await getAdminAuditLogs();
      setLogs(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch system audit trails");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    return status === "success" 
      ? <div className="p-2 bg-green-100 rounded-full text-green-700 shadow-sm"><CheckCircle2 className="w-5 h-5" /></div>
      : <div className="p-2 bg-red-100 rounded-full text-red-700 shadow-sm"><XCircle className="w-5 h-5" /></div>;
  };

  
  const filteredLogs = logs.filter(log => {
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const searchString = `
      ${log.action || ""} 
      ${log.details || ""} 
      ${log.user?.name || ""} 
      ${log.user?.email || ""} 
      ${log.resource || ""}
    `.toLowerCase();
    
    const matchesSearch = searchTerm === "" || searchString.includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayoutWrapper>
      <div className="mb-12">
        <h1 className="text-4xl mb-2 flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-terracotta" />
          System Audit Trail
        </h1>
        <p className="text-olive-gray font-sans cursor-default">Immutable record of all DevSecOps events, user actions, and security detections.</p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-ivory border border-border-cream p-6 rounded-[24px] shadow-sm flex items-center justify-between">
           <div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-stone-gray mb-1">Total Logs Tracked</p>
             <h3 className="text-3xl font-serif">{logs.length}</h3>
           </div>
           <Activity className="w-8 h-8 text-blue-500 opacity-20" />
        </div>
        <div className="bg-ivory border border-border-cream p-6 rounded-[24px] shadow-sm flex items-center justify-between">
           <div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-1">Successful Events</p>
             <h3 className="text-3xl font-serif text-green-700">{logs.filter(l => l.status === "success").length}</h3>
           </div>
           <CheckCircle2 className="w-8 h-8 text-green-500 opacity-20" />
        </div>
        <div className="bg-ivory border border-border-cream p-6 rounded-[24px] shadow-sm flex items-center justify-between">
           <div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-1">Failed/Blocked Events</p>
             <h3 className="text-3xl font-serif text-red-700">{logs.filter(l => l.status === "failure").length}</h3>
           </div>
           <XCircle className="w-8 h-8 text-red-500 opacity-20" />
        </div>
      </div>

      <div className="bg-ivory border border-border-cream rounded-[40px] shadow-whisper p-8">
        
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
           <div className="flex-1 relative">
             <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-gray" />
             <input 
               type="text" 
               placeholder="Search logs by user, action, or details..."
               className="w-full bg-warm-sand/30 border border-border-cream rounded-2xl py-3 pl-12 pr-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-all text-near-black"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex items-center gap-3">
             <Filter className="w-5 h-5 text-stone-gray" />
             <select 
               className="input-warm text-sm min-w-[150px] font-bold"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="all">All Statuses</option>
               <option value="success">Success Only</option>
               <option value="failure">Failure Only</option>
             </select>
           </div>
        </div>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center">
             <Monitor className="w-10 h-10 animate-spin text-terracotta/50 mb-4" />
             <p className="text-stone-gray font-serif italic text-lg">Fetching secure telemetry logs...</p>
          </div>
        ) : (
          <div className="space-y-4">
             {filteredLogs.map((log) => (
               <div 
                 key={log._id}
                 className={`border rounded-3xl p-6 flex items-start gap-5 transition-all hover:shadow-md ${log.status === 'failure' ? 'bg-red-50/50 border-red-100 hover:border-red-300' : 'bg-white border-border-cream hover:border-terracotta/30'}`}
               >
                  <div className="shrink-0 mt-1">
                    {getStatusIcon(log.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                           <span className="bg-near-black text-ivory text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg">
                             {log.action}
                           </span>
                           {log.resource && (
                             <span className="text-xs font-mono text-stone-gray flex items-center gap-1">
                               <Monitor className="w-3 h-3" /> {log.resource}
                             </span>
                           )}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-sans text-olive-gray">
                           <Clock className="w-3 h-3" />
                           {new Date(log.createdAt).toLocaleString(undefined, {
                             year: 'numeric', month: 'short', day: 'numeric', 
                             hour: '2-digit', minute: '2-digit', second: '2-digit'
                           })}
                        </div>
                     </div>

                     <p className="text-sm font-sans text-near-black leading-relaxed mb-4">
                       {log.details}
                     </p>

                     <div className="flex flex-wrap gap-4 mb-4 text-xs font-mono text-stone-gray opacity-80 bg-warm-sand/20 p-3 rounded-xl border border-border-cream/50">
                        {log.ipAddress && (
                          <div className="flex gap-2 items-center">
                            <span className="font-bold uppercase tracking-widest text-[10px]">IP:</span>
                            {log.ipAddress}
                          </div>
                        )}
                        {log.userAgent && (
                          <div className="flex gap-2 items-center truncate max-w-full">
                            <span className="font-bold uppercase tracking-widest text-[10px]">Agent:</span>
                            <span className="truncate" title={log.userAgent}>{log.userAgent}</span>
                          </div>
                        )}
                     </div>


                     {log.user && (
                       <div className="flex items-center gap-2 text-xs font-sans bg-warm-sand/30 self-start inline-flex px-3 py-1.5 rounded-full border border-border-cream/50">
                          <User className="w-3 h-3 text-terracotta" />
                          <span className="font-bold">{log.user.name}</span>
                          <span className="text-stone-gray hidden sm:inline">({log.user.email})</span>
                       </div>
                     )}
                     {!log.user && (
                       <div className="flex items-center gap-2 text-xs font-sans bg-gray-100 self-start inline-flex px-3 py-1.5 rounded-full text-gray-500">
                          <User className="w-3 h-3" /> System Event
                       </div>
                     )}
                  </div>
               </div>
             ))}

             {filteredLogs.length === 0 && !loading && (
               <div className="py-20 text-center border border-dashed border-border-cream rounded-3xl bg-warm-sand/10">
                  <p className="text-stone-gray italic text-sm">No operational logs match your search criteria.</p>
               </div>
             )}
          </div>
        )}

      </div>
    </AdminLayoutWrapper>
  );
}
