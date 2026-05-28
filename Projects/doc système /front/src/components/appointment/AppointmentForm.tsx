import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { AppointmentFormSection } from "@/components/appointment/AppointmentFormSection";
import {
  EligibilityGate,
  type EligibilityGateValue,
} from "@/components/appointment/EligibilityGate";
import { getActiveCampaigns } from "@/lib/api/campaignApi";
import {
  fallbackAppointmentMeta,
} from "@/features/appointment/constants/formOptions";
import {
  appointmentFormSchema,
  type AppointmentFormValues,
} from "@/features/appointment/schema/appointmentFormSchema";
import type { AppointmentFormMeta } from "@/features/appointment/types";
import {
  createAppointmentRequest,
  getAppointmentFormMeta,
  getAppointmentSlots,
} from "@/lib/api/appointmentApi";
import { useLocale } from "@/i18n/locale";
import type { ApiErrorPayload } from "@/lib/api/client";

function getFallbackCampaignOptions(locale: "fr" | "ar") {
  return [
    {
      value: "",
      label:
        locale === "ar"
          ? "بدون حملة محددة"
          : "Aucune campagne spécifique",
    },
  ];
}

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
};

function Field({ label, error, hint, children }: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

const inputClassName =
  "h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-red focus:bg-white";

const textareaClassName =
  "min-h-[144px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-red focus:bg-white";

function isAppointmentFormMeta(value: unknown): value is AppointmentFormMeta {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<AppointmentFormMeta>;

  return (
    Array.isArray(candidate.genders) &&
    Array.isArray(candidate.wilayas) &&
    Array.isArray(candidate.bloodGroups) &&
    Array.isArray(candidate.donationTypes) &&
    !!candidate.communesByWilaya &&
    typeof candidate.communesByWilaya === "object"
  );
}

export function AppointmentForm() {
  const { locale } = useLocale();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [meta, setMeta] = useState<AppointmentFormMeta>(fallbackAppointmentMeta);
  const [campaignOptions, setCampaignOptions] = useState<
    Array<{ value: string; label: string }>
  >(() => [...getFallbackCampaignOptions(locale)]);
  const [slotOptions, setSlotOptions] = useState<
    Array<{ value: string; label: string; isAvailable: boolean }>
  >([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [gate, setGate] = useState<EligibilityGateValue>({
    ageConfirmed: false,
    weightConfirmed: false,
    healthyConfirmed: false,
    noContraIndicationConfirmed: false,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      birthDate: "",
      gender: "male",
      phone: "",
      email: "",
      wilayaCode: "",
      commune: "",
      campaignCode: "",
      appointmentDate: "",
      appointmentTime: "",
      bloodGroup: "",
      donationType: "",
      isExistingDonor: false,
      lastDonationDate: "",
      remarks: "",
    },
  });

  const isExistingDonor = form.watch("isExistingDonor");
  const selectedWilayaCode = form.watch("wilayaCode");
  const selectedAppointmentDate = form.watch("appointmentDate");
  const selectedCampaignCode = form.watch("campaignCode");
  const safeMeta = isAppointmentFormMeta(meta) ? meta : fallbackAppointmentMeta;
  const communeOptions = safeMeta.communesByWilaya[selectedWilayaCode] ?? [];
  const availableSlotOptions = slotOptions.filter((slot) => slot.isAvailable);
  const copy =
    locale === "ar"
      ? {
          success:
            "تم إرسال طلبك. سنتواصل معك لتأكيد الموعد.",
          validationError: "بعض الحقول غير صالحة. يرجى التحقق من الاستمارة.",
          conflictError: "هذا الموعد لم يعد متاحا. يرجى اختيار موعد آخر.",
          serverError: "واجه الخادم خطأ. يرجى إعادة المحاولة لاحقا.",
          networkError:
            "تعذر إرسال الطلب حاليا. قد لا تكون الواجهة الخلفية متاحة بعد.",
        }
      : {
          success:
            "Votre demande a été envoyée. Nous vous recontacterons pour confirmation.",
          validationError:
            "Certains champs sont invalides. Vérifiez le formulaire.",
          conflictError:
            "Ce créneau n'est plus disponible. Merci d'en choisir un autre.",
          serverError:
            "Le serveur a rencontré une erreur. Merci de réessayer un peu plus tard.",
          networkError:
            "Impossible d'envoyer la demande pour le moment. L'API n'est peut-être pas encore disponible.",
        };

  useEffect(() => {
    if (!isUnlocked) {
      return;
    }

    let isCancelled = false;

    void (async () => {
      try {
        const payload = await getAppointmentFormMeta(locale);

        if (!isCancelled) {
          setMeta(
            isAppointmentFormMeta(payload.data)
              ? payload.data
              : fallbackAppointmentMeta,
          );
        }
      } catch {
        if (!isCancelled) {
          setMeta(fallbackAppointmentMeta);
        }
      }

      try {
        const campaigns = await getActiveCampaigns(locale);

        if (!isCancelled) {
          setCampaignOptions([
            ...getFallbackCampaignOptions(locale),
            ...campaigns.map((campaign) => ({
              value: campaign.code,
              label: campaign.title,
            })),
          ]);
        }
      } catch {
        if (!isCancelled) {
          setCampaignOptions([...getFallbackCampaignOptions(locale)]);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isUnlocked, locale]);

  useEffect(() => {
    if (!isUnlocked || !selectedAppointmentDate) {
      setSlotOptions([]);
      setSlotsError(null);
      setSlotsLoading(false);
      form.setValue("appointmentTime", "");
      return;
    }

    let isCancelled = false;

    form.setValue("appointmentTime", "");
    setSlotsLoading(true);
    setSlotsError(null);

    void getAppointmentSlots(
      selectedAppointmentDate,
      selectedCampaignCode || undefined,
    )
      .then((payload) => {
        if (isCancelled) {
          return;
        }

        setSlotOptions(payload.data.slots);
      })
      .catch(() => {
        if (isCancelled) {
          return;
        }

        setSlotOptions([]);
        setSlotsError("Impossible de charger les créneaux.");
      })
      .finally(() => {
        if (isCancelled) {
          return;
        }

        setSlotsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [form, isUnlocked, selectedAppointmentDate, selectedCampaignCode]);

  useEffect(() => {
    const subscription = form.watch((_values, info) => {
      if (info.type === "change") {
        setSubmitSuccess(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    form.clearErrors();

    try {
      await createAppointmentRequest({
        ...values,
        locale,
        eligibilityChecklist: gate,
        wilayaLabel:
          safeMeta.wilayas.find((option) => option.code === values.wilayaCode)?.label ??
          values.wilayaCode,
      });

      setSubmitSuccess(copy.success);
    } catch (error) {
      const payload = error as Partial<ApiErrorPayload>;
      const fieldErrors =
        payload.fieldErrors ??
        payload.errors ??
        (payload.details &&
        typeof payload.details === "object" &&
        !Array.isArray(payload.details)
          ? (payload.details as Record<string, string | string[]>)
          : undefined);

      if (payload.status === 422 && fieldErrors) {
        for (const [field, message] of Object.entries(fieldErrors)) {
          const normalizedMessage = Array.isArray(message) ? message[0] : message;

          if (typeof normalizedMessage !== "string") {
            continue;
          }

          if (field in form.getValues()) {
            form.setError(field as keyof AppointmentFormValues, {
              message: normalizedMessage,
            });
          }
        }

        setSubmitError(
          payload.message ?? copy.validationError,
        );
        return;
      }

      if (payload.status === 409) {
        const appointmentTimeMessage = fieldErrors?.appointmentTime;
        const normalizedMessage = Array.isArray(appointmentTimeMessage)
          ? appointmentTimeMessage[0]
          : appointmentTimeMessage;

        if (typeof normalizedMessage === "string") {
          form.setError("appointmentTime", {
            message: normalizedMessage,
          });
        }

        setSubmitError(copy.conflictError);
        return;
      }

      if (payload.status === 500) {
        setSubmitError(copy.serverError);
        return;
      }

      setSubmitError(payload.message ?? copy.networkError);
    }
  });

  if (!isUnlocked) {
    return (
      <EligibilityGate
        value={gate}
        onChange={setGate}
        onContinue={() => {
          setIsUnlocked(true);
        }}
      />
    );
  }

  return (
    <form className="space-y-8" onSubmit={onSubmit} noValidate>
      <AppointmentFormSection step={1} title="Informations personnelles">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nom" error={form.formState.errors.lastName?.message}>
            <input
              {...form.register("lastName")}
              className={inputClassName}
              placeholder="Votre nom"
            />
          </Field>

          <Field label="Prénom" error={form.formState.errors.firstName?.message}>
            <input
              {...form.register("firstName")}
              className={inputClassName}
              placeholder="Votre prénom"
            />
          </Field>

          <Field
            label="Date de naissance"
            error={form.formState.errors.birthDate?.message}
          >
            <input
              {...form.register("birthDate")}
              type="date"
              className={inputClassName}
            />
          </Field>

          <Field label="Sexe" error={form.formState.errors.gender?.message}>
            <select {...form.register("gender")} className={inputClassName}>
              {safeMeta.genders.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Téléphone"
            error={form.formState.errors.phone?.message}
          >
            <input
              {...form.register("phone")}
              type="tel"
              className={inputClassName}
              placeholder="+213 ..."
            />
          </Field>

          <Field label="E-mail" error={form.formState.errors.email?.message}>
            <input
              {...form.register("email")}
              type="email"
              className={inputClassName}
              placeholder="nom@exemple.com"
            />
          </Field>

          <Field label="Wilaya" error={form.formState.errors.wilayaCode?.message}>
            <select {...form.register("wilayaCode")} className={inputClassName}>
              <option value="">Sélectionner une wilaya</option>
              {safeMeta.wilayas.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Commune" error={form.formState.errors.commune?.message}>
            <select
              {...form.register("commune")}
              className={inputClassName}
              disabled={communeOptions.length === 0}
            >
              <option value="">
                {communeOptions.length === 0
                  ? "Choisissez d'abord une wilaya"
                  : "Sélectionner une commune"}
              </option>
              {communeOptions.map((commune) => (
                <option key={commune} value={commune}>
                  {commune}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </AppointmentFormSection>

      <AppointmentFormSection step={2} title="Rendez-vous">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Campagne"
            hint="Optionnel, si vous venez dans le cadre d'une campagne ciblée."
          >
            <select {...form.register("campaignCode")} className={inputClassName}>
              {campaignOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="hidden sm:block" />

          <Field
            label="Date de rendez-vous"
            error={form.formState.errors.appointmentDate?.message}
          >
            <input
              {...form.register("appointmentDate")}
              type="date"
              className={inputClassName}
            />
          </Field>

          <Field
            label="Heure de rendez-vous"
            error={form.formState.errors.appointmentTime?.message}
            hint={
              !selectedAppointmentDate
                ? "Choisissez d'abord une date."
                : slotsLoading
                  ? "Chargement des créneaux..."
                  : slotsError
                    ? slotsError
                    : availableSlotOptions.length === 0
                      ? "Aucun créneau disponible pour cette date."
                      : undefined
            }
          >
            <select
              {...form.register("appointmentTime")}
              className={inputClassName}
              disabled={
                !selectedAppointmentDate ||
                slotsLoading ||
                !!slotsError ||
                availableSlotOptions.length === 0
              }
            >
              <option value="">
                {!selectedAppointmentDate
                  ? "Choisissez d'abord une date"
                  : slotsLoading
                    ? "Chargement des créneaux..."
                    : slotsError
                      ? "Créneaux indisponibles"
                      : availableSlotOptions.length === 0
                        ? "Aucun créneau disponible"
                        : "Sélectionner un créneau"}
              </option>
              {availableSlotOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </AppointmentFormSection>

      <AppointmentFormSection step={3} title="Type de don">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Groupe sanguin"
            error={form.formState.errors.bloodGroup?.message}
          >
            <select {...form.register("bloodGroup")} className={inputClassName}>
              <option value="">Sélectionner un groupe</option>
              {safeMeta.bloodGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Type de don"
            error={form.formState.errors.donationType?.message}
          >
            <select {...form.register("donationType")} className={inputClassName}>
              <option value="">Sélectionner un type de don</option>
              {safeMeta.donationTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </AppointmentFormSection>

      <AppointmentFormSection step={4} title="Déjà donneur">
        <div className="grid gap-6">
          <Field
            label="Avez-vous déjà donné votre sang ?"
            error={form.formState.errors.isExistingDonor?.message}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <input
                  type="radio"
                  checked={form.watch("isExistingDonor") === true}
                  onChange={() =>
                    form.setValue("isExistingDonor", true, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className="h-4 w-4 text-brand-red focus:ring-brand-red"
                />
                <span className="font-medium text-slate-700">Oui</span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <input
                  type="radio"
                  checked={form.watch("isExistingDonor") === false}
                  onChange={() => {
                    form.setValue("isExistingDonor", false, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    form.setValue("lastDonationDate", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    form.clearErrors("lastDonationDate");
                  }}
                  className="h-4 w-4 text-brand-red focus:ring-brand-red"
                />
                <span className="font-medium text-slate-700">Non</span>
              </label>
            </div>
          </Field>

          {isExistingDonor ? (
            <Field
              label="Date du dernier don"
              error={form.formState.errors.lastDonationDate?.message}
            >
              <input
                {...form.register("lastDonationDate")}
                type="date"
                className={inputClassName}
              />
            </Field>
          ) : null}
        </div>
      </AppointmentFormSection>

      <AppointmentFormSection
        step={5}
        title="Remarques ou besoins particuliers"
      >
        <Field
          label="Remarques"
          hint="Optionnel, pour signaler une contrainte particulière ou une information utile."
          error={form.formState.errors.remarks?.message}
        >
          <textarea
            {...form.register("remarks")}
            className={textareaClassName}
            placeholder="Votre message"
          />
        </Field>
      </AppointmentFormSection>

      <div className="rounded-[1.75rem] bg-white px-8 py-8 text-center shadow-soft">
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="inline-flex items-center justify-center rounded-2xl bg-brand-red px-8 py-4 text-base font-semibold text-white shadow-soft transition hover:bg-brand-dark"
        >
          {form.formState.isSubmitting
            ? "Envoi en cours..."
            : "Envoyer ma demande"}
        </button>

        <p className="mt-4 text-sm leading-7 text-slate-500">
          Le formulaire est prêt pour le branchement backend et gère déjà les
          retours d&apos;erreur API.
        </p>

        {submitSuccess ? (
          <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 px-5 py-4 text-left text-sm leading-7 text-green-800">
            {submitSuccess}
          </div>
        ) : null}

        {submitError ? (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-left text-sm leading-7 text-red-700">
            {submitError}
          </div>
        ) : null}
      </div>
    </form>
  );
}
