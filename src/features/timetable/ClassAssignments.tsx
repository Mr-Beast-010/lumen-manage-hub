import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/EmptyState";
import { Plus, Search, Trash2, Pencil, Star } from "lucide-react";
import { CLASSES, type ClassAssignment, getTeacher } from "./data";
import { teacherRecords } from "@/features/teachers/data";
import { toast } from "sonner";

interface Props {
  assignments: ClassAssignment[];
  onChange: (next: ClassAssignment[]) => void;
}

export function ClassAssignments({ assignments, onChange }: Props) {
  const [q, setQ] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClassAssignment | null>(null);
  const [form, setForm] = useState({
    teacherId: "",
    classId: CLASSES[0].id as string,
    academicYear: "2026-27",
    isClassTeacher: false,
  });

  const teachingTeachers = useMemo(
    () => teacherRecords.filter((t) => t.type === "teaching" && t.status !== "archived"),
    [],
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return assignments.filter((a) => {
      if (classFilter !== "all" && a.classId !== classFilter) return false;
      if (!query) return true;
      const t = getTeacher(a.teacherId);
      return (
        t?.name.toLowerCase().includes(query) ||
        t?.department.toLowerCase().includes(query) ||
        a.classId.toLowerCase().includes(query)
      );
    });
  }, [assignments, q, classFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, ClassAssignment[]>();
    filtered.forEach((a) => {
      if (!map.has(a.classId)) map.set(a.classId, []);
      map.get(a.classId)!.push(a);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const openNew = () => {
    setEditing(null);
    setForm({ teacherId: "", classId: CLASSES[0].id, academicYear: "2026-27", isClassTeacher: false });
    setDialogOpen(true);
  };
  const openEdit = (a: ClassAssignment) => {
    setEditing(a);
    setForm({ teacherId: a.teacherId, classId: a.classId, academicYear: a.academicYear, isClassTeacher: a.isClassTeacher });
    setDialogOpen(true);
  };
  const save = () => {
    if (!form.teacherId) { toast.error("Select a teacher"); return; }
    // enforce single class teacher per class
    let next = [...assignments];
    if (form.isClassTeacher) {
      next = next.map((a) =>
        a.classId === form.classId && (!editing || a.id !== editing.id)
          ? { ...a, isClassTeacher: false }
          : a,
      );
    }
    if (editing) {
      next = next.map((a) => a.id === editing.id ? { ...a, ...form } : a);
      toast.success("Assignment updated");
    } else {
      const dup = next.some((a) => a.teacherId === form.teacherId && a.classId === form.classId);
      if (dup) { toast.error("This teacher is already assigned to that class"); return; }
      next.push({
        id: `CA-${form.classId}-${form.teacherId}-${Date.now()}`,
        ...form,
        classId: form.classId as ClassAssignment["classId"],
      });
      toast.success("Assignment added");
    }
    onChange(next);
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
              placeholder="Search by teacher, department, or class…"
              className="pl-9"
              aria-label="Search class assignments"
            />
          </div>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="sm:w-48" aria-label="Filter by class">
              <SelectValue placeholder="All classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {CLASSES.map((c) => (
                <SelectItem key={c.id} value={c.id}>Grade {c.grade}-{c.section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" onClick={openNew}><Plus /> Assign</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>{editing ? "Reassign teacher" : "Assign teacher to class"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Teacher</Label>
                  <Select value={form.teacherId} onValueChange={(v) => setForm((f) => ({ ...f, teacherId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {teachingTeachers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name} · {t.department}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Class</Label>
                    <Select value={form.classId} onValueChange={(v) => setForm((f) => ({ ...f, classId: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CLASSES.map((c) => (
                          <SelectItem key={c.id} value={c.id}>Grade {c.grade}-{c.section}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Academic Year</Label>
                    <Select value={form.academicYear} onValueChange={(v) => setForm((f) => ({ ...f, academicYear: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025-26">2025-26</SelectItem>
                        <SelectItem value="2026-27">2026-27</SelectItem>
                        <SelectItem value="2027-28">2027-28</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 p-3">
                  <div>
                    <Label htmlFor="ct-switch">Class Teacher</Label>
                    <p className="text-xs text-muted-foreground">Mark this teacher as the class teacher.</p>
                  </div>
                  <Switch
                    id="ct-switch"
                    checked={form.isClassTeacher}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, isClassTeacher: v }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button variant="hero" onClick={save}>{editing ? "Update" : "Assign"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {grouped.length === 0 ? (
        <EmptyState title="No assignments" description="Try clearing filters or add a new assignment." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {grouped.map(([classId, list], idx) => {
            const cls = CLASSES.find((c) => c.id === classId)!;
            const ct = list.find((a) => a.isClassTeacher);
            return (
              <motion.div key={classId}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}>
                <Card className="h-full rounded-2xl">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div>
                      <CardTitle className="text-base font-semibold">Grade {cls.grade}-{cls.section}</CardTitle>
                      <p className="text-xs text-muted-foreground">{cls.students} students · AY {list[0].academicYear}</p>
                    </div>
                    <Badge variant="secondary" className="rounded-md">{list.length} staff</Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {ct && (
                      <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-2 text-xs">
                        <Star className="h-3.5 w-3.5 text-primary" />
                        <span className="font-medium">Class Teacher:</span>
                        <span className="truncate">{getTeacher(ct.teacherId)?.name}</span>
                      </div>
                    )}
                    <ul className="space-y-1.5">
                      {list.map((a) => {
                        const t = getTeacher(a.teacherId);
                        if (!t) return null;
                        return (
                          <li key={a.id} className="flex items-center gap-2 rounded-lg p-2 transition-smooth hover:bg-secondary/50">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{t.name}</p>
                              <p className="truncate text-xs text-muted-foreground">{t.designation} · {t.department}</p>
                            </div>
                            {a.isClassTeacher && <Badge className="rounded-md" variant="outline">CT</Badge>}
                            <Button variant="ghost" size="icon" aria-label={`Edit ${t.name}`} onClick={() => openEdit(a)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" aria-label={`Remove ${t.name}`} onClick={() => remove(a.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
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
