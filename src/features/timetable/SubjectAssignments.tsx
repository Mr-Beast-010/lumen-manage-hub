import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/EmptyState";
import { Plus, Search, Trash2, Layers } from "lucide-react";
import {
  CLASSES, SUBJECTS, type SubjectAssignment, getTeacher, getSubject,
} from "./data";
import { teacherRecords } from "@/features/teachers/data";
import { toast } from "sonner";

interface Props {
  assignments: SubjectAssignment[];
  onChange: (next: SubjectAssignment[]) => void;
}

export function SubjectAssignments({ assignments, onChange }: Props) {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [teacherId, setTeacherId] = useState<string>("");
  const [subjectCodes, setSubjectCodes] = useState<string[]>([]);
  const [classIds, setClassIds] = useState<string[]>([]);

  const teachingTeachers = useMemo(
    () => teacherRecords.filter((t) => t.type === "teaching" && t.status !== "archived"),
    [],
  );
  const departments = useMemo(
    () => Array.from(new Set(SUBJECTS.map((s) => s.department))),
    [],
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return assignments.filter((a) => {
      const s = getSubject(a.subjectCode);
      const t = getTeacher(a.teacherId);
      if (dept !== "all" && s?.department !== dept) return false;
      if (!query) return true;
      return (
        s?.name.toLowerCase().includes(query) ||
        s?.code.toLowerCase().includes(query) ||
        t?.name.toLowerCase().includes(query) ||
        a.classId.toLowerCase().includes(query)
      );
    });
  }, [assignments, q, dept]);

  const groupedByTeacher = useMemo(() => {
    const map = new Map<string, SubjectAssignment[]>();
    filtered.forEach((a) => {
      if (!map.has(a.teacherId)) map.set(a.teacherId, []);
      map.get(a.teacherId)!.push(a);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const openNew = () => {
    setTeacherId("");
    setSubjectCodes([]);
    setClassIds([]);
    setDialogOpen(true);
  };

  const save = () => {
    if (!teacherId || subjectCodes.length === 0 || classIds.length === 0) {
      toast.error("Select teacher, at least one subject and class");
      return;
    }
    const next = [...assignments];
    let added = 0;
    subjectCodes.forEach((sc) => {
      classIds.forEach((cid) => {
        const dup = next.some(
          (a) => a.teacherId === teacherId && a.subjectCode === sc && a.classId === cid,
        );
        if (dup) return;
        next.push({
          id: `SA-${teacherId}-${sc}-${cid}-${Date.now()}-${added}`,
          teacherId,
          subjectCode: sc,
          classId: cid as SubjectAssignment["classId"],
        });
        added++;
      });
    });
    onChange(next);
    toast.success(`${added} subject assignment${added === 1 ? "" : "s"} added`);
    setDialogOpen(false);
  };

  const remove = (id: string) => {
    onChange(assignments.filter((a) => a.id !== id));
    toast.success("Assignment removed");
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search subjects, teachers or classes…"
              className="pl-9"
              aria-label="Search subject assignments"
            />
          </div>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="sm:w-52" aria-label="Filter by department">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" onClick={openNew}><Layers /> Bulk Assign</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto rounded-2xl sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Bulk assign subjects</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Teacher</Label>
                  <Select value={teacherId} onValueChange={setTeacherId}>
                    <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {teachingTeachers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name} · {t.department}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Subjects ({subjectCodes.length})</Label>
                  <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-border/60 bg-secondary/20 p-3">
                    {SUBJECTS.map((s) => (
                      <label key={s.code} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={subjectCodes.includes(s.code)}
                          onCheckedChange={() => toggle(subjectCodes, setSubjectCodes, s.code)}
                          aria-label={s.name}
                        />
                        <span className="truncate">{s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Classes ({classIds.length})</Label>
                  <div className="grid grid-cols-4 gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3">
                    {CLASSES.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={classIds.includes(c.id)}
                          onCheckedChange={() => toggle(classIds, setClassIds, c.id)}
                          aria-label={`Grade ${c.grade}-${c.section}`}
                        />
                        <span>{c.grade}-{c.section}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button variant="hero" onClick={save}><Plus /> Assign</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {groupedByTeacher.length === 0 ? (
        <EmptyState title="No subject assignments" description="Adjust filters or create a new bulk assignment." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groupedByTeacher.map(([tid, list], idx) => {
            const t = getTeacher(tid);
            if (!t) return null;
            const totalPeriods = list.reduce((sum, a) => sum + (getSubject(a.subjectCode)?.weeklyPeriods ?? 0), 0);
            return (
              <motion.div key={tid}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}>
                <Card className="h-full rounded-2xl">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div>
                      <CardTitle className="text-base font-semibold">{t.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{t.department} · {t.designation}</p>
                    </div>
                    <Badge variant="secondary" className="rounded-md">~{totalPeriods} p/wk</Badge>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {list.map((a) => {
                      const s = getSubject(a.subjectCode);
                      if (!s) return null;
                      return (
                        <div key={a.id} className="flex items-center gap-2 rounded-lg p-2 transition-smooth hover:bg-secondary/50">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{s.name} <span className="text-xs text-muted-foreground">({s.code})</span></p>
                            <p className="text-xs text-muted-foreground">Grade {a.classId} · {s.weeklyPeriods} periods/wk</p>
                          </div>
                          <Button variant="ghost" size="icon" aria-label={`Remove ${s.name}`} onClick={() => remove(a.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
