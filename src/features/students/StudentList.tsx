import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  ChevronLeft, ChevronRight, Search, ArrowUpDown, MoreHorizontal,
  Eye, Pencil, Trash2, Ban, ArrowUp, IdCard, Download, FileText,
  Columns3, Plus, X, UserPlus, Users, Upload, FileSpreadsheet, Archive, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { StudentRecord } from "./data";
import { exportStudentsCSV, exportStudentsPDF, exportStudentsXLSX } from "./utils/exporters";

interface Props {
  rows: StudentRecord[];
  loading?: boolean;
  onAdd: () => void;
  onDelete: (ids: string[]) => void;
  onView?: (r: StudentRecord) => void;
  onImport?: () => void;
  onIdCard?: (r: StudentRecord) => void;
  onTransfer?: (r: StudentRecord) => void;
  onPromote?: (ids: string[]) => void;
  onSuspend?: (ids: string[]) => void;
  onArchive?: (ids: string[]) => void;
}


const feeStyles: Record<string, string> = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
  partial: "bg-primary/10 text-primary border-primary/20",
};

function AttendanceBar({ value }: { value: number }) {
  const tone = value >= 90 ? "bg-success" : value >= 75 ? "bg-primary" : "bg-warning";
  return (
    <div className="flex min-w-[90px] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="w-9 text-xs tabular-nums text-muted-foreground">{value}%</span>
    </div>
  );
}



export function StudentList({ rows, onAdd, onDelete, onView, onImport, onIdCard, onTransfer, onPromote, onSuspend, onArchive }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [classFilter, setClassFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [feeFilter, setFeeFilter] = useState<string>("all");


  const filtered = useMemo(() => rows.filter((r) => {
    if (classFilter !== "all" && r.className !== classFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (feeFilter !== "all" && r.feeStatus !== feeFilter) return false;
    return true;
  }), [rows, classFilter, statusFilter, feeFilter]);

  const columns = useMemo<ColumnDef<StudentRecord>[]>(() => [
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
      header: "Student Name",
      cell: ({ row }) => (
        <div className="min-w-[140px]">
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    { accessorKey: "admissionNo", header: "Admission No" },
    { accessorKey: "rollNo", header: "Roll" },
    { accessorKey: "className", header: "Class", cell: ({ row }) => `Grade ${row.original.className}` },
    { accessorKey: "section", header: "Section" },
    {
      accessorKey: "attendance",
      header: "Attendance",
      cell: ({ getValue }) => <AttendanceBar value={getValue<number>()} />,
    },
    {
      accessorKey: "feeStatus",
      header: "Fee Status",
      cell: ({ getValue }) => {
        const v = getValue<string>();
        return (
          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize", feeStyles[v])}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {v}
          </span>
        );
      },
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
              <DropdownMenuItem onClick={() => onIdCard?.(row.original)}><IdCard className="mr-2 h-4 w-4" />ID card</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPromote?.([row.original.id])}><ArrowUp className="mr-2 h-4 w-4" />Promote</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSuspend?.([row.original.id])}><Ban className="mr-2 h-4 w-4" />Suspend</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTransfer?.(row.original)}><Send className="mr-2 h-4 w-4" />Transfer certificate</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive?.([row.original.id])}><Archive className="mr-2 h-4 w-4" />Archive as alumni</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete([row.original.id])}>
                <Trash2 className="mr-2 h-4 w-4" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [onDelete, onView, onIdCard, onTransfer, onPromote, onSuspend, onArchive]);


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
  const activeFilterCount = [classFilter, statusFilter, feeFilter].filter((f) => f !== "all").length;

  const classes = useMemo(() => Array.from(new Set(rows.map((r) => r.className))).sort(), [rows]);

  const clearFilters = () => { setClassFilter("all"); setStatusFilter("all"); setFeeFilter("all"); };

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No students found."
        description="Start building your roster by admitting your first student."
        action={<Button variant="hero" onClick={onAdd}><UserPlus /> Add Student</Button>}
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
            placeholder="Search by name, admission no, email…"
            aria-label="Search students"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="h-10 w-[130px]"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {classes.map((c) => <SelectItem key={c} value={c}>Grade {c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="alumni">Alumni</SelectItem>
            </SelectContent>
          </Select>
          <Select value={feeFilter} onValueChange={setFeeFilter}>
            <SelectTrigger className="h-10 w-[130px]"><SelectValue placeholder="Fees" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All fees</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
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
              <DropdownMenuItem onClick={() => exportStudentsCSV(filtered)}><FileText className="mr-2 h-4 w-4" /> CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportStudentsXLSX(filtered)}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel (.xlsx)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportStudentsPDF(filtered)}><FileText className="mr-2 h-4 w-4" /> PDF</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">Entire database</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => exportStudentsXLSX(rows, "students-all")}><FileSpreadsheet className="mr-2 h-4 w-4" /> All students (.xlsx)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {onImport && (
            <Button variant="outline" size="sm" onClick={onImport}><Upload className="mr-1 h-4 w-4" /> Import</Button>
          )}
          <Button variant="hero" size="sm" onClick={onAdd}><Plus className="mr-1 h-4 w-4" /> Add Student</Button>
        </div>
      </div>


      {/* Bulk action bar */}
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
              <Button variant="outline" size="sm" onClick={() => { onPromote?.(selectedIds); setRowSelection({}); }}><ArrowUp className="mr-1 h-4 w-4" />Promote</Button>
              <Button variant="outline" size="sm" onClick={() => { onSuspend?.(selectedIds); setRowSelection({}); }}><Ban className="mr-1 h-4 w-4" />Suspend</Button>
              <Button variant="outline" size="sm" onClick={() => { onArchive?.(selectedIds); setRowSelection({}); }}><Archive className="mr-1 h-4 w-4" />Archive</Button>
              <Button variant="outline" size="sm" onClick={() => exportStudentsXLSX(filtered.filter((r) => selectedIds.includes(r.id)), "selection")}><Download className="mr-1 h-4 w-4" />Export</Button>
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
                    No students match the current filters.
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
            No students match the current filters.
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
                        <DropdownMenuItem onClick={() => toast.info("Edit coming soon")}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success(`${r.name} promoted`)}><ArrowUp className="mr-2 h-4 w-4" />Promote</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success(`${r.name} suspended`)}><Ban className="mr-2 h-4 w-4" />Suspend</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info("Printing ID card")}><IdCard className="mr-2 h-4 w-4" />ID card</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete([r.id])}>
                          <Trash2 className="mr-2 h-4 w-4" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.admissionNo} · Roll {r.rollNo}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-md bg-secondary px-2 py-0.5">Grade {r.className}-{r.section}</span>
                    <StatusBadge status={r.status} />
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium capitalize", feeStyles[r.feeStatus])}>
                      {r.feeStatus}
                    </span>
                  </div>
                  <div className="mt-3">
                    <AttendanceBar value={r.attendance} />
                  </div>
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
