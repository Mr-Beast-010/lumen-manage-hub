import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from "lucide-react";
import { students } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Status = "present" | "absent" | "late";

const options: { key: Status; label: string; icon: any; cls: string }[] = [
  { key: "present", label: "Present", icon: Check, cls: "bg-success/10 text-success ring-success/30" },
  { key: "absent", label: "Absent", icon: X, cls: "bg-destructive/10 text-destructive ring-destructive/30" },
  { key: "late", label: "Late", icon: Clock, cls: "bg-warning/10 text-warning ring-warning/30" },
];

export default function Attendance() {
  const roster = students.slice(0, 12);
  const [marks, setMarks] = useState<Record<string, Status>>(() =>
    Object.fromEntries(roster.map((s) => [s.id, "present" as Status])),
  );
  const [cls, setCls] = useState("10-A");

  const summary = {
    present: Object.values(marks).filter((s) => s === "present").length,
    absent: Object.values(marks).filter((s) => s === "absent").length,
    late: Object.values(marks).filter((s) => s === "late").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Mark daily attendance and monitor patterns across classes."
        actions={
          <>
            <Select value={cls} onValueChange={setCls}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["9-A", "9-B", "10-A", "10-B", "11-A"].map((c) => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="hero" onClick={() => toast.success("Attendance saved")}>Save</Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((o) => (
          <div key={o.key} className={cn("rounded-2xl border border-border bg-card p-5")}>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{o.label}</p>
              <o.icon className={cn("h-4 w-4", o.key === "present" ? "text-success" : o.key === "absent" ? "text-destructive" : "text-warning")} />
            </div>
            <p className="mt-1 font-display text-2xl font-bold">{summary[o.key]}</p>
          </div>
        ))}
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="border-b border-border p-4 text-sm text-muted-foreground">Class {cls} · {new Date().toLocaleDateString()}</div>
        <ul className="divide-y divide-border">
          {roster.map((s, i) => (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.02 }}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                  {s.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.id}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {options.map((o) => {
                  const active = marks[s.id] === o.key;
                  return (
                    <button
                      key={o.key}
                      onClick={() => setMarks((m) => ({ ...m, [s.id]: o.key }))}
                      aria-label={`Mark ${s.name} as ${o.label}`}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-smooth",
                        active ? o.cls : "bg-transparent text-muted-foreground ring-border hover:bg-secondary/60",
                      )}
                    >
                      <o.icon className="h-3.5 w-3.5" />
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
