"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Eye, Camera, Globe, ChevronDown, AlertTriangle, Zap, BarChart3, MapPin } from "lucide-react";
import FeatureTabs from "../components/FeatureTabs";

type Lang = "en" | "hi" | "kn" | "te" | "ta";

interface AnalyticsData {
  totalReports: number;
  avgLatency: number;
  avgConfidence: number;
}

// Animated counter hook
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ai' | 'location' | 'transparency'>('ai');
  const langRef = useRef<HTMLDivElement>(null);

  const languages = {
    en: "English", hi: "हिंदी", kn: "कन्नड़ (Kannada)", te: "తెలుగు (Telugu)", ta: "தமிழ் (Tamil)"
  };

  const t = {
    en: {
      live: "Live Infrastructure Monitoring",
      title: "Fixing Our City,",
      subtitle: "One Report at a Time.",
      desc: "A smart, AI-powered platform for reporting urban issues. From potholes to broken streetlights — help build a better city in just a few clicks.",
      reportBtn: "Report an Issue",
      trackBtn: "Track Status",
      stat1Label: "Reports Submitted",
      stat2Label: "AI Pipeline Latency",
      stat3Label: "Model Confidence"
    },
    hi: {
      live: "शहर की निगरानी लाइव",
      title: "हमारा शहर, हमारी जिम्मेदारी,",
      subtitle: "एक रिपोर्ट, एक समाधान।",
      desc: "शहरी समस्याओं की रिपोर्ट करने के लिए एक स्मार्ट AI प्लेटफॉर्म। गड्ढों से लेकर टूटी स्ट्रीट लाइटों तक — बस कुछ क्लिक में बेहतर शहर बनाएं।",
      reportBtn: "शिकायत दर्ज करें",
      trackBtn: "स्थिति देखें",
      stat1Label: "रिपोर्ट सबमिट",
      stat2Label: "AI लेटेंसी",
      stat3Label: "कॉन्फिडेंस"
    },
    kn: {
      live: "ನಗರದ ಮೂಲಸೌಕರ್ಯ ನಿರ್ವಹಣೆ",
      title: "ನಮ್ಮ ನಗರ, ನಮ್ಮ ಜವಾಬ್ದಾರಿ,",
      subtitle: "ಒಂದು ವರದಿ, ಒಂದು ಪರಿಹಾರ.",
      desc: "ನಗರದ ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಲು ಸ್ಮಾರ್ಟ್ AI ವೇದಿಕೆ.",
      reportBtn: "ದೂರು ನೀಡಿ",
      trackBtn: "ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ",
      stat1Label: "ಸಲ್ಲಿಸಿದ ವರದಿಗಳು",
      stat2Label: "AI ಲೇಟೆನ್ಸಿ",
      stat3Label: "ಮಾಡೆಲ್ ವಿಶ್ವಾಸ"
    },
    te: {
      live: "Live Infrastructure Monitoring",
      title: "మన నగరం, మన బాధ్యత,",
      subtitle: "ఒక్క ఫిర్యాదు, శాశ్వత పరిష్కారం.",
      desc: "నగర సమస్యలను నివేదించడానికి ఒక స్మార్ట్ AI ప్లాట్‌ఫారమ్.",
      reportBtn: "ఫిర్యాదు చేయండి",
      trackBtn: "స్థితిని ట్రాక్ చేయండి",
      stat1Label: "నివేదికలు",
      stat2Label: "AI లేటెన్సీ",
      stat3Label: "విశ్వాసం"
    },
    ta: {
      live: "நிகழ்நேர உள்கட்டமைப்பு கண்காணிப்பு",
      title: "நம்ம ஊரு, நம்ம கடமை,",
      subtitle: "ஒரு புகார், உடனடி தீர்வு.",
      desc: "நகர்ப்புற பிரச்சனைகளை புகாரளிக்க ஒரு ஸ்மார்ட் AI தளம்.",
      reportBtn: "புகார் அளிக்கவும்",
      trackBtn: "நிலைமை பார்க்க",
      stat1Label: "அறிக்கைகள்",
      stat2Label: "AI லேடன்சி",
      stat3Label: "நம்பிக்கை"
    }
  };

  const content = t[lang];

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setIsLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5005/api/reports/stats/public', {
          cache: 'no-store'
        });
        if (!res.ok) throw new Error('Stats API unavailable');
        const data = await res.json();
        setStats({
          totalReports: data.totalReports || 0,
          avgLatency: data.avgLatency || 0,
          avgConfidence: Math.round((data.avgConfidence || 0) * 100) / 100
        });
      } catch {
        setStats({ totalReports: 0, avgLatency: 0, avgConfidence: 0 });
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalCount = useCountUp(stats?.totalReports || 0);
  const latencyCount = useCountUp(stats?.avgLatency || 0);
  const confidenceCount = useCountUp(stats?.avgConfidence || 0);

  return (
    <main className="min-h-screen font-sans bg-[linear-gradient(160deg,_#0f172a_0%,_#1e1b4b_50%,_#0f172a_100%)]">

      {/* ─── HERO ─── */}
      <div className="relative overflow-hidden min-h-screen flex flex-col">

        {/* Background glow blobs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none bg-[radial-gradient(circle,_rgba(99,102,241,0.15)_0%,_transparent_70%)]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none bg-[radial-gradient(circle,_rgba(59,130,246,0.12)_0%,_transparent_70%)]" />

        {/* City skyline subtle grid overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[length:60px_60px]" />

        {/* Nav bar */}
        <nav className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[linear-gradient(135deg,_#6366f1,_#3b82f6)]">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">CityMind AI</span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">v2.1</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/feed" className="text-slate-400 hover:text-white text-sm transition">Feed</Link>
            <Link href="/track" className="text-slate-400 hover:text-white text-sm transition">Track</Link>
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-lg bg-white/8 border border-white/10 text-white hover:bg-white/12 transition">Sign In</Link>

            {/* Language picker */}
            <div ref={langRef} className="relative">
              <button
                title="Select language"
                aria-label="Select language"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition px-2 py-1.5 rounded-lg hover:bg-white/8"
              >
                <Globe size={15} />
                <ChevronDown size={13} className={`transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden shadow-2xl border border-white/10 animate-slide-up bg-[#1e293b]">
                  {Object.entries(languages).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => { setLang(key as Lang); setIsLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-white/8 ${lang === key ? "text-blue-400 bg-blue-500/10" : "text-slate-300"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">

          {/* Live badge */}
          <div className="animate-float inline-flex items-center gap-2 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-8 text-sm font-medium text-emerald-300 mb-10 bg-[rgba(16,185,129,0.08)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            {content.live}
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.05]">
            {content.title}
            <br />
            <span className="text-gradient">{content.subtitle}</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-xl mb-12 leading-relaxed">
            {content.desc}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mb-4">
            <Link
              href="/report"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition hover:-translate-y-1 bg-[linear-gradient(135deg,#6366f1,#3b82f6)] shadow-[0_0_30px_rgba(99,102,241,0.35)]"
            >
              <Camera size={19} />
              {content.reportBtn}
              <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/track"
              className="flex-1 flex items-center justify-center gap-2 text-white font-semibold py-4 rounded-xl border border-white/15 transition hover:bg-white/8 bg-[rgba(255,255,255,0.05)]"
            >
              <Eye size={19} />
              {content.trackBtn}
            </Link>
          </div>
          <Link
            href="/feed"
            className="w-full max-w-md flex items-center justify-center gap-2 py-3 rounded-xl border border-emerald-500/25 text-emerald-300 text-sm font-semibold transition hover:bg-emerald-500/10"
          >
            📢 View Community Feed
          </Link>

          {/* Stats row */}
          <div className="mt-16 flex flex-wrap justify-center gap-6">
            {[
              { icon: <BarChart3 size={18} />, value: statsLoading ? "—" : String(totalCount), label: content.stat1Label, color: "text-blue-400" },
              { icon: <Zap size={18} />, value: statsLoading ? "—" : `${latencyCount}ms`, label: content.stat2Label, color: "text-purple-400" },
              { icon: <AlertTriangle size={18} />, value: statsLoading ? "—" : `${confidenceCount}%`, label: content.stat3Label, color: "text-emerald-400" },
            ].map((stat, i) => (
              <div key={i} className="card-hover flex flex-col items-center gap-1.5 px-8 py-5 rounded-2xl border border-white/8 bg-[rgba(255,255,255,0.04)]">
                <span className={stat.color}>{stat.icon}</span>
                <span className="text-3xl font-extrabold text-white animate-count-pop">{stat.value}</span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom gradient fade into Feature Tabs section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none bg-[linear-gradient(to_bottom,_transparent,_rgba(15,23,42,0.95))]" />
      </div>

      {/* ─── Feature Tabs ─── */}
      <div className="relative bg-[#0f172a]">
        <FeatureTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 px-6 bg-[#0a1020]">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Process</p>
          <h2 className="text-3xl font-bold text-white">How It Works</h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "01", icon: <Camera size={22} />, title: "Submit", desc: "Photo + GPS auto-captured", color: "#6366f1" },
            { step: "02", icon: <Zap size={22} />, title: "AI Analysis", desc: "Category & severity detected", color: "#8b5cf6" },
            { step: "03", icon: <MapPin size={22} />, title: "Assigned", desc: "Routed to correct department", color: "#3b82f6" },
            { step: "04", icon: <AlertTriangle size={22} />, title: "Resolved", desc: "You get notified on fix", color: "#10b981" },
          ].map((s) => (
            <div key={s.step} className="card-hover relative p-6 rounded-2xl border border-white/8 text-center bg-[rgba(255,255,255,0.04)]">
              <div className="absolute -top-3 left-6 text-xs font-black text-slate-600">{s.step}</div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" ref={(el) => { if (el) { el.style.backgroundColor = `${s.color}22`; el.style.color = s.color; } }}>
                {s.icon}
              </div>
              <h3 className="font-bold text-white mb-1">{s.title}</h3>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/6 py-10 px-6 bg-[#0a1020]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[linear-gradient(135deg,_#6366f1,_#3b82f6)]">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-slate-300 font-semibold">CityMind AI</span>
            <span className="text-slate-600 text-sm">© 2025 Smart City Initiative</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/login" className="hover:text-blue-400 transition">Admin Login</Link>
            <Link href="/track" className="hover:text-blue-400 transition">Track Report</Link>
            <Link href="/feed" className="hover:text-blue-400 transition">Community Feed</Link>
            <Link href="/report" className="hover:text-blue-400 transition">Submit Report</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
