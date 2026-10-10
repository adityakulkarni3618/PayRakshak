"use client";
import Link from "next/link";
import { useState } from "react";
import { api, fmtDate, pretty } from "@/lib/api";
import Shell from "@/components/Shell";
import { Badge, Empty, Notice, Pager, Skeleton, useLoad } from "@/components/ui";

function Body() {
  const [page, setPage] = useState(1);
  const { data, error, loading } = useLoad(() => api(`/api/v1/disputes?page=${page}&page_size=15`), [page]);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="font-display text-3xl">My cases</h1><Link href="/disputes/new" className="btn-primary">Report an issue</Link></div>
      {error && <Notice>{error}</Notice>}
      {loading ? <Skeleton /> : data && data.items.length === 0 ? <Empty title="No cases yet" hint="When something goes wrong with a payment, report it from a transaction."><Link className="btn-primary" href="/disputes/new">Report an issue</Link></Empty> : data && (
        <div className="card !p-0"><table className="w-full"><thead><tr><th className="th">Case</th><th className="th">Type</th><th className="th">Status</th><th className="th">Updated</th></tr></thead>
          <tbody>{data.items.map((d: any) => <tr key={d.case_id} className="border-t border-ink-100"><td className="td"><Link className="font-mono underline" href={`/disputes/${d.case_id}`}>{d.case_id}</Link></td><td className="td">{pretty(d.category) || "Not yet identified"}</td><td className="td"><Badge v={d.status} /></td><td className="td">{fmtDate(d.updated_at)}</td></tr>)}</tbody></table></div>)}
      {data && <Pager page={page} total={data.total} size={15} set={setPage} />}
    </div>
  );
}
export default function Page() { return <Shell roles={["CUSTOMER"]}><Body /></Shell>; }
