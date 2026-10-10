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
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans antialiased">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[450px] w-[800px] bg-sky-900/15 blur-[120px] rounded-full" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#0B0F17]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white font-bold shadow-sm">
              <svg width={20} height={20} style={{ width: "20px", height: "20px" }} className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-base text-white tracking-tight flex items-center gap-2">
                PayRakshak
                <span className="text-[11px] font-medium bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">UPIResolve AI</span>
              </div>
            </div>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#simulator" className="hover:text-white transition-colors">Dispute Simulator</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy & Governance</Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="px-4 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="pt-16 pb-14 text-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-medium text-sky-300 mb-6">
            Official UPI Dispute Advisory & Decision Support Platform
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl leading-tight">
            Intelligent, Explainable Dispute Resolution for <span className="text-sky-400">UPI Payments</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
            Understand transaction discrepancies, evaluate ledger consistency, and generate audit-ready advisory findings with human-in-the-loop decision controls.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="px-6 py-3 text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors shadow-sm w-full sm:w-auto">
              Create Account ➔
            </Link>
            <a href="#simulator" className="px-6 py-3 text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors w-full sm:w-auto">
              Explore Live Simulator
            </a>
          </div>

          {/* Trust Metric Cards */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Analysis Latency</div>
              <div className="text-lg font-bold text-white mt-1">&lt; 2 Seconds</div>
              <div className="text-xs text-slate-400 mt-0.5">Automated rule evaluation</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Decision Protocol</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">100% Advisory Only</div>
              <div className="text-xs text-slate-400 mt-0.5">Human approval required</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Audit Trail</div>
              <div className="text-lg font-bold text-white mt-1">Immutable Log</div>
              <div className="text-xs text-slate-400 mt-0.5">Role-restricted access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Dispute Simulator */}
      <section id="simulator" className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/40">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Interactive Dispute Scenario Simulator</h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400">Select a real-world UPI scenario to see how PayRakshak evaluates transaction consistency and recommends next steps.</p>
          </div>

          {/* Scenario Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {DEMO_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setActiveScenario(scenario)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  activeScenario.id === scenario.id
                    ? "bg-sky-600/20 border-sky-500 text-sky-300"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {scenario.label}
              </button>
            ))}
          </div>

          {/* Dispute Card View */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg overflow-hidden">
            {/* Header / Tabs */}
            <div className="border-b border-slate-800 bg-slate-950/80 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-400">CASE REF:</span>
                <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-1 rounded">{activeScenario.ref}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {activeScenario.category}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeTab === "overview" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("consistency")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeTab === "consistency" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Consistency Check
                </button>
                <button
                  onClick={() => setActiveTab("resolution")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeTab === "resolution" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Advisory Path
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Complaint & Transaction info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Customer Statement</div>
                  <p className="text-sm text-slate-200 leading-relaxed font-normal">"{activeScenario.complaint}"</p>
                </div>

                {activeTab === "overview" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
                      <div className="text-[11px] text-slate-400">Disputed Amount</div>
                      <div className="text-base font-bold text-white mt-0.5">{activeScenario.amount}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
                      <div className="text-[11px] text-slate-400">Ledger Status</div>
                      <div className="text-sm font-bold text-amber-400 mt-0.5">{activeScenario.status}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 col-span-2 sm:col-span-1">
                      <div className="text-[11px] text-slate-400">Evaluation Tag</div>
                      <div className="text-xs font-mono text-sky-400 mt-1 truncate">{activeScenario.finding}</div>
                    </div>
                  </div>
                )}

                {activeTab === "consistency" && (
                  <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Customer Claim Match</span>
                      <span className="text-emerald-400 font-semibold">VERIFIED</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Bank Switch Status Code</span>
                      <span className="text-slate-200 font-mono">PAYMENT_PENDING_REVERSAL</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-400">Merchant Confirmation</span>
                      <span className="text-amber-400 font-mono">UNCONFIRMED_BY_POS</span>
                    </div>
                  </div>
                )}

                {activeTab === "resolution" && (
                  <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Recommended Action Plan</div>
                    <p className="text-sm text-sky-300 font-medium">{activeScenario.recommendation}</p>
                  </div>
                )}
              </div>

              {/* Right Column: AI Finding & CTA */}
              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Advisory Status</div>
                  <div className="inline-block px-2.5 py-1 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300 font-mono text-xs font-bold mb-3">
                    {activeScenario.risk}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    AI models generate explainable recommendations. Human support agents remain in control of final case transitions.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <Link
                    href="/register"
                    className="block w-full text-center py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition-colors shadow-sm"
                  >
                    Test Full Workflow
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process Workflow */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How PayRakshak Works</h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400">Streamlined 3-step process from issue reporting to official resolution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 relative">
              <div className="h-8 w-8 rounded-lg bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Submit Transaction Complaint</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Customers provide the disputed transaction reference, amount, and description. File evidence uploads are supported.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 relative">
              <div className="h-8 w-8 rounded-lg bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Automated Evaluation</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Consistency rules evaluate ledger records, bank status codes, and potential duplicate debits in real time.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 relative">
              <div className="h-8 w-8 rounded-lg bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Agent Decision & Audit</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Support staff review explainable recommendations, confirm resolution paths, and update case audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/40">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Platform Capabilities</h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400">Built for accuracy, transparency, and operational compliance.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="font-semibold text-white mb-1.5 text-base">Immutable Audit Log</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every status transition, agent action, and resolution trigger is logged for full accountability.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="font-semibold text-white mb-1.5 text-base">Rule-Based Consistency</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates payment status against merchant logs and NPCI switch codes to prevent false claims.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="font-semibold text-white mb-1.5 text-base">Explainable AI</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Model predictions highlight specific reasoning factors rather than opaque confidence scores.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="font-semibold text-white mb-1.5 text-base">Role-Based Access</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Strict database-enforced permissions for Customers, Support Agents, and System Administrators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advisory Governance & Compliance Disclosure */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800 bg-slate-900/30 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="inline-block p-2 rounded-lg bg-sky-500/10 text-sky-400 mb-3 border border-sky-500/20 text-xs font-semibold">
            GOVERNANCE & SAFETY DISCLOSURE
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            PayRakshak (UPIResolve AI) provides decision-support and advisory recommendations only. The system does not directly transfer funds, execute bank reversals, or close dispute cases automatically. All final resolution decisions are verified and initiated by authorized personnel.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F17] py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">PayRakshak</span>
            <span>•</span>
            <span>UPI Dispute Resolution Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/login" className="hover:text-slate-300 transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-slate-300 transition-colors">Create Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
