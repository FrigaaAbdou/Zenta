import mongoose from "mongoose";

import { AppError } from "../../lib/errors/app-error.js";
import type { AdminRole } from "../admin-auth/admin-user.model.js";
import { DonorModel } from "../donors/donor.model.js";
import {
  ADMIN_APPOINTMENT_STATUSES,
  ADMIN_APPOINTMENT_STATUS_TRANSITIONS,
  APPOINTMENT_SLOT_BOOKED_STATUSES,
  type AdminAppointmentStatus,
} from "./appointment.constants.js";
import { AppointmentRequestModel } from "./appointment.model.js";

export type AppointmentDraft = {
  donorId: string;
  campaignCode?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  donationType: string;
  isExistingDonor: boolean;
  lastDonationDate?: Date | null;
  eligibilityChecklist: {
    ageConfirmed: boolean;
    weightConfirmed: boolean;
    healthyConfirmed: boolean;
    noContraIndicationConfirmed: boolean;
  };
  remarks?: string;
  locale: "fr" | "ar";
  status?: string;
};

export type AdminAppointmentsFilters = {
  page: number;
  pageSize: number;
  status?: AdminAppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
  campaignCode?: string;
  search?: string;
};

export type AdminAppointmentListItem = {
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
  status: string;
  createdAt: string;
};

export type AdminAppointmentDetail = AdminAppointmentListItem & {
  donorFull: {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
    phone: string;
    email: string | null;
    wilayaCode: string;
    commune: string;
    bloodGroup: string;
  };
  isExistingDonor: boolean;
  lastDonationDate: string | null;
  eligibilityChecklist: {
    ageConfirmed: boolean;
    weightConfirmed: boolean;
    healthyConfirmed: boolean;
    noContraIndicationConfirmed: boolean;
  };
  remarks: string;
  locale: "fr" | "ar";
  updatedAt: string;
};

export async function createAppointmentRequest(draft: AppointmentDraft) {
  const appointment = new AppointmentRequestModel({
    donorId: draft.donorId,
    campaignCode: draft.campaignCode ?? null,
    appointmentDate: draft.appointmentDate,
    appointmentTime: draft.appointmentTime,
    donationType: draft.donationType,
    isExistingDonor: draft.isExistingDonor,
    lastDonationDate: draft.lastDonationDate ?? null,
    eligibilityChecklist: draft.eligibilityChecklist,
    remarks: draft.remarks ?? "",
    locale: draft.locale,
    status: draft.status ?? "pending",
  });

  await appointment.save();

  return appointment;
}

export async function findPendingAppointmentConflict(input: {
  donorId: string;
  appointmentDate: string;
  appointmentTime: string;
}) {
  return AppointmentRequestModel.findOne({
    donorId: input.donorId,
    appointmentDate: input.appointmentDate,
    appointmentTime: input.appointmentTime,
    status: "pending",
}).exec();
}

export async function getAppointmentSlotOccupancy(date: string) {
  const rows = await AppointmentRequestModel.aggregate<{
    _id: string;
    reservedCount: number;
  }>([
    {
      $match: {
        appointmentDate: date,
        status: { $in: [...APPOINTMENT_SLOT_BOOKED_STATUSES] },
      },
    },
    {
      $group: {
        _id: "$appointmentTime",
        reservedCount: { $sum: 1 },
      },
    },
  ]);

  return Object.fromEntries(
    rows.map((row) => [row._id, row.reservedCount]),
  ) as Record<string, number>;
}

function createAppointmentNotFoundError() {
  return new AppError({
    statusCode: 404,
    code: "NOT_FOUND",
    message: "Appointment request not found",
  });
}

function createForbiddenStatusTransitionError() {
  return new AppError({
    statusCode: 403,
    code: "FORBIDDEN",
    message: "You do not have permission to apply this appointment status transition",
  });
}

function createInvalidStatusTransitionError(currentStatus: string, nextStatus: string) {
  return new AppError({
    statusCode: 422,
    code: "VALIDATION_ERROR",
    message: `Cannot transition appointment from ${currentStatus} to ${nextStatus}`,
    details: {
      status: `Transition from ${currentStatus} to ${nextStatus} is not allowed.`,
    },
  });
}

function buildRegexSearch(search: string) {
  return new RegExp(search.trim(), "i");
}

async function resolveSearchDonorIds(search?: string) {
  if (!search?.trim()) {
    return null;
  }

  const regex = buildRegexSearch(search);
  const matchingDonors = await DonorModel.find({
    $or: [{ firstName: regex }, { lastName: regex }, { phone: regex }],
  })
    .select("_id")
    .lean()
    .exec();

  return matchingDonors.map((donor) => donor._id);
}

async function buildAdminAppointmentsMatch(filters: AdminAppointmentsFilters) {
  const match: Record<string, unknown> = {};

  if (filters.status) {
    match.status = filters.status;
  }

  if (filters.campaignCode) {
    match.campaignCode = filters.campaignCode;
  }

  if (filters.dateFrom || filters.dateTo) {
    match.appointmentDate = {
      ...(filters.dateFrom ? { $gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { $lte: filters.dateTo } : {}),
    };
  }

  const donorIds = await resolveSearchDonorIds(filters.search);

  if (donorIds) {
    match.donorId = { $in: donorIds };
  }

  return match;
}

function mapAdminAppointmentRow(row: any): AdminAppointmentListItem {
  return {
    id: String(row._id),
    donor: {
      id: String(row.donor._id),
      firstName: row.donor.firstName,
      lastName: row.donor.lastName,
      phone: row.donor.phone,
      bloodGroup: row.donor.bloodGroup,
    },
    campaignCode: row.campaignCode ?? null,
    appointmentDate: row.appointmentDate,
    appointmentTime: row.appointmentTime,
    donationType: row.donationType,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapAdminAppointmentDetail(row: any): AdminAppointmentDetail {
  const listShape = mapAdminAppointmentRow(row);

  return {
    ...listShape,
    donorFull: {
      id: String(row.donor._id),
      firstName: row.donor.firstName,
      lastName: row.donor.lastName,
      birthDate: row.donor.birthDate.toISOString(),
      gender: row.donor.gender,
      phone: row.donor.phone,
      email: row.donor.email ?? null,
      wilayaCode: row.donor.wilayaCode,
      commune: row.donor.commune,
      bloodGroup: row.donor.bloodGroup,
    },
    isExistingDonor: row.isExistingDonor,
    lastDonationDate: row.lastDonationDate ? row.lastDonationDate.toISOString() : null,
    eligibilityChecklist: row.eligibilityChecklist,
    remarks: row.remarks ?? "",
    locale: row.locale,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listAdminAppointments(filters: AdminAppointmentsFilters) {
  const match = await buildAdminAppointmentsMatch(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [items, total] = await Promise.all([
    AppointmentRequestModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "donors",
          localField: "donorId",
          foreignField: "_id",
          as: "donor",
        },
      },
      { $unwind: "$donor" },
      { $sort: { appointmentDate: 1, appointmentTime: 1, createdAt: -1 } },
      { $skip: skip },
      { $limit: filters.pageSize },
    ]),
    AppointmentRequestModel.countDocuments(match).exec(),
  ]);

  return {
    items: items.map(mapAdminAppointmentRow),
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    },
  };
}

export async function getAdminAppointmentById(appointmentId: string) {
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    throw createAppointmentNotFoundError();
  }

  const rows = await AppointmentRequestModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(appointmentId) } },
    {
      $lookup: {
        from: "donors",
        localField: "donorId",
        foreignField: "_id",
        as: "donor",
      },
    },
    { $unwind: "$donor" },
    { $limit: 1 },
  ]);

  const row = rows[0];

  if (!row) {
    throw createAppointmentNotFoundError();
  }

  return mapAdminAppointmentDetail(row);
}

function canRoleApplyTransition(
  role: AdminRole,
  currentStatus: AdminAppointmentStatus,
  nextStatus: AdminAppointmentStatus,
) {
  if (role === "super_admin" || role === "manager") {
    return true;
  }

  return currentStatus === "pending" && ["confirmed", "rejected"].includes(nextStatus);
}

export async function updateAdminAppointmentStatus(input: {
  appointmentId: string;
  nextStatus: AdminAppointmentStatus;
  actorRole: AdminRole;
}) {
  if (!mongoose.Types.ObjectId.isValid(input.appointmentId)) {
    throw createAppointmentNotFoundError();
  }

  const appointment = await AppointmentRequestModel.findById(input.appointmentId).exec();

  if (!appointment) {
    throw createAppointmentNotFoundError();
  }

  const currentStatus = appointment.status as AdminAppointmentStatus;
  const nextStatus = input.nextStatus;
  const allowedTransitions =
    ADMIN_APPOINTMENT_STATUS_TRANSITIONS[currentStatus] ?? [];

  if (!ADMIN_APPOINTMENT_STATUSES.includes(nextStatus)) {
    throw createInvalidStatusTransitionError(currentStatus, nextStatus);
  }

  if (!allowedTransitions.includes(nextStatus)) {
    throw createInvalidStatusTransitionError(currentStatus, nextStatus);
  }

  if (!canRoleApplyTransition(input.actorRole, currentStatus, nextStatus)) {
    throw createForbiddenStatusTransitionError();
  }

  appointment.status = nextStatus;
  await appointment.save();

  return getAdminAppointmentById(String(appointment._id));
}
