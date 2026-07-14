import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { toast } from "sonner";

const dl = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
};

export interface ReportRow { [k: string]: string | number; }

export function exportCSV(rows: ReportRow[], filename = "report.csv") {
  const ws = XLSX.utils.json_to_sheet(rows);
  dl(new Blob([XLSX.utils.sheet_to_csv(ws)], { type: "text/csv;charset=utf-8;" }), filename);
  toast.success(`Exported ${rows.length} rows to CSV`);
}

export function exportXLSX(rows: ReportRow[], filename = "report.xlsx", sheet = "Report") {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), sheet);
  XLSX.writeFile(wb, filename);
  toast.success(`Exported ${rows.length} rows to Excel`);
}

export function exportPDF(title: string, rows: ReportRow[], filename = "report.pdf") {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFontSize(16);
  doc.text(title, 40, 40);
  doc.setFontSize(9);
  doc.text(`Generated ${new Date().toLocaleString()} · ${rows.length} rows`, 40, 56);

  if (!rows.length) { doc.text("No records.", 40, 90); doc.save(filename); return; }

  const cols = Object.keys(rows[0]);
  const colW = Math.min(140, Math.floor((doc.internal.pageSize.getWidth() - 80) / cols.length));
  const startX = 40; let y = 84;

  doc.setFillColor(240, 240, 245);
  doc.rect(startX, y, colW * cols.length, 22, "F");
  doc.setFontSize(9);
  cols.forEach((c, i) => doc.text(String(c).slice(0, 20), startX + i * colW + 6, y + 15));
  y += 22;

  doc.setFontSize(8);
  rows.forEach((r) => {
    if (y > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); y = 40; }
    cols.forEach((c, i) => {
      doc.rect(startX + i * colW, y, colW, 20);
      doc.text(String(r[c] ?? "").slice(0, 22), startX + i * colW + 6, y + 14);
    });
    y += 20;
  });

  doc.save(filename);
  toast.success("Report exported to PDF");
}
