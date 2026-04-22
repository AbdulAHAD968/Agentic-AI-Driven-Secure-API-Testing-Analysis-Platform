"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getNotifications, markAsRead, deleteNotification } from "@/services/notificationService";
import { getMe } from "@/services/authService";
import { toast } from "react-hot-toast";
import { 
  Bell, Info, AlertTriangle, CheckCircle2, 
  Trash2, BellRing, Settings, RefreshCw 
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    initPage();
  }, []);

  const initPage = async () => {
    try {
      const userRes = await getMe();
      if (userRes.success) {
        setCurrentUser(userRes.data);
        
        
        await fetchNotifications();
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.readBy.includes(currentUser?._id));
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map(n => markAsRead(n._id)));
      toast.success("Inbox cleared");
      fetchNotifications();
    } catch (err) {
      toast.error("Process failed");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "success": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "error": return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-parchment selection:bg-terracotta/10">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
           <div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-terracotta/10 rounded-xl flex items-center justify-center text-terracotta">
                    <BellRing className="w-6 h-6" />
                 </div>
                 <span className="text-xs font-bold uppercase tracking-[0.3em] text-terracotta">Inbox</span>
              </div>
              <h1 className="text-5xl font-serif text-near-black">Notifications</h1>
           </div>
           
           <div className="flex gap-4">
              <button 
                onClick={handleMarkAllRead}
                className="btn-warm-sand !py-3 !px-6 text-sm flex items-center gap-2"
              >
                Clear All <CheckCircle2 className="w-4 h-4" />
              </button>
              <button 
                onClick={fetchNotifications}
                className="p-3 bg-white border border-border-cream rounded-xl text-stone-gray hover:text-near-black transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
           </div>
        </div>

        <div className="space-y-6">
          {notifications.map((notif) => {
            const isRead = notif.readBy.includes(currentUser?._id);
            return (
              <div 
                key={notif._id}
                className={`bg-white border rounded-[32px] p-8 transition-all flex gap-6 ${
                   !isRead 
                   ? "border-terracotta shadow-whisper-lg ring-1 ring-terracotta/20" 
                   : "border-border-cream opacity-70"
                }`}
              >
                 <div className="shrink-0 mt-1">
                    {getIcon(notif.type)}
                 </div>
                 <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className={`text-xl font-serif ${!isRead ? "text-near-black" : "text-stone-gray"}`}>
                         {notif.title}
                       </h3>
                       <div className="flex items-center gap-4">
                          <span className="text-[10px] text-stone-gray uppercase tracking-widest font-mono">
                            {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <button 
                            onClick={() => handleDelete(notif._id)}
                            className="text-stone-gray hover:text-red-500 transition-colors"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                    <p className={`font-sans leading-relaxed ${!isRead ? "text-olive-gray" : "text-stone-gray/80"}`}>
                       {notif.message}
                    </p>
                    
                    {!isRead && (
                      <div className="mt-6">
                         <button 
                           onClick={async () => {
                             await markAsRead(notif._id);
                             fetchNotifications();
                           }}
                           className="text-xs font-bold uppercase tracking-widest text-terracotta hover:underline"
                         >
                           Mark as Read
                         </button>
                      </div>
                    )}
                 </div>
              </div>
            );
          })}

          {notifications.length === 0 && !loading && (
            <div className="text-center py-32 bg-warm-sand/5 rounded-[48px] border border-dashed border-border-cream">
               <Bell className="w-12 h-12 text-stone-gray/20 mx-auto mb-4" />
               <h3 className="text-2xl font-serif text-stone-gray opacity-40">Your Inbox is Silent</h3>
               <p className="text-sm text-stone-gray/40 mt-2">Check back later for platform updates.</p>
            </div>
          )}

          {loading && (
            <div className="space-y-6">
               {[1,2,3].map(i => (
                 <div key={i} className="h-40 bg-white/50 border border-border-cream rounded-[32px] animate-pulse" />
               ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
