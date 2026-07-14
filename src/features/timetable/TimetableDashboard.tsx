import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/StatCard";
import {
  AlertTriangle, CalendarClock, CalendarRange, Coffee, DoorOpen, Users,
} from "lucide-react";
import {
  CLASSES, CLASSROOMS, DAYS, PERIODS, SUBJECTS, TIMETABLE, detectConflicts,
  totalWeeklyPeriods, type TimetableSlot,
} from "./data";
import { teacherRecords } from "@/features/teachers/data";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary-glow))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
];

interface Props {
  slots?: TimetableSlot[];
}

export function TimetableDashboard({ slots = TIMETABLE }: Props) {
  const teachingTeachers = useMemo(
    () => teacherRecords.filter((t) => t.type === "teaching" && t.status !== "archived"),
    [],
  );

  const conflicts = useMemo(() => detectConflicts(slots), [slots]);

  const todayName = DAYS[Math.min((new Date().getDay() + 6) % 7, DAYS.length - 1)];

  const scheduledToday = slots.filter((s) => s.day === todayName).length;
  const totalCapacityPerDay = CLASSES.length * PERIODS.length;
  const freeToday = Math.max(totalCapacityPerDay - scheduledToday, 0);

  const roomCapacityWeek = CLASSROOMS.length * DAYS.length * PERIODS.length;
  const roomUsedWeek = slots.length;
  const roomUtil = Math.round((roomUsedWeek / roomCapacityWeek) * 100);

  const teacherPeriods = slots.length;
  const teacherCapacity = teachingTeachers.length * totalWeeklyPeriods;
  const teacherUtil = teacherCapacity ? Math.round((teacherPeriods / teacherCapacity) * 100) : 0;

  const stats = [
    { label: "Total Timetables", value: String(CLASSES.length), icon: CalendarRange, hint: "class schedules" },
    { label: "Scheduled Today", value: String(scheduledToday), icon: CalendarClock, hint: todayName },
    { label: "Free Periods", value: String(freeToday), icon: Coffee, hint: "across classes" },
    { label: "Conflicts", value: String(conflicts.length), icon: AlertTriangle, hint: conflicts.length ? "resolve to publish" : "all clear" },
    { label: "Room Utilization", value: `${roomUtil}%`, icon: DoorOpen, hint: `${roomUsedWeek}/${roomCapacityWeek}` },
    { label: "Teacher Workload", value: `${teacherUtil}%`, icon: Users, hint: "avg. utilization" },
  ];

  const weeklyByDay = useMemo(
    () => DAYS.map((d) => ({ day: d, periods: slots.filter((s) => s.day === d).length })),
    [slots],
  );

  const roomUsage = useMemo(
    () => CLASSROOMS.map((r) => ({
      name: r.name.replace("Room ", ""),
      periods: slots.filter((s) => s.roomId === r.id).length,
    })).sort((a, b) => b.periods - a.periods),
    [slots],
  );

  const teacherWorkload = useMemo(
    () => teachingTeachers.map((t) => ({
      name: t.name.split(" ").slice(-1)[0],
      periods: slots.filter((s) => s.teacherId === t.id).length,
    })).sort((a, b) => b.periods - a.periods).slice(0, 10),
    [slots, teachingTeachers],
  );

  const subjectDist = useMemo(() => {
    const counts = new Map<string, number>();
    slots.forEach((s) => {
      const dept = SUBJECTS.find((x) => x.code === s.subjectCode)?.department ?? "Other";
      counts.set(dept, (counts.get(dept) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [slots]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Weekly Class Distribution</CardTitle>
              <p className="text-xs text-muted-foreground">Scheduled periods per day</p>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Bar dataKey="periods" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Room Usage</CardTitle>
              <p className="text-xs text-muted-foreground">Weekly periods per room</p>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roomUsage} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={70} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Bar dataKey="periods" fill="hsl(var(--accent))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Teacher Workload</CardTitle>
              <p className="text-xs text-muted-foreground">Top 10 by weekly periods</p>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teacherWorkload}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor="end" height={60} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Bar dataKey="periods" fill="hsl(var(--primary-glow))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Subject Distribution</CardTitle>
              <p className="text-xs text-muted-foreground">Periods by department</p>
            </CardHeader>
            <CardContent className="h-[260px]">
              {subjectDist.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={subjectDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2} stroke="none">
                      {subjectDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
