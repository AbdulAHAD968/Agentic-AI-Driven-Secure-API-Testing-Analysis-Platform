"use client";

import { useEffect, useState } from "react";
import AdminLayoutWrapper from "@/components/AdminLayoutWrapper";
import { getAdminNotifications, createNotification, deleteNotification } from "@/services/adminService";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "react-hot-toast";
import { 
  Bell, Send, Trash2, ShieldInfo, 
  AlertTriangle, CheckCircle2, Info, Loader2 
} from "lucide-react";

export default function NotificationsPage() {
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

  const getTypeIcon = (type) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "success": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <AdminLayoutWrapper>
      <div className="mb-12">
        <h1 className="text-4xl mb-2">Broadcast Center</h1>
        <p className="text-olive-gray font-sans">Dispatch system-wide alerts and targeted notifications.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[450px_1fr] gap-12 items-start text-near-black">
        
        <div className="bg-ivory border border-border-cream rounded-[40px] p-10 shadow-whisper sticky top-32">
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

        
        <div className="space-y-6">
           <h3 className="text-xl font-serif px-2">Broadcast History</h3>
           <div className="space-y-4">
              {notifications.map((notif) => (
                <div 
                  key={notif._id}
                  className="bg-white/80 backdrop-blur-sm border border-border-cream rounded-3xl p-6 flex justify-between items-start group shadow-sm hover:shadow-md transition-all"
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
                         <p className="text-[10px] text-stone-gray font-sans italic pt-2">
                            Dispatched {new Date(notif.createdAt).toLocaleString()}
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
      </div>

      <ConfirmModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, loading: false })}
        onConfirm={handleDelete}
        loading={deleteModal.loading}
        title="Remove Broadcast"
        message="Are you sure you want to permanently delete this transmission? This action cannot be undone."
      />
    </AdminLayoutWrapper>
  );
}
