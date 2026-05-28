import { isRtlLocale } from "@/i18n/direction";
import { useLocale } from "@/i18n/locale";

import { PageContainer } from "./PageContainer";

export function AppFooter() {
  const { locale } = useLocale();
  const isRtl = isRtlLocale(locale);

  const copy =
    locale === "ar"
      ? {
          title: "مركز نقل الدم",
          institution: "المستشفى الجامعي مصطفى باشا",
          description: "فاعل أساسي في توفير الدم للمؤسسات الاستشفائية في الجزائر.",
          contact: "اتصل بنا",
          address: "ساحة أول ماي 1945، سيدي امحمد، الجزائر",
        }
      : {
          title: "Centre de Transfusion Sanguine",
          institution: "CHU Mustapha Pacha",
          description:
            "Un acteur clé dans l'approvisionnement en sang pour les hôpitaux d'Alger.",
          contact: "Contact",
          address: "Place du 1er Mai 1945, Sidi M'Hamed, Alger",
        };

  return (
    <footer className="bg-slate-950 py-16 text-white">
      <PageContainer className={isRtl ? "grid gap-10 text-right md:grid-cols-2" : "grid gap-10 md:grid-cols-2"}>
        <div>
          <h3 className="text-2xl font-bold">{copy.title}</h3>
          <p className="mt-4 text-base text-slate-300">{copy.institution}</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
            {copy.description}
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-bold">{copy.contact}</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>{copy.address}</p>
            <p>+213 560 038 317</p>
            <p>cts.chu.mustapha@gmail.com</p>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
