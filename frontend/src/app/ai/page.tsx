"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brain, Zap, AlertTriangle, CheckCircle, BarChart3, Cpu, Activity, ChevronRight } from "lucide-react";

type Report = {
  id: number;
  title: string;
  description?: string;
  category: string;
  severity?: string;
  confidence?: number;
  status: string;
  createdAt: string;
  assignedDepartment?: string;
};

const SEVERITY_COLOR: Record<string, string> = {
  Critical: "text-red-400 bg-red-500/15 border-red-500/30",
  High: "text-orange-400 bg-orange-500/15 border-orange-500/30",
  Moderate: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30",
  Low: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
};

const CATEGORY_ICON: Record<string, string> = {
  Road: "🛣️", Water: "💧", Garbage: "🗑️", Electricity: "⚡",
};

export default function AIPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports?limit=50")
      .then(res => res.json())
      .then(json => {
        // API returns { data: [...] } or plain array
        const arr: Report[] = Array.isArray(json) ? json : (json.data || []);
        // Only show AI-processed reports
        setReports(arr.filter(r => r.category && r.category !== "Unknown"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Derived analytics
  const total = reports.length;
  const avgConfidence = total > 0
    ? Math.round(reports.reduce((s, r) => s + (r.confidence || 0), 0) / total * 100)
    : 0;
  const criticalCount = reports.filter(r => r.severity === "Critical").length;
  const resolvedCount = reports.filter(r => r.status === "Resolved").length;

  const byCategory: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  reports.forEach(r => {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    if (r.severity) bySeverity[r.severity] = (bySeverity[r.severity] || 0) + 1;
  });

  return (
    <main className="min-h-screen font-sans bg-[linear-gradient(160deg,#0f172a_0%,#1e1b4b_50%,#0f172a_100%)]">

      {/* Header */}
      <div className="border-b border-white/8 px-8 py-5 flex items-center justify-between bg-[rgba(15,23,42,0.8)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[linear-gradient(135deg,#6366f1,#3b82f6)]">
            <Brain size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">AI Intelligence Hub</h1>
            <p className="text-slate-500 text-xs">Multimodal AI pipeline analysis</p>
          </div>
        </div>
        <Link href="/" className="text-slate-400 hover:text-white text-sm transition flex items-center gap-1">
          ← Home
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <BarChart3 size={18} />, label: "AI-Processed", value: loading ? "—" : String(total), color: "#6366f1" },
            { icon: <Activity size={18} />, label: "Avg Confidence", value: loading ? "—" : `${avgConfidence}%`, color: "#10b981" },
            { icon: <AlertTriangle size={18} />, label: "Critical", value: loading ? "—" : String(criticalCount), color: "#ef4444" },
            { icon: <CheckCircle size={18} />, label: "Resolved", value: loading ? "—" : String(resolvedCount), color: "#3b82f6" },
          ].map((s, i) => (
            <div key={i} className="p-5 rounded-2xl border border-white/8 flex flex-col gap-2 bg-[rgba(255,255,255,0.04)]">
              <span ref={(el) => { if (el) el.style.color = s.color; }}>{s.icon}</span>
              <span className="text-2xl font-extrabold text-white">{s.value}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wide">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Category + Severity breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-white/8 bg-[rgba(255,255,255,0.04)]">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Cpu size={16} className="text-blue-400" /> Category Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-lg">{CATEGORY_ICON[cat] || "🔧"}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300 font-medium">{cat}</span>
                      <span className="text-slate-500">{count} reports</span>
                    </div>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" ref={(el) => { if (el) el.style.width = total > 0 ? `${(count / total) * 100}%` : "0%"; }} />
                    </div>
                  </div>
                </div>
              ))}
              {Object.keys(byCategory).length === 0 && !loading && (
                <p className="text-slate-500 text-sm">No data yet — submit reports to see AI analysis.</p>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-white/8 bg-[rgba(255,255,255,0.04)]">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Zap size={16} className="text-amber-400" /> Severity Distribution</h2>
            <div className="space-y-3">
              {["Critical", "High", "Moderate", "Low"].map(sev => (
                <div key={sev} className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${SEVERITY_COLOR[sev] || "text-slate-400 bg-slate-800 border-slate-700"}`}>{sev}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden flex-1">
                        <div className="h-full rounded-full transition-all" ref={(el) => {
                          if (el) {
                            el.style.width = total > 0 ? `${((bySeverity[sev] || 0) / total) * 100}%` : "0%";
                            el.style.backgroundColor = sev === "Critical" ? "#ef4444" : sev === "High" ? "#f97316" : sev === "Moderate" ? "#eab308" : "#10b981";
                          }
                        }} />
                      </div>
                      <span className="text-slate-500 text-xs ml-3 shrink-0">{bySeverity[sev] || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent AI-Processed reports table */}
        <div className="rounded-2xl border border-white/8 overflow-hidden bg-[rgba(255,255,255,0.04)]">
          <div className="px-6 py-4 border-b border-white/8 flex justify-between items-center">
            <h2 className="text-white font-bold flex items-center gap-2"><Brain size={16} className="text-purple-400" /> Recent AI Analyses</h2>
            <span className="text-xs text-slate-500">{total} processed</span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Loading AI pipeline data…</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-16 text-center">
              <Brain size={40} className="text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 font-medium mb-2">No AI-processed reports yet</p>
              <p className="text-slate-600 text-sm mb-6">Submit a report to trigger the AI pipeline</p>
              <Link href="/report" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition bg-[linear-gradient(135deg,#6366f1,#3b82f6)]">
                Submit a Report <ChevronRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/6 text-left">
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Title</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Category</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Severity</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Confidence</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.slice(0, 20).map(r => (
                    <tr key={r.id} className="border-b border-white/4 hover:bg-white/3 transition">
                      <td className="px-6 py-3 text-slate-300 font-medium max-w-[200px] truncate">{r.title}</td>
                      <td className="px-4 py-3 text-slate-400">{CATEGORY_ICON[r.category]} {r.category}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${SEVERITY_COLOR[r.severity || ""] || "text-slate-400 bg-slate-800 border-slate-700"}`}>
                          {r.severity || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/8 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" ref={(el) => { if (el) el.style.width = `${(r.confidence || 0) * 100}%`; }} />
                          </div>
                          <span className="text-slate-400 text-xs">{r.confidence ? `${Math.round(r.confidence * 100)}%` : "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.status === "Resolved" ? "bg-emerald-500/15 text-emerald-400" : r.status === "In Progress" ? "bg-blue-500/15 text-blue-400" : "bg-amber-500/15 text-amber-400"}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
