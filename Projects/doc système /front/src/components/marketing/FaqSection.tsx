import { Mail, Phone } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { SectionShell } from "@/components/layout/SectionShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/features/home/types";
import { isRtlLocale } from "@/i18n/direction";
import { useLocale } from "@/i18n/locale";

const faqEntries = {
  fr: [
    {
      id: "fallback-1",
      question: "Qui peut donner son sang ?",
      answer:
        "Toute personne en bonne santé, âgée de 18 à 65 ans et répondant aux critères médicaux de base peut généralement faire un don.",
    },
    {
      id: "fallback-2",
      question: "Faut-il être à jeun avant le don ?",
      answer:
        "Non. Il est préférable de prendre un repas léger et de bien s’hydrater avant de venir au centre.",
    },
    {
      id: "fallback-3",
      question: "Combien de temps dure le parcours de don ?",
      answer:
        "L’ensemble du parcours, de l’accueil jusqu’au temps de repos après le prélèvement, dure en général moins d’une heure.",
    },
    {
      id: "fallback-4",
      question: "Le don de sang est-il sécurisé ?",
      answer:
        "Oui. Le prélèvement est réalisé avec du matériel stérile à usage unique, sous supervision d’une équipe médicale qualifiée.",
    },
    {
      id: "fallback-5",
      question: "Puis-je prendre rendez-vous en ligne ?",
      answer:
        "Oui. La demande de rendez-vous se fait directement depuis l’application, après vérification rapide de votre éligibilité.",
    },
  ],
  ar: [
    {
      id: "fallback-1-ar",
      question: "من يمكنه التبرع بالدم؟",
      answer:
        "يمكن عادة لأي شخص يتمتع بصحة جيدة ويتراوح عمره بين 18 و65 سنة ويستوفي الشروط الطبية الأساسية أن يتبرع بالدم.",
    },
    {
      id: "fallback-2-ar",
      question: "هل يجب أن أكون صائما قبل التبرع؟",
      answer:
        "لا. من الأفضل تناول وجبة خفيفة وشرب الماء قبل الحضور إلى المركز.",
    },
    {
      id: "fallback-3-ar",
      question: "كم يستغرق مسار التبرع؟",
      answer:
        "عادة ما يستغرق المسار الكامل، من الاستقبال إلى فترة الراحة بعد التبرع، أقل من ساعة.",
    },
    {
      id: "fallback-4-ar",
      question: "هل التبرع بالدم آمن؟",
      answer:
        "نعم. يتم سحب الدم باستعمال معدات معقمة للاستعمال الواحد وتحت إشراف فريق طبي مؤهل.",
    },
    {
      id: "fallback-5-ar",
      question: "هل يمكنني طلب موعد عبر الإنترنت؟",
      answer:
        "نعم. يمكن إرسال طلب الموعد مباشرة من التطبيق بعد التحقق السريع من الأهلية.",
    },
  ],
} as const;

type FaqSectionProps = {
  items?: FaqItem[];
  supportLabel?: string;
  phone?: string;
  email?: string;
};

export function FaqSection({
  items = [],
  supportLabel = "Vous avez encore une question ?",
  phone = "+213 560 038 317",
  email = "cts.chu.mustapha@gmail.com",
}: FaqSectionProps) {
  const { locale } = useLocale();
  const isRtl = isRtlLocale(locale);
  const copy =
    locale === "ar"
      ? {
          title: "الأسئلة الشائعة",
          description: "اعثر على الإجابات الأساسية قبل زيارتك للمركز.",
          supportLabel: supportLabel || "هل لديك سؤال آخر؟",
          supportDescription:
            "يبقى فريقنا متاحا لمرافقتك وتوجيهك قبل التبرع.",
        }
      : {
          title: "Questions fréquentes",
          description: "Retrouvez les réponses essentielles avant votre venue au centre.",
          supportLabel,
          supportDescription:
            "Notre équipe reste disponible pour vous accompagner et vous orienter avant votre don.",
        };

  const renderedEntries = items.length > 0 ? items : faqEntries[locale];

  return (
    <SectionShell>
      <PageContainer className="max-w-5xl">
        <h2 className="text-center text-4xl font-black text-slate-950 sm:text-5xl">
          {copy.title}
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-slate-600">
          {copy.description}
        </p>

        <div className="mt-12 rounded-[1.9rem] bg-white p-4 shadow-soft sm:p-6">
          <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            {renderedEntries.map((entry, index) => (
              <AccordionItem
                key={entry.id ?? entry.question}
                value={`item-${index + 1}`}
                className="border-b border-slate-100 last:border-b-0"
              >
                <AccordionTrigger
                  className={`px-4 py-6 text-lg font-bold text-slate-900 hover:no-underline sm:px-6 ${isRtl ? "text-right" : "text-left"}`}
                >
                  {entry.question}
                </AccordionTrigger>
                <AccordionContent
                  className={`px-4 pb-6 text-base leading-8 text-slate-600 sm:px-6 ${isRtl ? "text-right" : "text-left"}`}
                >
                  {entry.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div
          className="mt-8 rounded-[1.6rem] border border-red-100 bg-[#fff7f6] px-6 py-6 shadow-sm sm:px-8"
        >
          <p className="text-lg font-bold text-slate-950">
            {copy.supportLabel}
          </p>
          <p className="mt-2 text-base leading-8 text-slate-600">
            {copy.supportDescription}
          </p>

          <div
            className="mt-5 flex flex-col gap-3 text-sm font-semibold text-slate-700 sm:flex-row sm:items-center sm:gap-6 sm:text-base"
          >
            <a href={`tel:${phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-3">
              <Phone className="h-4 w-4 text-brand-red" />
              {phone}
            </a>
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-3"
            >
              <Mail className="h-4 w-4 text-brand-red" />
              {email}
            </a>
          </div>
        </div>
      </PageContainer>
    </SectionShell>
  );
}
