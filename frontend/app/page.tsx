"use client";

import Link from "next/link";
import { useState } from "react";

const DEMO_SCENARIOS = [
  {
    id: "failed_payment",
    label: "Failed Payment Debit",
    ref: "REF8841-UPI-FAILED",
    amount: "₹1,500.00",
    status: "FAILED",
    category: "Failed Transaction",
    complaint: "Money was debited from my bank account, but the store POS displayed transaction failed.",
    finding: "TRANSACTION_STATUS_FAILED_DEBIT_REVERSAL_PENDING",
    recommendation: "Verify NPCI switch status and check for automatic bank reversal within 24-48 hours.",
    risk: "LOW_RISK_ELIGIBLE",
  },
  {
    id: "duplicate_payment",
    label: "Duplicate Debit",
    ref: "REF9902-DUP-CHARGE",
    amount: "₹850.00",
    status: "SUCCESS",
    category: "Duplicate Payment",
    complaint: "I paid ₹850 once at the store, but my bank statement shows two identical debits within 1 minute.",
    finding: "CANDIDATE_DUPLICATE_TRANSACTION_REF",
    recommendation: "Compare external transaction references and request duplicate charge reversal verification.",
    risk: "ADVISORY_REVIEW",
  },
  {
    id: "non_delivery",
    label: "Merchant Non-Delivery",
    ref: "REF4410-MERCHANT-ORD",
    amount: "₹3,200.00",
    status: "SUCCESS",
    category: "Merchant Non-Delivery",
    complaint: "I paid ₹3,200 for an online order 5 days ago, but the merchant cancelled the order and sent no item.",
    finding: "MERCHANT_ORDER_UNVERIFIED",
    recommendation: "Request order cancellation reference and delivery proof from merchant before escalating.",
    risk: "AWAITING_INFORMATION",
  },
];

export default function Home() {
  const [activeScenario, setActiveScenario] = useState(DEMO_SCENARIOS[0]);
  const [activeTab, setActiveTab] = useState<"overview" | "consistency" | "resolution">("overview");

  return (
    <div className="min-h-screen bg-[#070B12] text-[#E2E8F0] font-sans antialiased selection:bg-[#00F0FF]/20 selection:text-[#00F0FF] relative overflow-hidden">
      {/* 3D Background Lighting Gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[1000px] bg-gradient-to-tr from-[#00F0FF]/20 via-[#7000FF]/15 to-transparent blur-[140px] rounded-full" />
      <div className="pointer-events-none absolute top-1/2 -left-40 h-[500px] w-[500px] bg-[#00F0FF]/10 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[600px] w-[600px] bg-[#7000FF]/10 blur-[150px] rounded-full" />

      {/* Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* 1. FLOATING NAVIGATION BAR */}
      <header className="sticky top-4 z-50 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 p-3 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00F0FF] via-[#0072FF] to-[#7000FF] p-0.5 shadow-[0_0_20px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-all">
              <svg width={20} height={20} style={{ width: "20px", height: "20px" }} className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
                PayRakshak
                <span className="text-[10px] font-mono bg-[#00F0FF]/15 text-[#00F0FF] px-2 py-0.5 rounded-full border border-[#00F0FF]/30">v2.4 Live</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">UPIResolve AI Platform</div>
            </div>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#simulator" className="hover:text-[#00F0FF] transition-colors">Live Simulator</a>
            <a href="#how-it-works" className="hover:text-[#00F0FF] transition-colors">How it works</a>
            <a href="#features" className="hover:text-[#00F0FF] transition-colors">Capabilities</a>
            <Link href="/privacy" className="hover:text-[#00F0FF] transition-colors">Privacy</Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-block px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="btn-3d-primary !py-2 !px-5 text-sm">
              Launch App
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-20 pb-16 text-center relative z-10 px-6">
        <div className="mx-auto max-w-4xl">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 px-4 py-1.5 text-xs font-mono text-[#00F0FF] mb-8 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            <span className="h-2 w-2 rounded-full bg-[#00F0FF] animate-ping" />
            AI-POWERED UPI DISPUTE DETECTION & RESOLUTION PLATFORM
          </div>

          {/* Main Title */}
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.12]">
            Intelligent Dispute Resolution for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#0072FF] to-[#7000FF]">
              UPI Payments
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-xl text-slate-300 leading-relaxed font-light">
            Every transaction explained. Every dispute guided. Analyze payment complaints, verify status consistency, and receive explainable advisory resolutions instantly.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-3d-primary !px-8 !py-3.5 text-base w-full sm:w-auto">
              Get Started Free ➔
            </Link>
            <a href="#simulator" className="btn-3d-secondary !px-8 !py-3.5 text-base w-full sm:w-auto">
              Try Live Simulator
            </a>
          </div>

          {/* Trust Stat Bar */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="card-3d p-4 flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 font-bold">
                ⚡
              </div>
              <div>
                <div className="text-xs font-mono text-slate-400">Advisory Speed</div>
                <div className="text-sm font-bold text-white">&lt; 2 Second Analysis</div>
              </div>
            </div>

            <div className="card-3d p-4 flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                🛡️
              </div>
              <div>
                <div className="text-xs font-mono text-slate-400">Decision Safety</div>
                <div className="text-sm font-bold text-white">100% Human-in-the-Loop</div>
              </div>
            </div>

            <div className="card-3d p-4 flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                🔍
              </div>
              <div>
                <div className="text-xs font-mono text-slate-400">Consistency Rules</div>
                <div className="text-sm font-bold text-white">12 Automated Checks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE LIVE DISPUTE SIMULATOR (ON HOME PAGE) */}
      <section id="simulator" className="py-16 relative z-10 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-3 py-1 rounded-full border border-[#00F0FF]/20">
              INTERACTIVE DEMO
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-3 tracking-tight sm:text-4xl">
              Experience the AI Engine in Action
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Select a UPI dispute scenario below to see real-time NLP classification, consistency rule evaluation, and advisory resolutions.
            </p>
          </div>

          {/* Scenario Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {DEMO_SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveScenario(s)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all border ${
                  activeScenario.id === s.id
                    ? "bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/50 shadow-[0_0_15px_rgba(0,240,255,0.25)] scale-105"
                    : "bg-[#0F172A]/80 text-slate-400 border-white/10 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Simulator Display Card */}
          <div className="card-3d p-6 relative overflow-hidden">
            {/* Top Workspace Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <span className="font-mono text-xs text-slate-400">LIVE EVALUATION WINDOW</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">Dispute Reference: {activeScenario.ref}</h3>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="bg-purple-500/15 text-purple-300 px-3 py-1 rounded-md border border-purple-500/30">
                  SYNTHETIC DEMO DATA
                </span>
                <span className="bg-emerald-500/15 text-emerald-300 px-3 py-1 rounded-md border border-emerald-500/30">
                  ADVISORY ONLY
                </span>
              </div>
            </div>

            {/* Inner Dashboard Tabs */}
            <div className="flex border-b border-white/10 mb-6 font-mono text-xs">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 font-semibold border-b-2 transition-all ${
                  activeTab === "overview" ? "border-[#00F0FF] text-[#00F0FF]" : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                1. Transaction & Complaint
              </button>
              <button
                onClick={() => setActiveTab("consistency")}
                className={`px-4 py-2 font-semibold border-b-2 transition-all ${
                  activeTab === "consistency" ? "border-[#00F0FF] text-[#00F0FF]" : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                2. Consistency Findings
              </button>
              <button
                onClick={() => setActiveTab("resolution")}
                className={`px-4 py-2 font-semibold border-b-2 transition-all ${
                  activeTab === "resolution" ? "border-[#00F0FF] text-[#00F0FF]" : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                3. Advisory Recommendation
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#0F172A]/80 p-4 rounded-xl border border-white/10">
                    <div className="text-xs text-slate-400 font-mono">Amount</div>
                    <div className="text-lg font-bold text-white mt-1">{activeScenario.amount}</div>
                  </div>
                  <div className="bg-[#0F172A]/80 p-4 rounded-xl border border-white/10">
                    <div className="text-xs text-slate-400 font-mono">Status</div>
                    <div className="text-lg font-bold text-amber-400 mt-1">{activeScenario.status}</div>
                  </div>
                  <div className="bg-[#0F172A]/80 p-4 rounded-xl border border-white/10">
                    <div className="text-xs text-slate-400 font-mono">ML Predicted Category</div>
                    <div className="text-lg font-bold text-[#00F0FF] mt-1">{activeScenario.category}</div>
                  </div>
                </div>

                <div className="bg-[#0F172A]/80 p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Customer Complaint Description</div>
                  <p className="text-sm text-slate-200 italic font-serif">"{activeScenario.complaint}"</p>
                </div>
              </div>
            )}

            {/* Tab 2: Consistency */}
            {activeTab === "consistency" && (
              <div className="bg-[#0F172A]/80 p-5 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#00F0FF]" />
                  <span className="font-mono text-xs text-[#00F0FF] font-bold">DETERMINISTIC CONSISTENCY RULE TRIGGERED</span>
                </div>
                <div className="font-mono text-sm text-white font-bold bg-[#0A0E17] p-3 rounded-lg border border-white/10">
                  FLAG: {activeScenario.finding}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The automated consistency engine evaluated the complaint against available database logs and flagged this discrepancy for reviewer awareness.
                </p>
              </div>
            )}

            {/* Tab 3: Resolution */}
            {activeTab === "resolution" && (
              <div className="bg-[#0F172A]/80 p-5 rounded-xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-400 font-bold">ADVISORY NEXT STEP</span>
                  <span className="text-xs font-mono bg-emerald-500/15 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/30">
                    {activeScenario.risk}
                  </span>
                </div>
                <p className="text-sm text-white font-semibold leading-relaxed">
                  {activeScenario.recommendation}
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
                  <span className="text-slate-400">* Execution Mode: ADVISORY_ONLY (No funds moved)</span>
                  <Link href="/register" className="text-[#00F0FF] font-bold hover:underline">
                    File Live Dispute ➔
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (3 STEPS) */}
      <section id="how-it-works" className="py-20 bg-[#0F172A]/40 border-t border-white/10 relative z-10 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              From Payment Issue to Next Steps
            </h2>
            <p className="mt-3 text-base text-slate-400">
              A structured, 3-step workflow designed for clarity, evidence evaluation, and safe decision-making.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-3d p-8 space-y-4 relative overflow-hidden group hover:border-[#00F0FF]/40 transition-all">
              <div className="text-4xl font-extrabold text-[#00F0FF]/20 font-mono">01</div>
              <h3 className="text-xl font-bold text-white">1. Select Transaction</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Choose your transaction from sample data or import your bank statement CSV to inspect payment reference attributes.
              </p>
            </div>

            <div className="card-3d p-8 space-y-4 relative overflow-hidden group hover:border-[#00F0FF]/40 transition-all">
              <div className="text-4xl font-extrabold text-[#00F0FF]/20 font-mono">02</div>
              <h3 className="text-xl font-bold text-white">2. AI Analysis & Rules</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Our NLP classifier categorizes your complaint while 12 deterministic consistency rules check for reference contradictions.
              </p>
            </div>

            <div className="card-3d p-8 space-y-4 relative overflow-hidden group hover:border-[#00F0FF]/40 transition-all">
              <div className="text-4xl font-extrabold text-[#00F0FF]/20 font-mono">03</div>
              <h3 className="text-xl font-bold text-white">3. Advisory Next Step</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Receive clear, explainable resolution recommendations and track case status through the authorized reviewer timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PLATFORM CAPABILITIES */}
      <section id="features" className="py-20 bg-[#0A0E17] border-t border-white/10 relative z-10 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Engineered for Trust & Compliance
            </h2>
            <p className="mt-3 text-base text-slate-400">
              Core platform capabilities built around strict safety rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
            <div className="card-3d p-8 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] flex items-center justify-center font-bold text-lg">🤖</div>
              <h3 className="text-lg font-bold text-white">NLP Complaint Classifier</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Trained TF-IDF & Logistic Regression model categorizes complaints across 7 UPI dispute classes with low-confidence abstention (`NEEDS_CLARIFICATION`).
              </p>
            </div>

            <div className="card-3d p-8 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">⚡</div>
              <h3 className="text-lg font-bold text-white">Consistency Engine</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Deterministic validation service checks candidate duplicate references, status contradictions, and multi-complaint flags automatically.
              </p>
            </div>

            <div className="card-3d p-8 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg">📜</div>
              <h3 className="text-lg font-bold text-white">Timestamped Audit Timeline</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Every dispute transition (`SUBMITTED` ➔ `UNDER_REVIEW` ➔ `ACTION_RECOMMENDED` ➔ `RESOLVED`) is stored as an immutable audit event.
              </p>
            </div>

            <div className="card-3d p-8 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg">🔒</div>
              <h3 className="text-lg font-bold text-white">Evidence Upload Security</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Magic byte header validation (PNG, JPG, PDF), path traversal guards, and file size limits (5 MB max) ensure secure evidence attachments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. GOVERNANCE & PRIVACY DISCLOSURE */}
      <section className="py-16 bg-[#0F172A]/60 border-t border-white/10 relative z-10 px-6 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="card-3d p-8 text-left space-y-4 border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <h3 className="text-xl font-bold text-white">Advisory Safety Disclosure</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              PayRakshak provides advisory assistance and transaction evidence analysis. It does not independently execute refunds, reverse payments, or access your live bank account.
            </p>
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="font-bold text-amber-300">
                🔒 SECURITY RULE: Never share your UPI PIN or OTP with anyone.
              </span>
              <Link href="/privacy" className="text-[#00F0FF] font-bold hover:underline">
                Read Privacy & Limitations Disclosure ➔
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-white/10 bg-[#070B12] py-12 text-xs text-slate-400 relative z-10 px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00F0FF] to-[#0072FF] text-[#071629] font-bold text-xs">
              PR
            </div>
            <div>
              <span className="font-bold text-white text-sm">PayRakshak</span>
              <span className="text-slate-500 ml-2">© 2026 UPIResolve AI</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <a href="#simulator" className="hover:text-white transition-colors">Simulator</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/register" className="text-[#00F0FF] font-bold hover:underline">Launch App</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
