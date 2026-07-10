import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, DoorOpen } from "lucide-react";
import { CLASSROOMS, DAYS, PERIODS, TIMETABLE, type TimetableSlot } from "./data";

interface Props {
  slots?: TimetableSlot[];
}

export function ClassroomOccupancy({ slots = TIMETABLE }: Props) {
  const capacity = DAYS.length * PERIODS.length;

  const rows = useMemo(() => {
    return CLASSROOMS.map((r) => {
      const used = slots.filter((s) => s.roomId === r.id).length;
      const pct = Math.round((used / capacity) * 100);
      return { room: r, used, pct };
    }).sort((a, b) => b.pct - a.pct);
  }, [slots, capacity]);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold">Classroom Occupancy</CardTitle>
          <p className="text-xs text-muted-foreground">Room utilization across the week</p>
        </div>
        <Building2 className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((r, i) => (
          <motion.div key={r.room.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            className="rounded-xl border border-border/60 bg-secondary/30 p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <DoorOpen className="h-3.5 w-3.5 text-primary" />
                  {r.room.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Bldg {r.room.building} · Floor {r.room.floor} · cap {r.room.capacity}
                </p>
              </div>
              <Badge variant="outline" className="rounded-md capitalize">{r.room.type}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={r.pct} className="h-1.5 flex-1" />
              <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">
                {r.used}/{capacity}
              </span>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
