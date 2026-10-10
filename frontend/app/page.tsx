import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-ink-900 text-ink-100">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-display text-5xl text-white">UPIResolve <span className="text-cy-400">AI</span></h1>
        <p className="mt-4 text-xl">Tell us what went wrong with a UPI payment. We classify it, check the records, explain what we found, and tell you the next step.</p>
        <div className="mt-8 flex gap-3">
          <Link href="/register" className="btn-primary">Create account</Link>
          <Link href="/login" className="btn border border-ink-500 text-white hover:bg-ink-800">Sign in</Link>
        </div>
        <section className="mt-14 space-y-3 text-sm text-ink-200">
          <h2 className="font-display text-lg text-white">What this prototype does and does not do</h2>
          <p>It recommends actions. It never moves money, refunds a payment, or closes a complaint on its own. A person reviews every consequential decision.</p>
          <p>It is not connected to NPCI, any bank or any UPI app. Transactions come from sample data or your own CSV import and are labelled by source.</p>
          <p>Never share your UPI PIN or OTP with anyone, including this app. <Link href="/privacy" className="text-cy-400 underline">Read the full privacy and limits notes</Link>.</p>
        </section>
      </div>
    </main>
  );
}
