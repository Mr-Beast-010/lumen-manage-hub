import { useMemo, useState } from "react";
import { Award, Star, CalendarCheck2, BookOpen, Users } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { OverviewMetric } from "@/features/students/profile/OverviewMetric";
import { teacherRecords } from "@/features/teachers/data";
import { performanceFor } from "./data";
import { cn } from "@/lib/utils";

const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 };

export function PerformanceReview() {
  const [teacherId, setTeacherId] = useState(teacherRecords[0]?.id ?? "");
  const [dept, setDept] = useState<string>("all");

  const departments = useMemo(
    () => Array.from(new Set(teacherRecords.map((t) => t.department))).sort(),
    [],
  );
  const list = useMemo(
    () => teacherRecords.filter((t) => dept === "all" || t.department === dept),
    [dept],
  );

  const teacher = teacherRecords.find((t) => t.id === teacherId) ?? teacherRecords[0];
  const p = useMemo(() => performanceFor(teacher), [teacher]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Performance Review</h2>
          <p className="text-sm text-muted-foreground">{teacher.name} · {teacher.department}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-44" aria-label="Filter by department"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={teacherId} onValueChange={setTeacherId}>
            <SelectTrigger className="w-64" aria-label="Select teacher"><SelectValue /></SelectTrigger>
            <SelectContent>
              {list.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <OverviewMetric label="Overall Score" value={`${p.overall}`} hint="out of 100" icon={Award} tone="primary" index={0} />
        <OverviewMetric label="Student Feedback" value={`${p.studentFeedback}%`} icon={Star} tone="warning" index={1} />
        <OverviewMetric label="Attendance Score" value={`${p.attendanceScore}%`} icon={CalendarCheck2} tone="success" index={2} />
        <OverviewMetric label="Teaching Load" value={`${p.teachingLoad}%`} icon={BookOpen} tone="accent" index={3} />
        <OverviewMetric label="Department Rating" value={`${p.departmentRating}%`} icon={Users} tone="primary" index={4} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Monthly Performance">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={p.monthly}>
              <defs>
                <linearGradient id="perfMonth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#perfMonth)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Yearly Performance">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={p.yearly}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="score" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Attendance vs Performance" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={p.attendanceVsPerf}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="attendance" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="performance" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 font-display text-base font-semibold">Score Breakdown</h3>
        <div className="space-y-4">
          {[
            { label: "Student Feedback", value: p.studentFeedback },
            { label: "Attendance", value: p.attendanceScore },
            { label: "Teaching Load", value: p.teachingLoad },
            { label: "Department Rating", value: p.departmentRating },
          ].map((row) => (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span>{row.label}</span>
                <span className="font-medium">{row.value}%</span>
              </div>
              <Progress value={row.value} className="h-1.5" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ChartCard({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      <h3 className="mb-4 font-display text-base font-semibold">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}
