import { Employee, LeaveType, LeaveRequest } from "../../app/models";
import { ApiError } from "../../lib/http";
import { hasPermission, type AuthContext } from "../../lib/auth";
import { application } from "../../app/config/application";
import { ACTIVE_EMPLOYMENT_STATUSES } from "../../app/constant/enums";
import {
  reserveDays,
  releasePending,
  approveDays,
  restoreUsed,
  getLeaveBalance,
} from "./leaveBalance.service";

const OPEN_STATUSES = ["pending", "approved"];
const DAY_MS = 24 * 60 * 60 * 1000;

/* ---------------------------- date helpers (UTC, no timezone drift) ---------------------------- */

/** "2026-11-05" (or an ISO datetime) -> that calendar date at 00:00 UTC. */
export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function ensureValidLeaveDates(start: Date, end: Date) {
  if (end.getTime() < start.getTime()) throw new ApiError(400, "End date cannot be before start date");
  if (start.getUTCFullYear() !== end.getUTCFullYear()) {
    throw new ApiError(400, "A leave request cannot span two calendar years. Please create two requests.");
  }
}

export function calcTotalDays(start: Date, end: Date, excludeWeekends = application.LEAVE_EXCLUDE_WEEKENDS) {
  const calendarDays = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
  if (!excludeWeekends) return calendarDays;

  let working = 0;
  for (let i = 0; i < calendarDays; i++) {
    const dow = new Date(start.getTime() + i * DAY_MS).getUTCDay();
    if (dow !== 0 && dow !== 6) working++;
  }
  if (working === 0) throw new ApiError(400, "The selected dates contain no working days");
  return working;
}

/* --------------------------------------- queries --------------------------------------- */

const POPULATE = [
  { path: "employee", select: "first_name last_name email employee_id" },
  { path: "leave_type", select: "leave_type_id name description" },
  { path: "approver", select: "first_name last_name" },
  { path: "organization", select: "name" },
];

export const populateLeaveRequest = (q: any) => q.populate(POPULATE);
export const LEAVE_POPULATE = POPULATE;

async function findOverlap(employee: string, start: Date, end: Date, excludeId?: string) {
  return LeaveRequest.findOne({
    employee,
    status: { $in: OPEN_STATUSES },
    start_date: { $lte: end },
    end_date: { $gte: start },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).lean();
}

async function loadRequest(ctx: AuthContext, id: string) {
  const request: any = await LeaveRequest.findOne({ _id: id, organization: ctx.orgId });
  if (!request) throw new ApiError(404, "Leave request not found");
  return request;
}

export async function getLeaveRequestForUser(ctx: AuthContext, id: string) {
  const request: any = await populateLeaveRequest(LeaveRequest.findOne({ _id: id, organization: ctx.orgId }));
  if (!request) throw new ApiError(404, "Leave request not found");
  const ownerId = String(request.employee?._id ?? request.employee);
  if (ownerId !== ctx.userId && !hasPermission(ctx.permissions, "leave.read_all")) {
    throw new ApiError(404, "Leave request not found"); // don't reveal that it exists
  }
  return request;
}

/* --------------------------------------- commands --------------------------------------- */

export async function createLeaveRequest(
  ctx: AuthContext,
  data: { employee?: string; leave_type: string; start_date: string; end_date: string; reason?: string }
) {
  const employeeId = data.employee ?? ctx.userId;
  if (employeeId !== ctx.userId && !hasPermission(ctx.permissions, "leave.approve")) {
    throw new ApiError(403, "You can only create leave requests for yourself");
  }

  const [employee, leaveType]: any[] = await Promise.all([
    Employee.findOne({
      _id: employeeId,
      organization: ctx.orgId,
      employment_status: { $in: ACTIVE_EMPLOYMENT_STATUSES },
    })
      .select("_id")
      .lean(),
    LeaveType.findOne({ _id: data.leave_type, organization: ctx.orgId }).select("_id").lean(),
  ]);
  if (!employee) throw new ApiError(400, "Employee not found in your organization");
  if (!leaveType) throw new ApiError(400, "Leave type not found in your organization");

  const start = parseDateOnly(data.start_date);
  const end = parseDateOnly(data.end_date);
  ensureValidLeaveDates(start, end);
  const totalDays = calcTotalDays(start, end);
  const year = start.getUTCFullYear();

  const overlap: any = await findOverlap(employeeId, start, end);
  if (overlap) {
    throw new ApiError(409, "Leave request overlaps with an existing request", {
      start_date: overlap.start_date,
      end_date: overlap.end_date,
      status: overlap.status,
    });
  }

  // atomic reservation: fails if the balance is missing or too small
  const reserved = await reserveDays(employeeId, leaveType._id, year, totalDays);
  if (!reserved) {
    const balance: any = await getLeaveBalance(employeeId, leaveType._id, year);
    if (!balance) {
      throw new ApiError(400, "Leave balance not found for this employee and leave type. Please contact HR.");
    }
    throw new ApiError(400, "Insufficient leave balance", {
      required: totalDays,
      available: balance.remaining_days,
      allocated: balance.allocated_days,
      used: balance.used_days,
      pending: balance.pending_days,
    });
  }

  let created: any;
  try {
    created = await LeaveRequest.create({
      organization: ctx.orgId,
      employee: employeeId,
      leave_type: leaveType._id,
      start_date: start,
      end_date: end,
      total_days: totalDays,
      reason: data.reason ?? "",
      status: "pending",
    });
  } catch (err) {
    await releasePending(employeeId, leaveType._id, year, totalDays); // roll the reservation back
    throw err;
  }
  return populateLeaveRequest(LeaveRequest.findById(created._id));
}

/** Owner edits dates / reason of a still-pending request. */
export async function updateLeaveRequest(
  ctx: AuthContext,
  id: string,
  data: { start_date?: string; end_date?: string; reason?: string }
) {
  const existing = await loadRequest(ctx, id);
  if (String(existing.employee) !== ctx.userId) throw new ApiError(403, "You can only edit your own requests");
  if (existing.status !== "pending") {
    throw new ApiError(400, `Only pending requests can be updated (current status: ${existing.status})`);
  }

  const update: Record<string, any> = {};
  if (data.reason !== undefined) update.reason = data.reason;

  if (data.start_date || data.end_date) {
    const start = data.start_date ? parseDateOnly(data.start_date) : existing.start_date;
    const end = data.end_date ? parseDateOnly(data.end_date) : existing.end_date;
    ensureValidLeaveDates(start, end);
    const totalDays = calcTotalDays(start, end);

    if (await findOverlap(String(existing.employee), start, end, id)) {
      throw new ApiError(409, "Updated dates overlap with another leave request");
    }

    const oldYear = existing.start_date.getUTCFullYear();
    const newYear = start.getUTCFullYear();
    const args = [existing.employee, existing.leave_type] as const;

    if (newYear === oldYear) {
      const delta = totalDays - existing.total_days;
      if (delta > 0 && !(await reserveDays(...args, newYear, delta))) {
        throw new ApiError(400, "Insufficient leave balance for the updated dates");
      }
      if (delta < 0) await releasePending(...args, oldYear, -delta);
    } else {
      if (!(await reserveDays(...args, newYear, totalDays))) {
        throw new ApiError(400, "Insufficient leave balance for the updated dates");
      }
      await releasePending(...args, oldYear, existing.total_days);
    }

    update.start_date = start;
    update.end_date = end;
    update.total_days = totalDays;
  }

  if (!Object.keys(update).length) throw new ApiError(400, "Nothing to update");

  const updated = await populateLeaveRequest(
    LeaveRequest.findOneAndUpdate({ _id: id, organization: ctx.orgId, status: "pending" }, update, { new: true })
  );
  if (!updated) throw new ApiError(409, "The request was changed by someone else. Please reload.");
  return updated;
}

/**
 * approve / reject / cancel.
 *  - approve & reject: needs `leave.approve`, and you can't decide on your own request
 *  - cancel: the owner or anyone with `leave.approve`; pending -> releases reservation, approved -> restores used days
 * The status change is an atomic compare-and-set, so a request can never be processed twice.
 */
export async function changeLeaveStatus(ctx: AuthContext, id: string, status: "approved" | "rejected" | "cancelled") {
  const request = await loadRequest(ctx, id);
  const year = request.start_date.getUTCFullYear();
  const isOwner = String(request.employee) === ctx.userId;
  const canApprove = hasPermission(ctx.permissions, "leave.approve");
  const args = [request.employee, request.leave_type] as const;

  if (status === "cancelled") {
    if (!isOwner && !canApprove) throw new ApiError(403, "Forbidden");
    const prev: any = await LeaveRequest.findOneAndUpdate(
      { _id: id, organization: ctx.orgId, status: { $in: OPEN_STATUSES } },
      { status: "cancelled" },
      { new: false }
    );
    if (!prev) throw new ApiError(400, "Only pending or approved requests can be cancelled");
    if (prev.status === "pending") await releasePending(...args, year, prev.total_days);
    else await restoreUsed(...args, year, prev.total_days);
  } else {
    if (!canApprove) throw new ApiError(403, "Forbidden");
    if (isOwner) throw new ApiError(403, "You cannot approve or reject your own leave request");

    const prev: any = await LeaveRequest.findOneAndUpdate(
      { _id: id, organization: ctx.orgId, status: "pending" },
      { status, approver: ctx.userId },
      { new: false }
    );
    if (!prev) {
      throw new ApiError(400, `Cannot change status from ${request.status} to ${status}. Only pending requests can be approved or rejected.`);
    }
    if (status === "approved") await approveDays(...args, year, prev.total_days);
    else await releasePending(...args, year, prev.total_days);
  }

  return populateLeaveRequest(LeaveRequest.findById(id));
}
