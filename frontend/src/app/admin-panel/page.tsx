"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertTriangle, CheckCircle, Clock, MapPin, Activity, LogOut, Search, ShieldCheck
} from "lucide-react";
import dynamic from "next/dynamic";
import { io } from "socket.io-client";
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const InfrastructureMap = dynamic(() => import('../components/Map'), { ssr: false });

// COMPONENTS
import StatCard from "./components/StatCard";
import AdminCharts from "./components/AdminCharts";
import IncidentTable from "./components/IncidentTable";

// Dynamic Map Import
const Map = dynamic(() => import("../components/Map"), {
    loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading City Grid...</div>,
    ssr: false
});

// TYPES
type Report = {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    priority: string;
    createdAt: string;
    image?: string;
    confidence?: number;
    aiMetadata?: string;
    latitude?: number;
    longitude?: number;
    severity?: string;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AdminPanel() {
    const router = useRouter();

    // AUTH GUARD — client-side double-check (middleware handles server-side)
    const [authChecked, setAuthChecked] = useState(false);
    const [userName, setUserName] = useState<string>("Admin");
    const [userRole, setUserRole] = useState<string>("ADMIN");
    const [userDept, setUserDept] = useState<string>("");

    useEffect(() => {
        const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
        if (!token) {
            router.replace("/login");
            return;
        }
        setUserName(localStorage.getItem("userName") || "Admin");
        setUserRole(localStorage.getItem("role") || "ADMIN");
        try {
            const userStr = localStorage.getItem("admin_user");
            if (userStr) setUserDept(JSON.parse(userStr).department || "");
        } catch (e) { }
        setAuthChecked(true);
    }, [router]);

    // STATE
    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, highPriority: 0 });

    // Filters
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const [activeAlerts, setActiveAlerts] = useState<{ type: string, message: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Heatmap toggle
    const [heatmapMode, setHeatmapMode] = useState(true);

    // Predicted Hotspots
    type Hotspot = { lat: number; lng: number; totalReports: number; recentReports: number; predictedNextWeek: number; confidence: string; riskLevel: string; latitude?: number; longitude?: number; predictedCount?: number; dominantCategory?: string; historicalTotal?: number; trend?: string };
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);
    const [hotspotsLoading, setHotspotsLoading] = useState(false);

    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReports, setTotalReports] = useState(0);

    // DATA FETCHING
    const fetchReports = async (page = currentPage) => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (categoryFilter !== "All") params.append("category", categoryFilter);
            if (statusFilter !== "All") params.append("status", statusFilter);
            if (searchQuery) params.append("search", searchQuery);
            params.append("page", page.toString());
            params.append("limit", "100");

            const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${API_URL}/api/reports?${params.toString()}`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (!res.ok) throw new Error("API Failed");

            const json = await res.json();
            // Backend now returns { data, total, page, totalPages }
            let data: Report[] = json.data ?? json; // fallback for old API format

            // Client-side Priority Filtering
            if (priorityFilter !== "All") {
                data = data.filter((r: Report) => r.priority === priorityFilter);
            }

            setReports(data || []);
            setTotalPages(json.totalPages ?? 1);
            setTotalReports(json.total ?? data.length);

            // Stats (use the full total from API, not just the current page)
            if (data) {
                setStats({
                    total: json.total ?? data.length,
                    resolved: data.filter((r: Report) => r.status === "Resolved").length,
                    pending: data.filter((r: Report) => r.status === "Pending").length,
                    highPriority: data.filter((r: Report) => r.priority === "High").length
                });
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // INITIALIZATION
    useEffect(() => {
        fetchReports(1); // Reset to page 1 on filter change
        setCurrentPage(1);

        // Socket Connection
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005", { transports: ["websocket"] });

        socket.on("status_update", (data: { reportId: number }) => {
            console.log("Live Update:", data);
            fetchReports();
            setActiveAlerts((prev: { type: string, message: string }[]) => [{ type: 'info', message: `Report #${data.reportId} updated` }, ...prev]);
            setTimeout(() => setActiveAlerts((prev: { type: string, message: string }[]) => prev.slice(0, -1)), 5000);
        });

        // SLA Breach Real-time Alert
        socket.on("sla_breach", (data: { message: string }) => {
            setActiveAlerts((prev: { type: string, message: string }[]) => [
                { type: 'sla', message: data.message },
                ...prev
            ].slice(0, 5)); // max 5 alerts at once
            setTimeout(() => setActiveAlerts((prev: { type: string, message: string }[]) => prev.slice(0, -1)), 10000);
        });

        return () => { socket.disconnect(); };
    }, [categoryFilter, statusFilter, priorityFilter, searchQuery]);

    // Fetch predicted hotspots
    useEffect(() => {
        if (!authChecked) return;
        setHotspotsLoading(true);
        const API = process.env.NEXT_PUBLIC_API_URL || "";
        const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
        fetch(`${API}/api/reports/predict-hotspots`, {
            headers: { "Authorization": "Bearer " + token }
        })
            .then(r => r.json())
            .then(data => {
                const preds = data.predictions || data.hotspots || [];
                setHotspots(preds);
            })
            .catch(() => setHotspots([]))
            .finally(() => setHotspotsLoading(false));
    }, [authChecked]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        fetchReports(newPage);
    };

    // ACTIONS
    const updateStatus = async (id: number, status: string) => {
        await fetch(`/api/reports/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("admin_token") || localStorage.getItem("token")}` },
            body: JSON.stringify({ status }),
        });
        fetchReports();
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        localStorage.removeItem("admin_user");
        // Clear the cookie so middleware stops protecting
        document.cookie = "admin_token=; path=/; max-age=0; SameSite=Lax";
        window.location.href = "/login";
    };

    // STAT CARD CLICK HANDLER
    const handleStatClick = (type: string) => {
        // Reset all first
        setCategoryFilter("All");
        setStatusFilter("All");
        setPriorityFilter("All");

        switch (type) {
            case "Resolved Cases":
                setStatusFilter("Resolved");
                break;
            case "Pending Resolution":
                setStatusFilter("Pending");
                break;
            case "Critical Priority":
                setPriorityFilter("High");
                break;
            case "Total Incidents":
            default:
                break;
        }
    };

    const categoryData = Object.entries(reports.reduce((acc: { [key: string]: number }, curr: Report) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
    }, {})).map(([name, value]) => ({ name, value: Number(value) }));

    const statusData = [
        { name: "Pending", value: stats.pending },
        { name: "Resolved", value: stats.resolved },
        { name: "In Progress", value: stats.total - stats.pending - stats.resolved }
    ].filter(d => d.value > 0);

    // NEW: Analytics Aggregation

    // 1. Confidence Trend (Last 20 reports)
    const confidenceData = reports
        .slice(0, 20)
        .reverse() // Oldest to newest for trend line
        .map((r: Report, i: number) => ({
            name: i.toString(),
            value: r.confidence ? Math.round(r.confidence * 100) : 0
        }));

    // 2. Device Usage (GPU vs CPU)
    const deviceStats = { GPU: 0, CPU: 0 };
    reports.forEach((r: Report) => {
        if (r.aiMetadata) {
            try {
                const meta = JSON.parse(r.aiMetadata);
                if (meta.device?.includes("GPU")) deviceStats.GPU++;
                else deviceStats.CPU++;
            } catch (e) { }
        } else {
            // Assume CPU if no metadata (or pre-migration)
            deviceStats.CPU++;
        }
    });

    const deviceData = [
        { name: "GPU Accelerated", value: deviceStats.GPU },
        { name: "CPU Fallback", value: deviceStats.CPU }
    ].filter(d => d.value > 0);

    // Don't render until auth is confirmed to avoid flash of content
    if (!authChecked) return null;

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 font-sans text-slate-800">
            {/* SLA BREACH ALERTS BANNER */}
            {activeAlerts.length > 0 && (
                <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm">
                    {activeAlerts.map((a: { type: string, message: string }, i: number) => (
                        <div key={i} className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold animate-in slide-in-from-right-2 duration-300 ${a.type === 'sla' ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'
                            }`}>
                            {a.message}
                        </div>
                    ))}
                </div>
            )}

            {/* GLASS HEADER */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm px-6 py-4 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/20">
                        <Activity className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                            Urban Command
                        </h1>
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit mt-0.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            LIVE GRID ACTIVE
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    {/* Search Bar */}
                    <div className="relative group hidden md:block">
                        <input
                            type="text" placeholder="Search incidents..."
                            className="pl-10 pr-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-sm w-72 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:bg-white transition-all shadow-sm"
                            value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    </div>

                    {/* Logged-in User Badge */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <ShieldCheck size={14} className="text-indigo-500" />
                        <div className="text-xs">
                            <p className="font-bold text-slate-700 leading-none">{userName}</p>
                            <p className="text-indigo-500 font-semibold">{userRole}</p>
                        </div>
                    </div>
                    {userRole === 'OFFICER' && userDept && (
                        <span className="hidden lg:inline-flex text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200 font-semibold shadow-sm items-center gap-1.5">
                            🏢 {userDept} <span className="text-[10px] font-normal opacity-75 ml-1">— Scoped View</span>
                        </span>
                    )}

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 text-slate-600 bg-white hover:bg-red-50 hover:text-red-600 rounded-xl border border-slate-200 hover:border-red-100 transition-all font-semibold text-sm shadow-sm hover:shadow-md"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* HEADLINE STATS -> CLICKABLE */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard onClick={() => handleStatClick("Total Incidents")} title="Total Incidents" value={stats.total} icon={<Activity size={20} />} color="from-blue-500 to-indigo-600" />
                    <StatCard onClick={() => handleStatClick("Pending Resolution")} title="Pending Resolution" value={stats.pending} icon={<Clock size={20} />} color="from-amber-400 to-orange-500" />
                    <StatCard onClick={() => handleStatClick("Resolved Cases")} title="Resolved Cases" value={stats.resolved} icon={<CheckCircle size={20} />} color="from-emerald-400 to-green-600" />
                    <StatCard onClick={() => handleStatClick("Critical Priority")} title="Critical Priority" value={stats.highPriority} icon={<AlertTriangle size={20} />} color="from-red-500 to-rose-600" />
                </div>

                <div className="mt-8 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-indigo-400 font-bold text-lg">Live Issue Heatmap</h2>
                        <div className="flex gap-1 bg-white/80 rounded-xl p-1 border border-slate-200">
                            <button onClick={() => setHeatmapMode(true)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${heatmapMode ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}>
                                🔥 Heatmap
                            </button>
                            <button onClick={() => setHeatmapMode(false)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${!heatmapMode ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}>
                                📍 Markers
                            </button>
                        </div>
                    </div>
                    {heatmapMode ? (
                        <InfrastructureMap reports={reports} showHeatmap={true} showHotspots={true} />
                    ) : (
                        <MapContainer center={[20, 78]} zoom={5} style={{ height: '450px', borderRadius: '12px' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="© OpenStreetMap contributors"
                            />
                            {reports.filter((r: Report) => r.latitude && r.longitude).map((r: Report) => (
                                <CircleMarker
                                    key={r.id}
                                    center={[r.latitude!, r.longitude!]}
                                    radius={8}
                                    fillColor={r.severity === 'Critical' ? '#ef4444' : r.severity === 'High' ? '#f97316' : r.severity === 'Medium' ? '#eab308' : '#22c55e'}
                                    color="transparent"
                                    fillOpacity={0.8}
                                >
                                    <Popup>
                                        <strong>{r.title}</strong><br />
                                        Category: {r.category}<br />
                                        Status: {r.status}<br />
                                        Severity: {r.severity}
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    )}
                    <a
                        href={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-indigo-400 to-indigo-600 text-white rounded-lg font-semibold text-sm shadow-md hover:scale-105 transition-transform no-underline"
                    >
                        📊 Open Grafana Analytics Dashboard
                    </a>
                </div>

                {/* VISUALIZATION GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* MAP - Large Area */}
                    <div className="lg:col-span-8 bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-sm border border-white/50 flex flex-col h-[500px]">
                        <div className="p-4 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <MapPin className="text-indigo-500" size={18} />
                                Live Infrastructure Map
                            </h3>
                            <button className="text-xs font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition">Expand View</button>
                        </div>
                        <div className="flex-1 rounded-xl overflow-hidden border border-slate-100 relative">
                            <Map reports={reports} />
                            {/* Overlay Gradient for better integration */}
                            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]"></div>
                        </div>
                    </div>

                    {/* CHARTS - Side Panel */}
                    <AdminCharts
                        statusData={statusData}
                        categoryData={categoryData}
                        confidenceData={confidenceData}
                        deviceData={deviceData}
                        COLORS={COLORS}
                    />
                </div>

                {/* FEED TABLE */}
                <IncidentTable
                    reports={reports}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    updateStatus={updateStatus}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalReports={totalReports}
                    onPageChange={handlePageChange}
                />

                {/* 🔮 AI PREDICTIVE HOTSPOT ANALYSIS */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                        <span className="text-xl">🔮</span>
                        <div>
                            <h3 className="font-bold text-slate-800">AI Predictive Hotspot Analysis</h3>
                            <p className="text-xs text-slate-500">Areas predicted to have issues next week based on historical patterns</p>
                        </div>
                    </div>
                    {hotspotsLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : hotspots.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">
                            Insufficient location data for prediction
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-slate-500 uppercase tracking-wider bg-slate-50/50">
                                        <th className="px-5 py-3">Location</th>
                                        <th className="px-4 py-3">Risk Level</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Total Reports</th>
                                        <th className="px-4 py-3">Predicted Next Week</th>
                                        <th className="px-4 py-3">Confidence</th>
                                        <th className="px-4 py-3">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {hotspots.slice(0, 10).map((h: Hotspot, i: number) => {
                                        const risk = h.riskLevel || 'LOW';
                                        const riskColor = risk === 'HIGH' || risk === 'High' ? 'bg-red-100 text-red-700 border-red-200'
                                            : risk === 'MEDIUM' || risk === 'Medium' ? 'bg-orange-100 text-orange-700 border-orange-200'
                                                : 'bg-yellow-100 text-yellow-700 border-yellow-200';
                                        const lat = h.latitude || h.lat;
                                        const lng = h.longitude || h.lng;
                                        const predicted = h.predictedCount || h.predictedNextWeek || 0;
                                        const total = h.historicalTotal || h.totalReports || 0;
                                        const conf = h.confidence;
                                        return (
                                            <tr key={i} className="hover:bg-slate-50/50 transition">
                                                <td className="px-5 py-3 text-xs font-mono text-slate-600">
                                                    {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${riskColor}`}>
                                                        {risk}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-600">
                                                    {h.dominantCategory || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-700">{total}</td>
                                                <td className="px-4 py-3 text-sm font-bold text-indigo-600">{predicted}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Number(conf) * 100}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-600">{Math.round(Number(conf) * 100)}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    <span className={`font-semibold ${h.trend === 'increasing' ? 'text-red-500' : h.trend === 'decreasing' ? 'text-green-500' : 'text-slate-400'}`}>
                                                        {h.trend === 'increasing' ? '📈 Rising' : h.trend === 'decreasing' ? '📉 Falling' : '→ Stable'}
                                                    </span>
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
        </main >
    );
}
