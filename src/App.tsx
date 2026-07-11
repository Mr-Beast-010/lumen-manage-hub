import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentAdmission from "./pages/StudentAdmission";
import StudentProfile from "./pages/StudentProfile";
import Teachers from "./pages/Teachers";
import TeacherProfile from "./pages/TeacherProfile";
import Attendance from "./pages/Attendance";
import Grades from "./pages/Grades";
import Exams from "./pages/Exams";
import Fees from "./pages/Fees";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Alumni from "./pages/Alumni";
import Timetable from "./pages/Timetable";
import TeacherOperations from "./pages/TeacherOperations";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner theme="dark" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/new" element={<StudentAdmission />} />
            <Route path="/students/:id" element={<StudentProfile />} />
            <Route path="/alumni" element={<Alumni />} />

            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teachers/:id" element={<TeacherProfile />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
