"use client";
import Link from "next/link";
import { useState } from "react";
import { API, api, fmtDate, money } from "@/lib/api";
import Shell from "@/components/Shell";
import { Badge, Empty, Notice, Pager, Skeleton, useLoad } from "@/components/ui";

function Importer({ done }: { done: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [prev, setPrev] = useState<any>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const form = () => { const f = new FormData(); f.append("file", file!); return f; };
  async function preview() { setMsg(null); try { setPrev(await api("/api/v1/transactions/import/preview", { form: form() })); } catch (e: any) { setMsg({ kind: "error", text: e.message }); } }
  async function run() {
    try { const r = await api("/api/v1/transactions/import", { form: form() }); setMsg({ kind: "ok", text: `Imported ${r.imported}, skipped ${r.duplicates_skipped} duplicates, ${r.invalid_rows} invalid rows. ${r.note}` }); setPrev(null); done(); }
    catch (e: any) { setMsg({ kind: "error", text: e.message }); }
  }
  return (
    <details className="card"><summary className="cursor-pointer font-medium">Import transactions from CSV</summary>
      <div className="mt-3 space-y-3 text-sm">
        <p>Columns: external_ref, occurred_at (ISO-8601), amount, direction, status, counterparty. Optional: merchant_ref, reversal_status. <a className="underline" href={`${API}/api/v1/transactions/import/template`}>Download template</a></p>
        <input type="file" accept=".csv" aria-label="CSV file" onChange={(e) => { setFile(e.target.files?.[0] || null); setPrev(null); }} />
        <div className="flex gap-2"><button className="btn-ghost" disabled={!file} onClick={preview}>Preview</button><button className="btn-primary" disabled={!file || !prev || prev.valid_rows === 0} onClick={run}>Import {prev?.valid_rows ?? ""} valid rows</button></div>
        {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
        {prev && <div><p>{prev.valid_rows} valid, {prev.invalid_rows} invalid, {prev.already_imported} already imported.</p>
          {prev.errors.map((e: any) => <p key={e.row} className="text-red-700">Row {e.row}: {e.errors.join("; ")}</p>)}</div>}
      </div></details>
  );
}

function Body() {
  const [f, setF] = useState({ q: "", status: "", direction: "" });
  const [page, setPage] = useState(1);
  const qs = new URLSearchParams({ page: String(page), page_size: "15", ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)) }).toString();
  const { data, error, loading, reload } = useLoad(() => api(`/api/v1/transactions?${qs}`), [qs]);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Transactions</h1>
      <Importer done={reload} />
      <div className="flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="Search reference or counterparty" aria-label="Search" value={f.q} onChange={(e) => { setPage(1); setF({ ...f, q: e.target.value }); }} />
        <select className="input max-w-[10rem]" aria-label="Status" value={f.status} onChange={(e) => { setPage(1); setF({ ...f, status: e.target.value }); }}>
          <option value="">All statuses</option>{["SUCCESS", "PENDING", "FAILED", "REVERSED"].map((s) => <option key={s}>{s}</option>)}</select>
        <select className="input max-w-[10rem]" aria-label="Direction" value={f.direction} onChange={(e) => { setPage(1); setF({ ...f, direction: e.target.value }); }}>
          <option value="">Sent & received</option><option>SENT</option><option>RECEIVED</option></select>
      </div>
      {error && <Notice>{error}</Notice>}
      {loading ? <Skeleton /> : data && data.items.length === 0 ? <Empty title="No transactions match" hint="Import a CSV or adjust the filters." /> : data && (
        <div className="card overflow-x-auto !p-0"><table className="w-full"><thead><tr><th className="th">Date</th><th className="th">Reference</th><th className="th">Counterparty</th><th className="th">Amount</th><th className="th">Status</th><th className="th">Source</th><th className="th"></th></tr></thead>
          <tbody>{data.items.map((t: any) => (
            <tr key={t.id} className="border-t border-ink-100"><td className="td whitespace-nowrap">{fmtDate(t.occurred_at)}</td><td className="td font-mono text-xs">{t.external_ref || "—"}</td><td className="td">{t.counterparty}</td>
              <td className="td whitespace-nowrap">{money(t.amount)} <span className="text-xs text-ink-500">{t.direction === "SENT" ? "sent" : "received"}</span></td><td className="td"><Badge v={t.status} /></td><td className="td"><Badge v={t.data_source} /></td>
              <td className="td">{t.open_disputes > 0 ? <span className="text-xs text-ink-500">Case open</span> : <Link className="underline" href={`/disputes/new?txn=${t.id}`}>Report issue</Link>}</td></tr>))}</tbody></table></div>)}
      {data && <Pager page={page} total={data.total} size={15} set={setPage} />}
    </div>
  );
}
export default function Page() { return <Shell roles={["CUSTOMER"]}><Body /></Shell>; }
