"use client";

import { useEffect, useState } from "react";
import {
    Server,
    Cpu,
    Activity,
    Clock,
    Database,
    ShieldCheck
} from "lucide-react";

interface SystemHealth {
    aiStatus: string;
    textModel: {
        version: string;
        accuracy: number;
        description: string;
    };
    severityModel: {
        version: string;
        accuracy: number;
        description: string;
    };
    fusionWeights: {
        text: number;
        image: number;
    };
    inferenceMode: string;
    avgPipelineLatency: number;
    queueStatus: string;
    lastProcessed: string | null;
    environment: string;
    queue?: {
        type: string;
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
    };
}

export default function SystemPage() {
    const [data, setData] = useState<SystemHealth | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("http://10.175.218.222:5005/api/reports/system");
                if (!res.ok) throw new Error("Failed to fetch system data");
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !data) {
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
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Administrative Control Panel</h1>
                    <p className="text-slate-600">System health monitoring and AI engine status</p>
                </div>

                {/* Section 1: System Health */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-md">
                    <h2 className="text-xl font-semibold text-slate-900 mb-6 tracking-tight">System Health</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-blue-50/30 to-white">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-blue-100 p-2.5 rounded-lg">
                                    <Server size={20} className="text-blue-600" />
                                </div>
                                <span className="text-sm font-semibold text-slate-700">AI Service</span>
                            </div>
                            <div className="text-xl font-bold text-green-600">{data.aiStatus}</div>
                        </div>
                        <div className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-purple-50/30 to-white">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-purple-100 p-2.5 rounded-lg">
                                    <Activity size={20} className="text-purple-600" />
                                </div>
                                <span className="text-sm font-semibold text-slate-700">Processing Queue</span>
                            </div>
                            <div className="text-xl font-bold text-green-600">{data.queueStatus}</div>
                        </div>
                        <div className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-orange-50/30 to-white">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-orange-100 p-2.5 rounded-lg">
                                    <Cpu size={20} className="text-orange-600" />
                                </div>
                                <span className="text-sm font-semibold text-slate-700">Server Mode</span>
                            </div>
                            <div className="text-xl font-bold text-slate-900">{data.inferenceMode}</div>
                        </div>
                        <div className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-slate-50 to-white">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-slate-100 p-2.5 rounded-lg">
                                    <Clock size={20} className="text-slate-600" />
                                </div>
                                <span className="text-sm font-semibold text-slate-700">Last Updated</span>
                            </div>
                            <div className="text-sm font-semibold text-slate-900">
                                {data.lastProcessed ? new Date(data.lastProcessed).toLocaleTimeString() : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 1.5: Queue Stats */}
                {data.queue && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-md">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
                            ⚙️ Job Queue ({data.queue.type})
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                                { label: 'Waiting', value: data.queue.waiting, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
                                { label: 'Active', value: data.queue.active, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                                { label: 'Completed', value: data.queue.completed, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                                { label: 'Failed', value: data.queue.failed, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                                { label: 'Delayed', value: data.queue.delayed, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
                            ].map(item => (
                                <div key={item.label} className={`${item.bg} rounded-xl p-4 text-center border ${item.border} hover:shadow-md transition-all duration-300`}>
                                    <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                                    <p className="text-xs font-medium text-slate-500 mt-1">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section 2: AI Engine Information */}
                <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">AI Engine Information</h2>

                    {/* Text Classification Engine */}
                    <div className="border border-slate-200 rounded-lg p-5 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Database size={20} className="text-blue-600" />
                            <h3 className="text-lg font-semibold text-slate-900">Text Classification Engine</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Model:</span>
                                <span className="font-medium text-slate-900">{data.textModel.description}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Version:</span>
                                <span className="font-mono font-medium text-slate-900">{data.textModel.version}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Validation Accuracy:</span>
                                <span className="font-bold text-green-600">{data.textModel.accuracy}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Severity Assessment Engine */}
                    <div className="border border-slate-200 rounded-lg p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck size={20} className="text-orange-600" />
                            <h3 className="text-lg font-semibold text-slate-900">Severity Assessment Engine</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Model:</span>
                                <span className="font-medium text-slate-900">{data.severityModel.description}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Version:</span>
                                <span className="font-mono font-medium text-slate-900">{data.severityModel.version}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Validation Accuracy:</span>
                                <span className="font-bold text-green-600">{data.severityModel.accuracy}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Performance Metrics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="text-xs text-slate-600 mb-1">Average Pipeline Latency</div>
                                <div className="text-2xl font-bold text-slate-900">{data.avgPipelineLatency}ms</div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="text-xs text-slate-600 mb-1">Fusion Weights</div>
                                <div className="text-sm font-medium text-slate-900">
                                    Text: {data.fusionWeights.text * 100}% / Image: {data.fusionWeights.image * 100}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
