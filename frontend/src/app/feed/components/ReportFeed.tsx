import { AlertCircle, ThumbsUp, Loader2 } from "lucide-react";

interface Report {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    image?: string;
    createdAt: string;
    upvotes: number;
    assignedDepartment?: string;
}

interface ReportFeedProps {
    isLoading: boolean;
    reports: Report[];
    handleUpvote: (id: number) => void;
}

export default function ReportFeed({ isLoading, reports, handleUpvote }: ReportFeedProps) {
    return (
        <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
                <div className="flex justify-center py-20 text-slate-400">
                    <Loader2 className="animate-spin" size={40} />
                </div>
            ) : (
                reports.map(report => (
                    <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <div className={`p-3 rounded-xl bg-slate-50 text-slate-600`}>
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-800">{report.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">{report.category}</span>
                                            <span>•</span>
                                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${report.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {report.status}
                                </div>
                            </div>

                            <p className="text-slate-600 leading-relaxed mb-4">{report.description}</p>

                            {report.image && (
                                <div className="mb-4 h-64 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={report.image} alt="Report Evidence" className="w-full h-full object-cover" />
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleUpvote(report.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition active:scale-95"
                                    >
                                        <ThumbsUp size={18} className={report.upvotes ? "fill-blue-600" : ""} />
                                        <span>{report.upvotes || 0} Upvotes</span>
                                    </button>
                                    <div className="text-sm text-slate-400">
                                        Assigned to: <span className="font-medium text-slate-600">{report.assignedDepartment || "General"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
