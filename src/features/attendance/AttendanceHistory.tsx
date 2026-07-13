import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AttendanceCalendar } from "@/features/students/profile/AttendanceCalendar";
import { studentRecords } from "@/features/students/data";
import { teacherRecords } from "@/features/teachers/data";
import { cn } from "@/lib/utils";
import {
  classSectionList, departmentList, monthlyHistoryFor, statusMeta, summarizeHistory,
  weeklyTrend, monthlyTrend, type AttStatus,
} from "./data";

const chartTheme = { grid: "hsl(var(--border))", axis: "hsl(var(--muted-foreground))" };
const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 };

export function AttendanceHistory() {
  const [audience, setAudience] = useState<"students" | "teachers">("students");
  const [personId, setPersonId] = useState<string>(studentRecords[0].id);
  const [classFilter, setClassFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [from, setFrom] = useState<string>("2026-07-01");
  const [to, setTo] = useState<string>("2026-07-31");
  const [q, setQ] = useState("");

  const month = from.slice(0, 7);

  const people = audience === "students" ? studentRecords : teacherRecords;
  const filteredPeople = useMemo(
    () =>
      people.filter((p) => {
        if (audience === "students") {
          const st = p as (typeof studentRecords)[number];
          if (classFilter !== "all" && `${st.className}-${st.section}` !== classFilter) return false;
        } else {
          const t = p as (typeof teacherRecords)[number];
          if (deptFilter !== "all" && t.department !== deptFilter) return false;
        }
        return p.name.toLowerCase().includes(q.toLowerCase());
      }),
    [people, audience, classFilter, deptFilter, q],
  );

  const person = people.find((p) => p.id === personId) ?? filteredPeople[0] ?? people[0];
  const history = useMemo(() => monthlyHistoryFor(person.id, month), [person.id, month]);
  const summary = summarizeHistory(history);

  const dailyRows = history.filter((r) => r.date >= from && r.date <= to);

  const weeklyBuckets: { week: string; present: number; absent: number; late: number; leave: number }[] = [];
  dailyRows.forEach((r, i) => {
    const w = Math.floor(i / 7);
    weeklyBuckets[w] = weeklyBuckets[w] ?? { week: `Week ${w + 1}`, present: 0, absent: 0, late: 0, leave: 0 };
    weeklyBuckets[w][r.status] += 1;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-4">
        <Tabs value={audience} onValueChange={(v) => { setAudience(v as any); setPersonId(v === "students" ? studentRecords[0].id : teacherRecords[0].id); }}>
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
          </TabsList>
        </Tabs>

        {audience === "students" ? (
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-40" aria-label="Filter by class"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {classSectionList.map((c) => <SelectItem key={c} value={c}>Grade {c}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : (
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-52" aria-label="Filter by department"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departmentList.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name" className="pl-8" aria-label="Search" />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="from-date">From</label>
          <Input id="from-date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
          <label className="text-xs text-muted-foreground" htmlFor="to-date">To</label>
          <Input id="to-date" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
        <aside className="rounded-2xl border border-border bg-card p-3">
          <p className="mb-2 px-1 text-xs uppercase tracking-wider text-muted-foreground">
            {filteredPeople.length} {audience}
          </p>
          <ul className="max-h-[520px] space-y-1 overflow-y-auto pr-1" role="listbox" aria-label={`Select ${audience.slice(0, -1)}`}>
            {filteredPeople.slice(0, 50).map((p) => {
              const isActive = p.id === person.id;
              const meta = audience === "students"
                ? `Grade ${(p as any).className}-${(p as any).section}`
                : (p as any).department;
              return (
                <li key={p.id}>
                  <button
                    onClick={() => setPersonId(p.id)}
                    aria-selected={isActive}
                    role="option"
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg p-2 text-left transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isActive ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-secondary/60",
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={(p as any).photo} alt="" />
                      <AvatarFallback>{p.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{meta}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={(person as any).photo} alt="" />
                <AvatarFallback>{person.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-display text-lg font-semibold">{person.name}</p>
                <p className="text-xs text-muted-foreground">
                  {audience === "students"
                    ? `Grade ${(person as any).className}-${(person as any).section} · Roll ${(person as any).rollNo}`
                    : `${(person as any).employeeId} · ${(person as any).department}`}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <Stat label="Rate" value={`${summary.rate}%`} tone="text-primary" />
              <Stat label="Present" value={summary.present} tone="text-success" />
              <Stat label="Late" value={summary.late} tone="text-warning" />
              <Stat label="Absent" value={summary.absent} tone="text-destructive" />
              <Stat label="Leave" value={summary.leave} tone="text-accent" />
            </div>
          </div>

          <Tabs defaultValue="daily">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-4">
              <div className="card-elevated overflow-hidden">
                <div className="grid grid-cols-[110px,1fr] gap-0 border-b border-border p-3 text-xs uppercase tracking-wider text-muted-foreground">
                  <span>Date</span><span>Status</span>
                </div>
                <ul className="max-h-[420px] divide-y divide-border overflow-y-auto">
                  {dailyRows.map((r, i) => (
                    <motion.li key={r.date}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: Math.min(i, 20) * 0.01 }}
                      className="grid grid-cols-[110px,1fr] items-center p-3">
                      <span className="text-sm">{r.date}</span>
                      <span>
                        <StatusPill status={r.status} />
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="weekly" className="mt-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyBuckets.length ? weeklyBuckets : weeklyTrend}>
                      <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey={weeklyBuckets.length ? "week" : "day"} stroke={chartTheme.axis} fontSize={12} />
                      <YAxis stroke={chartTheme.axis} fontSize={12} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="present" stackId="a" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="late" stackId="a" fill="hsl(var(--warning))" />
                      <Bar dataKey="absent" stackId="a" fill="hsl(var(--destructive))" />
                      <Bar dataKey="leave" stackId="a" fill="hsl(var(--accent))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="mt-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrend}>
                      <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" stroke={chartTheme.axis} fontSize={12} />
                      <YAxis stroke={chartTheme.axis} fontSize={12} domain={[80, 100]} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="students" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="teachers" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="mt-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <AttendanceCalendar month={month} data={history} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("font-display text-lg font-bold", tone)}>{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: AttStatus }) {
  const m = statusMeta[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset", m.tone)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}
