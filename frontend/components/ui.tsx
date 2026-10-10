"use client";
import { useEffect, useState } from "react";
import { pretty } from "@/lib/api";

const TONE: Record<string, string> = {
  SUBMITTED: "bg-ink-100 text-ink-700", VALIDATING: "bg-ink-100 text-ink-700", AI_ANALYSIS: "bg-ink-100 text-ink-700",
  AWAITING_INFORMATION: "bg-amber-100 text-amber-800", UNDER_REVIEW: "bg-blue-100 text-blue-800", ACTION_RECOMMENDED: "bg-cyan-100 text-cyan-800",
  ESCALATED: "bg-red-100 text-red-800", RESOLVED: "bg-emerald-100 text-emerald-800", REJECTED: "bg-ink-200 text-ink-700",
  WITHDRAWN: "bg-ink-200 text-ink-700", REOPENED: "bg-amber-100 text-amber-800",
  HIGH: "bg-red-100 text-red-800", MEDIUM: "bg-amber-100 text-amber-800", LOW: "bg-ink-100 text-ink-700", INFO: "bg-ink-100 text-ink-500",
  SUCCESS: "bg-emerald-100 text-emerald-800", FAILED: "bg-red-100 text-red-800", PENDING: "bg-amber-100 text-amber-800", REVERSED: "bg-blue-100 text-blue-800",
  SYNTHETIC: "bg-violet-100 text-violet-800", USER_IMPORTED: "bg-ink-100 text-ink-700", PROVIDER_VERIFIED: "bg-emerald-100 text-emerald-800",
};
export const Badge = ({ v }: { v?: string | null }) => (
  <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${TONE[v || ""] || "bg-ink-100 text-ink-700"}`}>{pretty(v) || "None"}</span>
);

export function Notice({ kind = "error", children }: { kind?: "error" | "info" | "ok" | "warn"; children: React.ReactNode }) {
  const c = { error: "border-red-300 bg-red-50 text-red-800", info: "border-cy-500 bg-cyan-50 text-ink-900", ok: "border-emerald-300 bg-emerald-50 text-emerald-800", warn: "border-amber-300 bg-amber-50 text-amber-900" }[kind];
  return <div role={kind === "error" ? "alert" : "status"} className={`rounded-md border px-3 py-2 text-sm ${c}`}>{children}</div>;
}

export const Empty = ({ title, hint, children }: { title: string; hint?: string; children?: React.ReactNode }) => (
  <div className="rounded-lg border border-dashed border-ink-200 p-8 text-center">
    <p className="font-medium">{title}</p>{hint && <p className="mt-1 text-sm text-ink-500">{hint}</p>}<div className="mt-3">{children}</div>
  </div>
);

export const Skeleton = () => <div className="space-y-2" aria-busy="true">{[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded bg-ink-100" />)}</div>;

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
  <div className="mt-3 flex items-center justify-between text-sm text-ink-500">
    <span>{total} result{total === 1 ? "" : "s"}</span>
    <div className="flex gap-2">
      <button className="btn-ghost" disabled={page <= 1} onClick={() => set(page - 1)}>Previous</button>
      <button className="btn-ghost" disabled={page * size >= total} onClick={() => set(page + 1)}>Next</button>
    </div>
  </div>
);
