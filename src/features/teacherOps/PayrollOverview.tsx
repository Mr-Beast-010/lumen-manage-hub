import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Wallet, TrendingUp, TrendingDown, Coins, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { OverviewMetric } from "@/features/students/profile/OverviewMetric";
import { teacherRecords } from "@/features/teachers/data";
import { payslipsFor, payslipNet, type PayslipRecord } from "./data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const monthLabel = (m: string) => {
  const [y, mm] = m.split("-").map(Number);
  return new Date(y, mm - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
};

const fmt = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function PayrollOverview() {
  const [teacherId, setTeacherId] = useState(teacherRecords[0]?.id ?? "");
  const [year, setYear] = useState("2026");
  const [viewing, setViewing] = useState<PayslipRecord | null>(null);

  const teacher = teacherRecords.find((t) => t.id === teacherId) ?? teacherRecords[0];
  const slips = useMemo(() => payslipsFor(teacher).filter((p) => p.month.startsWith(year)), [teacher, year]);
  const current = slips[slips.length - 1];
  const totals = useMemo(() => {
    if (!current) return { gross: 0, deductions: 0, net: 0, allowances: 0, bonuses: 0 };
    const { gross, deductions, net } = payslipNet(current);
    return {
      gross, deductions, net,
      allowances: current.hra + current.transport + current.medical,
      bonuses: current.bonus,
    };
  }, [current]);

  const downloadPayslip = (p: PayslipRecord) => {
    const { gross, deductions, net } = payslipNet(p);
    const lines = [
      `EDUMANAGE PAYSLIP`,
      `================================`,
      `Employee: ${teacher.name} (${teacher.employeeId})`,
      `Department: ${teacher.department}`,
      `Designation: ${teacher.designation}`,
      `Period: ${monthLabel(p.month)}`,
      ``,
      `EARNINGS`,
      `  Basic Salary        ${fmt(p.basic)}`,
      `  HRA                 ${fmt(p.hra)}`,
      `  Transport Allowance ${fmt(p.transport)}`,
      `  Medical Allowance   ${fmt(p.medical)}`,
      `  Bonus               ${fmt(p.bonus)}`,
      `  Gross               ${fmt(gross)}`,
      ``,
      `DEDUCTIONS`,
      `  Tax                 ${fmt(p.tax)}`,
      `  Provident Fund      ${fmt(p.pf)}`,
      `  Other               ${fmt(p.other)}`,
      `  Total Deductions    ${fmt(deductions)}`,
      ``,
      `NET SALARY            ${fmt(net)}`,
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payslip-${teacher.employeeId}-${p.month}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Payslip downloaded");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Payroll Overview</h2>
          <p className="text-sm text-muted-foreground">View and download payslips</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={teacherId} onValueChange={setTeacherId}>
            <SelectTrigger className="w-64" aria-label="Select teacher"><SelectValue /></SelectTrigger>
            <SelectContent>
              {teacherRecords.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-28" aria-label="Filter by year"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["2024","2025","2026"].map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <OverviewMetric label="Monthly Salary" value={fmt(current?.basic ?? 0)} icon={Wallet} tone="primary" index={0} />
        <OverviewMetric label="Allowances" value={fmt(totals.allowances)} icon={TrendingUp} tone="success" index={1} />
        <OverviewMetric label="Deductions" value={fmt(totals.deductions)} icon={TrendingDown} tone="destructive" index={2} />
        <OverviewMetric label="Bonuses" value={fmt(totals.bonuses)} icon={Coins} tone="accent" index={3} />
        <OverviewMetric label="Net Salary" value={fmt(totals.net)} icon={Wallet} tone="success" index={4} />
      </div>

      <section className="rounded-2xl border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-display text-base font-semibold">Salary History</h3>
          <span className="text-xs text-muted-foreground">{slips.length} payslip(s)</span>
        </header>
        <ul className="divide-y divide-border" role="list">
          {slips.slice().reverse().map((p, i) => {
            const { gross, deductions, net } = payslipNet(p);
            return (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.3) }}
                className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{monthLabel(p.month)}</p>
                    <p className="text-xs text-muted-foreground">Gross {fmt(gross)} · Deductions {fmt(deductions)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right">
                    <p className="font-display text-lg font-semibold">{fmt(net)}</p>
                    <Badge variant="outline" className={cn(
                      "capitalize",
                      p.status === "paid" && "bg-success/10 text-success border-success/20",
                      p.status === "processing" && "bg-warning/10 text-warning border-warning/20",
                      p.status === "pending" && "bg-muted text-muted-foreground border-border",
                    )}>
                      {p.status}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setViewing(p)}>
                    <Eye className="mr-1 h-4 w-4" /> View
                  </Button>
                  <Button size="sm" variant="hero" onClick={() => downloadPayslip(p)}>
                    <Download className="mr-1 h-4 w-4" /> PDF
                  </Button>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </section>

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Payslip · {viewing ? monthLabel(viewing.month) : ""}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl bg-secondary/40 p-3">
                <p className="font-medium">{teacher.name}</p>
                <p className="text-xs text-muted-foreground">{teacher.employeeId} · {teacher.department}</p>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Earnings</p>
                <PayRow label="Basic" value={viewing.basic} />
                <PayRow label="HRA" value={viewing.hra} />
                <PayRow label="Transport" value={viewing.transport} />
                <PayRow label="Medical" value={viewing.medical} />
                <PayRow label="Bonus" value={viewing.bonus} />
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Deductions</p>
                <PayRow label="Tax" value={viewing.tax} negative />
                <PayRow label="Provident Fund" value={viewing.pf} negative />
                <PayRow label="Other" value={viewing.other} negative />
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Net Salary</span>
                  <span className="font-display text-xl font-bold">{fmt(payslipNet(viewing).net)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setViewing(null)}>Close</Button>
            {viewing && <Button variant="hero" onClick={() => downloadPayslip(viewing)}><Download className="mr-1 h-4 w-4" /> Download</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PayRow({ label, value, negative }: { label: string; value: number; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium tabular-nums", negative && "text-destructive")}>
        {negative ? "-" : ""}{fmt(value)}
      </span>
    </div>
  );
}
