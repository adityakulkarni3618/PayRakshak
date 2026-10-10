import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#111214] text-[#F5F7FA] font-sans antialiased selection:bg-[#20C4D8]/20 selection:text-[#20C4D8]">
      {/* Subtle Background Lighting */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,35,64,0.4),rgba(255,255,255,0))]" />

      {/* 1. TOP NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#111214]/90 backdrop-blur-md border-b border-[#293442]/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          {/* Left: Branding */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1677F2] text-white font-bold shadow-sm">
              <svg
                width={16}
                height={16}
                style={{ width: "16px", height: "16px" }}
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-base font-semibold tracking-tight text-white">PayRakshak</span>
              <span className="hidden sm:inline text-xs text-[#A6B0BF]">UPIResolve AI</span>
            </div>
          </Link>

          {/* Right: Navigation Links & Auth */}
          <nav className="flex items-center gap-6 text-sm text-[#A6B0BF]">
            <a href="#how-it-works" className="hidden sm:inline hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hidden sm:inline hover:text-white transition-colors">Features</a>
            <Link href="/privacy" className="hidden sm:inline hover:text-white transition-colors">Privacy</Link>
            <Link href="/login" className="hover:text-white transition-colors px-2 py-1">Sign in</Link>
            <Link
              href="/register"
              className="rounded-md bg-[#20C4D8] px-3.5 py-1.5 text-sm font-semibold text-[#071629] hover:bg-[#20C4D8]/90 transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-14 pb-8 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-[1.18]">
            Clarity when a <span className="text-[#20C4D8]">UPI payment</span> goes wrong.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#A6B0BF] leading-relaxed">
            Understand your transaction, review the available findings, and discover the next step for your UPI dispute.
          </p>

          <div className="mt-7 flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="rounded-md bg-[#20C4D8] px-5 py-2.5 text-sm font-semibold text-[#071629] hover:bg-[#20C4D8]/90 transition-colors shadow-sm"
            >
              Get Started
            </Link>
            <a
              href="#showcase"
              className="rounded-md border border-[#293442] bg-[#17191D] px-5 py-2.5 text-sm font-medium text-[#F5F7FA] hover:bg-[#293442]/40 transition-colors"
            >
              Explore the Platform
            </a>
          </div>
        </div>

        {/* 3. PRODUCT SHOWCASE */}
        <div id="showcase" className="mt-12 mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-xl border border-[#293442] bg-[#071629] p-4 sm:p-5 shadow-xl text-left">
            {/* Top Showcase Banner */}
            <div className="mb-4 flex items-center justify-between border-b border-[#293442] pb-3 px-1">
              <span className="text-xs text-[#A6B0BF] font-mono">CASE PREVIEW · UPIR-2026-000123</span>
              <span className="text-[11px] font-mono text-[#20C4D8] bg-[#20C4D8]/10 px-2 py-0.5 rounded border border-[#20C4D8]/20">
                PRODUCT PREVIEW · ILLUSTRATIVE DATA
              </span>
            </div>

            {/* Application Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Sidebar */}
              <div className="hidden lg:block lg:col-span-3 rounded-lg border border-[#293442] bg-[#0D2340] p-3 text-xs">
                <div className="mb-3 font-semibold text-[#A6B0BF] uppercase tracking-wider text-[10px]">Workspace</div>
                <div className="space-y-1">
                  <div className="rounded-md bg-[#1677F2]/20 px-3 py-2 text-[#20C4D8] font-medium border border-[#1677F2]/30 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#20C4D8]" /> Overview
                  </div>
                  <div className="rounded-md px-3 py-2 text-[#A6B0BF] hover:text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent" /> Transactions
                  </div>
                  <div className="rounded-md px-3 py-2 text-[#A6B0BF] hover:text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent" /> My disputes
                  </div>
                  <div className="rounded-md px-3 py-2 text-[#A6B0BF] hover:text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent" /> Evidence
                  </div>
                </div>
              </div>

              {/* Main Content Workspace */}
              <div className="lg:col-span-9 space-y-4">
                {/* Header */}
                <div className="rounded-lg border border-[#293442] bg-[#0D2340] p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Dispute overview</h3>
                    <p className="text-xs text-[#A6B0BF] mt-0.5">Reference UPIR-2026-000123</p>
                  </div>
                  <span className="text-xs bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded border border-amber-500/30 font-medium">
                    Sample case · Awaiting information
                  </span>
                </div>

                {/* Transaction Summary Card */}
                <div className="rounded-lg border border-[#293442] bg-[#0D2340] p-4 text-xs space-y-2">
                  <div className="font-semibold text-white text-sm mb-2">Transaction Details</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-[#293442]/60">
                    <div>
                      <div className="text-[#A6B0BF]">UPI Reference</div>
                      <div className="font-mono text-white mt-0.5">REF0002-UPI-8841</div>
                    </div>
                    <div>
                      <div className="text-[#A6B0BF]">Amount</div>
                      <div className="font-semibold text-white mt-0.5">₹1,500.00 <span className="text-[10px] font-normal text-[#A6B0BF]">(Illustrative)</span></div>
                    </div>
                    <div>
                      <div className="text-[#A6B0BF]">Category</div>
                      <div className="text-white mt-0.5">Merchant Non-Delivery</div>
                    </div>
                    <div>
                      <div className="text-[#A6B0BF]">Payment Status</div>
                      <div className="text-amber-400 font-medium mt-0.5">SENT · FAILED</div>
                    </div>
                  </div>
                </div>

                {/* Two Balanced Panels: Findings & Recommendation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Panel A: What We Found */}
                  <div className="rounded-lg border border-[#293442] bg-[#0D2340] p-4 space-y-2 text-xs">
                    <div className="font-semibold text-white text-sm">What we found</div>
                    <p className="text-[#A6B0BF] leading-relaxed">
                      The transaction failed at payment processing. The order reference remains unverified with the merchant records.
                    </p>
                    <div className="pt-2 text-[11px] text-[#20C4D8] font-mono">
                      FLAG: MERCHANT_ORDER_UNVERIFIED
                    </div>
                  </div>

                  {/* Panel B: Recommended Next Step */}
                  <div className="rounded-lg border border-[#293442] bg-[#0D2340] p-4 space-y-2 text-xs">
                    <div className="font-semibold text-white text-sm">Recommended next step</div>
                    <p className="text-[#A6B0BF] leading-relaxed">
                      Request order reference & delivery evidence from merchant before taking further action.
                    </p>
                    <div className="pt-2">
                      <Link href="/disputes/new" className="text-[#20C4D8] font-medium hover:underline inline-flex items-center gap-1">
                        File New Dispute ➔
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Provider Note */}
                <div className="text-[11px] text-[#A6B0BF] text-center sm:text-left pt-1">
                  * Synthetic sample data — not verified against a live payment switch or bank provider.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW PAYRAKSHAK HELPS */}
      <section id="how-it-works" className="py-16 border-t border-[#293442]/50 bg-[#111214]">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How PayRakshak helps
            </h2>
            <p className="mt-2 text-sm text-[#A6B0BF]">
              A structured advisory process to understand and manage UPI dispute outcomes safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="rounded-lg border border-[#293442] bg-[#17191D] p-5 space-y-2">
              <div className="text-xs font-mono text-[#20C4D8]">STEP 01</div>
              <h3 className="text-base font-semibold text-white">1. Review your transaction</h3>
              <p className="text-xs text-[#A6B0BF] leading-relaxed">
                Inspect payment attributes, dates, amounts, and statuses from sample records or your uploaded statement CSV.
              </p>
            </div>

            <div className="rounded-lg border border-[#293442] bg-[#17191D] p-5 space-y-2">
              <div className="text-xs font-mono text-[#20C4D8]">STEP 02</div>
              <h3 className="text-base font-semibold text-white">2. Understand findings</h3>
              <p className="text-xs text-[#A6B0BF] leading-relaxed">
                Our ML classification model and consistency rules analyze your complaint text and surface advisory findings.
              </p>
            </div>

            <div className="rounded-lg border border-[#293442] bg-[#17191D] p-5 space-y-2">
              <div className="text-xs font-mono text-[#20C4D8]">STEP 03</div>
              <h3 className="text-base font-semibold text-white">3. Track your dispute</h3>
              <p className="text-xs text-[#A6B0BF] leading-relaxed">
                Follow status updates, submit evidence attachments securely, and monitor case timeline progression.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CORE CAPABILITIES */}
      <section id="features" className="py-16 border-t border-[#293442]/50 bg-[#17191D]">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Platform Features
            </h2>
            <p className="mt-2 text-sm text-[#A6B0BF]">
              Built with strict advisory boundaries and verification rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
            <div className="rounded-lg border border-[#293442] bg-[#071629] p-5 space-y-1.5">
              <h3 className="text-sm font-semibold text-white">Complaint Classification</h3>
              <p className="text-xs text-[#A6B0BF] leading-relaxed">
                Categorizes reported issues such as refund delays, duplicate debits, or failed payments, abstaining when complaint text is ambiguous.
              </p>
            </div>

            <div className="rounded-lg border border-[#293442] bg-[#071629] p-5 space-y-1.5">
              <h3 className="text-sm font-semibold text-white">Transaction Consistency Checks</h3>
              <p className="text-xs text-[#A6B0BF] leading-relaxed">
                Flags potential duplicate reference candidates, status mismatches, and multi-complaint occurrences automatically.
              </p>
            </div>

            <div className="rounded-lg border border-[#293442] bg-[#071629] p-5 space-y-1.5">
              <h3 className="text-sm font-semibold text-white">Case Tracking & Timelines</h3>
              <p className="text-xs text-[#A6B0BF] leading-relaxed">
                Provides timestamped audit histories for case creation, status changes, information requests, and reviewer notes.
              </p>
            </div>

            <div className="rounded-lg border border-[#293442] bg-[#071629] p-5 space-y-1.5">
              <h3 className="text-sm font-semibold text-white">Evidence Submission & Review</h3>
              <p className="text-xs text-[#A6B0BF] leading-relaxed">
                Supports file attachments (PNG, JPG, PDF) with magic-header validation, file size controls, and permission checks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRIVACY & DISCLOSURE */}
      <section className="py-14 border-t border-[#293442]/50 bg-[#111214] text-center">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-lg border border-[#293442] bg-[#071629] p-6 text-left space-y-3">
            <h3 className="text-base font-bold text-white">Advisory Assistance Disclosure</h3>
            <p className="text-xs text-[#A6B0BF] leading-relaxed">
              PayRakshak provides advisory assistance and evidence analysis. It does not independently execute refunds, reverse payments, or access your live bank account.
            </p>
            <div className="pt-2 border-t border-[#293442]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-amber-300">
                Never share your UPI PIN or OTP with anyone.
              </span>
              <Link href="/privacy" className="text-[#20C4D8] hover:underline">
                Read Privacy & Limitations ➔
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-[#293442]/50 bg-[#071629] py-8 text-xs text-[#A6B0BF]">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">PayRakshak</span>
            <span>© 2026 UPIResolve AI</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/register" className="text-[#20C4D8] hover:underline font-medium">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
