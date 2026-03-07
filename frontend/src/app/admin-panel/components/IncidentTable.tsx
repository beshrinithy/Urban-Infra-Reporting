import { Fragment, useState, useEffect } from "react";
import { CheckCircle, Filter, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import AssignOfficerDropdown from "./AssignOfficerDropdown";

interface Report {
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
    traceId?: string;
    assignedDepartment?: string;
    department?: string;
    slaDeadline?: string;
    assignedOfficerId?: number | null;
    aiExplainability?: {
        textModel?: number;
        imageModel?: number | null;
        fusedScore?: number;
        device?: string;
        latencyMs?: number;
        fusionMethod?: string;
    };
}

interface HistoryEntry {
    id: number;
    reportId: number;
    oldStatus: string;
    newStatus: string;
    createdAt: string;
}

interface IncidentTableProps {
    reports: Report[];
    categoryFilter: string;
    setCategoryFilter: (val: string) => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    updateStatus?: (id: number, status: string) => void;
    currentPage: number;
    totalPages: number;
    totalReports: number;
    onPageChange: (page: number) => void;
    readOnly?: boolean;
}

export default function IncidentTable({
    reports,
    categoryFilter, setCategoryFilter,
    statusFilter, setStatusFilter,
    updateStatus,
    currentPage, totalPages, totalReports, onPageChange,
    readOnly = false
}: IncidentTableProps) {
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [historyMap, setHistoryMap] = useState<Record<number, HistoryEntry[]>>({});
    const [loadingHistory, setLoadingHistory] = useState<number | null>(null);

    // Fetch history when a row is expanded
    useEffect(() => {
        if (expandedRowId === null) return;
        if (historyMap[expandedRowId] !== undefined) return; // already fetched

        let cancelled = false;
        setLoadingHistory(expandedRowId);
        fetch(`/api/reports/${expandedRowId}/history`)
            .then(r => r.json())
            .then(data => {
                if (!cancelled) {
                    setHistoryMap(prev => ({ ...prev, [expandedRowId]: data }));
                    setLoadingHistory(null);
                }
            })
            .catch(err => {
                if (!cancelled) {
                    console.error("History fetch error:", err);
                    setLoadingHistory(null);
                }
            });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expandedRowId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Resolved': return 'text-emerald-600';
            case 'In Progress': return 'text-blue-600';
            case 'Pending': return 'text-amber-600';
            default: return 'text-slate-500';
        }
    };

    return (
        <>
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Filter size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Incident Feed</h3>
                            <p className="text-xs text-slate-400">{totalReports} total reports</p>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <select
                            aria-label="Filter by Category"
                            className="flex-1 md:w-40 bg-slate-50 border border-slate-200 rounded-xl text-sm px-4 py-2 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-600 cursor-pointer"
                            value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                            <option value="All">🚀 All Categories</option>
                            <option value="Road">🛣️ Road</option>
                            <option value="Water">💧 Water</option>
                            <option value="Electricity">⚡ Electricity</option>
                            <option value="Garbage">🗑️ Garbage</option>
                        </select>
                        <select
                            aria-label="Filter by Status"
                            className="flex-1 md:w-40 bg-slate-50 border border-slate-200 rounded-xl text-sm px-4 py-2 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-600 cursor-pointer"
                            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="All">📊 All Status</option>
                            <option value="Pending">⏳ Pending</option>
                            <option value="In Progress">🔄 In Progress</option>
                            <option value="Resolved">✅ Resolved</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="p-4 pl-6">Severity</th>
                                <th className="p-4">Incident Details</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Confidence</th>
                                <th className="p-4">Department / SLA</th>
                                <th className="p-4">Created</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reports.map(report => (
                                <Fragment key={report.id}>
                                    <tr
                                        className={`group transition-all duration-200 cursor-pointer ${expandedRowId === report.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                                        onClick={() => setExpandedRowId(expandedRowId === report.id ? null : report.id)}
                                    >
                                        <td className="p-4 pl-6">
                                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit border ${report.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                                                report.priority === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                    'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${report.priority === 'High' ? 'bg-red-500' :
                                                    report.priority === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'
                                                    }`}></span>
                                                {report.priority}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{report.title}</p>
                                            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{report.description}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-sm">
                                                    {report.category}
                                                </span>
                                                {report.aiMetadata && (
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                        {JSON.parse(report.aiMetadata).device?.split(' ')[0] || 'AI'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {report.confidence ? (
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${report.confidence >= 0.8 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    report.confidence >= 0.5 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-red-50 text-red-600 border-red-100'
                                                    }`}>
                                                    {(report.confidence * 100).toFixed(0)}%
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-semibold text-slate-700">
                                                    {report.assignedDepartment || report.department || "Unassigned"}
                                                </span>
                                                {report.slaDeadline && (
                                                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border w-fit ${new Date(report.slaDeadline) < new Date() ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        }`}>
                                                        {new Date(report.slaDeadline) < new Date() ? '⚠️ OVERDUE' : '✅ On Track'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-500 text-xs font-medium">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${report.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {report.status === 'Resolved' && <CheckCircle size={12} />}
                                                {report.status}
                                            </div>
                                        </td>
                                        <td className="p-4" onClick={e => e.stopPropagation()}>
                                            {!readOnly && updateStatus ? (
                                                <select
                                                    aria-label="Update Status"
                                                    value={report.status}
                                                    onChange={(e) => updateStatus(report.id, e.target.value)}
                                                    className="bg-white border border-slate-200 rounded-lg text-xs p-1.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition shadow-sm font-medium"
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Resolved">Resolved</option>
                                                </select>
                                            ) : (
                                                <span className="text-xs font-semibold text-slate-500 px-2 py-1 bg-slate-100 rounded-md border border-slate-200">
                                                    Read Only
                                                </span>
                                            )}
                                        </td>
                                    </tr>

                                    {/* EXPANDED ROW — Description + History + Image */}
                                    {expandedRowId === report.id && (
                                        <tr className="bg-indigo-50/30">
                                            <td colSpan={8} className="p-0">
                                                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-indigo-100/50 mx-4 border-l-4 border-l-indigo-500 rounded-r-xl bg-white/50 backdrop-blur-sm shadow-inner my-2">

                                                    {/* Column 1: Description + Trace ID */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-2">
                                                            <Filter size={14} /> Full Description
                                                        </h4>
                                                        <p className="text-sm text-slate-700 leading-relaxed p-3 bg-white rounded-xl border border-indigo-50 shadow-sm">
                                                            {report.description}
                                                        </p>
                                                        {report.traceId && (
                                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono bg-slate-50 p-1.5 rounded border border-slate-100 w-fit">
                                                                <span>🔍 Trace ID:</span>
                                                                <span className="text-slate-500">{report.traceId}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Column 2: Status History */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-2">
                                                            <Clock size={14} /> Status History
                                                        </h4>
                                                        {loadingHistory === report.id ? (
                                                            <div className="text-xs text-slate-400 animate-pulse p-3">Loading history...</div>
                                                        ) : (historyMap[report.id] ?? []).length === 0 ? (
                                                            <div className="text-xs text-slate-400 italic p-3 bg-white rounded-xl border border-slate-100">
                                                                No status changes recorded yet.
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {(historyMap[report.id] ?? []).map((entry, idx) => (
                                                                    <div key={entry.id} className="flex items-start gap-3 text-xs">
                                                                        {/* Timeline dot */}
                                                                        <div className="flex flex-col items-center gap-1 mt-1">
                                                                            <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                                                                            {idx < (historyMap[report.id].length - 1) && (
                                                                                <div className="w-px h-4 bg-indigo-100" />
                                                                            )}
                                                                        </div>
                                                                        <div className="bg-white rounded-lg px-3 py-2 border border-slate-100 shadow-sm flex-1">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className={`font-semibold ${getStatusColor(entry.oldStatus)}`}>{entry.oldStatus}</span>
                                                                                <span className="text-slate-400">→</span>
                                                                                <span className={`font-semibold ${getStatusColor(entry.newStatus)}`}>{entry.newStatus}</span>
                                                                            </div>
                                                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                                                {new Date(entry.createdAt).toLocaleString()}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Column 3: Evidence Image */}
                                                    {report.image && (
                                                        <div className="space-y-2">
                                                            <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-2">
                                                                <MapPin size={14} /> Evidence
                                                            </h4>
                                                            <div className="h-40 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img src={report.image} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt="Report Evidence" />
                                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                                                                    <button
                                                                        onClick={() => setSelectedImage(report.image || null)}
                                                                        className="text-white text-xs font-bold border border-white px-3 py-1 rounded-full hover:bg-white hover:text-black transition"
                                                                    >
                                                                        View Full
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* AI Explainability Panel */}
                                                {report.aiExplainability && (
                                                    <div className="mt-4 mx-4 mb-2 p-4 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-xl border border-indigo-100">
                                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            🧠 AI Explainability
                                                        </p>
                                                        <div className="space-y-3">
                                                            {/* Text Model Bar */}
                                                            <div>
                                                                <div className="flex justify-between text-xs text-slate-600 mb-1">
                                                                    <span>📝 Text Model</span>
                                                                    <span className="font-mono font-semibold">{((report.aiExplainability.textModel ?? 0) * 100).toFixed(1)}% → {report.category}</span>
                                                                </div>
                                                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                                                    <div
                                                                        className="bg-blue-500 h-2 rounded-full transition-all duration-700"
                                                                        ref={(el) => { if (el) el.style.width = `${(report.aiExplainability?.textModel ?? 0) * 100}%`; }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Image Model Bar */}
                                                            {report.aiExplainability.imageModel != null && (
                                                                <div>
                                                                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                                                                        <span>🖼️ Image Model</span>
                                                                        <span className="font-mono font-semibold">{(report.aiExplainability.imageModel * 100).toFixed(1)}% → {report.category}</span>
                                                                    </div>
                                                                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                                                        <div
                                                                            className="bg-purple-500 h-2 rounded-full transition-all duration-700"
                                                                            ref={(el) => { if (el) el.style.width = `${(report.aiExplainability?.imageModel ?? 0) * 100}%`; }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Fused Confidence */}
                                                            <div>
                                                                <div className="flex justify-between text-xs text-slate-600 mb-1">
                                                                    <span>⚡ Fused Confidence</span>
                                                                    <span className="font-mono font-semibold">{((report.confidence ?? 0) * 100).toFixed(1)}%</span>
                                                                </div>
                                                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                                                    <div
                                                                        className={`h-2 rounded-full transition-all duration-700 ${(report.confidence ?? 0) > 0.8 ? 'bg-emerald-500' :
                                                                            (report.confidence ?? 0) > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                                                                            }`}
                                                                        ref={(el) => { if (el) el.style.width = `${(report.confidence ?? 0) * 100}%`; }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Device + Latency */}
                                                            <div className="flex gap-4 text-xs text-slate-400 mt-1 pt-2 border-t border-slate-100">
                                                                <span>🖥️ {report.aiExplainability.device ?? 'CPU'}</span>
                                                                <span>⏱️ {report.aiExplainability.latencyMs ?? '—'}ms</span>
                                                                <span>🔗 {report.aiExplainability.fusionMethod ?? 'weighted_average'}</span>
                                                                {!report.aiExplainability.imageModel && (
                                                                    <span className="text-amber-500 font-medium">⚠️ Text-only (no image)</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Officer Assignment (Admin only, non-readOnly) */}
                                                {!readOnly && (
                                                    <div className="mx-4 mb-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                        <AssignOfficerDropdown
                                                            reportId={report.id}
                                                            currentOfficerId={report.assignedOfficerId}
                                                            onAssign={() => { }}
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            Page <span className="font-bold text-slate-700">{currentPage}</span> of{" "}
                            <span className="font-bold text-slate-700">{totalPages}</span>
                            {" "}· {totalReports} total reports
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                                aria-label="Previous page"
                                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {/* Page number buttons (show up to 5 around current page) */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                                const page = start + i;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => onPageChange(page)}
                                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${page === currentPage
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                            : 'border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                aria-label="Next page"
                                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* FULLSCREEN IMAGE LIGHTBOX */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={selectedImage}
                            className="w-full h-full object-contain rounded-lg shadow-2xl"
                            alt="Full Evidence"
                        />
                        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                            Click anywhere to close
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
