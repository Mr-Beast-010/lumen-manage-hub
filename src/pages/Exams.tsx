import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export default function Exams() {
  return (
    <div className="space-y-6">
      <PageHeader title="Exams" description="Schedule, publish, and grade exams across all classes." />
      <EmptyState
        icon={ClipboardList}
        title="Exams module coming soon"
        description="This module is part of Phase 2 — full exam scheduling, question banks, and result publishing."
        action={<Button variant="hero">Notify me</Button>}
      />
    </div>
  );
}
