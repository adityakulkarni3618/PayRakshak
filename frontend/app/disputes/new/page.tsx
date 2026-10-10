"use client";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, fmtDate, money, pretty } from "@/lib/api";
import Shell from "@/components/Shell";
import { Badge, Notice, Skeleton, useLoad } from "@/components/ui";

const CATS = ["FAILED_TRANSACTION", "DUPLICATE_PAYMENT", "UNAUTHORIZED_TRANSACTION", "INCORRECT_AMOUNT", "MERCHANT_NON_DELIVERY", "REFUND_DELAY", "PENDING_TRANSACTION", "OTHER"];

function Wizard() {
  const router = useRouter();
  const sp = useSearchParams();
  const key = useMemo(() => crypto.randomUUID(), []); // one idempotency key per form: double-clicks cannot create two cases
  const txns = useLoad(() => api("/api/v1/transactions?page_size=100"));
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ txn: sp.get("txn") || "", cat: "HELP", desc: "", claimed: "", order: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const txn = txns.data?.items.find((t: any) => t.id === f.txn);
  const valid = [false, !!f.txn, true, f.desc.trim().length >= 15, true, true][step];
  async function submit() {
    setBusy(true); setErr("");
    try {
      const d = await api("/api/v1/disputes", { headers: { "Idempotency-Key": key }, body: { transaction_id: f.txn, selected_category: f.cat === "HELP" ? null : f.cat, description: f.desc, claimed_amount: f.claimed || null, order_reference: f.order || null } });
      for (const file of files) { const fd = new FormData(); fd.append("file", file); await api(`/api/v1/disputes/${d.case_id}/evidence`, { form: fd }).catch((e) => setErr(`Case created, but ${file.name} failed: ${e.message}`)); }
      router.replace(`/disputes/${d.case_id}`);
    } catch (e: any) { setErr(e.message); setBusy(false); }
  }
  if (txns.loading) return <Skeleton />;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Report a payment issue</h1>
      <p className="text-sm text-ink-500">Step {step} of 5. Never enter your UPI PIN or OTP here.</p>
      {err && <Notice>{err}</Notice>}
      <div className="card space-y-4">
        {step === 1 && <div><label className="label" htmlFor="t">Which transaction?</label>
          <select id="t" className="input" value={f.txn} onChange={(e) => setF({ ...f, txn: e.target.value })}><option value="">Select a transaction</option>
            {txns.data?.items.map((t: any) => <option key={t.id} value={t.id}>{fmtDate(t.occurred_at)} · {t.counterparty} · {money(t.amount)} · {t.status}</option>)}</select>
          {txns.data?.items.length === 0 && <p className="mt-2 text-sm">You have no transactions yet. Import some first.</p>}</div>}
        {step === 2 && <div><label className="label" htmlFor="c">What type of issue is it?</label>
          <select id="c" className="input" value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })}><option value="HELP">Help me identify the issue</option>{CATS.map((c) => <option key={c} value={c}>{pretty(c)}</option>)}</select></div>}
        {step === 3 && <div className="space-y-3"><div><label className="label" htmlFor="d">What happened? (at least 15 characters)</label>
          <textarea id="d" className="input h-32" maxLength={2000} value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} /></div>
          {f.cat === "INCORRECT_AMOUNT" && <div><label className="label" htmlFor="a">Amount you expected to pay (₹)</label><input id="a" className="input" inputMode="decimal" value={f.claimed} onChange={(e) => setF({ ...f, claimed: e.target.value })} /></div>}
          {(f.cat === "MERCHANT_NON_DELIVERY" || f.cat === "REFUND_DELAY") && <div><label className="label" htmlFor="o">Order reference (if you have one)</label><input id="o" className="input" maxLength={64} value={f.order} onChange={(e) => setF({ ...f, order: e.target.value })} /></div>}</div>}
        {step === 4 && <div><label className="label" htmlFor="f">Supporting evidence (optional, PNG/JPG/PDF, up to 5 MB each)</label>
          <input id="f" type="file" multiple accept=".png,.jpg,.jpeg,.pdf" onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))} />
          {files.map((x) => <p key={x.name} className="mt-1 text-sm">{x.name}</p>)}</div>}
        {step === 5 && txn && <dl className="space-y-2 text-sm"><div><dt className="text-ink-500">Transaction</dt><dd>{txn.counterparty}, {money(txn.amount)} <Badge v={txn.status} /> <Badge v={txn.data_source} /></dd></div>
          <div><dt className="text-ink-500">Issue type</dt><dd>{f.cat === "HELP" ? "We will identify it" : pretty(f.cat)}</dd></div><div><dt className="text-ink-500">Description</dt><dd className="whitespace-pre-wrap">{f.desc}</dd></div>
          <div><dt className="text-ink-500">Evidence files</dt><dd>{files.length}</dd></div></dl>}
      </div>
      <div className="flex justify-between"><button className="btn-ghost" disabled={step === 1 || busy} onClick={() => setStep(step - 1)}>Back</button>
        {step < 5 ? <button className="btn-primary" disabled={!valid} onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn-primary" disabled={busy} onClick={submit}>{busy ? "Submitting…" : "Submit case"}</button>}</div>
    </div>
  );
}
export default function Page() { return <Shell roles={["CUSTOMER"]}><Suspense fallback={<Skeleton />}><Wizard /></Suspense></Shell>; }
