"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2, Activity, Terminal, ShieldAlert, CheckCircle2, XCircle, Info } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true
});

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get("/admin/logs");
      setLogs(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    return status === "success" 
      ? <CheckCircle2 className="w-4 h-4 text-green-500" /> 
      : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getActionColor = (action) => {
    if (action.includes("DELETE") || action.includes("SCAN")) return "text-terracotta bg-terracotta/5 border-terracotta/20";
    if (action.includes("CREATE")) return "text-green-700 bg-green-50 border-green-200";
    return "text-stone-gray bg-stone-50 border-stone-200";
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-parchment">
        <Header />
        <main className="flex-grow py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-12">
              <p className="text-terracotta font-mono text-xs uppercase tracking-widest font-bold mb-2">Security Audit</p>
              <h1 className="text-4xl font-serif text-near-black">System Logs</h1>
            </header>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-10 h-10 text-terracotta animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="bg-ivory border border-border-cream rounded-[32px] p-24 text-center shadow-whisper">
                <Terminal className="w-16 h-16 text-border-cream mx-auto mb-6" />
                <h2 className="text-2xl font-serif text-near-black mb-2">No logs recorded</h2>
                <p className="text-stone-gray">Audit tracking is live. System activities will appear here.</p>
              </div>
            ) : (
              <div className="bg-ivory border border-border-cream rounded-[32px] overflow-hidden shadow-whisper">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-warm-sand/20 border-b border-border-cream">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-olive-gray">Timestamp</th>
                        <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-olive-gray">User</th>
                        <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-olive-gray">Action</th>
                        <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-olive-gray">Resource</th>
                        <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-olive-gray">Status</th>
                        <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-olive-gray">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-cream/50">
                      {logs.map((log) => (
                        <tr key={log._id} className="hover:bg-warm-sand/5 transition-colors group">
                          <td className="px-8 py-5">
                            <p className="text-xs font-mono text-near-black">{new Date(log.createdAt).toLocaleString()}</p>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-[10px] font-bold text-terracotta">
                                {log.user?.name?.charAt(0) || "S"}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-near-black">{log.user?.name || "System"}</p>
                                <p className="text-[10px] text-stone-gray">{log.ipAddress}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full border ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-[10px] font-mono text-stone-gray truncate max-w-[150px]">{log.resource}</p>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.status)}
                              <span className={`text-xs capitalize font-medium ${log.status === 'success' ? 'text-near-black' : 'text-red-500'}`}>
                                {log.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-xs text-olive-gray leading-relaxed max-w-xs">{log.details}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
