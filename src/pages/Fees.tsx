import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Wallet, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { fees, type FeeRecord } from "@/lib/mockData";

export default function Fees() {
  const totals = useMemo(() => ({
    collected: fees.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0),
    pending: fees.filter((f) => f.status === "pending").reduce((s, f) => s + f.amount, 0),
    overdue: fees.filter((f) => f.status === "overdue").reduce((s, f) => s + f.amount, 0),
  }), []);

  const columns = useMemo<ColumnDef<FeeRecord>[]>(() => [
    { accessorKey: "invoice", header: "Invoice", cell: ({ getValue }) => <span className="font-mono text-xs">{getValue<string>()}</span> },
    { accessorKey: "student", header: "Student" },
    { accessorKey: "amount", header: "Amount", cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}` },
    { accessorKey: "dueDate", header: "Due date" },
    { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue<string>()} /> },
    {
      id: "actions",
      header: "",
      cell: () => <Button size="sm" variant="outline">View</Button>,
    },
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fees"
        description="Track invoices, collections, and outstanding balances."
        actions={<Button variant="hero"><Plus /> Create invoice</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Collected" value={`$${totals.collected.toLocaleString()}`} icon={CheckCircle2} delta={12.4} hint="this month" />
        <StatCard label="Pending" value={`$${totals.pending.toLocaleString()}`} icon={Wallet} delta={3.1} hint="awaiting" index={1} />
        <StatCard label="Overdue" value={`$${totals.overdue.toLocaleString()}`} icon={AlertCircle} delta={-1.8} hint="past due" index={2} />
      </div>
      <DataTable columns={columns} data={fees} searchKey="student" searchPlaceholder="Search invoices..." />
    </div>
  );
}
