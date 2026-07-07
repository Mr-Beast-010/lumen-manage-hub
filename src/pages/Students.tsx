import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentAnalytics } from "@/features/students/StudentAnalytics";
import { StudentList } from "@/features/students/StudentList";
import { StudentListSkeleton } from "@/features/students/StudentListSkeleton";
import { studentRecords, type StudentRecord } from "@/features/students/data";
import { toast } from "sonner";

export default function Students() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<StudentRecord[]>(studentRecords);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const handleAdd = () => navigate("/students/new");

  const handleDelete = (ids: string[]) => {
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
    toast.success(`${ids.length} student${ids.length > 1 ? "s" : ""} removed`);
  };

  const handleView = (r: StudentRecord) => navigate(`/students/${r.id}`);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Analytics, enrollment insights, and roster management."
        actions={
          <Button variant="hero" onClick={handleAdd}>
            <Plus /> Add Student
          </Button>
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
            <StudentAnalytics rows={rows} onAdd={handleAdd} />
          </motion.div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          {loading ? (
            <StudentListSkeleton />
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <StudentList rows={rows} onAdd={handleAdd} onDelete={handleDelete} onView={handleView} />
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
