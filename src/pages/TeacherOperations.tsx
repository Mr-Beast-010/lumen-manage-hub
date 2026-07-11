import { CalendarCheck, CalendarDays, Wallet, Award } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TeacherAttendance } from "@/features/teacherOps/TeacherAttendance";
import { LeaveManagement } from "@/features/teacherOps/LeaveManagement";
import { PayrollOverview } from "@/features/teacherOps/PayrollOverview";
import { PerformanceReview } from "@/features/teacherOps/PerformanceReview";
import { NotificationsMenu } from "@/features/teacherOps/NotificationsMenu";

export default function TeacherOperations() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Operations"
        description="Track attendance, manage leaves, view payroll, and review performance."
        actions={<NotificationsMenu />}
      />

      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="attendance"><CalendarCheck className="mr-1.5 h-4 w-4" /> Attendance</TabsTrigger>
          <TabsTrigger value="leave"><CalendarDays className="mr-1.5 h-4 w-4" /> Leave</TabsTrigger>
          <TabsTrigger value="payroll"><Wallet className="mr-1.5 h-4 w-4" /> Payroll</TabsTrigger>
          <TabsTrigger value="performance"><Award className="mr-1.5 h-4 w-4" /> Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance"><TeacherAttendance /></TabsContent>
        <TabsContent value="leave"><LeaveManagement /></TabsContent>
        <TabsContent value="payroll"><PayrollOverview /></TabsContent>
        <TabsContent value="performance"><PerformanceReview /></TabsContent>
      </Tabs>
    </div>
  );
}
