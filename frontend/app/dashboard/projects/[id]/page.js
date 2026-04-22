"use client";

import { useEffect, useState, use } from "react";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { 
  Loader2, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldQuestion, 
  ArrowLeft, 
  RefreshCcw, 
  Trash2,
  Calendar,
  Code,
  FileText,
  AlertTriangle,
  Download,
  Share2,
  CheckCircle
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true
});

export default function ProjectDetailsPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  
  useEffect(() => {
    let interval;
    if (data?.project?.scanStatus === "scanning") {
      interval = setInterval(() => {
        refreshProjectData();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [data]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}/report`);
      setData(res.data.data);
    } catch (err) {
      toast.error("Failed to load project details");
      router.push("/dashboard/projects");
    } finally {
      setLoading(false);
    }
  };

  const refreshProjectData = async () => {
    try {
      const res = await api.get(`/projects/${id}/report`);
      setData(res.data.data);
    } catch (err) {
      console.error("Polling error:", err);
    }
  };

  const handleScan = async () => {
    try {
      setScanning(true);
      const res = await api.post(`/projects/${id}/scan`);
      toast.success(res.data.message || "Scan started in background");
      refreshProjectData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleDelete = () => {
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/projects/${id}`);
      toast.success("Project deleted successfully");
      router.push("/dashboard/projects");
    } catch (err) {
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const handleExportJSON = () => {
    const reportData = {
      project: data.project,
      vulnerabilities: data.vulnerabilities,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Security_Report_${project.name.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-stone-gray bg-stone-50 border-stone-200";
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col min-h-screen bg-parchment">
          <Header />
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-terracotta animate-spin" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const { project, vulnerabilities } = data;

  
  const groupedVulns = vulnerabilities.reduce((acc, v) => {
    const sev = v.severity.toLowerCase();
    if (!acc[sev]) acc[sev] = [];
    acc[sev].push(v);
    return acc;
  }, {});

  const severityOrder = ["critical", "high", "medium", "low", "info"];

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-parchment">
        <Header />
        
        <main className="flex-grow py-12 px-6">
          <div className="max-w-6xl mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 no-print">
              <div>
                <Link 
                  href="/dashboard/projects" 
                  className="inline-flex items-center text-stone-gray hover:text-terracotta transition-colors text-sm font-mono uppercase tracking-widest mb-4 group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Projects
                </Link>
                <h1 className="text-4xl font-serif text-near-black mb-2">{project.name}</h1>
                <p className="text-stone-gray max-w-2xl">{project.description}</p>
              </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center px-4 py-3 border border-border-cream bg-ivory text-near-black rounded-xl hover:bg-warm-sand/20 transition-all shadow-sm group/print"
                    title="Generate PDF Report"
                  >
                    <Download className="w-4 h-4 mr-2 text-terracotta group-hover/print:scale-110 transition-transform" />
                    Export PDF
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center px-4 py-3 border border-border-cream bg-ivory text-near-black rounded-xl hover:bg-warm-sand/20 transition-all shadow-sm"
                  >
                    <Share2 className="w-4 h-4 mr-2 text-olive-gray" />
                    JSON
                  </button>
                  <button
                    onClick={handleScan}
                    disabled={scanning}
                    className="flex items-center px-5 py-3 bg-terracotta text-white rounded-xl hover:bg-terracotta/90 transition-all shadow-md disabled:opacity-50"
                  >
                    {scanning ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCcw className="w-4 h-4 mr-2" />
                    )}
                    {scanning ? "Scanning..." : "Re-Run Scan"}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-3 border border-terracotta/20 text-terracotta rounded-xl hover:bg-terracotta/5 transition-all"
                  >
                    {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>
            </div>

            
            <div className="report-container">
              
              <div className="print-only mb-16 border-b-4 border-near-black pb-8">
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-terracotta mb-4">Confidential Security Audit</p>
                <h1 className="text-6xl font-serif text-near-black mb-6">{project.name}</h1>
                <div className="grid grid-cols-2 gap-12 text-sm font-sans">
                  <div>
                    <p className="text-stone-gray uppercase tracking-widest text-[10px] mb-1">Target Description</p>
                    <p className="text-near-black">{project.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-stone-gray uppercase tracking-widest text-[10px] mb-1">Report Generated</p>
                    <p className="text-near-black">{new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>

              
              <section className="mb-12 page-break-after">
                <h2 className="text-2xl font-serif text-near-black mb-6 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-green-600" /> Executive Summary
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="bg-near-black p-8 rounded-[32px] text-ivory col-span-1 lg:col-span-2">
                     <p className="text-xs font-mono text-terracotta uppercase tracking-widest mb-4">Analysis Verdict</p>
                     <p className="text-lg leading-relaxed font-sans opacity-90">
                       The security audit of <span className="text-white font-bold">{project.name}</span> identified <span className="text-terracotta font-bold">{vulnerabilities.length}</span> vulnerabilities. 
                       The current security posture requires <span className="italic underline underline-offset-4">{vulnerabilities.some(v => v.severity.toLowerCase() === 'critical') ? 'immediate administrative intervention' : 'scheduled maintenance'}</span>.
                     </p>
                   </div>
                   <div className="bg-ivory border border-border-cream rounded-[32px] p-8 shadow-whisper flex flex-col justify-center items-center text-center">
                      <p className="text-[10px] font-mono text-stone-gray uppercase tracking-[0.2em] mb-2">Defense Grade</p>
                      <div className="text-6xl font-serif text-near-black mb-2">
                        {vulnerabilities.length === 0 ? "A+" : vulnerabilities.some(v => v.severity.toLowerCase() === 'critical') ? "F" : vulnerabilities.some(v => v.severity.toLowerCase() === 'high') ? "D" : "B"}
                      </div>
                      <p className="text-[9px] font-mono text-terracotta uppercase">Automated Weighted Score</p>
                   </div>
                </div>
              </section>

              
              <section className="mb-16 no-print">
                <div className="bg-warm-sand/10 border border-warm-sand/20 rounded-[32px] p-8">
                   <h3 className="text-sm font-mono text-olive-gray uppercase tracking-widest mb-4">Audit Methodology</h3>
                   <p className="text-xs text-stone-gray leading-relaxed max-w-3xl">
                     This report was generated using Topic AI's proprietary neural scanning engine. The process involved Static Analysis (SAST) of the provided source material, heuristic pattern matching for common OWASP Top 10 vulnerabilities, and AI-driven automated triage to reduce false positives.
                   </p>
                </div>
              </section>

              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-ivory p-6 rounded-3xl border border-border-cream shadow-whisper">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-olive-gray mb-1">Scan Status</p>
                  <p className="font-serif capitalize text-near-black text-lg">{project.scanStatus}</p>
                </div>
                <div className="bg-ivory p-6 rounded-3xl border border-border-cream shadow-whisper">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-olive-gray mb-1">Total Findings</p>
                  <p className="text-3xl font-serif text-near-black">{vulnerabilities.length}</p>
                </div>
                <div className="bg-ivory p-6 rounded-3xl border border-border-cream shadow-whisper">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-olive-gray mb-1">Last Analysis</p>
                  <p className="font-serif text-near-black text-lg">{project.lastScan ? new Date(project.lastScan).toLocaleDateString() : "Pending"}</p>
                </div>
                <div className="bg-ivory p-6 rounded-3xl border border-border-cream shadow-whisper">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-olive-gray mb-1">Risk Density</p>
                  <p className="font-serif text-near-black text-lg">{vulnerabilities.length > 10 ? "High" : vulnerabilities.length > 0 ? "Moderate" : "Secure"}</p>
                </div>
              </div>

              
              <div className="space-y-16">
                {severityOrder.map(severity => {
                  const vulnsInSeverity = groupedVulns[severity] || [];
                  if (vulnsInSeverity.length === 0) return null;

                  return (
                    <section key={severity} className="page-break-before">
                      <div className="flex items-center gap-4 mb-8 border-b border-border-cream pb-4">
                        <h2 className="text-2xl font-serif text-near-black capitalize">{severity} Severity Findings</h2>
                        <span className="px-3 py-0.5 bg-near-black text-ivory text-[10px] font-mono rounded-full">{vulnsInSeverity.length}</span>
                      </div>

                      <div className="space-y-6">
                        {vulnsInSeverity.map((vuln) => (
                          <div 
                            key={vuln._id}
                            className="bg-ivory border border-border-cream rounded-[32px] p-8 shadow-whisper-hover transition-all"
                          >
                            <div className="flex flex-col gap-6">
                              <div className="flex justify-between items-start">
                                <h3 className="text-xl font-serif text-near-black">{vuln.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${getSeverityColor(vuln.severity)}`}>
                                  {vuln.severity}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                  <h4 className="text-[10px] font-mono uppercase text-terracotta mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" /> Technical Analysis
                                  </h4>
                                  <p className="text-stone-gray text-sm leading-relaxed font-sans">{vuln.description}</p>
                                </div>
                                <div className="bg-warm-sand/10 p-6 rounded-2xl border border-warm-sand/20">
                                  <h4 className="text-[10px] font-mono uppercase text-near-black mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-600" /> Recommendation
                                  </h4>
                                  <p className="text-near-black text-sm leading-relaxed font-sans italic opacity-80">{vuln.mitigation}</p>
                                </div>
                              </div>

                              {(vuln.location || vuln.payload) && (
                                <div className="mt-4 pt-6 border-t border-border-cream/30">
                                  <div className="grid grid-cols-1 gap-6">
                                    {vuln.location && (
                                      <div>
                                        <p className="text-[9px] font-mono uppercase text-olive-gray mb-2">Vulnerable Exposure:</p>
                                        <pre className="bg-near-black/5 p-4 rounded-xl text-[11px] font-mono text-near-black border border-near-black/5 overflow-x-auto">
                                          {vuln.location}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>

              
              <section className="mt-24 bt-8 pt-16 border-t-2 border-border-cream page-break-before">
                <div className="bg-near-black rounded-[40px] p-12 text-ivory">
                  <h2 className="text-3xl font-serif mb-8">Remediation Roadmap</h2>
                  <div className="space-y-8">
                    {vulnerabilities.map((v, i) => (
                      <div key={i} className="flex gap-6 items-start animate-in fade-in slide-in-from-left duration-500" style={{ delay: `${i * 100}ms` }}>
                        <div className="w-8 h-8 rounded-full bg-terracotta/20 flex items-center justify-center shrink-0 text-terracotta font-mono text-sm border border-terracotta/10">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-serif text-lg mb-1">{v.title}</h4>
                          <p className="text-sm opacity-60 font-sans leading-relaxed">{v.mitigation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-12 pt-12 border-t border-white/10 flex justify-between items-center text-[10px] font-mono uppercase tracking-widest opacity-40">
                    <p>Topic AI Security Audit Module</p>
                    <p>Internal Tracking ID: {project._id.substring(0, 8)}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        <ConfirmModal 
          isOpen={confirmOpen}
          title="Delete Project"
          message="Are you sure you want to permanently delete this project? All scan history and findings will be cleared."
          onConfirm={executeDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>

      <style jsx global>{`
        @media print {
          nav, header, .no-print, button, .confirm-modal, .lucide-arrow-left {
            display: none !important;
          }
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .max-w-6xl {
            max-width: 100% !important;
            margin: 0 !important;
          }
          .bg-ivory, .bg-parchment, .bg-warm-sand\/10 {
            background: white !important;
            border-color: #eee !important;
            box-shadow: none !important;
          }
           main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .font-serif {
            color: black !important;
          }
          .page-break-before {
            page-break-before: always;
          }
          .page-break-after {
            page-break-after: always;
          }
          .bg-near-black {
            background: #111 !important;
            color: white !important;
          }
          .text-terracotta {
            color: #b91c1c !important;
          }
          .print-only {
            display: block !important;
          }
          section {
            break-inside: avoid;
          }
          pre {
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>
    </ProtectedRoute>
  );
}
