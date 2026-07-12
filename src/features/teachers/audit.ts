// Simple in-memory audit trail with subscriber pattern.
export type AuditCategory =
  | "profile" | "assignment" | "leave" | "payroll" | "archive" | "import" | "export" | "delete" | "restore";

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  category: AuditCategory;
  action: string;
  target?: string;
  details?: string;
}

const seed: AuditEntry[] = [
  { id: "AU-1", timestamp: new Date(Date.now() - 3600_000).toISOString(), actor: "Admin", category: "profile", action: "Updated profile", target: "EMP1004", details: "Changed phone" },
  { id: "AU-2", timestamp: new Date(Date.now() - 7200_000).toISOString(), actor: "Admin", category: "assignment", action: "Assigned classes", target: "EMP1002", details: "10-A, 10-B" },
  { id: "AU-3", timestamp: new Date(Date.now() - 86_400_000).toISOString(), actor: "HR", category: "leave", action: "Approved leave", target: "EMP1001", details: "3 days · casual" },
  { id: "AU-4", timestamp: new Date(Date.now() - 172_800_000).toISOString(), actor: "Payroll", category: "payroll", action: "Payroll run", details: "42 staff processed" },
  { id: "AU-5", timestamp: new Date(Date.now() - 259_200_000).toISOString(), actor: "Admin", category: "archive", action: "Archived staff", target: "EMP1015" },
];

let entries: AuditEntry[] = [...seed];
const listeners = new Set<(e: AuditEntry[]) => void>();

export function logAudit(entry: Omit<AuditEntry, "id" | "timestamp">) {
  const full: AuditEntry = {
    ...entry,
    id: `AU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };
  entries = [full, ...entries];
  listeners.forEach((l) => l(entries));
}

export function getAudit(): AuditEntry[] {
  return entries;
}

export function subscribeAudit(fn: (e: AuditEntry[]) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
