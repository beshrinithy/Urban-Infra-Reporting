"use client";

import { Activity, MapPin, Eye } from "lucide-react";

interface FeatureTabsProps {
    activeTab: 'ai' | 'location' | 'transparency';
    setActiveTab: (tab: 'ai' | 'location' | 'transparency') => void;
}

export default function FeatureTabs({ activeTab, setActiveTab }: FeatureTabsProps) {
    return (
        <div className="container mx-auto px-6 -mt-16 relative z-10">
            {/* Tab Headers */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`flex-1 p-6 rounded-xl border-2 transition-all ${activeTab === 'ai'
                        ? 'bg-purple-500 border-purple-500 text-white shadow-lg'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300'
                        }`}
                >
                    <Activity className={`mx-auto mb-2 ${activeTab === 'ai' ? 'text-white' : 'text-purple-500'}`} size={32} />
                    <h3 className="font-bold">AI Powered</h3>
                </button>
                <button
                    onClick={() => setActiveTab('location')}
                    className={`flex-1 p-6 rounded-xl border-2 transition-all ${activeTab === 'location'
                        ? 'bg-blue-500 border-blue-500 text-white shadow-lg'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                        }`}
                >
                    <MapPin className={`mx-auto mb-2 ${activeTab === 'location' ? 'text-white' : 'text-blue-500'}`} size={32} />
                    <h3 className="font-bold">Location Aware</h3>
                </button>
                <button
                    onClick={() => setActiveTab('transparency')}
                    className={`flex-1 p-6 rounded-xl border-2 transition-all ${activeTab === 'transparency'
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                        }`}
                >
                    <Eye className={`mx-auto mb-2 ${activeTab === 'transparency' ? 'text-white' : 'text-emerald-500'}`} size={32} />
                    <h3 className="font-bold">Transparency</h3>
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                {activeTab === 'ai' && (
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">🧠 AI-Powered Intelligence</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <h4 className="font-semibold text-purple-900 mb-2">Text Classification</h4>
                                <p className="text-sm text-slate-600">93% accuracy on 500 samples</p>
                                <p className="text-xs text-slate-500 mt-1">TF-IDF + Logistic Regression</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <h4 className="font-semibold text-purple-900 mb-2">Severity Prediction</h4>
                                <p className="text-sm text-slate-600">88% accuracy (Hybrid ML)</p>
                                <p className="text-xs text-slate-500 mt-1">Critical keyword override</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <h4 className="font-semibold text-purple-900 mb-2">Duplicate Detection</h4>
                                <p className="text-sm text-slate-600">Cosine similarity ≥80%</p>
                                <p className="text-xs text-slate-500 mt-1">Prevents redundant work</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <h4 className="font-semibold text-purple-900 mb-2">Multimodal Fusion</h4>
                                <p className="text-sm text-slate-600">Text + Image analysis</p>
                                <p className="text-xs text-slate-500 mt-1">Weighted fusion (60% image, 40% text)</p>
                            </div>
                        </div>
                        <div className="mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg p-4">
                            <p className="font-semibold">⚡ Lightning Fast: ~88ms average processing time</p>
                        </div>
                    </div>
                )}

                {activeTab === 'location' && (
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">📍 Location Intelligence</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-2">Auto GPS Tagging</h4>
                                <p className="text-sm text-slate-600">Automatically captures precise coordinates</p>
                                <p className="text-xs text-slate-500 mt-1">Latitude, Longitude for every report</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-2">Hotspot Analysis</h4>
                                <p className="text-sm text-slate-600">Identifies problem areas</p>
                                <p className="text-xs text-slate-500 mt-1">Geographic clustering of issues</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-2">Department Routing</h4>
                                <p className="text-sm text-slate-600">Location-based assignment</p>
                                <p className="text-xs text-slate-500 mt-1">Nearest team gets the task</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-2">Map Visualization</h4>
                                <p className="text-sm text-slate-600">See all issues on map</p>
                                <p className="text-xs text-slate-500 mt-1">Color-coded by severity</p>
                            </div>
                        </div>
                        <div className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg p-4">
                            <p className="font-semibold">🗺️ Every report is geotagged for precise resolution</p>
                        </div>
                    </div>
                )}

                {activeTab === 'transparency' && (
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">👁️ Full Transparency</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                                <h4 className="font-semibold text-emerald-900 mb-2">Real-time Status</h4>
                                <p className="text-sm text-slate-600">Track your report live</p>
                                <p className="text-xs text-slate-500 mt-1">Pending → In Progress → Resolved</p>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                                <h4 className="font-semibold text-emerald-900 mb-2">AI Confidence Score</h4>
                                <p className="text-sm text-slate-600">See how confident AI is</p>
                                <p className="text-xs text-slate-500 mt-1">0-100% transparency</p>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                                <h4 className="font-semibold text-emerald-900 mb-2">Trace ID</h4>
                                <p className="text-sm text-slate-600">Unique identifier for each report</p>
                                <p className="text-xs text-slate-500 mt-1">Track and reference easily</p>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                                <h4 className="font-semibold text-emerald-900 mb-2">Public Dashboard</h4>
                                <p className="text-sm text-slate-600">All reports visible to citizens</p>
                                <p className="text-xs text-slate-500 mt-1">Accountability guaranteed</p>
                            </div>
                        </div>
                        <div className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg p-4">
                            <p className="font-semibold">✓ Complete visibility into every step of the process</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
