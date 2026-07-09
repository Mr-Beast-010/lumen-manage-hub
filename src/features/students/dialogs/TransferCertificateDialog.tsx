import { useRef, useState } from "react";
import jsPDF from "jspdf";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Printer, FileText } from "lucide-react";
import type { StudentRecord } from "../data";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student: StudentRecord | null;
}

export function TransferCertificateDialog({ open, onOpenChange, student }: Props) {
  const [reason, setReason] = useState("Relocation of family to another city");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [principal, setPrincipal] = useState("Dr. Amelia Diaz");
  const certRef = useRef<HTMLDivElement>(null);

  if (!student) return null;

  const print = () => {
    if (!certRef.current) return;
    const w = window.open("", "_blank", "width=900,height=1200");
    if (!w) return;
    w.document.write(`<html><head><title>TC · ${student.name}</title>
      <style>body{margin:0;padding:36px;font-family:'Times New Roman',serif;color:#111}</style>
      </head><body>${certRef.current.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.text("EDUMANAGE ACADEMY", w / 2, 60, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text("200 Learning Avenue · Springfield · Est. 1998", w / 2, 78, { align: "center" });
    doc.setLineWidth(1);
    doc.line(60, 92, w - 60, 92);
    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.text("TRANSFER CERTIFICATE", w / 2, 130, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("times", "normal");
    doc.text(`Serial No: TC/${new Date().getFullYear()}/${student.id}`, 60, 160);
    doc.text(`Issue Date: ${issueDate}`, w - 60, 160, { align: "right" });

    doc.setFontSize(11);
    let y = 200;
    const line = (k: string, v: string) => {
      doc.setFont("times", "bold"); doc.text(`${k}:`, 60, y);
      doc.setFont("times", "normal"); doc.text(v, 220, y);
      y += 22;
    };
    line("Name of Student", student.name);
    line("Admission Number", student.admissionNo);
    line("Roll Number", student.rollNo);
    line("Class / Section", `Grade ${student.className}-${student.section}`);
    line("Date of Birth", student.dob);
    line("Date of Admission", student.admissionDate);
    line("Guardian", student.guardian);
    line("Reason for Transfer", reason);

    y += 20;
    doc.setFont("times", "italic");
    const body = "The above information is correct as per school records. The student has been granted a transfer certificate on the date mentioned above and bears no dues towards the institution.";
    const wrapped = doc.splitTextToSize(body, w - 120);
    doc.text(wrapped, 60, y);

    y += 100;
    doc.setFont("times", "normal");
    doc.setLineWidth(0.5);
    doc.line(60, y, 220, y);
    doc.line(w - 220, y, w - 60, y);
    doc.setFontSize(9);
    doc.text("School Seal", 140, y + 14, { align: "center" });
    doc.text(principal, w - 140, y + 14, { align: "center" });
    doc.text("Principal", w - 140, y + 26, { align: "center" });

    doc.save(`transfer-certificate-${student.admissionNo}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Transfer certificate</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <div className="space-y-3">
            <div>
              <Label>Reason</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="mt-1" />
            </div>
            <div>
              <Label>Issue date</Label>
              <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Principal</Label>
              <Input value={principal} onChange={(e) => setPrincipal(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div ref={certRef} className="rounded-xl border border-border bg-white p-8 text-slate-900 shadow-elegant">
            <div className="text-center">
              <h2 className="font-serif text-2xl font-bold tracking-wide">EDUMANAGE ACADEMY</h2>
              <p className="text-xs text-slate-500">200 Learning Avenue · Springfield · Est. 1998</p>
              <div className="my-4 h-px bg-slate-300" />
              <h3 className="font-serif text-lg font-bold uppercase tracking-widest">Transfer Certificate</h3>
            </div>
            <div className="mt-4 flex justify-between text-xs text-slate-600">
              <span>Serial: TC/{new Date().getFullYear()}/{student.id}</span>
              <span>Issue Date: {issueDate}</span>
            </div>
            <dl className="mt-4 space-y-1.5 text-sm">
              <Row k="Name" v={student.name} />
              <Row k="Admission No" v={student.admissionNo} />
              <Row k="Class / Section" v={`Grade ${student.className}-${student.section}`} />
              <Row k="Date of Birth" v={student.dob} />
              <Row k="Guardian" v={student.guardian} />
              <Row k="Reason" v={reason} />
            </dl>
            <p className="mt-4 text-xs italic text-slate-600">
              The above information is correct as per school records. The student bears no dues towards the institution.
            </p>
            <div className="mt-10 flex justify-between text-xs">
              <div className="text-center">
                <div className="mb-1 h-8 border-b border-slate-400 w-40" />
                School Seal
              </div>
              <div className="text-center">
                <div className="mb-1 h-8 border-b border-slate-400 w-40" />
                {principal} · Principal
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={print}><Printer className="mr-1 h-4 w-4" /> Print</Button>
          <Button variant="hero" onClick={downloadPDF}><FileText className="mr-1 h-4 w-4" /> Download PDF</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2 border-b border-slate-200 py-1">
      <dt className="font-semibold text-slate-700">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
