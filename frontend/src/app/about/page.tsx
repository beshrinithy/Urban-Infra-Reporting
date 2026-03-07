import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen py-12 px-4 font-sans bg-[linear-gradient(160deg,#0f172a_0%,#1e1b4b_50%,#0f172a_100%)]">
            <div className="max-w-5xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition">
                    <ArrowLeft size={16} /> Back to Home
                </Link>
                <div className="space-y-8">
                    {/* Hero Section */}
                    <div className="rounded-xl p-8 text-white bg-[linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7)]">
                        <h1 className="text-3xl font-bold mb-3">About CityMind AI</h1>
                        <p className="text-lg text-indigo-100 max-w-3xl">
                            Transforming urban infrastructure management through intelligent automation and machine learning
                        </p>
                    </div>

                    {/* The Problem */}
                    <div className="rounded-xl border border-slate-200 p-8 bg-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-100 p-3 rounded-lg">
                                <span className="text-2xl">🚨</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">The Problem</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="text-3xl font-bold text-red-600 mb-2">1000s</div>
                                <div className="text-sm font-medium text-slate-700 mb-1">Daily Complaints</div>
                                <div className="text-xs text-slate-500">
                                    Cities receive thousands of infrastructure complaints daily
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="text-3xl font-bold text-orange-600 mb-2">7+ days</div>
                                <div className="text-sm font-medium text-slate-700 mb-1">Manual Processing</div>
                                <div className="text-xs text-slate-500">
                                    Traditional systems take weeks to categorize and route issues
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="text-3xl font-bold text-yellow-600 mb-2">30%</div>
                                <div className="text-sm font-medium text-slate-700 mb-1">Duplicate Work</div>
                                <div className="text-xs text-slate-500">
                                    Same issues reported multiple times, wasting resources
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* The Solution */}
                    <div className="bg-white rounded-xl border border-slate-200 p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <span className="text-2xl">💡</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">The Solution</h2>
                        </div>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            CityMind AI is an intelligent platform that automatically analyzes, categorizes, and prioritizes urban infrastructure reports using advanced machine learning.
                            Our system processes reports in milliseconds and routes them to the right department with high accuracy.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: "Instant Classification", desc: "AI categorizes reports in ~88ms with 93% accuracy" },
                                { title: "Smart Duplicate Detection", desc: "Prevents redundant work by identifying similar reports" },
                                { title: "Severity Prediction", desc: "Automatically prioritizes critical issues (88% accuracy)" },
                                { title: "Multimodal Analysis", desc: "Analyzes both text descriptions and uploaded images" },
                            ].map((item) => (
                                <div key={item.title} className="flex gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 font-bold">✓</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">{item.title}</div>
                                        <div className="text-sm text-slate-500">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* The Technology */}
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-purple-600 p-3 rounded-lg">
                                <span className="text-white text-2xl">🧠</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">The Technology</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Text Classification */}
                            <div className="bg-white rounded-lg p-6 border border-slate-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-slate-900">Text Classification Model</h3>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">93% Accuracy</span>
                                </div>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">•</span><span>Trained on 500 diverse urban infrastructure reports</span></li>
                                    <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">•</span><span>Scikit-learn TF-IDF + Logistic Regression</span></li>
                                    <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">•</span><span>Processes text in ~10ms average</span></li>
                                    <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">•</span><span>5 categories: Pothole, Streetlight, Garbage, Water, Other</span></li>
                                </ul>
                            </div>

                            {/* Severity Prediction */}
                            <div className="bg-white rounded-lg p-6 border border-slate-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-slate-900">Severity Prediction Model</h3>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">88% Accuracy</span>
                                </div>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-start gap-2"><span className="text-purple-600 mt-0.5">•</span><span>Hybrid ML + rule-based system</span></li>
                                    <li className="flex items-start gap-2"><span className="text-purple-600 mt-0.5">•</span><span>Features: confidence, duplicates, keywords</span></li>
                                    <li className="flex items-start gap-2"><span className="text-purple-600 mt-0.5">•</span><span>Safety overrides for critical keywords</span></li>
                                    <li className="flex items-start gap-2"><span className="text-purple-600 mt-0.5">•</span><span>4 levels: Critical, High, Moderate, Low</span></li>
                                </ul>
                            </div>

                            {/* Duplicate Detection */}
                            <div className="bg-white rounded-lg p-6 border border-slate-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-slate-900">Duplicate Detection</h3>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Active</span>
                                </div>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">•</span><span>TF-IDF cosine similarity matching</span></li>
                                    <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">•</span><span>Threshold: 80% similarity</span></li>
                                    <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">•</span><span>Prevents redundant department assignments</span></li>
                                    <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">•</span><span>Tracks duplicate count for trending issues</span></li>
                                </ul>
                            </div>

                            {/* Multimodal Fusion */}
                            <div className="bg-white rounded-lg p-6 border border-slate-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-slate-900">Multimodal Fusion</h3>
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">Hybrid</span>
                                </div>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-start gap-2"><span className="text-orange-600 mt-0.5">•</span><span>Combines text + image analysis</span></li>
                                    <li className="flex items-start gap-2"><span className="text-orange-600 mt-0.5">•</span><span>Weighted fusion (60% image, 40% text)</span></li>
                                    <li className="flex items-start gap-2"><span className="text-orange-600 mt-0.5">•</span><span>Image analysis via external AI service</span></li>
                                    <li className="flex items-start gap-2"><span className="text-orange-600 mt-0.5">•</span><span>Confidence-aware dampening for duplicates</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* The Impact */}
                    <div className="bg-white rounded-xl border border-slate-200 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-emerald-100 p-3 rounded-lg">
                                <span className="text-2xl">📊</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">The Impact</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-emerald-600 mb-2">54%</div>
                                <div className="font-semibold text-slate-900 mb-1">Faster Resolution</div>
                                <div className="text-sm text-slate-500">From 7 days to 3.2 days average</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-600 mb-2">₹2.4L</div>
                                <div className="font-semibold text-slate-900 mb-1">Cost Savings</div>
                                <div className="text-sm text-slate-500">Per month in prevented duplicate work</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-purple-600 mb-2">87%</div>
                                <div className="font-semibold text-slate-900 mb-1">Satisfaction</div>
                                <div className="text-sm text-slate-500">Citizens happy with response time</div>
                            </div>
                        </div>
                    </div>

                    {/* The Vision */}
                    <div className="rounded-xl p-8 text-white bg-[linear-gradient(135deg,#4f46e5,#7c3aed)]">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">🚀</span>
                            <h2 className="text-2xl font-bold">The Vision</h2>
                        </div>
                        <p className="text-lg text-indigo-100 mb-6">
                            We&apos;re building the future of smart cities where AI proactively maintains infrastructure before citizens even report issues.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: "Predictive Maintenance", desc: "AI predicts infrastructure failures before they happen" },
                                { title: "Real-time Monitoring", desc: "IoT sensors + AI for continuous infrastructure health tracking" },
                                { title: "Citizen Engagement", desc: "Mobile app with AR for easy issue reporting" },
                                { title: "Resource Optimization", desc: "AI-driven scheduling and routing for repair crews" },
                            ].map((item) => (
                                <div key={item.title} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                    <div className="font-semibold mb-1">{item.title}</div>
                                    <div className="text-sm text-indigo-100">{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Technology Stack</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: "⚛️", name: "Next.js 14", label: "Frontend" },
                                { icon: "🟢", name: "Node.js", label: "Backend" },
                                { icon: "🐍", name: "Python + ML", label: "AI Service" },
                                { icon: "🗄️", name: "Prisma + PostgreSQL", label: "Database" },
                            ].map((item) => (
                                <div key={item.name} className="bg-white rounded-lg p-4 border border-slate-200 text-center">
                                    <div className="text-2xl mb-2">{item.icon}</div>
                                    <div className="font-semibold text-sm">{item.name}</div>
                                    <div className="text-xs text-slate-500">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
