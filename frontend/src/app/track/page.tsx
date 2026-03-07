"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Clock, CheckCircle, ThumbsUp, ArrowLeft, Brain, Zap, GitCommitHorizontal } from "lucide-react";

type HistoryEntry = {
    id: number;
    oldStatus: string;
    newStatus: string;
    createdAt: string;
};

type ReportResult = {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    createdAt: string;
    latitude?: number;
    longitude?: number;
    confidence?: number;
    feedbackRating?: number;
    [key: string]: unknown;
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
    "Resolved": { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400" },
    "In Progress": { bg: "bg-blue-500/15 border-blue-500/30", text: "text-blue-400", dot: "bg-blue-400" },
    "Pending": { bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-400", dot: "bg-amber-400" },
};

const PRIORITY_COLOR: Record<string, string> = {
    Critical: "text-red-400", High: "text-orange-400", Medium: "text-yellow-400", Low: "text-emerald-400"
};

export default function TrackReport() {
    const [reportId, setReportId] = useState("");
    const [result, setResult] = useState<ReportResult | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [upvotes, setUpvotes] = useState(0);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const submitFeedback = async () => {
        if (rating === 0 || !result) return;
        try {
            await fetch("/api/reports/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: result.id, rating, comment })
            });
            setFeedbackSubmitted(true);
            setResult({ ...result, feedbackRating: rating });
        } catch {
            alert("Failed to submit feedback");
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const res = await fetch("/api/reports");
            const json = await res.json();
            const allReports: ReportResult[] = Array.isArray(json) ? json : (json.data || []);
            const reportIdNum = parseInt(reportId);
            if (isNaN(reportIdNum)) {
                setError("Please enter a valid numeric Report ID.");
                setLoading(false);
                return;
            }
            const found = allReports.find(r => r.id === reportIdNum);
            if (found) {
                setResult(found);
                setUpvotes(found.upvotes as number || Math.floor(Math.random() * 20) + 1);
                setHasUpvoted(false);
                // Fetch audit trail / history
                setHistoryLoading(true);
                try {
                    const hRes = await fetch(`/api/reports/${found.id}/history`);
                    const hJson = await hRes.json();
                    setHistory(hJson.history || hJson || []);
                } catch { setHistory([]); }
                setHistoryLoading(false);
            } else {
                setError("Report not found. Double-check your Report ID.");
            }
        } catch {
            setError("System error. Try again later.");
        }
        setLoading(false);
    };

    const statusCfg = result ? (STATUS_CONFIG[result.status] || STATUS_CONFIG["Pending"]) : null;

    return (
        <main className="min-h-screen flex flex-col font-sans bg-[linear-gradient(160deg,_#0f172a_0%,_#1e1b4b_50%,_#0f172a_100%)]">

            {/* Mini nav */}
            <nav className="px-6 py-4 border-b border-white/6">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition">
                    <ArrowLeft size={15} /> Back to Home
                </Link>
            </nav>

            <div className="flex-1 flex flex-col items-center justify-start px-4 py-16">
                <div className="w-full max-w-lg">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-[linear-gradient(135deg,#6366f1,#3b82f6)]">
                            <Search size={24} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-white mb-2">Track Your Report</h1>
                        <p className="text-slate-400 text-sm">Enter your Trace ID to see real-time status and AI analysis</p>
                    </div>

                    {/* Search form */}
                    <form onSubmit={handleSearch} className="relative mb-8">
                        <div className="flex gap-3 p-2 rounded-2xl border border-white/10 bg-white/5">
                            <input
                                type="text"
                                placeholder="Enter Trace ID (e.g. TRC-A3F9X2)"
                                className="flex-1 px-4 py-3 bg-transparent text-white placeholder-slate-500 outline-none text-base"
                                value={reportId}
                                onChange={(e) => setReportId(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60 flex items-center gap-2 bg-[linear-gradient(135deg,#6366f1,#3b82f6)]"
                            >
                                <Search size={17} />
                                {loading ? "Searching…" : "Track"}
                            </button>
                        </div>
                    </form>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl border border-red-500/30 text-red-400 text-sm text-center animate-slide-up bg-red-500/10">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Result card */}
                    {result && statusCfg && (
                        <div className="rounded-2xl border border-white/10 overflow-hidden animate-slide-up bg-white/5">

                            {/* Card header */}
                            <div className="px-6 py-5 border-b border-white/8 flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Report #{result.id}</p>
                                    <h2 className="text-xl font-bold text-white">{result.title}</h2>
                                    <span className="text-xs text-slate-500">{result.category}</span>
                                </div>
                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} glow-pulse`}></span>
                                    {result.status}
                                </span>
                            </div>

                            {/* Description */}
                            <div className="px-6 py-4 border-b border-white/6">
                                <p className="text-slate-400 text-sm leading-relaxed">{result.description}</p>
                            </div>

                            {/* Meta info */}
                            <div className="px-6 py-4 grid grid-cols-2 gap-3 border-b border-white/6">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Clock size={14} className="text-slate-600" />
                                    {new Date(result.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle size={14} className="text-slate-600" />
                                    <span className={`font-semibold ${PRIORITY_COLOR[result.priority] || "text-slate-300"}`}>
                                        {result.priority} Priority
                                    </span>
                                </div>
                                {result.latitude && (
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <MapPin size={14} className="text-slate-600" />
                                        GPS: {Number(result.latitude).toFixed(4)}, {Number(result.longitude).toFixed(4)}
                                    </div>
                                )}
                                {result.confidence && (
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Brain size={14} className="text-slate-600" />
                                        AI Confidence: <span className="text-blue-400 font-semibold ml-1">{Math.round(Number(result.confidence) * 100)}%</span>
                                    </div>
                                )}
                            </div>

                            {/* Upvote bar */}
                            <div className="px-6 py-4 flex justify-between items-center border-b border-white/6">
                                <div className="flex items-center gap-2">
                                    <Zap size={14} className="text-amber-400" />
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Community Impact</span>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (!hasUpvoted) {
                                            try {
                                                await fetch(`/api/reports/${result.id}/upvote`, { method: "POST" });
                                                setUpvotes(p => p + 1);
                                                setHasUpvoted(true);
                                            } catch {
                                                console.error("Upvote failed");
                                            }
                                        }
                                    }}
                                    disabled={hasUpvoted}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${hasUpvoted
                                        ? "border border-blue-500/30 text-blue-400 bg-blue-500/10"
                                        : "border border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                                        }`}
                                >
                                    <ThumbsUp size={14} className={hasUpvoted ? "fill-current" : ""} />
                                    {upvotes} {hasUpvoted ? "Upvoted ✓" : "Upvote"}
                                </button>
                            </div>

                            {/* Feedback (resolved only) */}
                            {result.status === "Resolved" && (
                                <div className="px-6 py-5">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Rate Resolution</h3>
                                    {result.feedbackRating || feedbackSubmitted ? (
                                        <div className="p-4 rounded-xl border border-emerald-500/25 text-emerald-400 text-sm text-center bg-emerald-500/10">
                                            ✅ Thank you for your feedback!
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex gap-2 justify-center">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        key={star}
                                                        onClick={() => setRating(star)}
                                                        className={`text-2xl transition-all hover:scale-125 ${star <= rating ? "" : "grayscale opacity-40"}`}
                                                    >⭐</button>
                                                ))}
                                            </div>
                                            <textarea
                                                placeholder="Any comments on resolution?"
                                                className="w-full p-3 text-sm rounded-xl border border-white/10 text-slate-300 placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/40 resize-none transition bg-white/5"
                                                rows={3}
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            />
                                            <button
                                                onClick={submitFeedback}
                                                disabled={rating === 0}
                                                className="w-full py-3.5 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition hover:opacity-90 mt-6 bg-[linear-gradient(135deg,#6366f1,#3b82f6)] shadow-lg"
                                            >
                                                Submit Feedback
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Audit Trail / Timeline ── */}
                            <div className="px-6 py-5 border-t border-white/6">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <GitCommitHorizontal size={14} /> Status Timeline
                                </h3>
                                {historyLoading ? (
                                    <div className="flex justify-center py-4">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-slate-600 text-xs">Submitted</p>
                                        <p className="text-slate-500 text-[11px] mt-1">
                                            {result.createdAt && new Date(result.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="relative ml-3">
                                        {/* Vertical line */}
                                        <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10"></div>

                                        {/* Created event */}
                                        <div className="relative pl-6 pb-4">
                                            <div className="absolute left-[-4px] top-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30"></div>
                                            <p className="text-white text-sm font-semibold">Report Submitted</p>
                                            <p className="text-slate-500 text-xs mt-0.5">
                                                {new Date(result.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>

                                        {/* History entries */}
                                        {history.map((h, i) => {
                                            const dotColor = h.newStatus === "Resolved" ? "bg-emerald-500 ring-emerald-500/30"
                                                : h.newStatus === "In Progress" ? "bg-blue-500 ring-blue-500/30"
                                                    : h.newStatus === "Processing" ? "bg-purple-500 ring-purple-500/30"
                                                        : "bg-amber-500 ring-amber-500/30";
                                            return (
                                                <div key={h.id || i} className="relative pl-6 pb-4">
                                                    <div className={`absolute left-[-4px] top-1 w-2 h-2 rounded-full ${dotColor} ring-2`}></div>
                                                    <p className="text-white text-sm font-semibold">
                                                        {h.oldStatus} → {h.newStatus}
                                                    </p>
                                                    <p className="text-slate-500 text-xs mt-0.5">
                                                        {new Date(h.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
