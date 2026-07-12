import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Search, Activity, User, Briefcase, PlaneTakeoff, Wallet, Archive, Upload, Download, Trash2, RotateCcw } from "lucide-react";
import { getAudit, subscribeAudit, type AuditEntry, type AuditCategory } from "./audit";

const catIcons: Record<AuditCategory, any> = {
  profile: User, assignment: Briefcase, leave: PlaneTakeoff, payroll: Wallet,
  archive: Archive, import: Upload, export: Download, delete: Trash2, restore: RotateCcw,
};
const catLabels: Record<AuditCategory, string> = {
  profile: "Profile", assignment: "Assignment", leave: "Leave", payroll: "Payroll",
  archive: "Archive", import: "Import", export: "Export", delete: "Delete", restore: "Restore",
};

export function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>(getAudit());
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  useEffect(() => subscribeAudit(setEntries), []);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (cat !== "all" && e.category !== cat) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return e.action.toLowerCase().includes(s)
        || (e.target ?? "").toLowerCase().includes(s)
        || (e.details ?? "").toLowerCase().includes(s)
        || e.actor.toLowerCase().includes(s);
    });
  }, [entries, q, cat]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Audit log</h3>
          <p className="text-sm text-muted-foreground">Track edits, approvals, and administrative actions.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search log…" aria-label="Search audit log" className="pl-9 w-64" />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {Object.entries(catLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Activity} title="No activity" description="Actions will appear here as they happen." />
      ) : (
        <Card className="rounded-2xl">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {filtered.map((e, i) => {
                const Icon = catIcons[e.category];
                return (
                  <motion.li
                    key={e.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="flex items-start gap-3 p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{e.action}</p>
                        <Badge variant="outline" className="text-[10px]">{catLabels[e.category]}</Badge>
                        {e.target && <span className="text-xs text-muted-foreground">· {e.target}</span>}
                      </div>
                      {e.details && <p className="mt-0.5 text-xs text-muted-foreground">{e.details}</p>}
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {e.actor} · {new Date(e.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
