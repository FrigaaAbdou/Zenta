import { apiRequest } from "@/lib/api/client";

export type AdminDashboardStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "completed"
  | "cancelled";

export type AdminDashboardAppointment = {
  id: string;
  donor: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    bloodGroup: string;
  };
  campaignCode: string | null;
  appointmentDate: string;
  appointmentTime: string;
  donationType: string;
  status: AdminDashboardStatus;
  createdAt: string;
};

type AdminAppointmentsPayload = {
  data: {
    items: AdminDashboardAppointment[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
};

export type AdminDashboardCampaign = {
  id: string;
  code: string;
  status: string;
  isPublished: boolean;
  isActive: boolean;
  priority: number;
  badgeLabel: string;
  theme: string;
  startDate: string | null;
  endDate: string | null;
  localeContent: {
    fr: {
      title: string;
      description: string;
      ctaLabel: string;
    };
    ar: {
      title: string;
      description: string;
      ctaLabel: string;
    } | null;
  };
};

type AdminCampaignsPayload = {
  data: {
    items: AdminDashboardCampaign[];
  };
};

export type AdminDashboardOverview = {
  metrics: {
    pendingCount: number;
    todayCount: number;
    activeCampaignCount: number;
  };
  statusDistribution: Array<{
    status: AdminDashboardStatus;
    count: number;
  }>;
  recentAppointments: AdminDashboardAppointment[];
  featuredCampaign: {
    code: string;
    title: string;
    badgeLabel: string;
    theme: string;
    startDate: string | null;
    endDate: string | null;
  } | null;
  activity: Array<{
    id: string;
    title: string;
    detail: string;
  }>;
};

const dashboardStatuses: AdminDashboardStatus[] = [
  "pending",
  "confirmed",
  "rejected",
  "completed",
  "cancelled",
];

function createAdminHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function fetchAppointments(
  token: string,
  searchParams: Record<string, string | number | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || value === "") {
      continue;
    }

    params.set(key, String(value));
  }

  const payload = await apiRequest<AdminAppointmentsPayload>(
    `/api/admin/appointments?${params.toString()}`,
    {
      headers: createAdminHeaders(token),
    },
  );

  return payload.data;
}

function formatActivityTime(dateString: string, locale: "fr" | "ar") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : "fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function buildActivityTitle(
  status: AdminDashboardStatus,
  locale: "fr" | "ar",
) {
  const titles = {
    fr: {
      pending: "Nouvelle demande reçue",
      confirmed: "Demande confirmée",
      rejected: "Demande rejetée",
      completed: "Parcours terminé",
      cancelled: "Demande annulée",
    },
    ar: {
      pending: "تم استلام طلب جديد",
      confirmed: "تم تأكيد الطلب",
      rejected: "تم رفض الطلب",
      completed: "تم إنهاء المسار",
      cancelled: "تم إلغاء الطلب",
    },
  } as const;

  return titles[locale][status];
}

export async function getAdminDashboardOverview(
  token: string,
  locale: "fr" | "ar",
): Promise<AdminDashboardOverview> {
  const today = new Date().toISOString().slice(0, 10);

  const [pending, todayRequests, recent, campaigns, ...statusCounts] = await Promise.all([
    fetchAppointments(token, { status: "pending", page: 1, pageSize: 1 }),
    fetchAppointments(token, {
      dateFrom: today,
      dateTo: today,
      page: 1,
      pageSize: 1,
    }),
    fetchAppointments(token, { page: 1, pageSize: 5 }),
    apiRequest<AdminCampaignsPayload>("/api/admin/campaigns", {
      headers: createAdminHeaders(token),
    }),
    ...dashboardStatuses.map((status) =>
      fetchAppointments(token, { status, page: 1, pageSize: 1 }),
    ),
  ]);

  const activeCampaign =
    campaigns.data.items.find((item) => item.isPublished && item.isActive) ?? null;

  return {
    metrics: {
      pendingCount: pending.pagination.total,
      todayCount: todayRequests.pagination.total,
      activeCampaignCount: campaigns.data.items.filter(
        (item) => item.isPublished && item.isActive,
      ).length,
    },
    statusDistribution: dashboardStatuses.map((status, index) => ({
      status,
      count: statusCounts[index].pagination.total,
    })),
    recentAppointments: recent.items,
    featuredCampaign: activeCampaign
      ? {
          code: activeCampaign.code,
          title:
            locale === "ar"
              ? activeCampaign.localeContent.ar?.title ??
                activeCampaign.localeContent.fr.title
              : activeCampaign.localeContent.fr.title,
          badgeLabel: activeCampaign.badgeLabel,
          theme: activeCampaign.theme,
          startDate: activeCampaign.startDate,
          endDate: activeCampaign.endDate,
        }
      : null,
    activity: recent.items.slice(0, 4).map((item) => ({
      id: item.id,
      title: buildActivityTitle(item.status, locale),
      detail: `${formatActivityTime(item.createdAt, locale)} - ${item.donor.firstName} ${item.donor.lastName}`,
    })),
  };
}
