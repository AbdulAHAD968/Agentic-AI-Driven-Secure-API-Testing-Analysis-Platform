"use client";

import { useEffect, useState } from "react";
import AdminLayoutWrapper from "@/components/AdminLayoutWrapper";
import { getInquiries, updateInquiry, deleteInquiry, replyToInquiry } from "@/services/adminService";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "react-hot-toast";
import { 
  MessageSquare, Mail, Search, Trash2, 
  CheckCircle, Clock, Reply, Send, Loader2, X
} from "lucide-react";

export default function ContactManagement() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  
  
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, loading: false });

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await getInquiries();
      setInquiries(res.data);
    } catch (err) {
      toast.error("Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateInquiry(id, status);
      toast.success(`Marked as ${status}`);
      fetchInquiries();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const handleDelete = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      await deleteInquiry(deleteModal.id);
      toast.success("Inquiry deleted.");
      fetchInquiries();
      if (selectedInquiry?._id === deleteModal.id) setSelectedInquiry(null);
      setDeleteModal({ open: false, id: null, loading: false });
    } catch (err) {
      toast.error("Delete failed.");
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return toast.error("Please enter a message");

    setSendingReply(true);
    try {
      await replyToInquiry(selectedInquiry._id, replyMessage);
      toast.success("Reply sent successfully via SMTP.");
      setReplyMessage("");
      setIsReplying(false);
      fetchInquiries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <AdminLayoutWrapper>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl mb-2">Communications</h1>
          <p className="text-olive-gray font-sans">Monitor and respond to global user inquiries.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 h-[calc(100vh-280px)]">
        
        <div className="bg-ivory border border-border-cream rounded-[32px] overflow-hidden shadow-whisper flex flex-col">
           <div className="p-6 border-b border-border-cream bg-warm-sand/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-gray" />
                <input 
                  type="text" 
                  placeholder="Filter inquiries..." 
                  className="w-full bg-parchment/50 border border-border-cream rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:ring-1 focus:ring-terracotta/20"
                />
              </div>
           </div>
           
           <div className="flex-grow overflow-auto divide-y divide-border-cream">
              {inquiries.map((iq) => (
                <button 
                  key={iq._id}
                  onClick={() => {
                    setSelectedInquiry(iq);
                    setIsReplying(false);
                  }}
                  className={`w-full text-left p-6 transition-all hover:bg-warm-sand/10 ${
                    selectedInquiry?._id === iq._id ? "bg-warm-sand/20 border-l-4 border-l-terracotta" : "border-l-4 border-l-transparent"
                  }`}
                >
                   <div className="flex justify-between items-start mb-2">
                     <p className="text-sm font-semibold text-near-black">{iq.name}</p>
                     <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                       iq.status === "new" ? "bg-terracotta/10 text-terracotta" : iq.status === "replied" ? "bg-green-100 text-green-700" : "bg-warm-sand text-stone-gray"
                     }`}>
                       {iq.status}
                     </span>
                   </div>
                   <p className="text-xs font-serif text-charcoal-warm font-medium mb-1 truncate">{iq.subject}</p>
                   <p className="text-[10px] text-olive-gray font-sans italic">
                     {new Date(iq.createdAt).toLocaleDateString()}
                   </p>
                </button>
              ))}
           </div>
        </div>

        
        <div className="bg-ivory border border-border-cream rounded-[32px] overflow-hidden shadow-whisper flex flex-col relative group">
           {selectedInquiry ? (
             <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-8 border-b border-border-cream flex justify-between items-center bg-warm-sand/5">
                   <div>
                      <h3 className="text-2xl font-serif text-near-black mb-1">{selectedInquiry.subject}</h3>
                      <div className="flex items-center gap-4 text-xs font-sans text-olive-gray">
                         <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selectedInquiry.email}</span>
                         <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(selectedInquiry._id, "replied")}
                        className="btn-warm-sand !py-2 !px-4 !text-[11px] !rounded-xl"
                      >
                         <CheckCircle className="w-4 h-4 mr-2" /> Mark Replied
                      </button>
                      <button 
                        onClick={() => setDeleteModal({ open: true, id: selectedInquiry._id, loading: false })}
                        className="p-2 text-stone-gray hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
                
                <div className="flex-grow p-12 overflow-auto bg-parchment/10 space-y-8">
                   
                   <div className="max-w-2xl bg-ivory p-10 rounded-[32px] border border-border-cream shadow-sm">
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 bg-warm-sand/30 rounded-full flex items-center justify-center text-terracotta shrink-0">
                           {selectedInquiry.name.charAt(0)}
                        </div>
                        <div className="space-y-6">
                           <p className="text-sm font-semibold tracking-wide text-stone-gray uppercase">Message from {selectedInquiry.name}:</p>
                           <p className="text-lg font-serif text-near-black leading-relaxed whitespace-pre-wrap">
                             {selectedInquiry.message}
                           </p>
                           {!isReplying && (
                             <div className="pt-8 border-t border-border-cream">
                               <button 
                                 onClick={() => setIsReplying(true)}
                                 className="btn-terracotta !py-3 !px-8 text-sm gap-2"
                               >
                                  <Reply className="w-4 h-4" /> Reply within Portal
                               </button>
                             </div>
                           )}
                        </div>
                      </div>
                   </div>

                   
                   {isReplying && (
                     <div className="max-w-2xl bg-white p-10 rounded-[32px] border border-terracotta/20 shadow-warm animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                           <h4 className="text-lg font-serif text-terracotta flex items-center gap-2">
                             <Send className="w-4 h-4" /> Compose Official Reply
                           </h4>
                           <button onClick={() => setIsReplying(false)} className="p-2 text-stone-gray hover:bg-warm-sand/20 rounded-full transition-all">
                             <X className="w-4 h-4" />
                           </button>
                        </div>
                        <form onSubmit={handleSendReply} className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-stone-gray">Message Content</label>
                              <textarea 
                                required
                                rows={8}
                                placeholder="Write your thoughtful response..."
                                className="w-full bg-parchment/30 border border-border-cream rounded-2xl p-6 text-near-black font-sans focus:outline-none focus:ring-2 focus:ring-terracotta/10 transition-all resize-none"
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                              />
                           </div>
                           <div className="flex gap-4">
                              <button 
                                type="submit" 
                                disabled={sendingReply}
                                className="btn-terracotta flex-grow py-4 gap-2"
                              >
                                {sendingReply ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <>Send Official Reply <Send className="w-4 h-4" /></>
                                )}
                              </button>
                              <button 
                                type="button"
                                onClick={() => setIsReplying(false)}
                                className="btn-warm-sand !py-4"
                              >
                                Cancel
                              </button>
                           </div>
                        </form>
                     </div>
                   )}
                </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 bg-warm-sand/20 rounded-[24px] flex items-center justify-center text-stone-gray mb-6">
                   <MessageSquare className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif text-near-black mb-2">Select an inquiry</h3>
                <p className="text-olive-gray font-sans max-w-xs italic text-sm">Choose a communication from the sidebar to view full details and respond.</p>
             </div>
           )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, loading: false })}
        onConfirm={handleDelete}
        loading={deleteModal.loading}
        title="Delete Inquiry"
        message="Are you sure you want to remove this communication? This action is permanent."
      />
    </AdminLayoutWrapper>
  );
}
