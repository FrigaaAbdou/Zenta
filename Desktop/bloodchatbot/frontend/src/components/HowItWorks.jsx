const steps = [
  {
    title: "Ouvrez le chat",
    details:
      "Widget flottant sur votre site ou page dédiée mobile-first. L’utilisateur est accueilli dans cette maquette par Dona avec un message rassurant.",
    icon: "01",
  },
  {
    title: "Posez une question",
    details:
      "Suggestions dynamiques et détection automatique de la langue (simulées). L’utilisateur parle librement, en français ou en arabe classique.",
    icon: "02",
  },
  {
    title: "Réponses claires & suivies",
    details:
      "Garde-fous médicaux, redirections et analytics sont modélisés ici comme pistes pour vos équipes.",
    icon: "03",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-24"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.18),_transparent_65%)]" />
      <div className="mx-auto max-w-5xl rounded-[36px] border border-white/5 bg-white/5 px-6 py-16 shadow-[0_65px_140px_-70px_rgba(244,114,182,0.55)] backdrop-blur-[2px]">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-200">
            Expérience guidée
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Chaque conversation suit un parcours clair et sécurisé.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Depuis l’ouverture du chat jusqu’à la redirection vers les centres,
            SangBot accompagne vos visiteurs avec empathie et précision. Vous
            gardez toujours la main sur les contenus et scénarios.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/8 p-6 text-slate-200 shadow-[0_45px_95px_-55px_rgba(0,0,0,0.75)] backdrop-blur-xl transition hover:-translate-y-1.5 hover:border-rose-300/40 hover:shadow-[0_65px_120px_-50px_rgba(244,114,182,0.45)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-sm font-bold text-white">
                {step.icon}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {step.details}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
