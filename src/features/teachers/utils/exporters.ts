import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import type { TeacherRecord } from "../data";

const cols: (keyof TeacherRecord)[] = [
  "employeeId", "name", "gender", "type", "department", "designation",
  "subjects", "classes", "email", "phone", "dob", "joinedOn",
  "experience", "attendance", "rating", "status",
];

export const teacherHeaders = [
  "Employee ID", "Name", "Gender", "Type", "Department", "Designation",
  "Subjects", "Classes", "Email", "Phone", "DOB", "Joined On",
  "Experience", "Attendance %", "Rating", "Status",
];

function toRows(rows: TeacherRecord[]) {
  return rows.map((r) => cols.map((c) => {
    const v = r[c];
    return Array.isArray(v) ? v.join("|") : (v as string | number);
  }));
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTeachersCSV(rows: TeacherRecord[], name = "teachers") {
  const csv = [teacherHeaders, ...toRows(rows)]
    .map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  download(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${name}-${Date.now()}.csv`);
}

export function exportTeachersXLSX(rows: TeacherRecord[], name = "teachers") {
  const ws = XLSX.utils.aoa_to_sheet([teacherHeaders, ...toRows(rows)]);
  ws["!cols"] = teacherHeaders.map(() => ({ wch: 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Teachers");
  XLSX.writeFile(wb, `${name}-${Date.now()}.xlsx`);
}

export function exportTeachersPDF(rows: TeacherRecord[], name = "teachers", title = "EduManage — Teacher Report") {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, 40, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`${rows.length} records · Generated ${new Date().toLocaleString()}`, 40, 58);

  const columns = ["Emp ID", "Name", "Department", "Designation", "Exp", "Att%", "Status"];
  const colX = [40, 130, 260, 400, 530, 590, 660];
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
    if (y > 540) { doc.addPage(); y = 50; }
    const cells = [r.employeeId, r.name, r.department, r.designation, `${r.experience}y`, `${r.attendance}%`, r.status];
    cells.forEach((c, i) => doc.text(String(c), colX[i], y));
    y += 16;
  });

  doc.save(`${name}-${Date.now()}.pdf`);
}

export const teacherTemplateSample = [
  "EMP1001", "Jane Doe", "female", "teaching", "Mathematics", "Senior Teacher",
  "Algebra|Geometry", "10-A|10-B", "jane@edumanage.io", "+1 555 000 0000",
  "1985-04-15", "2018-06-01", 8, 96, 4.6, "active",
];

export function downloadTeacherTemplate(format: "csv" | "xlsx") {
  if (format === "csv") {
    const csv = [teacherHeaders, teacherTemplateSample]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    download(new Blob([csv], { type: "text/csv;charset=utf-8" }), `teacher-import-template.csv`);
  } else {
    const ws = XLSX.utils.aoa_to_sheet([teacherHeaders, teacherTemplateSample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `teacher-import-template.xlsx`);
  }
}
