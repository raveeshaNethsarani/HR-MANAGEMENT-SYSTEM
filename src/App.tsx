import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom"
import {
  AlertTriangle,
  ArrowDownUp,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Columns3,
  Download,
  Ellipsis,
  Eye,
  FileText,
  Gauge,
  KeyRound,
  LayoutDashboard,
  List,
  LockKeyhole,
  LogOut,
  Menu,
  Moon,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Tag,
  Trash2,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  candidates,
  chart30,
  chart90,
  currentUser,
  designations,
  employees,
  leaveBalances,
  leaveRequests,
  leaveTypes,
  organizations,
  roles,
} from "./data/mock-data"
import { api } from "./lib/api"
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  Field,
  Input,
  Progress,
  Select,
  StatusBadge,
  Textarea,
} from "./components/ui"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "./lib/utils"

type Theme = "light" | "dark"

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "Workspace",
  },
  {
    label: "My Leave",
    href: "/my-leave",
    icon: CalendarDays,
    section: "Workspace",
  },
  { label: "Employees", href: "/employees", icon: Users, section: "People" },
  {
    label: "Leave Requests",
    href: "/leave-requests",
    icon: FileText,
    section: "People",
  },
  {
    label: "Recruitment",
    href: "/recruitment",
    icon: UserPlus,
    section: "People",
  },
  {
    label: "Designations",
    href: "/designations",
    icon: Tag,
    section: "Management",
  },
  {
    label: "Leave Types",
    href: "/leave-types",
    icon: CalendarDays,
    section: "Management",
  },
  { label: "Roles", href: "/roles", icon: ShieldCheck, section: "Management" },
  {
    label: "Organization",
    href: "/organization",
    icon: Settings,
    section: "System",
  },
  {
    label: "Organizations",
    href: "/organizations",
    icon: Building2,
    section: "System",
  },
]

function App() {
  const [theme, setTheme] = useState<Theme>(
    () => localStorage.getItem("hr-theme") as Theme || "light",
  )
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("hr-theme", theme)
  }, [theme])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/403" element={<AccessDenied />} />
        <Route path="*" element={<Shell theme={theme} setTheme={setTheme} />} />
      </Routes>
    </BrowserRouter>
  )
}

function AuthLayout({
  children,
  title,
  description,
}: {
  children: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-mark">
          <Users size={17} />
        </div>
        <span>PeopleOS</span>
      </div>
      <Card className="auth-card">
        <div className="auth-heading">
          <div className="auth-icon">
            <LockKeyhole size={20} />
          </div>
          <div className="auth-title">{title}</div>
          <div className="muted">{description}</div>
        </div>
        {children}
      </Card>
      <div className="auth-footer">
        Secure workforce management for modern teams
      </div>
    </div>
  )
}

function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("olivia@acme.co")
  const [password, setPassword] = useState("password123")
  const [error, setError] = useState("")
  const [needsOrg, setNeedsOrg] = useState(false)
  async function submit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await api.auth.login(email, password)
      navigate("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your details to sign in to your workspace."
    >
      <form className="form-stack" onSubmit={submit}>
        {error && (
          <div className="alert">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div
            className="field-link"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </div>
        </Field>
        {needsOrg && (
          <Field label="Organization ID" hint="Required for this email">
            <Input placeholder="ORG-001" />
          </Field>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="demo-trigger"
          onClick={() => setNeedsOrg((v) => !v)}
        >
          Preview multi-organization login
        </Button>
      </form>
    </AuthLayout>
  )
}

function ForgotPassword() {
  const navigate = useNavigate()
  const [sent, setSent] = useState(false)
  return (
    <AuthLayout
      title="Forgot password?"
      description="Enter your email and we'll send you a reset link."
    >
      {sent ? (
        <div className="success-state">
          <div className="success-icon">
            <Check size={20} />
          </div>
          <div className="dialog-title">Check your inbox</div>
          <div className="muted">If the email exists, a link was sent.</div>
          <Button onClick={() => navigate("/login")}>Back to sign in</Button>
        </div>
      ) : (
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <Field label="Email">
            <Input type="email" placeholder="you@company.com" />
          </Field>
          <Button type="submit">Send reset link</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/login")}
          >
            <ChevronLeft size={16} /> Back to sign in
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}

function ResetPassword() {
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const rules = [
    ["At least 10 characters", password.length >= 10],
    ["One lowercase letter", /[a-z]/.test(password)],
    ["One uppercase letter", /[A-Z]/.test(password)],
    ["One number", /\d/.test(password)],
  ] as const
  return (
    <AuthLayout
      title="Set a new password"
      description="Choose a strong password for your account."
    >
      <form
        className="form-stack"
        onSubmit={(e) => {
          e.preventDefault()
          navigate("/login")
        }}
      >
        <Field label="New password">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </Field>
        <div className="password-rules">
          {rules.map(([label, valid]) => (
            <div className={cn("rule", valid && "rule-valid")} key={label}>
              {valid ? <Check size={14} /> : <div className="rule-dot" />}
              {label}
            </div>
          ))}
        </div>
        <Field label="Confirm password">
          <Input type="password" placeholder="Repeat new password" />
        </Field>
        <Button type="submit" disabled={!rules.every((r) => r[1])}>
          Set password
        </Button>
      </form>
    </AuthLayout>
  )
}

function AccessDenied() {
  const navigate = useNavigate()
  return (
    <div className="state-page">
      <div className="state-icon">
        <LockKeyhole size={24} />
      </div>
      <div className="state-code">403</div>
      <div className="page-title">You don't have access</div>
      <div className="muted">
        Your role does not have permission to view this page.
      </div>
      <Button onClick={() => navigate("/dashboard")}>
        Return to dashboard
      </Button>
    </div>
  )
}

function Shell({
  theme,
  setTheme,
}: {
  theme: Theme
  setTheme: (theme: Theme) => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const current = navItems.find((item) =>
    location.pathname.startsWith(item.href),
  )
  useEffect(() => setMobileOpen(false), [location.pathname])
  return (
    <div className="app-root">
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={cn(
          "sidebar",
          collapsed && "sidebar-collapsed",
          mobileOpen && "sidebar-mobile-open",
        )}
      >
        <div className="sidebar-header">
          <div className="brand-mark">
            <Users size={17} />
          </div>
          {!collapsed && (
            <div className="brand-copy">
              <span>PeopleOS</span>
              <small>Acme, Inc.</small>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="collapse-button"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={collapsed ? "rotate-180" : ""} size={17} />
          </Button>
        </div>
        <nav className="sidebar-nav">
          {["Workspace", "People", "Management", "System"].map((section) => (
            <div className="nav-section" key={section}>
              {!collapsed && <div className="nav-section-label">{section}</div>}
              {navItems
                .filter((item) => item.section === section)
                .map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className={({ isActive }) =>
                        cn("nav-item", isActive && "nav-item-active")
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={17} />
                      {!collapsed && <span>{item.label}</span>}
                      {!collapsed && item.label === "Leave Requests" && (
                        <Badge variant="solid">3</Badge>
                      )}
                    </NavLink>
                  )
                })}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div
            className="profile-trigger"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <Avatar initials={currentUser.initials} />
            {!collapsed && (
              <>
                <div className="profile-copy">
                  <strong>{currentUser.name}</strong>
                  <span>{currentUser.email}</span>
                </div>
                <MoreHorizontal size={17} />
              </>
            )}
          </div>
          {profileOpen && (
            <div className="profile-menu">
              <div className="menu-label">{currentUser.role}</div>
              <div
                className="menu-item"
                onClick={() => {
                  setPasswordOpen(true)
                  setProfileOpen(false)
                }}
              >
                <KeyRound size={15} />
                Change password
              </div>
              <div className="menu-item" onClick={() => navigate("/login")}>
                <LogOut size={15} />
                Log out
              </div>
            </div>
          )}
        </div>
      </aside>
      <main className={cn("main", collapsed && "main-expanded")}>
        <header className="topbar">
          <div className="topbar-left">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={19} />
            </Button>
            <span className="breadcrumb-muted">PeopleOS</span>
            <span className="breadcrumb-slash">/</span>
            <span>{current?.label ?? "Dashboard"}</span>
          </div>
          <div className="topbar-actions">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
            <div className="top-avatar">
              <Avatar initials={currentUser.initials} size="sm" />
            </div>
          </div>
        </header>
        <div className="page-wrap">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-leave" element={<MyLeave />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/leave-requests" element={<LeaveRequests />} />
            <Route path="/recruitment" element={<Recruitment />} />
            <Route path="/designations" element={<Designations />} />
            <Route path="/leave-types" element={<LeaveTypes />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/organization" element={<Organization />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
      <PasswordDialog
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
    </div>
  )
}

function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <div className="page-header">
      <div>
        <div className="page-title">{title}</div>
        <div className="page-description">{description}</div>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}

function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string
  value: string
  detail: string
  icon: ReactNode
}) {
  return (
    <Card className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <div className="metric-icon">{icon}</div>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail">{detail}</div>
    </Card>
  )
}

function Dashboard() {
  const [range, setRange] = useState<30 | 90>(30)
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A snapshot of your organization today."
        actions={
          <>
            <Button variant="outline">
              <Download size={16} />
              Export
            </Button>
            <Button>
              <Plus size={16} />
              Add employee
            </Button>
          </>
        }
      />
      <div className="metrics-grid">
        <MetricCard
          label="Total employees"
          value="128"
          detail="+4 this month"
          icon={<Users size={18} />}
        />
        <MetricCard
          label="Active / On leave"
          value="119 / 9"
          detail="93% currently active"
          icon={<Gauge size={18} />}
        />
        <MetricCard
          label="Pending leave requests"
          value="12"
          detail="3 require your review"
          icon={<CalendarDays size={18} />}
        />
        <MetricCard
          label="Open candidates"
          value="24"
          detail="7 added this week"
          icon={<UserPlus size={18} />}
        />
      </div>
      <div className="dashboard-grid">
        <Card className="chart-card">
          <div className="card-header">
            <div>
              <div className="card-title">Leave requests over time</div>
              <div className="card-description">
                Submitted requests across the organization
              </div>
            </div>
            <div className="segmented">
              <Button
                size="sm"
                variant={range === 30 ? "default" : "ghost"}
                onClick={() => setRange(30)}
              >
                30 days
              </Button>
              <Button
                size="sm"
                variant={range === 90 ? "default" : "ghost"}
                onClick={() => setRange(90)}
              >
                90 days
              </Button>
            </div>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={range === 30 ? chart30 : chart90}
                margin={{ top: 12, right: 8, left: -28, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="currentColor"
                      stopOpacity={0.18}
                    />
                    <stop
                      offset="95%"
                      stopColor="currentColor"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="chart-grid"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                    color: "var(--foreground)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="currentColor"
                  strokeWidth={2}
                  fill="url(#areaFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="activity-card">
          <div className="card-header">
            <div>
              <div className="card-title">Today</div>
              <div className="card-description">Workforce availability</div>
            </div>
          </div>
          <div className="activity-stat">
            <div>
              <strong>119</strong>
              <span>Working</span>
            </div>
            <div>
              <strong>9</strong>
              <span>On leave</span>
            </div>
          </div>
          <div className="availability-bar">
            <span />
            <span />
          </div>
          <div className="activity-list">
            <div>
              <Avatar initials="LC" size="sm" />
              <span>
                <strong>Liam Chen</strong> starts annual leave
              </span>
            </div>
            <div>
              <Avatar initials="SP" size="sm" />
              <span>
                <strong>Sophia Patel</strong> returns tomorrow
              </span>
            </div>
          </div>
        </Card>
      </div>
      <Card className="table-card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent leave requests</div>
            <div className="card-description">
              Latest time-off activity from your team
            </div>
          </div>
          <Button variant="outline" size="sm">
            View all <ChevronRight size={15} />
          </Button>
        </div>
        <LeaveTable rows={leaveRequests.slice(0, 5)} compact />
      </Card>
    </>
  )
}

function BalanceCards() {
  return (
    <div className="balance-grid">
      {leaveBalances.map((balance) => (
        <Card className="balance-card" key={balance.name}>
          <div className="balance-head">
            <div className="card-title">{balance.name}</div>
            <Badge>{balance.remaining} days left</Badge>
          </div>
          <div className="balance-number">
            {balance.remaining}
            <span> / {balance.allocated} days</span>
          </div>
          <Progress value={(balance.used / balance.allocated) * 100} />
          <div className="balance-meta">
            <span>
              Used <strong>{balance.used}</strong>
            </span>
            <span>
              Pending <strong>{balance.pending}</strong>
            </span>
            <span>
              Allocated <strong>{balance.allocated}</strong>
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}

function MyLeave() {
  const [dialog, setDialog] = useState(false)
  return (
    <>
      <PageHeader
        title="My leave"
        description="Track your balances and time-off requests."
        actions={
          <Button onClick={() => setDialog(true)}>
            <Plus size={16} />
            Request leave
          </Button>
        }
      />
      <BalanceCards />
      <Card className="table-card">
        <div className="card-header">
          <div>
            <div className="card-title">My request history</div>
            <div className="card-description">
              Your recent and upcoming leave
            </div>
          </div>
        </div>
        <LeaveTable
          rows={leaveRequests.filter((r) =>
            ["Olivia Martin", "Ava Rodriguez"].includes(r.employee),
          )}
        />
      </Card>
      <LeaveDialog open={dialog} onClose={() => setDialog(false)} />
    </>
  )
}

function Toolbar({
  search,
  setSearch,
  children,
  action,
}: {
  search: string
  setSearch: (v: string) => void
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <div className="search-box">
          <Search size={16} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
          />
        </div>
        {children}
      </div>
      {action}
    </div>
  )
}

function DataTableFooter({ count, total }: { count: number total: number }) {
  return (
    <div className="table-footer">
      <span>
        Showing <strong>1–{count}</strong> of <strong>{total}</strong>
      </span>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious className="pointer-events-none opacity-50" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

function Employees() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("All statuses")
  const [dialog, setDialog] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const rows = employees.filter(
    (e) =>
      (e.name + e.email + e.id).toLowerCase().includes(search.toLowerCase()) &&
      (status === "All statuses" || e.status === status),
  )
  return (
    <>
      <PageHeader
        title="Employees"
        description="Manage people, roles, and employment information."
        actions={
          <Button onClick={() => setDialog(true)}>
            <Plus size={16} />
            Add employee
          </Button>
        }
      />
      <Card className="table-card">
        <Toolbar
          search={search}
          setSearch={setSearch}
          action={
            <Button variant="outline">
              <Download size={16} />
              Export
            </Button>
          }
        >
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All statuses</option>
            {["Active", "Inactive", "Terminated", "Resigned", "On Leave"].map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </Select>
          <Button variant="outline">
            <SlidersHorizontal size={16} />
            More filters
          </Button>
        </Toolbar>
        <Table>
          <TableHeader>
            <TableRow>
              <Th>Employee ID</Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Designation</Th>
              <Th>Role</Th>
              <Th>Join date</Th>
              <Th>Status</Th>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="mono">{employee.id}</TableCell>
                <TableCell>
                  <div className="person-cell">
                    <Avatar
                      initials={employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                      size="sm"
                    />
                    <strong>{employee.name}</strong>
                  </div>
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell className="muted-cell">{employee.phone}</TableCell>
                <TableCell>{employee.designation}</TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell>{employee.joinDate}</TableCell>
                <TableCell>
                  <StatusBadge status={employee.status} />
                </TableCell>
                <TableCell>
                  <RowActions
                    onDelete={() => setConfirm(true)}
                    deleteLabel="Terminate"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DataTableFooter count={rows.length} total={128} />
      </Card>
      <EmployeeDialog open={dialog} onClose={() => setDialog(false)} />
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Terminate employee?"
        description="This will immediately revoke their access. Their historical records will be kept."
        action="Terminate employee"
      />
    </>
  )
}

function Th({ children }: { children?: ReactNode }) {
  return (
    <TableHead>
      <span className="th-content">
        {children}
        {children && <ArrowDownUp size={12} />}
      </span>
    </TableHead>
  )
}

function RowActions({
  onDelete,
  deleteLabel = "Delete",
}: {
  onDelete?: () => void
  deleteLabel?: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open row actions">
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>
          <Eye size={15} />
          View
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pencil size={15} />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 size={15} />
          {deleteLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function EmployeeDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add employee"
      description="Create a new employee profile. They will receive an invitation email."
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
      >
        <div className="form-grid">
          <Field label="Employee ID">
            <Input placeholder="EMP-008" />
          </Field>
          <Field label="Employment status">
            <Select>
              <option>Active</option>
              <option>Inactive</option>
              <option>On Leave</option>
            </Select>
          </Field>
          <Field label="First name">
            <Input placeholder="First name" />
          </Field>
          <Field label="Last name">
            <Input placeholder="Last name" />
          </Field>
          <Field label="Email">
            <Input type="email" placeholder="name@company.com" />
          </Field>
          <Field label="Phone">
            <Input placeholder="+1 555 000 0000" />
          </Field>
          <Field label="Designation">
            <Select>
              <option>Select designation</option>
              {designations.map((d) => (
                <option key={d.id}>{d.title}</option>
              ))}
            </Select>
          </Field>
          <Field label="Role">
            <Select>
              <option>Select role</option>
              {roles.map((r) => (
                <option key={r.id}>{r.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Date of birth">
            <Input type="date" />
          </Field>
          <Field label="Join date">
            <Input type="date" />
          </Field>
          <div className="span-2">
            <Field label="Address">
              <Textarea placeholder="Street, city, state, postal code" />
            </Field>
          </div>
        </div>
        <div className="helper-box">
          <KeyRound size={16} />
          <div>
            <strong>No password needed</strong>
            <span>A password setup email will be sent to the employee.</span>
          </div>
        </div>
        <DialogActions onClose={onClose} action="Add employee" />
      </form>
    </Dialog>
  )
}

function LeaveTable({
  rows,
  compact = false,
  actions = false,
}: {
  rows: typeof leaveRequests
  compact?: boolean
  actions?: boolean
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <Th>Employee</Th>
          <Th>Leave type</Th>
          <Th>Dates</Th>
          <Th>Days</Th>
          {!compact && <Th>Reason</Th>}
          <Th>Status</Th>
          {actions && <TableHead />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((request) => (
          <TableRow key={request.id}>
            <TableCell>
              <div className="person-cell">
                <Avatar initials={request.initials} size="sm" />
                <div>
                  <strong>{request.employee}</strong>
                  <span>{request.id}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>{request.type}</TableCell>
            <TableCell>
              {request.startDate} <span className="date-arrow">→</span>{" "}
              {request.endDate}
            </TableCell>
            <TableCell>{request.days}</TableCell>
            {!compact && (
              <TableCell className="reason-cell">{request.reason}</TableCell>
            )}
            <TableCell>
              <StatusBadge status={request.status} />
            </TableCell>
            {actions && (
              <TableCell>
                <div className="row-actions">
                  {request.status === "Pending" && (
                    <>
                      <Button variant="outline" size="sm">
                        Reject
                      </Button>
                      <Button size="sm">Approve</Button>
                    </>
                  )}
                  <RowActions deleteLabel="Cancel request" />
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function LeaveRequests() {
  const [tab, setTab] = useState("Pending")
  const [search, setSearch] = useState("")
  const [dialog, setDialog] = useState(false)
  const rows = leaveRequests.filter(
    (r) =>
      (tab === "All" || r.status === tab) &&
      r.reason.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <>
      <PageHeader
        title="Leave requests"
        description="Review and manage time-off across your organization."
        actions={
          <Button onClick={() => setDialog(true)}>
            <Plus size={16} />
            New request
          </Button>
        }
      />
      <Card className="table-card">
        <Tabs value={tab} onValueChange={setTab} className="border-b px-4 pt-3">
          <TabsList variant="line">
            {["Pending", "Approved", "Rejected", "Cancelled", "All"].map(
              (item) => (
                <TabsTrigger value={item} key={item}>
                  {item}
                  {item === "Pending" && <Badge variant="muted">3</Badge>}
                </TabsTrigger>
              ),
            )}
          </TabsList>
        </Tabs>
        <Toolbar search={search} setSearch={setSearch}>
          <Select>
            <option>All employees</option>
            {employees.slice(0, 4).map((e) => (
              <option key={e.id}>{e.name}</option>
            ))}
          </Select>
          <Input type="date" className="date-input" />
        </Toolbar>
        {rows.length ? (
          <LeaveTable rows={rows} actions />
        ) : (
          <EmptyState
            icon={<CalendarDays size={24} />}
            title="No leave requests"
            description="There are no requests matching these filters."
            action="Clear filters"
            onAction={() => {
              setTab("All")
              setSearch("")
            }}
          />
        )}
        <DataTableFooter count={rows.length} total={leaveRequests.length} />
      </Card>
      <LeaveDialog open={dialog} onClose={() => setDialog(false)} hr />
    </>
  )
}

function LeaveDialog({
  open,
  onClose,
  hr = false,
}: {
  open: boolean
  onClose: () => void
  hr?: boolean
}) {
  const [days, setDays] = useState(4)
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New leave request"
      description="Submit time off for review."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        className="form-stack"
      >
        {hr && (
          <Field label="Employee" hint="Optional">
            <Select>
              <option>Myself</option>
              {employees.map((e) => (
                <option key={e.id}>{e.name}</option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Leave type">
          <Select>
            <option>Annual leave</option>
            <option>Sick leave</option>
            <option>Personal leave</option>
          </Select>
        </Field>
        <div className="form-grid">
          <Field label="Start date">
            <Input type="date" defaultValue="2025-06-24" />
          </Field>
          <Field label="End date">
            <Input
              type="date"
              defaultValue="2025-06-27"
              onChange={() => setDays(4)}
            />
          </Field>
        </div>
        <div className="leave-preview">
          <div>
            <span>Total days</span>
            <strong>{days} days</strong>
          </div>
          <div>
            <span>Remaining after request</span>
            <strong>8 days</strong>
          </div>
          <Progress value={60} />
        </div>
        <Field label="Reason" hint="0 / 500">
          <Textarea
            maxLength={500}
            placeholder="Add a brief reason for your request"
          />
        </Field>
        <div className="form-note">
          <AlertTriangle size={15} />A request cannot span two calendar years.
        </div>
        <DialogActions onClose={onClose} action="Submit request" />
      </form>
    </Dialog>
  )
}

function Recruitment() {
  const [view, setView] = useState<"board" | "table">("board")
  const [search, setSearch] = useState("")
  const [dialog, setDialog] = useState(false)
  const filtered = candidates.filter((c) =>
    (c.name + c.role).toLowerCase().includes(search.toLowerCase()),
  )
  const columns = [
    "Applied",
    "Screening",
    "Interview",
    "Technical Test",
    "Offer",
    "Hired",
    "Rejected",
    "On Hold",
  ]
  return (
    <>
      <PageHeader
        title="Recruitment"
        description="Track candidates through every stage of your hiring pipeline."
        actions={
          <>
            <div className="view-toggle">
              <Button
                size="icon"
                variant={view === "board" ? "default" : "ghost"}
                onClick={() => setView("board")}
              >
                <Columns3 size={16} />
              </Button>
              <Button
                size="icon"
                variant={view === "table" ? "default" : "ghost"}
                onClick={() => setView("table")}
              >
                <List size={16} />
              </Button>
            </div>
            <Button onClick={() => setDialog(true)}>
              <Plus size={16} />
              Add candidate
            </Button>
          </>
        }
      />
      <div className="recruit-toolbar">
        <div className="search-box">
          <Search size={16} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates..."
          />
        </div>
        <Select>
          <option>All roles</option>
          <option>Engineering</option>
          <option>Design</option>
        </Select>
      </div>
      {view === "board" ? (
        <div className="kanban">
          {columns.map((status) => {
            const items = filtered.filter((c) => c.status === status)
            return (
              <div className="kanban-column" key={status}>
                <div className="kanban-head">
                  <span>{status}</span>
                  <Badge>{items.length}</Badge>
                </div>
                <div className="kanban-stack">
                  {items.map((candidate) => (
                    <Card className="candidate-card" key={candidate.id}>
                      <div className="candidate-top">
                        <Avatar
                          initials={candidate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        />
                        <RowActions />
                      </div>
                      <strong>{candidate.name}</strong>
                      <span className="candidate-role">{candidate.role}</span>
                      <div className="skill-row">
                        {candidate.skills.map((s) => (
                          <Badge key={s}>{s}</Badge>
                        ))}
                      </div>
                      <div className="candidate-foot">
                        <span>{candidate.source}</span>
                        <span>{candidate.applied}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card className="table-card">
          <Table>
            <TableHeader>
              <TableRow>
                <Th>Candidate</Th>
                <Th>Position</Th>
                <Th>Experience</Th>
                <Th>Source</Th>
                <Th>Skills</Th>
                <Th>Status</Th>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="person-cell">
                      <Avatar
                        initials={c.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                        size="sm"
                      />
                      <div>
                        <strong>{c.name}</strong>
                        <span>{c.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{c.role}</TableCell>
                  <TableCell>{c.experience} years</TableCell>
                  <TableCell>{c.source}</TableCell>
                  <TableCell>
                    <div className="skill-row">
                      {c.skills.map((s) => (
                        <Badge key={s}>{s}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell>
                    <RowActions />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DataTableFooter count={filtered.length} total={24} />
        </Card>
      )}
      <CandidateDialog open={dialog} onClose={() => setDialog(false)} />
    </>
  )
}

function CandidateDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add candidate"
      description="Add a candidate to your recruitment pipeline."
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
      >
        <div className="form-grid">
          <Field label="Candidate ID">
            <Input placeholder="CAN-207" />
          </Field>
          <Field label="Status">
            <Select>
              {[
                "Applied",
                "Screening",
                "Interview",
                "Technical Test",
                "Offer",
                "Hired",
                "Rejected",
                "On Hold",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="First name">
            <Input />
          </Field>
          <Field label="Last name">
            <Input />
          </Field>
          <Field label="Email">
            <Input type="email" />
          </Field>
          <Field label="Phone">
            <Input />
          </Field>
          <Field label="Current position">
            <Input />
          </Field>
          <Field label="Experience (years)">
            <Input type="number" min="0" />
          </Field>
          <Field label="Source">
            <Select>
              {[
                "LinkedIn",
                "Indeed",
                "Referral",
                "Company Website",
                "Email",
                "Other",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Skills" hint="Press Enter to add">
            <Input placeholder="e.g. React, Figma" />
          </Field>
          <div className="span-2">
            <Field label="Notes">
              <Textarea placeholder="Interview notes or additional context" />
            </Field>
          </div>
        </div>
        <DialogActions onClose={onClose} action="Add candidate" />
      </form>
    </Dialog>
  )
}

function ResourceTable({
  type,
}: {
  type: "designations" | "leave-types" | "roles"
}) {
  const [search, setSearch] = useState("")
  const [dialog, setDialog] = useState(false)
  const config =
    type === "designations"
      ? {
          title: "Designations",
          description: "Define job titles used across your organization.",
          singular: "designation",
          data: designations,
        }
      : type === "leave-types"
        ? {
            title: "Leave types",
            description:
              "Configure time-off categories and annual allocations.",
            singular: "leave type",
            data: leaveTypes,
          }
        : {
            title: "Roles",
            description: "Manage roles and permission sets for your workforce.",
            singular: "role",
            data: roles,
          }
  const rows = config.data.filter((r) =>
    JSON.stringify(r).toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <Button onClick={() => setDialog(true)}>
            <Plus size={16} />
            Add {config.singular}
          </Button>
        }
      />
      <Card className="table-card">
        <Toolbar search={search} setSearch={setSearch}>
          <Select>
            <option>All statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </Select>
        </Toolbar>
        <Table>
          <TableHeader>
            <TableRow>
              <Th>ID</Th>
              <Th>
                {type === "roles"
                  ? "Role name"
                  : type === "leave-types"
                    ? "Name"
                    : "Title"}
              </Th>
              <Th>Description</Th>
              <Th>
                {type === "leave-types"
                  ? "Annual allocation"
                  : type === "roles"
                    ? "Users / Permissions"
                    : "Employees"}
              </Th>
              <Th>Status</Th>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row: any) => (
              <TableRow key={row.id}>
                <TableCell className="mono">{row.id}</TableCell>
                <TableCell>
                  <strong>{row.title ?? row.name}</strong>
                </TableCell>
                <TableCell className="muted-cell">{row.description}</TableCell>
                <TableCell>
                  {type === "leave-types"
                    ? `${row.allocation} days`
                    : type === "roles"
                      ? `${row.users} users · ${row.permissions} permissions`
                      : row.employees}
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell>
                  <RowActions />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DataTableFooter count={rows.length} total={rows.length} />
      </Card>
      <ResourceDialog
        type={type}
        open={dialog}
        onClose={() => setDialog(false)}
      />
    </>
  )
}

function Designations() {
  return <ResourceTable type="designations" />
}
function LeaveTypes() {
  return <ResourceTable type="leave-types" />
}
function Roles() {
  return <ResourceTable type="roles" />
}

function ResourceDialog({
  type,
  open,
  onClose,
}: {
  type: "designations" | "leave-types" | "roles"
  open: boolean
  onClose: () => void
}) {
  const singular =
    type === "leave-types"
      ? "leave type"
      : type === "roles"
        ? "role"
        : "designation"
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Add ${singular}`}
      description={`Create a new ${singular} for your organization.`}
      wide={type === "roles"}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        className="form-stack"
      >
        <div className="form-grid">
          <Field label={`${singular[0].toUpperCase() + singular.slice(1)} ID`}>
            <Input
              placeholder={
                type === "roles"
                  ? "ROL-005"
                  : type === "leave-types"
                    ? "LT-005"
                    : "DES-005"
              }
            />
          </Field>
          <Field label="Status">
            <Select>
              <option>Active</option>
              <option>Inactive</option>
            </Select>
          </Field>
          <div className="span-2">
            <Field
              label={
                type === "roles"
                  ? "Role name"
                  : type === "leave-types"
                    ? "Name"
                    : "Title"
              }
            >
              <Input />
            </Field>
          </div>
          <div className="span-2">
            <Field label="Description">
              <Textarea />
            </Field>
          </div>
          {type === "leave-types" && (
            <Field label="Annual allocation" hint="0–366 days">
              <Input type="number" min="0" max="366" />
            </Field>
          )}
        </div>
        {type === "roles" && <Permissions />}
        <DialogActions onClose={onClose} action={`Add ${singular}`} />
      </form>
    </Dialog>
  )
}

function Permissions() {
  const groups = [
    ["Employee", "Read", "Create", "Update", "Delete"],
    ["Role", "Read", "Manage"],
    ["Designation", "Manage"],
    ["Leave type", "Manage"],
    ["Leave", "Read all", "Approve"],
    ["Candidate", "Read", "Manage"],
    ["Organization", "Manage"],
    ["System", "Admin"],
  ]
  return (
    <div className="permissions">
      <div className="permissions-head">
        <div>
          <strong>Permissions</strong>
          <span>Choose what this role can access.</span>
        </div>
        <label className="check-label">
          <Checkbox /> * All permissions
        </label>
      </div>
      {groups.map(([group, ...items]) => (
        <div className="permission-row" key={group}>
          <strong>{group}</strong>
          <div>
            {items.map((item) => (
              <label className="check-label" key={item}>
                <Checkbox />
                {item}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Organization() {
  const [saved, setSaved] = useState(false)
  return (
    <>
      <PageHeader
        title="Organization settings"
        description="Manage your company profile and workspace settings."
      />
      <div className="settings-layout">
        <div className="settings-nav">
          <div className="settings-nav-item active">
            <Building2 size={16} />
            General
          </div>
          <div className="settings-nav-item">
            <ShieldCheck size={16} />
            Security
          </div>
          <div className="settings-nav-item">
            <UserCog size={16} />
            Members
          </div>
        </div>
        <Card className="settings-card">
          <div className="card-header">
            <div>
              <div className="card-title">Organization profile</div>
              <div className="card-description">
                This information appears throughout your workspace.
              </div>
            </div>
          </div>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault()
              setSaved(true)
              setTimeout(() => setSaved(false), 2500)
            }}
          >
            <div className="org-logo-row">
              <div className="org-logo">A</div>
              <div>
                <Button variant="outline" size="sm">
                  Change logo
                </Button>
                <div className="field-help">Square image, up to 2 MB.</div>
              </div>
            </div>
            <Field label="Organization name">
              <Input defaultValue="Acme, Inc." />
            </Field>
            <Field label="Organization ID">
              <Input defaultValue="ORG-001" disabled />
            </Field>
            <Field label="Description">
              <Textarea defaultValue="Building tools that help modern teams do their best work." />
            </Field>
            <Field label="Status">
              <Select defaultValue="Active">
                <option>Active</option>
                <option>Inactive</option>
              </Select>
            </Field>
            <div className="settings-actions">
              {saved && (
                <span className="saved-message">
                  <Check size={15} />
                  Changes saved
                </span>
              )}
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}

function Organizations() {
  const [search, setSearch] = useState("")
  const [dialog, setDialog] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const rows = organizations.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <>
      <PageHeader
        title="Organizations"
        description="Create and manage organizations across the system."
        actions={
          <Button onClick={() => setDialog(true)}>
            <Plus size={16} />
            Create organization
          </Button>
        }
      />
      <Card className="table-card">
        <Toolbar search={search} setSearch={setSearch}>
          <Select>
            <option>All statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </Select>
        </Toolbar>
        <Table>
          <TableHeader>
            <TableRow>
              <Th>Organization</Th>
              <Th>Organization ID</Th>
              <Th>Slug</Th>
              <Th>Employees</Th>
              <Th>Created</Th>
              <Th>Status</Th>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <div className="person-cell">
                    <Avatar initials={org.name[0]} size="sm" />
                    <strong>{org.name}</strong>
                  </div>
                </TableCell>
                <TableCell className="mono">{org.id}</TableCell>
                <TableCell>{org.slug}</TableCell>
                <TableCell>{org.employees}</TableCell>
                <TableCell>{org.created}</TableCell>
                <TableCell>
                  <StatusBadge status={org.status} />
                </TableCell>
                <TableCell>
                  <RowActions onDelete={() => setConfirm(true)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DataTableFooter count={rows.length} total={rows.length} />
      </Card>
      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        title="Create organization"
        description="Set up a new organization workspace."
      >
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault()
            setDialog(false)
          }}
        >
          <Field label="Organization name">
            <Input placeholder="Company name" />
          </Field>
          <Field label="Organization ID">
            <Input placeholder="ORG-004" />
          </Field>
          <Field label="Description">
            <Textarea placeholder="What does this organization do?" />
          </Field>
          <DialogActions
            onClose={() => setDialog(false)}
            action="Create organization"
          />
        </form>
      </Dialog>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete organization?"
        description="This permanently removes the organization and all associated records. This action cannot be undone."
        action="Delete organization"
      />
    </>
  )
}

function PasswordDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Change password"
      description="Update the password you use to sign in."
    >
      <form
        className="form-stack"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
      >
        <Field label="Current password">
          <Input type="password" />
        </Field>
        <Field label="New password">
          <Input type="password" />
          <div className="field-help">
            At least 10 characters with upper, lower, and a number.
          </div>
        </Field>
        <Field label="Confirm new password">
          <Input type="password" />
        </Field>
        <DialogActions onClose={onClose} action="Change password" />
      </form>
    </Dialog>
  )
}

function DialogActions({
  onClose,
  action,
}: {
  onClose: () => void
  action: string
}) {
  return (
    <div className="dialog-actions">
      <Button type="button" variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit">{action}</Button>
    </div>
  )
}

function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  action,
}: {
  open: boolean
  onClose: () => void
  title: string
  description: string
  action: string
}) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="confirm-callout">
          <AlertTriangle size={18} />
          <span>Please confirm that you want to continue.</span>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClose}>{action}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function EmptyState({
  icon,
  title,
  description,
  action,
  onAction,
}: {
  icon: ReactNode
  title: string
  description: string
  action: string
  onAction: () => void
}) {
  return (
    <div className="empty-state">
      <div className="state-icon">{icon}</div>
      <strong>{title}</strong>
      <span>{description}</span>
      <Button variant="outline" size="sm" onClick={onAction}>
        {action}
      </Button>
    </div>
  )
}

export default App
