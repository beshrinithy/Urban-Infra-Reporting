"use client";

import { useState, useEffect } from "react";
import { Filter, Calendar, MapPin } from "lucide-react";

type SeverityFilter = "All" | "Critical" | "High" | "Moderate" | "Low";
type CategoryFilter = "All" | "Roads" | "Water" | "Electricity" | "Sanitation" | "Parks" | "Streetlights" | "Drainage" | "Other";
type StatusFilter = "All" | "Pending" | "In Progress" | "Resolved";

interface Report {
    id: number;
    description: string;
    category: string;
    severity: string;
    status: string;
    confidence: number;
    location: string;
    createdAt: string;
    traceId: string | null;
    isDuplicate: boolean;
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("All");
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";
            const response = await fetch(`${API_URL}/api/reports`);
            const data = await response.json();
            // API returns { data: [...], total, page, totalPages }
            setReports(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(report => {
        if (severityFilter !== "All" && report.severity !== severityFilter) return false;
        if (categoryFilter !== "All" && report.category !== categoryFilter) return false;
        if (statusFilter !== "All" && report.status !== statusFilter) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent">
            <div className="container mx-auto px-6 py-8 animate-slide-up">
                {/* Professional Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">City Issue Monitoring Panel</h1>
                    <p className="text-slate-600">Real-time tracking and management of civic infrastructure complaints</p>
                </div>

                {/* Impact Overview - 4 Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* ... stats ... */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Registered</div>
                        <div className="text-4xl font-bold text-slate-900 mb-1">{reports.length}</div>
                        <div className="text-xs text-slate-500">Complaints</div>
                    </div>
                    {/* ... other stats ... */}
                </div>


                {/* Smart Filters */}
                <div className="sticky top-4 z-20 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/80 p-6 mb-6 shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <Filter size={18} className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Smart Filters</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 block">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                title="Filter by status"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                        </div>

                        {/* Severity Filter */}
                        <div>
                            <label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 block">
                                Severity
                            </label>
                            <select
                                value={severityFilter}
                                onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                title="Filter by severity"
                            >
                                <option value="All">All Severities</option>
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 block">
                                Category
                            </label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                title="Filter by category"
                            >
                                <option value="All">All Categories</option>
                                <option value="Roads">Roads</option>
                                <option value="Water">Water</option>
                                <option value="Electricity">Electricity</option>
                                <option value="Sanitation">Sanitation</option>
                                <option value="Parks">Parks</option>
                                <option value="Streetlights">Streetlights</option>
                                <option value="Drainage">Drainage</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Results Count */}
                        <div className="flex items-end">
                            <div className="bg-slate-50 rounded-lg px-4 py-2 border border-slate-200 w-full">
                                <div className="text-xs text-slate-500">Showing Results</div>
                                <div className="text-lg font-bold text-slate-900">{filteredReports.length} / {reports.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reports Grid */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-slate-900 mb-5 tracking-tight">Complaint Records</h3>
                    {filteredReports.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            No reports match the selected filters
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredReports.map((report) => (
                                <ReportCard key={report.id} report={report} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ReportCard({ report }: { report: Report }) {
    const confidencePercent = Math.round(report.confidence * 100);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
            case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Resolved': return 'bg-green-100 text-green-700 border-green-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Pending': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white group">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                            #{report.traceId ? report.traceId.slice(0, 8) : 'N/A'}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${getSeverityColor(report.severity)}`}>
                            {report.severity}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${getStatusColor(report.status)}`}>
                            {report.status}
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full border bg-purple-50 text-purple-700 border-purple-200 font-semibold">
                            {report.category}
                        </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-3 leading-relaxed">{report.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400" />
                            <span>{report.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar size={12} className="text-slate-400" />
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-slate-400 ml-auto">
                            AI Confidence: <span className="font-mono font-semibold text-blue-600">{confidencePercent}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
