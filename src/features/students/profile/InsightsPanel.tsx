import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, AlertOctagon, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProfileInsight } from "./mockProfile";

const cfg: Record<ProfileInsight["tone"], { icon: any; ring: string; chip: string; label: string }> = {
  positive: { icon: CheckCircle2, ring: "ring-success/30", chip: "bg-success/10 text-success", label: "On track" },
  warning: { icon: AlertTriangle, ring: "ring-warning/30", chip: "bg-warning/10 text-warning", label: "Watch" },
  critical: { icon: AlertOctagon, ring: "ring-destructive/30", chip: "bg-destructive/10 text-destructive", label: "Action" },
  info: { icon: Info, ring: "ring-primary/30", chip: "bg-primary/10 text-primary", label: "Insight" },
};

export function InsightsPanel({ insights, onAction }: { insights: ProfileInsight[]; onAction?: (i: ProfileInsight) => void }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
      <header className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold">Profile insights</h3>
          <p className="text-xs text-muted-foreground">AI-generated summary based on recent activity</p>
        </div>
      </header>
      <ul className="space-y-3">
        {insights.map((i, idx) => {
          const c = cfg[i.tone];
          const Icon = c.icon;
          return (
            <motion.li
              key={i.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={cn("flex flex-col gap-2 rounded-xl border border-border bg-secondary/30 p-3 ring-1 sm:flex-row sm:items-start sm:justify-between", c.ring)}
            >
              <div className="flex items-start gap-3">
                <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", c.chip)}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{i.title}</p>
                    <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider", c.chip)}>{c.label}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{i.description}</p>
                </div>
              </div>
              {i.action && (
                <Button size="sm" variant="outline" className="self-start sm:self-center" onClick={() => onAction?.(i)}>
                  {i.action}
                </Button>
              )}
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
