"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ──────────────────────────────────────────────────────────────
// Lightweight bilingual strings – English & Hindi
// Only covers user-facing static labels (not API data).
// ──────────────────────────────────────────────────────────────

export type Lang = "en" | "hi";

export const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home":         "Home",
    "nav.dashboard":    "Dashboard",
    "nav.transactions": "Transactions",
    "nav.disputes":     "My Cases",
    "nav.track":        "Track Case",
    "nav.signIn":       "Sign In",
    "nav.signOut":      "Sign Out",

    // Dashboard
    "dash.title":           "Dashboard",
    "dash.reportIssue":     "Report a payment issue",
    "dash.recentCases":     "Recently updated cases",
    "dash.notifications":   "Notifications",
    "dash.recentTxns":      "Recent transactions",
    "dash.noCases":         "No cases yet.",
    "dash.noNotifs":        "Nothing new.",
    "dash.noTxns":          "No transactions yet.",

    // Onboarding
    "onboard.title":     "Get started with PayRakshak",
    "onboard.step1":     "Import your UPI transactions via CSV",
    "onboard.step2":     "Report a payment issue against any transaction",
    "onboard.step3":     "Track your case and respond to queries from the support team",
    "onboard.importBtn": "Import Transactions",
    "onboard.reportBtn": "Report an Issue",
    "onboard.trackBtn":  "Track a Case",

    // Common
    "common.loading":   "Loading…",
    "common.error":     "Something went wrong.",
    "common.noResults": "No results.",
    "common.prev":      "← Previous",
    "common.next":      "Next →",
    "common.signIn":    "Sign In",
    "common.register":  "Create Account",
    "common.cancel":    "Cancel",
    "common.submit":    "Submit",
    "common.save":      "Save",
    "common.close":     "Close",

    // Status labels
    "status.SUCCESS":               "Success",
    "status.FAILED":                "Failed",
    "status.PENDING":               "Pending",
    "status.REVERSED":              "Reversed",
    "status.SUBMITTED":             "Submitted",
    "status.RESOLVED":              "Resolved",
    "status.UNDER_REVIEW":          "Under Review",
    "status.AWAITING_INFORMATION":  "Your Input Needed",
    "status.ESCALATED":             "Escalated",
  },
  hi: {
    // Navigation
    "nav.home":         "होम",
    "nav.dashboard":    "डैशबोर्ड",
    "nav.transactions": "लेन-देन",
    "nav.disputes":     "मेरे मामले",
    "nav.track":        "मामला ट्रैक करें",
    "nav.signIn":       "साइन इन करें",
    "nav.signOut":      "साइन आउट",

    // Dashboard
    "dash.title":           "डैशबोर्ड",
    "dash.reportIssue":     "भुगतान समस्या दर्ज करें",
    "dash.recentCases":     "हाल ही में अपडेट किए गए मामले",
    "dash.notifications":   "सूचनाएं",
    "dash.recentTxns":      "हालिया लेन-देन",
    "dash.noCases":         "अभी कोई मामला नहीं।",
    "dash.noNotifs":        "कोई नई सूचना नहीं।",
    "dash.noTxns":          "अभी कोई लेन-देन नहीं।",

    // Onboarding
    "onboard.title":     "PayRakshak के साथ शुरुआत करें",
    "onboard.step1":     "CSV के ज़रिए अपने UPI लेन-देन आयात करें",
    "onboard.step2":     "किसी भी लेन-देन के खिलाफ भुगतान समस्या दर्ज करें",
    "onboard.step3":     "अपना मामला ट्रैक करें और सपोर्ट टीम के सवालों का जवाब दें",
    "onboard.importBtn": "लेन-देन आयात करें",
    "onboard.reportBtn": "समस्या दर्ज करें",
    "onboard.trackBtn":  "मामला ट्रैक करें",

    // Common
    "common.loading":   "लोड हो रहा है…",
    "common.error":     "कुछ गलत हो गया।",
    "common.noResults": "कोई परिणाम नहीं।",
    "common.prev":      "← पिछला",
    "common.next":      "अगला →",
    "common.signIn":    "साइन इन करें",
    "common.register":  "खाता बनाएं",
    "common.cancel":    "रद्द करें",
    "common.submit":    "जमा करें",
    "common.save":      "सहेजें",
    "common.close":     "बंद करें",

    // Status labels
    "status.SUCCESS":               "सफल",
    "status.FAILED":                "विफल",
    "status.PENDING":               "लंबित",
    "status.REVERSED":              "वापस किया",
    "status.SUBMITTED":             "दर्ज किया",
    "status.RESOLVED":              "हल हुआ",
    "status.UNDER_REVIEW":          "समीक्षाधीन",
    "status.AWAITING_INFORMATION":  "आपकी जानकारी चाहिए",
    "status.ESCALATED":             "आगे भेजा",
  },
};

// ──────────────────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────────────────
const LangCtx = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("pr-lang") as Lang | null;
    if (stored === "en" || stored === "hi") setLangState(stored);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("pr-lang", l);
  }

  function t(key: string): string {
    return STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  }

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}

// ──────────────────────────────────────────────────────────────
// Toggle button component
// ──────────────────────────────────────────────────────────────
export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "hi" : "en")}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle language between English and Hindi"
      title={lang === "en" ? "Switch to Hindi" : "Switch to English"}
    >
      {lang === "en" ? (
        <>🇮🇳 <span>हिन्दी</span></>
      ) : (
        <>🇺🇸 <span>English</span></>
      )}
    </button>
  );
}
