import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageEntryTransition from '@/components/PageEntryTransition';
import ReturnToLandingPill from '@/components/ReturnToLandingPill';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Ghar Search — Agentic Property Due-Diligence for Indian Homebuyers',
  description:
    'Paste a property listing. Get a verified trust report, backed by evidence from official government records. HackIIITD 2026.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full dark ${sansFont.variable} ${monoFont.variable}`}>
      <body className="flex flex-col min-h-screen text-white/90 bg-[#050505] antialiased font-sans selection:bg-emerald-500/30 selection:text-white subtle-grid">
        <Navbar />
        <main className="flex-1 relative z-10">
          <PageEntryTransition>{children}</PageEntryTransition>
        </main>
        <Footer />
        <ReturnToLandingPill />
      </body>
    </html>
  );
}
