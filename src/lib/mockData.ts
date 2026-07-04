export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  email: string;
  status: "active" | "inactive" | "pending";
  attendance: number;
  gpa: number;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  email: string;
  classes: number;
  rating: number;
  status: "active" | "on-leave";
}

export interface FeeRecord {
  id: string;
  student: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  invoice: string;
}

export interface GradeRecord {
  id: string;
  student: string;
  subject: string;
  score: number;
  grade: string;
  term: string;
}

const firstNames = ["Aria", "Ethan", "Luna", "Kai", "Zoe", "Milo", "Nova", "Leo", "Ivy", "Rio", "Sage", "Iris", "Theo", "Emi", "Ori", "Ana"];
const lastNames = ["Chen", "Patel", "Kim", "Silva", "Nguyen", "Okafor", "Rossi", "Haddad", "Rivera", "Diaz", "Park", "Suzuki", "Karim", "Fischer"];
const subjects = ["Mathematics", "Physics", "Literature", "Biology", "Computer Science", "History", "Chemistry", "Art"];

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(arr: T[]) => arr[rand(arr.length)];

export const students: Student[] = Array.from({ length: 24 }).map((_, i) => {
  const name = `${pick(firstNames)} ${pick(lastNames)}`;
  return {
    id: `STU-${1000 + i}`,
    name,
    grade: `${8 + (i % 5)}`,
    section: ["A", "B", "C"][i % 3],
    email: `${name.toLowerCase().replace(" ", ".")}@edumanage.io`,
    status: (["active", "active", "active", "pending", "inactive"] as const)[i % 5],
    attendance: 82 + rand(18),
    gpa: Number((3 + Math.random()).toFixed(2)),
  };
});

export const teachers: Teacher[] = Array.from({ length: 12 }).map((_, i) => {
  const name = `${pick(firstNames)} ${pick(lastNames)}`;
  return {
    id: `TCH-${200 + i}`,
    name,
    subject: subjects[i % subjects.length],
    email: `${name.toLowerCase().replace(" ", ".")}@edumanage.io`,
    classes: 3 + rand(4),
    rating: Number((4 + Math.random()).toFixed(1)),
    status: i % 6 === 0 ? "on-leave" : "active",
  };
});

export const fees: FeeRecord[] = Array.from({ length: 16 }).map((_, i) => ({
  id: `FEE-${i + 1}`,
  student: students[i % students.length].name,
  amount: 500 + rand(20) * 100,
  dueDate: `2026-0${1 + (i % 9)}-${10 + (i % 18)}`,
  status: (["paid", "pending", "overdue", "paid"] as const)[i % 4],
  invoice: `INV-2094${i}`,
}));

export const grades: GradeRecord[] = Array.from({ length: 20 }).map((_, i) => {
  const score = 55 + rand(45);
  const letter = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
  return {
    id: `GR-${i}`,
    student: students[i % students.length].name,
    subject: pick(subjects),
    score,
    grade: letter,
    term: `Q${1 + (i % 4)} 2026`,
  };
});

export const analytics = {
  enrollment: [
    { month: "Jan", students: 820, teachers: 42 },
    { month: "Feb", students: 890, teachers: 44 },
    { month: "Mar", students: 940, teachers: 46 },
    { month: "Apr", students: 1010, teachers: 48 },
    { month: "May", students: 1090, teachers: 51 },
    { month: "Jun", students: 1180, teachers: 54 },
    { month: "Jul", students: 1240, teachers: 56 },
  ],
  attendance: [
    { day: "Mon", rate: 94 },
    { day: "Tue", rate: 96 },
    { day: "Wed", rate: 92 },
    { day: "Thu", rate: 95 },
    { day: "Fri", rate: 89 },
  ],
  grades: [
    { name: "A", value: 32 },
    { name: "B", value: 41 },
    { name: "C", value: 18 },
    { name: "D", value: 6 },
    { name: "F", value: 3 },
  ],
  feeCollection: [
    { month: "Jan", collected: 128, pending: 22 },
    { month: "Feb", collected: 142, pending: 18 },
    { month: "Mar", collected: 156, pending: 24 },
    { month: "Apr", collected: 168, pending: 20 },
    { month: "May", collected: 174, pending: 16 },
    { month: "Jun", collected: 182, pending: 14 },
    { month: "Jul", collected: 195, pending: 12 },
  ],
};

export const activities = [
  { id: "a1", type: "enrollment", title: "New enrollment", desc: "Aria Chen joined Grade 10-B", time: "2m ago" },
  { id: "a2", type: "payment", title: "Fee payment received", desc: "Invoice #2094 · $1,200", time: "24m ago" },
  { id: "a3", type: "grade", title: "Grades published", desc: "Physics Q2 · 8-A", time: "1h ago" },
  { id: "a4", type: "attendance", title: "Attendance marked", desc: "Ms. Rossi · Grade 9-C", time: "3h ago" },
  { id: "a5", type: "report", title: "Report generated", desc: "Q2 analytics ready to review", time: "5h ago" },
];

export const events = [
  { id: "e1", title: "Parent-Teacher Conference", date: "Jul 08", time: "10:00 AM", tag: "Meeting" },
  { id: "e2", title: "Science Fair", date: "Jul 12", time: "9:00 AM", tag: "Event" },
  { id: "e3", title: "Mid-term Examinations", date: "Jul 18", time: "All day", tag: "Exam" },
  { id: "e4", title: "Sports Day", date: "Jul 22", time: "2:00 PM", tag: "Event" },
];

export const announcements = [
  { id: "n1", title: "Summer schedule update", body: "New class timings effective from July 10. Check the calendar.", time: "Today" },
  { id: "n2", title: "Library renovation", body: "The central library will be closed Jul 14-16 for upgrades.", time: "Yesterday" },
  { id: "n3", title: "Staff training", body: "Mandatory pedagogy workshop for all teachers on Friday.", time: "2d ago" },
];
