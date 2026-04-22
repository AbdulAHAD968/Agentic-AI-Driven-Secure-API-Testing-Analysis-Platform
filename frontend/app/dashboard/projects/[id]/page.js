"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, Shield, ShieldAlert, ChevronLeft, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true
});

export default function ProjectReportPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const res = await api.get(`/projects/${id}/report`);
      setData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch report", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-terracotta animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div className="min-h-screen bg-parchment flex items-center justify-center">Report not found.</div>;
  }

  const { project, vulnerabilities } = data;

  const filteredVulnerabilities = filter === "All" 
    ? vulnerabilities 
    : vulnerabilities.filter(v => v.severity === filter);

  const severityColors = {
    Critical: "text-red-600 bg-red-50",
    High: "text-orange-600 bg-orange-50",
    Medium: "text-amber-600 bg-amber-50",
    Low: "text-blue-600 bg-blue-50",
    Info: "text-stone-600 bg-stone-50",
  };

  return (
    <div className="flex flex-col min-h-screen bg-parchment">
      <Header />
      <main className="flex-grow py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-stone-gray hover:text-near-black transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Dashboard
            </button>
            <div className="flex items-center gap-3 bg-ivory border border-border-cream rounded-xl px-4 py-2 shadow-whisper">
              <span className="text-xs font-mono opacity-60">Severity Filter:</span>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none cursor-pointer"
              >
                <option value="All">All Findings</option>
                <option value="Critical">Critical Only</option>
                <option value="High">High Only</option>
                <option value="Medium">Medium Only</option>
                <option value="Low">Low Only</option>
              </select>
            </div>
          </div>

          <header className="mb-12 border-b border-border-cream pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-4xl font-serif text-near-black mb-2">{project.name}</h1>
                <p className="text-stone-gray">{project.description}</p>
              </div>
              <div className="bg-ivory border border-border-cream rounded-2xl p-4 flex gap-8 items-center shadow-whisper">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-mono opacity-60 mb-1">Status</p>
                  <div className="flex items-center gap-1.5 text-green-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </div>
                </div>
                <div className="w-px h-8 bg-border-cream" />
                <div className="text-center">
                  <p className="text-[10px] uppercase font-mono opacity-60 mb-1">Total Findings</p>
                  <p className="text-xl font-serif text-near-black">{vulnerabilities.length}</p>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-8">
            {filteredVulnerabilities.length === 0 ? (
              <div className="bg-ivory border border-border-cream rounded-[32px] p-12 text-center shadow-whisper">
                <Shield className="w-16 h-16 text-green-500 mx-auto mb-6 opacity-40" />
                <h3 className="text-2xl font-serif mb-2">No Vulnerabilities Detected</h3>
                <p className="text-stone-gray">No vulnerabilities match the selected filter or the analysis was clean.</p>
              </div>
            ) : (
              filteredVulnerabilities.map((vuln, i) => (
                <div key={i} className="bg-ivory border border-border-cream rounded-[32px] p-8 shadow-whisper group hover:border-terracotta/30 transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                    <div className="flex-grow">
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${severityColors[vuln.severity] || severityColors.Info}`}>
                          {vuln.severity}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase text-terracotta bg-terracotta/10 px-3 py-1 rounded-full">
                          {vuln.type}
                        </span>
                      </div>
                      <h3 className="text-2xl font-serif text-near-black mb-4">{vuln.title}</h3>
                      <p className="text-near-black leading-relaxed mb-6">{vuln.description}</p>
                    </div>
                    {vuln.severity === 'Critical' || vuln.severity === 'High' ? (
                      <ShieldAlert className="w-12 h-12 text-red-500/20 group-hover:text-red-500/40 transition-colors" />
                    ) : (
                      <AlertTriangle className="w-12 h-12 text-amber-500/20 group-hover:text-amber-500/40 transition-colors" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border-cream/50">
                    <div>
                      <h4 className="text-[10px] uppercase font-mono opacity-60 mb-4 tracking-widest">Recommended Mitigation</h4>
                      <p className="text-stone-gray text-sm italic">"{vuln.mitigation}"</p>
                    </div>
                    <div className="bg-warm-sand/10 rounded-2xl p-6">
                      <h4 className="text-[10px] uppercase font-mono opacity-60 mb-3 tracking-widest">{vuln.type === 'SAST' ? 'Location' : 'Attack Payload'}</h4>
                      <code className="text-xs font-mono text-near-black break-all">
                        {vuln.type === 'SAST' ? vuln.location : vuln.payload}
                      </code>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
