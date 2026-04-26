"use client";

import { useEffect, useState } from "react";
import AdminLayoutWrapper from "@/components/AdminLayoutWrapper";
import { getSubscribers, sendNewsletter } from "@/services/adminService";
import { toast } from "react-hot-toast";
import { 
  Mail, Send, Eye, BrainCircuit, Sparkles, 
  Trash2, Download, Smartphone, Monitor, ChevronRight, Loader2
} from "lucide-react";

const EMPTY_PREVIEW_HTML = "<div class='flex flex-col items-center justify-center h-full opacity-20 py-20 grayscale'><p class='uppercase tracking-[0.3em] text-[10px] font-bold text-near-black'>Waiting for Transmission Content</p></div>";

const sanitizePreviewHtml = (html) => {
  /**
   * [Cross-Site Scripting (XSS)]
   * Preview HTML is untrusted admin input, often pasted from AI tools. Strip
   * script blocks, inline event handlers, javascript: URLs, and iframe/object
   * embeds before rendering with dangerouslySetInnerHTML.
   */
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(?:href|src)=("|')\s*javascript:[\s\S]*?\1/gi, "")
    .replace(/<(iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
};

export default function NewsletterManagement() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("subscribers"); 

  
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [previewMode, setPreviewMode] = useState("desktop"); 

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await getSubscribers();
      setSubscribers(res.data);
    } catch (err) {
      toast.error("Failed to fetch subscribers");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject || !content) return toast.error("Please fill in both subject and content");
    
    setSending(true);
    try {
      await sendNewsletter({ subject, htmlContent: content });
      toast.success("Newsletter broadcasted successfully!");
      setSubject("");
      setContent("");
      setActiveTab("subscribers");
    } catch (err) {
      toast.error("Failed to send newsletter");
    } finally {
      setSending(false);
    }
  };

  const handleCopyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Prompt copied! Paste into your AI model.");
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return toast.error("No subscribers to export");

    const headers = ["Email", "Subscription Date"];
    const rows = subscribers.map(s => [
      s.email,
      new Date(s.subscribedAt).toISOString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `topic_ai_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Subscriber list exported");
  };

  const aiPrompts = [
    { 
      label: "Feature Spotlight", 
      prompt: "Provide full HTML and inline CSS code for a premium email spotlighting a new AI feature. BRANDING: Use a Parchment (#F9F6F1) background with Near-Black (#1A1A1A) text and Terracotta (#C35B47). STRUCTURE: Keep it under 200 words. Use ultra-short paragraphs and bullet points. OUTPUT: Provide only the raw HTML/CSS code in a single code block, optimized for copy-pasting directly into a portal." 
    },
    { 
      label: "Platform Manifesto", 
      prompt: "Compose a high-fidelity HTML/CSS editorial about Agentic AI. BRANDING: Minimal Serif-heavy layout. Background color: #F9F6F1. Accents: #C35B47. UX GOAL: Must be highly skimmable and readable in 45 seconds. Use bold pull-quotes. OUTPUT: Return only the complete HTML/CSS code snippet using inline styles for all elements." 
    },
    { 
      label: "Growth & Engagement", 
      prompt: "Generate a mobile-responsive HTML/CSS email for a re-engagement broadcast. GUIDELINES: No clutter. Large margins. Clear 'Read More' CTA in Terracotta. CONTENT: Focus on one singular user benefit in 3 short blocks. OUTPUT: Give me the clean HTML and inline CSS code block, ready for deployment." 
    },
  ];

  const guidelines = [
    { title: "Direct Subject Lines", text: "Avoid clickbait. Be clear and academic like 'The Future of Agentic Workflow' rather than 'YOU WON'T BELIEVE THIS'." },
    { title: "Serif Rhythm", text: "Our brand uses Newsreader. Keep paragraphs short (3-4 lines max) to maintain the editorial rhythm." },
    { title: "High Value Density", text: "Every email should provide at least one useful insight or framework, not just promotion." },
  ];

  return (
    <AdminLayoutWrapper>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl mb-2">Newsletter Hub</h1>
          <p className="text-olive-gray font-sans">Reach your audience with thoughtful administrative updates.</p>
        </div>
        
        <div className="flex bg-ivory border border-border-cream rounded-2xl p-1 shadow-sm">
          <button 
            onClick={() => setActiveTab("subscribers")}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "subscribers" ? "bg-warm-sand/50 text-near-black shadow-sm" : "text-stone-gray hover:text-near-black"
            }`}
          >
            Subscribers
          </button>
          <button 
            onClick={() => setActiveTab("compose")}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "compose" ? "bg-warm-sand/50 text-near-black shadow-sm" : "text-stone-gray hover:text-near-black"
            }`}
          >
            Compose
          </button>
        </div>
      </div>

      {activeTab === "subscribers" ? (
        <div className="bg-ivory border border-border-cream rounded-[32px] overflow-hidden shadow-whisper animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="p-8 border-b border-border-cream flex justify-between items-center bg-warm-sand/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-terracotta/10 rounded-xl flex items-center justify-center text-terracotta">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif">{subscribers.length} Global Subscribers</h3>
              </div>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-olive-gray hover:text-near-black transition-colors"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-border-cream">
             {subscribers.map((sub) => (
               <div key={sub._id} className="p-6 flex items-center justify-between group hover:bg-warm-sand/10 transition-colors">
                 <div>
                   <p className="text-sm font-medium text-near-black">{sub.email}</p>
                   <p className="text-[10px] text-stone-gray uppercase tracking-widest font-sans mt-1">
                     Joined {new Date(sub.subscribedAt).toLocaleDateString()}
                   </p>
                 </div>
                 <button className="opacity-0 group-hover:opacity-100 p-2 text-stone-gray hover:text-red-500 transition-all">
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             ))}
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           
           <div className="space-y-8">
              <section className="bg-ivory border border-border-cream rounded-[32px] p-8 shadow-whisper">
                <div className="flex items-center gap-2 mb-6 text-terracotta">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="text-lg font-serif">AI Composer Assistant</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {aiPrompts.map((p, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleCopyPrompt(p.prompt)}
                      className="text-left p-4 bg-warm-sand/10 border border-border-cream rounded-2xl hover:bg-warm-sand/30 transition-all group"
                    >
                      <p className="text-xs font-bold uppercase tracking-widest mb-2 text-olive-gray group-hover:text-terracotta transition-colors">{p.label}</p>
                      <p className="text-[10px] text-stone-gray line-clamp-2 italic">"{p.prompt}"</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-ivory border border-border-cream rounded-[32px] p-8 shadow-whisper">
                <form onSubmit={handleSend} className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-stone-gray">Subject Line</label>
                     <input 
                       type="text" 
                       required
                       placeholder="e.g., The Architecture of Collaboration"
                       className="w-full bg-warm-sand/10 border border-border-cream rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-terracotta/10"
                       value={subject}
                       onChange={(e) => setSubject(e.target.value)}
                     />
                   </div>
                   <div className="space-y-2">
                     <div className="flex justify-between">
                       <label className="text-xs font-bold uppercase tracking-widest text-stone-gray">HTML Content</label>
                       <span className="text-[10px] text-stone-gray italic">Supports full HTML & CSS</span>
                     </div>
                     <textarea 
                       required
                       rows={15}
                       placeholder="<div>Your elegant content here...</div>"
                       className="w-full bg-near-black text-ivory/80 font-mono text-sm border border-border-cream rounded-xl p-6 focus:outline-none transition-all"
                       value={content}
                       onChange={(e) => setContent(e.target.value)}
                     />
                   </div>
                   
                   <button 
                    type="submit" 
                    disabled={sending}
                    className="btn-terracotta w-full py-4 flex items-center justify-center gap-3"
                   >
                     {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Broadcast to All subscribers</>}
                   </button>
                </form>
              </section>
           </div>

           
           <div className="space-y-8">
              <section className="bg-ivory border border-border-cream rounded-[32px] p-8 shadow-whisper">
                <h3 className="text-lg font-serif mb-6 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-terracotta" /> Editorial Guidelines
                </h3>
                <div className="space-y-6">
                  {guidelines.map((g, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-warm-sand/30 flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</div>
                      <div>
                        <p className="text-sm font-semibold text-near-black mb-1">{g.title}</p>
                        <p className="text-xs text-olive-gray leading-relaxed">{g.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-ivory border border-border-cream rounded-[48px] p-4 shadow-whisper h-[600px] flex flex-col relative group">
                <div className="flex items-center justify-between p-4 border-b border-border-cream">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-stone-gray flex items-center gap-2">
                     <Eye className="w-4 h-4" /> Live Preview
                   </h3>
                   <div className="flex gap-2">
                     <button onClick={() => setPreviewMode("desktop")} className={`p-1.5 rounded ${previewMode === "desktop" ? "bg-warm-sand/50 text-near-black" : "text-stone-gray"}`}>
                       <Monitor className="w-3.5 h-3.5" />
                     </button>
                     <button onClick={() => setPreviewMode("mobile")} className={`p-1.5 rounded ${previewMode === "mobile" ? "bg-warm-sand/50 text-near-black" : "text-stone-gray"}`}>
                       <Smartphone className="w-3.5 h-3.5" />
                     </button>
                   </div>
                </div>
                
                 <div className="flex-grow overflow-auto bg-warm-sand/10 p-8 flex items-start justify-center transition-all duration-500">
                   <div 
                     className={`bg-white shadow-2xl border border-border-cream transition-all duration-500 overflow-hidden ${
                       previewMode === "mobile" 
                        ? "w-[375px] h-[667px] rounded-[3rem] ring-8 ring-near-black/5" 
                        : "w-full min-h-full rounded-2xl"
                     }`}
                   >
                      <div className="p-4 bg-ivory border-b border-border-cream flex justify-between items-center">
                         <span className="text-[10px] font-serif font-bold italic text-terracotta tracking-tighter">TOPIC.AI</span>
                         <div className="flex gap-1.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-border-cream" />
                           <div className="w-1.5 h-1.5 rounded-full bg-border-cream" />
                         </div>
                      </div>
                      <div className="h-full overflow-y-auto overflow-x-hidden">
                        <div 
                          className="p-6 break-words font-sans text-sm" 
                          dangerouslySetInnerHTML={{ __html: content ? sanitizePreviewHtml(content) : EMPTY_PREVIEW_HTML }} 
                        />
                      </div>
                   </div>
                 </div>
              </section>
           </div>
        </div>
      )}
    </AdminLayoutWrapper>
  );
}
