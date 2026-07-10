import { motion } from "framer-motion";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  Users, GraduationCap, Briefcase, UserPlus, UserCheck, PlaneTakeoff,
  Cake, Clock, ArrowRight, MailCheck,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { TeacherRecord } from "./data";
import { teacherAnalytics, leaveRequests, todayScheduleData } from "./data";

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const DEPT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary-glow))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--primary) / 0.6)",
];

interface Props {
  rows: TeacherRecord[];
  onAdd: () => void;
}

export function TeacherAnalytics({ rows, onAdd }: Props) {
  const a = teacherAnalytics(rows);

  const stats = [
    { label: "Total Staff", value: String(a.total), delta: 4, hint: "vs last month", icon: Users },
    { label: "Teaching Staff", value: String(a.teaching), hint: `${Math.round((a.teaching / Math.max(a.total, 1)) * 100)}%`, icon: GraduationCap },
    { label: "Non-Teaching", value: String(a.nonTeaching), hint: `${Math.round((a.nonTeaching / Math.max(a.total, 1)) * 100)}%`, icon: Briefcase },
    { label: "New Hires", value: String(a.newHires), delta: 15, hint: "last 12 mo", icon: UserPlus },
    { label: "Active Staff", value: String(a.active), delta: 2, hint: "on duty", icon: UserCheck },
    { label: "On Leave", value: String(a.onLeave), hint: "today", icon: PlaneTakeoff },
  ];

  const recentHires = [...rows]
    .sort((a, b) => b.joinedOn.localeCompare(a.joinedOn))
    .slice(0, 5);

  const today = new Date();
  const in30 = new Date(today);
  in30.setDate(today.getDate() + 30);
  const birthdays = rows
    .map((r) => {
      const [, m, d] = r.dob.split("-").map(Number);
      const next = new Date(today.getFullYear(), m - 1, d);
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      return { ...r, next };
    })
    .filter((r) => r.next <= in30)
    .sort((a, b) => a.next.getTime() - b.next.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s, i) => (<StatCard key={s.label} {...s} index={i} />))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }} className="lg:col-span-2">
          <Card className="h-full rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-semibold">Staff Attendance Trend</CardTitle>
                <p className="text-xs text-muted-foreground">Weekly average</p>
              </div>
              <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">This week</span>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={a.attendanceTrend}>
                  <defs>
                    <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="attendance" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#attGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="h-full rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Department Distribution</CardTitle>
              <p className="text-xs text-muted-foreground">Staff across departments</p>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={a.departmentDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3} stroke="none">
                    {a.departmentDist.map((_, i) => (
                      <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px]">
                {a.departmentDist.slice(0, 6).map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Experience Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">Years of teaching / service</p>
          </CardHeader>
          <CardContent className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={a.experienceDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-semibold">Today's Schedule</CardTitle>
              <p className="text-xs text-muted-foreground">Classes and sessions</p>
            </div>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-2">
            {todayScheduleData.map((s) => (
              <div key={s.period} className="flex items-center gap-3 rounded-xl p-2 transition-smooth hover:bg-secondary/50">
                <div className="w-14 text-xs font-medium tabular-nums text-primary">{s.time}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.subject}</p>
                  <p className="text-xs text-muted-foreground">{s.period} · {s.classLabel}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-semibold">Recent Hires</CardTitle>
              <p className="text-xs text-muted-foreground">New joiners</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">All <ArrowRight className="ml-1 h-3 w-3" /></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentHires.map((r) => (
              <div key={r.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8 ring-1 ring-border">
                  <AvatarImage src={r.photo} alt="" />
                  <AvatarFallback>{r.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.designation} · {r.department}</p>
                </div>
                <span className="text-xs text-muted-foreground">{r.joinedOn.slice(0, 7)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-semibold">Upcoming Birthdays</CardTitle>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </div>
            <Cake className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            {birthdays.length === 0 && (
              <p className="text-sm text-muted-foreground">No birthdays this month.</p>
            )}
            {birthdays.map((r) => (
              <div key={r.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8 ring-1 ring-border">
                  <AvatarImage src={r.photo} alt="" />
                  <AvatarFallback>{r.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.department}</p>
                </div>
                <span className="text-xs font-medium text-primary">
                  {r.next.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl xl:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-semibold">Pending Leave Requests</CardTitle>
              <p className="text-xs text-muted-foreground">Awaiting your approval</p>
            </div>
            <MailCheck className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent className="space-y-2">
            {leaveRequests.length === 0 && (
              <p className="text-sm text-muted-foreground">No pending requests.</p>
            )}
            {leaveRequests.map((lr) => (
              <div key={lr.id} className="flex flex-col gap-2 rounded-xl border border-border/60 bg-secondary/30 p-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{lr.teacherName}</p>
                  <p className="text-xs text-muted-foreground">{lr.from} → {lr.to} · {lr.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={lr.status} />
                  <Button variant="outline" size="sm">Reject</Button>
                  <Button variant="hero" size="sm">Approve</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
