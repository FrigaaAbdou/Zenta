import { Clock3, HeartPulse, ShieldCheck, Users } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { SectionShell } from "@/components/layout/SectionShell";

const fallbackStats = [
  {
    value: "135+",
    label: "Donneurs mobilisés par jour",
    icon: Users,
  },
  {
    value: "24h",
    label: "Prise en charge et suivi coordonnés",
    icon: Clock3,
  },
  {
    value: "100%",
    label: "Procédure encadrée et sécurisée",
    icon: ShieldCheck,
  },
];

type ImpactSectionProps = {
  sectionLabel?: string;
  title?: string;
  description?: string;
  stats?: Array<{
    label: string;
    value: string;
  }>;
};

export function ImpactSection({
  sectionLabel = "Campagne permanente de sensibilisation",
  title = "Notre Impact",
  description = "Un don régulier soutient directement les besoins transfusionnels des établissements hospitaliers et des urgences vitales.",
  stats = fallbackStats,
}: ImpactSectionProps) {
  const iconMap = [Users, Clock3, ShieldCheck];

  return (
    <SectionShell className="pt-6">
      <PageContainer>
        <p className="mx-auto w-fit rounded-full border border-red-100 bg-white px-5 py-2 text-sm font-semibold text-brand-red shadow-sm">
          {sectionLabel}
        </p>

        <h2 className="mt-6 text-center text-4xl font-black text-slate-950 sm:text-5xl">
          {title}
        </h2>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {stats.map(({ value, label }, index) => {
            const Icon = iconMap[index] ?? HeartPulse;

            return (
            <article
              key={label}
              className="rounded-[1.75rem] bg-white px-8 pb-10 pt-14 text-center shadow-soft"
            >
              <div className="mx-auto -mt-20 flex h-16 w-16 items-center justify-center rounded-full bg-brand-red text-white shadow-soft">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-8 text-5xl font-black text-slate-950">{value}</p>
              <p className="mt-3 text-lg leading-8 text-slate-600">{label}</p>
            </article>
            );
          })}
        </div>

        <p className="mx-auto mt-10 flex max-w-3xl items-center justify-center gap-3 text-center text-base leading-8 text-slate-600">
          <HeartPulse className="h-5 w-5 shrink-0 text-brand-red" />
          {description}
        </p>
      </PageContainer>
    </SectionShell>
  );
}
