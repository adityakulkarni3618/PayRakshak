"use client";
import Link from "next/link";
import { api, fmtDate, money } from "@/lib/api";
import Shell from "@/components/Shell";
import { Badge, Empty, Notice, Skeleton, useLoad } from "@/components/ui";
import { pretty } from "@/lib/api";
import { useLang } from "@/components/LangProvider";

// ─── Onboarding Banner ────────────────────────────────────────
function OnboardingBanner() {
  const { t } = useLang();
  return (
    <div className="rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50 dark:bg-sky-950/30 p-5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400 text-xl">
          👋
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sky-900 dark:text-sky-300 text-base">
            {t("onboard.title")}
          </h2>
          <ol className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-sky-600 text-white text-[11px] font-bold mt-0.5">1</span>
              {t("onboard.step1")}
            </li>
            <li className="flex items-start gap-2">
              <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-sky-600 text-white text-[11px] font-bold mt-0.5">2</span>
              {t("onboard.step2")}
            </li>
            <li className="flex items-start gap-2">
              <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-sky-600 text-white text-[11px] font-bold mt-0.5">3</span>
              {t("onboard.step3")}
            </li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/transactions" className="btn-primary text-sm py-2 px-4">
              {t("onboard.importBtn")}
            </Link>
            <Link href="/disputes/new" className="btn-ghost text-sm py-2 px-4">
              {t("onboard.reportBtn")}
            </Link>
            <Link href="/track" className="btn-ghost text-sm py-2 px-4">
              {t("onboard.trackBtn")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Body ───────────────────────────────────────────
function Body() {
  const { t } = useLang();
  const { data, error, loading } = useLoad(() => api("/api/v1/dashboard"));
  const notes = useLoad(() => api("/api/v1/notifications"));

  if (loading) return <Skeleton />;
  if (error || !data) return <Notice>{error || "Could not load the dashboard."}</Notice>;

  const isFirstTime = data.total_transactions === 0 && data.active_disputes === 0;
  const stats: [string, number][] = [
    ["Transactions", data.total_transactions],
    ["Active cases", data.active_disputes],
    ["Need your input", data.awaiting_information],
    ["Under review", data.awaiting_review],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">{t("dash.title")}</h1>
        <Link href="/disputes/new" className="btn-primary">
          {t("dash.reportIssue")}
        </Link>
      </div>

      {/* Onboarding for first-time users */}
      {isFirstTime && <OnboardingBanner />}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([l, v]) => (
          <div key={l} className="card">
            <p className={`text-3xl font-medium ${v > 0 && l === "Need your input" ? "text-amber-600 dark:text-amber-400" : ""}`}>
              {v}
            </p>
            <p className="text-sm text-ink-500">{l}</p>
          </div>
        ))}
      </div>

      {/* Awaiting Information Alert */}
      {data.awaiting_information > 0 && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex items-center gap-3">
          <span className="text-amber-600 dark:text-amber-400 text-lg">⚠️</span>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            {data.awaiting_information} case{data.awaiting_information > 1 ? "s" : ""} need your response.{" "}
            <Link href="/disputes?status=AWAITING_INFORMATION" className="underline font-semibold">
              View now →
            </Link>
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 font-medium">{t("dash.recentCases")}</h2>
          {data.recent_cases.length === 0 ? (
            <p className="text-sm text-ink-500">{t("dash.noCases")}</p>
          ) : (
            data.recent_cases.map((c: any) => (
              <Link
                key={c.case_id}
                href={`/disputes/${c.case_id}`}
                className="flex items-center justify-between border-t border-ink-100 py-2.5 text-sm first:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 -mx-1 px-1 rounded transition-colors"
              >
                <span>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{c.case_id}</span>
                  <span className="ml-2 text-slate-600 dark:text-slate-300">{pretty(c.category)}</span>
                </span>
                <Badge v={c.status} />
              </Link>
            ))
          )}
        </section>

        <section className="card">
          <h2 className="mb-3 font-medium">{t("dash.notifications")}</h2>
          {!notes.data?.length ? (
            <p className="text-sm text-ink-500">{t("dash.noNotifs")}</p>
          ) : (
            notes.data.slice(0, 6).map((n: any) => (
              <p key={n.id} className="border-t border-ink-100 py-2 text-sm first:border-0">
                {n.message}
                <span className="block text-xs text-ink-500">{fmtDate(n.created_at)}</span>
              </p>
            ))
          )}
        </section>
      </div>

      {data.recent_transactions.length > 0 && (
        <section className="card">
          <h2 className="mb-3 font-medium">{t("dash.recentTxns")}</h2>
          {data.recent_transactions.map((tx: any) => (
            <div key={tx.id} className="flex items-center justify-between border-t border-ink-100 py-2 text-sm first:border-0">
              <span>
                {tx.counterparty}
                <span className="ml-2 font-mono text-xs text-ink-500">{tx.external_ref}</span>
              </span>
              <span className="flex items-center gap-2">
                {money(tx.amount)} <Badge v={tx.status} />
              </span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Shell roles={["CUSTOMER"]}>
      <Body />
    </Shell>
  );
}
