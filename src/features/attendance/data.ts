import { studentRecords } from "@/features/students/data";
import { teacherRecords } from "@/features/teachers/data";

export type AttStatus = "present" | "absent" | "late" | "leave";

export const statusMeta: Record<AttStatus, { label: string; tone: string; dot: string }> = {
  present: { label: "Present", tone: "bg-success/10 text-success ring-success/30", dot: "bg-success" },
  absent: { label: "Absent", tone: "bg-destructive/10 text-destructive ring-destructive/30", dot: "bg-destructive" },
  late: { label: "Late", tone: "bg-warning/10 text-warning ring-warning/30", dot: "bg-warning" },
  leave: { label: "Leave", tone: "bg-accent/10 text-accent ring-accent/30", dot: "bg-accent" },
};

const seeded = (seed: number) => {
  let s = seed || 1;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
};

const rollStatus = (r: number): AttStatus => {
  if (r < 0.82) return "present";
  if (r < 0.9) return "late";
  if (r < 0.96) return "absent";
  return "leave";
};

// Today snapshot for students
const rndS = seeded(4711);
export const studentTodayAttendance: Record<string, AttStatus> = Object.fromEntries(
  studentRecords.map((s) => [s.id, rollStatus(rndS())]),
);

const rndT = seeded(9137);
export const teacherTodayAttendance: Record<string, AttStatus> = Object.fromEntries(
  teacherRecords.map((t) => [t.id, t.status === "on-leave" ? "leave" : rollStatus(rndT())]),
);

export function summarize(map: Record<string, AttStatus>) {
  const values = Object.values(map);
  const total = values.length || 1;
  const c = (s: AttStatus) => values.filter((v) => v === s).length;
  const present = c("present");
  const late = c("late");
  return {
    total,
    present,
    absent: c("absent"),
    late,
    leave: c("leave"),
    rate: Math.round(((present + late) / total) * 100),
  };
}

// Daily trend last 14 days
export const dailyTrend = Array.from({ length: 14 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  const rnd = seeded(d.getTime() / 1e6);
  return {
    date: d.toISOString().slice(0, 10),
    label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    students: 88 + Math.floor(rnd() * 10),
    teachers: 90 + Math.floor(rnd() * 8),
  };
});

export const weeklyTrend = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => {
  const r = seeded(i + 3);
  return {
    day,
    present: 78 + Math.floor(r() * 12),
    absent: 3 + Math.floor(r() * 4),
    late: 4 + Math.floor(r() * 5),
    leave: 2 + Math.floor(r() * 3),
  };
});

export const monthlyTrend = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month, i) => {
  const r = seeded(i + 21);
  return {
    month,
    students: 88 + Math.floor(r() * 8),
    teachers: 91 + Math.floor(r() * 6),
  };
});

// Heatmap: 12 weeks x 7 days
export const heatmapData = (() => {
  const out: { week: number; day: number; rate: number }[] = [];
  const r = seeded(88);
  for (let w = 0; w < 12; w++) {
    for (let d = 0; d < 7; d++) {
      if (d === 6) { out.push({ week: w, day: d, rate: 0 }); continue; }
      out.push({ week: w, day: d, rate: 60 + Math.floor(r() * 40) });
    }
  }
  return out;
})();

// Class rosters derived from students
export const classSectionList = Array.from(
  new Set(studentRecords.map((s) => `${s.className}-${s.section}`)),
).sort();

export function rosterForClass(classSection: string) {
  const [cls, sec] = classSection.split("-");
  return studentRecords.filter((s) => s.className === cls && s.section === sec);
}

export const departmentList = Array.from(new Set(teacherRecords.map((t) => t.department))).sort();

// Pending attendance widget data (classes not yet marked)
export const pendingClasses = [
  { classSection: "9-B", teacher: "Ms. Rossi", period: "Period 2", time: "09:20" },
  { classSection: "10-A", teacher: "Mr. Khan", period: "Period 3", time: "10:20" },
  { classSection: "11-A", teacher: "Ms. Silva", period: "Period 4", time: "11:10" },
  { classSection: "7-C", teacher: "Mr. Patel", period: "Period 5", time: "13:00" },
];

export const todaysClasses = [
  { time: "08:30", period: "Period 1", subject: "Mathematics", classSection: "10-A", room: "R-101" },
  { time: "09:20", period: "Period 2", subject: "Physics", classSection: "9-B", room: "R-204" },
  { time: "10:20", period: "Period 3", subject: "English", classSection: "11-A", room: "R-108" },
  { time: "11:10", period: "Period 4", subject: "Computer Science", classSection: "12-B", room: "Lab-1" },
  { time: "13:00", period: "Period 5", subject: "History", classSection: "8-C", room: "R-115" },
];

export interface AttendanceUpdate {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
}
export const recentUpdates: AttendanceUpdate[] = [
  { id: "u1", actor: "Ms. Rossi", action: "submitted attendance for", target: "Grade 10-A", time: "2m ago" },
  { id: "u2", actor: "Mr. Khan", action: "marked 3 students absent in", target: "Grade 9-B", time: "18m ago" },
  { id: "u3", actor: "Admin", action: "notified parents for", target: "5 absentees", time: "42m ago" },
  { id: "u4", actor: "Ms. Silva", action: "saved a draft for", target: "Grade 11-A", time: "1h ago" },
  { id: "u5", actor: "Mr. Patel", action: "updated attendance for", target: "Grade 7-C", time: "2h ago" },
];

export interface AttendanceAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  detail: string;
}
export const attendanceAlerts: AttendanceAlert[] = [
  { id: "a1", severity: "critical", title: "Low attendance streak", detail: "Ethan Chen is below 60% for 5 consecutive days." },
  { id: "a2", severity: "warning", title: "Missing attendance", detail: "Grade 11-A Period 4 attendance not submitted." },
  { id: "a3", severity: "warning", title: "Chronic late arrivals", detail: "Kai Silva has 8 late marks this month." },
  { id: "a4", severity: "info", title: "Leave approved", detail: "3 teachers on approved leave today." },
];

// History generator: monthly per student/teacher
export function monthlyHistoryFor(id: string, month: string) {
  const [y, m] = month.split("-").map(Number);
  const days = new Date(y, m, 0).getDate();
  const r = seeded(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + m);
  return Array.from({ length: days }).map((_, i) => {
    const dow = new Date(y, m - 1, i + 1).getDay();
    const date = `${month}-${String(i + 1).padStart(2, "0")}`;
    if (dow === 0) return { date, status: "leave" as AttStatus };
    return { date, status: rollStatus(r()) };
  });
}

export function summarizeHistory(rows: { status: AttStatus }[]) {
  return summarize(Object.fromEntries(rows.map((r, i) => [i, r.status])));
}
