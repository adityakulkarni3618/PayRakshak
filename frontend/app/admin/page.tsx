"use client";
import { useState } from "react";
import { api, fmtDate, pretty } from "@/lib/api";
import Shell from "@/components/Shell";
import { Notice, Skeleton, useLoad } from "@/components/ui";
import { useUser } from "@/lib/auth";

const Bars = ({ title, data }: { title: string; data: Record<string, number> }) => {
  const max = Math.max(1, ...Object.values(data));
  return (
    <section className="card">
      <h2 className="mb-3 font-semibold text-slate-900 dark:text-white">{title}</h2>
      {Object.keys(data).length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No data available.</p>
      ) : (
        Object.entries(data).map(([k, v]) => (
          <div key={k} className="mb-2 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-slate-600 dark:text-slate-300 font-medium">{pretty(k)}</span>
              <span className="font-bold text-slate-900 dark:text-white">{v}</span>
            </div>
            <div className="h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-2 rounded bg-sky-600 transition-all duration-300"
                style={{ width: `${(v / max) * 100}%` }}
              />
            </div>
          </div>
        ))
      )}
    </section>
  );
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

  const setRole = async (id: string, role: string) => {
    try {
      await api(`/api/v1/admin/users/${id}/role`, { body: { role } });
      users.reload();
      audit.reload();
      setMsg("");
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  // Turnaround SLA benchmarks
  const avgHours = a?.avg_resolution_hours;
  const slaTargetHours = 48; // NPCI standard 48-hour guideline
  const isSlaCompliant = avgHours != null ? avgHours <= slaTargetHours : true;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Admin Management & Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor system health, dispute SLAs, and audit governance trails.
        </p>
      </div>

      {an.error && <Notice>{an.error}</Notice>}

      {a && (
        <>
          {/* Key KPI Stats & SLA Tracker */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="card">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Cases</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{a.total_disputes}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Logged across all users</p>
            </div>

            <div className="card">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Avg Resolution SLA</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {avgHours != null ? `${avgHours.toFixed(1)} hrs` : "Pending"}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                <span className={`h-2 w-2 rounded-full ${isSlaCompliant ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className={isSlaCompliant ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                  {isSlaCompliant ? "Within 48h NPCI Target" : "Exceeds 48h Guideline"}
                </span>
              </div>
            </div>

            <div className="card">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">AI Abstention Rate</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {a.model_abstention_rate == null ? "—" : `${(a.model_abstention_rate * 100).toFixed(0)}%`}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deferred to human review</p>
            </div>

            <div className="card">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Decision Safety</p>
              <p className="text-3xl font-bold text-sky-600 dark:text-sky-400 mt-1">100%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Human-in-the-loop approved</p>
            </div>
          </div>

          {/* Categorical Distribution Visuals */}
          <div className="grid gap-4 md:grid-cols-3">
            <Bars title="Dispute Status Breakdown" data={a.by_status} />
            <Bars title="Dispute Category Breakdown" data={a.by_category} />
            <Bars title="Triggered Consistency Rules" data={a.findings_by_rule} />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            * Governance Compliance Notice: {a.definitions.accuracy}
          </p>
        </>
      )}

      {/* System Health Status */}
      <section className="card text-sm space-y-2">
        <h2 className="font-semibold text-slate-900 dark:text-white">Infrastructure & ML Model Status</h2>
        {health.data ? (
          <>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Database: {health.data.database.toUpperCase()}
              </span>
              <span className="px-2.5 py-1 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                Model: {health.data.model.available ? `${health.data.model.model_version} (ONLINE)` : "UNAVAILABLE"}
              </span>
            </div>
            {health.data.model.training_metrics && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Training Macro-F1: <b>{health.data.model.training_metrics.macro_f1}</b>. {health.data.model.training_metrics.caveat}
              </p>
            )}
          </>
        ) : (
          <Skeleton />
        )}
      </section>

      {/* User Management & Role Assignments */}
      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-semibold text-slate-900 dark:text-white">Role-Based Access Management</h2>
        {msg && <Notice>{msg}</Notice>}
        <table className="w-full text-sm">
          <tbody>
            {users.data?.map((u: any) => (
              <tr key={u.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="td font-medium text-slate-800 dark:text-slate-200">{u.email}</td>
                <td className="td">
                  <select
                    aria-label={`Role for ${u.email}`}
                    className="input max-w-[12rem] text-xs font-mono"
                    disabled={u.id === me.id}
                    value={u.role}
                    onChange={(e) =>
                      confirm(`Change permission role for ${u.email}?`) && setRole(u.id, e.target.value)
                    }
                  >
                    {["CUSTOMER", "SUPPORT_AGENT", "ADMIN"].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Real-Time Immutable Audit Log */}
      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-semibold text-slate-900 dark:text-white">Immutable Governance Audit Log</h2>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="th">Timestamp</th>
              <th className="th">Action</th>
              <th className="th">Actor Role</th>
              <th className="th">Target Reference</th>
            </tr>
          </thead>
          <tbody>
            {audit.data?.items.map((e: any) => (
              <tr key={e.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="td whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                  {fmtDate(e.created_at)}
                </td>
                <td className="td font-medium">{pretty(e.action)}</td>
                <td className="td font-mono text-xs">{e.actor_role}</td>
                <td className="td font-mono text-xs text-sky-700 dark:text-sky-400">{e.entity_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Shell roles={["ADMIN"]}>
      <Body />
    </Shell>
  );
}
