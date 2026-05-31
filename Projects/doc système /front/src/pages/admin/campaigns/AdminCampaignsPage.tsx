import { useEffect, useMemo, useState } from "react";
import { PencilLine, Plus, Save } from "lucide-react";

import { AdminConfirmDialog } from "@/components/admin/shared/AdminConfirmDialog";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { useAdminAuth, isUnauthorizedAdminError } from "@/features/admin-auth/AdminAuthProvider";
import {
  createAdminCampaign,
  listAdminCampaigns,
  updateAdminCampaign,
  type AdminCampaignItem,
  type AdminCampaignPayload,
} from "@/lib/api/adminCampaignsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CampaignFormState = AdminCampaignPayload;

const copy = {
  fr: {
    title: "Campagnes",
    description: "Pilotage des campagnes publiques, de leur priorité et de leur publication.",
    newCampaign: "Nouvelle campagne",
    save: "Enregistrer la campagne",
    editor: "Éditeur de campagne",
    loading: "Chargement des campagnes…",
    empty: "Aucune campagne pour le moment.",
    active: "Active",
    published: "Publiée",
    details: "Paramètres",
    code: "Code",
    status: "Statut",
    priority: "Priorité",
    badgeLabel: "Badge",
    theme: "Thème",
    startDate: "Début",
    endDate: "Fin",
    titleFr: "Titre FR",
    descriptionFr: "Description FR",
    ctaFr: "CTA FR",
    titleAr: "Titre AR",
    descriptionAr: "Description AR",
    ctaAr: "CTA AR",
    booleanYes: "Oui",
    booleanNo: "Non",
    isPublished: "Publiée",
    isActive: "Active",
    saved: "Campagne enregistrée.",
    error: "Impossible de charger ou sauvegarder les campagnes.",
    disableDialogTitle: "Confirmer la désactivation",
    disableDialogDescription:
      "Cette campagne ne sera plus active ou publiée côté public. Voulez-vous vraiment continuer ?",
    disableDialogAction: "Confirmer la désactivation",
  },
} as const;

function createEmptyCampaignForm(): CampaignFormState {
  return {
    code: "",
    status: "draft",
    isPublished: false,
    isActive: false,
    priority: 0,
    badgeLabel: "",
    theme: "default",
    startDate: null,
    endDate: null,
    localeContent: {
      fr: {
        title: "",
        description: "",
        ctaLabel: "",
      },
      ar: null,
    },
  };
}

function mapCampaignToForm(item: AdminCampaignItem): CampaignFormState {
  return {
    code: item.code,
    status: item.status,
    isPublished: item.isPublished,
    isActive: item.isActive,
    priority: item.priority,
    badgeLabel: item.badgeLabel,
    theme: item.theme,
    startDate: item.startDate ? item.startDate.slice(0, 10) : null,
    endDate: item.endDate ? item.endDate.slice(0, 10) : null,
    localeContent: {
      fr: { ...item.localeContent.fr },
      ar: item.localeContent.ar ? { ...item.localeContent.ar } : null,
    },
  };
}

export function AdminCampaignsPage() {
  const locale = "fr" as const;
  const pageCopy = copy.fr;
  const { token, logout } = useAdminAuth();
  const [items, setItems] = useState<AdminCampaignItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignFormState>(createEmptyCampaignForm());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingSavePayload, setPendingSavePayload] = useState<AdminCampaignPayload | null>(null);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  async function loadCampaigns() {
    if (!token) {
      setFeedback(pageCopy.error);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const nextItems = await listAdminCampaigns(token);
      setItems(nextItems);

      if (nextItems.length > 0 && !selectedId) {
        setSelectedId(nextItems[0].id);
        setForm(mapCampaignToForm(nextItems[0]));
      }
    } catch (error) {
      if (isUnauthorizedAdminError(error)) {
        await logout();
      }

      setFeedback(pageCopy.error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCampaigns();
  }, [token, locale]);

  useEffect(() => {
    if (selectedItem) {
      setForm(mapCampaignToForm(selectedItem));
    }
  }, [selectedItem]);

  function updateForm(patch: Partial<CampaignFormState>) {
    setForm((current) => ({
      ...current,
      ...patch,
    }));
  }

  async function persistCampaign(payload: AdminCampaignPayload) {
    if (!token) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const saved = selectedItem
        ? await updateAdminCampaign(token, selectedItem.id, payload)
        : await createAdminCampaign(token, payload);

      const refreshed = await listAdminCampaigns(token);
      setItems(refreshed);
      setSelectedId(saved.id);
      setFeedback(pageCopy.saved);
    } catch (error) {
      if (isUnauthorizedAdminError(error)) {
        await logout();
        return;
      }

      setFeedback(
        typeof error === "object" && error && "message" in error && typeof error.message === "string"
          ? error.message
          : pageCopy.error,
      );
    } finally {
      setIsSaving(false);
      setPendingSavePayload(null);
    }
  }

  function buildPayload(): AdminCampaignPayload {
    return {
      ...form,
      code: form.code.trim(),
      badgeLabel: form.badgeLabel.trim(),
      theme: form.theme.trim(),
      localeContent: {
        fr: {
          title: form.localeContent.fr.title.trim(),
          description: form.localeContent.fr.description.trim(),
          ctaLabel: form.localeContent.fr.ctaLabel.trim(),
        },
        ar: form.localeContent.ar
          ? {
              title: form.localeContent.ar.title.trim(),
              description: form.localeContent.ar.description.trim(),
              ctaLabel: form.localeContent.ar.ctaLabel.trim(),
            }
          : null,
      },
    };
  }

  function requiresDisableConfirmation(payload: AdminCampaignPayload) {
    if (!selectedItem) {
      return false;
    }

    return (
      (selectedItem.isPublished && !payload.isPublished) ||
      (selectedItem.isActive && !payload.isActive)
    );
  }

  async function handleSave() {
    const payload = buildPayload();

    if (requiresDisableConfirmation(payload)) {
      setPendingSavePayload(payload);
      return;
    }

    await persistCampaign(payload);
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminConfirmDialog
        open={pendingSavePayload !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingSavePayload(null);
          }
        }}
        title={pageCopy.disableDialogTitle}
        description={pageCopy.disableDialogDescription}
        actionLabel={pageCopy.disableDialogAction}
        actionVariant="destructive"
        isSubmitting={isSaving}
        onConfirm={async () => {
          if (!pendingSavePayload) {
            return;
          }

          await persistCampaign(pendingSavePayload);
        }}
      />

      <AdminPageHeader
        title={pageCopy.title}
        description={pageCopy.description}
        actions={
          <Button
            type="button"
            className="rounded-2xl bg-brand-red text-white hover:bg-brand-dark"
            onClick={() => {
              setSelectedId(null);
              setForm(createEmptyCampaignForm());
            }}
          >
            <Plus data-icon="inline-start" />
            {pageCopy.newCampaign}
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-28 w-full rounded-3xl" />
              <Skeleton className="h-28 w-full rounded-3xl" />
            </>
          ) : items.length === 0 ? (
            <Card className="border-slate-200/80 bg-white shadow-sm">
              <CardContent className="p-6 text-sm text-slate-500">
                {pageCopy.empty}
              </CardContent>
            </Card>
          ) : (
            items.map((campaign) => (
              <Card
                key={campaign.id}
                className={`cursor-pointer border-slate-200/80 bg-white shadow-sm transition hover:border-red-200 ${selectedId === campaign.id ? "ring-2 ring-red-200" : ""}`}
                onClick={() => setSelectedId(campaign.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {campaign.code}
                      </p>
                      <p className="mt-2 text-lg text-slate-950">
                        {campaign.localeContent.fr.title}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {campaign.isActive ? (
                        <Badge className="rounded-full bg-emerald-50 text-emerald-700 shadow-none hover:bg-emerald-50">
                          {pageCopy.active}
                        </Badge>
                      ) : null}
                      {campaign.isPublished ? (
                        <Badge className="rounded-full bg-sky-50 text-sky-700 shadow-none hover:bg-sky-50">
                          {pageCopy.published}
                        </Badge>
                      ) : null}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <span>{pageCopy.priority}</span>
                    <span className="font-medium text-slate-900">{campaign.priority}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>{pageCopy.theme}</span>
                    <span className="font-medium text-slate-900">{campaign.theme}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>{pageCopy.editor}</CardTitle>
            {selectedItem ? (
              <Badge className="rounded-full bg-slate-100 text-slate-700 shadow-none hover:bg-slate-100">
                <PencilLine className="size-3.5" />
                {selectedItem.code}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{pageCopy.code}</label>
                <Input value={form.code} onChange={(e) => updateForm({ code: e.target.value })} aria-label="Code" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{pageCopy.status}</label>
                <Input
                  value={form.status}
                  onChange={(e) => updateForm({ status: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{pageCopy.priority}</label>
                <Input
                  type="number"
                  value={String(form.priority)}
                  onChange={(e) => updateForm({ priority: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{pageCopy.theme}</label>
                <Input
                  value={form.theme}
                  onChange={(e) => updateForm({ theme: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{pageCopy.badgeLabel}</label>
                <Input
                  value={form.badgeLabel}
                  onChange={(e) => updateForm({ badgeLabel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{pageCopy.isPublished}</label>
                <Select
                  value={form.isPublished ? "yes" : "no"}
                  onValueChange={(value) => updateForm({ isPublished: value === "yes" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">{pageCopy.booleanYes}</SelectItem>
                    <SelectItem value="no">{pageCopy.booleanNo}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{pageCopy.isActive}</label>
                <Select
                  value={form.isActive ? "yes" : "no"}
                  onValueChange={(value) => updateForm({ isActive: value === "yes" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">{pageCopy.booleanYes}</SelectItem>
                    <SelectItem value="no">{pageCopy.booleanNo}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{pageCopy.startDate}</label>
                <Input
                  type="date"
                  value={form.startDate ?? ""}
                  onChange={(e) => updateForm({ startDate: e.target.value || null })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{pageCopy.endDate}</label>
                <Input
                  type="date"
                  value={form.endDate ?? ""}
                  onChange={(e) => updateForm({ endDate: e.target.value || null })}
                />
              </div>
            </div>

            <Tabs defaultValue="fr" className="flex flex-col gap-4">
              <TabsList className="w-fit rounded-2xl bg-slate-100 p-1">
                <TabsTrigger value="fr">Français</TabsTrigger>
                <TabsTrigger value="ar">العربية</TabsTrigger>
              </TabsList>
              <TabsContent value="fr" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{pageCopy.titleFr}</label>
                  <Input
                    aria-label="Titre FR"
                    value={form.localeContent.fr.title}
                    onChange={(e) =>
                      updateForm({
                        localeContent: {
                          ...form.localeContent,
                          fr: { ...form.localeContent.fr, title: e.target.value },
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{pageCopy.descriptionFr}</label>
                  <textarea
                    aria-label="Description FR"
                    className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    value={form.localeContent.fr.description}
                    onChange={(e) =>
                      updateForm({
                        localeContent: {
                          ...form.localeContent,
                          fr: { ...form.localeContent.fr, description: e.target.value },
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{pageCopy.ctaFr}</label>
                  <Input
                    aria-label="CTA FR"
                    value={form.localeContent.fr.ctaLabel}
                    onChange={(e) =>
                      updateForm({
                        localeContent: {
                          ...form.localeContent,
                          fr: { ...form.localeContent.fr, ctaLabel: e.target.value },
                        },
                      })
                    }
                  />
                </div>
              </TabsContent>
              <TabsContent value="ar" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{pageCopy.titleAr}</label>
                  <Input
                    aria-label="Titre AR"
                    value={form.localeContent.ar?.title ?? ""}
                    onChange={(e) =>
                      updateForm({
                        localeContent: {
                          ...form.localeContent,
                          ar: {
                            title: e.target.value,
                            description: form.localeContent.ar?.description ?? "",
                            ctaLabel: form.localeContent.ar?.ctaLabel ?? "",
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{pageCopy.descriptionAr}</label>
                  <textarea
                    aria-label="Description AR"
                    className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    value={form.localeContent.ar?.description ?? ""}
                    onChange={(e) =>
                      updateForm({
                        localeContent: {
                          ...form.localeContent,
                          ar: {
                            title: form.localeContent.ar?.title ?? "",
                            description: e.target.value,
                            ctaLabel: form.localeContent.ar?.ctaLabel ?? "",
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{pageCopy.ctaAr}</label>
                  <Input
                    aria-label="CTA AR"
                    value={form.localeContent.ar?.ctaLabel ?? ""}
                    onChange={(e) =>
                      updateForm({
                        localeContent: {
                          ...form.localeContent,
                          ar: {
                            title: form.localeContent.ar?.title ?? "",
                            description: form.localeContent.ar?.description ?? "",
                            ctaLabel: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              </TabsContent>
            </Tabs>

            {feedback ? <p className="text-sm text-slate-500">{feedback}</p> : null}

            <Button
              type="button"
              disabled={isSaving}
              className="w-full rounded-2xl bg-brand-red text-white hover:bg-brand-dark"
              onClick={() => {
                void handleSave();
              }}
            >
              <Save data-icon="inline-start" />
              {pageCopy.save}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
