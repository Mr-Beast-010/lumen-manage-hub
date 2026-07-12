import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, PlaneTakeoff, Wallet, Briefcase, Building2, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { toast } from "sonner";
import type { TeacherRecord } from "./data";
import { logAudit } from "./audit";

interface Props { rows: TeacherRecord[] }

type ReportKey = "attendance" | "leave" | "payroll" | "workload" | "department";

const reports: { key: ReportKey; title: string; desc: string; icon: any; color: string }[] = [
  { key: "attendance", title: "Attendance Report", desc: "Attendance % per staff member.", icon: CalendarCheck, color: "text-primary" },
  { key: "leave", title: "Leave Report", desc: "Leave status and balances snapshot.", icon: PlaneTakeoff, color: "text-warning" },
  { key: "payroll", title: "Payroll Summary", desc: "Salary estimate by department.", icon: Wallet, color: "text-success" },
  { key: "workload", title: "Workload Report", desc: "Classes & subjects per teacher.", icon: Briefcase, color: "text-accent" },
  { key: "department", title: "Department Report", desc: "Headcount and metrics by dept.", icon: Building2, color: "text-primary" },
];

function buildReport(key: ReportKey, rows: TeacherRecord[]): { headers: string[]; body: (string | number)[][] } {
  switch (key) {
    case "attendance":
      return {
        headers: ["Emp ID", "Name", "Department", "Attendance %", "Status"],
        body: rows.map((r) => [r.employeeId, r.name, r.department, r.attendance, r.status]),
      };
    case "leave":
      return {
        headers: ["Emp ID", "Name", "Status", "Department"],
        body: rows.map((r) => [r.employeeId, r.name, r.status, r.department]),
      };
    case "payroll": {
      const map = new Map<string, { count: number; total: number }>();
      rows.forEach((r) => {
        const salary = 25000 + r.experience * 1500;
        const entry = map.get(r.department) ?? { count: 0, total: 0 };
        entry.count += 1; entry.total += salary;
        map.set(r.department, entry);
      });
      return {
        headers: ["Department", "Staff", "Total Salary", "Avg Salary"],
        body: Array.from(map.entries()).map(([d, v]) => [d, v.count, v.total, Math.round(v.total / v.count)]),
      };
    }
    case "workload":
      return {
        headers: ["Emp ID", "Name", "Classes", "Subjects", "Total Load"],
        body: rows.map((r) => [r.employeeId, r.name, r.classes.join("|"), r.subjects.join("|"), r.classes.length + r.subjects.length]),
      };
    case "department": {
      const map = new Map<string, TeacherRecord[]>();
      rows.forEach((r) => {
        const l = map.get(r.department) ?? []; l.push(r); map.set(r.department, l);
      });
      return {
        headers: ["Department", "Headcount", "Avg Experience", "Avg Attendance"],
        body: Array.from(map.entries()).map(([d, list]) => [
          d, list.length,
          Math.round((list.reduce((s, r) => s + r.experience, 0) / list.length) * 10) / 10,
          Math.round(list.reduce((s, r) => s + r.attendance, 0) / list.length),
        ]),
      };
    }
  }
}

export function StaffReports({ rows }: Props) {
  const [busy, setBusy] = useState<string | null>(null);

  const doExport = async (key: ReportKey, format: "xlsx" | "pdf") => {
    setBusy(`${key}-${format}`);
    try {
      const { headers, body } = buildReport(key, rows);
      const title = reports.find((r) => r.key === key)!.title;
      if (format === "xlsx") {
        const ws = XLSX.utils.aoa_to_sheet([headers, ...body]);
        ws["!cols"] = headers.map(() => ({ wch: 20 }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 28));
        XLSX.writeFile(wb, `${key}-report-${Date.now()}.xlsx`);
      } else {
        const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(`EduManage — ${title}`, 40, 40);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(`${body.length} rows · Generated ${new Date().toLocaleString()}`, 40, 58);
        doc.setTextColor(30);

        const colX = headers.map((_, i) => 40 + i * ((doc.internal.pageSize.getWidth() - 80) / headers.length));
        let y = 90;
        doc.setFillColor(240, 244, 248);
        doc.rect(35, y - 14, doc.internal.pageSize.getWidth() - 70, 20, "F");
        doc.setFont("helvetica", "bold");
        headers.forEach((h, i) => doc.text(String(h), colX[i], y));
        doc.setFont("helvetica", "normal");
        y += 18;
        body.forEach((row) => {
          if (y > 540) { doc.addPage(); y = 50; }
          row.forEach((c, i) => doc.text(String(c).slice(0, 40), colX[i], y));
          y += 16;
        });
        doc.save(`${key}-report-${Date.now()}.pdf`);
      }
      logAudit({ actor: "Admin", category: "export", action: `Exported ${title}`, details: `${body.length} rows · ${format.toUpperCase()}` });
      toast.success(`${title} exported`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-lg font-semibold">Staff reports</h3>
        <p className="text-sm text-muted-foreground">Generate downloadable reports as Excel or PDF.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((r, i) => (
          <motion.div key={r.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="rounded-2xl">
              <CardContent className="p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ${r.color}`}>
                  <r.icon className="h-5 w-5" />
                </div>
                <h4 className="mt-3 font-display font-semibold">{r.title}</h4>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" disabled={busy === `${r.key}-xlsx`} onClick={() => doExport(r.key, "xlsx")}>
                    <FileSpreadsheet className="mr-1 h-3 w-3" /> Excel
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy === `${r.key}-pdf`} onClick={() => doExport(r.key, "pdf")}>
                    <FileText className="mr-1 h-3 w-3" /> PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
