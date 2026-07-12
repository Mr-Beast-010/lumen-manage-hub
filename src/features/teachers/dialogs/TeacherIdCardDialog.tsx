import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, FileText, Sparkles, Users } from "lucide-react";
import type { TeacherRecord } from "../data";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  teacher?: TeacherRecord | null;
  batch?: TeacherRecord[];
}

export function TeacherIdCardDialog({ open, onOpenChange, teacher, batch }: Props) {
  const list = useMemo(() => (batch && batch.length > 0 ? batch : teacher ? [teacher] : []), [teacher, batch]);
  const [qrs, setQrs] = useState<Record<string, string>>({});
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (list.length === 0) return;
    Promise.all(
      list.map((t) =>
        QRCode.toDataURL(`${window.location.origin}/teachers/${t.id}`, {
          margin: 1, width: 200, color: { dark: "#0b1220", light: "#ffffff" },
        }).then((d) => [t.id, d] as const),
      ),
    ).then((entries) => setQrs(Object.fromEntries(entries)));
  }, [list]);

  if (list.length === 0) return null;

  const print = () => {
    const w = window.open("", "_blank", "width=1000,height=800");
    if (!w || !cardRef.current) return;
    w.document.write(`<html><head><title>ID Cards</title>
      <style>body{margin:0;padding:24px;background:#f1f5f9;font-family:system-ui}
      .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
      @media print { .grid { grid-template-columns: repeat(2, 1fr); } }
      </style></head><body>${cardRef.current.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: [340, 210] });
    list.forEach((t, idx) => {
      if (idx > 0) doc.addPage([340, 210], "landscape");
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 340, 210, "F");
      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("EDUMANAGE ACADEMY", 20, 26);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(180, 200, 230);
      doc.text("Staff Identification", 20, 40);
      doc.setDrawColor(60, 100, 220);
      doc.setLineWidth(0.5);
      doc.line(20, 50, 320, 50);

      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(t.name, 20, 74);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(180, 200, 230);
      const rows: [string, string][] = [
        ["Emp ID", t.employeeId],
        ["Department", t.department],
        ["Designation", t.designation],
        ["Joined", t.joinedOn],
      ];
      rows.forEach(([k, v], i) => {
        doc.text(`${k}:`, 20, 94 + i * 14);
        doc.setTextColor(255);
        doc.text(String(v), 90, 94 + i * 14);
        doc.setTextColor(180, 200, 230);
      });
      const qr = qrs[t.id];
      if (qr) doc.addImage(qr, "PNG", 250, 65, 70, 70);
      doc.setFontSize(7);
      doc.setTextColor(140, 160, 200);
      doc.text("Valid AY 2025–2026 · EduManage Academy · 200 Learning Ave", 20, 195);
    });
    doc.save(list.length > 1 ? `staff-id-cards-${Date.now()}.pdf` : `id-${list[0].employeeId}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {list.length > 1 ? <><Users className="h-5 w-5" /> Batch ID cards ({list.length})</> : "Staff ID card"}
          </DialogTitle>
        </DialogHeader>

        <div ref={cardRef} className="grid gap-4 overflow-y-auto py-4 md:grid-cols-2">
          {list.map((t) => (
            <div key={t.id} className="space-y-3">
              {/* Front */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-5 text-white shadow-elegant" style={{ aspectRatio: "1.586" }}>
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/30 blur-3xl" />
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">EduManage Academy</p>
                      <p className="text-[9px] text-white/50">Staff Identification</p>
                    </div>
                  </div>
                  {qrs[t.id] && <img src={qrs[t.id]} alt="QR" className="h-14 w-14 rounded-md bg-white p-1" />}
                </div>
                <div className="mt-4 flex gap-4">
                  <img src={t.photo} alt="" className="h-20 w-20 rounded-lg bg-white/10 ring-2 ring-white/20" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-bold">{t.name}</p>
                    <p className="text-[11px] text-white/60">{t.employeeId}</p>
                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                      <Field k="Dept" v={t.department} />
                      <Field k="Role" v={t.designation} />
                      <Field k="Joined" v={t.joinedOn.slice(0, 7)} />
                      <Field k="Type" v={t.type} />
                    </div>
                  </div>
                </div>
                <p className="absolute bottom-3 right-4 text-[9px] text-white/40">ID: {t.id}</p>
              </div>

              {/* Back */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-elegant" style={{ aspectRatio: "1.586" }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Card holder</p>
                <div className="mt-3 space-y-1.5 text-xs">
                  <p><span className="text-muted-foreground">Address:</span> 200 Learning Avenue, Springfield</p>
                  <p><span className="text-muted-foreground">Emergency:</span> +1 (555) 000-9111</p>
                  <p><span className="text-muted-foreground">Email:</span> {t.email}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {t.phone}</p>
                </div>
                <div className="mt-3 rounded-lg border border-dashed border-border p-2 text-[10px] leading-relaxed text-muted-foreground">
                  Property of EduManage Academy. If found, return to the address above.
                  Non-transferable. Valid for AY 2025–2026.
                </div>
                <p className="absolute bottom-3 right-4 text-[9px] text-muted-foreground">Scan QR to view profile</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={print}><Printer className="mr-1 h-4 w-4" /> {list.length > 1 ? "Print batch" : "Print"}</Button>
          <Button variant="hero" onClick={downloadPDF}><FileText className="mr-1 h-4 w-4" /> Download PDF</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-white/50">{k}</p>
      <p className="truncate font-medium capitalize">{v}</p>
    </div>
  );
}
