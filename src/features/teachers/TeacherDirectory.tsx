import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, SortingState, useReactTable,
  VisibilityState, RowSelectionState,
} from "@tanstack/react-table";
import {
  ChevronLeft, ChevronRight, Search, ArrowUpDown, MoreHorizontal,
  Eye, Pencil, Trash2, Archive, IdCard, Download, FileText, Columns3, Plus,
  X, Users, UserPlus, BookOpen, GraduationCap, Mail, Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import type { TeacherRecord } from "./data";

interface Props {
  rows: TeacherRecord[];
  onAdd: () => void;
  onDelete: (ids: string[]) => void;
  onView?: (r: TeacherRecord) => void;
  onEdit?: (r: TeacherRecord) => void;
  onArchive?: (ids: string[]) => void;
  onIdCard?: (r: TeacherRecord) => void;
  onAssignClasses?: (r: TeacherRecord) => void;
  onAssignSubjects?: (r: TeacherRecord) => void;
}

const exportCSV = (rows: TeacherRecord[]) => {
  const headers = ["Employee ID","Name","Department","Designation","Subjects","Classes","Email","Phone","Experience","Status"];
  const lines = rows.map((r) => [
    r.employeeId, r.name, r.department, r.designation,
    r.subjects.join("|"), r.classes.join("|"),
    r.email, r.phone, String(r.experience), r.status,
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
  const blob = new Blob([[headers.join(","), ...lines].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "teachers.csv"; a.click();
  URL.revokeObjectURL(url);
};

const exportPDF = (rows: TeacherRecord[]) => {
  const html = `<html><head><title>Teachers</title>
    <style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{padding:6px 8px;border-bottom:1px solid #ddd;font-size:12px;text-align:left}th{background:#f3f4f6}</style>
    </head><body><h2>Teacher Directory</h2><table><thead><tr>
    <th>ID</th><th>Name</th><th>Department</th><th>Designation</th><th>Subjects</th><th>Classes</th><th>Status</th></tr></thead><tbody>
    ${rows.map((r) => `<tr><td>${r.employeeId}</td><td>${r.name}</td><td>${r.department}</td><td>${r.designation}</td><td>${r.subjects.join(", ")}</td><td>${r.classes.join(", ")}</td><td>${r.status}</td></tr>`).join("")}
    </tbody></table></body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 300); }
};

export function TeacherDirectory({
  rows, onAdd, onDelete, onView, onEdit, onArchive, onIdCard, onAssignClasses, onAssignSubjects,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => rows.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (deptFilter !== "all" && r.department !== deptFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  }), [rows, typeFilter, deptFilter, statusFilter]);

  const columns = useMemo<ColumnDef<TeacherRecord>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label={`Select ${row.original.name}`}
        />
      ),
      enableSorting: false,
    },
    {
      id: "photo",
      header: "",
      cell: ({ row }) => (
        <Avatar className="h-9 w-9 ring-1 ring-border">
          <AvatarImage src={row.original.photo} alt="" />
          <AvatarFallback>{row.original.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
        </Avatar>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="min-w-[160px]">
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.designation}</p>
        </div>
      ),
    },
    { accessorKey: "employeeId", header: "Employee ID" },
    { accessorKey: "department", header: "Department" },
    { accessorKey: "designation", header: "Designation" },
    {
      accessorKey: "subjects",
      header: "Subjects",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {row.original.subjects.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
          {row.original.subjects.map((s) => (
            <span key={s} className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">{s}</span>
          ))}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "classes",
      header: "Classes",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[160px]">
          {row.original.classes.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
          {row.original.classes.map((c) => (
            <span key={c} className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px]">{c}</span>
          ))}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div className="min-w-[160px] space-y-0.5">
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {row.original.email}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {row.original.phone}</p>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${row.original.name}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onView?.(row.original)}><Eye className="mr-2 h-4 w-4" />View profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(row.original)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onIdCard?.(row.original)}><IdCard className="mr-2 h-4 w-4" />Print ID card</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssignClasses?.(row.original)}><GraduationCap className="mr-2 h-4 w-4" />Assign classes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssignSubjects?.(row.original)}><BookOpen className="mr-2 h-4 w-4" />Assign subjects</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive?.([row.original.id])}><Archive className="mr-2 h-4 w-4" />Archive</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete([row.original.id])}>
                <Trash2 className="mr-2 h-4 w-4" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [onDelete, onView, onEdit, onArchive, onIdCard, onAssignClasses, onAssignSubjects]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter, rowSelection, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getRowId: (r) => r.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const selectedIds = Object.keys(rowSelection);
  const selectedCount = selectedIds.length;
  const activeFilterCount = [typeFilter, deptFilter, statusFilter].filter((f) => f !== "all").length;
  const departments = useMemo(() => Array.from(new Set(rows.map((r) => r.department))).sort(), [rows]);
  const clearFilters = () => { setTypeFilter("all"); setDeptFilter("all"); setStatusFilter("all"); };

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No staff yet."
        description="Add your first teacher or staff member to get started."
        action={<Button variant="hero" onClick={onAdd}><UserPlus /> Add Teacher</Button>}
      />
    );
  }

  const currentRows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search name, ID, department…"
            aria-label="Search teachers"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-10 w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="teaching">Teaching</SelectItem>
              <SelectItem value="non-teaching">Non-teaching</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-10 w-[160px]"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on-leave">On leave</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-3 w-3" /> Clear ({activeFilterCount})
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm"><Columns3 className="mr-1 h-4 w-4" /> Columns</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllLeafColumns().filter((c) => !["select", "photo", "actions"].includes(c.id)).map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(v) => col.toggleVisibility(!!v)}
                  className="capitalize"
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs">Export {filtered.length} filtered</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => exportCSV(filtered)}><FileText className="mr-2 h-4 w-4" /> CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportPDF(filtered)}><FileText className="mr-2 h-4 w-4" /> PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="hero" size="sm" onClick={onAdd}><Plus className="mr-1 h-4 w-4" /> Add Teacher</Button>
        </div>
      </div>

      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-2"
          >
            <p className="text-sm">
              <span className="font-medium text-primary">{selectedCount}</span> selected
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => setRowSelection({})}>Deselect</Button>
              <Button variant="outline" size="sm" onClick={() => { onArchive?.(selectedIds); setRowSelection({}); }}><Archive className="mr-1 h-4 w-4" />Archive</Button>
              <Button variant="outline" size="sm" onClick={() => exportCSV(filtered.filter((r) => selectedIds.includes(r.id)))}><Download className="mr-1 h-4 w-4" />Export</Button>
              <Button variant="destructive" size="sm" onClick={() => { onDelete(selectedIds); setRowSelection({}); }}>
                <Trash2 className="mr-1 h-4 w-4" /> Delete
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <div className="max-h-[640px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-border hover:bg-transparent">
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} className="text-xs uppercase tracking-wider text-muted-foreground">
                      {header.isPlaceholder ? null : (
                        <button
                          className={cn(
                            "inline-flex items-center gap-1 text-left",
                            header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground",
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && <ArrowUpDown className="h-3 w-3 opacity-40" />}
                        </button>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {currentRows.length ? currentRows.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-border/60 transition-smooth hover:bg-secondary/40 data-[state=selected]:bg-primary/5"
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </motion.tr>
              )) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                    No staff match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {currentRows.length === 0 && (
          <p className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No staff match the current filters.
          </p>
        )}
        {currentRows.map((row) => {
          const r = row.original;
          return (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(v) => row.toggleSelected(!!v)}
                  aria-label={`Select ${r.name}`}
                  className="mt-1"
                />
                <Avatar className="h-11 w-11 ring-1 ring-border">
                  <AvatarImage src={r.photo} alt="" />
                  <AvatarFallback>{r.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{r.name}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8" aria-label={`Actions for ${r.name}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView?.(r)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(r)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onIdCard?.(r)}><IdCard className="mr-2 h-4 w-4" />ID card</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAssignClasses?.(r)}><GraduationCap className="mr-2 h-4 w-4" />Assign classes</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAssignSubjects?.(r)}><BookOpen className="mr-2 h-4 w-4" />Assign subjects</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onArchive?.([r.id])}><Archive className="mr-2 h-4 w-4" />Archive</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete([r.id])}>
                          <Trash2 className="mr-2 h-4 w-4" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.employeeId} · {r.designation}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-md bg-secondary px-2 py-0.5">{r.department}</span>
                    <StatusBadge status={r.status} />
                    <span className="text-muted-foreground">{r.experience} yrs</span>
                  </div>
                  {r.subjects.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {r.subjects.map((s) => (
                        <span key={s} className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
        <p className="text-muted-foreground">
          Showing {currentRows.length} of {filtered.length} · Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger className="h-9 w-[110px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
