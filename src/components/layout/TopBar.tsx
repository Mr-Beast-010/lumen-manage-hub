import { useEffect, useState } from "react";
import { Bell, Search, Moon, Sun, Command } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "./Breadcrumbs";
import { GlobalStudentSearch } from "@/features/students/dialogs/GlobalStudentSearch";

export function TopBar() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <Breadcrumbs />


      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="relative ml-auto hidden h-10 max-w-md flex-1 items-center gap-2 rounded-md border border-border/60 bg-secondary/40 px-3 pr-16 text-left text-sm text-muted-foreground transition-smooth hover:border-primary/40 md:flex md:max-w-xs lg:max-w-md"
        aria-label="Open global search"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 truncate">Search students, classes, invoices…</span>
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline-flex">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>


      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          onClick={toggle}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gradient-primary animate-pulse-glow" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications <Badge variant="secondary">3 new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { t: "New enrollment", d: "Aria Chen joined Grade 10-B", time: "2m" },
              { t: "Fee payment received", d: "Invoice #2094 · $1,200", time: "1h" },
              { t: "Report ready", d: "Q2 attendance analytics", time: "3h" },
            ].map((n) => (
              <DropdownMenuItem key={n.t} className="flex flex-col items-start gap-0.5 py-3">
                <div className="flex w-full justify-between">
                  <span className="font-medium">{n.t}</span>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </div>
                <span className="text-xs text-muted-foreground">{n.d}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="Account menu" className="flex items-center gap-2 rounded-lg p-1 hover:bg-secondary/60 transition-smooth">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-primary-foreground">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium leading-none">Amelia Diaz</p>
                <p className="text-xs text-muted-foreground">Principal</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/login")} className="text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
