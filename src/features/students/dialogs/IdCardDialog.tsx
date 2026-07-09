import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, FileText } from "lucide-react";
import { Sparkles } from "lucide-react";
import type { StudentRecord } from "../data";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student: StudentRecord | null;
}

export function IdCardDialog({ open, onOpenChange, student }: Props) {
  const [qr, setQr] = useState<string>("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!student) return;
    const url = `${window.location.origin}/students/${student.id}`;
    QRCode.toDataURL(url, { margin: 1, width: 240, color: { dark: "#0b1220", light: "#ffffff" } }).then(setQr);
  }, [student]);

  if (!student) return null;

  const print = () => {
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w || !cardRef.current) return;
    w.document.write(`<html><head><title>ID · ${student.name}</title>
      <style>body{margin:0;padding:24px;background:#f1f5f9;font-family:system-ui}</style>
      </head><body>${cardRef.current.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: [340, 210] });
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 340, 210, "F");
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("EDUMANAGE ACADEMY", 20, 26);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 200, 230);
    doc.text("Student Identification", 20, 40);
    doc.setDrawColor(60, 100, 220);
    doc.setLineWidth(0.5);
    doc.line(20, 50, 320, 50);

    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(student.name, 20, 76);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(180, 200, 230);
    const rows = [
      ["Admission", student.admissionNo],
      ["Roll No", student.rollNo],
      ["Class", `${student.className}-${student.section}`],
      ["Blood", "O+"],
      ["Guardian", student.guardian],
    ];
    rows.forEach(([k, v], i) => {
      doc.text(`${k}:`, 20, 96 + i * 14);
      doc.setTextColor(255);
      doc.text(String(v), 80, 96 + i * 14);
      doc.setTextColor(180, 200, 230);
    });
    if (qr) doc.addImage(qr, "PNG", 250, 65, 70, 70);
    doc.setFontSize(7);
    doc.setTextColor(140, 160, 200);
    doc.text("If found, return to EduManage Academy · 200 Learning Ave", 20, 195);
    doc.save(`id-${student.admissionNo}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Student ID card</DialogTitle>
        </DialogHeader>

        <div ref={cardRef} className="grid gap-6 py-4 md:grid-cols-2">
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
                  <p className="text-[9px] text-white/50">Student Identification</p>
                </div>
              </div>
              {qr && <img src={qr} alt="QR" className="h-14 w-14 rounded-md bg-white p-1" />}
            </div>
            <div className="mt-4 flex gap-4">
              <img src={student.photo} alt="" className="h-20 w-20 rounded-lg bg-white/10 ring-2 ring-white/20" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold">{student.name}</p>
                <p className="text-[11px] text-white/60">{student.admissionNo}</p>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                  <Field k="Roll" v={student.rollNo} />
                  <Field k="Class" v={`${student.className}-${student.section}`} />
                  <Field k="Blood" v="O+" />
                  <Field k="DOB" v={student.dob} />
                </div>
              </div>
            </div>
            <p className="absolute bottom-3 right-4 text-[9px] text-white/40">ID: {student.id}</p>
          </div>

          {/* Back */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-elegant" style={{ aspectRatio: "1.586" }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Card holder details</p>
            <div className="mt-3 space-y-2 text-xs">
              <p><span className="text-muted-foreground">Address:</span> 200 Learning Avenue, Springfield</p>
              <p><span className="text-muted-foreground">Emergency:</span> +1 (555) 000-9111</p>
              <p><span className="text-muted-foreground">Guardian:</span> {student.guardian}</p>
              <p><span className="text-muted-foreground">Contact:</span> {student.phone}</p>
            </div>
            <div className="mt-3 rounded-lg border border-dashed border-border p-2 text-[10px] leading-relaxed text-muted-foreground">
              This card is the property of EduManage Academy. If found, please return to the address above. Loss must be reported within 48 hours.
              Non-transferable. Valid for the academic year 2025–2026.
            </div>
            <p className="absolute bottom-3 right-4 text-[9px] text-muted-foreground">Scan QR to view profile</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={print}><Printer className="mr-1 h-4 w-4" /> Print</Button>
          <Button variant="outline" onClick={downloadPDF}><FileText className="mr-1 h-4 w-4" /> Download PDF</Button>
          {qr && (
            <a href={qr} download={`qr-${student.admissionNo}.png`}>
              <Button variant="hero"><Download className="mr-1 h-4 w-4" /> QR Code</Button>
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-white/50">{k}</p>
      <p className="font-medium">{v}</p>
    </div>
  );
}
