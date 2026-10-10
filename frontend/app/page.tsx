import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0E17] text-[#E2E8F0] font-sans antialiased selection:bg-[#00F0FF]/20 selection:text-[#00F0FF] relative overflow-hidden">
      {/* 3D Radial Background Lighting Effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] bg-gradient-to-tr from-[#00F0FF]/15 via-[#0072FF]/10 to-transparent blur-[120px] rounded-full" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[400px] w-[400px] bg-[#00F0FF]/5 blur-[100px] rounded-full" />

      {/* 1. TOP NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          {/* Left: Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00F0FF] via-[#0072FF] to-[#0047FF] text-[#071629] font-bold shadow-[0_4px_15px_rgba(0,240,255,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] group-hover:scale-105 transition-transform">
              <svg
                width={18}
                height={18}
                style={{ width: "18px", height: "18px" }}
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg tracking-tight text-white">PayRakshak</span>
              <span className="hidden sm:inline text-xs font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded border border-[#00F0FF]/30">
                UPIResolve AI
              </span>
            </div>
          </Link>

          {/* Right: Navigation Links & Auth */}
          <nav className="flex items-center gap-6 text-sm text-slate-300">
            <a href="#how-it-works" className="hidden sm:inline hover:text-[#00F0FF] transition-colors">How it works</a>
            <a href="#features" className="hidden sm:inline hover:text-[#00F0FF] transition-colors">Features</a>
            <Link href="/privacy" className="hidden sm:inline hover:text-[#00F0FF] transition-colors">Privacy</Link>
            <Link href="/login" className="hover:text-white transition-colors px-2 py-1">Sign in</Link>
            <Link href="/register" className="btn-3d-primary !py-1.5 !px-4 text-xs">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-16 pb-12 text-center relative z-10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 px-3.5 py-1 text-xs font-mono text-[#00F0FF] mb-6 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
            <span className="h-2 w-2 rounded-full bg-[#00F0FF] animate-pulse" />
            OFFICIAL FINTECH DISPUTE PLATFORM
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.15]">
            Clarity when a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#0072FF]">UPI payment</span> goes wrong.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
            Understand your transaction, review the available findings, and discover the next step for your UPI dispute.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/register" className="btn-3d-primary !px-7 !py-3 text-sm">
              Get Started
            </Link>
            <a href="#showcase" className="btn-3d-secondary !px-7 !py-3 text-sm">
              Explore the Platform
            </a>
          </div>
        </div>

        {/* 3. PRODUCT SHOWCASE */}
        <div id="showcase" className="mt-14 mx-auto max-w-5xl px-4 sm:px-6">
          <div className="card-3d p-4 sm:p-6 text-left relative overflow-hidden">
            {/* Top Showcase Banner */}
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-3 px-1">
              <span className="text-xs font-mono text-slate-400">CASE PREVIEW · UPIR-2026-000123</span>
              <span className="text-[11px] font-mono text-[#00F0FF] bg-[#00F0FF]/15 px-2.5 py-1 rounded-md border border-[#00F0FF]/30 shadow-[0_0_10px_rgba(0,240,255,0.15)] font-semibold">
                PRODUCT PREVIEW · ILLUSTRATIVE DATA
              </span>
            </div>

            {/* Application Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Sidebar */}
              <div className="hidden lg:block lg:col-span-3 rounded-xl border border-white/10 bg-[#0F172A]/80 p-3.5 text-xs backdrop-blur-md">
                <div className="mb-3 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Workspace</div>
                <div className="space-y-1.5">
                  <div className="rounded-lg bg-[#00F0FF]/15 px-3.5 py-2 text-[#00F0FF] font-medium border border-[#00F0FF]/30 shadow-[0_0_10px_rgba(0,240,255,0.1)] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]" /> Overview
                  </div>
                  <div className="rounded-lg px-3.5 py-2 text-slate-400 hover:text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" /> Transactions
                  </div>
                  <div className="rounded-lg px-3.5 py-2 text-slate-400 hover:text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" /> My disputes
                  </div>
                  <div className="rounded-lg px-3.5 py-2 text-slate-400 hover:text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" /> Evidence
                  </div>
                </div>
              </div>

              {/* Main Content Workspace */}
              <div className="lg:col-span-9 space-y-4">
                {/* Header Card */}
                <div className="rounded-xl border border-white/10 bg-[#0F172A]/80 p-4 flex items-center justify-between backdrop-blur-md">
                  <div>
                    <h3 className="text-base font-bold text-white">Dispute overview</h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">Reference UPIR-2026-000123</p>
                  </div>
                  <span className="text-xs bg-amber-500/15 text-amber-300 px-3 py-1 rounded-md border border-amber-500/30 font-semibold shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                    Sample case · Awaiting information
                  </span>
                </div>

                {/* Transaction Summary Card */}
                <div className="rounded-xl border border-white/10 bg-[#0F172A]/80 p-4 text-xs space-y-2 backdrop-blur-md">
                  <div className="font-semibold text-white text-sm mb-2">Transaction Details</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10">
                    <div>
                      <div className="text-slate-400">UPI Reference</div>
                      <div className="font-mono text-white mt-1">REF0002-UPI-8841</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Amount</div>
                      <div className="font-semibold text-white mt-1">₹1,500.00 <span className="text-[10px] font-normal text-slate-400">(Illustrative)</span></div>
                    </div>
                    <div>
                      <div className="text-slate-400">Category</div>
                      <div className="text-white mt-1">Merchant Non-Delivery</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Payment Status</div>
                      <div className="text-amber-400 font-semibold mt-1">SENT · FAILED</div>
                    </div>
                  </div>
                </div>

                {/* Two Balanced Panels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Panel A */}
                  <div className="rounded-xl border border-white/10 bg-[#0F172A]/80 p-4 space-y-2 text-xs backdrop-blur-md">
                    <div className="font-semibold text-white text-sm">What we found</div>
                    <p className="text-slate-300 leading-relaxed">
                      The transaction failed at payment processing. The order reference remains unverified with merchant records.
                    </p>
                    <div className="pt-2 text-[11px] text-[#00F0FF] font-mono font-semibold">
                      FLAG: MERCHANT_ORDER_UNVERIFIED
                    </div>
                  </div>

                  {/* Panel B */}
                  <div className="rounded-xl border border-white/10 bg-[#0F172A]/80 p-4 space-y-2 text-xs backdrop-blur-md">
                    <div className="font-semibold text-white text-sm">Recommended next step</div>
                    <p className="text-slate-300 leading-relaxed">
                      Request order reference & delivery evidence from merchant before taking further action.
                    </p>
                    <div className="pt-2">
                      <Link href="/disputes/new" className="text-[#00F0FF] font-semibold hover:underline inline-flex items-center gap-1">
                        File New Dispute ➔
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Provider Note */}
                <div className="text-[11px] text-slate-400 text-center sm:text-left pt-1">
                  * Synthetic sample data — not verified against a live payment switch or bank provider.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW PAYRAKSHAK HELPS */}
      <section id="how-it-works" className="py-20 border-t border-white/10 bg-[#0F172A]/40 relative z-10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How PayRakshak helps
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              A structured advisory process to understand and manage UPI dispute outcomes safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="card-3d p-6 space-y-3">
              <div className="text-xs font-mono font-bold text-[#00F0FF]">STEP 01</div>
              <h3 className="text-base font-bold text-white">1. Review your transaction</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inspect payment attributes, dates, amounts, and statuses from sample records or your uploaded statement CSV.
              </p>
            </div>

            <div className="card-3d p-6 space-y-3">
              <div className="text-xs font-mono font-bold text-[#00F0FF]">STEP 02</div>
              <h3 className="text-base font-semibold text-white">2. Understand findings</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our ML classification model and consistency rules analyze your complaint text and surface advisory findings.
              </p>
            </div>

            <div className="card-3d p-6 space-y-3">
              <div className="text-xs font-mono font-bold text-[#00F0FF]">STEP 03</div>
              <h3 className="text-base font-semibold text-white">3. Track your dispute</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Follow status updates, submit evidence attachments securely, and monitor case timeline progression.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CORE CAPABILITIES */}
      <section id="features" className="py-20 border-t border-white/10 bg-[#0A0E17] relative z-10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Platform Features
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Built with strict advisory boundaries and verification rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="card-3d p-6 space-y-2">
              <h3 className="text-base font-bold text-white">Complaint Classification</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Categorizes reported issues such as refund delays, duplicate debits, or failed payments, abstaining when complaint text is ambiguous.
              </p>
            </div>

            <div className="card-3d p-6 space-y-2">
              <h3 className="text-base font-bold text-white">Transaction Consistency Checks</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Flags potential duplicate reference candidates, status mismatches, and multi-complaint occurrences automatically.
              </p>
            </div>

            <div className="card-3d p-6 space-y-2">
              <h3 className="text-base font-bold text-white">Case Tracking & Timelines</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Provides timestamped audit histories for case creation, status changes, information requests, and reviewer notes.
              </p>
            </div>

            <div className="card-3d p-6 space-y-2">
              <h3 className="text-base font-bold text-white">Evidence Submission & Review</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Supports file attachments (PNG, JPG, PDF) with magic-header validation, file size controls, and permission checks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRIVACY & DISCLOSURE */}
      <section className="py-16 border-t border-white/10 bg-[#0F172A]/60 text-center relative z-10">
        <div className="mx-auto max-w-3xl px-6">
          <div className="card-3d p-7 text-left space-y-3">
            <h3 className="text-lg font-bold text-white">Advisory Assistance Disclosure</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              PayRakshak provides advisory assistance and evidence analysis. It does not independently execute refunds, reverse payments, or access your live bank account.
            </p>
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-bold text-amber-300">
                Never share your UPI PIN or OTP with anyone.
              </span>
              <Link href="/privacy" className="text-[#00F0FF] font-semibold hover:underline">
                Read Privacy & Limitations ➔
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-white/10 bg-[#0A0E17] py-10 text-xs text-slate-400 relative z-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">PayRakshak</span>
            <span>© 2026 UPIResolve AI</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/register" className="text-[#00F0FF] font-semibold hover:underline">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
