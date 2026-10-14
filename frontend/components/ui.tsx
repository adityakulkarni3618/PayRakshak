"use client";
import { useEffect, useState } from "react";
import { pretty } from "@/lib/api";

// ──────────────────────────────────────────────
// 1. Color-coded transaction status badges
//    Light mode aware + clear visual meaning
// ──────────────────────────────────────────────
const TONE: Record<string, string> = {
  // Dispute statuses
  SUBMITTED:             "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700",
  VALIDATING:            "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700",
  AI_ANALYSIS:           "bg-sky-50 text-sky-700 border-sky-200 dark:bg-slate-800/80 dark:text-cyan-300 dark:border-cyan-500/30",
  AWAITING_INFORMATION:  "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  UNDER_REVIEW:          "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
  ACTION_RECOMMENDED:    "bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
  ESCALATED:             "bg-red-50 text-red-700 border-red-300 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  RESOLVED:              "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  REJECTED:              "bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700",
  WITHDRAWN:             "bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700",
  REOPENED:              "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",

  // Severity
  HIGH:   "bg-red-50 text-red-700 border-red-300 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  LOW:    "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700",
  INFO:   "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",

  // Transaction statuses — color-coded for instant understanding
  SUCCESS:   "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  FAILED:    "bg-red-50 text-red-700 border-red-300 font-bold dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  PENDING:   "bg-amber-50 text-amber-700 border-amber-300 font-bold dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  REVERSED:  "bg-blue-50 text-blue-700 border-blue-300 font-bold dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",

  // Data sources
  SYNTHETIC:         "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
  USER_IMPORTED:     "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700",
  PROVIDER_VERIFIED: "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",

  // Evidence review
  ACCEPTED:          "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  NEEDS_BETTER_COPY: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
};

// Status dot icons for quick visual scan
const STATUS_DOT: Record<string, string> = {
  SUCCESS:  "●",
  FAILED:   "●",
  PENDING:  "◌",
  REVERSED: "↩",
  RESOLVED: "✓",
  REJECTED: "✗",
  ESCALATED:"!",
};

export const Badge = ({ v }: { v?: string | null }) => (
  <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide font-mono transition-colors ${TONE[v || ""] || "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700"}`}>
    {STATUS_DOT[v || ""] && <span aria-hidden className="text-[10px]">{STATUS_DOT[v || ""]}</span>}
    {pretty(v) || "None"}
  </span>
);

// ──────────────────────────────────────────────
// 2. Notice component — light + dark aware
// ──────────────────────────────────────────────
export function Notice({ kind = "error", children }: { kind?: "error" | "info" | "ok" | "warn"; children: React.ReactNode }) {
  const c = {
    error: "border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200",
    info:  "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-500/40 dark:bg-sky-900/30 dark:text-sky-200",
    ok:    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-200",
    warn:  "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-200",
  }[kind];
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm font-medium ${c}`}>
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────
// 3. Empty state — improved for mobile & light mode
// ──────────────────────────────────────────────
export const Empty = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children?: React.ReactNode;
}) => (
  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-10 text-center">
    <div className="text-3xl mb-3">📭</div>
    <p className="font-semibold text-slate-800 dark:text-slate-200 text-base">{title}</p>
    {hint && (
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{hint}</p>
    )}
    <div className="mt-5">{children}</div>
  </div>
);

// ──────────────────────────────────────────────
// 4. Skeleton — light + dark aware animation
// ──────────────────────────────────────────────
export const Skeleton = () => (
  <div className="space-y-3" aria-busy="true" aria-label="Loading…">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-12 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5"
      />
    ))}
  </div>
);

// ──────────────────────────────────────────────
// 5. useLoad hook — unchanged
// ──────────────────────────────────────────────
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    setLoading(true);
    fn()
      .then((d) => live && (setData(d), setError("")))
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { data, error, loading, reload: () => setTick((t) => t + 1) };
}

// ──────────────────────────────────────────────
// 6. Pager — light + dark aware
// ──────────────────────────────────────────────
export const Pager = ({
  page,
  total,
  size,
  set,
}: {
  page: number;
  total: number;
  size: number;
  set: (p: number) => void;
}) => (
  <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
    <span>
      Showing {total} result{total === 1 ? "" : "s"}
    </span>
    <div className="flex gap-2">
      <button
        className="btn-ghost px-3 py-1.5 text-xs"
        disabled={page <= 1}
        onClick={() => set(page - 1)}
      >
        ← Previous
      </button>
      <button
        className="btn-ghost px-3 py-1.5 text-xs"
        disabled={page * size >= total}
        onClick={() => set(page + 1)}
      >
        Next →
      </button>
    </div>
  </div>
);
