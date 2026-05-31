import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  Clock3,
  CopyPlus,
  Flag,
  PencilLine,
  Plus,
  Lock,
  RefreshCcw,
  Trash2,
  Rows3,
  Users,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { AdminConfirmDialog } from "@/components/admin/shared/AdminConfirmDialog";
import { useAdminAuth, isUnauthorizedAdminError } from "@/features/admin-auth/AdminAuthProvider";
import {
  closeAdminCalendarDay,
  createAdminCalendarSlot,
  getAdminCalendarDay,
  getAdminCalendarMonth,
  listAdminCalendarTemplates,
  replaceAdminCalendarTemplates,
  reopenAdminCalendarDay,
  updateAdminCalendarSlot,
  type AdminCalendarDaySlot,
  type AdminCalendarTemplateItem,
} from "@/lib/api/adminCalendarApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const copy = {
  title: "Calendrier",
  description:
    "Lecture mensuelle des disponibilités, des rendez-vous et des créneaux configurés.",
  monthCard: "Vue mensuelle",
  dayCard: "Détail de la journée",
  templatesCard: "Règles hebdomadaires",
  editTemplates: "Modifier les règles",
  templatesSheetTitle: "Règles hebdomadaires",
  templatesSheetDescription:
    "Définissez les créneaux récurrents par jour de semaine pour alimenter la réservation publique.",
  addTemplateRow: "Ajouter une règle",
  templatesSaved: "Règles hebdomadaires enregistrées.",
  templatesMutationError: "Impossible d'enregistrer les règles hebdomadaires.",
  templatePreviewLabel: "Aperçu des créneaux générés",
  templatePreviewCount: "créneaux générés",
  templatePreviewInvalid:
    "La plage horaire doit produire au moins un créneau valide.",
  recurrencePresetsLabel: "Raccourcis",
  presetWeekdays: "Lun-Ven",
  presetWeekend: "Week-end",
  presetEveryday: "Tous les jours",
  weekdayLabel: "Jour",
  manualDaysLabel: "Sélection manuelle",
  selectedDaysLabel: "Jours sélectionnés",
  templateTimeLabel: "Heure du créneau",
  templateCapacityLabel: "Capacité hebdomadaire",
  templateStatusLabel: "Disponibilité",
  templateStatusActive: "Active",
  templateStatusInactive: "Inactive",
  refresh: "Rafraîchir",
  noSlots: "Aucun créneau configuré pour cette date.",
  loadError: "Impossible de charger le calendrier admin.",
  loadErrorDescription:
    "Vérifiez la session admin ou la disponibilité de l'API puis relancez le chargement.",
  selectedDay: "Date sélectionnée",
  totalSlots: "Créneaux",
  appointments: "Demandes",
  openSlots: "Ouverts",
  fullSlots: "Complets",
  blockedSlots: "Bloqués",
  closedSlots: "Fermés",
  slotTime: "Heure",
  slotStatus: "Statut",
  slotCapacity: "Capacité",
  slotReserved: "Réservés",
  slotRemaining: "Restant",
  slotSource: "Source",
  slotReason: "Motif",
  sourceTemplate: "Modèle",
  sourceOverride: "Exception",
  emptyTemplates: "Aucun modèle hebdomadaire n'est encore configuré.",
  templateDaysLabel: "Jours",
  templateStartTimeLabel: "Heure du créneau",
  templateEndTimeLabel: "Heure de fin",
  templateIntervalLabel: "Intervalle",
  legendAvailable: "Disponibilités",
  legendFull: "Jour saturé",
  legendClosed: "Jour fermé",
  addSlot: "Ajouter un créneau",
  editSlot: "Modifier",
  closeDay: "Fermer la journée",
  markDayOff: "Jour off",
  markHoliday: "Jour férié",
  reopenDay: "Réouvrir la journée",
  closeDayTitle: "Confirmer la fermeture",
  closeDayDescription:
    "Tous les créneaux de cette journée seront fermés pour la réservation publique.",
  closeDayOffTitle: "Marquer comme jour off",
  closeDayOffDescription:
    "Cette date sera fermée comme jour off côté public.",
  closeHolidayTitle: "Marquer comme jour férié",
  closeHolidayDescription:
    "Cette date sera fermée comme jour férié côté public.",
  closeDayAction: "Fermer la journée",
  closeDayOffAction: "Marquer off",
  closeHolidayAction: "Marquer férié",
  reopenDayTitle: "Réouvrir la journée",
  reopenDayDescription:
    "Les fermetures exceptionnelles de cette journée seront retirées.",
  reopenDayAction: "Réouvrir",
  slotSheetCreateTitle: "Ajouter un créneau",
  slotSheetEditTitle: "Modifier le créneau",
  slotSheetDescription:
    "Ajustez l'heure, la capacité et l'état du créneau pour cette date.",
  saveSlot: "Enregistrer",
  slotMutationError: "Impossible d'enregistrer ce créneau.",
  dayMutationError: "Impossible de mettre à jour cette journée.",
  slotSaved: "Créneau enregistré.",
  dayClosedSuccess: "Journée fermée.",
  dayReopenedSuccess: "Journée réouverte.",
  statusLabel: "État",
  reasonLabel: "Motif",
  saveBlockedTitle: "Confirmer le blocage du créneau",
  saveBlockedDescription:
    "Ce créneau ne sera plus réservable côté public tant qu'il restera bloqué ou fermé.",
  saveBlockedAction: "Confirmer",
  slotStatusOpen: "Ouvert",
  slotStatusFull: "Complet",
  slotStatusBlocked: "Bloqué",
  slotStatusClosed: "Fermé",
  dayOffBadge: "Jour off",
  holidayBadge: "Jour férié",
  genericClosedBadge: "Fermé",
} as const;

const weekdayLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"] as const;

const quarterHourOptions = Array.from({ length: 24 * 4 }, (_, index) => {
  const hours = Math.floor(index / 4);
  const minutes = (index % 4) * 15;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function parseDateKey(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  return hours * 60 + minutes;
}

function generateTemplatePreviewSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: 15 | 30 | 45 | 60,
) {
  if (!startTime || !endTime) {
    return [];
  }

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return [];
  }

  const values: string[] = [];

  for (let cursor = start; cursor < end; cursor += intervalMinutes) {
    const hours = Math.floor(cursor / 60);
    const minutes = cursor % 60;
    values.push(
      `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    );
  }

  return values;
}

function applyTemplateDaysPreset(
  preset: "weekdays" | "weekend" | "everyday",
): string[] {
  if (preset === "weekdays") {
    return ["1", "2", "3", "4", "5"];
  }

  if (preset === "weekend") {
    return ["0", "6"];
  }

  return ["0", "1", "2", "3", "4", "5", "6"];
}

function getSlotStatusBadge(slot: AdminCalendarDaySlot) {
  const variants = {
    open: "bg-emerald-50 text-emerald-700 border-emerald-100",
    full: "bg-amber-50 text-amber-700 border-amber-100",
    blocked: "bg-red-50 text-red-700 border-red-100",
    closed: "bg-slate-100 text-slate-600 border-slate-200",
  } as const;

  const labels = {
    open: "Ouvert",
    full: "Complet",
    blocked: "Bloqué",
    closed: "Fermé",
  } as const;

  return (
    <Badge className={variants[slot.status]} variant="outline">
      {labels[slot.status]}
    </Badge>
  );
}

function formatWeekdayList(daysOfWeek: number[]) {
  return [...daysOfWeek]
    .sort((left, right) => left - right)
    .map((day) => weekdayLabels[day] ?? String(day))
    .join(", ");
}

type SlotEditorState = {
  mode: "create" | "edit";
  id?: string | null;
  date: string;
  time: string;
  capacity: string;
  status: "open" | "full" | "closed" | "blocked";
  reason: string;
};

type TemplateEditorRow = {
  id: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  intervalMinutes: "15" | "30" | "45" | "60";
  capacity: string;
  isActive: boolean;
  donationTypes: Array<"whole_blood" | "plasma" | "platelets">;
};

function createSlotEditorState(date: string): SlotEditorState {
  return {
    mode: "create",
    date,
    time: "08:00",
    capacity: "1",
    status: "open",
    reason: "",
  };
}

function createSlotEditorStateFromSlot(
  date: string,
  slot: AdminCalendarDaySlot,
): SlotEditorState {
  return {
    mode: "edit",
    id: slot.overrideId,
    date,
    time: slot.value,
    capacity: String(slot.capacity),
    status: slot.status,
    reason: slot.reason ?? "",
  };
}

function createTemplateEditorRow(
  item?: AdminCalendarTemplateItem,
): TemplateEditorRow {
  return {
    id: item?.id ?? `draft-${Math.random().toString(36).slice(2, 10)}`,
    daysOfWeek: (item?.daysOfWeek?.length ? item.daysOfWeek : [1]).map(String),
    startTime: item?.startTime ?? "08:00",
    endTime: item?.endTime ?? "12:00",
    intervalMinutes: String(item?.intervalMinutes ?? 15) as
      | "15"
      | "30"
      | "45"
      | "60",
    capacity: String(item?.capacity ?? 1),
    isActive: item?.isActive ?? true,
    donationTypes: item?.donationTypes?.length
      ? item.donationTypes
      : ["whole_blood"],
  };
}

export function AdminCalendarPage() {
  const { token, logout } = useAdminAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  const [monthData, setMonthData] = useState<Awaited<
    ReturnType<typeof getAdminCalendarMonth>
  > | null>(null);
  const [dayData, setDayData] = useState<Awaited<ReturnType<typeof getAdminCalendarDay>> | null>(
    null,
  );
  const [templates, setTemplates] = useState<AdminCalendarTemplateItem[]>([]);
  const [isLoadingMonth, setIsLoadingMonth] = useState(true);
  const [isLoadingDay, setIsLoadingDay] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [slotSheetOpen, setSlotSheetOpen] = useState(false);
  const [slotEditor, setSlotEditor] = useState<SlotEditorState>(
    createSlotEditorState(formatDateKey(new Date())),
  );
  const [isSubmittingSlot, setIsSubmittingSlot] = useState(false);
  const [closeDayDialogOpen, setCloseDayDialogOpen] = useState(false);
  const [reopenDayDialogOpen, setReopenDayDialogOpen] = useState(false);
  const [pendingDayClosureType, setPendingDayClosureType] = useState<
    "generic" | "day_off" | "holiday"
  >("generic");
  const [confirmSensitiveSlotOpen, setConfirmSensitiveSlotOpen] = useState(false);
  const [pendingSlotSubmit, setPendingSlotSubmit] = useState<SlotEditorState | null>(null);
  const [templatesSheetOpen, setTemplatesSheetOpen] = useState(false);
  const [templateEditorRows, setTemplateEditorRows] = useState<TemplateEditorRow[]>([]);
  const [isSubmittingTemplates, setIsSubmittingTemplates] = useState(false);

  const monthKey = formatMonthKey(visibleMonth);
  const selectedDateKey = formatDateKey(selectedDate);

  async function loadMonth() {
    if (!token) {
      setErrorMessage(copy.loadError);
      setIsLoadingMonth(false);
      return;
    }

    setIsLoadingMonth(true);
    setErrorMessage(null);

    try {
      const data = await getAdminCalendarMonth(token, monthKey);
      setMonthData(data);
    } catch (error) {
      if (isUnauthorizedAdminError(error)) {
        await logout();
        return;
      }

      setErrorMessage(copy.loadError);
      setMonthData(null);
    } finally {
      setIsLoadingMonth(false);
    }
  }

  async function loadDay() {
    if (!token) {
      setErrorMessage(copy.loadError);
      setIsLoadingDay(false);
      return;
    }

    setIsLoadingDay(true);

    try {
      const data = await getAdminCalendarDay(token, selectedDateKey);
      setDayData(data);
    } catch (error) {
      if (isUnauthorizedAdminError(error)) {
        await logout();
        return;
      }

      setErrorMessage(copy.loadError);
      setDayData(null);
    } finally {
      setIsLoadingDay(false);
    }
  }

  async function loadTemplates() {
    if (!token) {
      setErrorMessage(copy.loadError);
      setIsLoadingTemplates(false);
      return;
    }

    setIsLoadingTemplates(true);

    try {
      const data = await listAdminCalendarTemplates(token);
      setTemplates(data);
    } catch (error) {
      if (isUnauthorizedAdminError(error)) {
        await logout();
        return;
      }

      setErrorMessage(copy.loadError);
      setTemplates([]);
    } finally {
      setIsLoadingTemplates(false);
    }
  }

  useEffect(() => {
    void loadMonth();
  }, [token, monthKey]);

  useEffect(() => {
    void loadDay();
  }, [token, selectedDateKey]);

  useEffect(() => {
    void loadTemplates();
  }, [token]);

  const dayStatusMap = useMemo(() => {
    return new Map((monthData?.days ?? []).map((day) => [day.date, day.status]));
  }, [monthData]);

  const modifiers = useMemo(() => {
    const available: Date[] = [];
    const full: Date[] = [];
    const closed: Date[] = [];

    for (const [date, status] of dayStatusMap.entries()) {
      const parsedDate = parseDateKey(date);

      if (status === "available") {
        available.push(parsedDate);
      } else if (status === "full") {
        full.push(parsedDate);
      } else if (status === "closed") {
        closed.push(parsedDate);
      }
    }

    return {
      available,
      full,
      closed,
    };
  }, [dayStatusMap]);

  const isSelectedDayClosed = useMemo(() => {
    if (!dayData) {
      return false;
    }

    return (
      dayData.summary.totalSlots > 0 &&
      dayData.summary.closedSlots === dayData.summary.totalSlots
    );
  }, [dayData]);

  const monthLegendCounts = useMemo(() => {
    const values = monthData?.days ?? [];

    return {
      available: values.filter((day) => day.status === "available").length,
      full: values.filter((day) => day.status === "full").length,
      closed: values.filter((day) => day.status === "closed").length,
    };
  }, [monthData]);

  if (
    errorMessage &&
    !isLoadingMonth &&
    !isLoadingDay &&
    !isLoadingTemplates &&
    !monthData &&
    !dayData
  ) {
    return (
      <div className="flex flex-col gap-6">
        <AdminPageHeader title={copy.title} description={copy.description} />
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardContent className="flex flex-col items-start gap-4 p-6">
            <p className="text-base font-semibold text-slate-950">{copy.loadError}</p>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              {copy.loadErrorDescription}
            </p>
            <Button
              type="button"
              onClick={() => {
                void Promise.all([loadMonth(), loadDay(), loadTemplates()]);
              }}
              className="rounded-2xl bg-brand-red text-white hover:bg-brand-dark"
            >
              <RefreshCcw data-icon="inline-start" />
              {copy.refresh}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  function updateSlotEditor(patch: Partial<SlotEditorState>) {
    setSlotEditor((current) => ({
      ...current,
      ...patch,
    }));
  }

  function openCreateSlotSheet() {
    setFeedback(null);
    setSlotEditor(createSlotEditorState(selectedDateKey));
    setSlotSheetOpen(true);
  }

  function openTemplatesSheet() {
    setFeedback(null);
    setTemplateEditorRows(
      templates.length > 0 ? templates.map(createTemplateEditorRow) : [createTemplateEditorRow()],
    );
    setTemplatesSheetOpen(true);
  }

  function openEditSlotSheet(slot: AdminCalendarDaySlot) {
    setFeedback(null);
    setSlotEditor(createSlotEditorStateFromSlot(selectedDateKey, slot));
    setSlotSheetOpen(true);
  }

  async function refreshCalendarViews() {
    await Promise.all([loadMonth(), loadDay()]);
  }

  function updateTemplateEditorRow(
    rowId: string,
    patch: Partial<TemplateEditorRow>,
  ) {
    setTemplateEditorRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    );
  }

  function removeTemplateEditorRow(rowId: string) {
    setTemplateEditorRows((current) =>
      current.length === 1 ? current : current.filter((row) => row.id !== rowId),
    );
  }

  function addTemplateEditorRow() {
    setTemplateEditorRows((current) => [...current, createTemplateEditorRow()]);
  }

  async function persistSlotMutation(nextState: SlotEditorState) {
    if (!token) {
      return;
    }

    setIsSubmittingSlot(true);
    setFeedback(null);

    try {
      const payload = {
        date: nextState.date,
        time: nextState.time,
        capacity: Number(nextState.capacity),
        status: nextState.status,
        reason: nextState.reason.trim() || undefined,
      } as const;

      if (nextState.mode === "edit" && nextState.id) {
        await updateAdminCalendarSlot(token, nextState.id, {
          time: payload.time,
          capacity: payload.capacity,
          status: payload.status,
          reason: payload.reason,
        });
      } else {
        await createAdminCalendarSlot(token, payload);
      }

      setFeedback(copy.slotSaved);
      setSlotSheetOpen(false);
      setPendingSlotSubmit(null);
      await refreshCalendarViews();
    } catch (error) {
      if (isUnauthorizedAdminError(error)) {
        await logout();
        return;
      }

      setFeedback(
        typeof error === "object" && error && "message" in error && typeof error.message === "string"
          ? error.message
          : copy.slotMutationError,
      );
    } finally {
      setIsSubmittingSlot(false);
      setConfirmSensitiveSlotOpen(false);
    }
  }

  async function handleSlotSubmit() {
    const nextState = {
      ...slotEditor,
      time: slotEditor.time.trim(),
      capacity: String(Math.max(0, Number(slotEditor.capacity) || 0)),
      reason: slotEditor.reason.trim(),
    };

    if (nextState.status === "blocked" || nextState.status === "closed") {
      setPendingSlotSubmit(nextState);
      setConfirmSensitiveSlotOpen(true);
      return;
    }

    await persistSlotMutation(nextState);
  }

  async function handleCloseDay() {
    if (!token) {
      return;
    }

    setFeedback(null);

    try {
      await closeAdminCalendarDay(token, {
        date: selectedDateKey,
        reason:
          pendingDayClosureType === "holiday"
            ? "Jour férié"
            : pendingDayClosureType === "day_off"
              ? "Jour off"
              : undefined,
        closureType: pendingDayClosureType,
      });
      setCloseDayDialogOpen(false);
      setFeedback(copy.dayClosedSuccess);
      await refreshCalendarViews();
    } catch (error) {
      if (isUnauthorizedAdminError(error)) {
        await logout();
        return;
      }

      setFeedback(copy.dayMutationError);
    }
  }

  async function handleReopenDay() {
    if (!token) {
      return;
    }

    setFeedback(null);

    try {
      await reopenAdminCalendarDay(token, { date: selectedDateKey });
      setReopenDayDialogOpen(false);
      setFeedback(copy.dayReopenedSuccess);
      await refreshCalendarViews();
    } catch (error) {
      if (isUnauthorizedAdminError(error)) {
        await logout();
        return;
      }

      setFeedback(copy.dayMutationError);
    }
  }

  async function handleSaveTemplates() {
    if (!token) {
      return;
    }

    setIsSubmittingTemplates(true);
    setFeedback(null);

    try {
      const items = templateEditorRows.map((row) => ({
        daysOfWeek: row.daysOfWeek.map(Number).sort((left, right) => left - right),
        startTime: row.startTime.trim(),
        endTime: row.endTime.trim(),
        intervalMinutes: Number(row.intervalMinutes) as 15 | 30 | 45 | 60,
        capacity: Math.max(1, Number(row.capacity) || 1),
        isActive: row.isActive,
        donationTypes: row.donationTypes,
      }));

      const data = await replaceAdminCalendarTemplates(token, items);
      setTemplates(data);
      setTemplatesSheetOpen(false);
      setFeedback(copy.templatesSaved);
      await refreshCalendarViews();
    } catch (error) {
      if (isUnauthorizedAdminError(error)) {
        await logout();
        return;
      }

      setFeedback(copy.templatesMutationError);
    } finally {
      setIsSubmittingTemplates(false);
    }
  }

  const closeDayDialogCopy =
    pendingDayClosureType === "holiday"
      ? {
          title: copy.closeHolidayTitle,
          description: copy.closeHolidayDescription,
          action: copy.closeHolidayAction,
        }
      : pendingDayClosureType === "day_off"
        ? {
            title: copy.closeDayOffTitle,
            description: copy.closeDayOffDescription,
            action: copy.closeDayOffAction,
          }
        : {
            title: copy.closeDayTitle,
            description: copy.closeDayDescription,
            action: copy.closeDayAction,
          };

  return (
    <div className="flex flex-col gap-6">
      <AdminConfirmDialog
        open={closeDayDialogOpen}
        onOpenChange={setCloseDayDialogOpen}
        title={closeDayDialogCopy.title}
        description={closeDayDialogCopy.description}
        actionLabel={closeDayDialogCopy.action}
        actionVariant="destructive"
        onConfirm={handleCloseDay}
      />
      <AdminConfirmDialog
        open={reopenDayDialogOpen}
        onOpenChange={setReopenDayDialogOpen}
        title={copy.reopenDayTitle}
        description={copy.reopenDayDescription}
        actionLabel={copy.reopenDayAction}
        onConfirm={handleReopenDay}
      />
      <AdminConfirmDialog
        open={confirmSensitiveSlotOpen}
        onOpenChange={setConfirmSensitiveSlotOpen}
        title={copy.saveBlockedTitle}
        description={copy.saveBlockedDescription}
        actionLabel={copy.saveBlockedAction}
        actionVariant="destructive"
        isSubmitting={isSubmittingSlot}
        onConfirm={async () => {
          if (pendingSlotSubmit) {
            await persistSlotMutation(pendingSlotSubmit);
          }
        }}
      />
      <Sheet open={slotSheetOpen} onOpenChange={setSlotSheetOpen}>
        <SheetContent side="right" className="w-full max-w-lg border-slate-200 bg-white">
          <SheetHeader className="border-b border-slate-200">
            <SheetTitle>
              {slotEditor.mode === "create"
                ? copy.slotSheetCreateTitle
                : copy.slotSheetEditTitle}
            </SheetTitle>
            <SheetDescription>{copy.slotSheetDescription}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto p-4">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="calendar-slot-date" className="text-sm font-medium text-slate-700">
                  {copy.selectedDay}
                </label>
                <Input
                  id="calendar-slot-date"
                  value={slotEditor.date}
                  disabled
                  className="h-11 rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="calendar-slot-time" className="text-sm font-medium text-slate-700">
                  {copy.slotTime}
                </label>
                <Input
                  id="calendar-slot-time"
                  type="time"
                  value={slotEditor.time}
                  onChange={(event) => {
                    updateSlotEditor({ time: event.target.value });
                  }}
                  className="h-11 rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="calendar-slot-capacity"
                  className="text-sm font-medium text-slate-700"
                >
                  {copy.slotCapacity}
                </label>
                <Input
                  id="calendar-slot-capacity"
                  type="number"
                  min={0}
                  value={slotEditor.capacity}
                  onChange={(event) => {
                    updateSlotEditor({ capacity: event.target.value });
                  }}
                  className="h-11 rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="calendar-slot-status-trigger"
                  className="text-sm font-medium text-slate-700"
                >
                  {copy.statusLabel}
                </label>
                <Select
                  value={slotEditor.status}
                  onValueChange={(value) => {
                    updateSlotEditor({
                      status: value as SlotEditorState["status"],
                    });
                  }}
                >
                  <SelectTrigger
                    id="calendar-slot-status-trigger"
                    className="h-11 rounded-2xl"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">{copy.slotStatusOpen}</SelectItem>
                    <SelectItem value="full">{copy.slotStatusFull}</SelectItem>
                    <SelectItem value="blocked">{copy.slotStatusBlocked}</SelectItem>
                    <SelectItem value="closed">{copy.slotStatusClosed}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="calendar-slot-reason" className="text-sm font-medium text-slate-700">
                {copy.reasonLabel}
              </label>
              <Input
                id="calendar-slot-reason"
                value={slotEditor.reason}
                onChange={(event) => {
                  updateSlotEditor({ reason: event.target.value });
                }}
                placeholder="Maintenance, pause équipe, ouverture spéciale..."
                className="h-11 rounded-2xl"
              />
            </div>
          </div>

          <SheetFooter className="border-t border-slate-200 bg-slate-50/60">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => {
                setSlotSheetOpen(false);
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              className="rounded-2xl bg-brand-red text-white hover:bg-brand-dark"
              disabled={isSubmittingSlot}
              onClick={() => {
                void handleSlotSubmit();
              }}
            >
              <CalendarClock data-icon="inline-start" />
              {copy.saveSlot}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Dialog open={templatesSheetOpen} onOpenChange={setTemplatesSheetOpen}>
        <DialogContent className="top-0 left-0 h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none border-slate-200 bg-white p-0 sm:top-[50%] sm:left-[50%] sm:h-auto sm:max-h-[88vh] sm:w-[calc(100%-3rem)] sm:max-w-6xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl">
          <DialogHeader className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <DialogTitle>{copy.templatesSheetTitle}</DialogTitle>
            <DialogDescription>{copy.templatesSheetDescription}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-slate-900">
                  {templateEditorRows.length} règle{templateEditorRows.length > 1 ? "s" : ""}
                </p>
                <p className="text-sm text-slate-500">
                  Configure les jours, horaires, capacités et états de publication.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={addTemplateEditorRow}
              >
                <CopyPlus data-icon="inline-start" />
                {copy.addTemplateRow}
              </Button>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              {templateEditorRows.map((row, index) => (
                <div
                  key={row.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Règle {index + 1}
                      </p>
                      <p className="text-xs text-slate-500">
                        Créneau récurrent hebdomadaire
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-2xl text-slate-500 hover:text-red-600"
                      onClick={() => {
                        removeTemplateEditorRow(row.id);
                      }}
                      disabled={templateEditorRows.length === 1}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Supprimer la règle</span>
                    </Button>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-slate-700">
                            {copy.templateDaysLabel}
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              onClick={() => {
                                updateTemplateEditorRow(row.id, {
                                  daysOfWeek: applyTemplateDaysPreset("weekdays"),
                                });
                              }}
                            >
                              {copy.presetWeekdays}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              onClick={() => {
                                updateTemplateEditorRow(row.id, {
                                  daysOfWeek: applyTemplateDaysPreset("weekend"),
                                });
                              }}
                            >
                              {copy.presetWeekend}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              onClick={() => {
                                updateTemplateEditorRow(row.id, {
                                  daysOfWeek: applyTemplateDaysPreset("everyday"),
                                });
                              }}
                            >
                              {copy.presetEveryday}
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                            {copy.manualDaysLabel}
                          </p>
                          <ToggleGroup
                            type="multiple"
                            variant="outline"
                            size="sm"
                            className="mt-3 flex w-full flex-wrap gap-2"
                            value={row.daysOfWeek}
                            onValueChange={(value) => {
                              updateTemplateEditorRow(row.id, {
                                daysOfWeek: value.length > 0 ? value : row.daysOfWeek,
                              });
                            }}
                          >
                            {weekdayLabels.map((label, index) => (
                              <ToggleGroupItem
                                key={label}
                                value={String(index)}
                                className="min-w-14 rounded-xl text-sm"
                              >
                                {label}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {copy.selectedDaysLabel}
                            </span>
                            <Badge
                              variant="outline"
                              className="rounded-full border-slate-200 bg-white text-slate-700"
                            >
                              {formatWeekdayList(row.daysOfWeek.map(Number))}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor={`template-time-${row.id}`}
                            className="text-sm font-medium text-slate-700"
                          >
                            {copy.templateStartTimeLabel}
                          </label>
                          <Select
                            value={row.startTime}
                            onValueChange={(value) => {
                              updateTemplateEditorRow(row.id, { startTime: value });
                            }}
                          >
                            <SelectTrigger
                              id={`template-time-${row.id}`}
                              aria-label={copy.templateStartTimeLabel}
                              className="h-11 rounded-2xl"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {quarterHourOptions.map((value) => (
                                <SelectItem key={value} value={value}>
                                  {value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor={`template-end-time-${row.id}`}
                            className="text-sm font-medium text-slate-700"
                          >
                            {copy.templateEndTimeLabel}
                          </label>
                          <Select
                            value={row.endTime}
                            onValueChange={(value) => {
                              updateTemplateEditorRow(row.id, { endTime: value });
                            }}
                          >
                            <SelectTrigger
                              id={`template-end-time-${row.id}`}
                              aria-label={copy.templateEndTimeLabel}
                              className="h-11 rounded-2xl"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {quarterHourOptions.map((value) => (
                                <SelectItem key={value} value={value}>
                                  {value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-slate-700">
                            {copy.templateIntervalLabel}
                          </label>
                          <Select
                            value={row.intervalMinutes}
                            onValueChange={(value) => {
                              updateTemplateEditorRow(row.id, {
                                intervalMinutes: value as TemplateEditorRow["intervalMinutes"],
                              });
                            }}
                          >
                            <SelectTrigger
                              aria-label={copy.templateIntervalLabel}
                              className="h-11 rounded-2xl"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 min</SelectItem>
                              <SelectItem value="30">30 min</SelectItem>
                              <SelectItem value="45">45 min</SelectItem>
                              <SelectItem value="60">60 min</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor={`template-capacity-${row.id}`}
                            className="text-sm font-medium text-slate-700"
                          >
                            {copy.templateCapacityLabel}
                          </label>
                          <Input
                            id={`template-capacity-${row.id}`}
                            aria-label={copy.templateCapacityLabel}
                            type="number"
                            min={1}
                            value={row.capacity}
                            onChange={(event) => {
                              updateTemplateEditorRow(row.id, { capacity: event.target.value });
                            }}
                            className="h-11 rounded-2xl"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-slate-700">
                            {copy.templateStatusLabel}
                          </label>
                          <Select
                            value={row.isActive ? "active" : "inactive"}
                            onValueChange={(value) => {
                              updateTemplateEditorRow(row.id, {
                                isActive: value === "active",
                              });
                            }}
                          >
                            <SelectTrigger className="h-11 rounded-2xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">{copy.templateStatusActive}</SelectItem>
                              <SelectItem value="inactive">{copy.templateStatusInactive}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    {(() => {
                      const previewSlots = generateTemplatePreviewSlots(
                        row.startTime,
                        row.endTime,
                        Number(row.intervalMinutes) as 15 | 30 | 45 | 60,
                      );

                      return (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium text-slate-900">
                              {copy.templatePreviewLabel}
                            </p>
                            <Badge
                              variant="outline"
                              className="rounded-full border-slate-200 bg-slate-50 text-slate-700"
                            >
                              {previewSlots.length} {copy.templatePreviewCount}
                            </Badge>
                          </div>

                          {previewSlots.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {previewSlots.map((value) => (
                                <Badge
                                  key={`${row.id}-${value}`}
                                  variant="outline"
                                  className="rounded-full border-slate-200 bg-white text-slate-700"
                                >
                                  {value}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-red-600">
                              {copy.templatePreviewInvalid}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="border-t border-slate-200 bg-slate-50/60 px-5 py-4 sm:flex-row sm:px-6">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => {
                setTemplatesSheetOpen(false);
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              className="rounded-2xl bg-brand-red text-white hover:bg-brand-dark"
              disabled={isSubmittingTemplates}
              onClick={() => {
                void handleSaveTemplates();
              }}
            >
              <CalendarClock data-icon="inline-start" />
              {copy.saveSlot}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AdminPageHeader
        title={copy.title}
        description={copy.description}
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={() => {
              void Promise.all([loadMonth(), loadDay(), loadTemplates()]);
            }}
          >
            <RefreshCcw data-icon="inline-start" />
            {copy.refresh}
          </Button>
        }
      />

      {feedback ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base text-slate-950">{copy.monthCard}</CardTitle>
            <p className="text-sm text-slate-500">
              {copy.selectedDay} : <span className="font-medium text-slate-700">{selectedDateKey}</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoadingMonth ? (
              <div className="space-y-4">
                <Skeleton className="h-[320px] w-full rounded-3xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/40 p-3">
                  <Calendar
                    mode="single"
                    month={visibleMonth}
                    selected={selectedDate}
                    onMonthChange={setVisibleMonth}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                      }
                    }}
                    modifiers={modifiers}
                    modifiersClassNames={{
                      available:
                        "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                      full: "bg-amber-50 text-amber-700 hover:bg-amber-100",
                      closed:
                        "bg-slate-100 text-slate-500 hover:bg-slate-200",
                    }}
                    className="w-full"
                    classNames={{
                      root: "w-full",
                      month: "w-full",
                      month_grid: "w-full",
                    }}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">
                      {copy.legendAvailable}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-950">
                      {monthLegendCounts.available}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-700">
                      {copy.legendFull}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-amber-950">
                      {monthLegendCounts.full}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-600">
                      {copy.legendClosed}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {monthLegendCounts.closed}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base text-slate-950">{copy.dayCard}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-slate-500">{selectedDateKey}</p>
                    {dayData?.summary.dayClosureType ? (
                      <Badge
                        variant="outline"
                        className="rounded-full border-slate-200 bg-slate-100 text-slate-700"
                      >
                        {dayData.summary.dayClosureType === "holiday"
                          ? copy.holidayBadge
                          : dayData.summary.dayClosureType === "day_off"
                            ? copy.dayOffBadge
                            : copy.genericClosedBadge}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl"
                    onClick={openCreateSlotSheet}
                  >
                    <Plus data-icon="inline-start" />
                    {copy.addSlot}
                  </Button>
                  {isSelectedDayClosed ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => {
                        setReopenDayDialogOpen(true);
                      }}
                    >
                      <RefreshCcw data-icon="inline-start" />
                      {copy.reopenDay}
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => {
                          setPendingDayClosureType("day_off");
                          setCloseDayDialogOpen(true);
                        }}
                      >
                        <Lock data-icon="inline-start" />
                        {copy.markDayOff}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => {
                          setPendingDayClosureType("holiday");
                          setCloseDayDialogOpen(true);
                        }}
                      >
                        <Flag data-icon="inline-start" />
                        {copy.markHoliday}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {isLoadingDay ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[0, 1, 2, 3].map((index) => (
                      <Skeleton key={index} className="h-20 rounded-2xl" />
                    ))}
                  </div>
                  <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
              ) : dayData ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Rows3 className="size-4" />
                        <span className="text-xs uppercase tracking-[0.16em]">
                          {copy.totalSlots}
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {dayData.summary.totalSlots}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Users className="size-4" />
                        <span className="text-xs uppercase tracking-[0.16em]">
                          {copy.appointments}
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {dayData.summary.appointmentCount}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <CalendarDays className="size-4" />
                        <span className="text-xs uppercase tracking-[0.16em]">
                          {copy.openSlots}
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {dayData.summary.openSlots}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Lock className="size-4" />
                        <span className="text-xs uppercase tracking-[0.16em]">
                          {copy.closedSlots}
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {dayData.summary.closedSlots + dayData.summary.blockedSlots}
                      </p>
                    </div>
                  </div>

                  {dayData.slots.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-sm text-slate-500">
                      {copy.noSlots}
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{copy.slotTime}</TableHead>
                            <TableHead>{copy.slotStatus}</TableHead>
                            <TableHead>{copy.slotCapacity}</TableHead>
                            <TableHead>{copy.slotReserved}</TableHead>
                            <TableHead>{copy.slotRemaining}</TableHead>
                            <TableHead>{copy.slotSource}</TableHead>
                            <TableHead>{copy.slotReason}</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dayData.slots.map((slot) => (
                            <TableRow key={`${dayData.date}-${slot.value}`}>
                              <TableCell className="font-medium text-slate-950">
                                <div className="flex items-center gap-2">
                                  <Clock3 className="size-4 text-slate-400" />
                                  {slot.label}
                                </div>
                              </TableCell>
                              <TableCell>{getSlotStatusBadge(slot)}</TableCell>
                              <TableCell>{slot.capacity}</TableCell>
                              <TableCell>{slot.reservedCount}</TableCell>
                              <TableCell>{slot.remainingCapacity}</TableCell>
                              <TableCell>
                                {slot.source === "template"
                                  ? copy.sourceTemplate
                                  : copy.sourceOverride}
                              </TableCell>
                              <TableCell className="max-w-[180px] truncate text-slate-500">
                                {slot.reason ?? "—"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl"
                                  onClick={() => {
                                    openEditSlotSheet(slot);
                                  }}
                                >
                                  <PencilLine data-icon="inline-start" />
                                  {copy.editSlot}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-base text-slate-950">
                  {copy.templatesCard}
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Structure récurrente utilisée pour générer les créneaux publics.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={openTemplatesSheet}
              >
                <PencilLine data-icon="inline-start" />
                {copy.editTemplates}
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingTemplates ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((index) => (
                    <Skeleton key={index} className="h-16 rounded-2xl" />
                  ))}
                </div>
              ) : templates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-sm text-slate-500">
                  {copy.emptyTemplates}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-slate-950">
                        {formatWeekdayList(template.daysOfWeek)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className="rounded-full border-slate-200 bg-white text-slate-700"
                        >
                          {template.startTime} -&gt; {template.endTime}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="rounded-full border-slate-200 bg-white text-slate-700"
                        >
                          {template.intervalMinutes} min
                        </Badge>
                        <Badge
                          variant="outline"
                          className="rounded-full border-slate-200 bg-white text-slate-700"
                        >
                          cap. {template.capacity}
                        </Badge>
                        {!template.isActive ? (
                          <Badge
                            variant="outline"
                            className="rounded-full border-slate-200 bg-slate-100 text-slate-600"
                          >
                            inactive
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
