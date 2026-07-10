import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowLeft, Pencil, IdCard, Download, Archive, User, Mail, Phone, MapPin, Cake,
  School, GraduationCap, BookOpen, CalendarCheck2, Wallet, FileText, Clock,
  CheckCircle2, AlertCircle, Award, Briefcase, Users, Star, AlertTriangle, Plus,
  Hash,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { OverviewMetric } from "@/features/students/profile/OverviewMetric";
import { ActivityTimeline } from "@/features/students/profile/ActivityTimeline";
import { DocumentManager } from "@/features/students/profile/DocumentManager";
import { teacherRecords } from "@/features/teachers/data";
import { buildTeacherProfile } from "@/features/teachers/profile/mockProfile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const chartTheme = { grid: "hsl(var(--border))", axis: "hsl(var(--muted-foreground))", tooltipBg: "hsl(var(--card))" };
const tooltipStyle = { background: chartTheme.tooltipBg, border: "1px solid hsl(var(--border))", borderRadius: 12 };

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

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const periodTimes = ["08:30", "09:20", "10:20", "11:10", "13:00", "13:50"];

const leaveStatusTone: Record<string, string> = {
  pending: "border-warning/30 bg-warning/10 text-warning",
  approved: "border-success/30 bg-success/10 text-success",
  rejected: "border-destructive/30 bg-destructive/10 text-destructive",
};

export default function TeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [ttDay, setTtDay] = useState("Mon");

  const teacher = useMemo(() => teacherRecords.find((t) => t.id === id) ?? teacherRecords[0], [id]);
  const profile = useMemo(() => buildTeacherProfile(teacher), [teacher]);

  if (!teacher) {
    return (
      <EmptyState
        icon={User}
        title="Teacher not found"
        description="We couldn't find a teacher with that ID."
        action={<Button onClick={() => navigate("/teachers")}>Back to teachers</Button>}
      />
    );
  }

  const action = (label: string) => () => toast.success(label);

  const totalLeave = profile.leave.balance.reduce((s, l) => s + l.total, 0);
  const usedLeave = profile.leave.balance.reduce((s, l) => s + l.used, 0);
  const leaveBalance = totalLeave - usedLeave;

  const dailySlots = profile.timetable.filter((s) => s.day === ttDay);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Button variant="ghost" size="sm" onClick={() => navigate("/teachers")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back to teachers
        </Button>
      </div>

      {/* Header */}
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
              <AvatarImage src={teacher.photo} alt={teacher.name} />
              <AvatarFallback className="rounded-2xl text-2xl">{teacher.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="space-y-3">
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                  <span className="gradient-text">{teacher.name}</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Employee <span className="font-mono text-foreground">{teacher.employeeId}</span>
                  {"  ·  "}Joined <span className="font-mono text-foreground">{teacher.joinedOn}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                  {teacher.designation}
                </Badge>
                <Badge variant="outline" className="border-border bg-secondary/50">
                  {teacher.department}
                </Badge>
                <Badge variant="outline" className="border-border bg-secondary/50 capitalize">
                  {teacher.type}
                </Badge>
                <StatusBadge status={teacher.status} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {teacher.email}</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {teacher.phone}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="hero" onClick={action("Editing teacher…")}><Pencil /> Edit</Button>
            <Button variant="outline" onClick={action("ID card queued to print")}><IdCard /> Print ID</Button>
            <Button variant="outline" onClick={action("Profile PDF generated")}><Download /> PDF</Button>
            <Button variant="outline" onClick={action("Teacher archived")}><Archive /> Archive</Button>
          </div>
        </div>
      </motion.section>

      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewMetric label="Classes Assigned" value={String(profile.classes.length)} hint={profile.classes.map((c) => `${c.className}-${c.section}`).join(", ")} icon={School} tone="primary" index={0} />
        <OverviewMetric label="Subjects" value={String(profile.subjects.length)} hint={profile.subjects.map((s) => s.subject).join(", ") || "—"} icon={BookOpen} tone="accent" index={1} />
        <OverviewMetric label="Attendance Rate" value={`${profile.attendance.rate}%`} hint="last 7 months" icon={CalendarCheck2} tone="success" index={2} />
        <OverviewMetric label="Leave Balance" value={`${leaveBalance} days`} hint={`${usedLeave}/${totalLeave} used`} icon={Clock} tone={leaveBalance > 10 ? "success" : "warning"} index={3} />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 rounded-xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
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
              <SectionCard title="Personal Details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={User} label="Full Name" value={profile.personal.fullName} />
                  <InfoRow icon={Cake} label="Date of Birth" value={profile.personal.dob} />
                  <InfoRow icon={User} label="Gender" value={profile.personal.gender} />
                  <InfoRow icon={Hash} label="Blood Group" value={profile.personal.bloodGroup} />
                  <InfoRow icon={User} label="Nationality" value={profile.personal.nationality} />
                  <InfoRow icon={User} label="Marital Status" value={profile.personal.maritalStatus} />
                </div>
              </SectionCard>

              <SectionCard title="Contact Information">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={Mail} label="Email" value={profile.contact.email} />
                  <InfoRow icon={Phone} label="Phone" value={profile.contact.phone} />
                  <InfoRow icon={Phone} label="Alternate" value={profile.contact.alternate} />
                  <InfoRow icon={Briefcase} label="Employee ID" value={teacher.employeeId} />
                </div>
              </SectionCard>

              <SectionCard title="Address">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={MapPin} label="Address" value={profile.address.line1} />
                  <InfoRow icon={MapPin} label="City · State" value={`${profile.address.city} · ${profile.address.state}`} />
                  <InfoRow icon={MapPin} label="Country" value={profile.address.country} />
                  <InfoRow icon={Hash} label="Pincode" value={profile.address.pincode} />
                </div>
              </SectionCard>

              <SectionCard title="Emergency Contact">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow icon={User} label="Name" value={profile.emergency.name} />
                  <InfoRow icon={User} label="Relation" value={profile.emergency.relation} />
                  <InfoRow icon={Phone} label="Phone" value={profile.emergency.phone} />
                </div>
              </SectionCard>

              <SectionCard title="Qualifications" className="lg:col-span-1">
                <ul className="space-y-3">
                  {profile.qualifications.map((q) => (
                    <li key={q.degree} className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                      <GraduationCap className="mt-0.5 h-4 w-4 text-primary" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{q.degree}</p>
                        <p className="text-xs text-muted-foreground">{q.institution} · {q.year}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionCard>

              <SectionCard title="Certifications">
                <ul className="space-y-3">
                  {profile.certifications.map((c) => (
                    <li key={c.name} className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                      <Award className="mt-0.5 h-4 w-4 text-accent" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.issuer} · {c.year}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionCard>

              <SectionCard title="Skills" className="lg:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <span key={s} className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">{s}</span>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Work Experience" className="lg:col-span-2">
                <ol className="relative space-y-4 border-l border-border pl-6">
                  {profile.experience.map((e, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[30px] flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 ring-4 ring-background">
                        <Briefcase className="h-3 w-3 text-primary" />
                      </span>
                      <p className="text-sm font-semibold">{e.role}</p>
                      <p className="text-xs text-muted-foreground">{e.organization} · {e.from} → {e.to}</p>
                    </li>
                  ))}
                </ol>
              </SectionCard>
            </TabsContent>

            {/* CLASSES */}
            <TabsContent value="classes" className="mt-0">
              <SectionCard title="Assigned Classes">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {profile.classes.map((c) => (
                    <div key={`${c.className}-${c.section}`} className="rounded-xl border border-border bg-secondary/30 p-4 transition-smooth hover:border-primary/40">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-display text-lg font-semibold">{c.className}</p>
                          <p className="text-xs text-muted-foreground">Section {c.section}</p>
                        </div>
                        {c.isClassTeacher && (
                          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                            <Star className="mr-1 h-3 w-3" /> Class Teacher
                          </Badge>
                        )}
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" /> {c.students} students
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </TabsContent>

            {/* SUBJECTS */}
            <TabsContent value="subjects" className="mt-0">
              <SectionCard title="Subjects Taught">
                <div className="grid gap-3 sm:grid-cols-2">
                  {profile.subjects.map((s) => (
                    <div key={s.subject} className="rounded-xl border border-border bg-secondary/30 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-display text-base font-semibold">{s.subject}</p>
                          <p className="text-xs text-muted-foreground">{s.classes.join(", ") || "—"}</p>
                        </div>
                        <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">
                          {s.weeklyPeriods}/wk
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Class avg. score</span>
                          <span className="font-medium">{s.avgScore}%</span>
                        </div>
                        <Progress value={s.avgScore} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </TabsContent>

            {/* TIMETABLE */}
            <TabsContent value="timetable" className="mt-0 space-y-4">
              <SectionCard title="Weekly Timetable">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-separate border-spacing-1 text-xs">
                    <thead>
                      <tr>
                        <th className="w-24 text-left text-muted-foreground">Time</th>
                        {days.map((d) => (
                          <th key={d} className="text-left text-muted-foreground">{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {periodTimes.map((t, pi) => (
                        <tr key={t}>
                          <td className="py-1 font-mono text-muted-foreground">{t}</td>
                          {days.map((d) => {
                            const slot = profile.timetable.find((s) => s.day === d && s.period === pi + 1);
                            if (!slot) return <td key={d} />;
                            if (slot.free) {
                              return (
                                <td key={d}>
                                  <div className="rounded-lg border border-dashed border-border p-2 text-center text-[11px] text-muted-foreground">Free</div>
                                </td>
                              );
                            }
                            return (
                              <td key={d}>
                                <div className={cn(
                                  "rounded-lg border p-2",
                                  slot.conflict
                                    ? "border-destructive/40 bg-destructive/10"
                                    : "border-primary/20 bg-primary/5",
                                )}>
                                  <p className="text-[11px] font-semibold">{slot.subject}</p>
                                  <p className="text-[10px] text-muted-foreground">{slot.classLabel} · {slot.room}</p>
                                  {slot.conflict && (
                                    <p className="mt-1 flex items-center gap-1 text-[10px] text-destructive">
                                      <AlertTriangle className="h-3 w-3" /> Conflict
                                    </p>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard
                title="Daily schedule"
                action={
                  <div className="flex flex-wrap gap-1">
                    {days.map((d) => (
                      <button
                        key={d}
                        onClick={() => setTtDay(d)}
                        aria-pressed={ttDay === d}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-smooth",
                          ttDay === d ? "bg-primary/15 text-primary ring-primary/30" : "text-muted-foreground ring-border hover:bg-secondary/60",
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                }
              >
                <ol className="space-y-2">
                  {dailySlots.map((s) => (
                    <li key={s.period} className={cn(
                      "flex items-center gap-4 rounded-xl border p-3",
                      s.free ? "border-dashed border-border bg-secondary/20" : s.conflict ? "border-destructive/40 bg-destructive/10" : "border-border bg-secondary/40",
                    )}>
                      <div className="w-28 font-mono text-xs text-muted-foreground">{s.time}</div>
                      <div className="flex-1">
                        {s.free ? (
                          <p className="text-sm text-muted-foreground">Free period</p>
                        ) : (
                          <>
                            <p className="text-sm font-medium">{s.subject} · {s.classLabel}</p>
                            <p className="text-xs text-muted-foreground">Room {s.room}</p>
                          </>
                        )}
                      </div>
                      {s.conflict && (
                        <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                          <AlertTriangle className="mr-1 h-3 w-3" /> Conflict
                        </Badge>
                      )}
                    </li>
                  ))}
                </ol>
              </SectionCard>
            </TabsContent>

            {/* ATTENDANCE */}
            <TabsContent value="attendance" className="mt-0 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <OverviewMetric label="Rate" value={`${profile.attendance.rate}%`} icon={CalendarCheck2} tone="primary" index={0} />
                <OverviewMetric label="Present" value={String(profile.attendance.present)} icon={CheckCircle2} tone="success" index={1} />
                <OverviewMetric label="Absent" value={String(profile.attendance.absent)} icon={AlertCircle} tone="destructive" index={2} />
                <OverviewMetric label="Leave" value={String(profile.attendance.leave)} icon={Clock} tone="accent" index={3} />
              </div>

              <SectionCard title="Monthly attendance">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={profile.attendance.monthly}>
                      <defs>
                        <linearGradient id="teacherAtt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                      <XAxis dataKey="month" stroke={chartTheme.axis} fontSize={11} />
                      <YAxis stroke={chartTheme.axis} fontSize={11} domain={[0, 100]} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#teacherAtt)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Attendance history">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="py-2 text-left font-normal">Date</th>
                        <th className="py-2 text-left font-normal">Status</th>
                        <th className="py-2 text-left font-normal">Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.attendance.history.map((h) => (
                        <tr key={h.date} className="border-b border-border/50 last:border-0">
                          <td className="py-2 font-mono text-xs">{h.date}</td>
                          <td className="py-2">
                            <Badge variant="outline" className={cn(
                              "capitalize",
                              h.status === "present" && "border-success/30 bg-success/10 text-success",
                              h.status === "absent" && "border-destructive/30 bg-destructive/10 text-destructive",
                              h.status === "leave" && "border-accent/30 bg-accent/10 text-accent",
                            )}>{h.status}</Badge>
                          </td>
                          <td className="py-2 text-muted-foreground">{h.remark ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </TabsContent>

            {/* LEAVE */}
            <TabsContent value="leave" className="mt-0 space-y-4">
              <SectionCard title="Leave balance">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {profile.leave.balance.map((l) => {
                    const remaining = l.total - l.used;
                    const pct = Math.round((l.used / l.total) * 100);
                    return (
                      <div key={l.type} className="rounded-xl border border-border bg-secondary/30 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{l.type}</p>
                          <span className="font-mono text-xs text-muted-foreground">{l.used}/{l.total}</span>
                        </div>
                        <p className="mt-1 font-display text-2xl font-bold">{remaining} <span className="text-xs font-normal text-muted-foreground">left</span></p>
                        <Progress value={pct} className="mt-3" />
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard
                title="Leave requests"
                action={<Button variant="hero" size="sm" onClick={action("New leave request drafted")}><Plus className="h-4 w-4" /> New request</Button>}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="py-2 text-left font-normal">ID</th>
                        <th className="py-2 text-left font-normal">Type</th>
                        <th className="py-2 text-left font-normal">Period</th>
                        <th className="py-2 text-left font-normal">Days</th>
                        <th className="py-2 text-left font-normal">Reason</th>
                        <th className="py-2 text-left font-normal">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.leave.requests.map((r) => (
                        <tr key={r.id} className="border-b border-border/50 last:border-0">
                          <td className="py-2 font-mono text-xs">{r.id}</td>
                          <td className="py-2">{r.type}</td>
                          <td className="py-2 text-xs text-muted-foreground">{r.from} → {r.to}</td>
                          <td className="py-2">{r.days}</td>
                          <td className="py-2 text-muted-foreground">{r.reason}</td>
                          <td className="py-2">
                            <Badge variant="outline" className={cn("capitalize", leaveStatusTone[r.status])}>{r.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </TabsContent>

            {/* PAYROLL */}
            <TabsContent value="payroll" className="mt-0 space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <SectionCard title="Salary structure" className="lg:col-span-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-secondary/30 p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Basic</p>
                      <p className="font-display text-2xl font-bold">₹{profile.payroll.basic.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                      <p className="text-xs uppercase tracking-wider text-primary">Net payable</p>
                      <p className="font-display text-2xl font-bold text-primary">₹{profile.payroll.net.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Allowances</p>
                      <ul className="space-y-2">
                        {profile.payroll.allowances.map((a) => (
                          <li key={a.label} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{a.label}</span>
                            <span className="font-mono text-success">+ ₹{a.amount.toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Deductions</p>
                      <ul className="space-y-2">
                        {profile.payroll.deductions.map((d) => (
                          <li key={d.label} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{d.label}</span>
                            <span className="font-mono text-destructive">− ₹{d.amount.toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Net pay trend">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[...profile.payroll.payslips].reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                        <XAxis dataKey="month" stroke={chartTheme.axis} fontSize={10} />
                        <YAxis stroke={chartTheme.axis} fontSize={10} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="net" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </div>

              <SectionCard title="Payslip history">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="py-2 text-left font-normal">ID</th>
                        <th className="py-2 text-left font-normal">Month</th>
                        <th className="py-2 text-left font-normal">Gross</th>
                        <th className="py-2 text-left font-normal">Net</th>
                        <th className="py-2 text-left font-normal">Status</th>
                        <th className="py-2 text-right font-normal"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.payroll.payslips.map((p) => (
                        <tr key={p.id} className="border-b border-border/50 last:border-0">
                          <td className="py-2 font-mono text-xs">{p.id}</td>
                          <td className="py-2">{p.month}</td>
                          <td className="py-2 font-mono">₹{p.gross.toLocaleString()}</td>
                          <td className="py-2 font-mono font-medium">₹{p.net.toLocaleString()}</td>
                          <td className="py-2">
                            <Badge variant="outline" className={cn(
                              "capitalize",
                              p.status === "paid" ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/10 text-warning",
                            )}>{p.status}</Badge>
                          </td>
                          <td className="py-2 text-right">
                            <Button variant="ghost" size="sm" onClick={action(`Downloading ${p.month} payslip`)} aria-label={`Download ${p.month} payslip`}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </TabsContent>

            {/* DOCUMENTS */}
            <TabsContent value="documents" className="mt-0">
              <SectionCard title="Documents">
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
