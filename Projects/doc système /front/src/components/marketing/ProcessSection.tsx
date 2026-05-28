import {
  BadgeCheck,
  ClipboardCheck,
  Coffee,
  Droplets,
  HeartPulse,
  SearchCheck,
  ShieldPlus,
  Stethoscope,
} from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { SectionShell } from "@/components/layout/SectionShell";
import { useLocale } from "@/i18n/locale";

const processSteps = [
  {
    number: "01",
    title: "Avant le don",
    items: [
      {
        label: "Vérification de l’éligibilité et du dossier",
        icon: SearchCheck,
      },
      {
        label: "Accueil et orientation par l’équipe médicale",
        icon: Stethoscope,
      },
    ],
    icon: ClipboardCheck,
  },
  {
    number: "02",
    title: "Pendant le don",
    items: [
      {
        label: "Prélèvement dans un environnement strictement sécurisé",
        icon: Droplets,
      },
      {
        label: "Surveillance et accompagnement durant tout le geste",
        icon: ShieldPlus,
      },
    ],
    icon: Droplets,
  },
  {
    number: "03",
    title: "Après le don",
    items: [
      {
        label: "Temps de repos et collation conseillée",
        icon: Coffee,
      },
      {
        label: "Recommandations simples pour bien récupérer",
        icon: HeartPulse,
      },
    ],
    icon: HeartPulse,
  },
];

type ProcessSectionProps = {
  sectionLabel?: string;
  title?: string;
  description?: string;
  items?: Array<{
    title: string;
    description: string;
  }>;
};

export function ProcessSection({
  sectionLabel = "Parcours de don",
  title = "Comment ça se passe ?",
  description = "Le parcours de don reste simple, encadré et rassurant à chaque étape.",
  items,
}: ProcessSectionProps) {
  const { locale } = useLocale();
  const summary =
    locale === "ar"
      ? "التبرع لا يستغرق وقتا طويلا، لكن أثره قد يكون فوريا لعدة مرضى. يرافقك الفريق الطبي قبل وأثناء وبعد سحب الدم."
      : "Le don dure peu de temps, mais son impact peut être immédiat pour plusieurs patients. L'équipe médicale vous accompagne avant, pendant et après le prélèvement.";
  const dynamicSteps =
    items?.length
      ? items.map((item, index) => ({
          number: String(index + 1).padStart(2, "0"),
          title: item.title,
          items: [{ label: item.description, icon: processSteps[index]?.items[0]?.icon ?? BadgeCheck }],
          icon: processSteps[index]?.icon ?? ClipboardCheck,
        }))
      : processSteps;

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

        <div className="mt-12 grid gap-8 xl:grid-cols-3">
          {dynamicSteps.map(({ number, title: stepTitle, items: stepItems, icon: Icon }) => (
            <article
              key={stepTitle}
              className="rounded-[1.9rem] bg-white px-8 pb-8 pt-10 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-red text-lg font-black text-white">
                  {number}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-brand-red">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <h3 className="mt-8 text-3xl font-black text-slate-950">{stepTitle}</h3>

              <div className="mt-6 space-y-4">
                {stepItems.map(({ label, icon: ItemIcon }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 rounded-2xl bg-[#fff4f3] px-5 py-4 text-base leading-7 text-slate-700"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-brand-red shadow-sm">
                      <ItemIcon className="h-5 w-5" />
                    </div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[1.6rem] border border-red-100 bg-white px-6 py-5 text-sm leading-7 text-slate-600 shadow-sm sm:px-8 sm:text-base">
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-brand-red" />
            <p>{summary}</p>
          </div>
        </div>
      </PageContainer>
    </SectionShell>
  );
}
