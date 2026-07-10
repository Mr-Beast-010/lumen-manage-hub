import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, GraduationCap, BookOpen, PieChart, Building2 } from "lucide-react";
import { ClassAssignments } from "@/features/timetable/ClassAssignments";
import { SubjectAssignments } from "@/features/timetable/SubjectAssignments";
import { WorkloadAnalytics } from "@/features/timetable/WorkloadAnalytics";
import { TimetableGrid } from "@/features/timetable/TimetableGrid";
import { ClassroomOccupancy } from "@/features/timetable/ClassroomOccupancy";
import {
  CLASS_ASSIGNMENTS, SUBJECT_ASSIGNMENTS, TIMETABLE,
  type ClassAssignment, type SubjectAssignment, type TimetableSlot,
} from "@/features/timetable/data";

const fadeUp = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

export default function Timetable() {
  const [tab, setTab] = useState("timetable");
  const [classAssignments, setClassAssignments] = useState<ClassAssignment[]>(CLASS_ASSIGNMENTS);
  const [subjectAssignments, setSubjectAssignments] = useState<SubjectAssignment[]>(SUBJECT_ASSIGNMENTS);
  const [slots, setSlots] = useState<TimetableSlot[]>(TIMETABLE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable & Assignments"
        description="Assign teachers to classes and subjects, manage weekly schedules and monitor workload."
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="flex-wrap rounded-xl">
          <TabsTrigger value="timetable" className="gap-2">
            <CalendarDays className="h-4 w-4" /> Timetable
          </TabsTrigger>
          <TabsTrigger value="classes" className="gap-2">
            <GraduationCap className="h-4 w-4" /> Class Assignments
          </TabsTrigger>
          <TabsTrigger value="subjects" className="gap-2">
            <BookOpen className="h-4 w-4" /> Subject Assignments
          </TabsTrigger>
          <TabsTrigger value="workload" className="gap-2">
            <PieChart className="h-4 w-4" /> Workload
          </TabsTrigger>
          <TabsTrigger value="rooms" className="gap-2">
            <Building2 className="h-4 w-4" /> Rooms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timetable" className="mt-0">
          <motion.div {...fadeUp} transition={{ duration: 0.3 }}>
            <TimetableGrid slots={slots} onChange={setSlots} />
          </motion.div>
        </TabsContent>
        <TabsContent value="classes" className="mt-0">
          <motion.div {...fadeUp} transition={{ duration: 0.3 }}>
            <ClassAssignments assignments={classAssignments} onChange={setClassAssignments} />
          </motion.div>
        </TabsContent>
        <TabsContent value="subjects" className="mt-0">
          <motion.div {...fadeUp} transition={{ duration: 0.3 }}>
            <SubjectAssignments assignments={subjectAssignments} onChange={setSubjectAssignments} />
          </motion.div>
        </TabsContent>
        <TabsContent value="workload" className="mt-0">
          <motion.div {...fadeUp} transition={{ duration: 0.3 }}>
            <WorkloadAnalytics slots={slots} />
          </motion.div>
        </TabsContent>
        <TabsContent value="rooms" className="mt-0">
          <motion.div {...fadeUp} transition={{ duration: 0.3 }}>
            <ClassroomOccupancy slots={slots} />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
