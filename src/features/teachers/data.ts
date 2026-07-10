// Teacher & Staff dataset for the Teacher Management module.
export type StaffType = "teaching" | "non-teaching";
export type StaffStatus = "active" | "inactive" | "on-leave" | "suspended" | "archived";
export type Gender = "male" | "female";

export interface TeacherRecord {
  id: string;
  employeeId: string;
  name: string;
  photo: string;
  gender: Gender;
  type: StaffType;
  department: string;
  designation: string;
  subjects: string[];
  classes: string[];
  email: string;
  phone: string;
  dob: string;          // ISO
  joinedOn: string;     // ISO
  experience: number;   // years
  status: StaffStatus;
  attendance: number;   // 0-100
  rating: number;       // 0-5
}

const first = [
  "Aarav", "Diya", "Rohan", "Priya", "Kabir", "Ananya", "Vihaan", "Meera",
  "Arjun", "Sara", "Ishaan", "Nisha", "Karan", "Riya", "Aditya", "Kavya",
  "Rahul", "Pooja", "Vikram", "Neha", "Suresh", "Anjali", "Manav", "Tara",
  "Dev", "Ira", "Yash", "Zoya", "Nikhil", "Simran",
];
const last = [
  "Sharma", "Patel", "Iyer", "Menon", "Khan", "Verma", "Reddy", "Nair",
  "Gupta", "Singh", "Rao", "Joshi", "Kapoor", "Das", "Mehta", "Bose",
];
const femaleFirst = new Set(["Diya","Priya","Ananya","Meera","Sara","Nisha","Riya","Kavya","Pooja","Neha","Anjali","Tara","Ira","Zoya","Simran"]);

const teachingDepts = ["Mathematics", "Science", "English", "Social Studies", "Computer Science", "Languages", "Arts", "Physical Education"];
const nonTeachingDepts = ["Administration", "Library", "Accounts", "Facilities", "Transport", "Nursing"];
const teachingDesignations = ["Principal", "Vice Principal", "HOD", "Senior Teacher", "Teacher", "Assistant Teacher"];
const nonTeachingDesignations = ["Administrator", "Librarian", "Accountant", "Coordinator", "Support Staff", "Nurse"];
const subjectsByDept: Record<string, string[]> = {
  Mathematics: ["Algebra", "Geometry", "Calculus"],
  Science: ["Physics", "Chemistry", "Biology"],
  English: ["Literature", "Grammar"],
  "Social Studies": ["History", "Civics", "Geography"],
  "Computer Science": ["Programming", "Web Dev", "AI"],
  Languages: ["Hindi", "French", "Spanish"],
  Arts: ["Music", "Painting"],
  "Physical Education": ["Sports", "Yoga"],
};
const classesPool = ["6-A", "7-B", "8-A", "9-C", "10-A", "10-B", "11-A", "12-B"];

const seededRand = (seed: number) => {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
};

export const generateTeachers = (count = 36): TeacherRecord[] => {
  const rnd = seededRand(11);
  const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
  const statuses: StaffStatus[] = ["active","active","active","active","active","on-leave","inactive","suspended"];

  return Array.from({ length: count }).map((_, i) => {
    const fn = pick(first);
    const ln = pick(last);
    const name = `${fn} ${ln}`;
    const gender: Gender = femaleFirst.has(fn) ? "female" : "male";
    const type: StaffType = rnd() > 0.28 ? "teaching" : "non-teaching";
    const dept = type === "teaching" ? pick(teachingDepts) : pick(nonTeachingDepts);
    const designation = type === "teaching" ? pick(teachingDesignations) : pick(nonTeachingDesignations);
    const subjectList = type === "teaching"
      ? (subjectsByDept[dept] ?? ["General"]).slice(0, 1 + Math.floor(rnd() * 2))
      : [];
    const classList = type === "teaching"
      ? Array.from(new Set(Array.from({ length: 1 + Math.floor(rnd() * 3) }).map(() => pick(classesPool))))
      : [];
    const experience = 1 + Math.floor(rnd() * 24);
    const joinYear = 2026 - experience;
    const dobYear = joinYear - (22 + Math.floor(rnd() * 12));
    const monthDob = 1 + Math.floor(rnd() * 12);
    const dayDob = 1 + Math.floor(rnd() * 27);

    return {
      id: `EMP-${1000 + i}`,
      employeeId: `EMP${String(1000 + i)}`,
      name,
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name + i)}`,
      gender,
      type,
      department: dept,
      designation,
      subjects: subjectList,
      classes: classList,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@edumanage.io`,
      phone: `+1 (555) ${String(100 + Math.floor(rnd() * 899))}-${String(1000 + Math.floor(rnd() * 8999))}`,
      dob: `${dobYear}-${String(monthDob).padStart(2, "0")}-${String(dayDob).padStart(2, "0")}`,
      joinedOn: `${joinYear}-${String(1 + Math.floor(rnd() * 12)).padStart(2, "0")}-${String(1 + Math.floor(rnd() * 27)).padStart(2, "0")}`,
      experience,
      status: statuses[Math.floor(rnd() * statuses.length)],
      attendance: 75 + Math.floor(rnd() * 25),
      rating: Math.round((3 + rnd() * 2) * 10) / 10,
    };
  });
};

export const teacherRecords: TeacherRecord[] = generateTeachers(36);

export interface LeaveRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  from: string;
  to: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export const leaveRequests: LeaveRequest[] = teacherRecords.slice(0, 5).map((t, i) => ({
  id: `LR-${100 + i}`,
  teacherId: t.id,
  teacherName: t.name,
  from: `2026-07-${String(12 + i).padStart(2, "0")}`,
  to: `2026-07-${String(14 + i).padStart(2, "0")}`,
  reason: ["Medical", "Personal", "Family event", "Conference", "Vacation"][i],
  status: "pending",
}));

const todaySchedule = [
  { time: "08:30", period: "Period 1", classLabel: "Grade 10-A", subject: "Mathematics" },
  { time: "09:20", period: "Period 2", classLabel: "Grade 9-B", subject: "Physics" },
  { time: "10:30", period: "Period 3", classLabel: "Grade 11-A", subject: "Chemistry" },
  { time: "11:20", period: "Period 4", classLabel: "Grade 8-C", subject: "English" },
  { time: "13:00", period: "Period 5", classLabel: "Grade 12-B", subject: "Computer Science" },
  { time: "13:50", period: "Period 6", classLabel: "Grade 7-A", subject: "History" },
];
export const todayScheduleData = todaySchedule;

export const teacherAnalytics = (rows: TeacherRecord[]) => {
  const total = rows.length;
  const teaching = rows.filter((r) => r.type === "teaching").length;
  const nonTeaching = rows.filter((r) => r.type === "non-teaching").length;
  const active = rows.filter((r) => r.status === "active").length;
  const onLeave = rows.filter((r) => r.status === "on-leave").length;
  const currentYear = new Date().getFullYear();
  const newHires = rows.filter((r) => Number(r.joinedOn.slice(0, 4)) >= currentYear - 1).length;

  const deptMap = new Map<string, number>();
  rows.forEach((r) => deptMap.set(r.department, (deptMap.get(r.department) ?? 0) + 1));
  const departmentDist = Array.from(deptMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const attendanceTrend = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => ({
    day,
    attendance: 88 + ((i * 5 + total) % 10),
  }));

  const buckets = [
    { label: "0-2 yrs", min: 0, max: 2 },
    { label: "3-5 yrs", min: 3, max: 5 },
    { label: "6-10 yrs", min: 6, max: 10 },
    { label: "11-15 yrs", min: 11, max: 15 },
    { label: "16+ yrs", min: 16, max: 99 },
  ];
  const experienceDist = buckets.map((b) => ({
    range: b.label,
    count: rows.filter((r) => r.experience >= b.min && r.experience <= b.max).length,
  }));

  return { total, teaching, nonTeaching, active, onLeave, newHires, departmentDist, attendanceTrend, experienceDist };
};
