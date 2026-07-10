import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeacherAnalytics } from "@/features/teachers/TeacherAnalytics";
import { TeacherDirectory } from "@/features/teachers/TeacherDirectory";
import { StudentListSkeleton } from "@/features/students/StudentListSkeleton";
import { teacherRecords, type TeacherRecord } from "@/features/teachers/data";
import { toast } from "sonner";

export default function Teachers() {
  const [rows, setRows] = useState<TeacherRecord[]>(teacherRecords);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const handleAdd = () => toast.info("Teacher onboarding wizard coming soon.");
  const handleView = (r: TeacherRecord) => toast.info(`Opening ${r.name}'s profile…`);
  const handleEdit = (r: TeacherRecord) => toast.info(`Editing ${r.name}`);
  const handleDelete = (ids: string[]) => {
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
    toast.success(`${ids.length} staff removed`);
  };
  const handleArchive = (ids: string[]) => {
    setRows((prev) => prev.map((r) => ids.includes(r.id) ? { ...r, status: "archived" } : r));
    toast.success(`${ids.length} staff archived`);
  };
  const handleIdCard = (r: TeacherRecord) => toast.info(`Generating ID card for ${r.name}`);
  const handleAssignClasses = (r: TeacherRecord) => toast.info(`Assign classes to ${r.name}`);
  const handleAssignSubjects = (r: TeacherRecord) => toast.info(`Assign subjects to ${r.name}`);

  const activeRows = useMemo(() => rows.filter((r) => r.status !== "archived"), [rows]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers & Staff"
        description="Faculty analytics, directory, assignments, and workflows."
        actions={<Button variant="hero" onClick={handleAdd}><Plus /> Add Teacher</Button>}
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="rounded-xl">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="directory" className="gap-2">
            <List className="h-4 w-4" /> Directory
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
      </Tabs>
    </div>
  );
}
