"use client";
import Link from "next/link";
import { useState } from "react";
import { api, fmtDate, pretty } from "@/lib/api";
import Shell from "@/components/Shell";
import { Badge, Empty, Notice, Pager, Skeleton, useLoad } from "@/components/ui";

const STATUSES = ["AWAITING_INFORMATION", "UNDER_REVIEW", "ACTION_RECOMMENDED", "ESCALATED", "REOPENED", "RESOLVED", "REJECTED", "WITHDRAWN"];

function Body() {
  const [f, setF] = useState({ status: "", category: "", q: "", mine: "" });
  const [page, setPage] = useState(1);
  const qs = new URLSearchParams({ page: String(page), page_size: "20", ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)) }).toString();
  const { data, error, loading } = useLoad(() => api(`/api/v1/support/cases?${qs}`), [qs]);
  const set = (k: string, v: string) => { setPage(1); setF({ ...f, [k]: v }); };
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Case queue</h1>
      <div className="flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="Search case ID" aria-label="Search" value={f.q} onChange={(e) => set("q", e.target.value)} />
        <select className="input max-w-[12rem]" aria-label="Status" value={f.status} onChange={(e) => set("status", e.target.value)}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{pretty(s)}</option>)}</select>
        <select className="input max-w-[14rem]" aria-label="Category" value={f.category} onChange={(e) => set("category", e.target.value)}><option value="">All categories</option>{["UNAUTHORIZED_TRANSACTION", "FAILED_TRANSACTION", "DUPLICATE_PAYMENT", "INCORRECT_AMOUNT", "MERCHANT_NON_DELIVERY", "REFUND_DELAY", "PENDING_TRANSACTION", "OTHER"].map((c) => <option key={c} value={c}>{pretty(c)}</option>)}</select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.mine} onChange={(e) => set("mine", e.target.checked ? "true" : "")} /> Assigned to me</label>
      </div>
      {error && <Notice>{error}</Notice>}
      {loading ? <Skeleton /> : data && data.items.length === 0 ? <Empty title="No cases match" hint="Cases appear here when customers submit them." /> : data && (
        <div className="card overflow-x-auto !p-0"><table className="w-full"><thead><tr><th className="th">Case</th><th className="th">Type</th><th className="th">Status</th><th className="th">Assigned</th><th className="th">Updated</th></tr></thead>
          <tbody>{data.items.map((d: any) => <tr key={d.case_id} className="border-t border-ink-100"><td className="td"><Link className="font-mono underline" href={`/support/${d.case_id}`}>{d.case_id}</Link></td><td className="td">{pretty(d.category) || "Unclassified"}</td><td className="td"><Badge v={d.status} /></td><td className="td">{d.assigned_to ? "Yes" : "Unassigned"}</td><td className="td whitespace-nowrap">{fmtDate(d.updated_at)}</td></tr>)}</tbody></table></div>)}
      {data && <Pager page={page} total={data.total} size={20} set={setPage} />}
    </div>
  );
}
export default function Page() { return <Shell roles={["SUPPORT_AGENT", "ADMIN"]}><Body /></Shell>; }
