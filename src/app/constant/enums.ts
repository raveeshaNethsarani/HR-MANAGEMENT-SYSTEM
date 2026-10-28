export const EMPLOYMENT_STATUSES = ["Active", "Inactive", "Terminated", "Resigned", "On Leave"] as const;
/** Statuses that are allowed to log in / use the system. */
export const ACTIVE_EMPLOYMENT_STATUSES = ["Active", "On Leave"] as const;

export const LEAVE_STATUSES = ["pending", "approved", "rejected", "cancelled"] as const;

export const CANDIDATE_SOURCES = ["LinkedIn", "Indeed", "Referral", "Company Website", "Email", "Other"] as const;
export const CANDIDATE_STATUSES = [
  "Applied", "Screening", "Interview", "Technical Test", "Offer", "Hired", "Rejected", "On Hold",
] as const;
