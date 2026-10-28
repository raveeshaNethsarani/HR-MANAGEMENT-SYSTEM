export interface Company {
  _id: string;
  company_id: string;
  company_name: string;
  company_description?: string;
  status: string;
}

export interface Designation {
  _id: string;
  designation_id: string;
  title: string;
  description?: string;
  status: string;
}

export interface Role {
  _id: string;
  name: string;
  permissions: string[];
}

export interface Employee {
  _id: string;
  employee_id: string;
  designation_id?: string;
  designation_title?: string;
  role_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  join_date?: string;
  status: "Active" | "Inactive";
  employment_status: string;
}

export interface Candidate {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  source?: string;
  status: string;
}

export interface LeaveType {
  _id: string;
  name: string;
  days_allowed: number;
}

export interface LeaveBalance {
  _id: string;
  employee: string;
  leave_type: LeaveType;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
}

export interface LeaveRequest {
  _id: string;
  employee: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days: number;
  reason?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
}

export interface AuthUser {
  _id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  organization: Company;
  employment_status: string;
}
