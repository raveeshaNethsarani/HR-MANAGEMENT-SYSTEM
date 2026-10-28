import type { Types } from "mongoose";
import { LeaveBalance, LeaveType, Employee } from "../../app/models";
import { ACTIVE_EMPLOYMENT_STATUSES } from "../../app/constant/enums";

type Id = string | Types.ObjectId;

/*
 * Balance model:   remaining = allocated - used - pending
 *   pending  = days reserved by PENDING requests
 *   used     = days of APPROVED requests
 * Every mutation is a single atomic MongoDB update, so two parallel requests can never overdraw a balance.
 */

const key = (employee: Id, leaveType: Id, year: number) => ({
  employee_id: employee,
  leave_type_id: leaveType,
  year,
});

const used = { $ifNull: ["$used_days", 0] };
const pending = { $ifNull: ["$pending_days", 0] };

const PIPELINE = { updatePipeline: true } as any; // Mongoose >= 7 needs this flag for pipeline updates

export async function getLeaveBalance(employee: Id, leaveType: Id, year: number) {
  return LeaveBalance.findOne(key(employee, leaveType, year));
}

/** Atomically reserves `days` for a pending request. Returns null if the balance is missing or insufficient. */
export async function reserveDays(employee: Id, leaveType: Id, year: number, days: number) {
  return LeaveBalance.findOneAndUpdate(
    {
      ...key(employee, leaveType, year),
      $expr: { $gte: [{ $subtract: ["$allocated_days", { $add: [used, pending] }] }, days] },
    },
    { $inc: { pending_days: days } },
    { new: true }
  );
}

/** Pending request rejected / cancelled / shortened -> give the reserved days back. */
export async function releasePending(employee: Id, leaveType: Id, year: number, days: number) {
  await LeaveBalance.updateOne(
    key(employee, leaveType, year),
    [{ $set: { pending_days: { $max: [0, { $subtract: [pending, days] }] } } }],
    PIPELINE
  );
}

/** Request approved: reserved (pending) days become used days. */
export async function approveDays(employee: Id, leaveType: Id, year: number, days: number) {
  await LeaveBalance.updateOne(
    key(employee, leaveType, year),
    [
      {
        $set: {
          pending_days: { $max: [0, { $subtract: [pending, days] }] },
          used_days: { $add: [used, days] },
        },
      },
    ],
    PIPELINE
  );
}

/** Approved request cancelled -> give the used days back. */
export async function restoreUsed(employee: Id, leaveType: Id, year: number, days: number) {
  await LeaveBalance.updateOne(
    key(employee, leaveType, year),
    [{ $set: { used_days: { $max: [0, { $subtract: [used, days] }] } } }],
    PIPELINE
  );
}

export async function getEmployeeBalances(employee: Id, year = new Date().getFullYear()) {
  return LeaveBalance.find({ employee_id: employee, year }).populate("leave_type_id", "leave_type_id name description");
}

/** Creates (never overwrites) balances for one employee for every leave type of the organization. */
export async function initializeBalancesForEmployee(employee: Id, organization: Id, year = new Date().getFullYear()) {
  const leaveTypes: any[] = await LeaveType.find({ organization }).lean();
  if (!leaveTypes.length) return;
  await LeaveBalance.bulkWrite(
    leaveTypes.map((lt) => ({
      updateOne: {
        filter: key(employee, lt._id, year),
        update: { $setOnInsert: { allocated_days: lt.anual_allocation, used_days: 0, pending_days: 0 } },
        upsert: true,
      },
    }))
  );
}

/** Creates balances for every active employee when a new leave type is added. */
export async function initializeBalancesForLeaveType(leaveType: any, year = new Date().getFullYear()) {
  const employees: any[] = await Employee.find({
    organization: leaveType.organization,
    employment_status: { $in: ACTIVE_EMPLOYMENT_STATUSES },
  })
    .select("_id")
    .lean();
  if (!employees.length) return;
  await LeaveBalance.bulkWrite(
    employees.map((e) => ({
      updateOne: {
        filter: key(e._id, leaveType._id, year),
        update: { $setOnInsert: { allocated_days: leaveType.anual_allocation, used_days: 0, pending_days: 0 } },
        upsert: true,
      },
    }))
  );
}
