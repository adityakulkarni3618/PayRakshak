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
  useEffect(() => { api<User>("/api/v1/auth/me").then(setUser).catch(() => router.replace("/login")); }, [router]);
  if (!user) return <main className="mx-auto max-w-3xl p-8"><Skeleton /></main>;
  if (roles && !roles.includes(user.role)) return <main className="p-8">You do not have access to this page. <Link className="underline" href="/">Go home</Link></main>;
  const logout = async () => { await api("/api/v1/auth/logout", { method: "POST" }).catch(() => {}); router.replace("/login"); };
  return (
    <UserCtx.Provider value={user}>
      <div className="min-h-screen md:flex">
        <header className="flex items-center justify-between bg-ink-900 px-4 py-3 text-white md:hidden">
          <span className="font-display text-lg">UPIResolve AI</span>
          <button className="btn-ghost !py-1 text-ink-900" aria-expanded={open} onClick={() => setOpen(!open)}>Menu</button>
        </header>
        <aside className={`${open ? "block" : "hidden"} bg-ink-900 text-ink-100 md:block md:w-60 md:shrink-0`}>
          <div className="hidden px-5 py-6 md:block"><p className="font-display text-xl text-white">UPIResolve <span className="text-cy-400">AI</span></p><p className="text-xs text-ink-500">Every transaction explained.</p></div>
          <nav className="space-y-1 px-3 pb-4" aria-label="Main">
            {NAV[user.role].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className={`block rounded-md px-3 py-2 text-sm ${path.startsWith(href) ? "bg-ink-700 text-cy-400" : "hover:bg-ink-800"}`}>{label}</Link>
            ))}
            <Link href="/privacy" className="block rounded-md px-3 py-2 text-sm hover:bg-ink-800">Privacy & limits</Link>
          </nav>
          <div className="border-t border-ink-700 px-5 py-4 text-sm">
            <p className="truncate">{user.full_name}</p><p className="truncate text-xs text-ink-500">{user.email} · {user.role.replace("_", " ").toLowerCase()}</p>
            <button onClick={logout} className="mt-2 text-cy-400 underline">Sign out</button>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-4 md:p-8"><div className="mx-auto max-w-5xl">{children}</div></main>
      </div>
    </UserCtx.Provider>
  );
}
