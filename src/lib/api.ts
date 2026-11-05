import type { Designation, Company, Employee } from "@/app/types/types";

/**
 * Frontend API client.
 *  - Browser: same-origin, cookies are sent automatically.
 *  - Server components: the incoming cookies are forwarded, otherwise the API would answer 401.
 */
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function request<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  let url = path;
  if (typeof window === "undefined") {
    url = `${BASE_URL}${path}`;
    const { cookies } = await import("next/headers");
    const cookie = (await cookies()).toString();
    if (cookie) headers.set("cookie", cookie);
  }

  const res = await fetch(url, { ...init, headers, cache: "no-store", credentials: "include" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(body.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.errors = body.errors;
    throw err;
  }
  return body as T;
}

const json = (method: string, data: unknown): RequestInit => ({ method, body: JSON.stringify(data) });

/* ----------------------------------------- reads ----------------------------------------- */

export async function getOrganizations(): Promise<Company[]> {
  try {
    const result = await request("/api/Organization?limit=100");
    return (result.data ?? []).map((org: any) => ({
      _id: org._id,
      company_id: org.organization_id || org._id,
      company_name: org.name,
      company_description: org.description,
      status: org.status,
    }));
  } catch (error) {
    console.error("API Error (getOrganizations):", error);
    return [];
  }
}

export async function getDesignations(): Promise<Designation[]> {
  try {
    const result = await request("/api/Designation?limit=100");
    return (result.data ?? []).map((des: any) => ({
      _id: des._id,
      designation_id: des.designation_id || des._id,
      title: des.title,
      description: des.description,
      status: des.status,
    }));
  } catch (error) {
    console.error("API Error (getDesignations):", error);
    return [];
  }
}

export async function getEmployees(): Promise<Employee[]> {
  try {
    const result = await request("/api/employee/all");
    return (result.data ?? []).map((emp: any) => ({
      _id: emp._id,
      employee_id: emp.employee_id,
      designation_id: emp.designation?._id ?? emp.designation,
      designation_title: emp.designation?.title,
      role_id: emp.role?._id ?? emp.role,
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone,
      address: emp.address,
      date_of_birth: emp.date_of_birth,
      join_date: emp.join_date,
      status: emp.employment_status === "Active" ? "Active" : "Inactive",
      employment_status: emp.employment_status,
    }));
  } catch (error) {
    console.error("API Error (getEmployees):", error);
    return [];
  }
}

/* ---------------------------------------- writes ----------------------------------------- */

/** employeeData: { designation, role, employee_id, first_name, last_name, email, phone, ... } (ObjectIds for designation/role) */
export const createEmployee = (employeeData: any) => request("/api/employee", json("POST", employeeData));
export const createDesignation = (data: any) => request("/api/Designation", json("POST", data));
export const updateDesignation = (id: string, data: any) => request(`/api/Designation/${id}`, json("PUT", data));
export const createOrganization = (data: any) => request("/api/Organization", json("POST", data));
export const updateOrganization = (id: string, data: any) => request(`/api/Organization/${id}`, json("PUT", data));
export const createRole = (data: any) => request("/api/Role", json("POST", data));

/* ----------------------------------------- auth ------------------------------------------ */

export const login = (email: string, password: string, organization_id?: string) =>
  request("/api/auth/login", json("POST", { email, password, organization_id }));
export const logout = () => request("/api/auth/logout", { method: "POST" });
export const getMe = () => request("/api/auth/me");
export const forgotPassword = (email: string) => request("/api/auth/forgot-password", json("POST", { email }));
export const resetPassword = (token: string, password: string) =>
  request("/api/auth/reset-password", json("POST", { token, password }));
export const changePassword = (current_password: string, new_password: string) =>
  request("/api/auth/change-password", json("POST", { current_password, new_password }));

/* ------------------------------------------ leave ---------------------------------------- */

export const getLeaveBalances = (year?: number) => request(`/api/LeaveBalance${year ? `?year=${year}` : ""}`);
export const requestLeave = (data: { leave_type: string; start_date: string; end_date: string; reason?: string }) =>
  request("/api/LeaveRequests", json("POST", data));
export const setLeaveStatus = (id: string, status: "approved" | "rejected" | "cancelled") =>
  request(`/api/LeaveRequests/${id}`, json("PATCH", { status }));

/* ----------------------------------------- api object (used by App.tsx) ------------------- */

export const api = {
  auth: {
    login: (email: string, password: string, organization_id?: string) =>
      login(email, password, organization_id),
    logout,
    me: getMe,
    forgotPassword,
    resetPassword,
    changePassword,
  },
  employees: {
    list: getEmployees,
    create: createEmployee,
  },
  designations: {
    list: getDesignations,
    create: createDesignation,
    update: updateDesignation,
  },
  organizations: {
    list: getOrganizations,
    create: createOrganization,
    update: updateOrganization,
  },
  roles: {
    create: createRole,
  },
  leave: {
    balances: getLeaveBalances,
    request: requestLeave,
    setStatus: setLeaveStatus,
  },
};
