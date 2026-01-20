import {
  Brain,
  Globe2,
  Settings,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    title: "IA médicale empathique",
    description:
      "Réponses prototype co-construites avec vos équipes médicales pour imaginer un dialogue rassurant et corrigé.",
    icon: Brain,
  },
  {
    title: "Bilingue FR / AR",
    description:
      "Détection automatique de la langue envisagée pour fluidifier l’expérience en français et en arabe classique.",
    icon: Globe2,
  },
  {
    title: "Intégration rapide",
    description:
      "Widget flottant, page dédiée ou intégration multi-canal : tout est simulé pour inspirer vos futures décisions techniques.",
    icon: Settings,
  },
  {
    title: "Supervision et garde-fous",
    description:
      "Journalisation, alertes et validations humaines sont esquissées ici pour garantir qualité et conformité demain.",
    icon: ShieldCheck,
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative isolate bg-gradient-to-br from-white via-rose-50/50 to-white py-20"
    >
      <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-[radial-gradient(circle,_rgba(244,114,182,0.12)_0%,_transparent_70%)]" />
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Tout ce qu’il faut pour une expérience fiable
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Une base de connaissances médicale mise à jour, des garde-fous IA et
            un suivi complet des conversations pour veiller sur vos donneurs.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl border border-rose-100/80 bg-white/90 p-8 shadow-[0_40px_90px_-50px_rgba(225,29,72,0.65)] transition hover:-translate-y-1.5 hover:shadow-[0_55px_110px_-45px_rgba(225,29,72,0.75)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100">
                <feature.icon className="h-5 w-5 text-rose-500" strokeWidth={1.8} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {feature.description}
              </p>
              <div className="absolute inset-x-0 top-0 -z-10 h-1 origin-left scale-x-0 bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 transition group-hover:scale-x-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
