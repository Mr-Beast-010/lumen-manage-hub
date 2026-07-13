import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Save, Send, Check, X, Clock, CalendarOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { classSectionList, rosterForClass, statusMeta, type AttStatus } from "./data";

const options: { key: AttStatus; icon: React.ElementType }[] = [
  { key: "present", icon: Check },
  { key: "absent", icon: X },
  { key: "late", icon: Clock },
  { key: "leave", icon: CalendarOff },
];

export function MarkStudentAttendance() {
  const [cls, setCls] = useState(classSectionList[0] ?? "10-A");
  const [query, setQuery] = useState("");
  const roster = useMemo(() => rosterForClass(cls), [cls]);
  const [marks, setMarks] = useState<Record<string, AttStatus>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // reset marks when class changes
  useMemo(() => {
    const seed: Record<string, AttStatus> = {};
    roster.forEach((s) => (seed[s.id] = "present"));
    setMarks(seed);
    setSelected(new Set());
  }, [cls]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = roster.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) || s.rollNo.includes(query) || s.id.includes(query),
  );

  const summary = {
    present: Object.values(marks).filter((v) => v === "present").length,
    absent: Object.values(marks).filter((v) => v === "absent").length,
    late: Object.values(marks).filter((v) => v === "late").length,
    leave: Object.values(marks).filter((v) => v === "leave").length,
  };

  const markAll = (status: AttStatus) => {
    setMarks((prev) => {
      const next = { ...prev };
      roster.forEach((s) => (next[s.id] = status));
      return next;
    });
    toast.success(`All students marked ${statusMeta[status].label.toLowerCase()}`);
  };

  const bulkUpdate = (status: AttStatus) => {
    if (!selected.size) return toast.info("Select students first");
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

  const toggleAllVisible = () =>
    setSelected((s) => {
      const n = new Set(s);
      const allSelected = filtered.every((r) => n.has(r.id));
      filtered.forEach((r) => (allSelected ? n.delete(r.id) : n.add(r.id)));
      return n;
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={cls} onValueChange={setCls}>
          <SelectTrigger className="w-40" aria-label="Select class"><SelectValue /></SelectTrigger>
          <SelectContent>
            {classSectionList.map((c) => <SelectItem key={c} value={c}>Grade {c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students by name or roll no."
            className="pl-8"
            aria-label="Search students"
          />
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => markAll("present")}>
            <Users className="h-4 w-4" /> Mark all present
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("Draft saved")}>
            <Save className="h-4 w-4" /> Save draft
          </Button>
          <Button variant="hero" size="sm" onClick={() => toast.success(`Attendance submitted for Grade ${cls}`)}>
            <Send className="h-4 w-4" /> Submit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map((o) => (
          <div key={o.key} className={cn("rounded-2xl border border-border bg-card p-4")}>
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
        <div className="flex items-center justify-between border-b border-border p-3 text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={filtered.length > 0 && filtered.every((r) => selected.has(r.id))}
              onChange={toggleAllVisible}
              aria-label="Select all visible"
            />
            Grade {cls} · {new Date().toLocaleDateString()} · {filtered.length} of {roster.length}
          </label>
        </div>
        <ul className="divide-y divide-border" role="list">
          {filtered.map((s, i) => (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: Math.min(i, 15) * 0.015 }}
              className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={selected.has(s.id)}
                  onChange={() => toggleSel(s.id)}
                  aria-label={`Select ${s.name}`}
                />
                <Avatar className="h-9 w-9">
                  <AvatarImage src={s.photo} alt="" />
                  <AvatarFallback>{s.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Roll {s.rollNo} · {s.id}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {options.map((o) => {
                  const active = marks[s.id] === o.key;
                  return (
                    <button
                      key={o.key}
                      onClick={() => setMarks((m) => ({ ...m, [s.id]: o.key }))}
                      aria-label={`Mark ${s.name} as ${statusMeta[o.key].label}`}
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
