import { PublicLayout } from "@/app/layouts/PublicLayout";
import { AppointmentForm } from "@/components/appointment/AppointmentForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { useLocale } from "@/i18n/locale";

export function AppointmentPage() {
  const { locale } = useLocale();

  const copy =
    locale === "ar"
      ? {
          title: "استمارة طلب موعد",
          subtitle: "التبرع بالدم",
          campaignLabel: "#التضامن_بالدم",
        }
      : {
          title: "Formulaire de prise de rendez-vous",
          subtitle: "Don de sang",
          campaignLabel: "#SolidaritéAlgérienneParLeSang",
        };

  return (
    <PublicLayout>
      <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <PageContainer className="max-w-5xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-black text-brand-red sm:text-5xl lg:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-4 text-2xl font-bold text-slate-700 sm:text-3xl">
              {copy.subtitle}
            </p>
            <p className="mt-4 text-base font-semibold text-slate-500 sm:text-lg">
              {copy.campaignLabel}
            </p>
          </div>

          <AppointmentForm />
        </PageContainer>
      </section>
    </PublicLayout>
  );
}
