import { useState } from "react";
import { Bell, CheckCircle2, XCircle, Wallet, Clock, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notificationsSeed, type NotificationItem } from "./data";
import { cn } from "@/lib/utils";

const icons = {
  "leave-approved": CheckCircle2,
  "leave-rejected": XCircle,
  "payroll-available": Wallet,
  "attendance-reminder": Clock,
} as const;

const tones: Record<NotificationItem["type"], string> = {
  "leave-approved": "text-success bg-success/10 ring-success/20",
  "leave-rejected": "text-destructive bg-destructive/10 ring-destructive/20",
  "payroll-available": "text-primary bg-primary/10 ring-primary/20",
  "attendance-reminder": "text-warning bg-warning/10 ring-warning/20",
};

export function NotificationsMenu() {
  const [items, setItems] = useState<NotificationItem[]>(notificationsSeed);
  const unread = items.filter((n) => !n.read).length;

  const markAll = () => setItems((xs) => xs.map((n) => ({ ...n, read: true })));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications (${unread} unread)`}>
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <header className="flex items-center justify-between border-b border-border p-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-[11px] text-muted-foreground">{unread} unread</p>
          </div>
          <Button size="sm" variant="ghost" onClick={markAll} disabled={unread === 0}>
            <Check className="mr-1 h-3.5 w-3.5" /> Mark all
          </Button>
        </header>
        <ScrollArea className="max-h-80">
          <ul className="divide-y divide-border" role="list">
            {items.map((n) => {
              const Icon = icons[n.type];
              return (
                <li key={n.id} className={cn("flex gap-3 p-3", !n.read && "bg-primary/5")}>
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1", tones[n.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{n.title}</p>
                      {!n.read && <Badge variant="outline" className="h-4 px-1 text-[9px]">NEW</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{n.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
