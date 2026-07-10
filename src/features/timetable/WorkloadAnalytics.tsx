import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/shared/StatCard";
import { BookOpen, Clock, Coffee, Layers, PercentCircle } from "lucide-react";
import {
  PERIODS, TIMETABLE, totalWeeklyPeriods, workloadForTeacher, type TimetableSlot,
} from "./data";
import { teacherRecords } from "@/features/teachers/data";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary-glow))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
];

interface Props {
  slots?: TimetableSlot[];
}

export function WorkloadAnalytics({ slots = TIMETABLE }: Props) {
  const teachingTeachers = useMemo(
    () => teacherRecords.filter((t) => t.type === "teaching" && t.status !== "archived"),
    [],
  );
  const [teacherId, setTeacherId] = useState<string>(teachingTeachers[0]?.id ?? "");

  const wl = useMemo(() => workloadForTeacher(teacherId, slots), [teacherId, slots]);
  const teacher = teachingTeachers.find((t) => t.id === teacherId);

  const stats = [
    { label: "Total Classes", value: String(wl.classes), icon: Layers, hint: "assigned" },
    { label: "Total Subjects", value: String(wl.subjects), icon: BookOpen, hint: "taught" },
    { label: "Weekly Hours", value: String(wl.weekly), icon: Clock, hint: `of ${totalWeeklyPeriods}` },
    { label: "Free Periods", value: String(wl.free), icon: Coffee, hint: "per week" },
    { label: "Workload", value: `${wl.pct}%`, icon: PercentCircle, hint: "utilization" },
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Analyzing</p>
            <p className="font-display text-xl font-semibold">
              {teacher?.name ?? "—"}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                · {teacher?.department}
              </span>
            </p>
          </div>
          <Select value={teacherId} onValueChange={setTeacherId}>
            <SelectTrigger className="sm:w-64" aria-label="Select teacher">
              <SelectValue placeholder="Select teacher" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {teachingTeachers.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name} · {t.department}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }} className="lg:col-span-2">
          <Card className="h-full rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Weekly Teaching Hours</CardTitle>
              <p className="text-xs text-muted-foreground">Periods across the week</p>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wl.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, PERIODS.length]} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Bar dataKey="periods" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}>
          <Card className="h-full rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Subject Distribution</CardTitle>
              <p className="text-xs text-muted-foreground">Periods per subject</p>
            </CardHeader>
            <CardContent className="h-[260px]">
              {wl.bySubject.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No periods assigned.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={wl.bySubject} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3} stroke="none">
                      {wl.bySubject.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px]">
                {wl.bySubject.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{d.name} · {d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
