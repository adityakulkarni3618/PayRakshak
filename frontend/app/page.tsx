import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#111214] text-[#F5F7FA] font-sans antialiased selection:bg-[#20C4D8]/20 selection:text-[#20C4D8]">
      {/* Background Subtle Grid Lines */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1b222d_1px,transparent_1px),linear-gradient(to_bottom,#1b222d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />

      {/* 1. TOP NAVIGATION */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#111214]/80 border-b border-[#293442]/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* LEFT: Branding */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#20C4D8] to-[#1677F2] p-0.5 text-[#071629] font-bold shadow-md shadow-[#20C4D8]/10 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-white">
              PayRakshak <span className="text-xs font-mono font-normal text-[#20C4D8] bg-[#20C4D8]/10 px-1.5 py-0.5 rounded border border-[#20C4D8]/20">UPIResolve AI</span>
            </span>
          </Link>

          {/* CENTER: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#A6B0BF]">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </nav>

          {/* RIGHT: Auth Navigation */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-3.5 py-2 text-sm font-medium text-[#A6B0BF] hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[#20C4D8] px-4 py-2 text-sm font-semibold text-[#071629] shadow-sm hover:bg-[#20C4D8]/90 transition-all hover:shadow-[#20C4D8]/20 hover:shadow-lg"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-12 text-center bg-gradient-to-b from-[#17191D] via-[#111214] to-[#071629]/40">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.15]">
            Clarity when a <span className="text-[#20C4D8] underline decoration-[#20C4D8]/40 underline-offset-8">UPI payment</span> goes wrong.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-[#A6B0BF] leading-relaxed">
            Review transaction details, understand potential discrepancies, and find the appropriate next step for your UPI dispute.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-[#20C4D8] px-6 py-3 text-sm font-semibold text-[#071629] shadow-md hover:bg-[#20C4D8]/90 transition-all"
            >
              Get Started
            </Link>
            <a
              href="#showcase"
              className="rounded-lg border border-[#293442] bg-[#17191D] px-6 py-3 text-sm font-medium text-[#F5F7FA] hover:bg-[#293442]/50 hover:border-[#A6B0BF]/40 transition-all"
            >
              Explore the Platform
            </a>
          </div>
        </div>

        {/* 3. MAIN PRODUCT SHOWCASE */}
        <div id="showcase" className="mt-16 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative rounded-2xl border border-[#293442] bg-[#071629] p-3 sm:p-6 shadow-2xl shadow-black/80">
            {/* Top Bar Label */}
            <div className="mb-4 flex items-center justify-between border-b border-[#293442] pb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 font-mono text-xs text-[#A6B0BF]">upiresolve.internal/app/disputes/UPIR-2026-000123</span>
              </div>
              <span className="font-mono text-xs font-semibold tracking-wider text-[#20C4D8] bg-[#20C4D8]/10 px-2.5 py-1 rounded border border-[#20C4D8]/30">
                PRODUCT PREVIEW · ILLUSTRATIVE DATA
              </span>
            </div>

            {/* Dashboard Showcase Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-left font-sans">
              {/* Sidebar Preview */}
              <div className="hidden lg:block lg:col-span-3 rounded-xl border border-[#293442] bg-[#0D2340] p-4 text-sm">
                <div className="mb-6 font-mono text-xs text-[#A6B0BF] uppercase tracking-wider">Navigation</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 rounded-lg bg-[#1677F2]/20 px-3 py-2 text-[#20C4D8] font-medium border border-[#1677F2]/30">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    Overview
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[#A6B0BF] hover:text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Transactions
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[#A6B0BF] hover:text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1.001 1.001 0 01.707.293l5.414 5.414a1.001 1.001 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Disputes
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[#A6B0BF] hover:text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    Evidence
                  </div>
                </div>
              </div>

              {/* Main Workspace Preview */}
              <div className="lg:col-span-9 space-y-4">
                {/* Header & Status */}
                <div className="rounded-xl border border-[#293442] bg-[#0D2340] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono text-[#A6B0BF]">CASE ID: UPIR-2026-000123</div>
                    <h3 className="text-lg font-bold text-white mt-0.5">Dispute overview</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-[#1677F2]/20 text-[#20C4D8] px-2.5 py-1 rounded-md border border-[#1677F2]/40 font-semibold">
                      SYNTHETIC
                    </span>
                    <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-md border border-amber-500/40 font-semibold">
                      AWAITING INFORMATION
                    </span>
                  </div>
                </div>

                {/* Grid of Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Transaction Summary */}
                  <div className="rounded-xl border border-[#293442] bg-[#0D2340] p-4 space-y-2.5 text-sm">
                    <div className="text-xs font-mono text-[#20C4D8] uppercase tracking-wider">Transaction Summary</div>
                    <div className="flex justify-between py-1 border-b border-[#293442]/60">
                      <span className="text-[#A6B0BF]">UPI Reference</span>
                      <span className="font-mono text-white">REF0002-UPI-8841</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#293442]/60">
                      <span className="text-[#A6B0BF]">Amount</span>
                      <span className="font-semibold text-white">₹1,500.00 <span className="text-[10px] text-[#A6B0BF] font-normal">(Illustrative)</span></span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#293442]/60">
                      <span className="text-[#A6B0BF]">Direction / Status</span>
                      <span className="text-amber-400 font-medium">SENT · FAILED</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#A6B0BF]">Provenance</span>
                      <span className="font-mono text-xs text-[#20C4D8]">SYNTHETIC SAMPLE DATA</span>
                    </div>
                  </div>

                  {/* Complaint Analysis */}
                  <div className="rounded-xl border border-[#293442] bg-[#0D2340] p-4 space-y-2.5 text-sm">
                    <div className="text-xs font-mono text-[#20C4D8] uppercase tracking-wider">AI Classifier & Consistency</div>
                    <div className="flex justify-between py-1 border-b border-[#293442]/60">
                      <span className="text-[#A6B0BF]">Predicted Category</span>
                      <span className="font-medium text-white">Merchant Non-Delivery</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#293442]/60">
                      <span className="text-[#A6B0BF]">Analysis Mode</span>
                      <span className="font-mono text-xs text-emerald-400">ADVISORY ONLY</span>
                    </div>
                    <div className="py-1">
                      <span className="text-[#A6B0BF] block text-xs mb-1">Consistency Findings</span>
                      <span className="text-xs font-mono bg-red-500/15 text-red-300 px-2 py-1 rounded border border-red-500/30 inline-block">
                        RULE: MERCHANT_ORDER_UNVERIFIED
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommended Next Step & Timeline */}
                <div className="rounded-xl border border-[#293442] bg-[#0D2340] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-[#20C4D8] uppercase tracking-wider">Recommended Next Action</div>
                    <p className="text-sm text-white font-medium">
                      Request merchant order reference & delivery evidence from customer.
                    </p>
                  </div>
                  <Link
                    href="/disputes/new"
                    className="w-full md:w-auto text-center rounded-lg bg-[#1677F2] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1677F2]/90 transition-all shrink-0"
                  >
                    File New Dispute ➔
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE-STEP PROCESS SECTION */}
      <section id="how-it-works" className="py-20 bg-[#111214] border-t border-[#293442]/60">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              From payment issue to next steps.
            </h2>
            <p className="mt-3 text-base text-[#A6B0BF]">
              A structured workflow to evaluate transactions, analyze evidence, and track dispute resolution safely.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="rounded-xl border border-[#293442] bg-[#17191D] p-6 text-left space-y-3 relative overflow-hidden">
              <div className="font-mono text-3xl font-bold text-[#20C4D8]/30">01</div>
              <h3 className="text-lg font-bold text-white">1. Review the transaction</h3>
              <p className="text-sm text-[#A6B0BF] leading-relaxed">
                Select your transaction record or import your statement via CSV to inspect status, amounts, and metadata.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-[#293442] bg-[#17191D] p-6 text-left space-y-3 relative overflow-hidden">
              <div className="font-mono text-3xl font-bold text-[#20C4D8]/30">02</div>
              <h3 className="text-lg font-bold text-white">2. Understand the findings</h3>
              <p className="text-sm text-[#A6B0BF] leading-relaxed">
                Our ML engine classifies your complaint and evaluates consistency rules to surface clear advisory recommendations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-[#293442] bg-[#17191D] p-6 text-left space-y-3 relative overflow-hidden">
              <div className="font-mono text-3xl font-bold text-[#20C4D8]/30">03</div>
              <h3 className="text-lg font-bold text-white">3. Track the dispute</h3>
              <p className="text-sm text-[#A6B0BF] leading-relaxed">
                Follow your case timeline, upload supporting evidence safely, and communicate with support agents through resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. IMPLEMENTED FEATURES SECTION */}
      <section id="features" className="py-20 bg-[#17191D] border-t border-[#293442]/60">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              Core Platform Capabilities
            </h2>
            <p className="mt-3 text-base text-[#A6B0BF]">
              Built with strict advisory safety boundaries and robust verification logic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="rounded-xl border border-[#293442] bg-[#071629] p-6 space-y-2.5">
              <div className="text-xs font-mono text-[#20C4D8] uppercase tracking-wider">Machine Learning</div>
              <h3 className="text-lg font-bold text-white">AI-Assisted Complaint Classification</h3>
              <p className="text-sm text-[#A6B0BF] leading-relaxed">
                Classifies complaints into categories like refund delays, failed payments, or merchant non-delivery, abstaining when information is ambiguous.
              </p>
            </div>

            <div className="rounded-xl border border-[#293442] bg-[#071629] p-6 space-y-2.5">
              <div className="text-xs font-mono text-[#20C4D8] uppercase tracking-wider">Deterministic Rules</div>
              <h3 className="text-lg font-bold text-white">Transaction Consistency Checks</h3>
              <p className="text-sm text-[#A6B0BF] leading-relaxed">
                Flags duplicate reference candidates, status contradictions, and multi-complaint occurrences before review.
              </p>
            </div>

            <div className="rounded-xl border border-[#293442] bg-[#071629] p-6 space-y-2.5">
              <div className="text-xs font-mono text-[#20C4D8] uppercase tracking-wider">Lifecycle Tracking</div>
              <h3 className="text-lg font-bold text-white">Case Tracking & Timelines</h3>
              <p className="text-sm text-[#A6B0BF] leading-relaxed">
                Timestamped audit events record status transitions and reviewer actions transparently.
              </p>
            </div>

            <div className="rounded-xl border border-[#293442] bg-[#071629] p-6 space-y-2.5">
              <div className="text-xs font-mono text-[#20C4D8] uppercase tracking-wider">Security & Validation</div>
              <h3 className="text-lg font-bold text-white">Evidence Submission & Review</h3>
              <p className="text-sm text-[#A6B0BF] leading-relaxed">
                Strict file magic-header validation (PNG, JPG, PDF), path traversal guards, and file size controls protect evidence files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRIVACY AND TRUST SECTION */}
      <section className="py-16 bg-[#111214] border-t border-[#293442]/60 text-center">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-left space-y-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold text-white">Your money stays under your control.</h3>
            </div>
            <p className="text-sm text-[#A6B0BF] leading-relaxed">
              PayRakshak provides advisory assistance and evidence analysis. It does not independently execute refunds, reverse payments, or access your live bank account.
            </p>
            <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-amber-300 uppercase tracking-wider">
                🔒 Security Rule: Never share your UPI PIN or OTP with anyone.
              </span>
              <Link href="/privacy" className="text-[#20C4D8] hover:underline font-medium">
                Read Privacy & Limitations Disclosure ➔
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-[#293442]/60 bg-[#071629] py-12 text-sm text-[#A6B0BF]">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-[#20C4D8] text-[#071629] font-bold flex items-center justify-center text-xs">PR</div>
            <span className="font-bold text-white">PayRakshak</span>
            <span className="text-xs text-[#A6B0BF] ml-2">© 2026 UPIResolve AI</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy & Limits</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/register" className="text-[#20C4D8] font-semibold hover:underline">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
