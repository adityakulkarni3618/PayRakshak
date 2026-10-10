export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Opts = { method?: string; body?: unknown; form?: FormData; headers?: Record<string, string> };

export async function api<T = any>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = { "X-Requested-With": "upiresolve", ...(opts.headers || {}) };
  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.body !== undefined) { headers["Content-Type"] = "application/json"; body = JSON.stringify(opts.body); }
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { method: opts.method || (body ? "POST" : "GET"), headers, body, credentials: "include" });
  } catch {
    throw new Error("Cannot reach the server. Check that the backend is running.");
  }
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const d = data?.detail;
    const msg = Array.isArray(d) ? d.map((e: any) => `${(e.loc || []).slice(1).join(".")}: ${e.msg}`).join("; ") : d || `Request failed (${res.status})`;
    const err: any = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data as T;
}
const safeJson = (t: string) => { try { return JSON.parse(t); } catch { return null; } };
export const fmtDate = (s?: string) => (s ? new Date(s.endsWith("Z") || s.includes("+") ? s : s + "Z").toLocaleString() : "");
export const money = (a: string | number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(a));
export const pretty = (s?: string | null) => (s || "").toLowerCase().replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
