"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, FileText, CheckCircle, Clock, Plus, ExternalLink, Star } from "lucide-react";
import Link from "next/link";
import { io } from "socket.io-client";
import { API_URL, SOCKET_URL } from '../../lib/config';

type Report = {
    id: number;
    title: string;
    category: string;
    severity: string;
    status: string;
    createdAt: string;
    feedbackRating: number | null;
};

export default function CitizenDashboard() {
    const router = useRouter();

    const [authChecked, setAuthChecked] = useState(false);
    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState("Citizen");

    // Rating State
    const [ratingReportId, setRatingReportId] = useState<number | null>(null);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const userStr = localStorage.getItem('admin_user');
        if (!token || !userStr) {
            router.replace('/login?redirect=/citizen');
            return;
        }
        try {
            const user = JSON.parse(userStr);
            if (user.userRole !== 'CITIZEN') {
                router.replace('/login');
                return;
            }
            setUserName(user.email?.split('@')[0] || 'Citizen');
            setAuthChecked(true);
        } catch {
            router.replace('/login');
        }

        setAuthChecked(true);
        fetchMyReports(token);

        // Real-time updates
        const socket = io(SOCKET_URL);
        socket.on("report_updated", () => fetchMyReports(token));
        socket.on("report_assigned", () => fetchMyReports(token));
        return () => { socket.disconnect(); };
    }, [router]);

    const fetchMyReports = async (token: string) => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API_URL}/api/reports/my-reports`, {
                headers: { "Authorization": "Bearer " + token }
            });

            if (!res.ok) throw new Error("API Failed");

            const json = await res.json();
            const data: Report[] = json.data || json.reports || [];

            setReports(data);

            setStats({
                total: data.length,
                resolved: data.filter(r => r.status === "Resolved").length,
                pending: data.filter(r => r.status !== "Resolved").length,
            });
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const submitRating = async (reportId: number) => {
        if (selectedRating === 0) return;
        setIsSubmittingRating(true);
        try {
            const token = localStorage.getItem("token") || localStorage.getItem("admin_token") || "";
            const res = await fetch(`${API_URL}/api/reports/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ reportId, rating: selectedRating })
            });

            if (res.ok) {
                // Instantly update UI without waiting for refetch
                setReports(prev => prev.map(r => r.id === reportId ? { ...r, feedbackRating: selectedRating } : r));
                setRatingReportId(null);
                setSelectedRating(0);
                setHoverRating(0);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to submit rating");
        } finally {
            setIsSubmittingRating(false);
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

    const getStatusStyle = (status: string) => {
        if (status === "Resolved") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        if (status === "In Progress") return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    };

    if (!authChecked) return null;

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 font-sans text-slate-200">
            {/* HEADER */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/70 border-b border-white/10 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-300">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">Welcome back, {userName}!</h1>
                        <p className="text-[13px] text-slate-400 font-medium">Here are your submitted reports.</p>
                    </div>
                </div>

                <div className="flex gap-3 text-sm">
                    <Link
                        href="/report"
                        className="flex items-center gap-2 px-4 py-2 bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] hover:opacity-90 rounded-xl text-white transition-all font-semibold shadow-[0_4px_14px_rgba(99,102,241,0.25)]"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Submit New Report</span>
                        <span className="sm:hidden">New</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-slate-300 bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition font-medium"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Sign Out</span>
                    </button>
                </div>
            </header>

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* 3 STAT CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Reports */}
                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-5 rounded-2xl flex justify-between items-center relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-70"></div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-1">My Total Reports</p>
                            <h3 className="text-3xl font-black text-white">{stats.total}</h3>
                        </div>
                        <div className="p-3 bg-slate-700/50 rounded-xl text-blue-400 border border-slate-600">
                            <FileText size={24} />
                        </div>
                    </div>

                    {/* Pending Reports */}
                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-5 rounded-2xl flex justify-between items-center relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500 opacity-70"></div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-1">My Pending</p>
                            <h3 className="text-3xl font-black text-white">{stats.pending}</h3>
                        </div>
                        <div className="p-3 bg-slate-700/50 rounded-xl text-orange-400 border border-slate-600">
                            <Clock size={24} />
                        </div>
                    </div>

                    {/* Resolved Reports */}
                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-5 rounded-2xl flex justify-between items-center relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500 opacity-70"></div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-1">My Resolved</p>
                            <h3 className="text-3xl font-black text-white">{stats.resolved}</h3>
                        </div>
                        <div className="p-3 bg-slate-700/50 rounded-xl text-emerald-400 border border-slate-600">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                </div>

                {/* MY REPORTS TABLE */}
                <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                    <div className="px-6 py-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                        <h3 className="font-bold text-lg text-white">Issue History</h3>
                    </div>

                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="font-medium animate-pulse">Loading your reports...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-slate-700/30 rounded-full flex items-center justify-center mb-4 border border-slate-600">
                                <FileText size={40} className="text-slate-500/50" />
                            </div>
                            <p className="text-lg font-medium text-slate-300">No reports found.</p>
                            <p className="text-sm mt-1 mb-6">You haven't submitted any reports yet.</p>
                            <Link href="/report" className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition flex items-center gap-2">
                                <Plus size={18} /> Submit your first report
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="bg-slate-900/50 border-b border-slate-700 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Title</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Logged Date</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {reports.map((report) => (
                                        <tr key={report.id} className="hover:bg-slate-700/30 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-200">{report.title}</div>
                                                <div className="text-xs font-mono text-slate-500 mt-1">ID: #{report.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-300 font-medium">{report.category}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border uppercase ${getStatusStyle(report.status)}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-xs">
                                                {new Date(report.createdAt).toLocaleString(undefined, {
                                                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3 flex-wrap">
                                                    {/* Rating Component */}
                                                    {report.status === "Resolved" && (
                                                        <div className="mr-2">
                                                            {report.feedbackRating ? (
                                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-bold" title={`Rated ${report.feedbackRating} Stars`}>
                                                                    <div className="flex gap-0.5">
                                                                        {[...Array(report.feedbackRating)].map((_, i) => <Star key={i} size={12} className="fill-amber-400" />)}
                                                                    </div>
                                                                    {report.feedbackRating}.0
                                                                </div>
                                                            ) : ratingReportId === report.id ? (
                                                                <div className="flex items-center gap-2 bg-slate-900 border border-amber-500/30 px-3 py-1.5 rounded-lg shadow-inner">
                                                                    <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                                            <Star
                                                                                key={star}
                                                                                size={16}
                                                                                className={`cursor-pointer transition-transform ${star <= (hoverRating || selectedRating) ? "text-amber-400 fill-amber-400" : "text-slate-600"} hover:scale-110`}
                                                                                onMouseEnter={() => setHoverRating(star)}
                                                                                onClick={() => setSelectedRating(star)}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    {selectedRating > 0 && (
                                                                        <button
                                                                            onClick={() => submitRating(report.id)}
                                                                            disabled={isSubmittingRating}
                                                                            className="ml-2 bg-[linear-gradient(135deg,#059669,#10b981)] hover:opacity-90 text-white text-[10px] uppercase tracking-wider px-3 py-1 rounded-md font-bold transition shadow-sm"
                                                                        >
                                                                            {isSubmittingRating ? "..." : "Rate"}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setRatingReportId(report.id)}
                                                                    className="text-[11px] font-bold uppercase tracking-wider text-amber-400 hover:text-white bg-amber-400/10 hover:bg-amber-500 px-3 py-1.5 rounded-lg border border-amber-400/20 transition-all flex items-center gap-1.5"
                                                                >
                                                                    <Star size={13} className="fill-amber-400/50" /> Rate service
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Track Button */}
                                                    <Link
                                                        href={`/track?id=${report.id}`}
                                                        className="inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition shadow-sm"
                                                    >
                                                        Track <ExternalLink size={13} />
                                                    </Link>
                                                </div>
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
