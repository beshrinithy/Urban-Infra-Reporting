"use client";

import { useEffect, useState, Fragment } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  AlertTriangle, CheckCircle, Clock, MapPin, Activity, Filter, LogOut, Download, Search
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

// Dynamic Map Import to prevent SSR issues
const Map = dynamic(() => import("../components/Map"), {
  loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>,
  ssr: false
});

// TYPES - Defined for future extensibility
type Report = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  image?: string;
};

type HistoryLog = {
  id: number;
  oldStatus: string;
  newStatus: string;
  createdAt: string;
  report: {
    title: string;
  }
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function Dashboard() {
  const router = useRouter();

  // STATE MANAGEMENT
  const [reports, setReports] = useState<Report[]>([]);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  // Dashboard Stats
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    highPriority: 0
  });

  // Filters & Search
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // System Health & Alerts
  const [activeAlerts, setActiveAlerts] = useState<{ type: string, message: string }[]>([]);
  const [health, setHealth] = useState({ db: "Checking...", ai: "Checking..." });
  const [isLoading, setIsLoading] = useState(true);

  // DATA FETCHING
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== "All") params.append("category", categoryFilter);
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/reports?${params.toString()}`);
      if (!res.ok) throw new Error("API Failed");

      const json = await res.json();
      const data: Report[] = Array.isArray(json) ? json : (json.data || []);
      setReports(data || []); // Safety fallback
      calculateStats(data || []);

    } catch (err) {
      console.error("Failed to fetch reports", err);
      // Don't crash, just show empty
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const histRes = await fetch("/api/history");
      if (histRes.ok) {
        setHistory(await histRes.json());
      }
    } catch (e) {
      console.error("History fetch error", e);
    }
  }

  const checkHealth = () => {
    fetch("/api/health")
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(() => setHealth({ db: "Error", ai: "Offline" }));
  };

  const calculateStats = (data: Report[]) => {
    setStats({
      total: data.length,
      resolved: data.filter(r => r.status === "Resolved").length,
      pending: data.filter(r => r.status === "Pending").length,
      highPriority: data.filter(r => r.priority === "High").length
    });
  };

  // INITIALIZATION & SOCKETS
  useEffect(() => {
    // 1. Initial Load
    fetchReports();
    fetchHistory();
    checkHealth();

    // 2. Real-Time Connection (Port 5001 fixed)
    const socket = io("http://10.175.218.222:5005", {
      transports: ["websocket"], // Force websocket for better performance
      reconnectionAttempts: 5
    });

    socket.on("connect", () => console.log("🟢 Socket Connected"));
    socket.on("connect_error", (err) => console.error("🔴 Socket Error:", err));

    socket.on("status_update", (data) => {
      console.log("Real-time update received:", data);
      fetchReports(); // Refresh data immediately
      fetchHistory(); // Update logs

      // Show temporary alert
      setActiveAlerts(prev => [
        { type: 'info', message: `Report #${data.reportId} updated to ${data.newStatus}` },
        ...prev
      ]);
      setTimeout(() => {
        setActiveAlerts(prev => prev.filter(a => !a.message.includes(data.reportId)));
      }, 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, [categoryFilter, statusFilter, searchQuery]); // Re-fetch when filters change


  // ACTIONS
  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
    const res = await fetch(`/api/reports/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status }),
    });

    if (res.status === 401) {
      alert("Session expired. Please log in again.");
      window.location.href = "/login";
      return;
    }

    fetchReports();
    fetchHistory();
  };

  const downloadCSV = () => {
    const headers = ["ID", "Title", "Category", "Priority", "Status", "Date"];
    const rows = reports.map(r => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      r.category,
      r.priority,
      r.status,
      new Date(r.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "urban_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PREPARE CHART DATA
  const categoryData = Object.entries(
    reports.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const statusData = [
    { name: "Pending", value: stats.pending },
    { name: "Resolved", value: stats.resolved },
    { name: "In Progress", value: stats.total - stats.pending - stats.resolved }
  ].filter(d => d.value > 0);


  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* HEADER SECTION */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">City Admin Dashboard</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-500 font-medium">Real-time Urban Infrastructure Grid</p>
            <div className="h-4 w-px bg-slate-300"></div>
            {/* Health Status Indicators */}
            <div className="flex gap-2 text-xs font-bold uppercase tracking-wider">
              <span className={`flex items-center gap-1 ${health.db === 'Connected' ? 'text-emerald-600' : 'text-red-500'}`}>
                <span className={`w-2 h-2 rounded-full ${health.db === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                DB: {health.db}
              </span>
              <span className={`flex items-center gap-1 ${health.ai === 'Online' ? 'text-blue-600' : 'text-orange-500'}`}>
                <span className={`w-2 h-2 rounded-full ${health.ai === 'Online' ? 'bg-blue-500 animate-pulse' : 'bg-orange-500'}`}></span>
                AI: {health.ai}
              </span>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-wrap gap-3">
          <button onClick={downloadCSV} className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition flex items-center gap-2 font-semibold shadow-lg shadow-emerald-600/20">
            <Download size={18} /> Export
          </button>

          {/* SEARCH */}
          <div className="relative">
            <input
              type="text"
              className="bg-white border border-gray-300 text-gray-700 pl-10 pr-4 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none w-64"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>

          {/* FILTERS */}
          <select
            title="Filter by category"
            className="bg-white border border-gray-300 text-gray-700 px-3 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Road">Road</option>
            <option value="Water">Water</option>
            <option value="Electricity">Electricity</option>
            <option value="Garbage">Garbage</option>
            <option value="Other">Other</option>
          </select>

          <select
            title="Filter by status"
            className="bg-white border border-gray-300 text-gray-700 px-3 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <button onClick={fetchReports} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 font-semibold shadow-lg shadow-blue-600/20">
            <Activity size={18} /> Refresh
          </button>

          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition flex items-center gap-2 font-medium"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* ALERTS */}
      {activeAlerts.map((alert, idx) => (
        <div key={idx} className={`mb-6 p-4 rounded-lg border-l-4 flex items-center gap-3 ${alert.type === 'critical' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-blue-50 border-blue-500 text-blue-700'}`}>
          <AlertTriangle size={20} />
          <p className="font-semibold">{alert.message}</p>
        </div>
      ))}
      {activeAlerts.length === 0 && isLoading && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 text-blue-700 flex items-center gap-3">
          <Activity className="animate-spin" size={20} />Loading Data...
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<AlertTriangle className="text-blue-500" />} title="Total Reports" value={stats.total} />
        <StatCard icon={<Clock className="text-yellow-500" />} title="Pending Issues" value={stats.pending} />
        <StatCard icon={<CheckCircle className="text-green-500" />} title="Resolved" value={stats.resolved} />
        <StatCard icon={<AlertTriangle className="text-red-500" />} title="High Priority" value={stats.highPriority} />
      </div>

      {/* MAP */}
      <div className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <MapPin className="text-blue-600" /> Geographic Distribution
        </h3>
        <Map reports={reports} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Issues by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Resolution Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">Live Reports Feed</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="p-4">Priority</th>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.length === 0 && !isLoading && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No reports found matching your criteria.</td></tr>
              )}
              {reports.map((report) => (
                <Fragment key={report.id}>
                  <tr
                    onClick={() => setExpandedRowId(expandedRowId === report.id ? null : report.id)}
                    className={`hover:bg-gray-50 transition cursor-pointer border-l-4 ${expandedRowId === report.id ? 'border-blue-500 bg-blue-50/20' : 'border-transparent'}`}
                  >
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.priority === 'High' ? 'bg-red-100 text-red-700' :
                        report.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                        {report.priority}
                      </span>
                    </td>
                    <td className="p-4 font-medium">{report.title}</td>
                    <td className="p-4 text-gray-600">{report.category}</td>
                    <td className="p-4 text-gray-500 flex items-center gap-1"><MapPin size={14} /> View</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                        report.status === 'Pending' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        title="Update report status"
                        value={report.status}
                        onChange={(e) => updateStatus(report.id, e.target.value)}
                        className="border p-1 rounded text-sm min-w-[100px]"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                  {expandedRowId === report.id && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={6} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-bold text-gray-700 text-sm mb-1">Description:</p>
                            <p className="text-gray-600 text-sm">{report.description}</p>
                          </div>
                          <div>
                            <p className="font-bold text-gray-700 text-sm mb-1">AI Analysis:</p>
                            <div className="text-xs text-gray-500 flex gap-4">
                              <span>Severity: <strong>{report.priority}</strong></span>
                              <span>Category: <strong>{report.category}</strong></span>
                            </div>
                          </div>
                          {report.image && (
                            <div className="col-span-2 mt-2">
                              <p className="font-bold text-gray-700 text-sm mb-2">Attached Evidence:</p>
                              <img src={report.image} alt="Report Evidence" className="h-48 w-auto rounded-lg shadow-sm object-cover" />
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
      </div>

      {/* AUDIT LOGS */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">Audit Trail</h3>
        </div>
        <div className="p-0 overflow-y-auto max-h-60">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 sticky top-0">
              <tr><th className="p-3">Time</th><th className="p-3">Event</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-3">
                    Report <strong>#{log.id}</strong> changed from <span className="text-gray-500">{log.oldStatus}</span> to <span className="font-bold text-blue-600">{log.newStatus}</span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan={2} className="p-4 text-center text-gray-400">No recent activity.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

    </main >
  );
}

function StatCard({ icon, title, value }: { icon: any, title: string, value: number }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
