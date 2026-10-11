"use client";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, fmtDate, money, pretty } from "@/lib/api";
import Shell from "@/components/Shell";
import { Badge, Notice, Skeleton, useLoad } from "@/components/ui";
import { parseUpiSms } from "@/lib/smsParser";

const CATS = [
  "FAILED_TRANSACTION",
  "DUPLICATE_PAYMENT",
  "UNAUTHORIZED_TRANSACTION",
  "INCORRECT_AMOUNT",
  "MERCHANT_NON_DELIVERY",
  "REFUND_DELAY",
  "PENDING_TRANSACTION",
  "OTHER",
];

function Wizard() {
  const router = useRouter();
  const sp = useSearchParams();
  const key = useMemo(() => crypto.randomUUID(), []);
  const txns = useLoad(() => api("/api/v1/transactions?page_size=100"));

  const [step, setStep] = useState(1);
  const [f, setF] = useState({ txn: sp.get("txn") || "", cat: "HELP", desc: "", claimed: "", order: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // SMS / WhatsApp paste state
  const [smsText, setSmsText] = useState("");
  const [parsedNotice, setParsedNotice] = useState<string | null>(null);

  const txn = txns.data?.items.find((t: any) => t.id === f.txn);
  const valid = [false, !!f.txn, true, f.desc.trim().length >= 15, true, true][step];

  const handleParseSms = () => {
    const res = parseUpiSms(smsText);
    if (!res) {
      setParsedNotice("Could not detect UPI debit details from the pasted message. Please check the text format.");
      return;
    }

    let matches = [];
    if (res.amount) matches.push(`Amount: ₹${res.amount}`);
    if (res.ref) matches.push(`Ref/RRN: ${res.ref}`);
    if (res.counterparty) matches.push(`VPA/To: ${res.counterparty}`);

    if (res.categorySuggestion) {
      setF((prev) => ({ ...prev, cat: res.categorySuggestion || prev.cat }));
    }

    // Attempt to automatically match with an existing transaction
    if (txns.data?.items) {
      const match = txns.data.items.find(
        (t: any) =>
          (res.ref && t.external_ref?.toLowerCase() === res.ref.toLowerCase()) ||
          (res.amount && Math.abs(parseFloat(t.amount) - parseFloat(res.amount)) < 0.01)
      );
      if (match) {
        setF((prev) => ({ ...prev, txn: match.id }));
        matches.push(`Matched transaction: ${match.counterparty}`);
      }
    }

    // Auto-populate description if empty
    if (!f.desc) {
      setF((prev) => ({
        ...prev,
        desc: `Dispute regarding debit notification: "${smsText.trim()}"`,
      }));
    }

    setParsedNotice(`Parsed successfully! ${matches.join(" · ")}`);
  };

  async function submit() {
    setBusy(true);
    setErr("");
    try {
      const d = await api("/api/v1/disputes", {
        headers: { "Idempotency-Key": key },
        body: {
          transaction_id: f.txn,
          selected_category: f.cat === "HELP" ? null : f.cat,
          description: f.desc,
          claimed_amount: f.claimed || null,
          order_reference: f.order || null,
        },
      });
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        await api(`/api/v1/disputes/${d.case_id}/evidence`, { form: fd }).catch((e) =>
          setErr(`Case created, but ${file.name} failed: ${e.message}`)
        );
      }
      router.replace(`/disputes/${d.case_id}`);
    } catch (e: any) {
      setErr(e.message);
      setBusy(false);
    }
  }

  if (txns.loading) return <Skeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Report a payment issue</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Interactive Step {step} of 5. Never enter your UPI PIN or OTP here.
        </p>
      </div>

      {/* Progress Bar Indicator */}
      <div className="flex items-center justify-between gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full transition-all ${
              step >= s ? "bg-sky-600" : "bg-slate-200 dark:bg-slate-800"
            }`}
          />
        ))}
      </div>

      {err && <Notice>{err}</Notice>}

      <div className="card space-y-5">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="t">
                Which transaction is disputed?
              </label>
              <select
                id="t"
                className="input"
                value={f.txn}
                onChange={(e) => setF({ ...f, txn: e.target.value })}
              >
                <option value="">Select a transaction</option>
                {txns.data?.items.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {fmtDate(t.occurred_at)} · {t.counterparty} · {money(t.amount)} · {t.status}
                  </option>
                ))}
              </select>
              {txns.data?.items.length === 0 && (
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  You have no transactions recorded yet. You can import statement records first.
                </p>
              )}
            </div>

            {/* SMS / WhatsApp Evidence Parser Box */}
            <div className="rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base">📲</span>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                  Fast-Track: Paste Bank SMS or WhatsApp Debit Alert
                </span>
              </div>
              <textarea
                className="input text-xs h-20"
                placeholder='e.g., "Rs.1500.00 debited from A/c XX1234 on 10-Oct to store@upi Ref 429184910291"'
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleParseSms}
                  disabled={!smsText.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50 transition-colors shadow-sm"
                >
                  ⚡ Auto-Extract Details
                </button>
                {parsedNotice && (
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {parsedNotice}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="label" htmlFor="c">
              What type of issue occurred?
            </label>
            <select
              id="c"
              className="input"
              value={f.cat}
              onChange={(e) => setF({ ...f, cat: e.target.value })}
            >
              <option value="HELP">Help me identify the issue (AI will classify from description)</option>
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {pretty(c)}
                </option>
              ))}
            </select>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="d">
                What happened? (provide at least 15 characters)
              </label>
              <textarea
                id="d"
                className="input h-32"
                maxLength={2000}
                placeholder="Explain the payment problem (e.g., amount debited twice, POS declined, item never received)..."
                value={f.desc}
                onChange={(e) => setF({ ...f, desc: e.target.value })}
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                Characters: {f.desc.length}/2000 (minimum 15 required)
              </span>
            </div>

            {f.cat === "INCORRECT_AMOUNT" && (
              <div>
                <label className="label" htmlFor="a">
                  Amount you expected to pay (₹)
                </label>
                <input
                  id="a"
                  className="input"
                  inputMode="decimal"
                  value={f.claimed}
                  onChange={(e) => setF({ ...f, claimed: e.target.value })}
                />
              </div>
            )}

            {(f.cat === "MERCHANT_NON_DELIVERY" || f.cat === "REFUND_DELAY") && (
              <div>
                <label className="label" htmlFor="o">
                  Merchant Order Reference (if available)
                </label>
                <input
                  id="o"
                  className="input"
                  maxLength={64}
                  value={f.order}
                  onChange={(e) => setF({ ...f, order: e.target.value })}
                />
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <label className="label" htmlFor="f">
              Supporting Evidence Attachments (PNG, JPG, PDF up to 5 MB each)
            </label>
            <input
              id="f"
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.pdf"
              className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer"
              onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))}
            />
            {files.length > 0 && (
              <div className="mt-3 space-y-1">
                {files.map((x) => (
                  <p key={x.name} className="text-xs font-mono text-slate-600 dark:text-slate-300">
                    📎 {x.name} ({(x.size / 1024).toFixed(0)} KB)
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 5 && txn && (
          <dl className="space-y-3 text-sm">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
              <dt className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400">Transaction</dt>
              <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">
                {txn.counterparty}, {money(txn.amount)} <Badge v={txn.status} /> <Badge v={txn.data_source} />
              </dd>
            </div>
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
              <dt className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400">Selected Category</dt>
              <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">
                {f.cat === "HELP" ? "AI assisted identification" : pretty(f.cat)}
              </dd>
            </div>
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
              <dt className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400">Complaint Statement</dt>
              <dd className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 mt-0.5">{f.desc}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400">Attached Evidence</dt>
              <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">
                {files.length > 0 ? `${files.length} document(s) attached` : "No attachments (optional)"}
              </dd>
            </div>
          </dl>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          className="btn-ghost"
          disabled={step === 1 || busy}
          onClick={() => setStep(step - 1)}
        >
          Back
        </button>
        {step < 5 ? (
          <button
            type="button"
            className="btn-primary"
            disabled={!valid}
            onClick={() => setStep(step + 1)}
          >
            Continue ➔
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary"
            disabled={busy}
            onClick={submit}
          >
            {busy ? "Submitting Dispute…" : "Confirm & Submit Case"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Shell roles={["CUSTOMER"]}>
      <Suspense fallback={<Skeleton />}>
        <Wizard />
      </Suspense>
    </Shell>
  );
}
