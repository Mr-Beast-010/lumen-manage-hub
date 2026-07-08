import type { StudentRecord } from "../data";

export interface AttendanceMonth {
  month: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
  rate: number;
}

export interface AttendanceWeek {
  week: string;
  rate: number;
}

export interface AttendanceYear {
  year: string;
  rate: number;
}

export interface AttendanceHistoryRow {
  date: string;
  status: "present" | "absent" | "late" | "leave";
  remark?: string;
  teacher: string;
}

export interface SubjectResult {
  subject: string;
  marks: number;
  max: number;
  grade: string;
  remark: string;
}

export interface SemesterPoint {
  semester: string;
  gpa: number;
  average: number;
}

export interface ExamComparison {
  exam: string;
  you: number;
  class: number;
  top: number;
}

export interface FeeItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  paidOn?: string;
  receipt?: string;
  method?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  category: "Identity" | "Academic" | "Medical" | "Guardian" | "Other";
  size: string;
  uploadedAt: string;
  status: "verified" | "pending" | "missing";
}

export interface TimelineEvent {
  id: string;
  type: "admission" | "attendance" | "fees" | "results" | "documents" | "profile";
  title: string;
  description: string;
  timestamp: string;
}

export interface ProfileInsight {
  id: string;
  tone: "positive" | "warning" | "critical" | "info";
  title: string;
  description: string;
  action?: string;
}

export interface StudentProfile {
  bio: {
    bloodGroup: string;
    nationality: string;
    religion: string;
    motherTongue: string;
    address: string;
    city: string;
    country: string;
    pincode: string;
    category: string;
    academicYear: string;
  };
  guardian: {
    father: { name: string; occupation: string; phone: string; email: string };
    mother: { name: string; occupation: string; phone: string; email: string };
    emergency: { name: string; relation: string; phone: string };
    address: string;
    preferredChannel: "Email" | "SMS" | "Phone";
  };
  medical: {
    bloodGroup: string;
    allergies: string[];
    conditions: string[];
    medications: string[];
    doctor: string;
    doctorPhone: string;
    notes: string;
  };
  attendance: {
    percentage: number;
    present: number;
    absent: number;
    late: number;
    leave: number;
    classAverage: number;
    monthly: AttendanceMonth[];
    weekly: AttendanceWeek[];
    yearly: AttendanceYear[];
    heatmap: { week: number; day: number; rate: number }[];
    history: AttendanceHistoryRow[];
  };
  results: {
    gpa: number;
    averageMarks: number;
    overallGrade: string;
    rank: number;
    outOf: number;
    subjects: SubjectResult[];
    semesterTrend: SemesterPoint[];
    examComparison: ExamComparison[];
    topSubjects: SubjectResult[];
    weakSubjects: SubjectResult[];
    remarks: string;
    recommendations: string[];
  };
  fees: {
    total: number;
    paid: number;
    pending: number;
    scholarship: number;
    discount: number;
    fine: number;
    upcoming: number;
    nextDueDate: string;
    items: FeeItem[];
  };
  documents: DocumentItem[];
  timeline: TimelineEvent[];
  insights: ProfileInsight[];
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const buildProfile = (student: StudentRecord): StudentProfile => {
  const seed = student.id.charCodeAt(4) || 7;
  const rnd = (i: number) => ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;

  const monthly: AttendanceMonth[] = monthNames.slice(0, 7).map((m, i) => {
    const present = 16 + Math.floor(rnd(i) * 6);
    const absent = Math.floor(rnd(i + 3) * 3);
    const late = Math.floor(rnd(i + 5) * 2);
    const leave = Math.floor(rnd(i + 7) * 2);
    const total = present + absent + late + leave;
    return { month: m, present, absent, late, leave, rate: Math.round((present / total) * 100) };
  });

  const weekly: AttendanceWeek[] = Array.from({ length: 8 }).map((_, i) => ({
    week: `W${i + 1}`,
    rate: 75 + Math.floor(rnd(i + 40) * 25),
  }));

  const yearly: AttendanceYear[] = ["2022", "2023", "2024", "2025", "2026"].map((y, i) => ({
    year: y,
    rate: 78 + Math.floor(rnd(i + 60) * 20),
  }));

  const heatmap = Array.from({ length: 12 * 7 }).map((_, idx) => ({
    week: Math.floor(idx / 7),
    day: idx % 7,
    rate: Math.floor(rnd(idx + 100) * 100),
  }));

  const totals = monthly.reduce(
    (acc, m) => ({
      present: acc.present + m.present,
      absent: acc.absent + m.absent,
      late: acc.late + m.late,
      leave: acc.leave + m.leave,
    }),
    { present: 0, absent: 0, late: 0, leave: 0 },
  );

  const subjects = ["Mathematics", "Physics", "Chemistry", "Literature", "History", "Computer Science"];
  const results: SubjectResult[] = subjects.map((s, i) => {
    const marks = 60 + Math.floor(rnd(i + 11) * 40);
    const grade = marks >= 90 ? "A+" : marks >= 80 ? "A" : marks >= 70 ? "B" : marks >= 60 ? "C" : "D";
    return {
      subject: s,
      marks,
      max: 100,
      grade,
      remark: marks >= 85 ? "Excellent" : marks >= 70 ? "Good progress" : "Needs improvement",
    };
  });
  const sortedResults = [...results].sort((a, b) => b.marks - a.marks);
  const avgMarks = Math.round(results.reduce((s, r) => s + r.marks, 0) / results.length);
  const overallGrade = avgMarks >= 90 ? "A+" : avgMarks >= 80 ? "A" : avgMarks >= 70 ? "B" : avgMarks >= 60 ? "C" : "D";

  const semesterTrend: SemesterPoint[] = ["S1 '24", "S2 '24", "S1 '25", "S2 '25", "S1 '26"].map((s, i) => ({
    semester: s,
    gpa: Number((3.0 + rnd(i + 70) * 0.9).toFixed(2)),
    average: 70 + Math.floor(rnd(i + 71) * 25),
  }));

  const examComparison: ExamComparison[] = ["Unit 1", "Midterm", "Unit 2", "Prelim", "Final"].map((e, i) => ({
    exam: e,
    you: 70 + Math.floor(rnd(i + 80) * 25),
    class: 65 + Math.floor(rnd(i + 82) * 15),
    top: 90 + Math.floor(rnd(i + 84) * 8),
  }));

  const feeItems: FeeItem[] = [
    { id: "F1", title: "Tuition — Q1", amount: 1200, dueDate: "2026-01-15", status: "paid", paidOn: "2026-01-10", receipt: "INV-9001", method: "Card" },
    { id: "F2", title: "Tuition — Q2", amount: 1200, dueDate: "2026-04-15", status: "paid", paidOn: "2026-04-11", receipt: "INV-9042", method: "Bank" },
    { id: "F3", title: "Transport", amount: 320, dueDate: "2026-05-05", status: student.feeStatus === "paid" ? "paid" : "pending", paidOn: student.feeStatus === "paid" ? "2026-05-04" : undefined, receipt: student.feeStatus === "paid" ? "INV-9088" : undefined, method: "UPI" },
    { id: "F4", title: "Tuition — Q3", amount: 1200, dueDate: "2026-07-15", status: student.feeStatus === "overdue" ? "overdue" : "pending" },
    { id: "F5", title: "Lab Fees", amount: 180, dueDate: "2026-08-01", status: "pending" },
  ];
  const paid = feeItems.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0);
  const pending = feeItems.filter((f) => f.status !== "paid").reduce((s, f) => s + f.amount, 0);
  const scholarship = 600;
  const discount = 150;
  const fine = student.feeStatus === "overdue" ? 45 : 0;
  const total = paid + pending;
  const nextDueItem = feeItems.find((f) => f.status !== "paid");

  const percentage = student.attendance;
  const insights: ProfileInsight[] = [
    percentage < 85
      ? { id: "i1", tone: "warning", title: "Attendance dipping", description: `Attendance dropped to ${percentage}% this month — 5% below class average.`, action: "Notify guardian" }
      : { id: "i1", tone: "positive", title: "Strong attendance", description: `Attendance is at ${percentage}% — above class average.` },
    sortedResults[0].marks >= 85
      ? { id: "i2", tone: "positive", title: `${sortedResults[0].subject} on the rise`, description: `Scored ${sortedResults[0].marks}% — best in the last 3 assessments.` }
      : { id: "i2", tone: "info", title: "Steady academic performance", description: `Average marks holding at ${avgMarks}%.` },
    sortedResults[sortedResults.length - 1].marks < 70
      ? { id: "i3", tone: "critical", title: `${sortedResults[sortedResults.length - 1].subject} needs attention`, description: `Consistent scores under 70%. Consider peer tutoring or extra practice.`, action: "Schedule mentoring" }
      : { id: "i3", tone: "info", title: "Balanced subject spread", description: "No subject is currently flagged as at-risk." },
    nextDueItem
      ? { id: "i4", tone: student.feeStatus === "overdue" ? "critical" : "warning", title: "Fee payment due", description: `${nextDueItem.title} · $${nextDueItem.amount} due on ${nextDueItem.dueDate}.`, action: "Send reminder" }
      : { id: "i4", tone: "positive", title: "All fees settled", description: "No outstanding dues at this time." },
    student.documentsPending > 0
      ? { id: "i5", tone: "warning", title: "Missing documents", description: `${student.documentsPending} document(s) awaiting verification.`, action: "Request upload" }
      : { id: "i5", tone: "positive", title: "Documents complete", description: "All required documents verified." },
  ];

  const teachers = ["Ms. Harper", "Mr. Chen", "Mrs. Osei", "Mr. Silva", "Ms. Novak"];

  return {
    bio: {
      bloodGroup: ["A+", "B+", "O+", "AB+", "O-"][Math.floor(rnd(1) * 5)],
      nationality: "American",
      religion: "—",
      motherTongue: "English",
      address: `${100 + Math.floor(rnd(2) * 900)} Cedar Lane`,
      city: "San Francisco",
      country: "United States",
      pincode: "94103",
      category: "General",
      academicYear: "2025 – 2026",
    },
    guardian: {
      father: { name: student.guardian, occupation: "Software Engineer", phone: student.phone, email: `guardian.${student.name.split(" ")[0].toLowerCase()}@edumanage.io` },
      mother: { name: `Sara ${student.name.split(" ")[1] ?? ""}`.trim(), occupation: "Physician", phone: "+1 (555) 812-3345", email: `mother.${student.name.split(" ")[0].toLowerCase()}@edumanage.io` },
      emergency: { name: "Dr. Reyes", relation: "Family Doctor", phone: "+1 (555) 909-1122" },
      address: `${100 + Math.floor(rnd(4) * 900)} Cedar Lane, San Francisco`,
      preferredChannel: "Email",
    },
    medical: {
      bloodGroup: ["A+", "B+", "O+", "AB+"][Math.floor(rnd(6) * 4)],
      allergies: ["Peanuts", "Pollen"].slice(0, Math.floor(rnd(7) * 3)),
      conditions: rnd(8) > 0.7 ? ["Mild Asthma"] : [],
      medications: rnd(9) > 0.8 ? ["Inhaler as needed"] : [],
      doctor: "Dr. Aiden Cole",
      doctorPhone: "+1 (555) 704-2210",
      notes: "No dietary restrictions. Requires annual vision check.",
    },
    attendance: {
      percentage,
      present: totals.present,
      absent: totals.absent,
      late: totals.late,
      leave: totals.leave,
      classAverage: 88,
      monthly,
      weekly,
      yearly,
      heatmap,
      history: Array.from({ length: 14 }).map((_, i) => {
        const roll = rnd(i + 20);
        const status: AttendanceHistoryRow["status"] =
          roll > 0.9 ? "absent" : roll > 0.82 ? "late" : roll > 0.78 ? "leave" : "present";
        return {
          date: `2026-07-${String(i + 1).padStart(2, "0")}`,
          status,
          remark:
            status === "absent" ? "Informed leave" :
            status === "late" ? "Arrived 12 min late" :
            status === "leave" ? "Approved medical" : undefined,
          teacher: teachers[i % teachers.length],
        };
      }),
    },
    results: {
      gpa: Number((3.2 + rnd(30) * 0.8).toFixed(2)),
      averageMarks: avgMarks,
      overallGrade,
      rank: 1 + Math.floor(rnd(31) * 20),
      outOf: 42,
      subjects: results,
      semesterTrend,
      examComparison,
      topSubjects: sortedResults.slice(0, 3),
      weakSubjects: sortedResults.slice(-2).reverse(),
      remarks: "Consistently strong performer with excellent participation in class discussions.",
      recommendations: [
        "Focus 30 min/day on the weakest subject for the next 4 weeks.",
        "Enroll in the school's peer-mentoring program for problem-solving practice.",
        "Attempt one full past paper per week under timed conditions.",
      ],
    },
    fees: {
      total,
      paid,
      pending,
      scholarship,
      discount,
      fine,
      upcoming: pending,
      nextDueDate: nextDueItem?.dueDate ?? "—",
      items: feeItems,
    },
    documents: [
      { id: "D1", name: "Birth Certificate.pdf", type: "PDF", category: "Identity", size: "412 KB", uploadedAt: "2025-06-14", status: "verified" },
      { id: "D2", name: "Previous School TC.pdf", type: "PDF", category: "Academic", size: "218 KB", uploadedAt: "2025-06-14", status: student.documentsPending > 2 ? "missing" : "verified" },
      { id: "D3", name: "Immunization Record.pdf", type: "PDF", category: "Medical", size: "156 KB", uploadedAt: "2025-06-20", status: student.documentsPending > 0 ? "pending" : "verified" },
      { id: "D4", name: "ID Proof.jpg", type: "Image", category: "Identity", size: "890 KB", uploadedAt: "2025-06-22", status: "verified" },
      { id: "D5", name: "Guardian ID.pdf", type: "PDF", category: "Guardian", size: "310 KB", uploadedAt: "2025-06-24", status: student.documentsPending > 1 ? "missing" : "verified" },
      { id: "D6", name: "Report Card 2024.pdf", type: "PDF", category: "Academic", size: "480 KB", uploadedAt: "2025-07-01", status: "verified" },
    ],
    timeline: [
      { id: "T1", type: "admission", title: "Student admitted", description: `Enrolled to Grade ${student.className}-${student.section}`, timestamp: student.admissionDate },
      { id: "T2", type: "documents", title: "Documents uploaded", description: "Birth certificate, TC and ID proof submitted", timestamp: "2025-06-24" },
      { id: "T3", type: "fees", title: "Fee payment received", description: "Tuition Q1 · $1,200 · INV-9001", timestamp: "2026-01-10" },
      { id: "T4", type: "attendance", title: "Attendance updated", description: `Marked present for the week (${student.attendance}% overall)`, timestamp: "2026-06-28" },
      { id: "T5", type: "results", title: "Q2 results published", description: `GPA snapshot updated · Rank in class refreshed`, timestamp: "2026-06-30" },
      { id: "T6", type: "profile", title: "Profile edited", description: "Contact number updated by admin", timestamp: "2026-07-02" },
    ],
    insights,
  };
};
