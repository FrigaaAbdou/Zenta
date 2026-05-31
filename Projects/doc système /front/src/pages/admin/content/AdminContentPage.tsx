import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";

import { AdminConfirmDialog } from "@/components/admin/shared/AdminConfirmDialog";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { useAdminAuth, isUnauthorizedAdminError } from "@/features/admin-auth/AdminAuthProvider";
import { useSafeBlocker } from "@/hooks/use-safe-blocker";
import {
  listAdminContent,
  updateAdminContent,
  type AdminContentItem,
  type AdminHomeContentLocale,
} from "@/lib/api/adminContentApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const copy = {
  fr: {
    title: "Contenus publics",
    description: "Edition structurée des blocs publics majeurs, avec séparation claire FR/AR.",
    editor: "Éditeur du bloc home",
    save: "Enregistrer le contenu",
    loading: "Chargement du contenu…",
    empty: "Aucun contenu structuré n'est disponible.",
    saved: "Contenu enregistré.",
    error: "Impossible de charger ou sauvegarder le contenu.",
    unsavedDialogTitle: "Quitter sans enregistrer ?",
    unsavedDialogDescription:
      "Des modifications non enregistrées seront perdues si vous quittez cette page maintenant.",
    unsavedDialogAction: "Quitter sans enregistrer",
  },
} as const;

function cloneLocaleContent(input: AdminHomeContentLocale): AdminHomeContentLocale {
  return JSON.parse(JSON.stringify(input)) as AdminHomeContentLocale;
}

export function AdminContentPage() {
  const locale = "fr" as const;
  const pageCopy = copy.fr;
  const { token, logout } = useAdminAuth();
  const [items, setItems] = useState<AdminContentItem[]>([]);
  const [draft, setDraft] = useState<AdminContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const homeItem = useMemo(
    () => items.find((item) => item.key === "home") ?? items[0] ?? null,
    [items],
  );
  const isDirty = useMemo(() => {
    if (!homeItem || !draft) {
      return false;
    }

    return JSON.stringify(homeItem.localeContent) !== JSON.stringify(draft.localeContent);
  }, [draft, homeItem]);
  const blocker = useSafeBlocker(isDirty && !isSaving);

  useEffect(() => {
    if (homeItem) {
      setDraft({
        ...homeItem,
        localeContent: {
          fr: cloneLocaleContent(homeItem.localeContent.fr),
          ar: cloneLocaleContent(homeItem.localeContent.ar),
        },
      });
    }
  }, [homeItem]);

  async function loadContent() {
    if (!token) {
      setFeedback(pageCopy.error);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const nextItems = await listAdminContent(token);
      setItems(nextItems);
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
    void loadContent();
  }, [token, locale]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  function updateLocaleSection(
    activeLocale: "fr" | "ar",
    patch: Partial<AdminHomeContentLocale>,
  ) {
    if (!draft) {
      return;
    }

    setDraft({
      ...draft,
      localeContent: {
        ...draft.localeContent,
        [activeLocale]: {
          ...draft.localeContent[activeLocale],
          ...patch,
        },
      },
    });
  }

  async function handleSave() {
    if (!token || !draft) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const saved = await updateAdminContent(token, draft.key, {
        fr: draft.localeContent.fr,
        ar: draft.localeContent.ar,
      });

      setItems((current) =>
        current.map((item) => (item.key === saved.key ? saved : item)),
      );
      setDraft(saved);
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
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminConfirmDialog
        open={blocker.state === "blocked"}
        onOpenChange={(open) => {
          if (!open && blocker.state === "blocked") {
            blocker.reset();
          }
        }}
        title={pageCopy.unsavedDialogTitle}
        description={pageCopy.unsavedDialogDescription}
        actionLabel={pageCopy.unsavedDialogAction}
        actionVariant="destructive"
        onConfirm={() => {
          if (blocker.state === "blocked") {
            blocker.proceed();
          }
        }}
      />

      <AdminPageHeader
        title={pageCopy.title}
        description={pageCopy.description}
      />

      <Card className="border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>{pageCopy.editor}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-40 rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          ) : !draft ? (
            <p className="text-sm text-slate-500">{pageCopy.empty}</p>
          ) : (
            <Tabs defaultValue="fr" className="flex flex-col gap-4">
              <TabsList className="w-fit rounded-2xl bg-slate-100 p-1">
                <TabsTrigger value="fr">Français</TabsTrigger>
                <TabsTrigger value="ar">العربية</TabsTrigger>
              </TabsList>

              {(["fr", "ar"] as const).map((activeLocale) => {
                const localeContent = draft.localeContent[activeLocale];

                return (
                  <TabsContent key={activeLocale} value={activeLocale} className="space-y-6">
                    <div className="grid gap-6 xl:grid-cols-2">
                      <Card className="border-slate-200/80 shadow-none">
                        <CardHeader>
                          <CardTitle>Hero</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              {`Eyebrow hero ${activeLocale.toUpperCase()}`}
                            </label>
                            <Input
                              value={localeContent.hero.eyebrow}
                              onChange={(e) =>
                                updateLocaleSection(activeLocale, {
                                  hero: { ...localeContent.hero, eyebrow: e.target.value },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              {`Titre hero ${activeLocale.toUpperCase()}`}
                            </label>
                            <Input
                              aria-label={`Titre hero ${activeLocale.toUpperCase()}`}
                              value={localeContent.hero.title}
                              onChange={(e) =>
                                updateLocaleSection(activeLocale, {
                                  hero: { ...localeContent.hero, title: e.target.value },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              {`Description hero ${activeLocale.toUpperCase()}`}
                            </label>
                            <textarea
                              className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                              value={localeContent.hero.description}
                              onChange={(e) =>
                                updateLocaleSection(activeLocale, {
                                  hero: { ...localeContent.hero, description: e.target.value },
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">
                                {`CTA primaire ${activeLocale.toUpperCase()}`}
                              </label>
                              <Input
                                value={localeContent.hero.primaryCtaLabel}
                                onChange={(e) =>
                                  updateLocaleSection(activeLocale, {
                                    hero: {
                                      ...localeContent.hero,
                                      primaryCtaLabel: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">
                                {`CTA secondaire ${activeLocale.toUpperCase()}`}
                              </label>
                              <Input
                                value={localeContent.hero.secondaryCtaLabel}
                                onChange={(e) =>
                                  updateLocaleSection(activeLocale, {
                                    hero: {
                                      ...localeContent.hero,
                                      secondaryCtaLabel: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-200/80 shadow-none">
                        <CardHeader>
                          <CardTitle>CTA banner</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              {`Titre CTA ${activeLocale.toUpperCase()}`}
                            </label>
                            <Input
                              value={localeContent.ctaBanner.title}
                              onChange={(e) =>
                                updateLocaleSection(activeLocale, {
                                  ctaBanner: {
                                    ...localeContent.ctaBanner,
                                    title: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              {`Description CTA ${activeLocale.toUpperCase()}`}
                            </label>
                            <textarea
                              className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                              value={localeContent.ctaBanner.description}
                              onChange={(e) =>
                                updateLocaleSection(activeLocale, {
                                  ctaBanner: {
                                    ...localeContent.ctaBanner,
                                    description: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              {`Label CTA ${activeLocale.toUpperCase()}`}
                            </label>
                            <Input
                              value={localeContent.ctaBanner.ctaLabel}
                              onChange={(e) =>
                                updateLocaleSection(activeLocale, {
                                  ctaBanner: {
                                    ...localeContent.ctaBanner,
                                    ctaLabel: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                      <Card className="border-slate-200/80 shadow-none">
                        <CardHeader>
                          <CardTitle>Support</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              {`Label support ${activeLocale.toUpperCase()}`}
                            </label>
                            <Input
                              value={localeContent.support.label}
                              onChange={(e) =>
                                updateLocaleSection(activeLocale, {
                                  support: {
                                    ...localeContent.support,
                                    label: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              {`Téléphone support ${activeLocale.toUpperCase()}`}
                            </label>
                            <Input
                              value={localeContent.support.phone}
                              onChange={(e) =>
                                updateLocaleSection(activeLocale, {
                                  support: {
                                    ...localeContent.support,
                                    phone: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-200/80 shadow-none">
                        <CardHeader>
                          <CardTitle>Footer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {(
                            [
                              ["organization", "Organisation"],
                              ["institution", "Institution"],
                              ["address", "Adresse"],
                              ["phone", "Téléphone"],
                              ["email", "Email"],
                            ] as const
                          ).map(([field, label]) => (
                            <div key={field} className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">
                                {`${label} ${activeLocale.toUpperCase()}`}
                              </label>
                              <Input
                                value={localeContent.footer[field]}
                                onChange={(e) =>
                                  updateLocaleSection(activeLocale, {
                                    footer: {
                                      ...localeContent.footer,
                                      [field]: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                );
              })}

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
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
