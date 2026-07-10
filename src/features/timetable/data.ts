// Timetable, class & subject assignments dataset.
import { teacherRecords, type TeacherRecord } from "@/features/teachers/data";

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export type Day = (typeof DAYS)[number];

export const PERIODS = [
  { id: "P1", label: "Period 1", start: "08:30", end: "09:15" },
  { id: "P2", label: "Period 2", start: "09:20", end: "10:05" },
  { id: "P3", label: "Period 3", start: "10:20", end: "11:05" },
  { id: "P4", label: "Period 4", start: "11:10", end: "11:55" },
  { id: "P5", label: "Period 5", start: "13:00", end: "13:45" },
  { id: "P6", label: "Period 6", start: "13:50", end: "14:35" },
  { id: "P7", label: "Period 7", start: "14:40", end: "15:25" },
] as const;
export type PeriodId = (typeof PERIODS)[number]["id"];

export interface SubjectDef {
  code: string;
  name: string;
  department: string;
  weeklyPeriods: number;
}
export const SUBJECTS: SubjectDef[] = [
  { code: "MTH-01", name: "Algebra", department: "Mathematics", weeklyPeriods: 5 },
  { code: "MTH-02", name: "Geometry", department: "Mathematics", weeklyPeriods: 4 },
  { code: "MTH-03", name: "Calculus", department: "Mathematics", weeklyPeriods: 5 },
  { code: "SCI-01", name: "Physics", department: "Science", weeklyPeriods: 4 },
  { code: "SCI-02", name: "Chemistry", department: "Science", weeklyPeriods: 4 },
  { code: "SCI-03", name: "Biology", department: "Science", weeklyPeriods: 3 },
  { code: "ENG-01", name: "Literature", department: "English", weeklyPeriods: 4 },
  { code: "ENG-02", name: "Grammar", department: "English", weeklyPeriods: 3 },
  { code: "SST-01", name: "History", department: "Social Studies", weeklyPeriods: 3 },
  { code: "SST-02", name: "Civics", department: "Social Studies", weeklyPeriods: 2 },
  { code: "SST-03", name: "Geography", department: "Social Studies", weeklyPeriods: 3 },
  { code: "CS-01", name: "Programming", department: "Computer Science", weeklyPeriods: 4 },
  { code: "CS-02", name: "Web Dev", department: "Computer Science", weeklyPeriods: 3 },
  { code: "LNG-01", name: "Hindi", department: "Languages", weeklyPeriods: 3 },
  { code: "LNG-02", name: "French", department: "Languages", weeklyPeriods: 2 },
  { code: "PE-01", name: "Sports", department: "Physical Education", weeklyPeriods: 2 },
];

export interface Classroom {
  id: string;
  name: string;
  type: "classroom" | "lab" | "auditorium";
  building: string;
  floor: number;
  capacity: number;
}
export const CLASSROOMS: Classroom[] = [
  { id: "R-101", name: "Room 101", type: "classroom", building: "A", floor: 1, capacity: 40 },
  { id: "R-102", name: "Room 102", type: "classroom", building: "A", floor: 1, capacity: 40 },
  { id: "R-201", name: "Room 201", type: "classroom", building: "A", floor: 2, capacity: 40 },
  { id: "R-202", name: "Room 202", type: "classroom", building: "A", floor: 2, capacity: 40 },
  { id: "R-301", name: "Room 301", type: "classroom", building: "B", floor: 1, capacity: 45 },
  { id: "L-01", name: "Physics Lab", type: "lab", building: "B", floor: 2, capacity: 30 },
  { id: "L-02", name: "Chemistry Lab", type: "lab", building: "B", floor: 2, capacity: 30 },
  { id: "L-03", name: "Computer Lab", type: "lab", building: "C", floor: 1, capacity: 32 },
  { id: "AUD", name: "Auditorium", type: "auditorium", building: "C", floor: 0, capacity: 200 },
];

export const CLASSES = [
  { id: "6-A", grade: 6, section: "A", students: 34 },
  { id: "7-B", grade: 7, section: "B", students: 32 },
  { id: "8-A", grade: 8, section: "A", students: 36 },
  { id: "9-C", grade: 9, section: "C", students: 30 },
  { id: "10-A", grade: 10, section: "A", students: 38 },
  { id: "10-B", grade: 10, section: "B", students: 35 },
  { id: "11-A", grade: 11, section: "A", students: 28 },
  { id: "12-B", grade: 12, section: "B", students: 26 },
] as const;
export type ClassId = (typeof CLASSES)[number]["id"];

export interface ClassAssignment {
  id: string;
  teacherId: string;
  classId: string;
  academicYear: string;
  isClassTeacher: boolean;
}

export interface SubjectAssignment {
  id: string;
  teacherId: string;
  subjectCode: string;
  classId: string;
}

export interface TimetableSlot {
  id: string;
  day: Day;
  periodId: PeriodId;
  teacherId: string;
  subjectCode: string;
  classId: string;
  roomId: string;
}

const teachingStaff: TeacherRecord[] = teacherRecords.filter((t) => t.type === "teaching");

const rand = (seed: number) => {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
};

const seedClassAssignments = (): ClassAssignment[] => {
  const r = rand(7);
  const out: ClassAssignment[] = [];
  CLASSES.forEach((c, i) => {
    const ct = teachingStaff[i % teachingStaff.length];
    out.push({
      id: `CA-${c.id}-${ct.id}`,
      teacherId: ct.id,
      classId: c.id,
      academicYear: "2026-27",
      isClassTeacher: true,
    });
    // 1-2 subject teachers per class
    const extras = 1 + Math.floor(r() * 2);
    for (let k = 0; k < extras; k++) {
      const t = teachingStaff[Math.floor(r() * teachingStaff.length)];
      if (t.id === ct.id) continue;
      out.push({
        id: `CA-${c.id}-${t.id}-${k}`,
        teacherId: t.id,
        classId: c.id,
        academicYear: "2026-27",
        isClassTeacher: false,
      });
    }
  });
  return out;
};

const seedSubjectAssignments = (): SubjectAssignment[] => {
  const r = rand(31);
  const out: SubjectAssignment[] = [];
  teachingStaff.forEach((t) => {
    const deptSubjects = SUBJECTS.filter((s) => s.department === t.department);
    const pool = deptSubjects.length ? deptSubjects : SUBJECTS.slice(0, 3);
    const nSubs = 1 + Math.floor(r() * Math.min(2, pool.length));
    const usedSubs = new Set<string>();
    for (let i = 0; i < nSubs; i++) {
      const s = pool[Math.floor(r() * pool.length)];
      if (usedSubs.has(s.code)) continue;
      usedSubs.add(s.code);
      const nClasses = 1 + Math.floor(r() * 2);
      const usedClasses = new Set<string>();
      for (let j = 0; j < nClasses; j++) {
        const c = CLASSES[Math.floor(r() * CLASSES.length)];
        if (usedClasses.has(c.id)) continue;
        usedClasses.add(c.id);
        out.push({
          id: `SA-${t.id}-${s.code}-${c.id}`,
          teacherId: t.id,
          subjectCode: s.code,
          classId: c.id,
        });
      }
    }
  });
  return out;
};

const seedTimetable = (
  cAssign: ClassAssignment[],
  sAssign: SubjectAssignment[],
): TimetableSlot[] => {
  const r = rand(97);
  const out: TimetableSlot[] = [];
  // For each class × day × period, pick a subject assignment for the class
  CLASSES.forEach((c) => {
    const perClass = sAssign.filter((s) => s.classId === c.id);
    if (!perClass.length) return;
    DAYS.forEach((d) => {
      PERIODS.forEach((p, pi) => {
        // leave some free periods
        if (r() < 0.15) return;
        const sa = perClass[Math.floor(r() * perClass.length)];
        const room = CLASSROOMS[(pi + c.grade) % CLASSROOMS.length];
        out.push({
          id: `TT-${c.id}-${d}-${p.id}`,
          day: d,
          periodId: p.id,
          teacherId: sa.teacherId,
          subjectCode: sa.subjectCode,
          classId: c.id,
          roomId: room.id,
        });
      });
    });
  });
  return out;
};

export const CLASS_ASSIGNMENTS: ClassAssignment[] = seedClassAssignments();
export const SUBJECT_ASSIGNMENTS: SubjectAssignment[] = seedSubjectAssignments();
export const TIMETABLE: TimetableSlot[] = seedTimetable(CLASS_ASSIGNMENTS, SUBJECT_ASSIGNMENTS);

export const totalWeeklyPeriods = DAYS.length * PERIODS.length;

export interface TimetableConflict {
  type: "teacher" | "room" | "duplicate";
  day: Day;
  periodId: PeriodId;
  slotIds: string[];
  message: string;
}

export const detectConflicts = (slots: TimetableSlot[]): TimetableConflict[] => {
  const conflicts: TimetableConflict[] = [];
  const byTeacher = new Map<string, TimetableSlot[]>();
  const byRoom = new Map<string, TimetableSlot[]>();
  const byClass = new Map<string, TimetableSlot[]>();
  slots.forEach((s) => {
    const tk = `${s.day}|${s.periodId}|${s.teacherId}`;
    const rk = `${s.day}|${s.periodId}|${s.roomId}`;
    const ck = `${s.day}|${s.periodId}|${s.classId}`;
    if (!byTeacher.has(tk)) byTeacher.set(tk, []);
    byTeacher.get(tk)!.push(s);
    if (!byRoom.has(rk)) byRoom.set(rk, []);
    byRoom.get(rk)!.push(s);
    if (!byClass.has(ck)) byClass.set(ck, []);
    byClass.get(ck)!.push(s);
  });
  byTeacher.forEach((v) => {
    if (v.length > 1) conflicts.push({
      type: "teacher",
      day: v[0].day,
      periodId: v[0].periodId,
      slotIds: v.map((s) => s.id),
      message: `Teacher double-booked at ${v[0].day} ${v[0].periodId}`,
    });
  });
  byRoom.forEach((v) => {
    if (v.length > 1) conflicts.push({
      type: "room",
      day: v[0].day,
      periodId: v[0].periodId,
      slotIds: v.map((s) => s.id),
      message: `Room ${v[0].roomId} conflict at ${v[0].day} ${v[0].periodId}`,
    });
  });
  byClass.forEach((v) => {
    if (v.length > 1) conflicts.push({
      type: "duplicate",
      day: v[0].day,
      periodId: v[0].periodId,
      slotIds: v.map((s) => s.id),
      message: `Class ${v[0].classId} has duplicate periods at ${v[0].day} ${v[0].periodId}`,
    });
  });
  return conflicts;
};

export const workloadForTeacher = (teacherId: string, slots: TimetableSlot[]) => {
  const mine = slots.filter((s) => s.teacherId === teacherId);
  const classes = new Set(mine.map((s) => s.classId));
  const subjects = new Set(mine.map((s) => s.subjectCode));
  const weekly = mine.length;
  const free = totalWeeklyPeriods - weekly;
  const pct = Math.round((weekly / totalWeeklyPeriods) * 100);
  const daily = DAYS.map((d) => ({
    day: d,
    periods: mine.filter((s) => s.day === d).length,
  }));
  const bySubject = Array.from(subjects).map((code) => ({
    name: SUBJECTS.find((s) => s.code === code)?.name ?? code,
    value: mine.filter((s) => s.subjectCode === code).length,
  }));
  return { classes: classes.size, subjects: subjects.size, weekly, free, pct, daily, bySubject };
};

export const getTeacher = (id: string) =>
  teacherRecords.find((t) => t.id === id);

export const getSubject = (code: string) =>
  SUBJECTS.find((s) => s.code === code);

export const getClassroom = (id: string) =>
  CLASSROOMS.find((r) => r.id === id);
