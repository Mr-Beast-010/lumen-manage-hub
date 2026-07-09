import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { GraduationCap, RotateCcw, Search, Eye, Download } from "lucide-react";
import { studentRecords, type StudentRecord } from "@/features/students/data";
import { exportStudentsCSV } from "@/features/students/utils/exporters";
import { toast } from "sonner";

export default function Alumni() {
  const [rows, setRows] = useState<StudentRecord[]>(() => studentRecords.filter((r) => r.status === "alumni"));
  const [q, setQ] = useState("");
  const [year, setYear] = useState("all");
  const navigate = useNavigate();

  const years = useMemo(() => Array.from(new Set(rows.map((r) => r.admissionDate.slice(0, 4)))).sort(), [rows]);

  const filtered = useMemo(() => rows.filter((r) => {
    const s = q.toLowerCase();
    if (year !== "all" && !r.admissionDate.startsWith(year)) return false;
    if (!s) return true;
    return r.name.toLowerCase().includes(s) || r.admissionNo.toLowerCase().includes(s) || r.guardian.toLowerCase().includes(s);
  }), [rows, q, year]);

  const restore = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Alumni restored to active roster");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alumni"
        description="Graduated and archived students. Search, restore, and export former learners."
        actions={
          <Button variant="outline" size="sm" onClick={() => exportStudentsCSV(filtered, "alumni")}>
            <Download className="mr-1 h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search alumni…" className="pl-9" />
        </div>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Admission year" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No alumni yet"
          description="Once students graduate, they'll appear here for archival and networking."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="rounded-2xl border border-border bg-card p-4 transition-smooth hover:border-primary/40"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 ring-1 ring-border">
                  <AvatarImage src={r.photo} alt="" />
                  <AvatarFallback>{r.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.admissionNo} · Batch {r.admissionDate.slice(0, 4)}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{r.email}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/students/${r.id}`)}>
                  <Eye className="mr-1 h-3 w-3" /> View
                </Button>
                <Button size="sm" variant="ghost" onClick={() => restore(r.id)}>
                  <RotateCcw className="mr-1 h-3 w-3" /> Restore
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
