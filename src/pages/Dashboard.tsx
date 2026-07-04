import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  Wallet,
  CalendarCheck,
  Plus,
  Download,
  UserPlus,
  ClipboardList,
  FileText,
  Megaphone,
  Calendar,
  Activity,
  ArrowUpRight,
  Sparkles,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/StatCard";
import { analytics, activities, events, announcements } from "@/lib/mockData";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
} as const;

const activityIcon: Record<string, typeof UserPlus> = {
  enrollment: UserPlus,
  payment: Wallet,
  grade: ClipboardList,
  attendance: CalendarCheck,
  report: FileText,
};

const quickActions = [
  { label: "Add student", icon: UserPlus, to: "/students" },
  { label: "Mark attendance", icon: CalendarCheck, to: "/attendance" },
  { label: "Record grades", icon: ClipboardList, to: "/grades" },
  { label: "New invoice", icon: Wallet, to: "/fees" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Dashboard() {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Welcome hero */}
      <motion.section
        {...fadeUp(0)}
        className="glass relative overflow-hidden rounded-3xl p-6 md:p-8"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-10 h-64 w-64 rounded-full bg-gradient-accent opacity-20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge variant="secondary" className="gap-1.5 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" /> {today}
            </Badge>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Welcome back, <span className="gradient-text">Amelia</span>
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Your school is running smoothly. Attendance is up 1.3% this week and 24 new enrollments are pending review.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline"><Download /> Export report</Button>
            <Button variant="hero"><Plus /> New enrollment</Button>
          </div>
        </div>
      </motion.section>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard index={0} label="Total students" value="1,248" delta={8.2} hint="vs last month" icon={Users} />
        <StatCard index={1} label="Teachers" value="56" delta={4.1} hint="active faculty" icon={GraduationCap} />
        <StatCard index={2} label="Attendance rate" value="94.6%" delta={1.3} hint="this week" icon={CalendarCheck} />
        <StatCard index={3} label="Revenue" value="$182.4K" delta={-2.4} hint="MTD" icon={Wallet} />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-5">
        <motion.div {...fadeUp(0.1)} className="card-elevated p-6 lg:col-span-3">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-semibold">Attendance analytics</h2>
              <p className="text-sm text-muted-foreground">Daily attendance rate — last 5 school days</p>
            </div>
            <Badge variant="secondary" className="rounded-full">This week</Badge>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <AreaChart data={analytics.attendance} margin={{ left: -16, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="gAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[80, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#gAtt)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.15)} className="card-elevated p-6 lg:col-span-2">
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-semibold">Fee collection</h2>
              <p className="text-sm text-muted-foreground">Collected vs pending ($K)</p>
            </div>
            <Badge variant="secondary" className="rounded-full">YTD</Badge>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <BarChart data={analytics.feeCollection} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="collected" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" fill="hsl(var(--primary-glow))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Activities + events + quick actions row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div {...fadeUp(0.2)} className="card-elevated p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-semibold">Recent activities</h2>
            </div>
            <Button variant="ghost" size="sm" className="gap-1">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ul className="space-y-1">
            {activities.map((a) => {
              const Icon = activityIcon[a.type] ?? Activity;
              return (
                <li key={a.id} className="flex gap-3 rounded-xl p-2 transition-smooth hover:bg-secondary/50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{a.time}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </motion.div>

        <motion.div {...fadeUp(0.25)} className="card-elevated p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-semibold">Upcoming events</h2>
            </div>
            <Button variant="ghost" size="sm" className="gap-1">
              Calendar <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ul className="space-y-3">
            {events.map((e) => (
              <li key={e.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/30 p-3 transition-smooth hover:border-primary/40">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
                  <span className="text-[10px] font-medium uppercase leading-none opacity-80">{e.date.split(" ")[0]}</span>
                  <span className="text-base font-bold leading-none">{e.date.split(" ")[1]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.time}</p>
                </div>
                <Badge variant="secondary" className="rounded-full text-[10px]">{e.tag}</Badge>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div {...fadeUp(0.3)} className="space-y-4">
          <div className="card-elevated p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-semibold">Quick actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((q) => (
                <button
                  key={q.label}
                  className="group flex flex-col items-start gap-2 rounded-xl border border-border/60 bg-secondary/30 p-3 text-left transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-elegant">
                    <q.icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-medium">{q.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card-elevated p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                <h2 className="font-display text-lg font-semibold">Announcements</h2>
              </div>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
            <ul className="space-y-3">
              {announcements.map((n) => (
                <li key={n.id} className="border-l-2 border-primary/60 pl-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
