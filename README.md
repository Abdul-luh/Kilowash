# Kilowash

Solar-powered automated self-service laundry for student hostels in Lagos (LASU Pilot). Book a 30-minute wash slot online, receive a unique 4-digit keypad PIN, and unlock the machine instantly — no queues, no NEPA/grid issues, no wahala.

## Overview

Kilowash (`https://kilowash.ng`) is the landing page, live bay showcase, and early-access waitlist for a smart campus laundry system built around ESP32-controlled washing machines. Students book and pay online, get an instant 4-digit unlock PIN, and wash on strict clock time with a 10-minute automated unloading buffer between slots.

## Stack

- **React 19** + **TypeScript** + **Vite 6**
- **GSAP** (`gsap` + `ScrollTrigger`) for scroll choreography and the mobile 3D perspective step reel
- **Tailwind CSS** + neumorphic / glassmorphic UI styling
- **Web3Forms** for waitlist sign-up and contact form submissions

## Sections & Components

- **`Navbar`** (`src/components/Navbar.tsx`) — sticky navigation and quick jump links
- **`Hero`** (`src/components/Hero.tsx`) — primary headline, animated clothing accents, key metrics (`18 / 20 Online`, `10m Guaranteed`, `₦1,500 Flat`), and live bay timetable cards
- **`Ticker`** (`src/components/Ticker.tsx`) — scrolling trust signals and system highlights
- **`HowItWorks`** (`src/components/HowItWorks.tsx`) — 4-step booking flow (*Select Bay & Campus*, *Pick Slot & Pay*, *Get Your PIN*, *Unlock & Wash*) with desktop entrance stagger and a mobile 3D perspective reel supporting both vertical scroll and horizontal swipe
- **`Pricing`** (`src/components/Pricing.tsx`) — Standard Wash (`₦1,500`), Heavy / Bulky (`₦1,800`), Delicate Express (`₦1,500`), and laundry comparison table
- **`FAQ`** (`src/components/FAQ.tsx`) — accessible accordion covering strict clock slots, keypad PIN unlock, solar backup & fault protection, blocked-machine strikes, and the non-refundable booking policy
- **`Waitlist` & `Contact`** (`src/components/Waitlist.tsx`, `src/components/Contact.tsx`) — early-access waitlist and direct campus team contact (`hello@kilowash.ng`, `+234 703 382 4496`)
- **`Footer` & `LegalModal`** (`src/components/Footer.tsx`, `src/components/LegalModal.tsx`) — frosted glassmorphic legal modal covering Privacy Policy, Terms of Use, and the strict No-Refund & Forfeiture Policy

## SEO & Web Assets

- **`index.html`** — canonical URL (`https://kilowash.ng/`), meta description/keywords, Lagos geo tags (`NG-LA`), Open Graph & Twitter/X `summary_large_image` cards, font preconnects, `<noscript>` fallback, and Schema.org JSON-LD (`DryCleaningOrLaundry` / `LocalBusiness`, `Service` + `Offer`, `FAQPage`)
- **`public/robots.txt` & `public/sitemap.xml`** — crawler directives and canonical sitemap
- **`public/site.webmanifest`** — PWA metadata and favicon references
- **`public/og-image.png`** — static social preview image

## Development

```bash
npm install
npm run dev
```

## Build & Preview

```bash
npm run build
npm run preview
```
