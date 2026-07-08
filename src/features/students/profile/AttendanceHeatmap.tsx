import { cn } from "@/lib/utils";

interface Props {
  data: { week: number; day: number; rate: number }[];
}

function shade(rate: number) {
  if (rate >= 90) return "bg-success/80";
  if (rate >= 75) return "bg-success/55";
  if (rate >= 60) return "bg-warning/60";
  if (rate >= 40) return "bg-warning/40";
  if (rate > 0) return "bg-destructive/50";
  return "bg-secondary/50";
}

export function AttendanceHeatmap({ data }: Props) {
  const weeks = Math.max(...data.map((d) => d.week)) + 1;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        <div className="flex flex-col justify-between pr-1 text-[10px] text-muted-foreground">
          {days.map((d, i) => <span key={d} className={cn(i % 2 ? "opacity-100" : "opacity-0")}>{d}</span>)}
        </div>
        <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}>
          {Array.from({ length: weeks }).map((_, w) => (
            <div key={w} className="grid grid-rows-7 gap-1">
              {Array.from({ length: 7 }).map((__, d) => {
                const cell = data.find((c) => c.week === w && c.day === d);
                return (
                  <div
                    key={d}
                    className={cn("aspect-square rounded-[3px] transition-smooth hover:ring-2 hover:ring-primary/50", shade(cell?.rate ?? 0))}
                    title={cell ? `${cell.rate}% attendance` : "no data"}
                    aria-label={cell ? `Week ${w + 1} ${days[d]}: ${cell.rate}%` : undefined}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        <span className="h-2.5 w-2.5 rounded bg-secondary/50" />
        <span className="h-2.5 w-2.5 rounded bg-warning/40" />
        <span className="h-2.5 w-2.5 rounded bg-success/55" />
        <span className="h-2.5 w-2.5 rounded bg-success/80" />
        <span>More</span>
      </div>
    </div>
  );
}
