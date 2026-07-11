import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, Check, X, MessageSquare, Trash2, Pencil, CalendarDays, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { OverviewMetric } from "@/features/students/profile/OverviewMetric";
import { teacherRecords } from "@/features/teachers/data";
import {
  leaveRequestsData, leaveBalanceFor, leaveTypeLabels, leaveTypeTones,
  type LeaveRequestRecord, type LeaveType, type LeaveStatus,
} from "./data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusTone: Record<LeaveStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  "info-requested": "bg-accent/10 text-accent border-accent/20",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const daysBetween = (a: string, b: string) => {
  if (!a || !b) return 0;
  const diff = (new Date(b).getTime() - new Date(a).getTime()) / 86400000;
  return Math.max(1, Math.floor(diff) + 1);
};

export function LeaveManagement() {
  const [requests, setRequests] = useState<LeaveRequestRecord[]>(leaveRequestsData);
  const [tab, setTab] = useState("pending");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dept, setDept] = useState<string>("all");
  const [openApply, setOpenApply] = useState(false);
  const [editing, setEditing] = useState<LeaveRequestRecord | null>(null);

  const departments = useMemo(
    () => Array.from(new Set(teacherRecords.map((t) => t.department))).sort(),
    [],
  );

  const focusTeacher = teacherRecords[0];
  const balance = useMemo(() => leaveBalanceFor(focusTeacher.id), [focusTeacher.id]);

  const stats = useMemo(() => {
    return {
      pending: requests.filter((r) => r.status === "pending").length,
      approved: requests.filter((r) => r.status === "approved").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
      total: requests.length,
    };
  }, [requests]);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (tab === "pending" && r.status !== "pending" && r.status !== "info-requested") return false;
      if (tab === "approved" && r.status !== "approved") return false;
      if (tab === "history" && (r.status === "pending" || r.status === "info-requested")) return false;
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (dept !== "all" && r.department !== dept) return false;
      return true;
    });
  }, [requests, tab, typeFilter, dept]);

  const decide = (id: string, status: LeaveStatus, note?: string) => {
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    const labels: Record<LeaveStatus, string> = {
      approved: "approved", rejected: "rejected", "info-requested": "info requested",
      pending: "pending", cancelled: "cancelled",
    };
    toast.success(`Leave ${labels[status]}${note ? ` — ${note}` : ""}`);
  };

  const cancelLeave = (id: string) => {
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r)));
    toast.success("Leave cancelled");
  };

  const upsert = (payload: Omit<LeaveRequestRecord, "id" | "appliedOn" | "days"> & { id?: string }) => {
    const days = daysBetween(payload.from, payload.to);
    if (payload.id) {
      setRequests((rs) => rs.map((r) => (r.id === payload.id ? { ...r, ...payload, days } as LeaveRequestRecord : r)));
      toast.success("Leave request updated");
    } else {
      const id = `LV-${Math.floor(Math.random() * 9000) + 3000}`;
      setRequests((rs) => [
        { ...payload, id, days, appliedOn: new Date().toISOString().slice(0, 10), status: "pending" } as LeaveRequestRecord,
        ...rs,
      ]);
      toast.success("Leave applied");
    }
    setEditing(null);
    setOpenApply(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewMetric label="Pending Requests" value={String(stats.pending)} icon={Clock} tone="warning" index={0} />
        <OverviewMetric label="Approved" value={String(stats.approved)} icon={CheckCircle2} tone="success" index={1} />
        <OverviewMetric label="Rejected" value={String(stats.rejected)} icon={XCircle} tone="destructive" index={2} />
        <OverviewMetric label="Total Requests" value={String(stats.total)} icon={CalendarDays} tone="primary" index={3} />
      </div>

      <section className="rounded-2xl border border-border bg-card p-5">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-semibold">Leave Balance</h3>
            <p className="text-xs text-muted-foreground">{focusTeacher.name} · {focusTeacher.employeeId}</p>
          </div>
          <Dialog open={openApply} onOpenChange={setOpenApply}>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm"><Plus className="mr-1 h-4 w-4" /> Apply Leave</Button>
            </DialogTrigger>
            <LeaveFormDialog
              defaultTeacherId={focusTeacher.id}
              onSubmit={upsert}
              onClose={() => setOpenApply(false)}
            />
          </Dialog>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(["casual","sick","earned","maternity","unpaid"] as LeaveType[]).map((k) => {
            const b = balance[k];
            const remaining = Math.max(0, b.total - b.used);
            const pct = b.total ? Math.round((b.used / b.total) * 100) : 0;
            return (
              <div key={k} className="rounded-xl border border-border bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{leaveTypeLabels[k]}</p>
                <p className="mt-1 font-display text-2xl font-bold">{remaining}<span className="ml-1 text-sm font-normal text-muted-foreground">/ {b.total}</span></p>
                <Progress value={pct} className="mt-2 h-1.5" />
                <p className="mt-1 text-[11px] text-muted-foreground">{b.used} used</p>
              </div>
            );
          })}
        </div>
      </section>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40" aria-label="Filter by leave type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {(["casual","sick","earned","maternity","unpaid"] as LeaveType[]).map((k) => (
                  <SelectItem key={k} value={k}>{leaveTypeLabels[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="w-44" aria-label="Filter by department"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={tab} className="mt-4">
          <ul className="space-y-3">
            {filtered.map((r, i) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.3) }}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{r.teacherName}</span>
                      <span className="text-xs text-muted-foreground">{r.department}</span>
                      <Badge variant="outline" className={cn("capitalize", leaveTypeTones[r.type])}>
                        {leaveTypeLabels[r.type]}
                      </Badge>
                      <Badge variant="outline" className={cn("capitalize", statusTone[r.status])}>
                        {r.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {r.from} → {r.to} · <span className="text-foreground">{r.days} day(s)</span>
                    </p>
                    <p className="text-sm">{r.reason}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(r.status === "pending" || r.status === "info-requested") && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => decide(r.id, "approved")}>
                          <Check className="mr-1 h-4 w-4" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => decide(r.id, "rejected")}>
                          <X className="mr-1 h-4 w-4" /> Reject
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => decide(r.id, "info-requested", "More info requested")}>
                          <MessageSquare className="mr-1 h-4 w-4" /> Info
                        </Button>
                        <Dialog open={editing?.id === r.id} onOpenChange={(v) => !v && setEditing(null)}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={() => setEditing(r)}>
                              <Pencil className="mr-1 h-4 w-4" /> Edit
                            </Button>
                          </DialogTrigger>
                          {editing?.id === r.id && (
                            <LeaveFormDialog
                              defaultTeacherId={r.teacherId}
                              initial={r}
                              onSubmit={upsert}
                              onClose={() => setEditing(null)}
                            />
                          )}
                        </Dialog>
                        <Button size="sm" variant="ghost" onClick={() => cancelLeave(r.id)}>
                          <Trash2 className="mr-1 h-4 w-4" /> Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
            {filtered.length === 0 && (
              <li className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No leave requests match your filters.
              </li>
            )}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LeaveFormDialog({
  defaultTeacherId,
  initial,
  onSubmit,
  onClose,
}: {
  defaultTeacherId: string;
  initial?: LeaveRequestRecord;
  onSubmit: (p: Omit<LeaveRequestRecord, "id" | "appliedOn" | "days"> & { id?: string }) => void;
  onClose: () => void;
}) {
  const [teacherId, setTeacherId] = useState(initial?.teacherId ?? defaultTeacherId);
  const [type, setType] = useState<LeaveType>(initial?.type ?? "casual");
  const [from, setFrom] = useState(initial?.from ?? "");
  const [to, setTo] = useState(initial?.to ?? "");
  const [reason, setReason] = useState(initial?.reason ?? "");

  const submit = () => {
    if (!from || !to) { toast.error("Please select dates"); return; }
    if (new Date(to) < new Date(from)) { toast.error("End date must be after start date"); return; }
    if (reason.trim().length < 3) { toast.error("Please provide a reason"); return; }
    if (reason.length > 500) { toast.error("Reason must be under 500 characters"); return; }
    const teacher = teacherRecords.find((t) => t.id === teacherId);
    onSubmit({
      id: initial?.id,
      teacherId,
      teacherName: teacher?.name ?? "",
      department: teacher?.department ?? "",
      type,
      from,
      to,
      reason: reason.trim(),
      status: initial?.status ?? "pending",
    });
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{initial ? "Edit Leave Request" : "Apply for Leave"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="lv-teacher">Teacher</Label>
          <Select value={teacherId} onValueChange={setTeacherId}>
            <SelectTrigger id="lv-teacher"><SelectValue /></SelectTrigger>
            <SelectContent>
              {teacherRecords.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="lv-type">Leave Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as LeaveType)}>
            <SelectTrigger id="lv-type"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["casual","sick","earned","maternity","unpaid"] as LeaveType[]).map((k) => (
                <SelectItem key={k} value={k}>{leaveTypeLabels[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="lv-from">From</Label>
            <Input id="lv-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="lv-to">To</Label>
            <Input id="lv-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="lv-reason">Reason</Label>
          <Textarea id="lv-reason" value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} rows={3} />
          <p className="text-[11px] text-muted-foreground">{reason.length}/500</p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="hero" onClick={submit}>{initial ? "Save Changes" : "Submit"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
