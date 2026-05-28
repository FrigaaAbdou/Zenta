# Phase 2 Front Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `front` repository for the public website and appointment flow, with a UI faithful to the reference site and a clean integration surface toward `back`.

**Architecture:** The frontend is a React + Vite + TypeScript app organized by page, shared layout components, and feature modules. UI primitives come from `shadcn/ui`, content is locale-aware from the start, and API calls are isolated in a dedicated client layer so the appointment flow can be developed against mocks or the real backend without changing page code.

**Tech Stack:** React, Vite, TypeScript, React Router, Tailwind CSS, shadcn/ui, react-hook-form, zod, Vitest, React Testing Library

---

### Task 1: Initialize The `front` Repository

**Files:**
- Create: `front/package.json`
- Create: `front/tsconfig.json`
- Create: `front/vite.config.ts`
- Create: `front/src/main.tsx`
- Create: `front/src/app/router/index.tsx`
- Create: `front/src/styles/globals.css`
- Create: `front/index.html`

- [ ] **Step 1: Create the Vite React TypeScript app**

Run:

```bash
npm create vite@latest front -- --template react-ts
```

Expected:

- a new `front/` directory exists
- Vite React TypeScript scaffold is generated

- [ ] **Step 2: Install core dependencies**

Run:

```bash
cd front
npm install react-router-dom react-hook-form zod @hookform/resolvers
npm install -D tailwindcss postcss autoprefixer
```

Expected:

- dependencies install successfully
- `package.json` includes router, form, and validation libraries

- [ ] **Step 3: Initialize Tailwind**

Run:

```bash
cd front
npx tailwindcss init -p
```

Expected:

- `tailwind.config.js`
- `postcss.config.js`

- [ ] **Step 4: Replace the default entrypoint with the project root**

```tsx
// front/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
```

- [ ] **Step 5: Add the router shell**

```tsx
// front/src/app/router/index.tsx
import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "../../pages/home/HomePage";
import { AppointmentPage } from "../../pages/appointment/AppointmentPage";
import { NotFoundPage } from "../../pages/not-found/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/appointment", element: <AppointmentPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
```

- [ ] **Step 6: Add the base stylesheet**

```css
/* front/src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  background: #fffaf9;
  color: #101828;
  font-family: Inter, system-ui, sans-serif;
}
```

- [ ] **Step 7: Run the app and verify the scaffold works**

Run:

```bash
cd front
npm run dev
```

Expected:

- Vite starts
- the app opens without build errors

- [ ] **Step 8: Commit the repository bootstrap**

```bash
git add front
git commit -m "feat: initialize front repository"
```

### Task 2: Set Up Tailwind, Design Tokens, and shadcn/ui

**Files:**
- Modify: `front/tailwind.config.js`
- Create: `front/components.json`
- Create: `front/src/lib/utils.ts`
- Modify: `front/src/styles/globals.css`

- [ ] **Step 1: Configure Tailwind content paths**

```js
// front/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#DE2C2C",
          dark: "#B91C1C",
          blush: "#FFF4F3",
          soft: "#FDEDEC",
        },
        ink: "#111827",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(17, 24, 39, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Install and initialize shadcn/ui**

Run:

```bash
cd front
npx shadcn@latest init
```

Expected:

- `components.json` is created
- shadcn base config is added

- [ ] **Step 3: Add the shadcn utility helper**

```ts
// front/src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Install required utility packages**

Run:

```bash
cd front
npm install clsx tailwind-merge lucide-react
```

Expected:

- utility packages install cleanly

- [ ] **Step 5: Add global tokens and base styles**

```css
/* front/src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 12 100% 99%;
    --foreground: 224 32% 10%;
    --card: 0 0% 100%;
    --card-foreground: 224 32% 10%;
    --primary: 0 74% 53%;
    --primary-foreground: 0 0% 100%;
    --muted: 10 60% 97%;
    --muted-foreground: 220 9% 38%;
    --border: 8 30% 90%;
    --radius: 1rem;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-[hsl(var(--background))] text-[hsl(var(--foreground))] antialiased;
  }
}
```

- [ ] **Step 6: Commit design-system setup**

```bash
git add front
git commit -m "feat: configure frontend design system"
```

### Task 3: Build The Shared Public Layout

**Files:**
- Create: `front/src/components/layout/AppHeader.tsx`
- Create: `front/src/components/layout/AppFooter.tsx`
- Create: `front/src/components/layout/LanguageSwitcher.tsx`
- Create: `front/src/components/layout/PageContainer.tsx`
- Create: `front/src/components/layout/SectionShell.tsx`
- Create: `front/src/app/layouts/PublicLayout.tsx`

- [ ] **Step 1: Create the page container**

```tsx
// front/src/components/layout/PageContainer.tsx
import { ReactNode } from "react";
import { cn } from "../../lib/utils";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create the section shell**

```tsx
// front/src/components/layout/SectionShell.tsx
import { ReactNode } from "react";
import { cn } from "../../lib/utils";

type SectionShellProps = {
  children: ReactNode;
  className?: string;
};

export function SectionShell({ children, className }: SectionShellProps) {
  return <section className={cn("py-16 sm:py-20", className)}>{children}</section>;
}
```

- [ ] **Step 3: Create the language switcher**

```tsx
// front/src/components/layout/LanguageSwitcher.tsx
type LanguageSwitcherProps = {
  locale: "fr" | "ar";
  onChange: (locale: "fr" | "ar") => void;
};

export function LanguageSwitcher({ locale, onChange }: LanguageSwitcherProps) {
  return (
    <div className="inline-flex rounded-full border border-red-200 bg-white p-1 shadow-sm">
      {(["fr", "ar"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={
            locale === value
              ? "rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
              : "rounded-full px-4 py-2 text-sm font-semibold text-slate-600"
          }
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create the header**

```tsx
// front/src/components/layout/AppHeader.tsx
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "./PageContainer";
import { LanguageSwitcher } from "./LanguageSwitcher";

type AppHeaderProps = {
  locale: "fr" | "ar";
  onLocaleChange: (locale: "fr" | "ar") => void;
};

export function AppHeader({ locale, onLocaleChange }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-red-100 bg-white/95 backdrop-blur">
      <PageContainer className="flex min-h-[88px] items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-24 rounded-md bg-[url('/images/logo-placeholder.png')] bg-contain bg-center bg-no-repeat" />
          <LanguageSwitcher locale={locale} onChange={onLocaleChange} />
        </div>
        <p className="hidden flex-1 text-center text-xl font-bold text-slate-900 lg:block">
          مركز تحاقن و تحاليل الدم م إ ج مصطفى
        </p>
        <Link
          to="/appointment"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-dark"
        >
          <Heart className="h-4 w-4 fill-current" />
          Donner son sang
        </Link>
      </PageContainer>
    </header>
  );
}
```

- [ ] **Step 5: Create the footer**

```tsx
// front/src/components/layout/AppFooter.tsx
import { PageContainer } from "./PageContainer";

export function AppFooter() {
  return (
    <footer className="bg-slate-950 py-16 text-white">
      <PageContainer className="grid gap-10 md:grid-cols-2">
        <div>
          <h3 className="text-2xl font-bold">Centre de Transfusion Sanguine</h3>
          <p className="mt-4 text-base text-slate-300">CHU Mustapha Pacha</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
            Un acteur clé dans l'approvisionnement en sang pour les hôpitaux d'Alger.
          </p>
        </div>
        <div>
          <h3 className="text-2xl font-bold">Contact</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>Place du 1er Mai 1945, Sidi M'Hamed, Alger</p>
            <p>+213 560 038 317</p>
            <p>cts.chu.mustapha@gmail.com</p>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
```

- [ ] **Step 6: Assemble the public layout**

```tsx
// front/src/app/layouts/PublicLayout.tsx
import { ReactNode, useState } from "react";
import { AppFooter } from "../../components/layout/AppFooter";
import { AppHeader } from "../../components/layout/AppHeader";

type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  const [locale, setLocale] = useState<"fr" | "ar">("fr");

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-[radial-gradient(circle_at_top,#fff1ef,transparent_40%)]">
      <AppHeader locale={locale} onLocaleChange={setLocale} />
      <main>{children}</main>
      <AppFooter />
    </div>
  );
}
```

- [ ] **Step 7: Commit the shared layout**

```bash
git add front
git commit -m "feat: add public layout foundation"
```

### Task 4: Build The Homepage Sections

**Files:**
- Create: `front/src/components/marketing/HeroSection.tsx`
- Create: `front/src/components/marketing/ImpactSection.tsx`
- Create: `front/src/components/marketing/EligibilityPreviewSection.tsx`
- Create: `front/src/components/marketing/CtaBannerSection.tsx`
- Create: `front/src/components/marketing/ProcessSection.tsx`
- Create: `front/src/components/marketing/FaqSection.tsx`
- Modify: `front/src/pages/home/HomePage.tsx`

- [ ] **Step 1: Create the homepage page shell**

```tsx
// front/src/pages/home/HomePage.tsx
import { PublicLayout } from "../../app/layouts/PublicLayout";
import { CtaBannerSection } from "../../components/marketing/CtaBannerSection";
import { EligibilityPreviewSection } from "../../components/marketing/EligibilityPreviewSection";
import { FaqSection } from "../../components/marketing/FaqSection";
import { HeroSection } from "../../components/marketing/HeroSection";
import { ImpactSection } from "../../components/marketing/ImpactSection";
import { ProcessSection } from "../../components/marketing/ProcessSection";

export function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <ImpactSection />
      <EligibilityPreviewSection />
      <CtaBannerSection />
      <ProcessSection />
      <FaqSection />
    </PublicLayout>
  );
}
```

- [ ] **Step 2: Create the hero section**

```tsx
// front/src/components/marketing/HeroSection.tsx
import { HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "../layout/PageContainer";
import { SectionShell } from "../layout/SectionShell";

export function HeroSection() {
  return (
    <SectionShell className="overflow-hidden pt-12 sm:pt-16">
      <PageContainer className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Donner son <span className="text-brand-red">sang, c'est</span>{" "}
            <span className="text-brand-red">sauver des vies</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-9 text-slate-600">
            Chaque don peut sauver jusqu'à 3 vies. Rejoignez notre mission de solidarité
            au Centre de Transfusion Sanguine du CHU Mustapha Pacha.
          </p>
          <Link
            to="/appointment"
            className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-brand-red px-7 py-4 text-base font-semibold text-white shadow-soft transition hover:bg-brand-dark"
          >
            <HeartHandshake className="h-5 w-5" />
            Je donne maintenant
          </Link>
        </div>
        <div className="rounded-[2rem] border border-red-100 bg-[#FDE9E8] p-10 shadow-soft">
          <div className="flex min-h-[420px] items-center justify-center rounded-[1.5rem] bg-[#FAD9D7]">
            <HeartHandshake className="h-24 w-24 text-brand-red" />
          </div>
        </div>
      </PageContainer>
    </SectionShell>
  );
}
```

- [ ] **Step 3: Create the impact section**

```tsx
// front/src/components/marketing/ImpactSection.tsx
import { Clock3, Heart, Users } from "lucide-react";
import { PageContainer } from "../layout/PageContainer";
import { SectionShell } from "../layout/SectionShell";

const stats = [
  { value: "135+", label: "Donneurs par jour", icon: Users },
  { value: "24h", label: "Résultats médicaux", icon: Clock3 },
  { value: "100%", label: "Sécurisé", icon: Heart },
];

export function ImpactSection() {
  return (
    <SectionShell>
      <PageContainer>
        <p className="mx-auto mb-8 w-fit rounded-full border border-red-100 bg-white px-6 py-2 text-sm font-semibold text-brand-red shadow-sm">
          #SolidaritéAlgérienneParLeSang
        </p>
        <h2 className="text-center text-4xl font-black text-slate-950">Notre Impact</h2>
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {stats.map(({ value, label, icon: Icon }) => (
            <article key={label} className="rounded-[1.75rem] bg-white px-8 pb-10 pt-14 text-center shadow-soft">
              <div className="mx-auto -mt-20 flex h-16 w-16 items-center justify-center rounded-full bg-brand-red text-white shadow-soft">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-8 text-5xl font-black text-slate-950">{value}</p>
              <p className="mt-3 text-lg text-slate-600">{label}</p>
            </article>
          ))}
        </div>
      </PageContainer>
    </SectionShell>
  );
}
```

- [ ] **Step 4: Create the eligibility preview section**

```tsx
// front/src/components/marketing/EligibilityPreviewSection.tsx
import { CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "../layout/PageContainer";
import { SectionShell } from "../layout/SectionShell";

const requirements = ["Âge entre 18 et 65 ans", "Poids minimum 50 kg", "Ne pas être à jeun", "Être en bonne santé"];
const blocks = ["Infection récente", "Anémie", "Grossesse ou allaitement", "Tatouage/piercing récent"];

export function EligibilityPreviewSection() {
  return (
    <SectionShell>
      <PageContainer>
        <h2 className="text-center text-4xl font-black text-slate-950">Suis-je éligible au don ?</h2>
        <p className="mx-auto mt-5 max-w-3xl text-center text-lg text-slate-600">
          Vérifiez votre éligibilité avant de prendre rendez-vous. En cas de doute, nos professionnels de santé sont là pour vous conseiller.
        </p>
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <article className="rounded-[1.75rem] border border-green-100 bg-green-50/60 p-10 shadow-soft">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-black text-green-800">Conditions requises</h3>
            </div>
            <ul className="space-y-5 text-lg text-slate-700">
              {requirements.map((item) => (
                <li key={item} className="flex items-center gap-3">{item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-[1.75rem] border border-red-100 bg-red-50/70 p-10 shadow-soft">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-red text-white">
                <XCircle className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-black text-red-800">Contre-indications</h3>
            </div>
            <ul className="space-y-5 text-lg text-slate-700">
              {blocks.map((item) => (
                <li key={item} className="flex items-center gap-3">{item}</li>
              ))}
            </ul>
          </article>
        </div>
        <div className="mt-10 rounded-[1.75rem] bg-brand-red px-8 py-8 text-white shadow-soft lg:flex lg:items-center lg:justify-between">
          <div>
            <h3 className="text-3xl font-black">Prêt(e) à sauver des vies ?</h3>
            <p className="mt-3 text-base text-red-50">Réservez votre rendez-vous en quelques clics et rejoignez notre communauté de donneurs.</p>
          </div>
          <Link
            to="/appointment"
            className="mt-6 inline-flex rounded-2xl bg-white px-6 py-4 text-base font-semibold text-brand-red shadow-soft lg:mt-0"
          >
            Prendre rendez-vous
          </Link>
        </div>
      </PageContainer>
    </SectionShell>
  );
}
```

- [ ] **Step 5: Create the CTA banner, process, and FAQ sections**

Implement these files following the established pattern:

```tsx
// front/src/components/marketing/CtaBannerSection.tsx
export function CtaBannerSection() { return null; }

// front/src/components/marketing/ProcessSection.tsx
export function ProcessSection() { return null; }

// front/src/components/marketing/FaqSection.tsx
export function FaqSection() { return null; }
```

Replace the placeholders with:

- a 3-card process timeline matching the visual audit
- a FAQ accordion using shadcn `Accordion`
- a support area with the phone number shown in the reference

- [ ] **Step 6: Run the frontend and verify homepage composition**

Run:

```bash
cd front
npm run dev
```

Expected:

- homepage renders
- no missing imports
- sections stack in the correct order

- [ ] **Step 7: Commit the homepage implementation**

```bash
git add front
git commit -m "feat: implement public homepage"
```

### Task 5: Build The Appointment Page and Eligibility Gate

**Files:**
- Create: `front/src/pages/appointment/AppointmentPage.tsx`
- Create: `front/src/components/appointment/EligibilityGate.tsx`
- Create: `front/src/components/appointment/AppointmentForm.tsx`
- Create: `front/src/components/appointment/AppointmentFormSection.tsx`

- [ ] **Step 1: Create the appointment page shell**

```tsx
// front/src/pages/appointment/AppointmentPage.tsx
import { PublicLayout } from "../../app/layouts/PublicLayout";
import { AppointmentForm } from "../../components/appointment/AppointmentForm";

export function AppointmentPage() {
  return (
    <PublicLayout>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-black text-brand-red">Formulaire de prise de rendez-vous</h1>
            <p className="mt-4 text-3xl font-bold text-slate-700">Don de sang 🩸</p>
            <p className="mt-4 text-xl text-slate-500">#SolidaritéAlgérienneParLeSang</p>
          </div>
          <AppointmentForm />
        </div>
      </section>
    </PublicLayout>
  );
}
```

- [ ] **Step 2: Create the eligibility gate**

```tsx
// front/src/components/appointment/EligibilityGate.tsx
type EligibilityGateProps = {
  value: {
    ageConfirmed: boolean;
    weightConfirmed: boolean;
    healthyConfirmed: boolean;
    noContraIndicationConfirmed: boolean;
  };
  onChange: (next: EligibilityGateProps["value"]) => void;
  onContinue: () => void;
};

export function EligibilityGate({ value, onChange, onContinue }: EligibilityGateProps) {
  const canContinue =
    value.ageConfirmed &&
    value.weightConfirmed &&
    value.healthyConfirmed &&
    value.noContraIndicationConfirmed;

  return (
    <div className="rounded-[1.75rem] bg-white p-10 shadow-soft">
      <h2 className="text-3xl font-black text-slate-900">Suis-je éligible au don ?</h2>
      <p className="mt-5 text-lg text-slate-600">
        Vérifiez votre éligibilité avant de prendre rendez-vous. En cas de doute, nos professionnels de santé sont là pour vous conseiller.
      </p>
      <div className="mt-8 space-y-5 text-lg">
        {([
          ["ageConfirmed", "Âge entre 18 et 65 ans"],
          ["weightConfirmed", "Poids minimum 50 kg"],
          ["healthyConfirmed", "Être en bonne santé"],
          ["noContraIndicationConfirmed", "Aucune contre-indication au don"],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={value[key]}
              onChange={(event) => onChange({ ...value, [key]: event.target.checked })}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
      <button
        type="button"
        disabled={!canContinue}
        onClick={onContinue}
        className="mt-10 rounded-2xl bg-brand-red px-6 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:bg-red-200"
      >
        Prendre rendez-vous
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Create the section wrapper for the form**

```tsx
// front/src/components/appointment/AppointmentFormSection.tsx
import { ReactNode } from "react";

type AppointmentFormSectionProps = {
  step: number;
  title: string;
  children: ReactNode;
};

export function AppointmentFormSection({ step, title, children }: AppointmentFormSectionProps) {
  return (
    <section className="rounded-[1.75rem] bg-white p-8 shadow-soft sm:p-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-lg font-bold text-brand-red">
          {step}
        </div>
        <h2 className="text-3xl font-black text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}
```

- [ ] **Step 4: Create a temporary form shell with gate-controlled visibility**

```tsx
// front/src/components/appointment/AppointmentForm.tsx
import { useState } from "react";
import { EligibilityGate } from "./EligibilityGate";

export function AppointmentForm() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [gate, setGate] = useState({
    ageConfirmed: true,
    weightConfirmed: true,
    healthyConfirmed: true,
    noContraIndicationConfirmed: true,
  });

  if (!isUnlocked) {
    return <EligibilityGate value={gate} onChange={setGate} onContinue={() => setIsUnlocked(true)} />;
  }

  return <div className="rounded-[1.75rem] bg-white p-10 shadow-soft">Form to be implemented in the next task.</div>;
}
```

- [ ] **Step 5: Run the flow and verify the gate works**

Run:

```bash
cd front
npm run dev
```

Expected:

- appointment page renders
- the gate is shown first
- clicking continue reveals the placeholder form

- [ ] **Step 6: Commit the appointment page shell**

```bash
git add front
git commit -m "feat: scaffold appointment page and gate"
```

### Task 6: Implement The Appointment Form With Validation

**Files:**
- Create: `front/src/features/appointment/schema/appointmentFormSchema.ts`
- Create: `front/src/features/appointment/constants/formOptions.ts`
- Modify: `front/src/components/appointment/AppointmentForm.tsx`

- [ ] **Step 1: Add the schema**

```ts
// front/src/features/appointment/schema/appointmentFormSchema.ts
import { z } from "zod";

export const appointmentFormSchema = z
  .object({
    firstName: z.string().min(1, "Le prénom est requis."),
    lastName: z.string().min(1, "Le nom est requis."),
    birthDate: z.string().min(1, "La date de naissance est requise."),
    gender: z.enum(["male", "female"], { message: "Le sexe est requis." }),
    phone: z.string().min(1, "Le numéro de téléphone est requis."),
    email: z.string().email("Adresse e-mail invalide.").or(z.literal("")),
    wilayaCode: z.string().min(1, "La wilaya est requise."),
    commune: z.string().min(1, "La commune est requise."),
    campaignCode: z.string().optional(),
    appointmentDate: z.string().min(1, "La date du rendez-vous est requise."),
    appointmentTime: z.string().min(1, "L'heure du rendez-vous est requise."),
    bloodGroup: z.string().min(1, "Le groupe sanguin est requis."),
    donationType: z.string().min(1, "Le type de don est requis."),
    isExistingDonor: z.boolean(),
    lastDonationDate: z.string().optional(),
    remarks: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isExistingDonor && !data.lastDonationDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lastDonationDate"],
        message: "La date du dernier don est requise pour un donneur existant.",
      });
    }
  });

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
```

- [ ] **Step 2: Add initial options**

```ts
// front/src/features/appointment/constants/formOptions.ts
export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const donationTypes = [
  { value: "whole_blood", label: "Don de sang total" },
  { value: "plasma", label: "Don de plasma" },
  { value: "platelets", label: "Don de plaquettes" },
] as const;
```

- [ ] **Step 3: Replace the placeholder form with react-hook-form**

Implement `AppointmentForm.tsx` with:

- `useForm`
- `zodResolver`
- 5 sections matching the visual audit
- controlled rendering of `lastDonationDate`
- a centered submit button

Use this implementation shape:

```tsx
const form = useForm<AppointmentFormValues>({
  resolver: zodResolver(appointmentFormSchema),
  defaultValues: {
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "male",
    phone: "",
    email: "",
    wilayaCode: "",
    commune: "",
    campaignCode: "",
    appointmentDate: "",
    appointmentTime: "",
    bloodGroup: "",
    donationType: "",
    isExistingDonor: false,
    lastDonationDate: "",
    remarks: "",
  },
});
```

- [ ] **Step 4: Add the form sections**

The sections must match:

1. `Informations personnelles`
2. `Rendez-vous`
3. `Type de don`
4. `Déjà donneur`
5. `Remarques ou besoins particuliers`

Each section should use `AppointmentFormSection`.

- [ ] **Step 5: Submit to a local stub first**

Temporarily wire submit to:

```tsx
const onSubmit = form.handleSubmit(async (values) => {
  console.log(values);
});
```

Expected:

- submit only succeeds with valid values
- invalid values show errors inline

- [ ] **Step 6: Commit the validated form**

```bash
git add front
git commit -m "feat: implement validated appointment form"
```

### Task 7: Add The API Client And Backend Integration

**Files:**
- Create: `front/src/lib/api/client.ts`
- Create: `front/src/lib/api/appointmentApi.ts`
- Create: `front/src/lib/api/homeApi.ts`
- Modify: `front/src/components/appointment/AppointmentForm.tsx`
- Modify: `front/src/pages/home/HomePage.tsx`

- [ ] **Step 1: Add the API client**

```ts
// front/src/lib/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    throw payload;
  }

  return payload as T;
}
```

- [ ] **Step 2: Add the appointment API layer**

```ts
// front/src/lib/api/appointmentApi.ts
import { apiRequest } from "./client";

export async function getAppointmentFormMeta(locale: "fr" | "ar" = "fr") {
  return apiRequest(`/api/public/appointment-form-meta?locale=${locale}`);
}

export async function getAppointmentSlots(date: string, campaignCode?: string) {
  const query = new URLSearchParams({ date });
  if (campaignCode) query.set("campaignCode", campaignCode);
  return apiRequest(`/api/public/appointment-slots?${query.toString()}`);
}

export async function createAppointmentRequest(payload: unknown) {
  return apiRequest("/api/public/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
```

- [ ] **Step 3: Wire form submit to the real API**

Replace the temporary submit in `AppointmentForm.tsx` with:

```tsx
const onSubmit = form.handleSubmit(async (values) => {
  await createAppointmentRequest({
    ...values,
    locale: "fr",
    eligibilityChecklist: gate,
    wilayaLabel: "Alger",
  });
});
```

Then add:

- pending submit state
- success state
- field error mapping for `422`
- generic message for `409` and `500`

- [ ] **Step 4: Add a temporary home content integration stub**

Use `homeApi` to prepare the homepage for backend-fed content, even if the first version still renders local fallback content.

- [ ] **Step 5: Verify integration path**

Run:

```bash
cd front
npm run dev
```

Expected:

- app still renders
- form calls the API when submitted
- failures are handled without breaking the page

- [ ] **Step 6: Commit API integration**

```bash
git add front
git commit -m "feat: connect appointment flow to backend api"
```

### Task 8: Add Frontend Test Coverage For Critical Paths

**Files:**
- Create: `front/src/components/appointment/EligibilityGate.test.tsx`
- Create: `front/src/components/appointment/AppointmentForm.test.tsx`
- Create: `front/src/pages/home/HomePage.test.tsx`
- Modify: `front/package.json`

- [ ] **Step 1: Install testing dependencies**

Run:

```bash
cd front
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Expected:

- test packages install successfully

- [ ] **Step 2: Add the test scripts**

```json
// front/package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 3: Add an eligibility gate test**

```tsx
// front/src/components/appointment/EligibilityGate.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EligibilityGate } from "./EligibilityGate";

test("disables continuation when a required checkbox is unchecked", async () => {
  const user = userEvent.setup();
  const state = {
    ageConfirmed: true,
    weightConfirmed: true,
    healthyConfirmed: true,
    noContraIndicationConfirmed: true,
  };

  render(<EligibilityGate value={state} onChange={() => {}} onContinue={() => {}} />);

  const ageCheckbox = screen.getByLabelText("Âge entre 18 et 65 ans");
  await user.click(ageCheckbox);

  expect(screen.getByRole("button", { name: "Prendre rendez-vous" })).toBeDisabled();
});
```

- [ ] **Step 4: Add a form validation test**

```tsx
// front/src/components/appointment/AppointmentForm.test.tsx
test("shows validation errors when required fields are missing", async () => {
  // render AppointmentForm in unlocked mode or extract the form internals into a testable component
  // submit an empty form
  // assert at least one required field message is shown
});
```

- [ ] **Step 5: Run the tests**

Run:

```bash
cd front
npm run test
```

Expected:

- tests pass

- [ ] **Step 6: Commit the test baseline**

```bash
git add front
git commit -m "test: add frontend critical path coverage"
```

### Task 9: Final Validation And Documentation

**Files:**
- Create: `front/README.md`
- Modify: `front/src/pages/not-found/NotFoundPage.tsx`

- [ ] **Step 1: Add a real not-found page**

```tsx
// front/src/pages/not-found/NotFoundPage.tsx
import { Link } from "react-router-dom";
import { PublicLayout } from "../../app/layouts/PublicLayout";

export function NotFoundPage() {
  return (
    <PublicLayout>
      <section className="px-4 py-24 text-center">
        <h1 className="text-5xl font-black text-slate-950">Page introuvable</h1>
        <p className="mt-6 text-lg text-slate-600">La page demandée n'existe pas ou n'est plus disponible.</p>
        <Link to="/" className="mt-8 inline-flex rounded-2xl bg-brand-red px-6 py-4 font-semibold text-white">
          Retour à l'accueil
        </Link>
      </section>
    </PublicLayout>
  );
}
```

- [ ] **Step 2: Add the frontend README**

```md
# front

## Run locally

```bash
npm install
npm run dev
```

## Required environment

Create `.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_DEFAULT_LOCALE=fr
```

## Main routes

- `/`
- `/appointment`

## Notes

- UI is designed to stay close to `https://cts-chu-mustapha.com/fr`
- backend integration follows the documented public API contract
```

- [ ] **Step 3: Run the production build**

Run:

```bash
cd front
npm run build
```

Expected:

- TypeScript passes
- Vite build succeeds

- [ ] **Step 4: Final commit for phase 2 implementation**

```bash
git add front
git commit -m "docs: finalize front execution baseline"
```
