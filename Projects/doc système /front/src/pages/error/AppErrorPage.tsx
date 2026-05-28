import { AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageContainer } from "@/components/layout/PageContainer";

function getErrorCopy(error: unknown) {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return {
        title: "Page introuvable",
        description:
          "La page demandée n'existe pas ou n'est plus disponible. Revenez à l'accueil pour poursuivre votre navigation.",
      };
    }

    return {
      title: "Une erreur est survenue",
      description:
        "Le contenu demandé n'a pas pu être affiché correctement. Merci de réessayer dans quelques instants.",
    };
  }

  return {
    title: "Une erreur technique est survenue",
    description:
      "Nous n'avons pas pu afficher cette page correctement. Vous pouvez revenir à l'accueil ou recharger la page.",
  };
}

export function AppErrorPage() {
  const error = useRouteError();
  const copy = getErrorCopy(error);

  return (
    <PublicLayout>
      <section className="py-16 sm:py-24">
        <PageContainer className="max-w-4xl">
          <div className="rounded-[2rem] border border-red-100 bg-white px-6 py-10 shadow-soft sm:px-10 sm:py-14">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-brand-red">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Incident d&apos;affichage
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              {copy.description}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-red px-6 py-4 text-base font-semibold text-white shadow-soft transition hover:bg-brand-dark"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à l&apos;accueil
              </Link>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-base font-semibold text-slate-700 transition hover:border-brand-red hover:bg-white hover:text-brand-red"
              >
                <RefreshCcw className="h-4 w-4" />
                Recharger la page
              </button>
            </div>
          </div>
        </PageContainer>
      </section>
    </PublicLayout>
  );
}
