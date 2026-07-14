import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Clock, MapPin, User } from "lucide-react";
import {
  CLASSES, DAYS, PERIODS, TIMETABLE, getClassroom, getSubject, getTeacher,
  type Day, type TimetableSlot,
} from "./data";
import { EmptyState } from "@/components/shared/EmptyState";
import { CalendarX } from "lucide-react";

interface Props { slots?: TimetableSlot[]; }

export function DailyAgenda({ slots = TIMETABLE }: Props) {
  const todayIdx = Math.min((new Date().getDay() + 6) % 7, DAYS.length - 1);
  const [day, setDay] = useState<Day>(DAYS[todayIdx]);
  const [classId, setClassId] = useState<string>(CLASSES[0].id);

  const dayItems = useMemo(
    () => PERIODS.map((p) => ({
      period: p,
      slot: slots.find((s) => s.day === day && s.periodId === p.id && s.classId === classId),
    })),
    [slots, day, classId],
  );

  const scheduledCount = dayItems.filter((i) => i.slot).length;

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-col gap-3 space-y-0 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-base font-semibold">Daily Agenda</CardTitle>
          <p className="text-xs text-muted-foreground">
            {scheduledCount} of {PERIODS.length} periods scheduled
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger className="w-40" aria-label="Class"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CLASSES.map((c) => (
                <SelectItem key={c.id} value={c.id}>Grade {c.grade}-{c.section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={day} onValueChange={(v) => setDay(v as Day)}>
            <SelectTrigger className="w-32" aria-label="Day"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {scheduledCount === 0 ? (
          <EmptyState icon={CalendarX} title="No classes scheduled" description={`${day} is free for this class.`} />
        ) : (
          dayItems.map(({ period, slot }, i) => (
            <motion.div
              key={period.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className="flex items-stretch gap-3 rounded-xl border border-border/60 bg-card/60 p-3"
            >
              <div className="flex w-20 shrink-0 flex-col items-start justify-center border-r border-border/40 pr-3">
                <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-3 w-3" /> {period.id}
                </p>
                <p className="mt-1 text-xs tabular-nums text-foreground">{period.start}</p>
                <p className="text-[10px] tabular-nums text-muted-foreground">{period.end}</p>
              </div>
              <div className="min-w-0 flex-1">
                {slot ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="truncate font-display font-semibold">
                        {getSubject(slot.subjectCode)?.name ?? slot.subjectCode}
                      </p>
                      <Badge variant="outline" className="rounded-md">Grade {slot.classId}</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {getTeacher(slot.teacherId)?.name ?? "—"}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {getClassroom(slot.roomId)?.name ?? slot.roomId}</span>
                    </div>
                  </>
                ) : (
                  <p className="pt-2 text-xs uppercase tracking-wider text-muted-foreground/60">Free period</p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
