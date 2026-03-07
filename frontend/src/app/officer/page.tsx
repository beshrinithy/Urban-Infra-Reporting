"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    AlertTriangle, CheckCircle, Clock, Activity, LogOut, Search,
    Briefcase, ArrowRight, Filter, RefreshCw
} from "lucide-react";
import { io } from "socket.io-client";

type Report = {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    priority: string;
    severity?: string;
    createdAt: string;
    upvotes?: number;
    traceId?: string;
    assignedDepartment?: string;
};

const STATUS_OPTIONS = ["Pending", "In Progress", "Processing", "Resolved"];
const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    Pending: { bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-400", dot: "bg-amber-400" },
    "In Progress": { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400", dot: "bg-blue-400" },
    Processing: { bg: "bg-purple-500/10 border-purple-500/30", text: "text-purple-400", dot: "bg-purple-400" },
    Resolved: { bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400" },
};
const SEV_COLORS: Record<string, string> = {
    Critical: "text-red-400", High: "text-orange-400", Moderate: "text-yellow-400", Low: "text-green-400"
};

export default function OfficerDashboard() {
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);
    const [userName, setUserName] = useState("Officer");
    const [department, setDepartment] = useState("");
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    // Auth guard — OFFICER only
    useEffect(() => {
        const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
        const stored = localStorage.getItem("admin_user");
        if (!token || !stored) { router.replace("/login?redirect=/officer"); return; }
        try {
            const user = JSON.parse(stored);
            if (user.userRole !== "OFFICER") { router.replace("/login"); return; }
            setUserName(user.email?.split("@")[0] || "Officer");
            setDepartment(user.department || "General");
            setAuthChecked(true);
        } catch { router.replace("/login"); }
    }, [router]);

    // Fetch reports filtered by officer's department
    const fetchReports = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
            const stored = localStorage.getItem("admin_user");
            const user = stored ? JSON.parse(stored) : {};
            const dept = user.department || "";

            const API = process.env.NEXT_PUBLIC_API_URL || "";
            // Pass department as query param + auth header (backend also filters by token's dept)
            const params = new URLSearchParams({ limit: "200" });
            if (dept) params.append("department", dept);

            const res = await fetch(`${API}/api/reports?${params.toString()}`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (!res.ok) throw new Error("Failed");
            const json = await res.json();
            const data: Report[] = json.data ?? json;
            setReports(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Init + Socket.io real-time listener
    useEffect(() => {
        if (!authChecked) return;
        fetchReports();

        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";
        const socket = io(API, { transports: ["websocket"] });

        socket.on("statusUpdate", () => fetchReports());
        socket.on("report_updated", () => fetchReports());
        socket.on("status_update", () => fetchReports());

        return () => { socket.disconnect(); };
    }, [authChecked, fetchReports]);

    // Update status via PATCH
    const updateStatus = async (id: number, newStatus: string) => {
        setUpdatingId(id);
        try {
            const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
            await fetch(`/api/reports/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ status: newStatus })
            });
            setToast(`Report #${id} → ${newStatus}`);
            setTimeout(() => setToast(null), 3000);
            fetchReports();
        } catch (err) {
            console.error("Update failed:", err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleLogout = () => {
        ["admin_token", "token", "role", "userName", "admin_user"].forEach(k => localStorage.removeItem(k));
        document.cookie = "admin_token=; path=/; max-age=0; SameSite=Lax";
        window.location.href = "/login";
    };

    // Filtered view
    const filtered = reports.filter(r => {
        if (statusFilter !== "All" && r.status !== statusFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
        }
        return true;
    });

    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === "Pending").length,
        resolved: reports.filter(r => r.status === "Resolved").length,
    };

    if (!authChecked) return null;

    return (
        <main className="min-h-screen bg-[linear-gradient(160deg,#0f172a_0%,#1e293b_50%,#0f172a_100%)] font-sans text-white">
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-4 right-4 z-[200] px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-2xl animate-in slide-in-from-right duration-300">
                    ✅ {toast}
                </div>
            )}

            {/* ── HEADER ── */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                            <Briefcase className="text-white" size={22} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Officer Dashboard</h1>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-indigo-400 font-semibold">🏢 {department}</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-slate-400">{userName}</span>
                                <span className="relative flex h-2 w-2 ml-1">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-white/10 hover:border-red-500/30 transition-all text-sm font-medium">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                {/* ── STAT CARDS ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Total Assigned", val: stats.total, icon: <Activity size={18} />, grad: "from-indigo-500 to-purple-600" },
                        { label: "Pending", val: stats.pending, icon: <Clock size={18} />, grad: "from-amber-500 to-orange-600" },
                        { label: "Resolved", val: stats.resolved, icon: <CheckCircle size={18} />, grad: "from-emerald-500 to-green-600" },
                    ].map((s, i) => (
                        <div key={i} className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-sm p-5 group hover:border-white/20 transition-all">
                            <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${s.grad}`} />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
                                    <p className="text-4xl font-bold text-white">{s.val}</p>
                                </div>
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${s.grad} opacity-80 shadow-lg`}>
                                    {s.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── FILTERS ── */}
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-3 text-slate-500" size={16} />
                        <input type="text" placeholder="Search reports..."
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none transition" />
                    </div>
                    <div className="flex items-center gap-1 bg-slate-800/60 border border-white/10 rounded-xl p-1">
                        <Filter size={14} className="text-slate-500 ml-2" />
                        {["All", ...STATUS_OPTIONS].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${statusFilter === s ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-slate-400 hover:text-white"}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                    <button title="Refresh reports" onClick={() => fetchReports()} className="p-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition">
                        <RefreshCw size={16} />
                    </button>
                </div>

                {/* ── INCIDENT TABLE ── */}
                <div className="rounded-2xl border border-white/10 bg-slate-800/40 backdrop-blur-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/10">
                        <h2 className="font-bold text-white flex items-center gap-2 text-lg">
                            <Briefcase size={18} className="text-indigo-400" />
                            {department} Department Reports
                            <span className="text-xs text-slate-500 font-normal ml-2">({filtered.length})</span>
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="font-semibold">No reports found</p>
                            <p className="text-xs mt-1">Try changing filters or check back later</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 text-left text-xs text-slate-500 uppercase tracking-wider">
                                        <th className="px-5 py-3">Title</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Severity</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Created</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filtered.map(r => {
                                        const sCfg = STATUS_STYLES[r.status] || STATUS_STYLES.Pending;
                                        return (
                                            <tr key={r.id} className="hover:bg-white/[0.02] transition group">
                                                <td className="px-5 py-3.5">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-white truncate max-w-[250px]">{r.title}</span>
                                                        <span className="text-[11px] text-slate-600 font-mono">#{r.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="bg-slate-700/50 text-slate-300 text-xs px-2.5 py-1 rounded-lg">{r.category}</span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`text-xs font-bold ${SEV_COLORS[r.severity || ""] || "text-slate-400"}`}>
                                                        {r.severity || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${sCfg.bg} ${sCfg.text}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`}></span>
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-xs text-slate-500">
                                                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    {r.status !== "Resolved" ? (
                                                        <select
                                                            title="Update report status"
                                                            value=""
                                                            onChange={e => { if (e.target.value) updateStatus(r.id, e.target.value); }}
                                                            disabled={updatingId === r.id}
                                                            className="bg-slate-700 border border-white/10 text-white text-xs rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-indigo-500/30 outline-none cursor-pointer disabled:opacity-50"
                                                        >
                                                            <option value="">Update ▾</option>
                                                            {STATUS_OPTIONS.filter(s => s !== r.status).map(s => (
                                                                <option key={s} value={s}>{s}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className="text-emerald-500 text-xs font-semibold">✓ Done</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
