// Derived analytics data for attendance reporting.
import { studentRecords } from "@/features/students/data";
import { teacherRecords } from "@/features/teachers/data";
import { dailyTrend, weeklyTrend, monthlyTrend } from "../data";

const rnd = (seed: number) => {
  let s = seed || 1;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
};

// ---- Aggregate metrics ----
const activeStudents = studentRecords.filter((s) => s.status === "active");
const activeTeachers = teacherRecords.filter((t) => t.status !== "archived");

export const overallStudentRate = Math.round(
  activeStudents.reduce((a, s) => a + s.attendance, 0) / Math.max(activeStudents.length, 1),
);
export const overallTeacherRate = Math.round(
  activeTeachers.reduce((a, t) => a + t.attendance, 0) / Math.max(activeTeachers.length, 1),
);
export const overallRate = Math.round((overallStudentRate + overallTeacherRate) / 2);

export const todayRate = dailyTrend[dailyTrend.length - 1]?.students ?? overallStudentRate;
export const monthlyRate = Math.round(
  monthlyTrend.reduce((a, m) => a + m.students, 0) / Math.max(monthlyTrend.length, 1),
);
export const previousMonthlyRate = monthlyRate - 2;
export const attendanceTrend = monthlyRate - previousMonthlyRate;

export const studentsBelow75 = activeStudents.filter((s) => s.attendance < 75);
export const teachersBelow90 = activeTeachers.filter((t) => t.attendance < 90);

// ---- Comparison datasets ----
export const departmentComparison = Array.from(
  new Set(activeTeachers.map((t) => t.department)),
).map((d) => {
  const rows = activeTeachers.filter((t) => t.department === d);
  const avg = Math.round(rows.reduce((a, t) => a + t.attendance, 0) / Math.max(rows.length, 1));
  return { name: d, attendance: avg, staff: rows.length };
}).sort((a, b) => b.attendance - a.attendance);

export const classComparison = Array.from(
  new Set(activeStudents.map((s) => `${s.className}-${s.section}`)),
).map((cs) => {
  const rows = activeStudents.filter((s) => `${s.className}-${s.section}` === cs);
  const avg = Math.round(rows.reduce((a, s) => a + s.attendance, 0) / Math.max(rows.length, 1));
  return { name: `Grade ${cs}`, attendance: avg, students: rows.length };
}).sort((a, b) => b.attendance - a.attendance);

const subjectPool = [
  "Mathematics", "Science", "English", "History", "Geography",
  "Computer Science", "Physical Education", "Art", "Music",
];
export const subjectComparison = subjectPool.map((name, i) => {
  const r = rnd(i + 11);
  return { name, attendance: 78 + Math.floor(r() * 18) };
}).sort((a, b) => b.attendance - a.attendance);

// ---- Reusable trend re-exports ----
export { dailyTrend, weeklyTrend, monthlyTrend };

// ---- Per-student analytics ----
export function studentTimeline(studentId: string) {
  const r = rnd(studentId.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  return Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: 70 + Math.floor(r() * 30),
    };
  });
}

export function studentMonthly(studentId: string) {
  const r = rnd(studentId.charCodeAt(4) + 7);
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m) => ({
    month: m,
    value: 72 + Math.floor(r() * 25),
  }));
}

export function studentWeekly(studentId: string) {
  const r = rnd(studentId.charCodeAt(5) + 3);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({
    day,
    present: 75 + Math.floor(r() * 22),
  }));
}

export function riskForStudent(attendance: number) {
  if (attendance < 60) return { level: "critical" as const, label: "Critical", tone: "text-destructive" };
  if (attendance < 75) return { level: "at-risk" as const, label: "At Risk", tone: "text-warning" };
  if (attendance < 85) return { level: "watch" as const, label: "Watch", tone: "text-accent" };
  return { level: "healthy" as const, label: "Healthy", tone: "text-success" };
}

export function consecutiveAbsences(studentId: string) {
  const r = rnd(studentId.charCodeAt(6) + 5);
  return Math.floor(r() * 6);
}

// ---- Per-teacher analytics ----
export function teacherMonthly(teacherId: string) {
  const r = rnd(teacherId.charCodeAt(3) + 9);
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month) => ({
    month,
    value: 84 + Math.floor(r() * 14),
  }));
}
export function teacherLeaveStats(teacherId: string) {
  const r = rnd(teacherId.charCodeAt(4) + 11);
  return {
    sick: Math.floor(r() * 6),
    casual: Math.floor(r() * 5),
    earned: Math.floor(r() * 8),
    unpaid: Math.floor(r() * 2),
  };
}
export function teacherLateArrivals(teacherId: string) {
  const r = rnd(teacherId.charCodeAt(5) + 13);
  return Math.floor(r() * 9);
}

export const departmentRanking = departmentComparison.map((d, i) => ({
  rank: i + 1,
  ...d,
}));

// ---- Executive KPIs ----
export const schoolKpis = {
  attendance: overallRate,
  growth: attendanceTrend,
  topDepartment: departmentComparison[0]?.name ?? "—",
  topClass: classComparison[0]?.name ?? "—",
};

// ---- Alerts ----
export interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  audience: "parent" | "teacher" | "admin";
  type: "absent" | "low" | "missing";
  title: string;
  detail: string;
  time: string;
}

export const alerts: Alert[] = [
  { id: "n1", severity: "critical", audience: "parent", type: "absent", title: "Student absent today", detail: "Ethan Chen (Grade 10-A) marked absent without leave.", time: "10 min ago" },
  { id: "n2", severity: "warning", audience: "parent", type: "low", title: "Low attendance", detail: "Priya Singh has dropped below 70% this month.", time: "1 hr ago" },
  { id: "n3", severity: "warning", audience: "teacher", type: "missing", title: "Missing attendance", detail: "Grade 9-B Period 3 attendance not submitted.", time: "2 hr ago" },
  { id: "n4", severity: "info", audience: "admin", type: "low", title: "Department below 90%", detail: "Science department average dropped to 88%.", time: "yesterday" },
  { id: "n5", severity: "critical", audience: "parent", type: "absent", title: "Consecutive absences", detail: "Kai Silva absent 3 days in a row.", time: "yesterday" },
];
