"use client";

import { useState, useEffect } from "react";
import { Camera, MapPin, Send, AlertTriangle, Image as ImageIcon, Loader2, CheckCircle, Brain, ArrowLeft } from "lucide-react";
import { io } from "socket.io-client";
import Link from "next/link";
import { API_URL, SOCKET_URL } from "../../lib/config";

// Initialize Socket.io (Singleton-ish outside component)
const socket = io(SOCKET_URL);

export default function ReportIssue() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(""); // User can leave empty for AI
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationError, setLocationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");
  const [citizenEmail, setCitizenEmail] = useState<string | null>(null);
  const [citizenId, setCitizenId] = useState<number | null>(null);

  // Submission result types
  type SubmissionResult = { id: number; traceId: string; status: string;[key: string]: unknown };
  type AiResult = { category?: string; severity?: string; confidence?: number; status?: string;[key: string]: unknown };
  type DuplicateWarning = { existingReportId: number; similarity: number; message: string };

  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [aiStatus, setAiStatus] = useState<"IDLE" | "PROCESSING" | "COMPLETE">("IDLE");
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarning | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.size > 5 * 1024 * 1024) {
      setImageError("File is too large (Max 5MB). Please compress it.");
      setFile(null);
      return;
    }
    if (selectedFile.size < 20 * 1024) {
      setImageError("Image quality is low (Blurry/Small).");
    }
    setImageError("");
    setFile(selectedFile);
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError("Could not detect location. Please enable GPS.");
        }
      );
    } else {
      setTimeout(() => setLocationError("Geolocation is not supported by this browser."), 0);
    }

    const storedUser = localStorage.getItem("admin_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.userRole === "CITIZEN" && parsed.email) {
          setTimeout(() => {
            setCitizenEmail(parsed.email);
            setContactEmail(parsed.email);
            setCitizenId(parsed.id);
          }, 0);
        }
      } catch { }
    }

    // Socket Listener
    socket.on("report_updated", (data: AiResult & { id: number }) => {
      console.log("Socket Update Received:", data);
      if (submissionResult?.id === data.id) {
        setAiStatus("COMPLETE");
        setAiResult(data);
      } else {
        setAiResult((prev: AiResult | null) => {
          if (submissionResult && data.id === submissionResult.id) {
            setAiStatus("COMPLETE");
            return data;
          }
          return prev;
        });
      }
    });

    return () => {
      socket.off("report_updated");
    }
  }, [submissionResult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAiStatus("PROCESSING");
    setDuplicateWarning(null);

    let base64Image = null;
    if (file) {
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          title,
          description: description + (file ? ` [Image Attached: ${file.name}]` : ""),
          image: base64Image,
          category,
          contactEmail: citizenEmail || contactEmail,
          contactPhone,
          latitude,
          longitude,
          ...(citizenId ? { submittedBy: citizenId } : {})
        }),
      });

      // ── Handle Duplicate (409) ──────────────────────────────────────
      if (res.status === 409) {
        const dupData = await res.json();
        setDuplicateWarning({
          existingReportId: dupData.existingReportId,
          similarity: dupData.similarity,
          message: dupData.message
        });
        setIsSubmitting(false);
        setAiStatus("IDLE");
        return;
      }
      // ───────────────────────────────────────────────────────────────

      const data = await res.json();
      const reportData = {
        id: data.id || data.reportId,
        traceId: data.traceId || `TRC-${Math.floor(Math.random() * 10000)}`,
        status: 'Processing'
      };
      setSubmissionResult(reportData);

      if (data.status === 'Pending') {
        setAiStatus("COMPLETE");
        setAiResult(data);
      }
    } catch (e) {
      console.error("Submission failed", e);
      alert("Failed to submit report");
      setIsSubmitting(false);
      setAiStatus("IDLE");
    }
  };

  const resetForm = () => {
    setSubmissionResult(null);
    setAiStatus("IDLE");
    setAiResult(null);
    setIsSubmitting(false);
    setTitle("");
    setDescription("");
    setCategory("");
    setFile(null);
  }

  // ─── SUCCESS VIEW ─────────────────────────────────────────────
  if (submissionResult) {
    return (
      <main className="min-h-screen py-12 px-4 font-sans flex flex-col items-center justify-center bg-[linear-gradient(160deg,#0f172a_0%,#1e1b4b_50%,#0f172a_100%)]">
        <div className="max-w-md w-full rounded-2xl overflow-hidden border border-white/10 bg-[rgba(30,27,75,0.6)] backdrop-blur-xl">
          {/* Header */}
          <div className="p-6 text-center bg-[linear-gradient(135deg,#059669,#10b981)]">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <CheckCircle className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white">Report Submitted</h2>
            <p className="text-emerald-100 text-sm mt-1">Trace ID: <span className="font-mono">{submissionResult.traceId}</span></p>
          </div>

          {/* Status Section */}
          <div className="p-8 space-y-8">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 w-full h-1 bg-white/5 -z-10"></div>
              <div className="flex flex-col items-center gap-2 px-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">1</div>
                <span className="text-xs font-medium text-slate-400">Received</span>
              </div>
              <div className="flex flex-col items-center gap-2 px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${aiStatus === "PROCESSING" ? "bg-blue-500 animate-pulse text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" :
                  aiStatus === "COMPLETE" ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-400"
                  }`}>
                  {aiStatus === "PROCESSING" ? <Loader2 size={14} className="animate-spin" /> : "2"}
                </div>
                <span className={`text-xs font-medium transition-colors ${aiStatus === "PROCESSING" ? "text-blue-400 font-bold" : "text-slate-400"}`}>
                  AI Analysis
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${aiStatus === "COMPLETE" ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-400"
                  }`}>3</div>
                <span className="text-xs font-medium text-slate-400">Pending Review</span>
              </div>
            </div>

            {/* Dynamic AI Result Card */}
            <div className={`transition-all duration-700 transform ${aiStatus === "COMPLETE" ? "translate-y-0 opacity-100" : "translate-y-4 opacity-100"}`}>
              {aiStatus === "PROCESSING" ? (
                <div className="rounded-xl p-6 text-center border border-blue-500/20 bg-[rgba(59,130,246,0.1)]">
                  <Loader2 className="animate-spin text-blue-400 mx-auto mb-3" size={24} />
                  <h3 className="text-blue-200 font-bold text-lg">Analyzing content...</h3>
                  <p className="text-blue-300/70 text-sm mt-1">Our AI is categorizing your issue and assessing severity.</p>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-white/10 bg-[rgba(15,23,42,0.5)]">
                  <div className="px-4 py-2 border-b border-white/10 flex justify-between items-center bg-[rgba(15,23,42,0.4)]">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Brain size={12} /> AI Assessment Result
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">CONFIRMED</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase mb-1">Category</p>
                      <p className="font-bold text-white text-lg flex items-center gap-2">
                        {getCategoryIcon(aiResult?.category)}
                        {aiResult?.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase mb-1">Severity</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getSeverityColor(aiResult?.severity)}`}>
                        {aiResult?.severity}
                      </span>
                    </div>
                    <div className="col-span-2 mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium uppercase">Confidence Score</span>
                        <span className="text-white font-mono font-bold">{aiResult?.confidence ? (aiResult.confidence * 100).toFixed(1) : 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                          ref={(el) => { if (el) el.style.width = `${(aiResult?.confidence || 0) * 100}%`; }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={resetForm}
              className="w-full font-medium py-3 rounded-xl transition text-white bg-[linear-gradient(135deg,#6366f1,#8b5cf6)]"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ─── FORM VIEW ────────────────────────────────────────────────
  return (
    <main className="min-h-screen py-12 px-4 font-sans bg-[linear-gradient(160deg,#0f172a_0%,#1e1b4b_50%,#0f172a_100%)]">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-[linear-gradient(135deg,#6366f1,#8b5cf6)]">
            <Camera size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Report an Issue</h1>
          <p className="text-slate-400 mt-2">Help us maintain our city infrastructure.</p>
        </div>

        <form onSubmit={handleSubmit}
          className="p-8 rounded-2xl border border-white/10 space-y-6 bg-[rgba(30,27,75,0.5)] backdrop-blur-xl">

          {/* Location Status */}
          <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${locationError
            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
            <div className="flex items-center gap-3">
              <MapPin size={18} />
              {locationError ? locationError :
                (latitude !== null && longitude !== null) ? `Location Detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : "Detecting Location..."}
            </div>
            <button
              type="button"
              onClick={() => {
                if (!navigator.geolocation) {
                  setLocationError("Geolocation not supported by your browser.");
                  return;
                }
                setLocationError("");
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setLatitude(pos.coords.latitude);
                    setLongitude(pos.coords.longitude);
                    setLocationError("");
                  },
                  () => {
                    setLocationError("Could not get location. Please enable GPS.");
                  },
                  { enableHighAccuracy: true, timeout: 10000 }
                );
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition shadow-sm bg-[linear-gradient(135deg,#6366f1,#8b5cf6)]"
            >
              📍 Re-detect
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Issue Title</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl outline-none transition text-white placeholder:text-slate-500 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 bg-[rgba(15,23,42,0.6)]"
              placeholder="e.g., Pothole on 5th Avenue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Email (For Updates)</label>
              <input
                type="email"
                readOnly={!!citizenEmail}
                className={`w-full px-4 py-3 rounded-xl outline-none transition placeholder:text-slate-500 border border-white/10 ${citizenEmail ? 'text-slate-500 cursor-not-allowed bg-[rgba(15,23,42,0.8)]' : 'text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 bg-[rgba(15,23,42,0.6)]'}`}
                placeholder="name@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
              {citizenEmail && (
                <p className="text-xs text-indigo-400 mt-1.5 font-medium ml-1">
                  ✓ Linked to your Citizen account
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Phone (For SMS)</label>
              <input
                type="tel"
                className="w-full px-4 py-3 rounded-xl outline-none transition text-white placeholder:text-slate-500 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 bg-[rgba(15,23,42,0.6)]"
                placeholder="+1 (555) 000-0000"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl outline-none transition h-32 text-white placeholder:text-slate-500 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 bg-[rgba(15,23,42,0.6)]"
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Evidence (Optional)</label>
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer relative ${imageError ? 'border-red-500/40 bg-red-500/5' : 'border-white/15 hover:border-indigo-500/30 hover:bg-white/[0.02]'}`}>
              <input
                type="file"
                title="Upload photo evidence"
                aria-label="Upload photo evidence"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept="image/*"
              />
              <div className="flex flex-col items-center gap-2 text-slate-400">
                {imageError ? (
                  <AlertTriangle size={32} className="text-red-400" />
                ) : (
                  <ImageIcon size={32} className={file ? "text-indigo-400" : "text-slate-500"} />
                )}
                {imageError ? (
                  <span className="font-medium text-red-400">{imageError}</span>
                ) : file ? (
                  <span className="font-medium text-indigo-400">{file.name} attached</span>
                ) : (
                  <span>Click to upload photo evidence (Max 5MB)</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category (Optional - AI will detect)</label>
            <select
              title="Select category"
              aria-label="Select report category"
              className="w-full px-4 py-3 rounded-xl outline-none transition text-white border border-white/10 focus:border-indigo-500/50 bg-[rgba(15,23,42,0.6)]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Auto-Detect (AI)</option>
              <option value="Road">Road / Pothole</option>
              <option value="Garbage">Garbage / Sanitation</option>
              <option value="Water">Water / Pipe Leak</option>
              <option value="Electricity">Electricity / Street Light</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-medium text-lg border border-white/10 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] shadow-[0_8px_32px_rgba(99,102,241,0.25)]"
          >
            {isSubmitting ? (
              <> <Loader2 className="animate-spin" /> Analyzing Issue... </>
            ) : (
              <> <Send size={20} /> Submit Report </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

// Helpers
function getCategoryIcon(cat?: string) {
  switch (cat) {
    case "Road": return "🛣️";
    case "Water": return "💧";
    case "Garbage": return "🗑️";
    case "Electricity": return "⚡";
    default: return "📌";
  }
}

function getSeverityColor(sev?: string) {
  switch (sev) {
    case "Critical": return "bg-red-500/20 text-red-400 border border-red-500/30";
    case "High": return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    case "Moderate": return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    case "Low": return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    default: return "bg-slate-500/20 text-slate-400";
  }
}
