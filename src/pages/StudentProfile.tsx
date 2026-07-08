import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowLeft, Pencil, IdCard, Download, ArrowUp, Archive,
  CalendarCheck2, GraduationCap, Wallet, FileWarning,
  Mail, Phone, MapPin, Cake, User, School, Hash,
  CheckCircle2, AlertCircle, Clock, Send, Ban, FileBarChart2,
  TrendingUp, TrendingDown, Trophy, Target,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";

import { OverviewMetric } from "@/features/students/profile/OverviewMetric";
import { ActivityTimeline } from "@/features/students/profile/ActivityTimeline";
import { AttendanceCalendar } from "@/features/students/profile/AttendanceCalendar";
import { AttendanceHeatmap } from "@/features/students/profile/AttendanceHeatmap";
import { InsightsPanel } from "@/features/students/profile/InsightsPanel";
import { FinanceOverview } from "@/features/students/profile/FinanceOverview";
import { DocumentManager } from "@/features/students/profile/DocumentManager";
import { AnimatedCounter } from "@/features/students/profile/AnimatedCounter";
import { studentRecords } from "@/features/students/data";
import { buildProfile } from "@/features/students/profile/mockProfile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const chartTheme = {
  grid: "hsl(var(--border))",
  axis: "hsl(var(--muted-foreground))",
  tooltipBg: "hsl(var(--card))",
};

const tooltipStyle = {
  background: chartTheme.tooltipBg,
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/60 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, children, action, className }: { title: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        {action}
      </header>
      {children}
    </section>
  );
}

const statusTone = {
  present: "bg-success/10 text-success",
  absent: "bg-destructive/10 text-destructive",
  late: "bg-warning/10 text-warning",
  leave: "bg-accent/10 text-accent",
} as const;

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [attendanceView, setAttendanceView] = useState<"calendar" | "weekly" | "monthly" | "yearly">("monthly");
  const [attendanceMonth, setAttendanceMonth] = useState("07");
  const [attendanceYear, setAttendanceYear] = useState("2026");
  const [attendanceClass, setAttendanceClass] = useState("all");

  const student = useMemo(() => studentRecords.find((s) => s.id === id) ?? studentRecords[0], [id]);
  const profile = useMemo(() => buildProfile(student), [student]);

  if (!student) {
    return (
      <EmptyState
        icon={User}
        title="Student not found"
        description="We couldn't find a student with that ID."
        action={<Button onClick={() => navigate("/students")}>Back to students</Button>}
      />
    );
  }

  const action = (label: string) => () => toast.success(label);

  const attendanceCards = [
    { label: "Overall", value: `${profile.attendance.percentage}%`, tone: "primary" as const, icon: Target },
    { label: "Present", value: profile.attendance.present, tone: "success" as const, icon: CheckCircle2 },
    { label: "Absent", value: profile.attendance.absent, tone: "destructive" as const, icon: AlertCircle },
    { label: "Late", value: profile.attendance.late, tone: "warning" as const, icon: Clock },
    { label: "Leave", value: profile.attendance.leave, tone: "accent" as const, icon: CalendarCheck2 },
  ];

  const classComparison = [
    { name: "You", value: profile.attendance.percentage },
    { name: "Class avg", value: profile.attendance.classAverage },
    { name: "Grade avg", value: profile.attendance.classAverage - 2 },
    { name: "School avg", value: profile.attendance.classAverage - 4 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Button variant="ghost" size="sm" onClick={() => navigate("/students")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back to students
        </Button>
      </div>

      {/* Profile Header */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-40" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <Avatar className="h-24 w-24 rounded-2xl ring-2 ring-primary/30 md:h-28 md:w-28">
              <AvatarImage src={student.photo} alt={student.name} />
              <AvatarFallback className="rounded-2xl text-2xl">{student.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="space-y-3">
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                  <span className="gradient-text">{student.name}</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Admission №{" "}
                  <span className="font-mono text-foreground">{student.admissionNo}</span>
                  {"  ·  "}Roll <span className="font-mono text-foreground">{student.rollNo}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                  Grade {student.className} · Section {student.section}
                </Badge>
                <Badge variant="outline" className="border-border bg-secondary/50">
                  AY {profile.bio.academicYear}
                </Badge>
                <StatusBadge status={student.status} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="hero" onClick={action("Editing student…")}><Pencil /> Edit</Button>
            <Button variant="outline" onClick={action("ID card queued to print")}><IdCard /> Print ID</Button>
            <Button variant="outline" onClick={action("Promotion workflow started")}><ArrowUp /> Promote</Button>
            <Button variant="outline" onClick={action("Transfer request drafted")}><Send /> Transfer</Button>
            <Button variant="outline" onClick={action("Student suspended")}><Ban /> Suspend</Button>
            <Button variant="outline" onClick={action("Report generated")}><FileBarChart2 /> Report</Button>
            <Button variant="outline" onClick={action("Student archived")}><Archive /> Archive</Button>
          </div>
        </div>
      </motion.section>

      {/* Overview metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewMetric label="Attendance" value={`${profile.attendance.percentage}%`} hint="last 90 days" icon={CalendarCheck2} tone="accent" index={0} />
        <OverviewMetric label="Current GPA" value={profile.results.gpa.toFixed(2)} hint={`Rank ${profile.results.rank}/${profile.results.outOf}`} icon={GraduationCap} tone="primary" index={1} />
        <OverviewMetric label="Fee Status" value={student.feeStatus.toUpperCase()} hint={`$${profile.fees.pending} pending`} icon={Wallet} tone={student.feeStatus === "paid" ? "success" : student.feeStatus === "overdue" ? "destructive" : "warning"} index={2} />
        <OverviewMetric label="Pending Docs" value={String(student.documentsPending)} hint="verify to complete" icon={FileWarning} tone={student.documentsPending ? "warning" : "success"} index={3} />
      </div>

      <InsightsPanel insights={profile.insights} onAction={(i) => toast.success(`${i.action} · ${i.title}`)} />

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 rounded-xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="guardian">Guardian</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
          >
            {/* OVERVIEW */}
            <TabsContent value="overview" className="mt-0 grid gap-4 lg:grid-cols-2">
              <SectionCard title="Personal Information">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={User} label="Full Name" value={student.name} />
                  <InfoRow icon={Cake} label="Date of Birth" value={student.dob} />
                  <InfoRow icon={Hash} label="Blood Group" value={profile.bio.bloodGroup} />
                  <InfoRow icon={User} label="Gender" value={student.gender} />
                  <InfoRow icon={User} label="Nationality" value={profile.bio.nationality} />
                  <InfoRow icon={User} label="Category" value={profile.bio.category} />
                </div>
              </SectionCard>
              <SectionCard title="Contact Details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={Mail} label="Email" value={student.email} />
                  <InfoRow icon={Phone} label="Phone" value={student.phone} />
                  <InfoRow icon={MapPin} label="Address" value={`${profile.bio.address}, ${profile.bio.city}`} />
                  <InfoRow icon={MapPin} label="Country · Pincode" value={`${profile.bio.country} · ${profile.bio.pincode}`} />
                </div>
              </SectionCard>
              <SectionCard title="Academic Details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={School} label="Grade & Section" value={`Grade ${student.className} · ${student.section}`} />
                  <InfoRow icon={Hash} label="Roll Number" value={student.rollNo} />
                  <InfoRow icon={GraduationCap} label="Academic Year" value={profile.bio.academicYear} />
                  <InfoRow icon={GraduationCap} label="Current GPA" value={profile.results.gpa.toFixed(2)} />
                </div>
              </SectionCard>
              <SectionCard title="Admission Information">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={Hash} label="Admission №" value={student.admissionNo} />
                  <InfoRow icon={CalendarCheck2} label="Admission Date" value={student.admissionDate} />
                  <InfoRow icon={User} label="Guardian" value={student.guardian} />
                  <InfoRow icon={User} label="Status" value={student.status} />
                </div>
              </SectionCard>
            </TabsContent>

            {/* ATTENDANCE */}
            <TabsContent value="attendance" className="mt-0 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {attendanceCards.map((c, i) => (
                  <OverviewMetric key={c.label} label={c.label} value={String(c.value)} icon={c.icon} tone={c.tone} index={i} />
                ))}
              </div>

              <SectionCard
                title="Attendance analytics"
                action={
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={attendanceMonth} onValueChange={setAttendanceMonth}>
                      <SelectTrigger className="h-9 w-32"><SelectValue placeholder="Month" /></SelectTrigger>
                      <SelectContent>
                        {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m) => (
                          <SelectItem key={m} value={m}>{new Date(2026, Number(m) - 1).toLocaleString("en", { month: "long" })}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={attendanceYear} onValueChange={setAttendanceYear}>
                      <SelectTrigger className="h-9 w-24"><SelectValue placeholder="Year" /></SelectTrigger>
                      <SelectContent>
                        {["2023","2024","2025","2026"].map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={attendanceClass} onValueChange={setAttendanceClass}>
                      <SelectTrigger className="h-9 w-32"><SelectValue placeholder="Class" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All classes</SelectItem>
                        {["6","7","8","9","10","11","12"].map((c) => <SelectItem key={c} value={c}>Grade {c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                }
              >
                <Tabs value={attendanceView} onValueChange={(v) => setAttendanceView(v as any)} className="space-y-4">
                  <TabsList className="rounded-xl">
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="yearly">Yearly</TabsTrigger>
                  </TabsList>
                  <TabsContent value="calendar" className="mt-0">
                    <AttendanceCalendar month={`${attendanceYear}-${attendanceMonth}`} data={profile.attendance.history} />
                  </TabsContent>
                  <TabsContent value="weekly" className="mt-0 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={profile.attendance.weekly}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                        <XAxis dataKey="week" stroke={chartTheme.axis} fontSize={11} />
                        <YAxis stroke={chartTheme.axis} fontSize={11} domain={[0, 100]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="rate" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </TabsContent>
                  <TabsContent value="monthly" className="mt-0 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={profile.attendance.monthly}>
                        <defs>
                          <linearGradient id="attArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                        <XAxis dataKey="month" stroke={chartTheme.axis} fontSize={11} />
                        <YAxis stroke={chartTheme.axis} fontSize={11} domain={[0, 100]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#attArea)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </TabsContent>
                  <TabsContent value="yearly" className="mt-0 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={profile.attendance.yearly}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                        <XAxis dataKey="year" stroke={chartTheme.axis} fontSize={11} />
                        <YAxis stroke={chartTheme.axis} fontSize={11} domain={[0, 100]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabsContent>
                </Tabs>
              </SectionCard>

              <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard title="Class comparison">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={classComparison} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                        <XAxis type="number" domain={[0, 100]} stroke={chartTheme.axis} fontSize={11} />
                        <YAxis type="category" dataKey="name" stroke={chartTheme.axis} fontSize={11} width={90} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                          {classComparison.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--accent) / 0.6)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
                <SectionCard title="12-week heatmap">
                  <AttendanceHeatmap data={profile.attendance.heatmap} />
                </SectionCard>
              </div>

              <SectionCard title="Attendance history">
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Remark</th>
                        <th className="px-4 py-2 text-left">Teacher</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.attendance.history.map((h) => (
                        <tr key={h.date} className="border-t border-border">
                          <td className="px-4 py-2 font-mono text-xs">{h.date}</td>
                          <td className="px-4 py-2 capitalize">
                            <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs", statusTone[h.status])}>{h.status}</span>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">{h.remark ?? "—"}</td>
                          <td className="px-4 py-2 text-muted-foreground">{h.teacher}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </TabsContent>

            {/* RESULTS */}
            <TabsContent value="results" className="mt-0 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <OverviewMetric label="Current GPA" value={profile.results.gpa.toFixed(2)} hint="of 4.0" icon={GraduationCap} tone="primary" />
                <OverviewMetric label="Average Marks" value={`${profile.results.averageMarks}%`} hint="all subjects" icon={Target} tone="accent" index={1} />
                <OverviewMetric label="Class Rank" value={`#${profile.results.rank}`} hint={`of ${profile.results.outOf}`} icon={Trophy} tone="success" index={2} />
                <OverviewMetric label="Overall Grade" value={profile.results.overallGrade} hint="weighted" icon={GraduationCap} tone="warning" index={3} />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard title="Subject performance">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={profile.results.subjects}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                        <XAxis dataKey="subject" stroke={chartTheme.axis} fontSize={11} interval={0} angle={-15} textAnchor="end" height={60} />
                        <YAxis stroke={chartTheme.axis} fontSize={11} domain={[0, 100]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="marks" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
                <SectionCard title="Semester trend">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={profile.results.semesterTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                        <XAxis dataKey="semester" stroke={chartTheme.axis} fontSize={11} />
                        <YAxis stroke={chartTheme.axis} fontSize={11} domain={[0, 100]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="average" name="Average %" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="gpa" name="GPA (×25)" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </div>

              <SectionCard title="Exam comparison">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profile.results.examComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                      <XAxis dataKey="exam" stroke={chartTheme.axis} fontSize={11} />
                      <YAxis stroke={chartTheme.axis} fontSize={11} domain={[0, 100]} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="you" name="You" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="class" name="Class avg" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="top" name="Top scorer" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard title="Top subjects">
                  <ul className="space-y-2">
                    {profile.results.topSubjects.map((s) => (
                      <li key={s.subject} className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-success" />
                          <span className="text-sm font-medium">{s.subject}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={s.marks} className="w-28" />
                          <span className="font-mono text-xs">{s.marks}%</span>
                          <Badge variant="outline" className="border-success/30 bg-success/10 text-success">{s.grade}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
                <SectionCard title="Weak subjects">
                  <ul className="space-y-2">
                    {profile.results.weakSubjects.map((s) => (
                      <li key={s.subject} className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-destructive" />
                          <span className="text-sm font-medium">{s.subject}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={s.marks} className="w-28" />
                          <span className="font-mono text-xs">{s.marks}%</span>
                          <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">{s.grade}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              </div>

              <SectionCard title="Subject-wise marks">
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 text-left">Subject</th>
                        <th className="px-4 py-2 text-left">Marks</th>
                        <th className="px-4 py-2 text-left">Grade</th>
                        <th className="px-4 py-2 text-left">Teacher remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.results.subjects.map((s) => (
                        <tr key={s.subject} className="border-t border-border">
                          <td className="px-4 py-2 font-medium">{s.subject}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                                <div className="h-full bg-gradient-primary" style={{ width: `${s.marks}%` }} />
                              </div>
                              <span className="font-mono text-xs">{s.marks}/{s.max}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">{s.grade}</Badge>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">{s.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard title="Teacher remarks">
                  <p className="rounded-xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Class teacher · </span>
                    {profile.results.remarks}
                  </p>
                </SectionCard>
                <SectionCard title="Recommendations">
                  <ul className="space-y-2 text-sm">
                    {profile.results.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 rounded-xl border border-border bg-secondary/30 p-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[10px] font-bold text-primary">{i + 1}</span>
                        <span className="text-muted-foreground">{r}</span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              </div>
            </TabsContent>

            {/* FEES */}
            <TabsContent value="fees" className="mt-0 space-y-4">
              <FinanceOverview fees={profile.fees} />

              <div className="grid gap-3 sm:grid-cols-3">
                <OverviewMetric label="Paid" value={`$${profile.fees.paid.toLocaleString()}`} icon={CheckCircle2} tone="success" />
                <OverviewMetric label="Pending" value={`$${profile.fees.pending.toLocaleString()}`} icon={Clock} tone="warning" index={1} />
                <OverviewMetric label="Upcoming dues" value={`$${profile.fees.upcoming.toLocaleString()}`} icon={AlertCircle} tone="destructive" index={2} />
              </div>

              <SectionCard
                title="Payment history"
                action={<Button variant="outline" size="sm" onClick={action("All receipts downloading")}><Download /> All receipts</Button>}
              >
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 text-left">Fee</th>
                        <th className="px-4 py-2 text-left">Amount</th>
                        <th className="px-4 py-2 text-left">Due</th>
                        <th className="px-4 py-2 text-left">Method</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.fees.items.map((f) => (
                        <tr key={f.id} className="border-t border-border">
                          <td className="px-4 py-2 font-medium">{f.title}</td>
                          <td className="px-4 py-2 font-mono text-xs">${f.amount.toLocaleString()}</td>
                          <td className="px-4 py-2 font-mono text-xs">{f.dueDate}</td>
                          <td className="px-4 py-2 text-muted-foreground">{f.method ?? "—"}</td>
                          <td className="px-4 py-2"><StatusBadge status={f.status} /></td>
                          <td className="px-4 py-2 text-right">
                            {f.receipt ? (
                              <Button variant="ghost" size="sm" onClick={action(`Downloading ${f.receipt}`)}>
                                <Download className="h-3.5 w-3.5" /> {f.receipt}
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard title="Payment timeline">
                <ol className="relative space-y-4 border-l border-border pl-6">
                  {profile.fees.items.map((f, i) => (
                    <motion.li
                      key={f.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="relative"
                    >
                      <span className={cn(
                        "absolute -left-[30px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background",
                        f.status === "paid" ? "bg-success/15 text-success" : f.status === "overdue" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning",
                      )}>
                        <Wallet className="h-3 w-3" />
                      </span>
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card/60 p-3">
                        <div>
                          <p className="text-sm font-medium">{f.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {f.status === "paid" ? `Paid on ${f.paidOn}` : `Due ${f.dueDate}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            <AnimatedCounter value={f.amount} prefix="$" />
                          </span>
                          <StatusBadge status={f.status} />
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </SectionCard>
            </TabsContent>

            {/* GUARDIAN */}
            <TabsContent value="guardian" className="mt-0 grid gap-4 lg:grid-cols-2">
              <SectionCard title="Father">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={User} label="Name" value={profile.guardian.father.name} />
                  <InfoRow icon={User} label="Occupation" value={profile.guardian.father.occupation} />
                  <InfoRow icon={Phone} label="Phone" value={profile.guardian.father.phone} />
                  <InfoRow icon={Mail} label="Email" value={profile.guardian.father.email} />
                </div>
              </SectionCard>
              <SectionCard title="Mother">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={User} label="Name" value={profile.guardian.mother.name} />
                  <InfoRow icon={User} label="Occupation" value={profile.guardian.mother.occupation} />
                  <InfoRow icon={Phone} label="Phone" value={profile.guardian.mother.phone} />
                  <InfoRow icon={Mail} label="Email" value={profile.guardian.mother.email} />
                </div>
              </SectionCard>
              <SectionCard title="Emergency contact">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={User} label="Name" value={profile.guardian.emergency.name} />
                  <InfoRow icon={User} label="Relation" value={profile.guardian.emergency.relation} />
                  <InfoRow icon={Phone} label="Phone" value={profile.guardian.emergency.phone} />
                  <InfoRow icon={Mail} label="Preferred channel" value={profile.guardian.preferredChannel} />
                </div>
              </SectionCard>
              <SectionCard title="Address">
                <InfoRow icon={MapPin} label="Home address" value={profile.guardian.address} />
              </SectionCard>
            </TabsContent>

            {/* MEDICAL */}
            <TabsContent value="medical" className="mt-0 grid gap-4 lg:grid-cols-2">
              <SectionCard title="Health snapshot">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={Hash} label="Blood Group" value={profile.medical.bloodGroup} />
                  <InfoRow icon={User} label="Family Doctor" value={profile.medical.doctor} />
                  <InfoRow icon={Phone} label="Doctor Phone" value={profile.medical.doctorPhone} />
                </div>
              </SectionCard>
              <SectionCard title="Allergies">
                {profile.medical.allergies.length ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.medical.allergies.map((a) => (
                      <Badge key={a} variant="outline" className="border-warning/30 bg-warning/10 text-warning">{a}</Badge>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No known allergies.</p>}
              </SectionCard>
              <SectionCard title="Medical conditions">
                {profile.medical.conditions.length ? (
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {profile.medical.conditions.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">None reported.</p>}
              </SectionCard>
              <SectionCard title="Medications">
                {profile.medical.medications.length ? (
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {profile.medical.medications.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">No regular medication.</p>}
              </SectionCard>
              <SectionCard title="Emergency notes" className="lg:col-span-2">
                <p className="text-sm text-muted-foreground">{profile.medical.notes}</p>
              </SectionCard>
            </TabsContent>

            {/* DOCUMENTS */}
            <TabsContent value="documents" className="mt-0">
              <SectionCard title="Document manager">
                <DocumentManager initial={profile.documents} />
              </SectionCard>
            </TabsContent>

            {/* ACTIVITY */}
            <TabsContent value="activity" className="mt-0">
              <SectionCard title="Activity timeline">
                <ActivityTimeline events={profile.timeline} />
              </SectionCard>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
