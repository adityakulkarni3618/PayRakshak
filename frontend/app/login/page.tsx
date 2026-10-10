"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Notice } from "@/components/ui";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const u = await api("/api/v1/auth/login", { body: { email, password } });
      router.replace(u.role === "CUSTOMER" ? "/dashboard" : u.role === "ADMIN" ? "/admin" : "/support");
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }
  return (
    <main className="mx-auto mt-20 max-w-sm px-4">
      <h1 className="font-display text-3xl">Sign in</h1>
      <form onSubmit={submit} className="card mt-6 space-y-4">
        {err && <Notice>{err}</Notice>}
        <div><label className="label" htmlFor="e">Email</label><input id="e" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
        <div><label className="label" htmlFor="p">Password</label><input id="p" className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="mt-4 text-sm">New here? <Link className="underline" href="/register">Create an account</Link></p>
    </main>
  );
}
