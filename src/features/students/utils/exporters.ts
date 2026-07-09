import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import type { StudentRecord } from "../data";

const cols: (keyof StudentRecord)[] = [
  "admissionNo", "rollNo", "name", "gender", "className", "section",
  "email", "phone", "dob", "admissionDate", "attendance", "feeStatus",
  "status", "guardian",
];

const headers = ["Admission No", "Roll No", "Name", "Gender", "Class", "Section", "Email", "Phone", "DOB", "Admission Date", "Attendance %", "Fee Status", "Status", "Guardian"];

function toRows(rows: StudentRecord[]) {
  return rows.map((r) => cols.map((c) => r[c] as string | number));
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportStudentsCSV(rows: StudentRecord[], name = "students") {
  const csv = [headers, ...toRows(rows)]
    .map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  download(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${name}-${Date.now()}.csv`);
}

export function exportStudentsXLSX(rows: StudentRecord[], name = "students") {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...toRows(rows)]);
  ws["!cols"] = headers.map(() => ({ wch: 16 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  XLSX.writeFile(wb, `${name}-${Date.now()}.xlsx`);
}

export function exportStudentsPDF(rows: StudentRecord[], name = "students") {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("EduManage — Student Report", 40, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`${rows.length} records · Generated ${new Date().toLocaleString()}`, 40, 58);

  const columns = ["Admission", "Roll", "Name", "Class", "Attendance", "Fee", "Status"];
  const colX = [40, 130, 180, 340, 420, 520, 600];
  let y = 90;
  doc.setFillColor(240, 244, 248);
  doc.rect(35, y - 14, pageW - 70, 20, "F");
  doc.setTextColor(60);
  doc.setFont("helvetica", "bold");
  columns.forEach((c, i) => doc.text(c, colX[i], y));
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30);
  y += 18;

  rows.forEach((r) => {
    if (y > 540) {
      doc.addPage();
      y = 50;
    }
    const cells = [r.admissionNo, r.rollNo, r.name, `${r.className}-${r.section}`, `${r.attendance}%`, r.feeStatus, r.status];
    cells.forEach((c, i) => doc.text(String(c), colX[i], y));
    y += 16;
  });

  doc.save(`${name}-${Date.now()}.pdf`);
}

export const templateHeaders = headers;
export const templateSampleRow = [
  "ADM-2026-0001", "001", "Jane Doe", "female", "10", "A",
  "jane@example.com", "+1 555 000 0000", "2010-04-15", "2024-06-01",
  95, "paid", "active", "John Doe",
];

export function downloadImportTemplate(format: "csv" | "xlsx") {
  if (format === "csv") {
    const csv = [templateHeaders, templateSampleRow]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    download(new Blob([csv], { type: "text/csv;charset=utf-8" }), `student-import-template.csv`);
  } else {
    const ws = XLSX.utils.aoa_to_sheet([templateHeaders, templateSampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `student-import-template.xlsx`);
  }
}
