"use client";
import { useState } from "react";
import { API, api, fmtDate, money, pretty } from "@/lib/api";
import { Badge, Notice, Skeleton, useLoad } from "./ui";

export default function CaseView({ caseId, staff, role }: { caseId: string; staff: boolean; role?: string }) {
  const base = staff ? `/api/v1/support/cases/${caseId}` : `/api/v1/disputes/${caseId}`;
  const { data: d, error, loading, reload } = useLoad(() => api(base), [caseId]);
  const tl = useLoad(() => api(`/api/v1/disputes/${caseId}/timeline`), [caseId, d?.status, d?.updated_at]);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const act = async (path: string, body?: unknown, okText = "Done.") => {
    try { await api(path, { body: body ?? {} }); setMsg({ kind: "ok", text: okText }); setText(""); reload(); } catch (e: any) { setMsg({ kind: "error", text: e.message }); }
  };
  const upload = async (file: File) => { const fd = new FormData(); fd.append("file", file); try { await api(`/api/v1/disputes/${caseId}/evidence`, { form: fd }); setMsg({ kind: "ok", text: "Evidence uploaded." }); reload(); } catch (e: any) { setMsg({ kind: "error", text: e.message }); } };
  if (loading) return <Skeleton />;
  if (error || !d) return <Notice>{error || "Case not found."}</Notice>;
  const a = d.analysis, rec = d.recommendation, x = a?.explanation;
  const closed = ["RESOLVED", "REJECTED", "WITHDRAWN"].includes(d.status);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><h1 className="font-mono text-2xl">{d.case_id}</h1><p className="text-sm text-ink-500">Opened {fmtDate(d.created_at)} · {pretty(d.effective_category) || "Type not yet identified"}</p></div>
        <Badge v={d.status} />
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      {staff && d.customer && <p className="text-sm text-ink-500">Customer: {d.customer.name} ({d.customer.email})</p>}

      {x && <section className="card space-y-2"><h2 className="font-medium">What we found</h2><p>{x.summary}</p>
        <p className="text-xs text-ink-500">{x.confidence_note}</p>
        {a.ai_available ? <p className="text-sm">Model prediction: <b>{pretty(a.explanation.predicted_category)}</b>{a.confidence != null && <> · confidence {(a.confidence * 100).toFixed(0)}%</>} <span className="text-ink-500">({a.model_version})</span>{x.matched_terms?.length > 0 && <span className="text-ink-500"> · key terms: {x.matched_terms.join(", ")}</span>}</p>
          : <Notice kind="warn">Automated classification was unavailable for this case. A person will review it.</Notice>}</section>}

      {d.transaction && <section className="card text-sm"><h2 className="mb-2 font-medium">Transaction</h2>
        <p>{d.transaction.counterparty} · {money(d.transaction.amount)} · {fmtDate(d.transaction.occurred_at)}</p>
        <p className="mt-1 flex flex-wrap items-center gap-2"><Badge v={d.transaction.status} /><Badge v={d.transaction.data_source} /><span className="font-mono text-xs">{d.transaction.external_ref}</span><span className="text-ink-500">Reversal: {pretty(d.transaction.reversal_status)}</span></p></section>}

      <section className="card"><h2 className="mb-2 font-medium">Your description</h2><p className="whitespace-pre-wrap text-sm">{d.description}</p></section>

      {d.findings.length > 0 && <section className="card"><h2 className="mb-2 font-medium">Checks on the records</h2>
        <ul className="space-y-3">{d.findings.map((f: any) => <li key={f.rule_id + f.explanation} className="text-sm"><span className="mr-2"><Badge v={f.severity} /></span><span className="mr-2 text-xs text-ink-500">{pretty(f.kind)}</span>{f.explanation}
          <p className="text-ink-500">Next: {f.next_step}</p>{staff && <p className="font-mono text-xs text-ink-500">{f.rule_id} · refs {f.source_ids.join(", ")}</p>}</li>)}</ul></section>}

      {rec && <section className="card space-y-2"><h2 className="font-medium">Recommended next step</h2><p className="text-sm"><b>{pretty(rec.action)}.</b> {rec.explanation}</p>
        {rec.missing_information.length > 0 && <p className="text-sm">Still needed: {rec.missing_information.join("; ")}</p>}
        <p className="text-xs text-ink-500">Advisory only. Nothing is refunded or closed automatically. {rec.requires_human_review ? "A person must review this case." : "Eligible for the simpler workflow, still subject to staff approval."} ({rec.rule_version})</p>
        {staff && rec.review_reasons.length > 0 && <p className="text-xs">Review reasons: {rec.review_reasons.join(", ")}</p>}</section>}

      <section className="card"><h2 className="mb-2 font-medium">Evidence</h2>
        {d.evidence.length === 0 && <p className="text-sm text-ink-500">No files uploaded.</p>}
        {d.evidence.map((e: any) => <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 py-2 text-sm first:border-0">
          <span><a className="underline" href={`${API}/api/v1/disputes/${caseId}/evidence/${e.id}`} target="_blank" rel="noreferrer">{e.name}</a> <span className="text-ink-500">{(e.size / 1024).toFixed(0)} KB</span> {e.review_outcome && <Badge v={e.review_outcome} />}</span>
          {staff && !closed && <span className="flex gap-1">{["ACCEPTED", "NEEDS_BETTER_COPY", "REJECTED"].map((o) => <button key={o} className="btn-ghost !px-2 !py-1 text-xs" onClick={() => act(`/api/v1/support/cases/${caseId}/evidence/${e.id}/review`, { outcome: o }, "Evidence reviewed.")}>{pretty(o)}</button>)}</span>}</div>)}
        {!closed && <div className="mt-2"><label className="label" htmlFor="up">Add evidence (PNG, JPG or PDF, up to 5 MB)</label><input id="up" type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></div>}</section>

      {d.comments.length > 0 && <section className="card"><h2 className="mb-2 font-medium">Messages</h2>{d.comments.map((c: any) => <p key={c.id} className="border-t border-ink-100 py-2 text-sm first:border-0"><span className="text-xs text-ink-500">{pretty(c.kind)}{staff && !c.visible_to_customer ? " (internal)" : ""} · {fmtDate(c.created_at)}</span><br />{c.body}</p>)}</section>}

      {!staff && !closed && <section className="card space-y-2"><label className="label" htmlFor="r">{d.status === "AWAITING_INFORMATION" ? "We need more information. Reply here:" : "Add information to your case"}</label>
        <textarea id="r" className="input h-24" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex gap-2"><button className="btn-primary" disabled={text.trim().length < 3} onClick={() => act(`/api/v1/disputes/${caseId}/additional-information`, { message: text }, "Sent.")}>Send</button>
          <button className="btn-danger" onClick={() => confirm("Withdraw this case? This cannot be undone.") && act(`/api/v1/disputes/${caseId}/withdraw`, {}, "Case withdrawn.")}>Withdraw case</button></div></section>}
      {!staff && ["RESOLVED", "REJECTED"].includes(d.status) && <section className="card"><p className="mb-2 text-sm">Outcome: {d.resolution_summary}</p><label className="label" htmlFor="ro">Have new information? Reopen the case:</label><textarea id="ro" className="input h-20" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-ghost mt-2" disabled={text.trim().length < 3} onClick={() => act(`/api/v1/disputes/${caseId}/additional-information`, { message: text }, "Case reopened.")}>Reopen with this information</button></section>}

      {staff && <section className="card space-y-3"><h2 className="font-medium">Reviewer actions</h2>
        <textarea className="input h-24" aria-label="Note or message" placeholder="Note, message to customer, or decision reason" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => act(`/api/v1/support/cases/${caseId}/assign`, {}, "Assigned to you.")}>Assign to me</button>
          <button className="btn-ghost" disabled={text.trim().length < 1} onClick={() => act(`/api/v1/support/cases/${caseId}/note`, { body: text }, "Note saved (internal).")}>Save internal note</button>
          <button className="btn-ghost" disabled={text.trim().length < 3 || closed} onClick={() => act(`/api/v1/support/cases/${caseId}/request-information`, { message: text }, "Customer asked for information.")}>Request information</button>
          <button className="btn-ghost" disabled={text.trim().length < 1 || closed} onClick={() => act(`/api/v1/support/cases/${caseId}/escalate`, { body: text }, "Escalated.")}>Escalate</button></div>
        <div className="flex flex-wrap gap-2 border-t border-ink-100 pt-3">
          {([["APPROVE_RECOMMENDATION", "Approve recommendation", "btn-primary"], ["RESOLVE", "Mark resolved", "btn-ghost"], ["REJECT", "Reject case", "btn-danger"]] as const).map(([dec, label, cls]) =>
            <button key={dec} className={cls} disabled={text.trim().length < 3} onClick={() => confirm(`${label}? The customer will be notified.`) && act(`/api/v1/support/cases/${caseId}/review`, { decision: dec, note: text }, "Decision recorded.")}>{label}</button>)}</div>
        <p className="text-xs text-ink-500">The system never moves money. Resolving only records your decision; any refund goes through the bank or payment provider.</p></section>}

      <section className="card"><h2 className="mb-2 font-medium">Timeline</h2>{tl.data?.map((e: any, i: number) => <p key={i} className="border-t border-ink-100 py-1.5 text-sm first:border-0"><span className="text-xs text-ink-500">{fmtDate(e.created_at)}</span> {pretty(e.action)}{e.detail?.to && <> → <Badge v={e.detail.to} /></>}{staff && e.detail?.note && <span className="text-ink-500"> · {e.detail.note}</span>}</p>)}</section>
    </div>
  );
}
