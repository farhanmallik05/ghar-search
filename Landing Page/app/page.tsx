import Navigation from "@/components/Navigation";
import ScrollCanvas from "@/components/ScrollCanvas";
import LiveVerdictDemo from "@/components/LiveVerdictDemo";
import PdfContentSections from "@/components/PdfContentSections";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#050505] text-white/90 selection:bg-emerald-500/30 selection:text-white">
      {/* Floating Glassmorphic Navigation with HackIIITD 2026 branding */}
      <Navigation />

      {/* 400vh Sticky Scroll-Linked Canvas Animation Sequence */}
      <ScrollCanvas
        frameCount={240}
        sequencePath="/sequence/frame_"
        fileExtension="webp"
      />

      {/* Slide 8 MVP Prototype: The Live Verdict Screen */}
      <LiveVerdictDemo />

      {/* Slides 2 to 6: Problem, Solution, Users, 5-Layer Pipeline, TinyFish & Team */}
      <PdfContentSections />

      {/* Minimalist Hackathon Footer */}
      <Footer />
    </main>
  );
}
