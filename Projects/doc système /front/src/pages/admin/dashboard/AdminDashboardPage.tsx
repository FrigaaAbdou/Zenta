import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarCheck2,
  CircleDashed,
  Megaphone,
  RefreshCcw,
} from "lucide-react";

import { useAdminAuth } from "@/features/admin-auth/AdminAuthProvider";
import {
  getAdminDashboardOverview,
  type AdminDashboardOverview,
} from "@/lib/api/adminDashboardApi";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";
import { StatusDistributionChart } from "@/components/admin/dashboard/StatusDistributionChart";
import { RecentAppointmentsTable } from "@/components/admin/dashboard/RecentAppointmentsTable";
import { FeaturedCampaignCard } from "@/components/admin/dashboard/FeaturedCampaignCard";
import { RecentActivityFeed } from "@/components/admin/dashboard/RecentActivityFeed";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const dashboardCopy = {
  fr: {
    title: "Dashboard",
    description:
      "Vue d'ensemble opérationnelle du centre, avec les demandes à traiter en priorité.",
    primaryAction: "Nouvelle campagne",
    pending: "Demandes en attente",
    today: "Demandes aujourd'hui",
    activeCampaign: "Campagne active",
    activeCampaigns: "Campagnes actives",
    activity: "Activité récente",
    queue: "File prioritaire",
    queueDescription: "Demandes à examiner avant la prochaine plage horaire.",
    waiting: "En attente",
    chartTitle: "Répartition par statut",
    chartDescription: "Lecture rapide de la charge opérationnelle actuelle.",
    campaignCardDescription:
      "Campagne publique mise en avant et prête à être pilotée depuis l’admin.",
    campaignCardEmpty: "Aucune campagne active n’est publiée pour le moment.",
    manageCampaign: "Gérer les campagnes",
    viewAll: "Voir tout",
    recentActivityDescription: "Derniers signaux visibles du workflow.",
    pendingDetail: "À traiter en priorité",
    todayDetail: "Rendez-vous reçus aujourd'hui",
    activeCampaignDetail: "Visibles côté public",
    errorTitle: "Impossible de charger la vue d'ensemble admin.",
    errorDescription:
      "Vérifiez la session admin ou la disponibilité de l'API puis relancez le chargement.",
    retry: "Réessayer",
  },
} as const;

export function AdminDashboardPage() {
  const { token } = useAdminAuth();
  const locale = "fr" as const;
  const copy = dashboardCopy.fr;
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadDashboard() {
    if (!token) {
      setOverview(null);
      setErrorMessage(copy.errorTitle);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getAdminDashboardOverview(token, locale);
      setOverview(data);
    } catch (_error) {
      setOverview(null);
      setErrorMessage(copy.errorTitle);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, [token, locale]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <AdminPageHeader title={copy.title} description={copy.description} />
        <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr_1fr]">
          {[0, 1, 2].map((index) => (
            <Card key={index} className="border-slate-200/80 bg-white shadow-sm">
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-52 w-full" />
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!overview || errorMessage) {
    return (
      <div className="flex flex-col gap-6">
        <AdminPageHeader title={copy.title} description={copy.description} />
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardContent className="flex flex-col items-start gap-4 p-6">
            <p className="text-base font-semibold text-slate-950">{copy.errorTitle}</p>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              {copy.errorDescription}
            </p>
            <Button
              type="button"
              onClick={() => {
                void loadDashboard();
              }}
              className="rounded-2xl bg-brand-red text-white hover:bg-brand-dark"
            >
              <RefreshCcw data-icon="inline-start" />
              {copy.retry}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={copy.title}
        description={copy.description}
        actions={
          <Button asChild className="rounded-2xl bg-brand-red text-white hover:bg-brand-dark">
            <Link to="/admin/campaigns">
              <Megaphone data-icon="inline-start" />
              {copy.primaryAction}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr_1fr]">
        <MetricCard
          label={copy.pending}
          value={String(overview.metrics.pendingCount)}
          detail={copy.pendingDetail}
          icon={<CircleDashed className="size-4" />}
          accent={<StatusBadge status="pending" locale={locale} className="gap-1.5" />}
        />

        <MetricCard
          label={copy.today}
          value={String(overview.metrics.todayCount)}
          detail={copy.todayDetail}
          icon={<CalendarCheck2 className="size-4" />}
          accent={
            <div className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
              <ArrowUpRight className="size-4" />
              {copy.today}
            </div>
          }
        />

        <MetricCard
          label={copy.activeCampaigns}
          value={String(overview.metrics.activeCampaignCount)}
          detail={copy.activeCampaignDetail}
          icon={<Megaphone className="size-4" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <RecentAppointmentsTable
          title={copy.queue}
          description={copy.queueDescription}
          locale={locale}
          viewAllLabel={copy.viewAll}
          items={overview.recentAppointments}
        />

        <div className="flex flex-col gap-4">
          <FeaturedCampaignCard
            title={copy.activeCampaign}
            description={copy.campaignCardDescription}
            emptyLabel={copy.campaignCardEmpty}
            manageLabel={copy.manageCampaign}
            item={overview.featuredCampaign}
          />
          <RecentActivityFeed
            title={copy.activity}
            description={copy.recentActivityDescription}
            items={overview.activity}
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <StatusDistributionChart
          title={copy.chartTitle}
          description={copy.chartDescription}
          locale={locale}
          items={overview.statusDistribution}
        />

        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div>
              <p className="text-sm font-medium text-slate-500">{copy.pending}</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                {overview.metrics.pendingCount}
              </p>
            </div>
            <div className="space-y-3">
              {overview.statusDistribution.slice(0, 3).map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <StatusBadge status={item.status} locale={locale} />
                  <span className="text-sm font-semibold text-slate-950">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
