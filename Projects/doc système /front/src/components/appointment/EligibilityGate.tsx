import { AlertCircle, CheckCircle2 } from "lucide-react";

import { useLocale } from "@/i18n/locale";

export type EligibilityGateValue = {
  ageConfirmed: boolean;
  weightConfirmed: boolean;
  healthyConfirmed: boolean;
  noContraIndicationConfirmed: boolean;
};

type EligibilityGateProps = {
  value: EligibilityGateValue;
  onChange: (next: EligibilityGateValue) => void;
  onContinue: () => void;
};

const criteria = [
  ["ageConfirmed", "Âge entre 18 et 65 ans"],
  ["weightConfirmed", "Poids minimum 50 kg"],
  ["healthyConfirmed", "Être en bonne santé"],
  ["noContraIndicationConfirmed", "Aucune contre-indication au don"],
] as const;

export function EligibilityGate({
  value,
  onChange,
  onContinue,
}: EligibilityGateProps) {
  const { locale } = useLocale();
  const copy =
    locale === "ar"
      ? {
          title: "هل أنا مؤهل للتبرع؟",
          description:
            "تحقق من أهليتك قبل طلب الموعد. إذا كان لديك شك، ففريقنا الصحي موجود لإرشادك.",
          notice:
            "التبرع بالدم عمل تطوعي وتحت إشراف طبي. إذا لم يتحقق أحد هذه الشروط، فاتصل بالمركز قبل طلب الموعد.",
          button: "أطلب موعدا",
          criteria: [
            ["ageConfirmed", "العمر بين 18 و65 سنة"],
            ["weightConfirmed", "الوزن الأدنى 50 كلغ"],
            ["healthyConfirmed", "حالة صحية جيدة"],
            ["noContraIndicationConfirmed", "عدم وجود مانع للتبرع"],
          ] as const,
        }
      : {
          title: "Suis-je éligible au don ?",
          description:
            "Vérifiez votre éligibilité avant de prendre rendez-vous. En cas de doute, nos professionnels de santé sont là pour vous conseiller.",
          notice:
            "Le don de sang est un acte volontaire et médicalisé. Si l'un de ces critères n'est pas rempli, contactez le centre avant toute demande de rendez-vous.",
          button: "Prendre rendez-vous",
          criteria,
        };

  const canContinue =
    value.ageConfirmed &&
    value.weightConfirmed &&
    value.healthyConfirmed &&
    value.noContraIndicationConfirmed;

  return (
    <div className="rounded-[1.9rem] bg-white p-8 shadow-soft sm:p-10">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-50 text-brand-red">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
            {copy.title}
          </h2>
          <p className="mt-3 text-base leading-8 text-slate-600">
            {copy.description}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {copy.criteria.map(([key, label]) => (
          <label
            key={key}
            className="flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 px-5 py-4 transition hover:border-red-200 hover:bg-red-50/30"
          >
            <input
              type="checkbox"
              checked={value[key]}
              onChange={(event) =>
                onChange({ ...value, [key]: event.target.checked })
              }
              className="mt-1 h-5 w-5 rounded border-slate-300 text-brand-red focus:ring-brand-red"
            />
            <span className="text-base font-medium text-slate-700">{label}</span>
          </label>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-red-100 bg-[#fff7f6] px-5 py-4 text-sm leading-7 text-slate-600">
        {copy.notice}
      </div>

      <button
        type="button"
        disabled={!canContinue}
        onClick={onContinue}
        className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-brand-red px-6 py-4 text-base font-semibold text-white shadow-soft transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-red-200 disabled:text-red-50"
      >
        <CheckCircle2 className="h-5 w-5" />
        {copy.button}
      </button>
    </div>
  );
}
