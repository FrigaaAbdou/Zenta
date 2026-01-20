import { Droplet, UserRound } from "lucide-react";

const conversation = [
  {
    sender: "bot",
    message:
      "Bonjour ! Je suis Dona (projet fictif). Je peux t’aider à imaginer si tu peux donner aujourd’hui.",
    timestamp: "11:03",
  },
  {
    sender: "user",
    message: "Je suis enceinte de 5 mois, est-ce que je peux donner ?",
    timestamp: "11:04",
  },
  {
    sender: "bot",
    message:
      "Félicitations ! Pour ta sécurité et celle du bébé, il est recommandé d’attendre la fin de l’allaitement avant de donner. Tu veux connaître les autres conditions ?",
    timestamp: "11:04",
  },
];

const quickReplies = [
  "Quels tests sont faits ?",
  "Délais entre deux dons",
  "Puis-je donner avec une grippe ?",
];

export function ChatPreview() {
  return (
    <section
      id="chat-preview"
      className="bg-gradient-to-br from-white via-rose-50/40 to-white py-24"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 rounded-[42px] bg-white/85 px-10 py-16 shadow-[0_80px_160px_-80px_rgba(225,29,72,0.58)] backdrop-blur-md lg:flex-row lg:items-start">
        <div className="lg:w-[60%] lg:pr-12">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Expérience conversationnelle fictive
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.6rem]">
            Un chat empathique imaginaire, clair et orienté sécurité.
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600 lg:max-w-[90%]">
            Message d’accueil, rappel des limites médicales et garde-fous
            contextuels : cette démonstration illustre simplement le ton et les
            mécanismes souhaités, sans connexion réelle à une base médicale.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-rose-400" />
              Animation de frappe et transitions douces (simulation visuelle).
            </li>
            <li className="flex gap-3">
              <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-rose-400" />
              Boutons de réponses rapides entièrement fictifs, à adapter selon vos contenus.
            </li>
            <li className="flex gap-3">
              <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-rose-400" />
              Disponible en widget flottant ou page dédiée responsive dans cette maquette.
            </li>
          </ul>
        </div>
        <div className="relative w-full lg:w-[45%]">
          <div className="absolute -left-6 -right-10 -top-6 -bottom-6 -z-10 rounded-[40px] bg-gradient-to-br from-rose-100/80 via-white to-slate-100 shadow-[0_75px_130px_-55px_rgba(244,114,182,0.35)]" />
          <div className="overflow-hidden rounded-[34px] border border-rose-100/80 bg-white/95 shadow-[0_55px_130px_-70px_rgba(15,23,42,0.55)]">
            <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100">
                  <Droplet className="h-5 w-5 text-rose-500" strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Dona — Assistante virtuelle
                  </p>
                  <p className="text-xs text-slate-500">FR / AR disponibles</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                Disponible
              </div>
            </header>
            <div className="space-y-4 bg-slate-50/60 px-6 py-6">
              {conversation.map((turn, index) => (
                <div
                  key={turn.timestamp + index}
                  className={`flex ${
                    turn.sender === "user" ? "flex-row-reverse" : ""
                  } gap-3`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
                      turn.sender === "bot"
                        ? "bg-rose-100 text-rose-500"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {turn.sender === "bot" ? (
                      <Droplet className="h-5 w-5 text-rose-500" strokeWidth={1.8} />
                    ) : (
                      <UserRound className="h-5 w-5 text-white" strokeWidth={1.8} />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-3xl p-4 text-sm leading-6 shadow-sm ${
                      turn.sender === "bot"
                        ? "rounded-tl-sm bg-white text-slate-700 ring-1 ring-rose-100"
                        : "rounded-tr-sm bg-rose-500 text-rose-50"
                    }`}
                  >
                    <p>{turn.message}</p>
                    <span className="mt-2 block text-xs uppercase tracking-wide text-slate-400">
                      {turn.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t border-slate-100 bg-white px-6 py-5">
              <div className="flex gap-2">
                {quickReplies.map((chip) => (
                  <button
                    key={chip}
                    className="rounded-full bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-500 transition hover:bg-rose-100"
                    type="button"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-400 shadow-sm">
                <span className="text-slate-300">Aa</span>
                <span className="block h-4 w-px bg-slate-200" />
                <span className="flex-1 text-left">
                  Écris ta question ici...
                </span>
                <span className="text-rose-500">{">"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
