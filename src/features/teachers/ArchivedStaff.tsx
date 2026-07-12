import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Archive, RotateCcw, Trash2, Search } from "lucide-react";
import type { TeacherRecord } from "./data";

interface Props {
  rows: TeacherRecord[];
  onRestore: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
}

export function ArchivedStaff({ rows, onRestore, onDelete }: Props) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase();
    return rows.filter((r) =>
      r.name.toLowerCase().includes(s) ||
      r.employeeId.toLowerCase().includes(s) ||
      r.department.toLowerCase().includes(s),
    );
  }, [rows, q]);

  if (rows.length === 0) {
    return <EmptyState icon={Archive} title="No archived staff" description="Archived teachers will appear here and can be restored anytime." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Archived staff</h3>
          <p className="text-sm text-muted-foreground">{rows.length} archived · restore or permanently delete.</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search archive…" aria-label="Search archived staff" className="pl-9 w-64" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {filtered.map((r) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Card className="rounded-2xl">
                <CardContent className="flex items-center gap-3 p-4">
                  <Avatar className="h-11 w-11 ring-1 ring-border">
                    <AvatarImage src={r.photo} alt="" />
                    <AvatarFallback>{r.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.employeeId} · {r.department}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button size="sm" variant="outline" onClick={() => onRestore([r.id])} aria-label={`Restore ${r.name}`}>
                      <RotateCcw className="mr-1 h-3 w-3" /> Restore
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" aria-label={`Delete ${r.name}`}>
                          <Trash2 className="mr-1 h-3 w-3" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Permanently delete {r.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. All associated records will be removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => onDelete([r.id])}>
                            Delete permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
