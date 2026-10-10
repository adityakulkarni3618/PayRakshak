"use client";
import Link from "next/link";
import { api, fmtDate, money } from "@/lib/api";
import Shell from "@/components/Shell";
import { Badge, Empty, Notice, Skeleton, useLoad } from "@/components/ui";
import { pretty } from "@/lib/api";

function Body() {
  const { data, error, loading } = useLoad(() => api("/api/v1/dashboard"));
  const notes = useLoad(() => api("/api/v1/notifications"));
  if (loading) return <Skeleton />;
  if (error || !data) return <Notice>{error || "Could not load the dashboard."}</Notice>;
  const stats: [string, number][] = [["Transactions", data.total_transactions], ["Active cases", data.active_disputes], ["Need your input", data.awaiting_information], ["Under review", data.awaiting_review]];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Dashboard</h1>
        <Link href="/disputes/new" className="btn-primary">Report a payment issue</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([l, v]) => <div key={l} className="card"><p className="text-3xl font-medium">{v}</p><p className="text-sm text-ink-500">{l}</p></div>)}
      </div>
      {data.total_transactions === 0 && <Empty title="No transactions yet" hint="Import a CSV to start. Imported records are labelled by source."><Link className="btn-primary" href="/transactions">Import transactions</Link></Empty>}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="card"><h2 className="mb-3 font-medium">Recently updated cases</h2>
          {data.recent_cases.length === 0 ? <p className="text-sm text-ink-500">No cases yet.</p> : data.recent_cases.map((c: any) => (
            <Link key={c.case_id} href={`/disputes/${c.case_id}`} className="flex items-center justify-between border-t border-ink-100 py-2 text-sm first:border-0">
              <span><span className="font-mono">{c.case_id}</span><span className="ml-2 text-ink-500">{pretty(c.category)}</span></span><Badge v={c.status} /></Link>))}
        </section>
        <section className="card"><h2 className="mb-3 font-medium">Notifications</h2>
          {!notes.data?.length ? <p className="text-sm text-ink-500">Nothing new.</p> : notes.data.slice(0, 6).map((n: any) => <p key={n.id} className="border-t border-ink-100 py-2 text-sm first:border-0">{n.message}<span className="block text-xs text-ink-500">{fmtDate(n.created_at)}</span></p>)}
        </section>
      </div>
      {data.recent_transactions.length > 0 && <section className="card"><h2 className="mb-3 font-medium">Recent transactions</h2>
        {data.recent_transactions.map((t: any) => <div key={t.id} className="flex items-center justify-between border-t border-ink-100 py-2 text-sm first:border-0"><span>{t.counterparty}<span className="ml-2 font-mono text-xs text-ink-500">{t.external_ref}</span></span><span className="flex items-center gap-2">{money(t.amount)} <Badge v={t.status} /></span></div>)}</section>}
    </div>
  );
}
export default function Page() { return <Shell roles={["CUSTOMER"]}><Body /></Shell>; }
