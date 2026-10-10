"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { UserCtx, User } from "@/lib/auth";
import { Skeleton } from "./ui";

const NAV: Record<string, [string, string][]> = {
  CUSTOMER: [["/dashboard", "Dashboard"], ["/transactions", "Transactions"], ["/disputes", "My cases"]],
  SUPPORT_AGENT: [["/support", "Case queue"]],
  ADMIN: [["/support", "Case queue"], ["/admin", "Admin"]],
};

export default function Shell({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    api<User>("/api/v1/auth/me")
      .then(setUser)
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!user) return <main className="mx-auto max-w-3xl p-8"><Skeleton /></main>;
  if (roles && !roles.includes(user.role))
    return (
      <main className="p-8 text-center">
        <div className="card-3d max-w-md mx-auto p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Access Restricted</h2>
          <p className="text-sm text-slate-400">You do not have permission to access this page.</p>
          <Link href="/" className="btn-3d-primary inline-block">Return Home</Link>
        </div>
      </main>
    );

  const logout = async () => {
    await api("/api/v1/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
  };

  return (
    <UserCtx.Provider value={user}>
      <div className="min-h-screen bg-[#0A0E17] text-[#E2E8F0] md:flex">
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b border-white/10 bg-[#0F172A]/90 backdrop-blur-md px-4 py-3 text-white md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1677F2] text-xs font-bold">PR</div>
            <span className="font-bold text-base tracking-tight">PayRakshak</span>
          </div>
          <button className="btn-3d-secondary px-3 py-1 text-xs" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? "Close" : "Menu"}
          </button>
        </header>

        {/* 3D Glassmorphic Sidebar */}
        <aside className={`${open ? "block" : "hidden"} border-r border-white/10 bg-[#0F172A]/95 backdrop-blur-xl md:block md:w-64 md:shrink-0 flex flex-col justify-between`}>
          <div>
            <div className="hidden px-6 py-6 md:block border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00F0FF] to-[#0072FF] text-[#071629] font-bold shadow-md shadow-[#00F0FF]/20">
                  <svg width={16} height={16} style={{ width: "16px", height: "16px" }} className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-base text-white tracking-tight leading-tight">PayRakshak</h2>
                  <span className="text-[11px] text-[#00F0FF] font-mono tracking-wider">UPIResolve AI</span>
                </div>
              </div>
            </div>

            <nav className="space-y-1.5 px-3 py-6" aria-label="Main">
              {NAV[user.role].map(([href, label]) => {
                const active = path.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]" : "bg-slate-600"}`} />
                    {label}
                  </Link>
                );
              })}
              <Link
                href="/privacy"
                className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                Privacy & limits
              </Link>
            </nav>
          </div>

          <div className="border-t border-white/10 px-5 py-4 text-xs bg-[#0A0E17]/60">
            <p className="truncate font-semibold text-slate-200">{user.full_name}</p>
            <p className="truncate text-[11px] text-slate-400 mt-0.5 font-mono">{user.email}</p>
            <div className="mt-2 flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {user.role.replace("_", " ")}
              </span>
              <button onClick={logout} className="text-[#00F0FF] hover:underline font-medium">
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Workspace View */}
        <main className="min-w-0 flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </UserCtx.Provider>
  );
}
