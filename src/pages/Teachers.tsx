import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard, List, Plus, Upload, Download, Search, Building2,
  FileText, Activity, Archive, FileSpreadsheet, IdCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TeacherAnalytics } from "@/features/teachers/TeacherAnalytics";
import { TeacherDirectory } from "@/features/teachers/TeacherDirectory";
import { DepartmentAnalytics } from "@/features/teachers/DepartmentAnalytics";
import { StaffReports } from "@/features/teachers/StaffReports";
import { AuditLog } from "@/features/teachers/AuditLog";
import { ArchivedStaff } from "@/features/teachers/ArchivedStaff";
import { BulkImportTeachersDialog } from "@/features/teachers/dialogs/BulkImportTeachersDialog";
import { TeacherIdCardDialog } from "@/features/teachers/dialogs/TeacherIdCardDialog";
import { GlobalTeacherSearch } from "@/features/teachers/dialogs/GlobalTeacherSearch";
import {
  exportTeachersCSV, exportTeachersXLSX, exportTeachersPDF, downloadTeacherTemplate,
} from "@/features/teachers/utils/exporters";
import { StudentListSkeleton } from "@/features/students/StudentListSkeleton";
import { teacherRecords, type TeacherRecord } from "@/features/teachers/data";
import { logAudit } from "@/features/teachers/audit";
import { toast } from "sonner";

export default function Teachers() {
  const [rows, setRows] = useState<TeacherRecord[]>(teacherRecords);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [importOpen, setImportOpen] = useState(false);
  const [idOpen, setIdOpen] = useState(false);
  const [idTarget, setIdTarget] = useState<TeacherRecord | null>(null);
  const [idBatch, setIdBatch] = useState<TeacherRecord[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeRows = useMemo(() => rows.filter((r) => r.status !== "archived"), [rows]);
  const archivedRows = useMemo(() => rows.filter((r) => r.status === "archived"), [rows]);

  const handleAdd = () => toast.info("Teacher onboarding wizard coming soon.");
  const handleView = (r: TeacherRecord) => navigate(`/teachers/${r.id}`);
  const handleEdit = (r: TeacherRecord) => {
    toast.info(`Editing ${r.name}`);
    logAudit({ actor: "Admin", category: "profile", action: "Opened profile editor", target: r.employeeId });
  };
  const handleDelete = (ids: string[]) => {
    const names = rows.filter((r) => ids.includes(r.id)).map((r) => r.employeeId);
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
    toast.success(`${ids.length} staff removed`);
    logAudit({ actor: "Admin", category: "delete", action: "Deleted staff", details: names.join(", ") });
  };
  const handleArchive = (ids: string[]) => {
    const names = rows.filter((r) => ids.includes(r.id)).map((r) => r.employeeId);
    setRows((prev) => prev.map((r) => ids.includes(r.id) ? { ...r, status: "archived" } : r));
    toast.success(`${ids.length} staff archived`);
    logAudit({ actor: "Admin", category: "archive", action: "Archived staff", details: names.join(", ") });
  };
  const handleRestore = (ids: string[]) => {
    const names = rows.filter((r) => ids.includes(r.id)).map((r) => r.employeeId);
    setRows((prev) => prev.map((r) => ids.includes(r.id) ? { ...r, status: "active" } : r));
    toast.success(`${ids.length} restored`);
    logAudit({ actor: "Admin", category: "restore", action: "Restored staff", details: names.join(", ") });
  };
  const handleIdCard = (r: TeacherRecord) => { setIdTarget(r); setIdBatch([]); setIdOpen(true); };
  const handleBatchIdCards = () => {
    if (activeRows.length === 0) return;
    setIdTarget(null);
    setIdBatch(activeRows.slice(0, 12));
    setIdOpen(true);
  };
  const handleAssignClasses = (r: TeacherRecord) => {
    toast.info(`Assign classes to ${r.name}`);
    logAudit({ actor: "Admin", category: "assignment", action: "Opened class assignment", target: r.employeeId });
  };
  const handleAssignSubjects = (r: TeacherRecord) => {
    toast.info(`Assign subjects to ${r.name}`);
    logAudit({ actor: "Admin", category: "assignment", action: "Opened subject assignment", target: r.employeeId });
  };

  const handleImport = (incoming: Partial<TeacherRecord>[]) => {
    const created: TeacherRecord[] = incoming.map((r, i) => ({
      id: r.employeeId ?? `EMP-N${Date.now()}-${i}`,
      employeeId: r.employeeId ?? `EMP-N${Date.now()}-${i}`,
      name: r.name ?? "Unnamed",
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.name ?? String(i))}`,
      gender: (r.gender as any) ?? "male",
      type: (r.type as any) ?? "teaching",
      department: r.department ?? "General",
      designation: r.designation ?? "Teacher",
      subjects: (r.subjects as string[]) ?? [],
      classes: (r.classes as string[]) ?? [],
      email: r.email ?? "",
      phone: r.phone ?? "",
      dob: r.dob ?? "1990-01-01",
      joinedOn: r.joinedOn ?? new Date().toISOString().slice(0, 10),
      experience: (r.experience as number) ?? 0,
      status: (r.status as any) ?? "active",
      attendance: (r.attendance as number) ?? 95,
      rating: 4.2,
    }));
    setRows((prev) => [...created, ...prev]);
    toast.success(`Imported ${created.length} staff`);
    logAudit({ actor: "Admin", category: "import", action: "Bulk imported staff", details: `${created.length} records` });
  };

  const doExport = (fmt: "csv" | "xlsx" | "pdf", scope: "all" | "active") => {
    const data = scope === "active" ? activeRows : rows;
    if (fmt === "csv") exportTeachersCSV(data);
    else if (fmt === "xlsx") exportTeachersXLSX(data);
    else exportTeachersPDF(data);
    logAudit({ actor: "Admin", category: "export", action: `Exported staff (${fmt.toUpperCase()})`, details: `${data.length} rows` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers & Staff"
        description="Faculty analytics, directory, assignments, and workflows."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSearchOpen(true)} aria-label="Search staff (Ctrl+K)">
              <Search className="mr-1 h-4 w-4" /> Search
              <kbd className="ml-2 hidden rounded border border-border bg-muted px-1.5 text-[10px] font-medium sm:inline">⌘K</kbd>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="mr-1 h-4 w-4" /> Import
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Export</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs">Active staff ({activeRows.length})</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => doExport("xlsx", "active")}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</DropdownMenuItem>
                <DropdownMenuItem onClick={() => doExport("csv", "active")}><FileText className="mr-2 h-4 w-4" /> CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => doExport("pdf", "active")}><FileText className="mr-2 h-4 w-4" /> PDF</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs">Entire list ({rows.length})</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => doExport("xlsx", "all")}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel (all)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => downloadTeacherTemplate("xlsx")}><Download className="mr-2 h-4 w-4" /> Import template</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={handleBatchIdCards}>
              <IdCard className="mr-1 h-4 w-4" /> Batch ID cards
            </Button>
            <Button variant="hero" size="sm" onClick={handleAdd}><Plus className="mr-1 h-4 w-4" /> Add Teacher</Button>
          </div>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="flex-wrap rounded-xl">
          <TabsTrigger value="dashboard" className="gap-2"><LayoutDashboard className="h-4 w-4" /> Dashboard</TabsTrigger>
          <TabsTrigger value="directory" className="gap-2"><List className="h-4 w-4" /> Directory</TabsTrigger>
          <TabsTrigger value="departments" className="gap-2"><Building2 className="h-4 w-4" /> Departments</TabsTrigger>
          <TabsTrigger value="reports" className="gap-2"><FileText className="h-4 w-4" /> Reports</TabsTrigger>
          <TabsTrigger value="audit" className="gap-2"><Activity className="h-4 w-4" /> Audit</TabsTrigger>
          <TabsTrigger value="archive" className="gap-2"><Archive className="h-4 w-4" /> Archive
            {archivedRows.length > 0 && <span className="ml-1 rounded-full bg-primary/15 px-1.5 text-[10px] text-primary">{archivedRows.length}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <TeacherAnalytics rows={activeRows} onAdd={handleAdd} />
          </motion.div>
        </TabsContent>

        <TabsContent value="directory" className="mt-0">
          {loading ? (
            <StudentListSkeleton />
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <TeacherDirectory
                rows={activeRows}
                onAdd={handleAdd}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onIdCard={handleIdCard}
                onAssignClasses={handleAssignClasses}
                onAssignSubjects={handleAssignSubjects}
              />
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="departments" className="mt-0">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <DepartmentAnalytics rows={activeRows} />
          </motion.div>
        </TabsContent>

        <TabsContent value="reports" className="mt-0">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <StaffReports rows={activeRows} />
          </motion.div>
        </TabsContent>

        <TabsContent value="audit" className="mt-0">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <AuditLog />
          </motion.div>
        </TabsContent>

        <TabsContent value="archive" className="mt-0">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ArchivedStaff rows={archivedRows} onRestore={handleRestore} onDelete={handleDelete} />
          </motion.div>
        </TabsContent>
      </Tabs>

      <BulkImportTeachersDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        existingEmployeeIds={rows.map((r) => r.employeeId)}
        onImport={handleImport}
      />
      <TeacherIdCardDialog
        open={idOpen}
        onOpenChange={setIdOpen}
        teacher={idTarget}
        batch={idBatch}
      />
      <GlobalTeacherSearch open={searchOpen} onOpenChange={setSearchOpen} rows={rows} />
    </div>
  );
}
