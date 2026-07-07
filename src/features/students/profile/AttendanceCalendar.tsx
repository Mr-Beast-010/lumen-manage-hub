import { cn } from "@/lib/utils";

interface Props {
  month: string; // e.g. "2026-07"
  data: { date: string; status: "present" | "absent" | "late" }[];
}

const toneMap = {
  present: "bg-success/70 text-success-foreground",
  absent: "bg-destructive/70 text-destructive-foreground",
  late: "bg-warning/70 text-warning-foreground",
} as const;

export function AttendanceCalendar({ month, data }: Props) {
  const [year, m] = month.split("-").map(Number);
  const first = new Date(year, m - 1, 1);
  const daysInMonth = new Date(year, m, 0).getDate();
  const startDay = first.getDay();
  const cells = Array.from({ length: startDay + daysInMonth });
  const map = new Map(data.map((d) => [Number(d.date.split("-")[2]), d.status]));

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((_, i) => {
          const day = i - startDay + 1;
          if (day < 1) return <div key={i} />;
          const status = map.get(day);
          return (
            <div
              key={i}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg border border-border text-xs font-medium",
                status ? toneMap[status] : "bg-secondary/40 text-muted-foreground",
              )}
              title={status ?? "no data"}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-success/70" /> Present</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-warning/70" /> Late</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-destructive/70" /> Absent</span>
      </div>
    </div>
  );
}
