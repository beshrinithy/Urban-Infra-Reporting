"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/src/components/Sidebar";

// Routes that should show the admin sidebar
const SIDEBAR_ROUTES = [
    "/dashboard",
    "/admin-panel",
    "/analytics",
    "/reports",
    "/system",
    "/citizen",
    "/auditor",
    "/ai",
];

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const showSidebar = SIDEBAR_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );

    if (!showSidebar) {
        // Public pages: no sidebar, no padding, just full-screen content
        return <>{children}</>;
    }

    // Admin/internal pages: show sidebar
    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100">
            <Sidebar />
            <main className="md:pl-64 min-h-screen transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
