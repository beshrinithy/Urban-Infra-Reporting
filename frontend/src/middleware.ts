import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // All routes that require authentication
    const isProtectedRoute =
        path.startsWith("/citizen") ||
        path.startsWith("/dashboard") ||
        path.startsWith("/admin-panel") ||
        path.startsWith("/analytics") ||
        path.startsWith("/auditor") ||
        path.startsWith("/officer");

    // Read cookie set by login page (middleware runs on Edge — cannot read localStorage)
    const token = request.cookies.get("admin_token")?.value;

    if (isProtectedRoute && !token) {
        // Preserve the intended destination so we can redirect back after login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", path);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/citizen/:path*", "/dashboard/:path*", "/admin-panel/:path*", "/analytics/:path*", "/auditor/:path*", "/officer/:path*"],
};
