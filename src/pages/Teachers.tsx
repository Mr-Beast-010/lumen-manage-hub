import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Star } from "lucide-react";
import { teachers, type Teacher } from "@/lib/mockData";

export default function Teachers() {
  const columns = useMemo<ColumnDef<Teacher>[]>(() => [
    {
      accessorKey: "name",
      header: "Teacher",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-accent text-xs font-semibold text-accent-foreground">
            {row.original.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: "subject", header: "Subject" },
    { accessorKey: "classes", header: "Classes" },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ getValue }) => (
        <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" />{getValue<number>()}</span>
      ),
    },
    { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue<string>()} /> },
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers"
        description="Manage faculty profiles, assignments, and performance."
        actions={<Button variant="hero"><Plus /> Invite teacher</Button>}
      />
      <DataTable columns={columns} data={teachers} searchKey="name" searchPlaceholder="Search teachers..." />
    </div>
  );
}
