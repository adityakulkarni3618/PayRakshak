"use client";
import { useEffect, useState } from "react";
import { pretty } from "@/lib/api";

const TONE: Record<string, string> = {
  SUBMITTED: "bg-slate-800/80 text-slate-300 border-slate-700",
  VALIDATING: "bg-slate-800/80 text-slate-300 border-slate-700",
  AI_ANALYSIS: "bg-slate-800/80 text-cyan-300 border-cyan-500/30",
  AWAITING_INFORMATION: "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
  UNDER_REVIEW: "bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]",
  ACTION_RECOMMENDED: "bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]",
  ESCALATED: "bg-red-500/15 text-red-300 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
  RESOLVED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
  REJECTED: "bg-slate-800/80 text-slate-400 border-slate-700",
  WITHDRAWN: "bg-slate-800/80 text-slate-400 border-slate-700",
  REOPENED: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  HIGH: "bg-red-500/15 text-red-300 border-red-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  LOW: "bg-slate-800/80 text-slate-300 border-slate-700",
  INFO: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  SUCCESS: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  FAILED: "bg-red-500/15 text-red-300 border-red-500/30",
  PENDING: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  REVERSED: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  SYNTHETIC: "bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]",
  USER_IMPORTED: "bg-slate-800/80 text-slate-300 border-slate-700",
  PROVIDER_VERIFIED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
};

export const Badge = ({ v }: { v?: string | null }) => (
  <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide font-mono transition-all ${TONE[v || ""] || "bg-slate-800/80 text-slate-300 border-slate-700"}`}>
    {pretty(v) || "None"}
  </span>
);

export function Notice({ kind = "error", children }: { kind?: "error" | "info" | "ok" | "warn"; children: React.ReactNode }) {
  const c = {
    error: "border-red-500/40 bg-red-950/40 text-red-200 shadow-[0_4px_12px_rgba(239,68,68,0.15)]",
    info: "border-[#00F0FF]/40 bg-[#00F0FF]/10 text-cyan-200 shadow-[0_4px_12px_rgba(0,240,255,0.15)]",
    ok: "border-emerald-500/40 bg-emerald-950/40 text-emerald-200 shadow-[0_4px_12px_rgba(16,185,129,0.15)]",
    warn: "border-amber-500/40 bg-amber-950/40 text-amber-200 shadow-[0_4px_12px_rgba(245,158,11,0.15)]",
  }[kind];
  return <div role={kind === "error" ? "alert" : "status"} className={`rounded-lg border backdrop-blur-md px-4 py-3 text-sm font-medium ${c}`}>{children}</div>;
}

export const Empty = ({ title, hint, children }: { title: string; hint?: string; children?: React.ReactNode }) => (
  <div className="card-3d p-10 text-center">
    <p className="font-semibold text-slate-200 text-base">{title}</p>
    {hint && <p className="mt-1.5 text-sm text-slate-400 max-w-sm mx-auto">{hint}</p>}
    <div className="mt-4">{children}</div>
  </div>
);

export const Skeleton = () => (
  <div className="space-y-3" aria-busy="true">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-800/60 border border-white/5" />
    ))}
  </div>
);

export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    setLoading(true);
    fn().then((d) => live && (setData(d), setError(""))).catch((e) => live && setError(e.message)).finally(() => live && setLoading(false));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { data, error, loading, reload: () => setTick((t) => t + 1) };
}

export const Pager = ({ page, total, size, set }: { page: number; total: number; size: number; set: (p: number) => void }) => (
  <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-mono">
    <span>Showing {total} result{total === 1 ? "" : "s"}</span>
    <div className="flex gap-2">
      <button className="btn-3d-secondary px-3 py-1.5 text-xs" disabled={page <= 1} onClick={() => set(page - 1)}>Previous</button>
      <button className="btn-3d-secondary px-3 py-1.5 text-xs" disabled={page * size >= total} onClick={() => set(page + 1)}>Next</button>
    </div>
  </div>
);
