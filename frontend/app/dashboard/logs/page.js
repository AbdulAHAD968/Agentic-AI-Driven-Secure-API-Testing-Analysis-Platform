"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2, Activity, Terminal, ShieldAlert, CheckCircle2, XCircle, Info, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true
});

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);

  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ 
    title: "", 
    message: "", 
    confirmText: "", 
    onConfirm: () => {} 
  });

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get("/audit/logs");
      setLogs(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/audit/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleDelete = (id) => {
    setModalConfig({
      title: "Delete Log Entry",
      message: "Are you sure you want to permanently remove this security log? This action is recorded and cannot be undone.",
      confirmText: "Delete Log",
      onConfirm: async () => {
        try {
          await api.delete(`/audit/${id}`);
          toast.success("Log entry removed from history");
          fetchLogs();
          fetchStats();
        } catch (err) {
          toast.error("Failed to delete log");
        }
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  const handlePurge = (days) => {
    setModalConfig({
      title: days === "all" ? "Wipe Audit History" : "Bulk Log Cleanup",
      message: days === "all" 
        ? "CRITICAL: You are about to clear ALL audit logs. This will leave no history of system interactions. Proceed with extreme caution."
        : `You are about to delete all security logs older than ${days} days. Is this correct?`,
      confirmText: days === "all" ? "Wipe All Data" : "Purge Logs",
      onConfirm: async () => {
        try {
          setPurging(true);
          const res = await api.delete(`/audit/purge?days=${days}`);
          toast.success(res.data.message);
          fetchLogs();
          fetchStats();
        } catch (err) {
          toast.error("Purge operation failed");
        } finally {
          setPurging(false);
          setModalOpen(false);
        }
      }
    });
    setModalOpen(true);
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
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-terracotta font-mono text-xs uppercase tracking-widest font-bold mb-2">Security Audit</p>
                <h1 className="text-4xl font-serif text-near-black">System Logs</h1>
              </div>
              
              <div className="flex gap-3">
                <select 
                  onChange={(e) => handlePurge(e.target.value)}
                  className="bg-ivory border border-border-cream rounded-xl px-4 py-2.5 text-xs font-mono text-near-black outline-none focus:border-terracotta/40 transition-colors"
                  defaultValue=""
                >
                  <option value="" disabled>Cleanup Operations...</option>
                  <option value="1">Older than 24h</option>
                  <option value="7">Older than 7 days</option>
                  <option value="30">Older than 30 days</option>
                  <option value="all">Clear All Logs</option>
                </select>
                <button 
                  onClick={fetchLogs}
                  className="p-2.5 border border-border-cream rounded-xl hover:bg-warm-sand/10 transition-colors text-stone-gray"
                  title="Refresh"
                >
                  <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </header>

            
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-ivory p-6 rounded-3xl border border-border-cream shadow-whisper">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-olive-gray mb-1">Total Events</p>
                  <p className="text-2xl font-serif text-near-black">{stats.total}</p>
                </div>
                <div className="bg-ivory p-6 rounded-3xl border border-border-cream shadow-whisper">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-terracotta mb-1">Security Alerts</p>
                  <p className="text-2xl font-serif text-terracotta">{stats.failure}</p>
                </div>
                <div className="bg-ivory p-6 rounded-3xl border border-border-cream shadow-whisper">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-olive-gray mb-1">Activity Today</p>
                  <p className="text-2xl font-serif text-near-black">{stats.todayCount}</p>
                </div>
                <div className="bg-ivory p-6 rounded-3xl border border-border-cream shadow-whisper">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-olive-gray mb-1">Success Rate</p>
                  <p className="text-2xl font-serif text-green-600">{stats.successRate}%</p>
                </div>
              </div>
            )}

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
                        <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-olive-gray">Status</th>
                        <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-olive-gray">Details</th>
                        <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-widest text-olive-gray"></th>
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
                                <p className="text-[10px] text-stone-gray font-mono">{log.ipAddress}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full border ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
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
                          <td className="px-8 py-5 text-right">
                            <button 
                              onClick={() => handleDelete(log._id)}
                              className="p-2 text-stone-gray hover:text-terracotta opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                              title="Delete Log"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
        
        <ConfirmModal 
          isOpen={modalOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          onConfirm={modalConfig.onConfirm}
          onCancel={() => setModalOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}
