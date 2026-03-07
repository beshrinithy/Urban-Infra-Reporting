"use client";

import React, { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Lock, FileText, CheckCircle, Clock, Activity, LogOut, ChevronDown, ChevronRight, ShieldCheck, History, Loader2 } from "lucide-react";

type ReportHistory = {
    id: number;
    oldStatus: string;
    newStatus: string;
    createdAt: string;
};

type Report = {
    id: number;
    title: string;
    description: string;
    category: string;
    severity: string;
    status: string;
    department: string | null;
    createdAt: string;
    traceId?: string;
};

export default function AuditorDashboard() {
    const router = useRouter();

    const [authChecked, setAuthChecked] = useState(false);
    const [userName, setUserName] = useState<string>("Auditor");
    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, inProgress: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // Audit Trail State
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
    const [historyData, setHistoryData] = useState<Record<number, ReportHistory[]>>({});
    const [historyLoading, setHistoryLoading] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "AUDITOR") {
            router.replace("/login");
            return;
        }

        setUserName(localStorage.getItem("userName") || "Auditor");
        setAuthChecked(true);
        fetchReports(token);
    }, [router]);

    const fetchReports = async (token: string) => {
        try {
            setIsLoading(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${API_URL}/api/reports?limit=100`, {
                headers: { "Authorization": "Bearer " + token }
            });

            if (!res.ok) throw new Error("API Failed");

            const json = await res.json();
            const data: Report[] = json.data ?? json;

            setReports(data || []);

            const total = data.length;
            const resolved = data.filter((r: Report) => r.status === "Resolved").length;
            const pending = data.filter((r: Report) => r.status === "Pending").length;
            const inProgress = total - resolved - pending;

            setStats({ total, resolved, pending, inProgress });
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleRow = async (reportId: number) => {
        const isExpanded = !!expandedRows[reportId];
        setExpandedRows((prev: Record<number, boolean>) => ({ ...prev, [reportId]: !isExpanded }));

        if (!isExpanded && !historyData[reportId]) {
            fetchHistory(reportId);
        }
    };

    const fetchHistory = async (reportId: number) => {
        setHistoryLoading((prev: Record<number, boolean>) => ({ ...prev, [reportId]: true }));
        try {
            const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${API_URL}/api/reports/${reportId}/history`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (res.ok) {
                const data = await res.json();
                setHistoryData((prev: Record<number, ReportHistory[]>) => ({ ...prev, [reportId]: data.history }));
            }
        } catch (err) {
            console.error("Failed to fetch history for", reportId, err);
        } finally {
            setHistoryLoading((prev: Record<number, boolean>) => ({ ...prev, [reportId]: false }));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        localStorage.removeItem("admin_user");
        document.cookie = "admin_token=; path=/; max-age=0; SameSite=Lax";
        window.location.href = "/login";
    };

    const getStatusColor = (status: string) => {
        if (status === "Resolved") return "text-emerald-400";
        if (status === "In Progress") return "text-indigo-400";
        return "text-amber-400";
    };

    const getStatusDot = (status: string) => {
        if (status === "Resolved") return "bg-emerald-400";
        if (status === "In Progress") return "bg-indigo-400";
        return "bg-amber-400";
    };

    const getSeverityStyle = (severity: string) => {
        if (severity === "Critical") return "bg-red-500/10 text-red-400 border-red-500/20";
        if (severity === "High") return "bg-orange-500/10 text-orange-400 border-orange-500/20";
        if (severity === "Medium") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    };

    if (!authChecked) return null;

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 font-sans text-slate-200">
            {/* GLASS HEADER */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/70 border-b border-white/10 shadow-lg px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-300">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
                        <Lock className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            Auditor View
                            <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider border border-indigo-500/30">
                                🔒 Read Only Access
                            </span>
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">System Integrity &amp; Compliance Monitoring</p>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl shadow-inner">
                        <ShieldCheck size={14} className="text-indigo-400" />
                        <div className="text-xs">
                            <p className="font-bold text-slate-200 leading-none">{userName}</p>
                            <p className="text-indigo-400 font-semibold uppercase tracking-wider text-[10px] mt-0.5">Auditor</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-slate-300 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-xl border border-slate-700 hover:border-red-500/30 transition-all font-semibold text-sm shadow-sm"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Sign Out</span>
                    </button>
                </div>
            </header>

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* HEADLINE STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Reports */}
                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-5 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-70"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Reports</p>
                                <h3 className="text-3xl font-black text-white">{stats.total}</h3>
                            </div>
                            <div className="p-2.5 bg-slate-700 rounded-xl text-blue-400">
                                <FileText size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Resolved */}
                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-5 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500 opacity-70"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Resolved</p>
                                <h3 className="text-3xl font-black text-white">{stats.resolved}</h3>
                            </div>
                            <div className="p-2.5 bg-slate-700 rounded-xl text-emerald-400">
                                <CheckCircle size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Pending */}
                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-5 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500 opacity-70"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending</p>
                                <h3 className="text-3xl font-black text-white">{stats.pending}</h3>
                            </div>
                            <div className="p-2.5 bg-slate-700 rounded-xl text-orange-400">
                                <Clock size={20} />
                            </div>
                        </div>
                    </div>

                    {/* In Progress */}
                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-5 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-fuchsia-500 opacity-70"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">In Progress</p>
                                <h3 className="text-3xl font-black text-white">{stats.inProgress}</h3>
                            </div>
                            <div className="p-2.5 bg-slate-700 rounded-xl text-purple-400">
                                <Activity size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* READ-ONLY MASTER TABLE */}
                <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <History className="text-indigo-400" size={20} />
                            <h3 className="font-bold text-lg text-white">Full Incident Registry &amp; Audit Trail</h3>
                        </div>
                        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                            Immutable Ledger View
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                            <p className="text-slate-400 font-medium animate-pulse">Synchronizing audit records...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <Lock size={40} className="mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium text-slate-300">No records found</p>
                            <p className="text-sm mt-1">The system registry is currently empty.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-900/50 border-b border-slate-700">
                                    <tr>
                                        <th className="px-4 py-4 font-semibold w-10"></th>
                                        <th className="px-4 py-4 font-semibold">ID</th>
                                        <th className="px-4 py-4 font-semibold">Title</th>
                                        <th className="px-4 py-4 font-semibold">Category / Dept</th>
                                        <th className="px-4 py-4 font-semibold">Severity</th>
                                        <th className="px-4 py-4 font-semibold">Status</th>
                                        <th className="px-4 py-4 font-semibold">Logged Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {reports.map((r: Report) => (
                                        <Fragment key={r.id}>
                                            <tr
                                                className={"hover:bg-slate-700/30 transition cursor-pointer " + (expandedRows[r.id] ? "bg-slate-700/20" : "")}
                                                onClick={() => toggleRow(r.id)}
                                            >
                                                <td className="px-4 py-4 text-slate-500">
                                                    {expandedRows[r.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                </td>
                                                <td className="px-4 py-4 font-mono text-slate-400 text-xs">#{r.id}</td>
                                                <td className="px-4 py-4 font-semibold text-slate-200">
                                                    {r.title}
                                                    {r.traceId && <div className="text-[10px] font-mono text-indigo-400 mt-1 uppercase">TRC: {r.traceId}</div>}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="font-semibold text-slate-300">{r.category}</div>
                                                    <div className="text-xs text-slate-500 mt-1">{r.department || "Unassigned"}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={"px-2.5 py-1 rounded-full text-xs font-bold border " + getSeverityStyle(r.severity)}>
                                                        {r.severity || "Normal"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={"flex items-center gap-1.5 font-medium " + getStatusColor(r.status)}>
                                                        <div className={"w-1.5 h-1.5 rounded-full " + getStatusDot(r.status)}></div>
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-slate-400 whitespace-nowrap text-xs">
                                                    {new Date(r.createdAt).toLocaleString()}
                                                </td>
                                            </tr>

                                            {/* EXPANDED AUDIT TRAIL ROW */}
                                            {expandedRows[r.id] && (
                                                <tr className="bg-slate-900/40 border-b border-slate-700">
                                                    <td colSpan={7} className="px-0 py-0">
                                                        <div className="p-6 border-l-4 border-indigo-500 ml-12 my-4 bg-slate-800/50 rounded-r-xl shadow-inner mr-8">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h4 className="font-bold text-slate-300 text-sm flex items-center gap-2">
                                                                    <History size={16} className="text-indigo-400" />
                                                                    Internal Status History Log
                                                                </h4>
                                                                {r.traceId && (
                                                                    <span className="text-xs font-mono text-indigo-400/70 border border-indigo-500/20 px-2 py-0.5 rounded">
                                                                        Trace: {r.traceId}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {historyLoading[r.id] ? (
                                                                <div className="flex items-center gap-3 text-slate-400 text-sm py-2">
                                                                    <Loader2 className="animate-spin" size={16} /> Fetching logs...
                                                                </div>
                                                            ) : !historyData[r.id] || historyData[r.id].length === 0 ? (
                                                                <div className="text-slate-500 text-sm py-2 italic bg-slate-900/50 px-4 rounded-lg border border-slate-700/50 w-fit">
                                                                    No status changes recorded for this incident yet.
                                                                </div>
                                                            ) : (
                                                                <div className="relative pl-6 space-y-4">
                                                                    <div className="absolute left-[9px] top-2 bottom-2 w-px bg-slate-700"></div>
                                                                    {historyData[r.id].map((log: ReportHistory, idx: number) => (
                                                                        <div key={log.id} className="relative flex items-center gap-4 text-sm" style={{ animationDelay: (idx * 50) + "ms" }}>
                                                                            <div className="absolute -left-[15px] w-3 h-3 rounded-full border-2 border-slate-800 bg-indigo-500"></div>
                                                                            <div className="text-xs font-mono text-slate-500 w-36 shrink-0">
                                                                                {new Date(log.createdAt).toLocaleString(undefined, {
                                                                                    month: "short", day: "numeric",
                                                                                    hour: "2-digit", minute: "2-digit", second: "2-digit"
                                                                                })}
                                                                            </div>
                                                                            <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700 flex-1 max-w-xl">
                                                                                <span className="text-slate-400 line-through decoration-slate-600">{log.oldStatus}</span>
                                                                                <ChevronRight size={14} className="text-slate-600" />
                                                                                <span className={"font-bold " + getStatusColor(log.newStatus)}>
                                                                                    {log.newStatus}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
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
