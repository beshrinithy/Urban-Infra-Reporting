import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from "recharts";

interface AdminChartsProps {
    statusData: { name: string; value: number }[];
    categoryData: { name: string; value: number }[];
    confidenceData: { name: string; value: number }[]; // New
    deviceData: { name: string; value: number }[];     // New
    COLORS: string[];
}

export default function AdminCharts({ statusData, categoryData, confidenceData, deviceData, COLORS }: AdminChartsProps) {
    return (
        <div className="lg:col-span-4 space-y-6">
            {/* 1. STATUS BREAKDOWN */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/50 h-[240px] flex flex-col">
                <h3 className="font-bold text-slate-700 mb-4 text-xs uppercase tracking-wider text-center">Breakdown by Status</h3>
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData} cx="50%" cy="50%"
                                innerRadius={40} outerRadius={60}
                                paddingAngle={5} dataKey="value"
                                stroke="none"
                            >
                                {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. CATEGORY DISTRIBUTION */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/50 h-[240px] flex flex-col">
                <h3 className="font-bold text-slate-700 mb-4 text-xs uppercase tracking-wider text-center">Category Distribution</h3>
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} dy={10} interval={0} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 4, 4]} barSize={20}>
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. NEW: AI CONFIDENCE TREND */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/50 h-[240px] flex flex-col">
                <h3 className="font-bold text-slate-700 mb-4 text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> AI Confidence Trend
                </h3>
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={confidenceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} dy={5} />
                            <YAxis hide domain={[0, 100]} />
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value: any) => [`${value}%`, "Confidence"] as any} />
                            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 4. NEW: DEVICE USAGE (GPU vs CPU) */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/50 h-[200px] flex flex-col">
                <h3 className="font-bold text-slate-700 mb-2 text-xs uppercase tracking-wider text-center">AI Hardware Usage</h3>
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={deviceData} cx="50%" cy="50%"
                                innerRadius={30} outerRadius={50}
                                paddingAngle={5} dataKey="value"
                                stroke="none"
                            >
                                <Cell fill="#8b5cf6" /> {/* GPU - Violet */}
                                <Cell fill="#94a3b8" /> {/* CPU - Slate */}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
