import { motion } from "framer-motion";
import { UserPlus, CalendarCheck2, Wallet, GraduationCap, FileUp, Pencil } from "lucide-react";
import type { TimelineEvent } from "./mockProfile";
import { cn } from "@/lib/utils";

const iconMap = {
  admission: UserPlus,
  attendance: CalendarCheck2,
  fees: Wallet,
  results: GraduationCap,
  documents: FileUp,
  profile: Pencil,
} as const;

const toneMap: Record<TimelineEvent["type"], string> = {
  admission: "bg-primary/10 text-primary ring-primary/20",
  attendance: "bg-accent/10 text-accent ring-accent/20",
  fees: "bg-success/10 text-success ring-success/20",
  results: "bg-primary/10 text-primary ring-primary/20",
  documents: "bg-warning/10 text-warning ring-warning/20",
  profile: "bg-muted text-muted-foreground ring-border",
};

export function ActivityTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {events.map((e, i) => {
        const Icon = iconMap[e.type];
        return (
          <motion.li
            key={e.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="relative"
          >
            <span
              className={cn(
                "absolute -left-[34px] flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-background",
                toneMap[e.type],
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="rounded-xl border border-border bg-card/60 p-4 transition-smooth hover:border-primary/30">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-sm font-semibold">{e.title}</h4>
                <time className="font-mono text-xs text-muted-foreground">{e.timestamp}</time>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
