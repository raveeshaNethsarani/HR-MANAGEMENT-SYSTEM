export type Status = "Active" | "Inactive" | "On Leave" | "Terminated" | "Resigned"

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  designation: string
  role: string
  joinDate: string
  status: Status
}

export interface LeaveRequest {
  id: string
  employee: string
  initials: string
  type: string
  startDate: string
  endDate: string
  days: number
  reason: string
  status: "Pending" | "Approved" | "Rejected" | "Cancelled"
}

export interface Candidate {
  id: string
  name: string
  email: string
  role: string
  experience: number
  skills: string[]
  source: string
  status: "Applied" | "Screening" | "Interview" | "Technical Test" | "Offer" | "Hired" | "Rejected" | "On Hold"
  applied: string
}

export const currentUser = {
  name: "Olivia Martin",
  email: "olivia@acme.co",
  initials: "OM",
  role: "HR Administrator",
}

export const employees: Employee[] = [
  {
    id: "EMP-001",
    name: "Ava Rodriguez",
    email: "ava@acme.co",
    phone: "+1 415 555 0141",
    designation: "Product Designer",
    role: "Employee",
    joinDate: "12 Jan 2022",
    status: "Active",
  },
  {
    id: "EMP-002",
    name: "Liam Chen",
    email: "liam@acme.co",
    phone: "+1 415 555 0188",
    designation: "Senior Engineer",
    role: "Team Lead",
    joinDate: "04 Mar 2021",
    status: "On Leave",
  },
  {
    id: "EMP-003",
    name: "Noah Williams",
    email: "noah@acme.co",
    phone: "+1 415 555 0117",
    designation: "Product Manager",
    role: "Manager",
    joinDate: "18 Aug 2020",
    status: "Active",
  },
  {
    id: "EMP-004",
    name: "Mia Thompson",
    email: "mia@acme.co",
    phone: "+1 415 555 0139",
    designation: "People Partner",
    role: "HR Manager",
    joinDate: "24 Sep 2022",
    status: "Active",
  },
  {
    id: "EMP-005",
    name: "Ethan Moore",
    email: "ethan@acme.co",
    phone: "+1 415 555 0193",
    designation: "QA Engineer",
    role: "Employee",
    joinDate: "08 Feb 2023",
    status: "Inactive",
  },
  {
    id: "EMP-006",
    name: "Sophia Patel",
    email: "sophia@acme.co",
    phone: "+1 415 555 0155",
    designation: "Data Analyst",
    role: "Employee",
    joinDate: "16 May 2023",
    status: "Active",
  },
  {
    id: "EMP-007",
    name: "James Wilson",
    email: "james@acme.co",
    phone: "+1 415 555 0162",
    designation: "Account Executive",
    role: "Employee",
    joinDate: "11 Nov 2021",
    status: "Resigned",
  },
]

export const leaveRequests: LeaveRequest[] = [
  {
    id: "LR-1048",
    employee: "Liam Chen",
    initials: "LC",
    type: "Annual leave",
    startDate: "24 Jun 2025",
    endDate: "27 Jun 2025",
    days: 4,
    reason: "Family trip",
    status: "Pending",
  },
  {
    id: "LR-1047",
    employee: "Sophia Patel",
    initials: "SP",
    type: "Sick leave",
    startDate: "20 Jun 2025",
    endDate: "20 Jun 2025",
    days: 1,
    reason: "Medical appointment",
    status: "Approved",
  },
  {
    id: "LR-1046",
    employee: "Ava Rodriguez",
    initials: "AR",
    type: "Annual leave",
    startDate: "30 Jun 2025",
    endDate: "04 Jul 2025",
    days: 5,
    reason: "Summer vacation",
    status: "Pending",
  },
  {
    id: "LR-1045",
    employee: "Noah Williams",
    initials: "NW",
    type: "Personal leave",
    startDate: "18 Jun 2025",
    endDate: "18 Jun 2025",
    days: 1,
    reason: "Personal commitment",
    status: "Rejected",
  },
  {
    id: "LR-1044",
    employee: "Mia Thompson",
    initials: "MT",
    type: "Annual leave",
    startDate: "12 Jun 2025",
    endDate: "13 Jun 2025",
    days: 2,
    reason: "Short break",
    status: "Approved",
  },
  {
    id: "LR-1043",
    employee: "Olivia Martin",
    initials: "OM",
    type: "Sick leave",
    startDate: "06 Jun 2025",
    endDate: "06 Jun 2025",
    days: 1,
    reason: "Unwell",
    status: "Cancelled",
  },
]

export const leaveBalances = [
  { name: "Annual leave", allocated: 20, used: 8, pending: 4, remaining: 8 },
  { name: "Sick leave", allocated: 12, used: 3, pending: 0, remaining: 9 },
  { name: "Personal leave", allocated: 5, used: 1, pending: 0, remaining: 4 },
]

export const candidates: Candidate[] = [
  {
    id: "CAN-201",
    name: "Emma Davis",
    email: "emma@example.com",
    role: "Senior Product Designer",
    experience: 6,
    skills: ["Figma", "Research"],
    source: "LinkedIn",
    status: "Applied",
    applied: "2h ago",
  },
  {
    id: "CAN-202",
    name: "Lucas Garcia",
    email: "lucas@example.com",
    role: "Frontend Engineer",
    experience: 5,
    skills: ["React", "TypeScript"],
    source: "Referral",
    status: "Screening",
    applied: "1d ago",
  },
  {
    id: "CAN-203",
    name: "Amelia Brown",
    email: "amelia@example.com",
    role: "People Operations",
    experience: 4,
    skills: ["HRIS", "Payroll"],
    source: "Indeed",
    status: "Interview",
    applied: "3d ago",
  },
  {
    id: "CAN-204",
    name: "Oliver Jones",
    email: "oliver@example.com",
    role: "Backend Engineer",
    experience: 7,
    skills: ["Node.js", "Postgres"],
    source: "Company Website",
    status: "Technical Test",
    applied: "4d ago",
  },
  {
    id: "CAN-205",
    name: "Isabella Lee",
    email: "isabella@example.com",
    role: "Product Manager",
    experience: 8,
    skills: ["Strategy", "Analytics"],
    source: "LinkedIn",
    status: "Offer",
    applied: "1w ago",
  },
  {
    id: "CAN-206",
    name: "Henry Taylor",
    email: "henry@example.com",
    role: "QA Engineer",
    experience: 3,
    skills: ["Cypress", "API"],
    source: "Email",
    status: "On Hold",
    applied: "1w ago",
  },
]

export const chart30 = [
  { day: "May 22", requests: 2 },
  { day: "May 26", requests: 5 },
  { day: "May 30", requests: 3 },
  { day: "Jun 03", requests: 8 },
  { day: "Jun 07", requests: 6 },
  { day: "Jun 11", requests: 11 },
  { day: "Jun 15", requests: 7 },
  { day: "Jun 19", requests: 13 },
]

export const chart90 = [
  { day: "Apr 01", requests: 9 },
  { day: "Apr 15", requests: 14 },
  { day: "May 01", requests: 10 },
  { day: "May 15", requests: 18 },
  { day: "Jun 01", requests: 13 },
  { day: "Jun 19", requests: 20 },
]

export const designations = [
  {
    id: "DES-001",
    title: "Senior Engineer",
    description: "Senior individual contributor in Engineering",
    employees: 12,
    status: "Active",
  },
  {
    id: "DES-002",
    title: "Product Designer",
    description: "Owns product design and research",
    employees: 5,
    status: "Active",
  },
  {
    id: "DES-003",
    title: "People Partner",
    description: "Supports people operations and culture",
    employees: 3,
    status: "Active",
  },
  {
    id: "DES-004",
    title: "QA Engineer",
    description: "Ensures product quality and reliability",
    employees: 4,
    status: "Inactive",
  },
]

export const leaveTypes = [
  {
    id: "LT-001",
    name: "Annual leave",
    description: "Paid time off for rest and travel",
    allocation: 20,
    status: "Active",
  },
  {
    id: "LT-002",
    name: "Sick leave",
    description: "Paid leave for health and recovery",
    allocation: 12,
    status: "Active",
  },
  {
    id: "LT-003",
    name: "Personal leave",
    description: "Leave for personal commitments",
    allocation: 5,
    status: "Active",
  },
  {
    id: "LT-004",
    name: "Parental leave",
    description: "Leave for new parents",
    allocation: 90,
    status: "Active",
  },
]

export const roles = [
  {
    id: "ROL-001",
    name: "HR Administrator",
    description: "Full HR management access",
    users: 3,
    permissions: 18,
    status: "Active",
  },
  {
    id: "ROL-002",
    name: "Manager",
    description: "Team and leave approval access",
    users: 8,
    permissions: 7,
    status: "Active",
  },
  {
    id: "ROL-003",
    name: "Employee",
    description: "Standard employee access",
    users: 114,
    permissions: 4,
    status: "Active",
  },
  {
    id: "ROL-004",
    name: "Recruiter",
    description: "Candidate and recruitment access",
    users: 4,
    permissions: 5,
    status: "Inactive",
  },
]

export const organizations = [
  {
    id: "ORG-001",
    name: "Acme, Inc.",
    slug: "acme",
    employees: 128,
    status: "Active",
    created: "12 Jan 2020",
  },
  {
    id: "ORG-002",
    name: "Northstar Labs",
    slug: "northstar",
    employees: 42,
    status: "Active",
    created: "03 Mar 2023",
  },
  {
    id: "ORG-003",
    name: "Archive Studio",
    slug: "archive",
    employees: 0,
    status: "Inactive",
    created: "19 Nov 2024",
  },
]
