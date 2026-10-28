export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r bg-white p-4">
        <nav className="flex flex-col gap-1 text-sm">
          <a href="/employees" className="rounded px-3 py-2 hover:bg-zinc-100">Employees</a>
          <a href="/leave" className="rounded px-3 py-2 hover:bg-zinc-100">Leave</a>
          <a href="/candidates" className="rounded px-3 py-2 hover:bg-zinc-100">Candidates</a>
          <a href="/roles" className="rounded px-3 py-2 hover:bg-zinc-100">Roles</a>
          <a href="/organization" className="rounded px-3 py-2 hover:bg-zinc-100">Organization</a>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
