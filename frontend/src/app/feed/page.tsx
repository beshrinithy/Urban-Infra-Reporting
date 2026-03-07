"use client";

import { useEffect, useState } from "react";
import { Search, TrendingUp, Filter } from "lucide-react";
import Leaderboard from "./components/Leaderboard";
import ReportFeed from "./components/ReportFeed";

type Report = {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    createdAt: string;
    image?: string;
    upvotes: number;
    assignedDepartment?: string;
};

const CATEGORY_COLORS: Record<string, string> = {
    All: "bg-slate-700 text-slate-200 border-slate-600",
    Road: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    Water: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    Garbage: "bg-green-500/20 text-green-300 border-green-500/40",
    Electricity: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
};

export default function CommunityFeed() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const fetchReports = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/reports");
            if (!res.ok) throw new Error("Failed to load feed");
            const json = await res.json();
            const reportsArr = Array.isArray(json) ? json : (json.data || []);
            const sorted = reportsArr.sort((a: Report, b: Report) =>
                (b.upvotes || 0) - (a.upvotes || 0) ||
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setReports(sorted);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchReports(); }, []);

    const handleUpvote = async (id: number) => {
        setReports(prev => prev.map(r => r.id === id ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r));
        try {
            await fetch(`/api/reports/${id}/upvote`, { method: "POST" });
        } catch {
            fetchReports();
        }
    };

    const filteredReports = reports.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.description.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "All" || r.category === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <main className="min-h-screen font-sans bg-[linear-gradient(160deg,_#0f172a_0%,_#1e1b4b_40%,_#0f172a_100%)]">

            {/* ─── HEADER ─── */}
            <div className="sticky top-0 z-20 border-b border-white/8 bg-[rgba(15,23,42,0.92)] backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[linear-gradient(135deg,#10b981,#3b82f6)]">
                                <TrendingUp size={16} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">Community Feed</h1>
                                <p className="text-slate-500 text-xs">See what your neighbours are reporting</p>
                            </div>
                            <span className="ml-2 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                {reports.length} reports
                            </span>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {/* Search */}
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search issues..."
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-white/10 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 transition bg-[rgba(255,255,255,0.06)]"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Category filter icon */}
                            <Filter size={14} className="text-slate-500" />
                            <select
                                title="Filter by category"
                                className="text-sm rounded-lg border border-white/10 px-3 py-2 text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/50 transition bg-[rgba(255,255,255,0.06)]"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                {Object.keys(CATEGORY_COLORS).map(cat => (
                                    <option key={cat} value={cat} className="bg-slate-800">{cat === "All" ? "All Categories" : cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Category chips */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                        {Object.keys(CATEGORY_COLORS).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${filter === cat ? CATEGORY_COLORS[cat] + " scale-105" : "bg-transparent text-slate-500 border-white/10 hover:border-white/20"}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── CONTENT ─── */}
            <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <ReportFeed
                    isLoading={isLoading}
                    reports={filteredReports}
                    handleUpvote={handleUpvote}
                />
                <Leaderboard />
            </div>
        </main>
    );
}
