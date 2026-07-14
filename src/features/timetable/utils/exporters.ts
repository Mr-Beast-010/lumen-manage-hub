import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import {
  DAYS, PERIODS, type TimetableSlot, getSubject, getTeacher, getClassroom,
} from "@/features/timetable/data";
import { toast } from "sonner";

const rowsFromSlots = (slots: TimetableSlot[]) =>
  slots.map((s) => ({
    Day: s.day,
    Period: PERIODS.find((p) => p.id === s.periodId)?.label ?? s.periodId,
    Time: (() => {
      const p = PERIODS.find((p) => p.id === s.periodId);
      return p ? `${p.start}-${p.end}` : "";
    })(),
    Class: s.classId,
    Subject: getSubject(s.subjectCode)?.name ?? s.subjectCode,
    Teacher: getTeacher(s.teacherId)?.name ?? s.teacherId,
    Room: getClassroom(s.roomId)?.name ?? s.roomId,
  }));

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export function exportTimetableCSV(slots: TimetableSlot[], filename = "timetable.csv") {
  const rows = rowsFromSlots(slots);
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  download(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
  toast.success(`Exported ${rows.length} periods to CSV`);
}

export function exportTimetableXLSX(slots: TimetableSlot[], filename = "timetable.xlsx") {
  const rows = rowsFromSlots(slots);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Timetable");
  XLSX.writeFile(wb, filename);
  toast.success(`Exported ${rows.length} periods to Excel`);
}

export function exportTimetablePDF(slots: TimetableSlot[], title = "Timetable", filename = "timetable.pdf") {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFontSize(16);
  doc.text(title, 40, 40);
  doc.setFontSize(9);
  doc.text(`Generated ${new Date().toLocaleString()}`, 40, 56);

  const startX = 40;
  const startY = 80;
  const colW = 108;
  const rowH = 46;
  const headerH = 26;

  // header row
  doc.setFillColor(240, 240, 245);
  doc.rect(startX, startY, colW, headerH, "F");
  doc.setFontSize(10);
  doc.text("Period", startX + 6, startY + 17);
  DAYS.forEach((d, i) => {
    doc.rect(startX + colW * (i + 1), startY, colW, headerH, "F");
    doc.text(d, startX + colW * (i + 1) + 6, startY + 17);
  });

  PERIODS.forEach((p, r) => {
    const y = startY + headerH + r * rowH;
    doc.setDrawColor(200);
    doc.rect(startX, y, colW, rowH);
    doc.setFontSize(9);
    doc.text(p.label, startX + 6, y + 16);
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text(`${p.start}-${p.end}`, startX + 6, y + 30);
    doc.setTextColor(0);

    DAYS.forEach((d, c) => {
      const x = startX + colW * (c + 1);
      doc.rect(x, y, colW, rowH);
      const cell = slots.find((s) => s.day === d && s.periodId === p.id);
      if (cell) {
        doc.setFontSize(8);
        doc.text(String(getSubject(cell.subjectCode)?.name ?? cell.subjectCode).slice(0, 18), x + 4, y + 14);
        doc.setFontSize(7);
        doc.setTextColor(90);
        doc.text(String(getTeacher(cell.teacherId)?.name ?? "").slice(0, 22), x + 4, y + 26);
        doc.text(String(getClassroom(cell.roomId)?.name ?? cell.roomId).slice(0, 22), x + 4, y + 38);
        doc.setTextColor(0);
      }
    });
  });

  doc.save(filename);
  toast.success("Timetable exported to PDF");
}

export function downloadTimetableTemplateCSV() {
  const sample = "Day,Period,Class,SubjectCode,TeacherId,RoomId\nMon,P1,10-A,MTH-01,T-001,R-101\n";
  download(new Blob([sample], { type: "text/csv" }), "timetable-template.csv");
  toast.success("Template downloaded");
}
