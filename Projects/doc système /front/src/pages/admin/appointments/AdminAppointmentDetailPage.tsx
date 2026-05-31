import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { AppointmentStatusActions } from "@/components/admin/appointments/AppointmentStatusActions";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { useAdminAuth, isUnauthorizedAdminError } from "@/features/admin-auth/AdminAuthProvider";
import {
  getAdminAppointment,
  updateAdminAppointmentStatus,
  type AdminAppointmentDetail,
} from "@/lib/api/adminAppointmentsApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const copy = {
  fr: {
    title: "Détail de la demande",
    description:
      "Consultation détaillée de la demande avant validation ou mutation de statut.",
    back: "Retour à la liste",
    donorBlock: "Donneur et rendez-vous",
    statusBlock: "Statut et remarques",
    currentStatus: "Statut actuel",
    mutateTitle: "Actions disponibles",
    identity: "Identité",
    phone: "Téléphone",
    birthDate: "Date de naissance",
    gender: "Genre",
    email: "Email",
    bloodGroup: "Groupe sanguin",
    location: "Localisation",
    slot: "Créneau",
    donationType: "Type de don",
    campaign: "Campagne",
    locale: "Langue de soumission",
    existingDonor: "Déjà donneur",
    lastDonation: "Dernier don",
    eligibility: "Critères d'éligibilité",
    remarks: "Remarques",
    yes: "Oui",
    no: "Non",
    noRemarks: "Aucune remarque transmise.",
    emptyCampaign: "Sans campagne",
    statusLabels: {
      pending: "En attente",
      confirmed: "Confirmé",
      rejected: "Rejeté",
      completed: "Terminé",
      cancelled: "Annulé",
    },
    checklist: {
      ageConfirmed: "Âge validé",
      weightConfirmed: "Poids validé",
      healthyConfirmed: "Bonne santé déclarée",
      noContraIndicationConfirmed: "Aucune contre-indication déclarée",
    },
    errorTitle: "Impossible de charger le détail de la demande.",
    retry: "Réessayer",
  },
} as const;

export function AdminAppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const locale = "fr" as const;
  const pageCopy = copy.fr;
  const { token, admin, logout } = useAdminAuth();
  const [item, setItem] = useState<AdminAppointmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadDetail() {
    if (!token || !id) {
      setErrorMessage(pageCopy.errorTitle);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getAdminAppointment(token, id);
      setItem(response);
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
    void loadDetail();
  }, [token, id, locale]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={pageCopy.title}
        description={pageCopy.description}
        actions={
          <Button asChild variant="outline" className="rounded-2xl border-slate-200">
            <Link to="/admin/appointments">{pageCopy.back}</Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-28 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : errorMessage || !item ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-6">
            <p className="text-base font-semibold text-slate-950">{pageCopy.errorTitle}</p>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-slate-200"
              onClick={() => {
                void loadDetail();
              }}
            >
              {pageCopy.retry}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>{pageCopy.donorBlock}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{pageCopy.identity}</p>
              <p className="mt-1 font-medium text-slate-900">
                {item.donorFull.firstName} {item.donorFull.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{pageCopy.phone}</p>
              <p className="mt-1 font-medium text-slate-900">{item.donorFull.phone}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{pageCopy.slot}</p>
              <p className="mt-1 font-medium text-slate-900">
                {item.appointmentDate} - {item.appointmentTime}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{pageCopy.donationType}</p>
              <p className="mt-1 font-medium text-slate-900 capitalize">
                {item.donationType.replaceAll("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{pageCopy.birthDate}</p>
              <p className="mt-1 font-medium text-slate-900">
                {new Date(item.donorFull.birthDate).toLocaleDateString(
                  "fr-FR",
                )}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{pageCopy.gender}</p>
              <p className="mt-1 font-medium text-slate-900">{item.donorFull.gender}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{pageCopy.email}</p>
              <p className="mt-1 font-medium text-slate-900">{item.donorFull.email ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{pageCopy.bloodGroup}</p>
              <p className="mt-1 font-medium text-slate-900">{item.donorFull.bloodGroup}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{pageCopy.location}</p>
              <p className="mt-1 font-medium text-slate-900">
                {item.donorFull.wilayaCode} - {item.donorFull.commune}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{pageCopy.campaign}</p>
              <p className="mt-1 font-medium text-slate-900">
                {item.campaignCode ?? pageCopy.emptyCampaign}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{pageCopy.locale}</p>
              <p className="mt-1 font-medium text-slate-900">{item.locale}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{pageCopy.existingDonor}</p>
              <p className="mt-1 font-medium text-slate-900">
                {item.isExistingDonor ? pageCopy.yes : pageCopy.no}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{pageCopy.lastDonation}</p>
              <p className="mt-1 font-medium text-slate-900">
                {item.lastDonationDate
                  ? new Date(item.lastDonationDate).toLocaleDateString(
                      "fr-FR",
                    )
                  : "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{pageCopy.statusBlock}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <AppointmentStatusActions
              locale={locale}
              role={admin?.role ?? "operator"}
              currentStatus={item.status}
              copy={{
                currentStatus: pageCopy.currentStatus,
                mutateTitle: pageCopy.mutateTitle,
                statusLabels: pageCopy.statusLabels,
              }}
              onSubmit={async (status) => {
                if (!token || !id) {
                  return;
                }

                try {
                  const updated = await updateAdminAppointmentStatus(token, id, status);
                  setItem(updated);
                } catch (error) {
                  if (isUnauthorizedAdminError(error)) {
                    await logout();
                    return;
                  }

                  setErrorMessage(
                    typeof error === "object" &&
                      error &&
                      "message" in error &&
                      typeof error.message === "string"
                      ? error.message
                      : pageCopy.errorTitle,
                  );
                }
              }}
            />

            <div className="space-y-3 border-t border-slate-200 pt-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  {pageCopy.eligibility}
                </p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  {Object.entries(item.eligibilityChecklist).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <span>{pageCopy.checklist[key as keyof typeof pageCopy.checklist]}</span>
                      <StatusBadge
                        status={value ? "confirmed" : "rejected"}
                        locale={locale}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  {pageCopy.remarks}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.remarks || pageCopy.noRemarks}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  );
}
