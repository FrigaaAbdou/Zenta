import { Droplet, UserRound } from "lucide-react";

const navLinks = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Expérience", href: "#chat-preview" },
  { label: "Parcours", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export function Hero({ onPrimaryAction }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-rose-50">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.18),_transparent_60%)]" />
      <div className="absolute inset-x-0 top-[-20%] -z-20 h-[420px] bg-[radial-gradient(circle_at_center,_rgba(225,29,72,0.08),_transparent_65%)] blur-3xl" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/70 via-white/40 to-white/10" />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-200">
            <Droplet className="h-6 w-6 text-white" strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
              SangBot
            </p>
            <p className="text-xs text-slate-500">
              Concept conversationnel fictif pour le don du sang
            </p>
          </div>
        </div>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              className="transition hover:text-rose-500"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          onClick={onPrimaryAction}
          className="hidden rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600 lg:inline-flex"
        >
          Demander une demo
        </button>
      </header>
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:pb-24 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-rose-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500">
              Prototype fictif — Français & Arabe
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              L’assistant IA imaginaire qui rassure chaque donneur.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Explorez Dona comme étude de style : une expérience de conversation
              chaleureuse imaginée pour le don du sang. Ce prototype ne répond
              pas réellement aux questions, mais illustre comment vous pourriez
              guider vos donneurs à l’avenir.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onPrimaryAction}
                className="rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600"
              >
                Explorer le concept
              </button>
              <a
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-500"
                href="#features"
              >
                Parcourir les avantages
              </a>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 text-sm font-medium text-slate-600">
              <div>
                <p className="text-3xl font-semibold text-slate-900">95%</p>
                <p className="mt-1">
                  concept de satisfaction cible dans cette maquette.
                </p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-slate-900">+40k</p>
                <p className="mt-1">questions imaginées comme gérées automatiquement.</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-slate-900">2 langues</p>
                <p className="mt-1">Français et arabe classique prévus dans le concept.</p>
              </div>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm rounded-[24px] border border-rose-100 bg-white p-5 shadow-xl shadow-rose-100/60 lg:max-w-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Premiere interaction
              </p>
              <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                En ligne
              </span>
            </div>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex w-full gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100">
                  <Droplet className="h-5 w-5 text-rose-500" strokeWidth={1.8} />
                </div>
                <div className="max-w-[75%] rounded-3xl rounded-tl-sm bg-rose-50/80 p-4 text-slate-700">
                  Bonjour ! Je suis Dona. Je peux t’aider pour : conditions,
                  délais, sécurité. Par quoi veux-tu commencer ?
                </div>
              </div>
              <div className="flex w-full flex-row-reverse gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <UserRound className="h-5 w-5 text-white" strokeWidth={1.8} />
                </div>
                <div className="max-w-[75%] rounded-3xl rounded-tr-sm bg-slate-900 p-4 text-slate-100">
                  Est-ce que je peux donner si j’ai fait un tatouage récemment ?
                </div>
              </div>
              <div className="flex w-full gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100">
                  <Droplet className="h-5 w-5 text-rose-500" strokeWidth={1.8} />
                </div>
                <div className="max-w-[75%] rounded-3xl rounded-tl-sm bg-white p-4 text-slate-700 shadow-sm ring-1 ring-rose-100">
                  Merci pour ta question ! Pour ta sécurité, attends 4 mois après
                  un tatouage avant de donner à nouveau. Tu veux que je t’explique
                  les prochaines étapes ?
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              {["Qui peut donner ?", "Combien de temps ?", "Est-ce douloureux ?"].map(
                (chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-rose-100 px-4 py-2 text-xs font-semibold text-rose-500"
                  >
                    {chip}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
