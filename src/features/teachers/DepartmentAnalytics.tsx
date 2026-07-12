import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { Users, Clock, CalendarCheck, PlaneTakeoff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TeacherRecord } from "./data";

interface Props { rows: TeacherRecord[] }

export function DepartmentAnalytics({ rows }: Props) {
  const [type, setType] = useState<"all" | "teaching" | "non-teaching">("all");

  const data = useMemo(() => {
    const filtered = rows.filter((r) => type === "all" || r.type === type);
    const byDept = new Map<string, TeacherRecord[]>();
    filtered.forEach((r) => {
      const list = byDept.get(r.department) ?? [];
      list.push(r);
      byDept.set(r.department, list);
    });
    return Array.from(byDept.entries()).map(([dept, list]) => {
      const avgExp = list.reduce((s, r) => s + r.experience, 0) / list.length;
      const avgAtt = list.reduce((s, r) => s + r.attendance, 0) / list.length;
      const onLeave = list.filter((r) => r.status === "on-leave").length;
      const workload = list.reduce((s, r) => s + r.classes.length, 0);
      return {
        dept, count: list.length,
        avgExperience: Math.round(avgExp * 10) / 10,
        attendance: Math.round(avgAtt),
        onLeave,
        workload,
      };
    }).sort((a, b) => b.count - a.count);
  }, [rows, type]);

  const totals = useMemo(() => ({
    departments: data.length,
    avgExp: data.length ? Math.round((data.reduce((s, d) => s + d.avgExperience, 0) / data.length) * 10) / 10 : 0,
    avgAtt: data.length ? Math.round(data.reduce((s, d) => s + d.attendance, 0) / data.length) : 0,
    onLeave: data.reduce((s, d) => s + d.onLeave, 0),
  }), [data]);

  const kpis = [
    { label: "Departments", value: String(totals.departments), icon: Users },
    { label: "Avg experience", value: `${totals.avgExp} yrs`, icon: Clock },
    { label: "Avg attendance", value: `${totals.avgAtt}%`, icon: CalendarCheck },
    { label: "On leave", value: String(totals.onLeave), icon: PlaneTakeoff },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Department analytics</h3>
          <p className="text-sm text-muted-foreground">Headcount, experience, attendance & workload by department.</p>
        </div>
        <Select value={type} onValueChange={(v: "all" | "teaching" | "non-teaching") => setType(v)}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All staff</SelectItem>
            <SelectItem value="teaching">Teaching only</SelectItem>
            <SelectItem value="non-teaching">Non-teaching</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="rounded-2xl">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <k.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</p>
                  <p className="font-display text-lg font-bold">{k.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Headcount & workload</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="dept" fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" name="Teachers" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="workload" name="Total classes" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-base font-semibold">Department breakdown</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="py-2 text-left">Department</th>
                <th className="py-2 text-right">Staff</th>
                <th className="py-2 text-right">Avg experience</th>
                <th className="py-2 text-right">Attendance</th>
                <th className="py-2 text-right">On leave</th>
                <th className="py-2 text-right">Workload</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.dept} className="border-b border-border/60">
                  <td className="py-2 font-medium">{d.dept}</td>
                  <td className="py-2 text-right tabular-nums">{d.count}</td>
                  <td className="py-2 text-right tabular-nums">{d.avgExperience} yrs</td>
                  <td className="py-2 text-right tabular-nums">{d.attendance}%</td>
                  <td className="py-2 text-right tabular-nums">{d.onLeave}</td>
                  <td className="py-2 text-right tabular-nums">{d.workload} classes</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">No data.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
