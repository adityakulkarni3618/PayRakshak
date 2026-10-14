"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Notice } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeProvider";

export default function Register() {
  const router = useRouter();
  const [f, setF] = useState({ full_name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: e.target.value });

  // Password strength
  const pwLen = f.password.length;
  const pwStrength = pwLen === 0 ? 0 : pwLen < 6 ? 1 : pwLen < 10 ? 2 : pwLen < 14 ? 3 : 4;
  const pwLabel = ["", "Too short", "Weak", "Fair", "Strong"][pwStrength];
  const pwColor = ["", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-500"][pwStrength];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api("/api/v1/auth/register", { body: f });
      await api("/api/v1/auth/login", { body: { email: f.email, password: f.password } });
      router.replace("/dashboard");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B0F17]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white font-bold shadow-sm">
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-semibold text-base text-slate-900 dark:text-white">PayRakshak</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Form */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Free to use. No credit card required.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
            {err && <div className="mb-4"><Notice>{err}</Notice></div>}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5" htmlFor="n">
                  Full name
                </label>
                <input
                  id="n"
                  className="input w-full"
                  required
                  minLength={2}
                  placeholder="Your full name"
                  value={f.full_name}
                  onChange={set("full_name")}
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5" htmlFor="e">
                  Email address
                </label>
                <input
                  id="e"
                  className="input w-full"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={f.email}
                  onChange={set("email")}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5" htmlFor="p">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="p"
                    className="input w-full pr-12"
                    type={showPw ? "text" : "password"}
                    required
                    minLength={10}
                    placeholder="At least 10 characters"
                    value={f.password}
                    onChange={set("password")}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-medium"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Password strength meter */}
                {f.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-colors ${i <= pwStrength ? pwColor : "bg-slate-200 dark:bg-slate-700"}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{pwLabel}</p>
                  </div>
                )}
              </div>

              <button
                className="btn-primary w-full py-3 text-sm font-semibold mt-2"
                disabled={busy}
              >
                {busy ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account…
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>

          <p className="text-center mt-5 text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-sky-600 dark:text-sky-400 hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center mt-4 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            By registering you confirm this platform is for dispute tracking only.
            <br />All AI suggestions are advisory and non-binding.
          </p>
        </div>
      </main>
    </div>
  );
}
