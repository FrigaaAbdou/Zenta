import {
  CheckCircle2,
  HeartPulse,
  Scale,
  Thermometer,
  Utensils,
  UserRoundCheck,
  UserRoundX,
  Baby,
  Syringe,
  XCircle,
} from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { SectionShell } from "@/components/layout/SectionShell";
import { useLocale } from "@/i18n/locale";

const requirements = [
  {
    label: "Âge entre 18 et 65 ans",
    icon: UserRoundCheck,
  },
  {
    label: "Poids minimum 50 kg",
    icon: Scale,
  },
  {
    label: "Ne pas être à jeun",
    icon: Utensils,
  },
  {
    label: "Être en bonne santé générale",
    icon: HeartPulse,
  },
];

const contraindications = [
  {
    label: "Infection ou fièvre récente",
    icon: Thermometer,
  },
  {
    label: "Anémie connue ou fatigue importante",
    icon: UserRoundX,
  },
  {
    label: "Grossesse ou allaitement",
    icon: Baby,
  },
  {
    label: "Tatouage ou piercing récent",
    icon: Syringe,
  },
];

type EligibilityPreviewSectionProps = {
  sectionLabel?: string;
  title?: string;
  description?: string;
  items?: Array<{
    title: string;
    description: string;
  }>;
};

export function EligibilityPreviewSection({
  sectionLabel = "Éligibilité",
  title = "Suis-je éligible au don ?",
  description = "Vérifiez votre éligibilité avant de prendre rendez-vous. En cas de doute, nos professionnels de santé sont là pour vous conseiller.",
  items,
}: EligibilityPreviewSectionProps) {
  const { locale } = useLocale();
  const contraindicationItems =
    locale === "ar"
      ? [
          { label: "عدوى أو حمى حديثة", icon: Thermometer },
          { label: "فقر دم معروف أو إرهاق شديد", icon: UserRoundX },
          { label: "حمل أو رضاعة", icon: Baby },
          { label: "وشم أو ثقب حديث", icon: Syringe },
        ]
      : contraindications;
  const sectionTitles =
    locale === "ar"
      ? {
          requirements: "الشروط المطلوبة",
          contraindications: "موانع التبرع",
        }
      : {
          requirements: "Conditions requises",
          contraindications: "Contre-indications",
        };

  const dynamicRequirements =
    items?.length
      ? items.map((item, index) => ({
          label: item.title,
          description: item.description,
          icon: requirements[index]?.icon ?? CheckCircle2,
        }))
      : requirements.map((item) => ({
          label: item.label,
          description: undefined,
          icon: item.icon,
        }));

  return (
    <SectionShell>
      <PageContainer>
        <p className="mx-auto w-fit rounded-full border border-red-100 bg-white px-5 py-2 text-sm font-semibold text-brand-red shadow-sm">
          {sectionLabel}
        </p>
        <h2 className="text-center text-4xl font-black text-slate-950 sm:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-slate-600">
          {description}
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <article className="rounded-[1.75rem] border border-green-100 bg-green-50/70 p-10 shadow-soft">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-black text-green-900">
                {sectionTitles.requirements}
              </h3>
            </div>

            <ul className="space-y-4">
              {dynamicRequirements.map(({ label, description: itemDescription, icon: Icon }) => (
                <li
                  key={label}
                  className="flex items-start gap-3 text-lg text-slate-700"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-green-600 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="pt-1">
                    <p>{label}</p>
                    {itemDescription ? (
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {itemDescription}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[1.75rem] border border-red-100 bg-red-50/70 p-10 shadow-soft">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-red text-white">
                <XCircle className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-black text-red-900">
                {sectionTitles.contraindications}
              </h3>
            </div>

            <ul className="space-y-4">
              {contraindicationItems.map(({ label, icon: Icon }) => (
                <li
                  key={label}
                  className="flex items-start gap-3 text-lg text-slate-700"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-brand-red shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="pt-1">{label}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </PageContainer>
    </SectionShell>
  );
}
