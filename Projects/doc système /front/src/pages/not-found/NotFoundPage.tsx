import { Link } from "react-router-dom";

import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageContainer } from "@/components/layout/PageContainer";

export function NotFoundPage() {
  return (
    <PublicLayout>
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <PageContainer className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-red">
            Erreur 404
          </p>
          <h1 className="mt-6 text-5xl font-black text-slate-950">
            Page introuvable
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            La page demandée n&apos;existe pas ou n&apos;est plus disponible.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex rounded-2xl bg-brand-red px-6 py-4 font-semibold text-white shadow-soft transition hover:bg-brand-dark"
          >
            Retour à l&apos;accueil
          </Link>
        </PageContainer>
      </section>
    </PublicLayout>
  );
}
