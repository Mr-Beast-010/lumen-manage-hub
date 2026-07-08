import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Eye, Download, Pencil, Trash2, Upload, UploadCloud, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { DocumentItem } from "./mockProfile";

const categories: (DocumentItem["category"] | "All")[] = ["All", "Identity", "Academic", "Medical", "Guardian", "Other"];

export function DocumentManager({ initial }: { initial: DocumentItem[] }) {
  const [docs, setDocs] = useState<DocumentItem[]>(initial);
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      docs.filter(
        (d) =>
          (category === "All" || d.category === category) &&
          d.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [docs, category, query],
  );

  const simulateUpload = (files: File[]) => {
    if (!files.length) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p === null) return null;
        if (p >= 100) {
          clearInterval(interval);
          const now = new Date().toISOString().slice(0, 10);
          const additions: DocumentItem[] = files.map((f, i) => ({
            id: `NEW-${Date.now()}-${i}`,
            name: f.name,
            type: f.type.includes("pdf") ? "PDF" : "Image",
            category: "Other",
            size: `${Math.max(1, Math.round(f.size / 1024))} KB`,
            uploadedAt: now,
            status: "pending",
          }));
          setDocs((d) => [...additions, ...d]);
          toast.success(`${files.length} document(s) uploaded`);
          setTimeout(() => setProgress(null), 600);
          return 100;
        }
        return p + 12;
      });
    }, 90);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    simulateUpload(Array.from(e.dataTransfer.files));
  };

  const remove = (id: string) => {
    setDocs((d) => d.filter((x) => x.id !== id));
    toast.success("Document deleted");
  };

  const startRename = (d: DocumentItem) => {
    setRenaming(d.id);
    setRenameValue(d.name);
  };
  const commitRename = () => {
    if (renaming) {
      setDocs((docs) => docs.map((d) => (d.id === renaming ? { ...d, name: renameValue || d.name } : d)));
      toast.success("Document renamed");
    }
    setRenaming(null);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        aria-label="Upload documents"
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-smooth",
          dragging ? "border-primary bg-primary/5" : "border-border bg-secondary/20 hover:border-primary/50 hover:bg-primary/5",
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
          <UploadCloud className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium">Drop files here or click to upload</p>
        <p className="text-xs text-muted-foreground">PDF, JPG or PNG · up to 10MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,image/*"
          onChange={(e) => simulateUpload(Array.from(e.target.files ?? []))}
        />
        {progress !== null && (
          <div className="mt-2 w-full max-w-xs">
            <Progress value={progress} />
            <p className="mt-1 text-xs text-muted-foreground">Uploading… {progress}%</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-smooth",
                category === c ? "bg-primary/15 text-primary ring-primary/30" : "bg-transparent text-muted-foreground ring-border hover:bg-secondary/60",
              )}
              aria-pressed={category === c}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents"
            className="pl-9"
            aria-label="Search documents"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filtered.map((d) => (
            <motion.div
              key={d.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-secondary/30 p-4 transition-smooth hover:border-primary/40"
            >
              <div className="flex items-start justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    {renaming === d.id ? (
                      <Input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => e.key === "Enter" && commitRename()}
                        className="h-7 text-sm"
                        aria-label="Rename document"
                      />
                    ) : (
                      <p className="truncate text-sm font-medium">{d.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{d.category} · {d.type} · {d.size}</p>
                  </div>
                </div>
                <Badge variant="outline" className={cn(
                  d.status === "verified" && "border-success/30 bg-success/10 text-success",
                  d.status === "pending" && "border-warning/30 bg-warning/10 text-warning",
                  d.status === "missing" && "border-destructive/30 bg-destructive/10 text-destructive",
                )}>{d.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Uploaded {d.uploadedAt}</p>
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="ghost" onClick={() => toast.success(`Previewing ${d.name}`)} aria-label={`Preview ${d.name}`}>
                  <Eye className="h-3.5 w-3.5" /> Preview
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toast.success(`Downloading ${d.name}`)} aria-label={`Download ${d.name}`}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => startRename(d)} aria-label={`Rename ${d.name}`}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(d.id)} aria-label={`Delete ${d.name}`}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!filtered.length && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No documents match your filters.
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="hero" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload /> Upload new
        </Button>
      </div>
    </div>
  );
}
