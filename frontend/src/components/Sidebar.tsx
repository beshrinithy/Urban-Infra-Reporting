"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    MapPin,
    FileText,
    Zap,
    Cpu,
    Info,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Submit Report", href: "/report", icon: MapPin },
        { name: "All Reports", href: "/reports", icon: FileText },
        { name: "Analytics", href: "/analytics", icon: Zap },
        { name: "System Status", href: "/system", icon: Cpu },
        { name: "About", href: "/about", icon: Info },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-md shadow-lg"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full border-r border-slate-800">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-600 rounded-lg">
                                <Cpu size={18} className="text-white" />
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                CityMind AI
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Platform
                        </div>

                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)} // Close on mobile click
                                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${isActive
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100 hover:pl-4"
                                        }`}
                                >
                                    <Icon
                                        size={18}
                                        className={`mr-3 transition-colors ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                                            }`}
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Area */}
                    <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-2 h-2 absolute top-0 right-0 bg-green-500 rounded-full animate-pulse border border-slate-900"></div>
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                                    <Cpu size={14} />
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-300">System Online</p>
                                <p className="text-[10px] text-slate-500">v2.1 Production</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
