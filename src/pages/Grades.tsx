import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { grades, type GradeRecord } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function Grades() {
  const columns = useMemo<ColumnDef<GradeRecord>[]>(() => [
    { accessorKey: "student", header: "Student" },
    { accessorKey: "subject", header: "Subject" },
    { accessorKey: "term", header: "Term" },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ getValue }) => {
        const v = getValue<number>();
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-gradient-primary" style={{ width: `${v}%` }} />
            </div>
            <span className="font-mono text-sm">{v}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "grade",
      header: "Grade",
      cell: ({ getValue }) => {
        const g = getValue<string>();
        return (
          <span className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-md font-mono text-xs font-bold",
            g === "A" ? "bg-success/15 text-success" :
            g === "B" ? "bg-primary/15 text-primary" :
            g === "C" ? "bg-accent/15 text-accent" :
            g === "D" ? "bg-warning/15 text-warning" :
            "bg-destructive/15 text-destructive",
          )}>{g}</span>
        );
      },
    },
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grades"
        description="Track student performance across subjects and terms."
        actions={<Button variant="outline"><Download /> Export CSV</Button>}
      />
      <DataTable columns={columns} data={grades} searchKey="student" searchPlaceholder="Search by student..." />
    </div>
  );
}
