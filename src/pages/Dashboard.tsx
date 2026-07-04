import { motion } from "framer-motion";
import { Users, GraduationCap, Wallet, CalendarCheck, Plus, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { analytics, students } from "@/lib/mockData";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--primary-glow))", "hsl(var(--warning))", "hsl(var(--destructive))"];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome back, Amelia"
        description="Here's what's happening across your school today."
        actions={
          <>
            <Button variant="outline"><Download /> Export</Button>
            <Button variant="hero"><Plus /> New enrollment</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard index={0} label="Total students" value="1,248" delta={8.2} hint="vs last month" icon={Users} />
        <StatCard index={1} label="Teachers" value="56" delta={4.1} hint="active faculty" icon={GraduationCap} />
        <StatCard index={2} label="Attendance rate" value="94.6%" delta={1.3} hint="this week" icon={CalendarCheck} />
        <StatCard index={3} label="Revenue" value="$182.4K" delta={-2.4} hint="MTD" icon={Wallet} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card-elevated p-6 lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Enrollment growth</h3>
              <p className="text-sm text-muted-foreground">Students and teachers over time</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <AreaChart data={analytics.enrollment} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="gStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTeachers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                  }}
                />
                <Area type="monotone" dataKey="students" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gStudents)" />
                <Area type="monotone" dataKey="teachers" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#gTeachers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="card-elevated p-6"
        >
          <h3 className="font-display text-lg font-semibold">Grade distribution</h3>
          <p className="text-sm text-muted-foreground">Latest term</p>
          <div className="mt-2 h-72 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={analytics.grades} innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                  {analytics.grades.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2} />
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
          </div>
          <div className="mt-2 grid grid-cols-5 gap-1 text-center text-xs">
            {analytics.grades.map((g, i) => (
              <div key={g.name}>
                <div className="mx-auto h-1.5 w-6 rounded" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <p className="mt-1 font-medium">{g.name}</p>
                <p className="text-muted-foreground">{g.value}%</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card-elevated p-6"
        >
          <h3 className="font-display text-lg font-semibold">Weekly attendance</h3>
          <div className="mt-4 h-52 w-full">
            <ResponsiveContainer>
              <BarChart data={analytics.attendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[80, 100]} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}
                />
                <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="card-elevated p-6 lg:col-span-2"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Recent students</h3>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <ul className="divide-y divide-border">
            {students.slice(0, 5).map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                  {s.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">Grade {s.grade}-{s.section} · {s.email}</p>
                </div>
                <div className="hidden sm:block text-sm text-muted-foreground">GPA {s.gpa}</div>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
