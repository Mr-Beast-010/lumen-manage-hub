import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, CheckCircle2, ChevronLeft, ChevronRight, History, Users } from "lucide-react";
import type { StudentRecord } from "../data";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  students: StudentRecord[];
  targetIds?: string[];
  onPromote: (ids: string[], toClass: string, toSection: string, year: string) => void;
}

const HISTORY_KEY = "edumanage.promotions.history.v1";

interface PromotionEntry {
  ts: number;
  count: number;
  from: string;
  to: string;
  year: string;
}

function readHistory(): PromotionEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}

export function PromotionWizard({ open, onOpenChange, students, targetIds = [], onPromote }: Props) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"selected" | "class">(targetIds.length > 0 ? "selected" : "class");
  const [fromClass, setFromClass] = useState<string>(students[0]?.className ?? "10");
  const [toClass, setToClass] = useState<string>("11");
  const [toSection, setToSection] = useState<string>("A");
  const [year, setYear] = useState<string>("2026-2027");
  const [history, setHistory] = useState<PromotionEntry[]>(readHistory);

  const targeted = useMemo(() => {
    if (mode === "selected") return students.filter((s) => targetIds.includes(s.id));
    return students.filter((s) => s.className === fromClass && s.status === "active");
  }, [students, targetIds, mode, fromClass]);

  const classes = useMemo(() => Array.from(new Set(students.map((s) => s.className))).sort(), [students]);

  const submit = () => {
    const ids = targeted.map((s) => s.id);
    onPromote(ids, toClass, toSection, year);
    const entry: PromotionEntry = {
      ts: Date.now(),
      count: ids.length,
      from: mode === "selected" ? "Selected" : `Grade ${fromClass}`,
      to: `Grade ${toClass}-${toSection}`,
      year,
    };
    const next = [entry, ...history].slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    setHistory(next);
    toast.success(`${ids.length} student${ids.length !== 1 ? "s" : ""} promoted`);
    setStep(3);
  };

  const reset = () => { setStep(0); };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setTimeout(reset, 200); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Promotion wizard</DialogTitle>
          <DialogDescription>Move students to the next academic year, class, or section.</DialogDescription>
        </DialogHeader>

        <div className="mb-4 flex items-center justify-between gap-2">
          {["Scope", "Target", "Review", "Done"].map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${i <= step ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-xs ${i === step ? "font-medium" : "text-muted-foreground"}`}>{label}</span>
              {i < 3 && <div className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>
            {step === 0 && (
              <RadioGroup value={mode} onValueChange={(v) => setMode(v as any)} className="space-y-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                  <RadioGroupItem value="selected" disabled={targetIds.length === 0} />
                  <div>
                    <p className="font-medium">Promote selected students</p>
                    <p className="text-sm text-muted-foreground">{targetIds.length} student{targetIds.length !== 1 ? "s" : ""} currently selected in the roster.</p>
                  </div>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                  <RadioGroupItem value="class" />
                  <div className="flex-1">
                    <p className="font-medium">Promote an entire class</p>
                    <p className="text-sm text-muted-foreground">Bulk-move every active student in a grade.</p>
                    {mode === "class" && (
                      <div className="mt-3 max-w-[220px]">
                        <Select value={fromClass} onValueChange={setFromClass}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {classes.map((c) => <SelectItem key={c} value={c}>Grade {c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </label>
              </RadioGroup>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>New class</Label>
                  <Select value={toClass} onValueChange={setToClass}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["6", "7", "8", "9", "10", "11", "12"].map((c) => <SelectItem key={c} value={c}>Grade {c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>New section</Label>
                  <Select value={toSection} onValueChange={setToSection}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["A", "B", "C", "D"].map((c) => <SelectItem key={c} value={c}>Section {c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Academic year</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["2025-2026", "2026-2027", "2027-2028"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-3 rounded-xl border border-border bg-card p-4 text-sm">
                  <p className="mb-1 text-muted-foreground">Preview</p>
                  <p><span className="font-medium">{targeted.length}</span> student{targeted.length !== 1 ? "s" : ""} will move to <Badge variant="outline" className="border-primary/30 text-primary">Grade {toClass}-{toSection}</Badge> for {year}.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-4 text-sm">
                  <p className="mb-2 flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> {targeted.length} students in this promotion</p>
                  <div className="max-h-[220px] space-y-1 overflow-auto pr-1">
                    {targeted.slice(0, 100).map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-xs">
                        <span>{s.name}</span>
                        <span className="text-muted-foreground">Grade {s.className}-{s.section} → Grade {toClass}-{toSection}</span>
                      </div>
                    ))}
                    {targeted.length > 100 && <p className="text-xs text-muted-foreground">…and {targeted.length - 100} more</p>}
                  </div>
                </div>
                {history.length > 0 && (
                  <details className="rounded-xl border border-border bg-card p-3 text-sm">
                    <summary className="cursor-pointer text-muted-foreground"><History className="mr-1 inline h-3.5 w-3.5" /> Promotion history</summary>
                    <ul className="mt-2 space-y-1 text-xs">
                      {history.map((h) => (
                        <li key={h.ts} className="flex justify-between border-t border-border/60 py-1">
                          <span>{new Date(h.ts).toLocaleString()} · {h.count} students</span>
                          <span className="text-muted-foreground">{h.from} → {h.to} · {h.year}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                  <ArrowUp className="h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-semibold">Promotion complete</h3>
                <p className="mt-1 text-sm text-muted-foreground">{targeted.length} student{targeted.length !== 1 ? "s" : ""} moved to Grade {toClass}-{toSection}.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <DialogFooter>
          {step > 0 && step < 3 && (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
          )}
          {step < 2 && (
            <Button variant="hero" onClick={() => setStep((s) => s + 1)} disabled={targeted.length === 0}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
          {step === 2 && <Button variant="hero" onClick={submit}>Confirm promotion</Button>}
          {step === 3 && <Button variant="hero" onClick={() => onOpenChange(false)}>Close</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
