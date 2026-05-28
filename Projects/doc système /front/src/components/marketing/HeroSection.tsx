import {
  Activity,
  BadgeCheck,
  Building2,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { PageContainer } from "@/components/layout/PageContainer";
import { SectionShell } from "@/components/layout/SectionShell";
import { useLocale } from "@/i18n/locale";

type HeroSectionProps = {
  campaignLabel?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
};

export function HeroSection({
  campaignLabel = "#SolidaritéAlgérienneParLeSang",
  title = "Donner son sang, c'est sauver des vies",
  description = "Chaque don peut contribuer à sauver jusqu'à trois vies. Rejoignez le Centre de Transfusion Sanguine du CHU Mustapha Pacha et prenez rendez-vous en quelques clics.",
  ctaLabel = "Je donne maintenant",
}: HeroSectionProps) {
  const { locale } = useLocale();
  const copy =
    locale === "ar"
      ? {
          reassurance: "تبرع تطوعي ومجاني وتحت إشراف طبي كامل.",
          proofPoints: [
            { label: "مسار آمن ومؤطر", icon: ShieldCheck },
            { label: "مركز استشفائي مرجعي", icon: Building2 },
            { label: "طلب موعد سريع", icon: Activity },
          ],
          todayDonors: "المتبرعون اليوم",
          secureTitle: "مسار آمن",
          secureText: "إشراف طبي كامل",
          fastTitle: "استجابة سريعة",
          fastText: "طلب موعد مبسط",
        }
      : {
          reassurance: "Don volontaire, gratuit et strictement médicalisé.",
          proofPoints: [
            { label: "Parcours sécurisé et encadré", icon: ShieldCheck },
            { label: "Centre hospitalier de référence", icon: Building2 },
            { label: "Prise de rendez-vous rapide", icon: Activity },
          ],
          todayDonors: "Donneurs aujourd'hui",
          secureTitle: "Parcours sécurisé",
          secureText: "Encadrement médical complet",
          fastTitle: "Réponse rapide",
          fastText: "Demande de rendez-vous simplifiée",
        };

  return (
    <SectionShell className="overflow-hidden bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,1)_0%,rgba(255,255,255,0.96)_30%,rgba(255,226,230,0.72)_58%,rgba(255,242,244,0.92)_100%),radial-gradient(circle_at_76%_30%,rgba(255,10,31,0.18)_0%,rgba(255,10,31,0.08)_18%,rgba(255,10,31,0)_42%),radial-gradient(circle_at_52%_75%,rgba(255,10,31,0.08)_0%,rgba(255,10,31,0)_35%)] pt-10 sm:pt-14 lg:pt-16">
      <PageContainer className="px-4 py-6 sm:px-6 sm:py-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-8 lg:py-12">
        <div>
          <span className="inline-flex rounded-full border border-red-100 bg-white px-4 py-2 text-sm font-semibold text-brand-red shadow-sm">
            {campaignLabel}
          </span>

          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            {title}
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-9 text-slate-600">
            {description}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              to="/appointment"
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-brand-red px-7 py-4 text-base font-semibold text-white shadow-soft transition hover:bg-brand-dark"
            >
              <HeartHandshake className="h-5 w-5" />
              {ctaLabel}
            </Link>

            <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
              <BadgeCheck className="h-4 w-4 shrink-0 text-brand-red" />
              {copy.reassurance}
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {copy.proofPoints.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-red-100 bg-white px-4 py-4 text-sm font-semibold text-slate-700 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-brand-red">
                  <Icon className="h-4 w-4" />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="rounded-[2rem] border border-red-100 bg-[#fde9e8] p-6 shadow-soft sm:p-8">
            <div className="relative min-h-[420px] overflow-hidden rounded-[1.5rem] bg-[#f9d8d6] p-8">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/30 blur-2xl" />
              <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-red-200/40 blur-2xl" />

              <div className="relative flex h-full flex-col justify-between">
                <div className="w-fit rounded-2xl bg-white/85 px-5 py-4 shadow-sm backdrop-blur">
                  <p className="text-sm font-semibold text-slate-500">
                    {copy.todayDonors}
                  </p>
                  <p className="mt-1 text-4xl font-black text-slate-950">135+</p>
                </div>

                <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-brand-red text-white shadow-soft">
                  <HeartHandshake className="h-16 w-16" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-brand-red">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {copy.secureTitle}
                        </p>
                        <p className="text-xs text-slate-500">
                          {copy.secureText}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-brand-red">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {copy.fastTitle}
                        </p>
                        <p className="text-xs text-slate-500">
                          {copy.fastText}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </SectionShell>
  );
}
