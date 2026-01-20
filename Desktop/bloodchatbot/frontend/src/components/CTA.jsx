export function CTA({ onPrimaryAction }) {
  return (
    <section
      id="demo"
      className="relative isolate overflow-hidden bg-gradient-to-br from-rose-500 via-rose-400 to-rose-600 py-16"
    >
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-full bg-white/15 blur-3xl" />
      <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/10 px-6 py-12 text-center text-white shadow-[0_65px_130px_-70px_rgba(15,23,42,0.45)] backdrop-blur-md">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Prêt à transformer ce concept en expérience réelle ?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-rose-50">
          Planifiez une démo fictive pour découvrir comment SangBot pourrait
          s’adapter à vos centres, vos donneurs et vos objectifs demain.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-rose-600 shadow-lg shadow-rose-500/40 transition hover:bg-rose-50"
          >
            Échanger sur le concept
          </button>
          <a
            className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            href="#chat-preview"
          >
            Voir le chatbot en action
          </a>
        </div>
      </div>
    </section>
  );
}
