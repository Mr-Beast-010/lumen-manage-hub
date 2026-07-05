import { motion } from "framer-motion";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Users, UserPlus, UserCheck, User, UserRound, GraduationCap, FileWarning, Cake, Zap, ArrowRight, IdCard, FileDown, CalendarPlus } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { StudentRecord } from "./data";
import { studentAnalytics } from "./data";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const GENDER_COLORS = ["hsl(var(--primary))", "hsl(var(--primary-glow))"];

interface Props {
  rows: StudentRecord[];
  onAdd: () => void;
}

export function StudentAnalytics({ rows, onAdd }: Props) {
  const a = studentAnalytics(rows);

  const stats = [
    { label: "Total Students", value: String(a.total), delta: 8, hint: "vs last month", icon: Users },
    { label: "New Admissions", value: String(a.newAdmissions), delta: 12, hint: "this term", icon: UserPlus },
    { label: "Active", value: String(a.active), delta: 3, hint: "attending", icon: UserCheck },
    { label: "Boys", value: String(a.boys), hint: `${Math.round((a.boys / Math.max(a.total, 1)) * 100)}%`, icon: User },
    { label: "Girls", value: String(a.girls), hint: `${Math.round((a.girls / Math.max(a.total, 1)) * 100)}%`, icon: UserRound },
    { label: "Alumni", value: String(a.alumni), hint: "all-time", icon: GraduationCap },
  ];

  const recent = [...rows]
    .sort((a, b) => b.admissionDate.localeCompare(a.admissionDate))
    .slice(0, 5);

  const pendingDocs = rows.filter((r) => r.documentsPending > 0).slice(0, 5);

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
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }} className="lg:col-span-2">
          <Card className="h-full rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-semibold">Admissions Trend</CardTitle>
                <p className="text-xs text-muted-foreground">Monthly new admissions</p>
              </div>
              <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">YTD</span>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={a.admissionsTrend}>
                  <defs>
                    <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="admissions" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#admGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="h-full rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Gender Distribution</CardTitle>
              <p className="text-xs text-muted-foreground">Boys vs Girls</p>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={a.genderDist} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4} stroke="none">
                    {a.genderDist.map((_, i) => (
                      <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex justify-center gap-6 text-xs">
                {a.genderDist.map((g, i) => (
                  <div key={g.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: GENDER_COLORS[i] }} />
                    <span className="text-muted-foreground">{g.name}</span>
                    <span className="font-medium">{g.value}</span>
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
            <CardTitle className="text-base font-semibold">Class-wise Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">Students per grade</p>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={a.classDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="class" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="students" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Widgets */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-semibold">Recent Admissions</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">View all <ArrowRight className="ml-1 h-3 w-3" /></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl p-2 transition-smooth hover:bg-secondary/50">
                <Avatar className="h-9 w-9 ring-1 ring-border">
                  <AvatarImage src={r.photo} alt="" />
                  <AvatarFallback>{r.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">Grade {r.className}-{r.section} · {r.admissionNo}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="hero" size="sm" className="col-span-2" onClick={onAdd}>
              <UserPlus /> Add Student
            </Button>
            <Button variant="outline" size="sm"><IdCard /> Print IDs</Button>
            <Button variant="outline" size="sm"><FileDown /> Export</Button>
            <Button variant="outline" size="sm"><CalendarPlus /> Schedule</Button>
            <Button variant="outline" size="sm"><Zap /> Promote</Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-semibold">Pending Documents</CardTitle>
              <p className="text-xs text-muted-foreground">Awaiting submission</p>
            </div>
            <FileWarning className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingDocs.length === 0 && (
              <p className="text-sm text-muted-foreground">All documents verified.</p>
            )}
            {pendingDocs.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">Grade {r.className}-{r.section}</p>
                </div>
                <span className="rounded-md bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                  {r.documentsPending} pending
                </span>
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
                  <p className="text-xs text-muted-foreground">Grade {r.className}-{r.section}</p>
                </div>
                <span className="text-xs font-medium text-primary">
                  {r.next.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
