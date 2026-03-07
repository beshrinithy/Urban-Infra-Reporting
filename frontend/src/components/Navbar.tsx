"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-4 flex gap-6">
      <Link href="/" className="hover:underline">
        Home
      </Link>
      <Link href="/report" className="hover:underline">
        Report Issue
      </Link>
      <Link href="/dashboard" className="hover:underline">
        Dashboard
      </Link>
    </nav>
  );
}
