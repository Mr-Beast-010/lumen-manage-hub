import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarCheck, Download, BarChart3, Bell, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { AttendanceDashboard } from "@/features/attendance/AttendanceDashboard";
import { MarkStudentAttendance } from "@/features/attendance/MarkStudentAttendance";
import { MarkTeacherAttendance } from "@/features/attendance/MarkTeacherAttendance";
import { AttendanceHistory } from "@/features/attendance/AttendanceHistory";

export default function Attendance() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Track daily attendance across students and teachers with insights, history, and alerts."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success("Report exported")}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("Opening reports…")}>
              <BarChart3 className="h-4 w-4" /> Reports
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("Absent notifications queued to parents")}>
              <Bell className="h-4 w-4" /> Notify absentees
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="hero" size="sm" aria-label="Mark attendance">
                  <CalendarCheck className="h-4 w-4" /> Mark attendance <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => document.getElementById("tab-students")?.click()}>Students</DropdownMenuItem>
                <DropdownMenuItem onClick={() => document.getElementById("tab-teachers")?.click()}>Teachers</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <Tabs defaultValue="dashboard">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 sm:w-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="students" id="tab-students">Mark Students</TabsTrigger>
          <TabsTrigger value="teachers" id="tab-teachers">Mark Teachers</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <AttendanceDashboard />
        </TabsContent>
        <TabsContent value="students" className="mt-6">
          <MarkStudentAttendance />
        </TabsContent>
        <TabsContent value="teachers" className="mt-6">
          <MarkTeacherAttendance />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <AttendanceHistory />
        </TabsContent>
      </Tabs>
    </main>
  );
}
