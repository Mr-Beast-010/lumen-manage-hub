import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Download, FileBarChart, Users, GraduationCap, Wallet, CalendarCheck } from "lucide-react";
import { analytics } from "@/lib/mockData";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const reports = [
  { icon: Users, title: "Enrollment report", desc: "Student intake and demographics." },
  { icon: GraduationCap, title: "Academic performance", desc: "Grades and outcomes per class." },
  { icon: CalendarCheck, title: "Attendance summary", desc: "Daily, weekly, monthly trends." },
  { icon: Wallet, title: "Financial report", desc: "Fees, collections, and outstanding." },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and download analytical reports for stakeholders."
        actions={<Button variant="hero"><FileBarChart /> Generate report</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reports.map((r) => (
          <div key={r.title} className="group card-elevated p-5 transition-smooth hover:border-primary/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <r.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display font-semibold">{r.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
            <Button variant="outline" size="sm" className="mt-4"><Download /> Download</Button>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-elevated p-6">
          <h3 className="font-display text-lg font-semibold">Growth trend</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <LineChart data={analytics.enrollment}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Line type="monotone" dataKey="students" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card-elevated p-6">
          <h3 className="font-display text-lg font-semibold">Attendance rates</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={analytics.attendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[80, 100]} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="rate" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
