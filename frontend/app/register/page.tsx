"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Notice } from "@/components/ui";

export default function Register() {
  const router = useRouter();
  const [f, setF] = useState({ full_name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try { await api("/api/v1/auth/register", { body: f }); await api("/api/v1/auth/login", { body: { email: f.email, password: f.password } }); router.replace("/dashboard"); }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }
  return (
    <main className="mx-auto mt-20 max-w-sm px-4">
      <h1 className="font-display text-3xl">Create account</h1>
      <form onSubmit={submit} className="card mt-6 space-y-4">
        {err && <Notice>{err}</Notice>}
        <div><label className="label" htmlFor="n">Full name</label><input id="n" className="input" required minLength={2} value={f.full_name} onChange={set("full_name")} /></div>
        <div><label className="label" htmlFor="e">Email</label><input id="e" className="input" type="email" required value={f.email} onChange={set("email")} /></div>
        <div><label className="label" htmlFor="p">Password (10+ characters)</label><input id="p" className="input" type="password" required minLength={10} value={f.password} onChange={set("password")} autoComplete="new-password" /></div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
      </form>
      <p className="mt-4 text-sm">Already registered? <Link className="underline" href="/login">Sign in</Link></p>
    </main>
  );
}
