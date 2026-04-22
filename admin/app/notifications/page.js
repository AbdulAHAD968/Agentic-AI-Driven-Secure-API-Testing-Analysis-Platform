"use client";

import { useEffect, useState } from "react";
import AdminLayoutWrapper from "@/components/AdminLayoutWrapper";
import { getAdminNotifications, createNotification, deleteNotification, purgeNotifications } from "@/services/adminService";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "react-hot-toast";
import { 
  Bell, Send, Trash2, ShieldInfo, 
  AlertTriangle, CheckCircle2, Info, Loader2,
  List, BarChart3, Clock
} from "lucide-react";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("broadcast");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    recipient: "all"
  });

  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, loading: false });
  const [purgeModal, setPurgeModal] = useState({ open: false, days: "7", loading: false });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getAdminNotifications();
      setNotifications(res.data);
    } catch (err) {
      toast.error("Failed to fetch notification history");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await createNotification(formData);
      toast.success("Broadcast sent successfully");
      setFormData({ title: "", message: "", type: "info", recipient: "all" });
      fetchNotifications();
      setActiveTab("history"); // Auto switch to history
    } catch (err) {
      toast.error("Broadcast failed");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      await deleteNotification(deleteModal.id);
      toast.success("Broadcast removed");
      setDeleteModal({ open: false, id: null, loading: false });
      fetchNotifications();
    } catch (err) {
      toast.error("Delete failed");
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handlePurge = async () => {
    setPurgeModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await purgeNotifications(purgeModal.days);
      toast.success(res.message);
      setPurgeModal({ open: false, days: "7", loading: false });
      fetchNotifications();
    } catch (err) {
      toast.error("Purge failed");
      setPurgeModal(prev => ({ ...prev, loading: false }));
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "success": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  // Stats computation
  const total = notifications.length;
  const types = { info: 0, success: 0, warning: 0, error: 0 };
  notifications.forEach(n => types[n.type] = (types[n.type] || 0) + 1);

  return (
    <AdminLayoutWrapper>
      <div className="mb-12">
        <h1 className="text-4xl mb-2">Broadcast Center</h1>
        <p className="text-olive-gray font-sans">Dispatch system-wide alerts and targeted notifications.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-border-cream pb-4">
        <button 
          onClick={() => setActiveTab("broadcast")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${
            activeTab === "broadcast" ? "bg-terracotta text-white shadow-xl" : "bg-ivory text-stone-gray hover:bg-warm-sand/50"
          }`}
        >
          <Send className="w-4 h-4" /> Compose
        </button>
        <button 
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${
            activeTab === "history" ? "bg-terracotta text-white shadow-xl" : "bg-ivory text-stone-gray hover:bg-warm-sand/50"
          }`}
        >
          <List className="w-4 h-4" /> History
        </button>
        <button 
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${
            activeTab === "stats" ? "bg-terracotta text-white shadow-xl" : "bg-ivory text-stone-gray hover:bg-warm-sand/50"
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Stats
        </button>
      </div>

      <div className="text-near-black max-w-4xl">
        
        {/* COMPONENT: BROADCAST */}
        {activeTab === "broadcast" && (
          <div className="bg-ivory border border-border-cream rounded-[40px] p-10 shadow-whisper">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-warm-sand/50 rounded-2xl flex items-center justify-center text-terracotta">
                  <Bell className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-serif">Compose Broadcast</h2>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-gray ml-1">Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. System Maintenance"
                    className="input-warm"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-gray ml-1">Message</label>
                  <textarea 
                    required
                    placeholder="Details of the notification..."
                    className="input-warm min-h-[120px] resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-gray ml-1">Alert Level</label>
                      <select 
                        className="input-warm text-sm"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                      >
                         <option value="info">Information</option>
                         <option value="success">Success</option>
                         <option value="warning">Warning</option>
                         <option value="error">Critical</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-gray ml-1">Target</label>
                      <select 
                        className="input-warm text-sm"
                        value={formData.recipient}
                        onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                      >
                         <option value="all">Global (All Users)</option>
                      </select>
                   </div>
                </div>

                <button 
                  type="submit" 
                  disabled={sending}
                  className="btn-terracotta w-full py-5 text-lg"
                >
                  {sending ? <Loader2 className="animate-spin" /> : <>Dispatch Alert <Send className="ml-2 w-4 h-4" /></>}
                </button>
             </form>
          </div>
        )}

        {/* COMPONENT: HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-6">
             <div className="flex items-center justify-between px-2">
               <h3 className="text-xl font-serif">Broadcast History</h3>
               <button 
                 onClick={() => setPurgeModal({ open: true, days: "30", loading: false })}
                 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors bg-red-50 px-4 py-2 rounded-full"
               >
                 <Trash2 className="w-3 h-3" /> Bulk Purge
               </button>
             </div>
             <div className="space-y-4">
                {notifications.map((notif) => (
                  <div 
                    key={notif._id}
                    className="bg-ivory border border-border-cream rounded-3xl p-6 flex justify-between items-start group shadow-sm hover:shadow-md transition-all"
                  >
                     <div className="flex gap-4">
                        <div className="mt-1">{getTypeIcon(notif.type)}</div>
                        <div className="space-y-1">
                           <div className="flex items-center gap-3">
                             <h4 className="font-bold text-near-black tracking-tight">{notif.title}</h4>
                             <span className="text-[10px] bg-parchment px-2 py-0.5 rounded-full text-stone-gray font-bold uppercase tracking-widest">
                               {notif.recipient === "all" ? "Global" : "Direct"}
                             </span>
                           </div>
                           <p className="text-sm text-olive-gray font-sans line-clamp-2">{notif.message}</p>
                           <p className="text-[10px] text-stone-gray font-sans italic pt-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Dispatched {new Date(notif.createdAt).toLocaleString()}
                           </p>
                        </div>
                     </div>
                     <button 
                       onClick={() => setDeleteModal({ open: true, id: notif._id, loading: false })}
                       className="p-2 text-stone-gray hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                ))}

                {notifications.length === 0 && !loading && (
                  <div className="py-20 text-center bg-ivory/50 rounded-[40px] border border-dashed border-border-cream">
                     <p className="text-stone-gray italic text-sm">No transmissions recorded.</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* COMPONENT: STATS */}
        {activeTab === "stats" && (
           <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 bg-near-black text-ivory p-8 rounded-[32px] flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Total Broadcasts</p>
                   <h3 className="text-5xl font-serif">{total}</h3>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl">
                   <BarChart3 className="w-8 h-8 text-terracotta" />
                </div>
              </div>

              {Object.entries({
                "Info": { val: types.info, icon: <Info className="w-5 h-5 text-blue-500" /> },
                "Success": { val: types.success, icon: <CheckCircle2 className="w-5 h-5 text-green-500" /> },
                "Warning": { val: types.warning, icon: <AlertTriangle className="w-5 h-5 text-amber-500" /> },
                "Critical": { val: types.error, icon: <AlertTriangle className="w-5 h-5 text-red-500" /> },
              }).map(([label, { val, icon }]) => (
                <div key={label} className="bg-ivory border border-border-cream p-6 rounded-[24px] flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-warm-sand/30 rounded-lg">{icon}</div>
                     <p className="font-bold text-sm uppercase tracking-widest text-stone-gray">{label}</p>
                   </div>
                   <p className="text-2xl font-serif text-near-black">{val || 0}</p>
                </div>
              ))}
           </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, loading: false })}
        onConfirm={handleDelete}
        loading={deleteModal.loading}
        title="Remove Broadcast"
        message="Are you sure you want to permanently delete this transmission? This action cannot be undone."
      />

      {/* Bulk Purge Modal */}
      {purgeModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-near-black/40 backdrop-blur-sm" onClick={() => !purgeModal.loading && setPurgeModal({ open: false, days: "7", loading: false })}></div>
          <div className="relative bg-ivory rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-serif text-near-black mb-2">Bulk Purge</h3>
            <p className="text-stone-gray text-sm leading-relaxed mb-6 font-sans">
              Select the age of the broadcast history you want to permanently delete.
            </p>
            
            <div className="space-y-4 mb-8">
              <select 
                className="input-warm w-full text-sm"
                value={purgeModal.days}
                onChange={(e) => setPurgeModal({ ...purgeModal, days: e.target.value })}
                disabled={purgeModal.loading}
              >
                 <option value="7">Older than 7 Days</option>
                 <option value="30">Older than 30 Days</option>
                 <option value="all">Purge All (Danger)</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setPurgeModal({ open: false, days: "7", loading: false })}
                disabled={purgeModal.loading}
                className="flex-1 px-4 py-3 bg-warm-sand/30 hover:bg-warm-sand/50 text-near-black rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePurge}
                disabled={purgeModal.loading}
                className="flex-1 flex justify-center items-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {purgeModal.loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Purge Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayoutWrapper>
  );
}
