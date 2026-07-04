import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Mail, MoreHorizontal } from "lucide-react";
import { students, type Student } from "@/lib/mockData";
import { StudentFormDialog } from "@/features/students/StudentFormDialog";
import { toast } from "sonner";

export default function Students() {
  const [rows, setRows] = useState<Student[]>(students);
  const [open, setOpen] = useState(false);

  const columns = useMemo<ColumnDef<Student>[]>(() => [
    {
      accessorKey: "name",
      header: "Student",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
            {row.original.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.id}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: "grade", header: "Grade", cell: ({ row }) => `${row.original.grade}-${row.original.section}` },
    { accessorKey: "email", header: "Email", cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span> },
    { accessorKey: "attendance", header: "Attendance", cell: ({ getValue }) => `${getValue<number>()}%` },
    { accessorKey: "gpa", header: "GPA" },
    { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue<string>()} /> },
    {
      id: "actions",
      header: "",
      cell: () => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Email student"><Mail className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" aria-label="More actions"><MoreHorizontal className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage enrollments, profiles, and academic progress."
        actions={
          <Button variant="hero" onClick={() => setOpen(true)}>
            <Plus /> Add student
          </Button>
        }
      />
      <DataTable columns={columns} data={rows} searchKey="name" searchPlaceholder="Search students..." />
      <StudentFormDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(values) => {
          const newRow: Student = {
            id: `STU-${1000 + rows.length}`,
            attendance: 100,
            gpa: 4.0,
            status: "pending",
            section: values.section,
            grade: values.grade,
            name: values.name,
            email: values.email,
          };
          setRows((r) => [newRow, ...r]);
          toast.success(`${values.name} added successfully`);
        }}
      />
    </div>
  );
}
