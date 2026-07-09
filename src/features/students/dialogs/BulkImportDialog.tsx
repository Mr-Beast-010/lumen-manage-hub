import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { autoMap, importFields, parseImportFile, validateRows, type ParseResult } from "../utils/importer";
import { downloadImportTemplate } from "../utils/exporters";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { StudentRecord } from "../data";

type Step = "upload" | "map" | "review" | "importing" | "done";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImport: (rows: Partial<StudentRecord>[]) => void;
}

export function BulkImportDialog({ open, onOpenChange, onImport }: Props) {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ParseResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const reset = () => {
    setStep("upload"); setFile(null); setHeaders([]); setRawRows([]);
    setMapping({}); setResult(null); setProgress(0);
  };

  const handleFile = useCallback(async (f: File) => {
    try {
      setFile(f);
      const { headers, rows } = await parseImportFile(f);
      if (!rows.length) {
        toast.error("File appears to be empty");
        return;
      }
      setHeaders(headers);
      setRawRows(rows);
      setMapping(autoMap(headers));
      setStep("map");
    } catch (e) {
      toast.error("Could not read file. Use CSV or XLSX.");
    }
  }, []);

  const runValidation = () => {
    const r = validateRows(rawRows, mapping);
    setResult(r);
    setStep("review");
  };

  const runImport = async () => {
    if (!result) return;
    setStep("importing");
    setProgress(0);
    const valid = result.rows.filter((r) => r.errors.length === 0).map((r) => r.mapped);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((res) => setTimeout(res, 60));
      setProgress(i);
    }
    onImport(valid);
    setStep("done");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setTimeout(reset, 200); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bulk import students</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file. We'll auto-map columns and validate every row before import.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault(); setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-smooth",
                dragging ? "border-primary bg-primary/5" : "border-border bg-card/40",
              )}
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Upload className="h-7 w-7" />
              </div>
              <p className="font-medium">Drag & drop file here</p>
              <p className="mb-4 text-sm text-muted-foreground">CSV or XLSX up to 5 MB</p>
              <label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="sr-only"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <Button asChild variant="outline"><span>Browse files</span></Button>
              </label>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                Need a starting point? Download our sample template.
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => downloadImportTemplate("csv")}><Download className="mr-1 h-3 w-3" /> CSV</Button>
                <Button size="sm" variant="ghost" onClick={() => downloadImportTemplate("xlsx")}><Download className="mr-1 h-3 w-3" /> XLSX</Button>
              </div>
            </div>
          </div>
        )}

        {step === "map" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card/60 p-3 text-sm">
              <span className="font-medium">{file?.name}</span> · {rawRows.length} rows detected
            </div>
            <div className="max-h-[380px] space-y-2 overflow-auto pr-2">
              {importFields.map((f) => (
                <div key={f.key} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="text-sm">
                    <span className="font-medium">{f.label}</span>
                    {f.required && <Badge variant="outline" className="ml-2 border-primary/40 text-primary">required</Badge>}
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <Select value={mapping[f.key] ?? "__none"} onValueChange={(v) => setMapping((m) => ({ ...m, [f.key]: v === "__none" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="Skip" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">— Skip —</SelectItem>
                      {headers.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={reset}>Back</Button>
              <Button variant="hero" onClick={runValidation}>Validate rows</Button>
            </DialogFooter>
          </div>
        )}

        {step === "review" && result && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <StatBox label="Total" value={result.rows.length} tone="muted" />
              <StatBox label="Valid" value={result.valid} tone="success" icon={<CheckCircle2 className="h-4 w-4" />} />
              <StatBox label="Errors" value={result.invalid} tone="destructive" icon={<AlertTriangle className="h-4 w-4" />} />
            </div>
            <div className="max-h-[300px] overflow-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="text-xs uppercase text-muted-foreground">
                    <th className="p-2 text-left">Row</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Admission</th>
                    <th className="p-2 text-left">Class</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.slice(0, 200).map((r) => (
                    <tr key={r.index} className="border-t border-border/60">
                      <td className="p-2 text-muted-foreground">{r.index}</td>
                      <td className="p-2">{r.mapped.name ?? "—"}</td>
                      <td className="p-2">{r.mapped.admissionNo ?? "—"}</td>
                      <td className="p-2">{r.mapped.className ?? "—"}</td>
                      <td className="p-2">
                        {r.errors.length === 0
                          ? <Badge className="bg-success/10 text-success border-success/20" variant="outline">OK</Badge>
                          : <span className="text-xs text-destructive">{r.errors.join(", ")}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setStep("map")}>Back</Button>
              <Button variant="hero" disabled={result.valid === 0} onClick={runImport}>
                Import {result.valid} student{result.valid !== 1 ? "s" : ""}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "importing" && (
          <div className="py-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">Importing records…</p>
            <Progress value={progress} />
            <p className="mt-2 text-xs text-muted-foreground">{progress}%</p>
          </div>
        )}

        {step === "done" && result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-semibold">Import complete</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.valid} student{result.valid !== 1 ? "s" : ""} added
              {result.invalid > 0 && ` · ${result.invalid} skipped due to errors`}
            </p>
            <DialogFooter className="mt-6 sm:justify-center">
              <Button variant="outline" onClick={reset}><X className="mr-1 h-4 w-4" /> Import another</Button>
              <Button variant="hero" onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatBox({ label, value, tone, icon }: { label: string; value: number; tone: "muted" | "success" | "destructive"; icon?: React.ReactNode }) {
  const styles = {
    muted: "border-border bg-card",
    success: "border-success/30 bg-success/5 text-success",
    destructive: "border-destructive/30 bg-destructive/5 text-destructive",
  } as const;
  return (
    <div className={cn("rounded-xl border p-3", styles[tone])}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80">{icon}{label}</div>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
