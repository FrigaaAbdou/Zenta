import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import {
  AppointmentFilterToolbar,
  type AppointmentFiltersValue,
} from "@/components/admin/appointments/FilterToolbar";
import { AppointmentsPagination } from "@/components/admin/appointments/AppointmentsPagination";
import { AppointmentsTable } from "@/components/admin/appointments/AppointmentsTable";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { useAdminAuth, isUnauthorizedAdminError } from "@/features/admin-auth/AdminAuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listAdminAppointments, updateAdminAppointmentStatus, type AdminAppointmentListItem } from "@/lib/api/adminAppointmentsApi";
import { listAdminCampaigns } from "@/lib/api/adminCampaignsApi";

const copy = {
  fr: {
    title: "Demandes de rendez-vous",
    description:
      "Vue centrale de traitement, avec recherche, filtres et lecture rapide des statuts.",
    export: "Exporter",
    searchPlaceholder: "Rechercher par nom ou téléphone",
    statusPlaceholder: "Statut",
    campaignPlaceholder: "Campagne",
    allStatuses: "Tous les statuts",
    allCampaigns: "Toutes les campagnes",
    table: {
      donor: "Donneur",
      slot: "Créneau",
      campaign: "Campagne",
      donationType: "Type de don",
      status: "Statut",
      actions: "Actions",
      viewDetail: "Voir le détail",
      emptyCampaign: "Sans campagne",
      statusLabels: {
        pending: "En attente",
        confirmed: "Confirmé",
        rejected: "Rejeté",
        completed: "Terminé",
        cancelled: "Annulé",
      },
    },
    pagination: {
      page: "Page",
      previous: "Précédent",
      next: "Suivant",
      results: "Résultats",
    },
    emptyTitle: "Aucune demande ne correspond aux filtres actuels.",
    emptyDescription:
      "Ajustez la recherche ou les filtres pour retrouver les rendez-vous attendus.",
    errorTitle: "Impossible de charger les demandes admin.",
    errorDescription:
      "Vérifiez la session admin ou la disponibilité de l'API puis rechargez la page.",
    retry: "Réessayer",
  },
} as const;

export function AdminAppointmentsListPage() {
  const locale = "fr" as const;
  const pageCopy = copy.fr;
  const { token, logout } = useAdminAuth();
  const [items, setItems] = useState<AdminAppointmentListItem[]>([]);
  const [campaigns, setCampaigns] = useState<Array<{ code: string; label: string }>>([]);
  const [filters, setFilters] = useState<AppointmentFiltersValue>({
    search: "",
    status: "all",
    campaignCode: "",
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeFilters = useMemo(
    () => ({
      page,
      pageSize: 10,
      search: filters.search.trim(),
      status: filters.status,
      campaignCode: filters.campaignCode,
    }),
    [filters, page],
  );

  async function loadCampaigns() {
    if (!token) {
      return;
    }

    const campaignItems = await listAdminCampaigns(token);
    setCampaigns(
      campaignItems.map((campaign) => ({
        code: campaign.code,
        label: campaign.localeContent.fr.title,
      })),
    );
  }

  async function loadAppointments() {
    if (!token) {
      setErrorMessage(pageCopy.errorTitle);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await listAdminAppointments(token, activeFilters);
      setItems(response.items);
      setPagination(response.pagination);
    } catch (error) {
      if (isUnauthorizedAdminError(error)) {
        await logout();
      }

      setErrorMessage(pageCopy.errorTitle);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCampaigns();
  }, [token, locale]);

  useEffect(() => {
    void loadAppointments();
  }, [token, activeFilters, locale]);

  async function handleUpdateStatus(id: string, status: AdminAppointmentListItem["status"]) {
    if (!token) {
      return;
    }

    try {
      await updateAdminAppointmentStatus(token, id, status);
      await loadAppointments();
    } catch (error) {
      if (isUnauthorizedAdminError(error)) {
        await logout();
        return;
      }

      setErrorMessage(
        typeof error === "object" && error && "message" in error && typeof error.message === "string"
          ? error.message
          : pageCopy.errorTitle,
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={pageCopy.title}
        description={pageCopy.description}
        actions={
          <Button variant="outline" className="rounded-2xl border-slate-200">
            <SlidersHorizontal data-icon="inline-start" />
            {pageCopy.export}
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 pt-4">
          <AppointmentFilterToolbar
            copy={{
              searchPlaceholder: pageCopy.searchPlaceholder,
              statusPlaceholder: pageCopy.statusPlaceholder,
              campaignPlaceholder: pageCopy.campaignPlaceholder,
              allStatuses: pageCopy.allStatuses,
              allCampaigns: pageCopy.allCampaigns,
              statuses: pageCopy.table.statusLabels,
            }}
            value={filters}
            campaigns={campaigns}
            onChange={(next) => {
              setPage(1);
              setFilters(next);
            }}
          />

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          ) : errorMessage ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-5">
              <p className="text-base font-semibold text-red-900">{pageCopy.errorTitle}</p>
              <p className="mt-2 text-sm leading-6 text-red-700">{pageCopy.errorDescription}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 rounded-2xl border-red-200 bg-white text-red-700 hover:bg-red-100"
                onClick={() => {
                  void loadAppointments();
                }}
              >
                {pageCopy.retry}
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
              <p className="text-base font-semibold text-slate-900">{pageCopy.emptyTitle}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{pageCopy.emptyDescription}</p>
            </div>
          ) : (
            <>
              <AppointmentsTable
                locale={locale}
                copy={pageCopy.table}
                items={items}
                onUpdateStatus={(id, status) => {
                  void handleUpdateStatus(id, status);
                }}
              />
              <AppointmentsPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                pageSize={pagination.pageSize}
                copy={pageCopy.pagination}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
