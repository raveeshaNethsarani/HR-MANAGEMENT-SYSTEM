"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight, Download, Plus, Users, Gauge, CalendarDays, UserPlus } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button, Card } from "@/components/ui";
import { leaveRequests, chart30, chart90 } from "@/data/mock-data";
import { Avatar } from "@/components/ui";
import { LeaveTable } from "@/app/components/LeaveTable";
import { PageHeader } from "@/app/components/PageHeader";

function MetricCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
  return (
    <Card className="metric-card">
      <div className="metric-top"><span>{label}</span><div className="metric-icon">{icon}</div></div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail">{detail}</div>
    </Card>
  );
}

export default function DashboardPage() {
  const [range, setRange] = useState<30 | 90>(30);
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A snapshot of your organization today."
        actions={
          <>
            <Button variant="outline"><Download size={16} />Export</Button>
            <Button><Plus size={16} />Add employee</Button>
          </>
        }
      />
      <div className="metrics-grid">
        <MetricCard label="Total employees" value="128" detail="+4 this month" icon={<Users size={18} />} />
        <MetricCard label="Active / On leave" value="119 / 9" detail="93% currently active" icon={<Gauge size={18} />} />
        <MetricCard label="Pending leave requests" value="12" detail="3 require your review" icon={<CalendarDays size={18} />} />
        <MetricCard label="Open candidates" value="24" detail="7 added this week" icon={<UserPlus size={18} />} />
      </div>
      <div className="dashboard-grid">
        <Card className="chart-card">
          <div className="card-header">
            <div>
              <div className="card-title">Leave requests over time</div>
              <div className="card-description">Submitted requests across the organization</div>
            </div>
            <div className="segmented">
              <Button size="sm" variant={range === 30 ? "default" : "ghost"} onClick={() => setRange(30)}>30 days</Button>
              <Button size="sm" variant={range === 90 ? "default" : "ghost"} onClick={() => setRange(90)}>90 days</Button>
            </div>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={range === 30 ? chart30 : chart90} margin={{ top: 12, right: 8, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="currentColor" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="chart-grid" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", color: "var(--foreground)", fontSize: 12 }} />
                <Area type="monotone" dataKey="requests" stroke="currentColor" strokeWidth={2} fill="url(#areaFill)" />
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
            <div><strong>119</strong><span>Working</span></div>
            <div><strong>9</strong><span>On leave</span></div>
          </div>
          <div className="availability-bar"><span /><span /></div>
          <div className="activity-list">
            <div><Avatar initials="LC" size="sm" /><span><strong>Liam Chen</strong> starts annual leave</span></div>
            <div><Avatar initials="SP" size="sm" /><span><strong>Sophia Patel</strong> returns tomorrow</span></div>
          </div>
        </Card>
      </div>
      <Card className="table-card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent leave requests</div>
            <div className="card-description">Latest time-off activity from your team</div>
          </div>
          <Button variant="outline" size="sm">View all <ChevronRight size={15} /></Button>
        </div>
        <LeaveTable rows={leaveRequests.slice(0, 5)} compact />
      </Card>
    </>
  );
}
