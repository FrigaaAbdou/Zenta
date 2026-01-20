export function Footer() {
  return (
    <footer className="bg-slate-950 py-10 text-slate-400">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-200">
            SangBot
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Assistant IA pour informer, rassurer et motiver les donneurs de sang.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-xs">
          <a className="transition hover:text-rose-200" href="#features">
            Fonctionnalites
          </a>
          <a className="transition hover:text-rose-200" href="#chat-preview">
            Experience
          </a>
          <a className="transition hover:text-rose-200" href="#how-it-works">
            Parcours
          </a>
          <a className="transition hover:text-rose-200" href="#faq">
            FAQ
          </a>
          <a className="transition hover:text-rose-200" href="mailto:contact@sangbot.com">
            Contact
          </a>
        </div>
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} SangBot. Tous droits reserves.
        </p>
      </div>
    </footer>
  );
}
