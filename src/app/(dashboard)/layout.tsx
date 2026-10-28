"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays, ChevronLeft, FileText, Gauge, KeyRound,
  LayoutDashboard, LogOut, Menu, Moon, MoreHorizontal,
  Settings, ShieldCheck, Sun, Tag, Building2, UserPlus, Users,
} from "lucide-react";
import { Avatar, Badge, Button, Dialog } from "@/components/ui";
import { Field, Input } from "@/components/ui";
import { DialogActions } from "@/components/ui";
import { currentUser } from "@/data/mock-data";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const navItems = [
  { label: "Dashboard",      href: "/dashboard",      icon: LayoutDashboard, section: "Workspace" },
  { label: "My Leave",       href: "/my-leave",       icon: CalendarDays,    section: "Workspace" },
  { label: "Employees",      href: "/employees",      icon: Users,           section: "People" },
  { label: "Leave Requests", href: "/leave-requests", icon: FileText,        section: "People" },
  { label: "Recruitment",    href: "/recruitment",    icon: UserPlus,        section: "People" },
  { label: "Designations",   href: "/designations",   icon: Tag,             section: "Management" },
  { label: "Leave Types",    href: "/leave-types",    icon: CalendarDays,    section: "Management" },
  { label: "Roles",          href: "/roles",          icon: ShieldCheck,     section: "Management" },
  { label: "Organization",   href: "/organization",   icon: Settings,        section: "System" },
  { label: "Organizations",  href: "/organizations",  icon: Building2,       section: "System" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>(() =>
    (typeof window !== "undefined" ? localStorage.getItem("hr-theme") : null) as Theme || "light"
  );
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("hr-theme", theme);
  }, [theme]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const current = navItems.find((item) => pathname.startsWith(item.href));

  async function handleLogout() {
    await api.auth.logout();
    router.push("/login");
  }

  return (
    <div className="app-root">
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}
      <aside className={cn("sidebar", collapsed && "sidebar-collapsed", mobileOpen && "sidebar-mobile-open")}>
        <div className="sidebar-header">
          <div className="brand-mark"><Users size={17} /></div>
          {!collapsed && (
            <div className="brand-copy">
              <span>PeopleOS</span>
              <small>Acme, Inc.</small>
            </div>
          )}
          <Button variant="ghost" size="icon" className="collapse-button" onClick={() => setCollapsed(!collapsed)}>
            <ChevronLeft className={collapsed ? "rotate-180" : ""} size={17} />
          </Button>
        </div>
        <nav className="sidebar-nav">
          {["Workspace", "People", "Management", "System"].map((section) => (
            <div className="nav-section" key={section}>
              {!collapsed && <div className="nav-section-label">{section}</div>}
              {navItems.filter((item) => item.section === section).map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn("nav-item", isActive && "nav-item-active")}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={17} />
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && item.label === "Leave Requests" && <Badge variant="solid">3</Badge>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
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
              <div className="menu-item" onClick={() => { setPasswordOpen(true); setProfileOpen(false); }}>
                <KeyRound size={15} /> Change password
              </div>
              <div className="menu-item" onClick={handleLogout}>
                <LogOut size={15} /> Log out
              </div>
            </div>
          )}
        </div>
      </aside>
      <main className={cn("main", collapsed && "main-expanded")}>
        <header className="topbar">
          <div className="topbar-left">
            <Button variant="ghost" size="icon" className="mobile-menu" onClick={() => setMobileOpen(true)}>
              <Menu size={19} />
            </Button>
            <span className="breadcrumb-muted">PeopleOS</span>
            <span className="breadcrumb-slash">/</span>
            <span>{current?.label ?? "Dashboard"}</span>
          </div>
          <div className="topbar-actions">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
            <div className="top-avatar"><Avatar initials={currentUser.initials} size="sm" /></div>
          </div>
        </header>
        <div className="page-wrap">{children}</div>
      </main>
      <PasswordDialog open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </div>
  );
}

function PasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Change password" description="Update the password you use to sign in.">
      <form className="form-stack" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
        <Field label="Current password"><Input type="password" /></Field>
        <Field label="New password"><Input type="password" /></Field>
        <Field label="Confirm new password"><Input type="password" /></Field>
        <DialogActions onClose={onClose} action="Change password" />
      </form>
    </Dialog>
  );
}
