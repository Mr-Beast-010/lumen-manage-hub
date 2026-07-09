import * as XLSX from "xlsx";
import type { StudentRecord } from "../data";

export interface ParsedRow {
  index: number;
  raw: Record<string, string>;
  mapped: Partial<StudentRecord>;
  errors: string[];
}

export interface ParseResult {
  headers: string[];
  rows: ParsedRow[];
  valid: number;
  invalid: number;
}

export const importFields: { key: keyof StudentRecord; label: string; required?: boolean }[] = [
  { key: "name", label: "Name", required: true },
  { key: "admissionNo", label: "Admission No", required: true },
  { key: "rollNo", label: "Roll No" },
  { key: "gender", label: "Gender" },
  { key: "className", label: "Class", required: true },
  { key: "section", label: "Section" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "dob", label: "DOB" },
  { key: "admissionDate", label: "Admission Date" },
  { key: "attendance", label: "Attendance" },
  { key: "feeStatus", label: "Fee Status" },
  { key: "status", label: "Status" },
  { key: "guardian", label: "Guardian" },
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function autoMap(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  importFields.forEach((f) => {
    const target = norm(f.label);
    const found = headers.find((h) => norm(h) === target || norm(h) === norm(f.key));
    if (found) map[f.key] = found;
  });
  return map;
}

async function readFile(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
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

export async function parseImportFile(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  return readFile(file);
}

export function validateRows(
  rows: Record<string, string>[],
  mapping: Record<string, string>,
): ParseResult {
  const parsed: ParsedRow[] = rows.map((raw, i) => {
    const mapped: Partial<StudentRecord> = {};
    const errors: string[] = [];
    for (const f of importFields) {
      const src = mapping[f.key];
      const v = src ? raw[src] : "";
      if (f.required && !v) errors.push(`${f.label} is required`);
      if (v) {
        if (f.key === "attendance") {
          const n = Number(v);
          if (Number.isNaN(n) || n < 0 || n > 100) errors.push("Attendance must be 0-100");
          else (mapped as any)[f.key] = n;
        } else if (f.key === "email" && !/^\S+@\S+\.\S+$/.test(v)) {
          errors.push("Invalid email");
        } else {
          (mapped as any)[f.key] = v;
        }
      }
    }
    return { index: i + 1, raw, mapped, errors };
  });

  return {
    headers: Object.keys(rows[0] ?? {}),
    rows: parsed,
    valid: parsed.filter((r) => r.errors.length === 0).length,
    invalid: parsed.filter((r) => r.errors.length > 0).length,
  };
}
