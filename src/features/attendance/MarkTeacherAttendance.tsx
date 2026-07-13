import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Save, Send, Check, X, Clock, CalendarOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { teacherRecords } from "@/features/teachers/data";
import { departmentList, statusMeta, teacherTodayAttendance, type AttStatus } from "./data";

const options: { key: AttStatus; icon: React.ElementType }[] = [
  { key: "present", icon: Check },
  { key: "absent", icon: X },
  { key: "late", icon: Clock },
  { key: "leave", icon: CalendarOff },
];

export function MarkTeacherAttendance() {
  const [dept, setDept] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [marks, setMarks] = useState<Record<string, AttStatus>>({ ...teacherTodayAttendance });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () =>
      teacherRecords.filter(
        (t) =>
          (dept === "all" || t.department === dept) &&
          (t.name.toLowerCase().includes(query.toLowerCase()) || t.employeeId.includes(query)),
      ),
    [dept, query],
  );

  const summary = {
    present: filtered.filter((t) => marks[t.id] === "present").length,
    absent: filtered.filter((t) => marks[t.id] === "absent").length,
    late: filtered.filter((t) => marks[t.id] === "late").length,
    leave: filtered.filter((t) => marks[t.id] === "leave").length,
  };

  const bulkUpdate = (status: AttStatus) => {
    if (!selected.size) return toast.info("Select teachers first");
    setMarks((prev) => {
      const next = { ...prev };
      selected.forEach((id) => (next[id] = status));
      return next;
    });
    toast.success(`${selected.size} updated to ${statusMeta[status].label.toLowerCase()}`);
    setSelected(new Set());
  };

  const toggleSel = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger className="w-52" aria-label="Filter by department"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departmentList.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search teachers" className="pl-8" aria-label="Search teachers" />
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            setMarks((prev) => { const n = { ...prev }; filtered.forEach((t) => (n[t.id] = "present")); return n; });
            toast.success("All marked present");
          }}>
            <Users className="h-4 w-4" /> All present
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("Draft saved")}><Save className="h-4 w-4" /> Save draft</Button>
          <Button variant="hero" size="sm" onClick={() => toast.success("Teacher attendance submitted")}><Send className="h-4 w-4" /> Submit</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map((o) => (
          <div key={o.key} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{statusMeta[o.key].label}</p>
            <p className={cn("mt-1 font-display text-2xl font-bold",
              o.key === "present" && "text-success",
              o.key === "absent" && "text-destructive",
              o.key === "late" && "text-warning",
              o.key === "leave" && "text-accent",
            )}>{summary[o.key]}</p>
          </div>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
          <span className="text-sm font-medium">{selected.size} selected · Bulk update to:</span>
          {options.map((o) => (
            <Button key={o.key} size="sm" variant="outline" onClick={() => bulkUpdate(o.key)}>
              <o.icon className="h-3.5 w-3.5" />{statusMeta[o.key].label}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} className="ml-auto">Clear</Button>
        </div>
      )}

      <div className="card-elevated overflow-hidden">
        <div className="border-b border-border p-3 text-sm text-muted-foreground">
          {filtered.length} teachers · {new Date().toLocaleDateString()}
        </div>
        <ul className="divide-y divide-border" role="list">
          {filtered.map((t, i) => (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: Math.min(i, 15) * 0.015 }}
              className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={selected.has(t.id)}
                  onChange={() => toggleSel(t.id)}
                  aria-label={`Select ${t.name}`}
                />
                <Avatar className="h-9 w-9">
                  <AvatarImage src={t.photo} alt="" />
                  <AvatarFallback>{t.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.employeeId} · {t.department}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {options.map((o) => {
                  const active = marks[t.id] === o.key;
                  return (
                    <button
                      key={o.key}
                      onClick={() => setMarks((m) => ({ ...m, [t.id]: o.key }))}
                      aria-label={`Mark ${t.name} as ${statusMeta[o.key].label}`}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        active ? statusMeta[o.key].tone : "bg-transparent text-muted-foreground ring-border hover:bg-secondary/60",
                      )}
                    >
                      <o.icon className="h-3.5 w-3.5" />
                      {statusMeta[o.key].label}
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
