"use client";
import Link from "next/link";
import { useState } from "react";
import { API } from "@/lib/api";
import { Badge, Notice } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeProvider";

type CaseInfo = {
  case_id: string;
  status: string;
  category: string;
  created_at: string;
  last_updated: string;
  amount?: number;
  currency?: string;
  summary?: string;
};

function fmtDate(s: string) {
  return new Date(s).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function money(v: number, curr = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: curr, minimumFractionDigits: 2 }).format(v);
}

const STATUS_STEPS = [
  "SUBMITTED",
  "VALIDATING",
  "AI_ANALYSIS",
  "AWAITING_INFORMATION",
  "UNDER_REVIEW",
  "ACTION_RECOMMENDED",
  "RESOLVED",
];

function ProgressBar({ status }: { status: string }) {
  const terminalFailure = ["REJECTED", "WITHDRAWN", "ESCALATED"].includes(status);
  const idx = STATUS_STEPS.indexOf(status);
  const current = terminalFailure ? -1 : idx === -1 ? 0 : idx;
  return (
    <div className="mt-4">
      {terminalFailure ? (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          This case is <Badge v={status} />. No further steps.
        </p>
      ) : (
        <div>
          <ol className="flex flex-wrap gap-1 text-xs font-mono">
            {STATUS_STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-1">
                <span
                  className={`rounded px-2 py-1 border transition-colors ${
                    i < current
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700"
                      : i === current
                      ? "bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-700 font-bold ring-2 ring-sky-400/30"
                      : "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700"
                  }`}
                >
                  {s.replace(/_/g, " ")}
                </span>
                {i < STATUS_STEPS.length - 1 && (
                  <span className="text-slate-300 dark:text-slate-600">›</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function TrackCase() {
  const [ref, setRef] = useState("");
  const [result, setResult] = useState<CaseInfo | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    const id = ref.trim();
    if (!id) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API}/api/v1/cases/track/${encodeURIComponent(id)}`, {
        credentials: "include",
      });
      if (res.status === 404) throw new Error("Case not found. Please check the reference and try again.");
      if (!res.ok) throw new Error("Unable to look up this case right now. Please try again later.");
      setResult(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B0F17]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white font-bold shadow-sm">
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-semibold text-base text-slate-900 dark:text-white">PayRakshak</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-16">
        <div className="w-full max-w-xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 mb-4">
              <svg width={28} height={28} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Track a Dispute Case</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Enter your Case Reference ID to check your dispute status — no login required.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <form onSubmit={lookup} className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="e.g. CASE-2024-00123"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                aria-label="Case reference ID"
                autoComplete="off"
              />
              <button className="btn-primary px-5" disabled={busy || !ref.trim()}>
                {busy ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : "Track"}
              </button>
            </form>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4">
              <Notice>{error}</Notice>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-6 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-widest">Case ID</p>
                  <p className="font-bold text-lg text-slate-900 dark:text-white font-mono">{result.case_id}</p>
                </div>
                <Badge v={result.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Category</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{result.category.replace(/_/g, " ")}</p>
                </div>
                {result.amount !== undefined && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Amount</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{money(result.amount, result.currency)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Filed On</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{fmtDate(result.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Last Updated</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{fmtDate(result.last_updated)}</p>
                </div>
              </div>

              {result.summary && (
                <p className="text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
                  {result.summary}
                </p>
              )}

              <ProgressBar status={result.status} />

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex gap-3 flex-wrap">
                <Link href="/login" className="btn-primary text-sm">
                  Sign in to manage case
                </Link>
                <Link href="/register" className="btn-ghost text-sm">
                  Create account
                </Link>
              </div>
            </div>
          )}

          <p className="text-center mt-10 text-xs text-slate-400 dark:text-slate-500 leading-relaxed max-w-sm mx-auto">
            This lookup only reveals status information. Full case details, evidence uploads, and dispute actions require signing in.
          </p>
        </div>
      </main>
    </div>
  );
}
