import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, List, Plus, Upload, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentAnalytics } from "@/features/students/StudentAnalytics";
import { StudentList } from "@/features/students/StudentList";
import { StudentListSkeleton } from "@/features/students/StudentListSkeleton";
import { studentRecords, type StudentRecord } from "@/features/students/data";
import { BulkImportDialog } from "@/features/students/dialogs/BulkImportDialog";
import { IdCardDialog } from "@/features/students/dialogs/IdCardDialog";
import { PromotionWizard } from "@/features/students/dialogs/PromotionWizard";
import { TransferCertificateDialog } from "@/features/students/dialogs/TransferCertificateDialog";
import { toast } from "sonner";

export default function Students() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<StudentRecord[]>(studentRecords);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [importOpen, setImportOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [promoteTargets, setPromoteTargets] = useState<string[]>([]);
  const [idCardStudent, setIdCardStudent] = useState<StudentRecord | null>(null);
  const [tcStudent, setTcStudent] = useState<StudentRecord | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const handleAdd = () => navigate("/students/new");
  const handleView = (r: StudentRecord) => navigate(`/students/${r.id}`);

  const handleDelete = (ids: string[]) => {
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
    toast.success(`${ids.length} student${ids.length > 1 ? "s" : ""} removed`);
  };

  const handleSuspend = (ids: string[]) => {
    setRows((prev) => prev.map((r) => ids.includes(r.id) ? { ...r, status: "suspended" } : r));
    toast.success(`${ids.length} student${ids.length > 1 ? "s" : ""} suspended`);
  };

  const handleArchive = (ids: string[]) => {
    setRows((prev) => prev.map((r) => ids.includes(r.id) ? { ...r, status: "alumni" } : r));
    toast.success(`${ids.length} student${ids.length > 1 ? "s" : ""} archived to alumni`);
  };

  const openPromote = (ids: string[]) => { setPromoteTargets(ids); setPromoteOpen(true); };

  const handlePromote = (ids: string[], toClass: string, toSection: string) => {
    setRows((prev) => prev.map((r) => ids.includes(r.id) ? { ...r, className: toClass, section: toSection } : r));
  };

  const handleImport = (imported: Partial<StudentRecord>[]) => {
    const base = imported.map((r, i) => ({
      id: `IMP-${Date.now()}-${i}`,
      admissionNo: r.admissionNo ?? `ADM-NEW-${i}`,
      rollNo: r.rollNo ?? String(i + 1),
      name: r.name ?? "Unnamed",
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.name ?? String(i))}`,
      gender: (r.gender as any) ?? "male",
      className: r.className ?? "10",
      section: r.section ?? "A",
      email: r.email ?? "",
      phone: r.phone ?? "",
      dob: r.dob ?? "",
      admissionDate: r.admissionDate ?? new Date().toISOString().slice(0, 10),
      attendance: (r.attendance as number) ?? 90,
      feeStatus: (r.feeStatus as any) ?? "pending",
      status: (r.status as any) ?? "active",
      guardian: r.guardian ?? "",
      documentsPending: 0,
    })) as StudentRecord[];
    setRows((prev) => [...base, ...prev]);
  };

  const activeRows = useMemo(() => rows.filter((r) => r.status !== "alumni"), [rows]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Analytics, enrollment insights, and roster management."
        actions={
          <>
            <Button variant="outline" onClick={() => setImportOpen(true)}><Upload /> Import</Button>
            <Button variant="outline" onClick={() => openPromote([])}><ArrowUp /> Promote</Button>
            <Button variant="hero" onClick={handleAdd}><Plus /> Add Student</Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="rounded-xl">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" /> Student List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <StudentAnalytics rows={activeRows} onAdd={handleAdd} />
          </motion.div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          {loading ? (
            <StudentListSkeleton />
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <StudentList
                rows={activeRows}
                onAdd={handleAdd}
                onDelete={handleDelete}
                onView={handleView}
                onImport={() => setImportOpen(true)}
                onIdCard={setIdCardStudent}
                onTransfer={setTcStudent}
                onPromote={openPromote}
                onSuspend={handleSuspend}
                onArchive={handleArchive}
              />
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      <BulkImportDialog open={importOpen} onOpenChange={setImportOpen} onImport={handleImport} />
      <IdCardDialog open={!!idCardStudent} onOpenChange={(v) => !v && setIdCardStudent(null)} student={idCardStudent} />
      <TransferCertificateDialog open={!!tcStudent} onOpenChange={(v) => !v && setTcStudent(null)} student={tcStudent} />
      <PromotionWizard
        open={promoteOpen}
        onOpenChange={setPromoteOpen}
        students={rows}
        targetIds={promoteTargets}
        onPromote={handlePromote}
      />
    </div>
  );
}
