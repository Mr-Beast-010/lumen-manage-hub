import type { TeacherRecord } from "../data";
import type { TimelineEvent, DocumentItem } from "@/features/students/profile/mockProfile";

export interface Qualification { degree: string; institution: string; year: string; }
export interface Certification { name: string; issuer: string; year: string; }
export interface Experience { role: string; organization: string; from: string; to: string; }
export interface AddressInfo { line1: string; city: string; state: string; country: string; pincode: string; }
export interface EmergencyContact { name: string; relation: string; phone: string; }
export interface ClassAssignment { className: string; section: string; students: number; isClassTeacher: boolean; }
export interface SubjectAssignment { subject: string; classes: string[]; weeklyPeriods: number; avgScore: number; }
export interface TimetableSlot { day: string; period: number; time: string; subject?: string; classLabel?: string; room?: string; free?: boolean; conflict?: boolean; }
export interface AttendanceMonthRow { month: string; present: number; absent: number; leave: number; rate: number; }
export interface AttendanceHistoryRow { date: string; status: "present" | "absent" | "leave"; remark?: string; }
export interface LeaveBalance { type: string; total: number; used: number; }
export interface LeaveRequestItem { id: string; type: string; from: string; to: string; days: number; reason: string; status: "pending" | "approved" | "rejected"; }
export interface PayslipItem { id: string; month: string; gross: number; net: number; status: "paid" | "pending"; }

export interface TeacherProfile {
  personal: {
    fullName: string;
    dob: string;
    gender: string;
    bloodGroup: string;
    nationality: string;
    maritalStatus: string;
  };
  address: AddressInfo;
  contact: { email: string; phone: string; alternate: string; };
  qualifications: Qualification[];
  certifications: Certification[];
  skills: string[];
  experience: Experience[];
  emergency: EmergencyContact;
  classes: ClassAssignment[];
  subjects: SubjectAssignment[];
  timetable: TimetableSlot[];
  attendance: {
    present: number;
    absent: number;
    leave: number;
    rate: number;
    monthly: AttendanceMonthRow[];
    history: AttendanceHistoryRow[];
  };
  leave: {
    balance: LeaveBalance[];
    requests: LeaveRequestItem[];
  };
  payroll: {
    basic: number;
    allowances: { label: string; amount: number }[];
    deductions: { label: string; amount: number }[];
    net: number;
    payslips: PayslipItem[];
  };
  documents: DocumentItem[];
  timeline: TimelineEvent[];
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const periods = [
  { p: 1, time: "08:30 – 09:15" },
  { p: 2, time: "09:20 – 10:05" },
  { p: 3, time: "10:20 – 11:05" },
  { p: 4, time: "11:10 – 11:55" },
  { p: 5, time: "13:00 – 13:45" },
  { p: 6, time: "13:50 – 14:35" },
];

const seededRand = (seed: number) => { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };

export function buildTeacherProfile(t: TeacherRecord): TeacherProfile {
  const rnd = seededRand(t.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];

  const classesAssigned: ClassAssignment[] = (t.classes.length ? t.classes : ["10-A", "9-B"]).map((c, i) => {
    const [cls, sec] = c.split("-");
    return {
      className: `Grade ${cls}`,
      section: sec ?? "A",
      students: 24 + Math.floor(rnd() * 18),
      isClassTeacher: i === 0,
    };
  });

  const subjectsAssigned: SubjectAssignment[] = (t.subjects.length ? t.subjects : ["General"]).map((s) => ({
    subject: s,
    classes: t.classes.length ? t.classes.slice(0, 2) : ["10-A"],
    weeklyPeriods: 4 + Math.floor(rnd() * 5),
    avgScore: 68 + Math.floor(rnd() * 25),
  }));

  const timetable: TimetableSlot[] = [];
  days.forEach((d, di) => {
    periods.forEach(({ p, time }) => {
      const isFree = rnd() > 0.75;
      const conflict = !isFree && rnd() > 0.94;
      timetable.push({
        day: d,
        period: p,
        time,
        free: isFree,
        conflict,
        subject: isFree ? undefined : pick(t.subjects.length ? t.subjects : ["Mathematics"]),
        classLabel: isFree ? undefined : pick(t.classes.length ? t.classes : ["10-A"]),
        room: isFree ? undefined : `R-${100 + ((di * 6 + p) % 24)}`,
      });
    });
  });

  const monthly: AttendanceMonthRow[] = ["Jan","Feb","Mar","Apr","May","Jun","Jul"].map((m, i) => {
    const present = 18 + Math.floor(rnd() * 4);
    const absent = Math.floor(rnd() * 3);
    const leave = Math.floor(rnd() * 2);
    const total = present + absent + leave;
    return { month: m, present, absent, leave, rate: Math.round((present / total) * 100) };
  });

  const history: AttendanceHistoryRow[] = Array.from({ length: 12 }).map((_, i) => {
    const r = rnd();
    const status: AttendanceHistoryRow["status"] = r > 0.9 ? "leave" : r > 0.82 ? "absent" : "present";
    const d = new Date(2026, 6, 10 - i);
    return {
      date: d.toISOString().slice(0, 10),
      status,
      remark: status === "leave" ? "Approved leave" : status === "absent" ? "Uninformed" : undefined,
    };
  });

  const totalPresent = monthly.reduce((s, m) => s + m.present, 0);
  const totalAbsent = monthly.reduce((s, m) => s + m.absent, 0);
  const totalLeave = monthly.reduce((s, m) => s + m.leave, 0);
  const rate = Math.round((totalPresent / (totalPresent + totalAbsent + totalLeave)) * 100);

  const basic = 45000 + Math.floor(rnd() * 25000);
  const hra = Math.round(basic * 0.2);
  const transport = 3000;
  const medical = 2500;
  const pf = Math.round(basic * 0.12);
  const tax = Math.round(basic * 0.08);
  const net = basic + hra + transport + medical - pf - tax;

  const payslips: PayslipItem[] = ["Jul 2026","Jun 2026","May 2026","Apr 2026","Mar 2026","Feb 2026"].map((m, i) => ({
    id: `PS-${1000 + i}`,
    month: m,
    gross: basic + hra + transport + medical,
    net,
    status: i === 0 ? "pending" : "paid",
  }));

  const requests: LeaveRequestItem[] = [
    { id: "LV-201", type: "Sick", from: "2026-07-15", to: "2026-07-16", days: 2, reason: "Fever", status: "pending" },
    { id: "LV-198", type: "Casual", from: "2026-06-20", to: "2026-06-20", days: 1, reason: "Personal work", status: "approved" },
    { id: "LV-190", type: "Earned", from: "2026-05-12", to: "2026-05-15", days: 4, reason: "Family function", status: "approved" },
    { id: "LV-181", type: "Sick", from: "2026-04-02", to: "2026-04-03", days: 2, reason: "Migraine", status: "approved" },
    { id: "LV-172", type: "Casual", from: "2026-03-18", to: "2026-03-18", days: 1, reason: "Bank work", status: "rejected" },
  ];

  const timeline: TimelineEvent[] = [
    { id: "e1", type: "admission", title: "Joined the school", description: `Onboarded as ${t.designation} in ${t.department}.`, timestamp: t.joinedOn },
    { id: "e2", type: "profile", title: "Assigned as class teacher", description: `Class teacher for ${classesAssigned[0].className} ${classesAssigned[0].section}.`, timestamp: "2026-04-05" },
    { id: "e3", type: "attendance", title: "Timetable updated", description: "New weekly timetable published.", timestamp: "2026-05-18" },
    { id: "e4", type: "documents", title: "Certification uploaded", description: "Uploaded advanced pedagogy certificate.", timestamp: "2026-06-02" },
    { id: "e5", type: "fees", title: "Payslip generated", description: "Salary credited for June 2026.", timestamp: "2026-06-30" },
    { id: "e6", type: "profile", title: "Profile updated", description: "Updated contact information.", timestamp: "2026-07-04" },
  ];

  const documents: DocumentItem[] = [
    { id: "D1", name: "Aadhar Card.pdf", type: "PDF", category: "Identity", size: "240 KB", uploadedAt: "2024-01-12", status: "verified" },
    { id: "D2", name: "PAN Card.pdf", type: "PDF", category: "Identity", size: "180 KB", uploadedAt: "2024-01-12", status: "verified" },
    { id: "D3", name: "Degree Certificate.pdf", type: "PDF", category: "Academic", size: "1.2 MB", uploadedAt: "2024-02-04", status: "verified" },
    { id: "D4", name: "Experience Letter.pdf", type: "PDF", category: "Academic", size: "320 KB", uploadedAt: "2024-02-04", status: "verified" },
    { id: "D5", name: "Medical Fitness.pdf", type: "PDF", category: "Medical", size: "210 KB", uploadedAt: "2024-03-10", status: "pending" },
    { id: "D6", name: "Address Proof.pdf", type: "PDF", category: "Other", size: "260 KB", uploadedAt: "2024-01-12", status: "verified" },
  ];

  return {
    personal: {
      fullName: t.name,
      dob: t.dob,
      gender: t.gender,
      bloodGroup: pick(["A+","B+","O+","AB+","O-","A-"]),
      nationality: "Indian",
      maritalStatus: pick(["Single","Married","Married","Single"]),
    },
    address: {
      line1: `${100 + Math.floor(rnd() * 800)} ${pick(["Rosewood","Marigold","Cedar","Willow"])} Lane`,
      city: pick(["Bengaluru","Mumbai","Delhi","Hyderabad","Chennai"]),
      state: pick(["Karnataka","Maharashtra","Delhi","Telangana","Tamil Nadu"]),
      country: "India",
      pincode: `${560000 + Math.floor(rnd() * 999)}`,
    },
    contact: {
      email: t.email,
      phone: t.phone,
      alternate: `+1 (555) ${String(200 + Math.floor(rnd() * 700))}-${String(1000 + Math.floor(rnd() * 8999))}`,
    },
    qualifications: [
      { degree: t.type === "teaching" ? "M.Ed" : "MBA", institution: "University of Delhi", year: `${2026 - t.experience - 2}` },
      { degree: t.type === "teaching" ? "B.Ed" : "B.Com", institution: "St. Xavier's College", year: `${2026 - t.experience - 4}` },
      { degree: t.type === "teaching" ? `M.Sc ${t.department}` : "Diploma", institution: "IIT Bombay", year: `${2026 - t.experience - 6}` },
    ],
    certifications: [
      { name: "Advanced Pedagogy", issuer: "NCERT", year: "2024" },
      { name: "Digital Classroom", issuer: "Google for Education", year: "2023" },
      { name: "Child Safety & Wellbeing", issuer: "CBSE", year: "2022" },
    ],
    skills: t.type === "teaching"
      ? ["Curriculum Design","Assessment","Classroom Management","EdTech","Mentoring","Public Speaking"]
      : ["Administration","MS Office","Communication","Record Keeping","Coordination"],
    experience: [
      { role: t.designation, organization: "EduManage High School", from: t.joinedOn.slice(0, 7), to: "Present" },
      { role: "Senior Teacher", organization: "Bright Future School", from: `${2026 - t.experience - 3}-06`, to: `${2026 - t.experience}-05` },
      { role: "Teacher", organization: "Sunrise Academy", from: `${2026 - t.experience - 6}-04`, to: `${2026 - t.experience - 3}-05` },
    ],
    emergency: {
      name: `${pick(["Ramesh","Sunita","Anil","Kavita"])} ${t.name.split(" ")[1] ?? "Sharma"}`,
      relation: pick(["Spouse","Parent","Sibling"]),
      phone: `+1 (555) ${String(200 + Math.floor(rnd() * 700))}-${String(1000 + Math.floor(rnd() * 8999))}`,
    },
    classes: classesAssigned,
    subjects: subjectsAssigned,
    timetable,
    attendance: { present: totalPresent, absent: totalAbsent, leave: totalLeave, rate, monthly, history },
    leave: {
      balance: [
        { type: "Sick", total: 12, used: 4 },
        { type: "Casual", total: 12, used: 6 },
        { type: "Earned", total: 15, used: 5 },
        { type: "Maternity/Paternity", total: 30, used: 0 },
      ],
      requests,
    },
    payroll: {
      basic,
      allowances: [
        { label: "HRA", amount: hra },
        { label: "Transport", amount: transport },
        { label: "Medical", amount: medical },
      ],
      deductions: [
        { label: "Provident Fund", amount: pf },
        { label: "Tax", amount: tax },
      ],
      net,
      payslips,
    },
    documents,
    timeline,
  };
}
