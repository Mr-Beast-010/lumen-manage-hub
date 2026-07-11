import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, UserCheck, UserX, CalendarClock, Clock, TrendingUp, Search, Check, X,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OverviewMetric } from "@/features/students/profile/OverviewMetric";
import { AttendanceCalendar } from "@/features/students/profile/AttendanceCalendar";
import { teacherRecords } from "@/features/teachers/data";
import {
  todayAttendance, attendanceSummary, weeklyAttendanceTrend, generateMonthlyAttendance,
  type AttendanceStatus,
} from "./data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const options: { key: AttendanceStatus; label: string; tone: string }[] = [
  { key: "present", label: "Present", tone: "bg-success/10 text-success ring-success/30" },
  { key: "absent", label: "Absent", tone: "bg-destructive/10 text-destructive ring-destructive/30" },
  { key: "late", label: "Late", tone: "bg-warning/10 text-warning ring-warning/30" },
  { key: "on-leave", label: "Leave", tone: "bg-accent/10 text-accent ring-accent/30" },
];

const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 };

export function TeacherAttendance() {
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>(todayAttendance);
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState<string>("all");
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [monthlyTeacher, setMonthlyTeacher] = useState(teacherRecords[0]?.id ?? "");

  const departments = useMemo(
    () => Array.from(new Set(teacherRecords.map((t) => t.department))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teacherRecords.filter((t) => {
      if (dept !== "all" && t.department !== dept) return false;
      if (q && !t.name.toLowerCase().includes(q) && !t.employeeId.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, dept]);

  const summary = attendanceSummary(marks);
  const trend = weeklyAttendanceTrend();
  const monthlyData = useMemo(
    () => generateMonthlyAttendance(monthlyTeacher, "2026-07"),
    [monthlyTeacher],
  );

  const setStatus = (id: string, status: AttendanceStatus) =>
    setMarks((m) => ({ ...m, [id]: status }));

  const markAll = (status: AttendanceStatus) => {
    setMarks((m) => {
      const next = { ...m };
      filtered.forEach((t) => { next[t.id] = status; });
      return next;
    });
    toast.success(`Marked ${filtered.length} teacher(s) as ${status}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <OverviewMetric label="Present Today" value={String(summary.present)} icon={UserCheck} tone="success" index={0} />
        <OverviewMetric label="Absent" value={String(summary.absent)} icon={UserX} tone="destructive" index={1} />
        <OverviewMetric label="On Leave" value={String(summary.onLeave)} icon={CalendarClock} tone="accent" index={2} />
        <OverviewMetric label="Late Arrivals" value={String(summary.late)} icon={Clock} tone="warning" index={3} />
        <OverviewMetric label="Attendance Rate" value={`${summary.rate}%`} icon={TrendingUp} tone="primary" index={4} />
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search teachers"
                aria-label="Search teachers"
                className="w-56 pl-8"
              />
            </div>
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="w-44" aria-label="Filter by department"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="daily" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Bulk mark <span className="font-medium text-foreground">{filtered.length}</span> teacher(s)
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => markAll("present")}><Check className="mr-1 h-4 w-4" /> All Present</Button>
              <Button size="sm" variant="outline" onClick={() => markAll("absent")}><X className="mr-1 h-4 w-4" /> All Absent</Button>
              <Button size="sm" variant="hero" onClick={() => toast.success("Attendance saved")}>Save</Button>
            </div>
          </div>

          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card" role="list">
            {filtered.map((t, i) => (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.3) }}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={t.photo} alt={t.name} />
                    <AvatarFallback>{t.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.employeeId} · {t.department}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Attendance status for ${t.name}`}>
                  {options.map((o) => {
                    const active = marks[t.id] === o.key;
                    return (
                      <button
                        key={o.key}
                        role="radio"
                        aria-checked={active}
                        onClick={() => setStatus(t.id, o.key)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active ? o.tone : "bg-transparent text-muted-foreground ring-border hover:bg-secondary/60",
                        )}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </motion.li>
            ))}
            {filtered.length === 0 && (
              <li className="p-8 text-center text-sm text-muted-foreground">No teachers match your filters.</li>
            )}
          </ul>
        </TabsContent>

        <TabsContent value="weekly" className="mt-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 font-display text-base font-semibold">Weekly Attendance Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="present" stackId="a" fill="hsl(var(--success))" radius={[0,0,0,0]} />
                  <Bar dataKey="late" stackId="a" fill="hsl(var(--warning))" />
                  <Bar dataKey="absent" stackId="a" fill="hsl(var(--destructive))" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-base font-semibold">Monthly Calendar</h3>
              <Select value={monthlyTeacher} onValueChange={setMonthlyTeacher}>
                <SelectTrigger className="w-64" aria-label="Select teacher"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {teacherRecords.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <AttendanceCalendar
              month="2026-07"
              data={monthlyData.map((d) => ({
                date: d.date,
                status: d.status === "on-leave" ? "leave" : d.status,
              }))}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
