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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, Copy, Download, Printer, Search, Trash2, Pencil,
} from "lucide-react";
import { teacherRecords } from "@/features/teachers/data";
import {
  CLASSES, CLASSROOMS, DAYS, PERIODS, SUBJECTS, type Day, type PeriodId,
  type TimetableSlot, detectConflicts, getClassroom, getSubject, getTeacher,
} from "./data";
import { toast } from "sonner";

type View = "teacher" | "class" | "department";

interface Props {
  slots: TimetableSlot[];
  onChange: (next: TimetableSlot[]) => void;
}

export function TimetableGrid({ slots, onChange }: Props) {
  const teachingTeachers = useMemo(
    () => teacherRecords.filter((t) => t.type === "teaching" && t.status !== "archived"),
    [],
  );
  const departments = useMemo(
    () => Array.from(new Set(teacherRecords.map((t) => t.department))),
    [],
  );

  const [view, setView] = useState<View>("class");
  const [classId, setClassId] = useState<string>(CLASSES[0].id);
  const [teacherId, setTeacherId] = useState<string>(teachingTeachers[0]?.id ?? "");
  const [dept, setDept] = useState<string>(departments[0] ?? "");
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [editing, setEditing] = useState<TimetableSlot | null>(null);
  const [creatingAt, setCreatingAt] = useState<{ day: Day; periodId: PeriodId } | null>(null);
  const [copySource, setCopySource] = useState<string>(CLASSES[0].id);
  const [copyTarget, setCopyTarget] = useState<string>(CLASSES[1].id);

  const conflicts = useMemo(() => detectConflicts(slots), [slots]);
  const conflictSlotIds = useMemo(() => {
    const set = new Set<string>();
    conflicts.forEach((c) => c.slotIds.forEach((id) => set.add(id)));
    return set;
  }, [conflicts]);

  const activeSlots = useMemo(() => {
    let filtered = slots;
    if (view === "class") filtered = filtered.filter((s) => s.classId === classId);
    if (view === "teacher") filtered = filtered.filter((s) => s.teacherId === teacherId);
    if (view === "department") {
      const tIds = new Set(teacherRecords.filter((t) => t.department === dept).map((t) => t.id));
      filtered = filtered.filter((s) => tIds.has(s.teacherId));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter((s) =>
        getSubject(s.subjectCode)?.name.toLowerCase().includes(q) ||
        getTeacher(s.teacherId)?.name.toLowerCase().includes(q) ||
        s.classId.toLowerCase().includes(q) ||
        s.roomId.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [slots, view, classId, teacherId, dept, query]);

  const grid = useMemo(() => {
    // Map: day -> periodId -> slots
    const map = new Map<string, TimetableSlot[]>();
    activeSlots.forEach((s) => {
      const k = `${s.day}|${s.periodId}`;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s);
    });
    return map;
  }, [activeSlots]);

  const onDragStart = (id: string) => setDragging(id);
  const onDrop = (day: Day, periodId: PeriodId) => {
    if (!dragging) return;
    const next = slots.map((s) => s.id === dragging ? { ...s, day, periodId } : s);
    onChange(next);
    setDragging(null);
    toast.success(`Moved to ${day} ${periodId}`);
  };

  const removeSlot = (id: string) => {
    onChange(slots.filter((s) => s.id !== id));
    toast.success("Period removed");
  };

  const saveEdit = (updated: TimetableSlot) => {
    const withOut = slots.filter((s) => s.id !== updated.id);
    // detect conflicts before save
    const trial = [...withOut, updated];
    const trialConflicts = detectConflicts(trial).filter((c) => c.slotIds.includes(updated.id));
    if (trialConflicts.length > 0) {
      toast.error(trialConflicts[0].message);
      return;
    }
    onChange(trial);
    setEditing(null);
    setCreatingAt(null);
    toast.success("Period saved");
  };

  const copyTimetable = () => {
    if (copySource === copyTarget) {
      toast.error("Choose different source and target classes");
      return;
    }
    const filtered = slots.filter((s) => s.classId !== copyTarget);
    const source = slots.filter((s) => s.classId === copySource);
    const clones = source.map((s) => ({
      ...s,
      id: `TT-${copyTarget}-${s.day}-${s.periodId}-${Date.now()}`,
      classId: copyTarget,
    }));
    onChange([...filtered, ...clones]);
    toast.success(`Copied ${clones.length} periods to ${copyTarget}`);
  };

  const exportPdf = () => window.print();

  const viewLabel =
    view === "class" ? `Grade ${classId}` :
    view === "teacher" ? getTeacher(teacherId)?.name ?? "Teacher" :
    dept;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <Select value={view} onValueChange={(v) => setView(v as View)}>
            <SelectTrigger className="lg:w-40" aria-label="View mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="class">Class view</SelectItem>
              <SelectItem value="teacher">Teacher view</SelectItem>
              <SelectItem value="department">Department view</SelectItem>
            </SelectContent>
          </Select>
          {view === "class" && (
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="lg:w-48" aria-label="Class"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CLASSES.map((c) => <SelectItem key={c.id} value={c.id}>Grade {c.grade}-{c.section}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {view === "teacher" && (
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger className="lg:w-64" aria-label="Teacher"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {teachingTeachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {view === "department" && (
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="lg:w-56" aria-label="Department"><SelectValue /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search subject, teacher, class, room…"
              className="pl-9" aria-label="Search timetable" />
          </div>
          <div className="flex flex-wrap gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline"><Copy /> Copy</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Copy timetable</AlertDialogTitle>
                  <AlertDialogDescription>
                    Overwrites the target class's schedule with periods from the source class.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>From</Label>
                    <Select value={copySource} onValueChange={setCopySource}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CLASSES.map((c) => <SelectItem key={c.id} value={c.id}>Grade {c.grade}-{c.section}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>To</Label>
                    <Select value={copyTarget} onValueChange={setCopyTarget}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CLASSES.map((c) => <SelectItem key={c.id} value={c.id}>Grade {c.grade}-{c.section}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={copyTimetable}>Copy</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={() => window.print()}><Printer /> Print</Button>
            <Button variant="hero" onClick={exportPdf}><Download /> Export PDF</Button>
          </div>
        </CardContent>
      </Card>

      {conflicts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-2xl border-destructive/40 bg-destructive/5">
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
              <div>
                <CardTitle className="text-base font-semibold text-destructive">
                  {conflicts.length} schedule conflict{conflicts.length === 1 ? "" : "s"}
                </CardTitle>
                <ul className="mt-1 space-y-0.5 text-xs text-destructive/90">
                  {conflicts.slice(0, 5).map((c, i) => <li key={i}>• {c.message}</li>)}
                  {conflicts.length > 5 && <li>… and {conflicts.length - 5} more</li>}
                </ul>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      )}

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-semibold">Weekly Timetable</CardTitle>
            <p className="text-xs text-muted-foreground">{viewLabel} · drag periods to reschedule</p>
          </div>
          <Badge variant="secondary" className="rounded-md">{activeSlots.length} periods</Badge>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid" style={{ gridTemplateColumns: `120px repeat(${DAYS.length}, minmax(120px, 1fr))` }}>
              <div className="border-b border-r border-border/60 bg-secondary/30 p-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Period
              </div>
              {DAYS.map((d) => (
                <div key={d} className="border-b border-border/60 bg-secondary/30 p-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {d}
                </div>
              ))}
              {PERIODS.map((p) => (
                <ScheduleRow
                  key={p.id}
                  period={p}
                  grid={grid}
                  view={view}
                  conflictSlotIds={conflictSlotIds}
                  onDragStart={onDragStart}
                  onDrop={onDrop}
                  onCreate={(day) => setCreatingAt({ day, periodId: p.id })}
                  onEdit={(s) => setEditing(s)}
                  onDelete={removeSlot}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <SlotEditor
        open={editing !== null || creatingAt !== null}
        slot={editing}
        creatingAt={creatingAt}
        contextClassId={view === "class" ? classId : undefined}
        contextTeacherId={view === "teacher" ? teacherId : undefined}
        onClose={() => { setEditing(null); setCreatingAt(null); }}
        onSave={(s) => saveEdit(s)}
      />
    </div>
  );
}

interface RowProps {
  period: (typeof PERIODS)[number];
  grid: Map<string, TimetableSlot[]>;
  view: View;
  conflictSlotIds: Set<string>;
  onDragStart: (id: string) => void;
  onDrop: (day: Day, periodId: PeriodId) => void;
  onCreate: (day: Day) => void;
  onEdit: (s: TimetableSlot) => void;
  onDelete: (id: string) => void;
}

function ScheduleRow({
  period, grid, view, conflictSlotIds, onDragStart, onDrop, onCreate, onEdit, onDelete,
}: RowProps) {
  return (
    <>
      <div className="border-b border-r border-border/60 p-2 text-xs">
        <p className="font-semibold">{period.label}</p>
        <p className="tabular-nums text-muted-foreground">{period.start}–{period.end}</p>
      </div>
      {DAYS.map((d) => {
        const cellSlots = grid.get(`${d}|${period.id}`) ?? [];
        return (
          <div key={d}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(d, period.id)}
            className="relative min-h-[76px] border-b border-l border-border/60 p-1.5"
            role="gridcell"
            aria-label={`${d} ${period.label}`}
          >
            {cellSlots.length === 0 ? (
              <button
                onClick={() => onCreate(d)}
                className="flex h-full min-h-[64px] w-full items-center justify-center rounded-lg border border-dashed border-border/60 text-[10px] uppercase tracking-wider text-muted-foreground/60 transition-smooth hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                aria-label={`Free period, add on ${d} ${period.label}`}
              >
                Free
              </button>
            ) : (
              <div className="space-y-1">
                {cellSlots.map((s) => (
                  <SlotChip key={s.id} slot={s} view={view}
                    conflict={conflictSlotIds.has(s.id)}
                    onDragStart={onDragStart}
                    onEdit={() => onEdit(s)}
                    onDelete={() => onDelete(s.id)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function SlotChip({
  slot, view, conflict, onDragStart, onEdit, onDelete,
}: {
  slot: TimetableSlot;
  view: View;
  conflict: boolean;
  onDragStart: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const subj = getSubject(slot.subjectCode);
  const teacher = getTeacher(slot.teacherId);
  const room = getClassroom(slot.roomId);
  return (
    <div
      draggable
      onDragStart={() => onDragStart(slot.id)}
      className={cn(
        "group cursor-grab rounded-lg border p-1.5 text-[11px] leading-tight transition-smooth active:cursor-grabbing",
        conflict
          ? "border-destructive/60 bg-destructive/10"
          : "border-primary/30 bg-primary/5 hover:border-primary/60 hover:bg-primary/10",
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="truncate font-semibold">{subj?.name ?? slot.subjectCode}</p>
        <div className="flex gap-0.5 opacity-0 transition-smooth group-hover:opacity-100">
          <button onClick={onEdit} aria-label="Edit period" className="rounded p-0.5 hover:bg-background/80">
            <Pencil className="h-3 w-3" />
          </button>
          <button onClick={onDelete} aria-label="Delete period" className="rounded p-0.5 hover:bg-background/80">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      {view !== "class" && <p className="truncate text-muted-foreground">Grade {slot.classId}</p>}
      {view !== "teacher" && <p className="truncate text-muted-foreground">{teacher?.name ?? "—"}</p>}
      <p className="truncate text-muted-foreground/80">{room?.name ?? slot.roomId}</p>
    </div>
  );
}

function SlotEditor({
  open, slot, creatingAt, contextClassId, contextTeacherId, onClose, onSave,
}: {
  open: boolean;
  slot: TimetableSlot | null;
  creatingAt: { day: Day; periodId: PeriodId } | null;
  contextClassId?: string;
  contextTeacherId?: string;
  onClose: () => void;
  onSave: (s: TimetableSlot) => void;
}) {
  const [form, setForm] = useState<TimetableSlot>(() =>
    slot ?? {
      id: `TT-NEW-${Date.now()}`,
      day: creatingAt?.day ?? DAYS[0],
      periodId: creatingAt?.periodId ?? PERIODS[0].id,
      teacherId: contextTeacherId ?? "",
      subjectCode: SUBJECTS[0].code,
      classId: contextClassId ?? CLASSES[0].id,
      roomId: CLASSROOMS[0].id,
    },
  );
  // sync when opening
  useMemo(() => {
    if (slot) setForm(slot);
    else if (creatingAt) {
      setForm((f) => ({
        ...f,
        id: `TT-NEW-${Date.now()}`,
        day: creatingAt.day,
        periodId: creatingAt.periodId,
        classId: contextClassId ?? f.classId,
        teacherId: contextTeacherId ?? f.teacherId,
      }));
    }
  }, [slot, creatingAt, contextClassId, contextTeacherId]);

  const teachingTeachers = teacherRecords.filter((t) => t.type === "teaching" && t.status !== "archived");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>{slot ? "Edit period" : "Add period"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Day</Label>
              <Select value={form.day} onValueChange={(v) => setForm((f) => ({ ...f, day: v as Day }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Period</Label>
              <Select value={form.periodId} onValueChange={(v) => setForm((f) => ({ ...f, periodId: v as PeriodId }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => <SelectItem key={p.id} value={p.id}>{p.label} ({p.start})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Class</Label>
            <Select value={form.classId} onValueChange={(v) => setForm((f) => ({ ...f, classId: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CLASSES.map((c) => <SelectItem key={c.id} value={c.id}>Grade {c.grade}-{c.section}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Select value={form.subjectCode} onValueChange={(v) => setForm((f) => ({ ...f, subjectCode: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-64">
                {SUBJECTS.map((s) => <SelectItem key={s.code} value={s.code}>{s.name} · {s.department}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Teacher</Label>
            <Select value={form.teacherId} onValueChange={(v) => setForm((f) => ({ ...f, teacherId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
              <SelectContent className="max-h-64">
                {teachingTeachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Room</Label>
            <Select value={form.roomId} onValueChange={(v) => setForm((f) => ({ ...f, roomId: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CLASSROOMS.map((r) => <SelectItem key={r.id} value={r.id}>{r.name} · {r.type}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="hero" onClick={() => { if (!form.teacherId) { toast.error("Select a teacher"); return; } onSave(form); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
