import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ghar Search — Agentic Due-Diligence Layer for Indian Homebuyers | HackIIITD 2026",
  description: "Paste a property listing. Get a verified trust report, backed by evidence from official records. Powered by TinyFish web agent APIs.",
  keywords: [
    "Ghar Search",
    "HackIIITD 2026",
    "TinyFish",
    "RERA Verification",
    "PropTech",
    "Consumer Protection",
    "Indian Real Estate Due Diligence",
    "AI Web Agents"
  ],
  authors: [
    { name: "Farhan Rahaman Mallik" },
    { name: "Piyush Kumar Gautam" }
  ],
  openGraph: {
    title: "Ghar Search — One link in, a verified trust report out",
    description: "An agentic due-diligence layer for Indian homebuyers, powered by the TinyFish web agent APIs.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} bg-[#050505] antialiased`}>
      <body className="bg-[#050505] text-white/90 min-h-screen selection:bg-emerald-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
