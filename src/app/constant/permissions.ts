/**
 * Permission strings stored in Role.permissions.
 *
 *  "*"            -> every organization-level permission (NOT the system.* ones)
 *  "system.admin" -> cross-organization super admin; must be granted explicitly
 *
 * Things every logged-in employee can do without a permission:
 *  - read their own profile, leave requests, leave balances
 *  - create / edit / cancel their own leave requests
 *  - read designations, leave types and their own organization
 */
export const PERMISSIONS = [
  "employee.read",
  "employee.create",
  "employee.update",
  "employee.delete",
  "role.read",
  "role.manage",
  "designation.manage",
  "leaveType.manage",
  "leave.read_all",
  "leave.approve",
  "candidate.read",
  "candidate.manage",
  "organization.manage",
  "system.admin",
] as const;

export const ALL_PERMISSIONS = ["*", ...PERMISSIONS] as [string, ...string[]];
