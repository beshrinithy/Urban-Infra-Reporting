import "./globals.css";
import ConditionalLayout from "@/src/components/ConditionalLayout";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CityMind AI | Urban Infrastructure Intelligence",
  description: "Next-gen AI platform for smart city management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`h-full antialiased text-slate-900 ${inter.className}`}>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
