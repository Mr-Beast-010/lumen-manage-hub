// Extended student dataset for the Student Management module.
export type StudentGender = "male" | "female";
export type StudentStatus = "active" | "inactive" | "suspended" | "alumni" | "pending";
export type FeeStatus = "paid" | "pending" | "overdue" | "partial";

export interface StudentRecord {
  id: string;
  admissionNo: string;
  rollNo: string;
  name: string;
  photo: string;
  gender: StudentGender;
  className: string;
  section: string;
  email: string;
  phone: string;
  dob: string;            // ISO date
  admissionDate: string;  // ISO date
  attendance: number;     // 0-100
  feeStatus: FeeStatus;
  status: StudentStatus;
  guardian: string;
  documentsPending: number;
}

const first = [
  "Aria", "Ethan", "Luna", "Kai", "Zoe", "Milo", "Nova", "Leo", "Ivy", "Rio",
  "Sage", "Iris", "Theo", "Emi", "Ori", "Ana", "Noah", "Maya", "Rey", "Jun",
  "Sana", "Yuki", "Amir", "Isla", "Ravi", "Nina", "Omar", "Elle", "Tom", "Zara",
  "Kian", "Lila", "Arjun", "Mira", "Finn", "Priya", "Dev", "Eve", "Rex", "Cora",
];
const last = [
  "Chen", "Patel", "Kim", "Silva", "Nguyen", "Okafor", "Rossi", "Haddad", "Rivera",
  "Diaz", "Park", "Suzuki", "Karim", "Fischer", "Ito", "Ali", "Novak", "Roy",
  "Kaur", "Singh", "Ahmed", "Kumar", "Costa", "Reyes",
];
const classes = ["6", "7", "8", "9", "10", "11", "12"];
const sections = ["A", "B", "C", "D"];
const femaleFirst = new Set(["Aria", "Luna", "Zoe", "Nova", "Ivy", "Sage", "Iris", "Emi", "Ana", "Maya", "Sana", "Yuki", "Isla", "Nina", "Elle", "Zara", "Lila", "Mira", "Priya", "Eve", "Cora"]);

const seededRand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

export const generateStudents = (count = 42): StudentRecord[] => {
  const rnd = seededRand(7);
  const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
  const feeStatuses: FeeStatus[] = ["paid", "paid", "paid", "pending", "overdue", "partial"];
  const statuses: StudentStatus[] = ["active", "active", "active", "active", "active", "pending", "inactive", "alumni", "suspended"];

  return Array.from({ length: count }).map((_, i) => {
    const fn = pick(first);
    const ln = pick(last);
    const name = `${fn} ${ln}`;
    const gender: StudentGender = femaleFirst.has(fn) ? "female" : "male";
    const cls = pick(classes);
    const sec = pick(sections);
    const admissionYear = 2020 + Math.floor(rnd() * 6);
    const dobYear = 2026 - (Number(cls) + 6);
    const monthDob = 1 + Math.floor(rnd() * 12);
    const dayDob = 1 + Math.floor(rnd() * 27);
    return {
      id: `STU-${2000 + i}`,
      admissionNo: `ADM-${admissionYear}-${String(1000 + i).padStart(4, "0")}`,
      rollNo: String(i + 1).padStart(3, "0"),
      name,
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name + i)}`,
      gender,
      className: cls,
      section: sec,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@edumanage.io`,
      phone: `+1 (555) ${String(100 + Math.floor(rnd() * 899))}-${String(1000 + Math.floor(rnd() * 8999))}`,
      dob: `${dobYear}-${String(monthDob).padStart(2, "0")}-${String(dayDob).padStart(2, "0")}`,
      admissionDate: `${admissionYear}-${String(1 + Math.floor(rnd() * 9)).padStart(2, "0")}-${String(1 + Math.floor(rnd() * 27)).padStart(2, "0")}`,
      attendance: 70 + Math.floor(rnd() * 30),
      feeStatus: feeStatuses[Math.floor(rnd() * feeStatuses.length)],
      status: statuses[Math.floor(rnd() * statuses.length)],
      guardian: `${pick(first)} ${ln}`,
      documentsPending: Math.floor(rnd() * 4),
    };
  });
};

export const studentRecords: StudentRecord[] = generateStudents(42);

// Analytics helpers
export const studentAnalytics = (rows: StudentRecord[]) => {
  const total = rows.length;
  const active = rows.filter((r) => r.status === "active").length;
  const boys = rows.filter((r) => r.gender === "male").length;
  const girls = rows.filter((r) => r.gender === "female").length;
  const alumni = rows.filter((r) => r.status === "alumni").length;
  const newAdmissions = rows.filter((r) => r.admissionDate.startsWith("2026") || r.admissionDate.startsWith("2025")).length;

  const admissionsTrend = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month, i) => ({
    month,
    admissions: 12 + ((i * 7 + total) % 22),
  }));

  const genderDist = [
    { name: "Boys", value: boys },
    { name: "Girls", value: girls },
  ];

  const classDist = ["6", "7", "8", "9", "10", "11", "12"].map((cls) => ({
    class: `Grade ${cls}`,
    students: rows.filter((r) => r.className === cls).length,
  }));

  return { total, active, boys, girls, alumni, newAdmissions, admissionsTrend, genderDist, classDist };
};
