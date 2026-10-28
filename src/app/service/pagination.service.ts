import type { Model } from "mongoose";

type PaginationOptions = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 1 | -1;
  /** fields the client is allowed to sort by (default: createdAt, updatedAt) */
  allowedSortFields?: string[];
  filter?: Record<string, any>;
  q?: string;
  searchFields?: string[];
  populate?: any;
  select?: string;
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Reads ?page&limit&q&sortBy&order from the URL. */
export function parseListParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10) || 10));
  const q = (searchParams.get("q") ?? "").trim().slice(0, 100);
  const sortBy = searchParams.get("sortBy") ?? undefined;
  const sortOrder: 1 | -1 = searchParams.get("order") === "asc" ? 1 : -1;
  return { page, limit, q, sortBy, sortOrder };
}

/** Generic, safe pagination (escaped search regex, sort allow-list, populate in one query). */
export async function paginate<T>(
  model: Model<T>,
  {
    page,
    limit,
    sortBy,
    sortOrder = -1,
    allowedSortFields = [],
    filter = {},
    q = "",
    searchFields = [],
    populate,
    select,
  }: PaginationOptions
) {
  const safePage = Math.max(1, Number(page || 1));
  const safeLimit = Math.min(100, Math.max(1, Number(limit || 10)));
  const skip = (safePage - 1) * safeLimit;

  const sortable = ["createdAt", "updatedAt", ...allowedSortFields];
  const sortField = sortBy && sortable.includes(sortBy) ? sortBy : "createdAt";

  const clauses: Record<string, any>[] = [filter];
  if (q && searchFields.length) {
    const rx = new RegExp(escapeRegex(q), "i");
    clauses.push({ $or: searchFields.map((f) => ({ [f]: rx })) });
  }
  const finalFilter = clauses.length > 1 ? { $and: clauses } : filter;

  let query = model.find(finalFilter).sort({ [sortField]: sortOrder, _id: sortOrder }).skip(skip).limit(safeLimit);
  if (select) query = query.select(select);
  if (populate) query = query.populate(populate);

  const [data, total] = await Promise.all([query.lean(), model.countDocuments(finalFilter)]);
  const totalPages = Math.ceil(total / safeLimit);

  return {
    data,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    },
  };
}
