# Ghar Search — Design System Specification
**Version:** 1.0.0  
**Context:** HackIIITD 2026 • Autonomous Due-Diligence Layer • TinyFish Architecture  
**Design Reference:** Cinematic Dark Luxury UI (`Landing Page/` visual identity)

---

## 1. Executive Summary & Design Vision

The **Ghar Search Design System** codifies the visual, behavioral, and structural design standards derived from the ultra-premium **Ghar Search Landing Page**. Designed to communicate **absolute trust, statutory rigor, and autonomous agent intelligence**, the interface merges **cinematic luxury aesthetics** with **high-density forensic data visualization**.

Homebuyers and financial auditors inspecting property fraud require a feeling of **precision, security, and institutional authority**. This is achieved through:
1. **The Deep Void (`#050505`)**: Infinite dark canvas that eliminates screen glare and elevates statutory data.
2. **Elevated Dark Glassmorphism**: Multilayered frosted glass with fine micron borders (`rgba(255, 255, 255, 0.08)` to `0.12`).
3. **Cybernetic Accents**: Vibrant Emerald (`#10B981`) for verified status, Cyan (`#06B6D4`) for agent telemetry, and Gold (`#D4AF37`) for luxury tiers.
4. **Forensic Typography**: Clean geometric sans (`Inter` / `Plus Jakarta Sans`) paired with tabular monospace (`JetBrains Mono`) for RERA IDs, court case numbers, and cryptographic proof hashes.
5. **Atmospheric Depth**: Film grain textures, a 60px coordinate grid, and radial vignettes.

---

## 2. Three-Layer Token Architecture

The design system adheres to the standard Three-Layer Token Structure:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Component Tokens                                  │
│  --nav-bg, --card-bg, --button-primary-bg, --input-border    │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Semantic Tokens                                   │
│  --color-background, --color-surface, --color-primary        │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Primitive Tokens                                  │
│  --primitive-color-black-void, --primitive-color-emerald-500 │
└─────────────────────────────────────────────────────────────┘
```

- **Source of Truth:** [`tokens.json`](file:///c:/Users/Piyushkr.gautam/Downloads/PLAN/IIITD/ghar-search/design-system/tokens.json)
- **Compiled CSS Custom Properties:** [`tokens.css`](file:///c:/Users/Piyushkr.gautam/Downloads/PLAN/IIITD/ghar-search/design-system/tokens.css)

---

## 3. Color Foundations

### 3.1 Dark Canvas & Elevation Hierarchy

| Token Name | Primitive Reference | Hex / RGBA | Role / Usage |
|:---|:---|:---|:---|
| `--color-background` | `--primitive-color-black-void` | `#050505` | Canvas background, html/body root |
| `--color-surface` | `--primitive-color-black-surface` | `#0d0d0e` | Default card and panel background |
| `--color-surface-subtle` | `--primitive-color-black-subtle` | `#121214` | Inset containers, code blocks, terminal header |
| `--color-surface-border` | `--primitive-color-black-border` | `#1f1f23` | Default element outline & separation lines |
| `--color-surface-hover` | `--primitive-color-black-hover` | `#26262b` | Hover state background for list items |
| `--color-surface-elevated` | `--primitive-color-black-elevated` | `#161619` | Floating modals, dropdowns, sticky headers |

### 3.2 Accent & Brand Colors

| Palette | Token | Hex | Semantic Intent |
|:---|:---|:---|:---|
| **Emerald (Primary)** | `--color-primary` | `#10B981` | Primary verification, Clean Verdict, Action Buttons |
| **Emerald Hover** | `--color-primary-hover` | `#34D399` | Button hover, active indicators, neon glow |
| **Emerald Glow** | `--color-primary-glow` | `rgba(16, 185, 129, 0.25)` | Halo backdrops behind verification cards |
| **Cyan (Telemetry)** | `--color-accent-cyan` | `#06B6D4` | TinyFish web crawler stream, dynamic data logs |
| **Gold (Luxury)** | `--color-accent-gold` | `#D4AF37` | Luxury badges, premium audit tiers, highlights |
| **Bronze** | `--color-accent-bronze` | `#B38B59` | Architectural nuances, subtle badges |
| **Platinum** | `--color-accent-platinum` | `#E5E5EA` | Secondary icons, subtle metallic text |

### 3.3 Trust & Risk Status Scales

| Verdict Tier | Score Range | Color Token | Badge BG | Badge Border | Icon |
|:---|:---|:---|:---|:---|:---|
| **High Trust (Clean)** | 80 – 100 | `--color-trust-high` (`#10B981`) | `rgba(2, 44, 34, 0.65)` | `rgba(16, 185, 129, 0.30)` | `ShieldCheck` |
| **Moderate Trust (Caution)** | 60 – 79 | `--color-trust-moderate` (`#F59E0B`) | `rgba(69, 26, 3, 0.50)` | `rgba(245, 158, 11, 0.30)` | `AlertTriangle` |
| **Significant Risk (Delayed)** | 40 – 59 | `--color-trust-risk` (`#F97316`) | `rgba(67, 20, 7, 0.50)` | `rgba(249, 115, 22, 0.30)` | `AlertTriangle` |
| **Critical Alert (Flagged)** | 0 – 39 | `--color-trust-alert` (`#EF4444`) | `rgba(76, 5, 25, 0.50)` | `rgba(239, 68, 68, 0.30)` | `AlertOctagon` |

### 3.4 Foreground & Text Hierarchy

| Token Name | RGBA Value | Intended Typography Hierarchy |
|:---|:---|:---|
| `--color-foreground` | `rgba(255, 255, 255, 0.95)` | Primary headlines, metric numbers, active tabs |
| `--color-foreground-secondary`| `rgba(255, 255, 255, 0.85)` | Body text, section subheadings, list values |
| `--color-foreground-muted` | `rgba(255, 255, 255, 0.65)` | Helper notes, descriptions, timestamps |
| `--color-foreground-subtle` | `rgba(255, 255, 255, 0.40)` | Form placeholders, subtle captions, disabled icons |

---

## 4. Typography Scale

Fonts are mapped via CSS variables `--font-sans` (`Inter` / `Plus Jakarta Sans`) and `--font-mono` (`JetBrains Mono`).

```
Display Large:   48px - 60px  •  font-light / font-bold  •  letter-spacing: -0.03em
H1 / Title:      36px - 44px  •  font-normal / font-bold •  letter-spacing: -0.02em
H2 / Section:    24px - 30px  •  font-light / font-semibold • letter-spacing: -0.01em
H3 / Card Title: 18px - 20px  •  font-medium / font-semibold
Body Base:       15px - 16px  •  font-normal  •  line-height: 1.6
Body Small:      13px - 14px  •  font-normal / font-medium
Caption / Tag:   11px - 12px  •  font-mono    •  letter-spacing: 0.1em (UPPERCASE)
Micro:           9px - 10px   •  font-mono    •  letter-spacing: 0.15em (UPPERCASE)
```

---

## 5. Atmosphere, Elevation & Glassmorphism

### 5.1 Atmospheric Utilities

```css
/* Subtle 60px Coordinate Grid */
.subtle-grid {
  background-size: 60px 60px;
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
}

/* Film Grain Luxury Texture */
.film-grain {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
}

/* Seamless Vignette Overlay */
.vignette-overlay {
  background: radial-gradient(
    circle at center,
    transparent 45%,
    rgba(5, 5, 5, 0.4) 70%,
    rgba(5, 5, 5, 0.95) 90%,
    #050505 100%
  );
  pointer-events: none;
}
```

### 5.2 Glassmorphism System

- **Floating Navigation (`.glass-panel`):**
  `background: rgba(10, 10, 12, 0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.10); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.85);`
- **Elevated Interactive Card (`.glass-card`):**
  `background: rgba(13, 13, 14, 0.90); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.6);`

---

## 6. Component Specifications & State Matrix

### 6.1 Floating Navigation Bar
- **Pill Shape:** Fully rounded (`rounded-full`) floating container centered at `max-w-7xl`.
- **Hackathon Identifier:** Emerald badge `HACKIIITD 2026` in `JetBrains Mono` (`text-[9px]`, `tracking-wider`).
- **Live Indicator:** Glowing pulse dot `w-2 h-2 rounded-full bg-emerald-400 animate-pulse`.

### 6.2 Primary Action Button (Verify / Action)
| Property | Default | Hover | Active | Disabled |
|:---|:---|:---|:---|:---|
| **Background** | `#10B981` (Emerald) | `#34D399` (Emerald 400) | `#059669` | `rgba(255, 255, 255, 0.10)` |
| **Text** | `#000000` (Pitch Black) | `#000000` | `#000000` | `rgba(255, 255, 255, 0.30)` |
| **Shadow / Glow** | `0 0 24px -2px rgba(16, 185, 129, 0.35)` | `0 0 32px 0px rgba(16, 185, 129, 0.50)` | `none` | `none` |
| **Scale** | `scale(1)` | `scale(1.01)` | `scale(0.98)` | `scale(1)` |

### 6.3 Input Fields & Console Cards
- **Background:** `#0a0a0c`
- **Border:** `1px solid rgba(255, 255, 255, 0.12)`
- **Focus State:** Border shifts to `#10B981` with ring `ring-2 ring-emerald-500/20`.
- **Placeholder:** `rgba(255, 255, 255, 0.40)`.

### 6.4 Status & Category Badges
- **Shape:** `rounded-full px-3 py-1`
- **Typography:** `font-mono text-[10px] sm:text-[11px] tracking-wider uppercase`
- **Coloring:** Contextual tint matching Trust status (`emerald`, `amber`, `orange`, `rose`, or `cyan`).

---

## 7. Tailwind CSS Configuration Guide

Integrate the design system directly into Tailwind configuration (`tailwind.config.ts`):

```typescript
theme: {
  extend: {
    colors: {
      background: "#050505",
      surface: {
        DEFAULT: "#0d0d0e",
        subtle: "#121214",
        border: "#1f1f23",
        hover: "#26262b",
        elevated: "#161619",
      },
      luxury: {
        gold: "#D4AF37",
        bronze: "#B38B59",
        platinum: "#E5E5EA",
        emerald: "#10B981",
        cyan: "#06B6D4",
      },
      trust: {
        high: "#10B981",
        moderate: "#F59E0B",
        risk: "#F97316",
        alert: "#EF4444",
      },
    },
    fontFamily: {
      sans: ["var(--font-sans)", "Inter", "sans-serif"],
      mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
    },
    boxShadow: {
      "glow-emerald": "0 0 28px -4px rgba(16, 185, 129, 0.35)",
      "glow-cyan": "0 0 28px -4px rgba(6, 182, 212, 0.35)",
      "glow-gold": "0 0 28px -4px rgba(212, 175, 55, 0.25)",
      "card-dark": "0 4px 20px -2px rgba(0, 0, 0, 0.7)",
      "elevated-dark": "0 8px 32px rgba(0, 0, 0, 0.85)",
    },
  },
}
```

---

## 8. Summary of Harmonization Checklist

- [x] **Canonical Token Specifications:** Generated [`tokens.json`](file:///c:/Users/Piyushkr.gautam/Downloads/PLAN/IIITD/ghar-search/design-system/tokens.json) and compiled [`tokens.css`](file:///c:/Users/Piyushkr.gautam/Downloads/PLAN/IIITD/ghar-search/design-system/tokens.css).
- [x] **Design System Master Spec:** Documented in [`DESIGN_SYSTEM.md`](file:///c:/Users/Piyushkr.gautam/Downloads/PLAN/IIITD/ghar-search/design-system/DESIGN_SYSTEM.md).
- [ ] **Tailwind Config Harmonization:** Update `frontend/tailwind.config.ts`.
- [ ] **CSS System Synchronizing:** Update `frontend/src/app/globals.css`.
- [ ] **Root Shell Synchronizing:** Update `frontend/src/app/layout.tsx`.
- [ ] **Component Harmonization:** Update `Navbar.tsx`, `Footer.tsx`, `TrustGauge.tsx`, `EvidenceCard.tsx`, `ProgressRail.tsx`.
- [ ] **Page Harmonization:** Update `page.tsx` (Verification Console), `progress/[id]`, `report/[id]`, `dashboard`, `compare`, `bulk`.
