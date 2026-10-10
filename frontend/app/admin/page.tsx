"use client";
import { useState } from "react";
import { api, fmtDate, pretty } from "@/lib/api";
import Shell from "@/components/Shell";
import { Notice, Skeleton, useLoad } from "@/components/ui";
import { useUser } from "@/lib/auth";

const Bars = ({ title, data }: { title: string; data: Record<string, number> }) => {
  const max = Math.max(1, ...Object.values(data));
  return (<section className="card"><h2 className="mb-3 font-medium">{title}</h2>{Object.keys(data).length === 0 ? <p className="text-sm text-ink-500">No data yet.</p> :
    Object.entries(data).map(([k, v]) => <div key={k} className="mb-2 text-sm"><div className="flex justify-between"><span>{pretty(k)}</span><span>{v}</span></div><div className="h-2 rounded bg-ink-100"><div className="h-2 rounded bg-cy-500" style={{ width: `${(v / max) * 100}%` }} /></div></div>)}</section>);
};

function Body() {
  const me = useUser();
  const an = useLoad(() => api("/api/v1/admin/analytics"));
  const health = useLoad(() => api("/api/v1/admin/system-health"));
  const audit = useLoad(() => api("/api/v1/admin/audit-events?page_size=25"));
  const users = useLoad(() => api("/api/v1/admin/users"));
  const [msg, setMsg] = useState("");
  if (an.loading) return <Skeleton />;
  const a = an.data;
  const setRole = async (id: string, role: string) => { try { await api(`/api/v1/admin/users/${id}/role`, { body: { role } }); users.reload(); audit.reload(); setMsg(""); } catch (e: any) { setMsg(e.message); } };
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Admin</h1>
      {an.error && <Notice>{an.error}</Notice>}
      {a && <>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="card"><p className="text-3xl">{a.total_disputes}</p><p className="text-sm text-ink-500">Total cases</p></div>
          <div className="card"><p className="text-3xl">{a.avg_resolution_hours ?? "—"}</p><p className="text-sm text-ink-500">Avg hours to resolve</p></div>
          <div className="card"><p className="text-3xl">{a.model_abstention_rate == null ? "—" : `${(a.model_abstention_rate * 100).toFixed(0)}%`}</p><p className="text-sm text-ink-500">Model abstention rate</p></div>
        </div>
        <div className="grid gap-4 md:grid-cols-3"><Bars title="By status" data={a.by_status} /><Bars title="By category" data={a.by_category} /><Bars title="Findings by rule" data={a.findings_by_rule} /></div>
        <p className="text-xs text-ink-500">Accuracy is intentionally not shown: {a.definitions.accuracy}</p></>}
      <section className="card text-sm"><h2 className="mb-2 font-medium">System</h2>{health.data ? <><p>Database: {health.data.database} · Model: {health.data.model.available ? `${health.data.model.model_version} loaded` : "unavailable"}</p>
        {health.data.model.training_metrics && <p className="text-ink-500">Training macro-F1 {health.data.model.training_metrics.macro_f1} (held-out wording). {health.data.model.training_metrics.caveat}</p>}</> : <Skeleton />}</section>
      <section className="card overflow-x-auto"><h2 className="mb-2 font-medium">Users and roles</h2>{msg && <Notice>{msg}</Notice>}
        <table className="w-full"><tbody>{users.data?.map((u: any) => <tr key={u.id} className="border-t border-ink-100"><td className="td">{u.email}</td><td className="td">
          <select aria-label={`Role for ${u.email}`} className="input max-w-[12rem]" disabled={u.id === me.id} value={u.role} onChange={(e) => confirm(`Change role for ${u.email}?`) && setRole(u.id, e.target.value)}>{["CUSTOMER", "SUPPORT_AGENT", "ADMIN"].map((r) => <option key={r}>{r}</option>)}</select></td></tr>)}</tbody></table></section>
      <section className="card overflow-x-auto"><h2 className="mb-2 font-medium">Recent audit events</h2>
        <table className="w-full"><thead><tr><th className="th">Time</th><th className="th">Action</th><th className="th">Actor</th><th className="th">Entity</th></tr></thead>
          <tbody>{audit.data?.items.map((e: any) => <tr key={e.id} className="border-t border-ink-100"><td className="td whitespace-nowrap">{fmtDate(e.created_at)}</td><td className="td">{pretty(e.action)}</td><td className="td">{e.actor_role}</td><td className="td font-mono text-xs">{e.entity_id}</td></tr>)}</tbody></table></section>
    </div>
  );
}
export default function Page() { return <Shell roles={["ADMIN"]}><Body /></Shell>; }
