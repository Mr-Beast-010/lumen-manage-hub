import { teacherRecords, type TeacherRecord } from "@/features/teachers/data";

export type AttendanceStatus = "present" | "absent" | "late" | "on-leave";
export type LeaveType = "casual" | "sick" | "earned" | "maternity" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected" | "info-requested" | "cancelled";

export interface AttendanceRecord {
  teacherId: string;
  date: string; // ISO YYYY-MM-DD
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
}

export interface LeaveRequestRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  department: string;
  type: LeaveType;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
}

export interface LeaveBalance {
  teacherId: string;
  casual: { used: number; total: number };
  sick: { used: number; total: number };
  earned: { used: number; total: number };
  maternity: { used: number; total: number };
  unpaid: { used: number; total: number };
}

export interface PayslipRecord {
  id: string;
  teacherId: string;
  month: string; // e.g. "2026-06"
  basic: number;
  hra: number;
  transport: number;
  medical: number;
  bonus: number;
  tax: number;
  pf: number;
  other: number;
  status: "paid" | "processing" | "pending";
}

export interface PerformanceRecord {
  teacherId: string;
  overall: number;      // 0-100
  studentFeedback: number;
  attendanceScore: number;
  teachingLoad: number;
  departmentRating: number;
  monthly: { month: string; score: number }[];
  yearly: { year: string; score: number }[];
  attendanceVsPerf: { month: string; attendance: number; performance: number }[];
}

export interface NotificationItem {
  id: string;
  type: "leave-approved" | "leave-rejected" | "payroll-available" | "attendance-reminder";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const leaveTypeLabels: Record<LeaveType, string> = {
  casual: "Casual",
  sick: "Sick",
  earned: "Earned",
  maternity: "Maternity/Paternity",
  unpaid: "Unpaid",
};

export const leaveTypeTones: Record<LeaveType, string> = {
  casual: "bg-primary/10 text-primary border-primary/20",
  sick: "bg-destructive/10 text-destructive border-destructive/20",
  earned: "bg-success/10 text-success border-success/20",
  maternity: "bg-accent/10 text-accent border-accent/20",
  unpaid: "bg-muted text-muted-foreground border-border",
};

const seeded = (seed: number) => {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
};

const rnd = seeded(2027);
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];

/* ----------------------------- Attendance ----------------------------- */
export const todayISO = new Date().toISOString().slice(0, 10);

export const todayAttendance: Record<string, AttendanceStatus> = Object.fromEntries(
  teacherRecords.map((t) => {
    const r = rnd();
    let status: AttendanceStatus = "present";
    if (t.status === "on-leave") status = "on-leave";
    else if (r < 0.05) status = "absent";
    else if (r < 0.12) status = "late";
    else if (r < 0.18) status = "on-leave";
    return [t.id, status];
  }),
);

export function attendanceSummary(map: Record<string, AttendanceStatus>) {
  const values = Object.values(map);
  const total = values.length || 1;
  const present = values.filter((v) => v === "present").length;
  const absent = values.filter((v) => v === "absent").length;
  const late = values.filter((v) => v === "late").length;
  const onLeave = values.filter((v) => v === "on-leave").length;
  return {
    present, absent, late, onLeave,
    rate: Math.round(((present + late) / total) * 100),
  };
}

export function generateMonthlyAttendance(teacherId: string, month: string) {
  const [y, m] = month.split("-").map(Number);
  const days = new Date(y, m, 0).getDate();
  const r = seeded(teacherId.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + m);
  return Array.from({ length: days }).map((_, i) => {
    const date = `${month}-${String(i + 1).padStart(2, "0")}`;
    const dayOfWeek = new Date(y, m - 1, i + 1).getDay();
    if (dayOfWeek === 0) return { date, status: "on-leave" as AttendanceStatus };
    const roll = r();
    let status: AttendanceStatus = "present";
    if (roll < 0.05) status = "absent";
    else if (roll < 0.12) status = "late";
    else if (roll < 0.16) status = "on-leave";
    return { date, status };
  });
}

export function weeklyAttendanceTrend() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.map((d, i) => ({
    day: d,
    present: 82 + ((i * 3 + 11) % 12),
    absent: 3 + ((i * 2) % 4),
    late: 4 + ((i + 1) % 5),
  }));
}

/* ------------------------------ Leaves -------------------------------- */
const reasons = [
  "Family function",
  "Medical appointment",
  "Personal emergency",
  "Vacation with family",
  "Conference attendance",
  "Health recovery",
  "Wedding in family",
  "Child care",
];

export const leaveRequestsData: LeaveRequestRecord[] = teacherRecords.slice(0, 14).map((t, i) => {
  const type = (["casual", "sick", "earned", "maternity", "unpaid"] as LeaveType[])[i % 5];
  const startDay = 3 + (i % 20);
  const days = 1 + (i % 5);
  const statuses: LeaveStatus[] = ["pending", "pending", "approved", "approved", "approved", "rejected", "info-requested"];
  return {
    id: `LV-${2000 + i}`,
    teacherId: t.id,
    teacherName: t.name,
    department: t.department,
    type,
    from: `2026-07-${String(startDay).padStart(2, "0")}`,
    to: `2026-07-${String(startDay + days - 1).padStart(2, "0")}`,
    days,
    reason: reasons[i % reasons.length],
    status: statuses[i % statuses.length],
    appliedOn: `2026-07-${String(Math.max(1, startDay - 3)).padStart(2, "0")}`,
  };
});

export function leaveBalanceFor(teacherId: string): LeaveBalance {
  const r = seeded(teacherId.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  return {
    teacherId,
    casual: { used: Math.floor(r() * 8), total: 12 },
    sick: { used: Math.floor(r() * 6), total: 10 },
    earned: { used: Math.floor(r() * 10), total: 20 },
    maternity: { used: 0, total: 180 },
    unpaid: { used: Math.floor(r() * 2), total: 30 },
  };
}

/* ------------------------------ Payroll ------------------------------- */
export function payslipsFor(teacher: TeacherRecord): PayslipRecord[] {
  const r = seeded(teacher.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  const basicBase = 45000 + teacher.experience * 1800 + Math.floor(r() * 8000);
  const months = ["2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07"];
  return months.map((m, i) => {
    const basic = basicBase;
    const hra = Math.round(basic * 0.4);
    const transport = 3000;
    const medical = 1500;
    const bonus = i === 6 ? 0 : Math.floor(r() * 4000);
    const tax = Math.round(basic * 0.1);
    const pf = Math.round(basic * 0.12);
    const other = 500;
    return {
      id: `PS-${teacher.id}-${m}`,
      teacherId: teacher.id,
      month: m,
      basic, hra, transport, medical, bonus, tax, pf, other,
      status: i === 6 ? "processing" : "paid",
    };
  });
}

export function payslipNet(p: PayslipRecord) {
  const gross = p.basic + p.hra + p.transport + p.medical + p.bonus;
  const deductions = p.tax + p.pf + p.other;
  return { gross, deductions, net: gross - deductions };
}

/* --------------------------- Performance ------------------------------ */
export function performanceFor(teacher: TeacherRecord): PerformanceRecord {
  const r = seeded(teacher.id.charCodeAt(4) + teacher.experience);
  const overall = 70 + Math.floor(r() * 25);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  return {
    teacherId: teacher.id,
    overall,
    studentFeedback: Math.round(teacher.rating * 20),
    attendanceScore: teacher.attendance,
    teachingLoad: 60 + Math.floor(r() * 35),
    departmentRating: 65 + Math.floor(r() * 30),
    monthly: months.map((m, i) => ({ month: m, score: overall - 6 + ((i * 3 + Math.floor(r() * 6)) % 12) })),
    yearly: ["2022","2023","2024","2025","2026"].map((y, i) => ({ year: y, score: overall - 10 + i * 2 + Math.floor(r() * 5) })),
    attendanceVsPerf: months.map((m, i) => ({
      month: m,
      attendance: 85 + ((i * 2 + Math.floor(r() * 8)) % 12),
      performance: overall - 5 + ((i * 3) % 10),
    })),
  };
}

/* ---------------------------- Notifications --------------------------- */
export const notificationsSeed: NotificationItem[] = [
  { id: "N-1", type: "leave-approved", title: "Leave approved", message: "Your casual leave for Jul 12-13 has been approved.", time: "2h ago", read: false },
  { id: "N-2", type: "payroll-available", title: "Payslip available", message: "June 2026 payslip is ready to download.", time: "1d ago", read: false },
  { id: "N-3", type: "attendance-reminder", title: "Attendance reminder", message: "Please mark today's attendance before 9:30 AM.", time: "3h ago", read: true },
  { id: "N-4", type: "leave-rejected", title: "Leave rejected", message: "Earned leave request for Jul 20 was rejected. See notes.", time: "5h ago", read: false },
];
