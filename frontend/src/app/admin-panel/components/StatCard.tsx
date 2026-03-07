import { ReactNode } from "react";

interface StatCardProps {
    title: string;
    value: number;
    icon: ReactNode;
    color: string;
    onClick?: () => void;
}

export default function StatCard({ title, value, icon, color, onClick }: StatCardProps) {
    return (
        <div
            onClick={onClick}
            className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white/50 relative overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer hover:border-indigo-200 active:scale-95"
        >
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${color} rounded-bl-3xl`}>
                {icon}
            </div>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h2>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg shadow-indigo-500/20`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}
