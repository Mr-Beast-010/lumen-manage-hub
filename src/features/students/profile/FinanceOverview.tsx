import { motion } from "framer-motion";
import { Wallet, CalendarClock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AnimatedCounter } from "./AnimatedCounter";
import { cn } from "@/lib/utils";
import type { StudentProfile } from "./mockProfile";

const rows = [
  { key: "paid", label: "Paid", tone: "text-success" },
  { key: "pending", label: "Pending", tone: "text-warning" },
  { key: "scholarship", label: "Scholarship", tone: "text-accent" },
  { key: "discount", label: "Discount", tone: "text-primary" },
  { key: "fine", label: "Late fine", tone: "text-destructive" },
] as const;

export function FinanceOverview({ fees }: { fees: StudentProfile["fees"] }) {
  const paidPct = fees.total ? Math.round((fees.paid / fees.total) * 100) : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-6"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" /> Finance snapshot
          </div>
          <div>
            <p className="font-display text-4xl font-bold tracking-tight">
              <AnimatedCounter value={fees.total} prefix="$" />
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Total fees for the academic year</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Collection progress</span>
              <span className="font-mono">{paidPct}%</span>
            </div>
            <Progress value={paidPct} />
            <p className="text-xs text-muted-foreground">
              <span className="text-success">${fees.paid.toLocaleString()} paid</span> ·{" "}
              <span className="text-warning">${fees.pending.toLocaleString()} pending</span>
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm">
            <CalendarClock className="h-4 w-4 text-warning" />
            <span className="text-muted-foreground">Next due</span>
            <span className="font-mono">{fees.nextDueDate}</span>
          </div>
        </div>
        <ul className="grid gap-2">
          {rows.map((r, i) => (
            <motion.li
              key={r.key}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-4 py-2.5"
            >
              <span className="text-sm text-muted-foreground">{r.label}</span>
              <span className={cn("font-mono text-sm font-semibold", r.tone)}>
                <AnimatedCounter value={fees[r.key] as number} prefix="$" />
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
