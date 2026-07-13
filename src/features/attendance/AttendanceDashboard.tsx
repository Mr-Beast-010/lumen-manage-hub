import { motion } from "framer-motion";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  Users, UserCheck, UserX, GraduationCap, Clock, CalendarOff, AlertTriangle,
  CheckCircle2, Info, ClipboardList, Bell,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { AttendanceHeatmap } from "@/features/students/profile/AttendanceHeatmap";
import { cn } from "@/lib/utils";
import {
  studentTodayAttendance, teacherTodayAttendance, summarize,
  dailyTrend, weeklyTrend, monthlyTrend, heatmapData,
  pendingClasses, todaysClasses, recentUpdates, attendanceAlerts,
} from "./data";

const chartTheme = { grid: "hsl(var(--border))", axis: "hsl(var(--muted-foreground))" };
const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 };

function Panel({ title, children, action, className }: { title: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      <header className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        {action}
      </header>
      {children}
    </section>
  );
}

const severityTone: Record<string, string> = {
  critical: "border-destructive/40 bg-destructive/5 text-destructive",
  warning: "border-warning/40 bg-warning/5 text-warning",
  info: "border-primary/30 bg-primary/5 text-primary",
};

const severityIcon = {
  critical: AlertTriangle,
  warning: Clock,
  info: Info,
} as const;

export function AttendanceDashboard() {
  const s = summarize(studentTodayAttendance);
  const t = summarize(teacherTodayAttendance);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Students Present" value={String(s.present)} delta={2} hint="today" icon={UserCheck} index={0} />
        <StatCard label="Students Absent" value={String(s.absent)} delta={-1} hint="today" icon={UserX} index={1} />
        <StatCard label="Teachers Present" value={String(t.present)} delta={1} hint="today" icon={GraduationCap} index={2} />
        <StatCard label="Teachers Absent" value={String(t.absent)} delta={0} hint="today" icon={Users} index={3} />
        <StatCard label="Late Arrivals" value={String(s.late + t.late)} delta={-3} hint="today" icon={Clock} index={4} />
        <StatCard label="On Leave" value={String(s.leave + t.leave)} hint="today" icon={CalendarOff} index={5} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Daily attendance trend" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend}>
                <defs>
                  <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke={chartTheme.axis} fontSize={12} />
                <YAxis stroke={chartTheme.axis} fontSize={12} domain={[70, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="students" stroke="hsl(var(--primary))" fill="url(#gS)" strokeWidth={2} />
                <Area type="monotone" dataKey="teachers" stroke="hsl(var(--accent))" fill="url(#gT)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Weekly attendance">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrend}>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke={chartTheme.axis} fontSize={12} />
                <YAxis stroke={chartTheme.axis} fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="present" stackId="a" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="late" stackId="a" fill="hsl(var(--warning))" />
                <Bar dataKey="absent" stackId="a" fill="hsl(var(--destructive))" />
                <Bar dataKey="leave" stackId="a" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Monthly attendance">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke={chartTheme.axis} fontSize={12} />
                <YAxis stroke={chartTheme.axis} fontSize={12} domain={[80, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="students" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="teachers" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Attendance heatmap" className="lg:col-span-2">
          <AttendanceHeatmap data={heatmapData} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Pending attendance" action={<span className="text-xs text-muted-foreground">{pendingClasses.length} classes</span>}>
          <ul className="space-y-2">
            {pendingClasses.map((p, i) => (
              <motion.li
                key={p.classSection + p.period}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }}
                className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning ring-1 ring-warning/30">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Grade {p.classSection}</p>
                    <p className="text-xs text-muted-foreground">{p.period} · {p.time} · {p.teacher}</p>
                  </div>
                </div>
                <span className="rounded-md bg-warning/10 px-2 py-1 text-xs font-medium text-warning ring-1 ring-warning/30">Pending</span>
              </motion.li>
            ))}
          </ul>
        </Panel>

        <Panel title="Today's classes">
          <ul className="space-y-2">
            {todaysClasses.map((c, i) => (
              <motion.li
                key={c.period}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }}
                className="flex items-center justify-between rounded-xl border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.subject} · Grade {c.classSection}</p>
                    <p className="text-xs text-muted-foreground">{c.period} · {c.time} · {c.room}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{c.time}</span>
              </motion.li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Recent attendance updates">
          <ul className="space-y-3">
            {recentUpdates.map((u, i) => (
              <motion.li
                key={u.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success ring-1 ring-success/20">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{u.actor}</span> {u.action}{" "}
                    <span className="font-medium">{u.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{u.time}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </Panel>

        <Panel title="Attendance alerts" action={<Bell className="h-4 w-4 text-muted-foreground" />}>
          <ul className="space-y-3">
            {attendanceAlerts.map((a, i) => {
              const Icon = severityIcon[a.severity];
              return (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }}
                  className={cn("flex items-start gap-3 rounded-xl border p-3", severityTone[a.severity])}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs opacity-90">{a.detail}</p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
