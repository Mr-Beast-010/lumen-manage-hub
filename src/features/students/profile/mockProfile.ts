import type { StudentRecord } from "../data";

export interface AttendanceMonth {
  month: string;
  present: number;
  absent: number;
  late: number;
  rate: number;
}

export interface SubjectResult {
  subject: string;
  marks: number;
  max: number;
  grade: string;
  remark: string;
}

export interface FeeItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  paidOn?: string;
  receipt?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
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
    monthly: AttendanceMonth[];
    history: { date: string; status: "present" | "absent" | "late"; remark?: string }[];
  };
  results: {
    gpa: number;
    rank: number;
    outOf: number;
    subjects: SubjectResult[];
    remarks: string;
  };
  fees: {
    paid: number;
    pending: number;
    upcoming: number;
    items: FeeItem[];
  };
  documents: DocumentItem[];
  timeline: TimelineEvent[];
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const buildProfile = (student: StudentRecord): StudentProfile => {
  const seed = student.id.charCodeAt(4) || 7;
  const rnd = (i: number) => ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;

  const monthly: AttendanceMonth[] = monthNames.slice(0, 7).map((m, i) => {
    const present = 16 + Math.floor(rnd(i) * 6);
    const absent = Math.floor(rnd(i + 3) * 3);
    const late = Math.floor(rnd(i + 5) * 2);
    const total = present + absent + late;
    return { month: m, present, absent, late, rate: Math.round((present / total) * 100) };
  });

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

  const feeItems: FeeItem[] = [
    { id: "F1", title: "Tuition — Q1", amount: 1200, dueDate: "2026-01-15", status: "paid", paidOn: "2026-01-10", receipt: "INV-9001" },
    { id: "F2", title: "Tuition — Q2", amount: 1200, dueDate: "2026-04-15", status: "paid", paidOn: "2026-04-11", receipt: "INV-9042" },
    { id: "F3", title: "Transport", amount: 320, dueDate: "2026-05-05", status: student.feeStatus === "paid" ? "paid" : "pending", paidOn: student.feeStatus === "paid" ? "2026-05-04" : undefined, receipt: student.feeStatus === "paid" ? "INV-9088" : undefined },
    { id: "F4", title: "Tuition — Q3", amount: 1200, dueDate: "2026-07-15", status: student.feeStatus === "overdue" ? "overdue" : "pending" },
    { id: "F5", title: "Lab Fees", amount: 180, dueDate: "2026-08-01", status: "pending" },
  ];

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
      percentage: student.attendance,
      monthly,
      history: Array.from({ length: 12 }).map((_, i) => {
        const status = rnd(i + 20) > 0.85 ? "absent" : rnd(i + 22) > 0.9 ? "late" : "present";
        return {
          date: `2026-07-${String(i + 1).padStart(2, "0")}`,
          status,
          remark: status === "absent" ? "Informed leave" : status === "late" ? "Arrived 12 min late" : undefined,
        };
      }),
    },
    results: {
      gpa: Number((3.2 + rnd(30) * 0.8).toFixed(2)),
      rank: 1 + Math.floor(rnd(31) * 20),
      outOf: 42,
      subjects: results,
      remarks: "Consistently strong performer with excellent participation in class discussions.",
    },
    fees: {
      paid: feeItems.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0),
      pending: feeItems.filter((f) => f.status === "pending").reduce((s, f) => s + f.amount, 0),
      upcoming: feeItems.filter((f) => f.status === "pending" || f.status === "overdue").reduce((s, f) => s + f.amount, 0),
      items: feeItems,
    },
    documents: [
      { id: "D1", name: "Birth Certificate.pdf", type: "PDF", size: "412 KB", uploadedAt: "2025-06-14", status: "verified" },
      { id: "D2", name: "Previous School TC.pdf", type: "PDF", size: "218 KB", uploadedAt: "2025-06-14", status: "verified" },
      { id: "D3", name: "Immunization Record.pdf", type: "PDF", size: "156 KB", uploadedAt: "2025-06-20", status: student.documentsPending > 0 ? "pending" : "verified" },
      { id: "D4", name: "Aadhaar / ID Proof.jpg", type: "Image", size: "890 KB", uploadedAt: "2025-06-22", status: "verified" },
      { id: "D5", name: "Guardian ID.pdf", type: "PDF", size: "310 KB", uploadedAt: "2025-06-24", status: student.documentsPending > 1 ? "missing" : "verified" },
    ],
    timeline: [
      { id: "T1", type: "admission", title: "Student admitted", description: `Enrolled to Grade ${student.className}-${student.section}`, timestamp: student.admissionDate },
      { id: "T2", type: "documents", title: "Documents uploaded", description: "Birth certificate, TC and ID proof submitted", timestamp: "2025-06-24" },
      { id: "T3", type: "fees", title: "Fee payment received", description: "Tuition Q1 · $1,200 · INV-9001", timestamp: "2026-01-10" },
      { id: "T4", type: "attendance", title: "Attendance updated", description: `Marked present for the week (${student.attendance}% overall)`, timestamp: "2026-06-28" },
      { id: "T5", type: "results", title: "Q2 results published", description: `GPA snapshot updated · Rank in class refreshed`, timestamp: "2026-06-30" },
      { id: "T6", type: "profile", title: "Profile edited", description: "Contact number updated by admin", timestamp: "2026-07-02" },
    ],
  };
};
