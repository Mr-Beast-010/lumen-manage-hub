import * as XLSX from "xlsx";
import type { TeacherRecord } from "../data";

export interface ParsedTeacherRow {
  index: number;
  raw: Record<string, string>;
  mapped: Partial<TeacherRecord>;
  errors: string[];
  duplicate?: boolean;
}

export interface TeacherParseResult {
  headers: string[];
  rows: ParsedTeacherRow[];
  valid: number;
  invalid: number;
  duplicates: number;
}

export const teacherImportFields: { key: keyof TeacherRecord; label: string; required?: boolean }[] = [
  { key: "employeeId", label: "Employee ID", required: true },
  { key: "name", label: "Name", required: true },
  { key: "gender", label: "Gender" },
  { key: "type", label: "Type", required: true },
  { key: "department", label: "Department", required: true },
  { key: "designation", label: "Designation" },
  { key: "subjects", label: "Subjects" },
  { key: "classes", label: "Classes" },
  { key: "email", label: "Email", required: true },
  { key: "phone", label: "Phone" },
  { key: "dob", label: "DOB" },
  { key: "joinedOn", label: "Joined On" },
  { key: "experience", label: "Experience" },
  { key: "attendance", label: "Attendance" },
  { key: "status", label: "Status" },
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function autoMapTeacher(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  teacherImportFields.forEach((f) => {
    const target = norm(f.label);
    const found = headers.find((h) => norm(h) === target || norm(h) === norm(f.key));
    if (found) map[f.key] = found;
  });
  return map;
}

export async function parseTeacherImportFile(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "", raw: false });
  const headers = json.length ? Object.keys(json[0]) : [];
  const rows = json.map((r) => {
    const out: Record<string, string> = {};
    for (const k of headers) out[k] = String(r[k] ?? "").trim();
    return out;
  });
  return { headers, rows };
}

export function validateTeacherRows(
  rows: Record<string, string>[],
  mapping: Record<string, string>,
  existingEmployeeIds: Set<string>,
): TeacherParseResult {
  const seen = new Set<string>();
  const parsed: ParsedTeacherRow[] = rows.map((raw, i) => {
    const mapped: Partial<TeacherRecord> = {};
    const errors: string[] = [];
    for (const f of teacherImportFields) {
      const src = mapping[f.key];
      const v = src ? raw[src] : "";
      if (f.required && !v) errors.push(`${f.label} required`);
      if (!v) continue;
      if (f.key === "attendance" || f.key === "experience") {
        const n = Number(v);
        if (Number.isNaN(n)) errors.push(`${f.label} must be a number`);
        else (mapped as any)[f.key] = n;
      } else if (f.key === "email" && !/^\S+@\S+\.\S+$/.test(v)) {
        errors.push("Invalid email");
      } else if (f.key === "subjects" || f.key === "classes") {
        (mapped as any)[f.key] = v.split(/[|,;]/).map((s) => s.trim()).filter(Boolean);
      } else if (f.key === "type" && !["teaching", "non-teaching"].includes(v.toLowerCase())) {
        errors.push("Type must be teaching or non-teaching");
      } else {
        (mapped as any)[f.key] = v;
      }
    }
    let duplicate = false;
    const empId = mapped.employeeId;
    if (empId) {
      if (existingEmployeeIds.has(empId) || seen.has(empId)) {
        duplicate = true;
        errors.push("Duplicate Employee ID");
      }
      seen.add(empId);
    }
    return { index: i + 1, raw, mapped, errors, duplicate };
  });

  return {
    headers: Object.keys(rows[0] ?? {}),
    rows: parsed,
    valid: parsed.filter((r) => r.errors.length === 0).length,
    invalid: parsed.filter((r) => r.errors.length > 0).length,
    duplicates: parsed.filter((r) => r.duplicate).length,
  };
}
