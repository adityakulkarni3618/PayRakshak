import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "PayRakshak — UPIResolve AI", description: "Official 3D AI-Powered UPI Dispute Detection & Resolution Platform" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0A0E17] text-[#E2E8F0] font-sans antialiased selection:bg-[#00F0FF]/20 selection:text-[#00F0FF]">
        {children}
      </body>
    </html>
  );
}
