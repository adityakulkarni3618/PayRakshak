import Link from "next/link";

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 p-8 text-sm">
      <h1 className="font-display text-3xl">Privacy and limitations</h1>
      <ul className="list-disc space-y-2 pl-5">
        <li>This is a prototype. It is not connected to NPCI, a bank or a UPI app and cannot verify a real payment.</li>
        <li>Transactions are labelled SYNTHETIC, USER_IMPORTED or PROVIDER_VERIFIED. Importing a CSV does not prove a payment is authentic.</li>
        <li>The complaint classifier is trained on synthetic, template-based text. Its confidence is confidence in the category, not the chance of fraud or that a complaint is genuine.</li>
        <li>Recommendations are advisory. Nothing here issues refunds, reverses payments or closes a case without a person.</li>
        <li>We never ask for your UPI PIN, OTP, card details or bank password. If anyone asks, do not share them.</li>
        <li>Uploaded evidence is limited to PNG, JPG and PDF, is stored privately, and is visible only to you and authorised reviewers. Do not upload documents that show full card numbers or ID numbers.</li>
        <li>For an unauthorized transaction, report it at once through your bank or payment app. In India you can also call the National Cyber Crime Helpline 1930.</li>
      </ul>
      <Link href="/" className="underline">Back</Link>
    </main>
  );
}
