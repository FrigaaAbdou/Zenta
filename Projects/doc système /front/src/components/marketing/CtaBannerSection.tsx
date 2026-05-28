import { ArrowRight, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";

import { PageContainer } from "@/components/layout/PageContainer";
import { SectionShell } from "@/components/layout/SectionShell";
import { useLocale } from "@/i18n/locale";

type CtaBannerSectionProps = {
  title?: string;
  description?: string;
  ctaLabel?: string;
};

export function CtaBannerSection({
  title = "Réservez votre rendez-vous en quelques clics",
  description = "Lancez votre demande de rendez-vous et rejoignez une communauté de donneurs mobilisée pour les patients qui ont besoin d'une transfusion.",
  ctaLabel = "Prendre rendez-vous",
}: CtaBannerSectionProps) {
  const { locale } = useLocale();
  const chipLabel =
    locale === "ar" ? "هل أنت مستعد لإنقاذ الأرواح؟" : "Prêt(e) à sauver des vies ?";

  return (
    <SectionShell className="pt-0">
      <PageContainer>
        <div className="rounded-[1.75rem] bg-brand-red px-8 py-8 text-white shadow-soft lg:flex lg:items-center lg:justify-between lg:px-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
              <HeartHandshake className="h-4 w-4" />
              {chipLabel}
            </div>

            <h2 className="mt-5 text-3xl font-black sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 text-base leading-8 text-red-50">
              {description}
            </p>
          </div>

          <Link
            to="/appointment"
            className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-base font-semibold text-brand-red shadow-soft transition hover:bg-red-50 lg:mt-0"
          >
            {ctaLabel}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </PageContainer>
    </SectionShell>
  );
}
