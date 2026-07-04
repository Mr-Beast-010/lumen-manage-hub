import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { OfflineState } from "@/components/shared/OfflineState";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-dvh w-full bg-background">
        <div className="pointer-events-none fixed inset-0 bg-hero opacity-60" aria-hidden />
        <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" aria-hidden />
        <AppSidebar />
        <div className="relative z-10 flex min-w-0 flex-1 flex-col">
          <TopBar />
          <OfflineState />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
