import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  description?: string;
}

interface Props {
  steps: Step[];
  current: number;
  onJump?: (i: number) => void;
  completed: Set<number>;
}

export function WizardStepper({ steps, current, onJump, completed }: Props) {
  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-label="Admission steps">
      {steps.map((s, i) => {
        const isActive = i === current;
        const isDone = completed.has(i) && !isActive;
        const clickable = !!onJump && (isDone || i < current);
        return (
          <li key={s.label}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onJump?.(i)}
              className={cn(
                "group relative w-full rounded-xl border p-3 text-left transition-smooth",
                isActive
                  ? "border-primary/60 bg-primary/10 shadow-glow"
                  : isDone
                    ? "border-success/40 bg-success/5 hover:border-success/60"
                    : "border-border/60 bg-card/40",
                clickable && "cursor-pointer",
              )}
              aria-current={isActive ? "step" : undefined}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                    isActive
                      ? "bg-gradient-primary text-primary-foreground"
                      : isDone
                        ? "bg-success/20 text-success"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className="text-xs font-medium text-foreground/90">{s.label}</span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="wizard-underline"
                  className="mt-2 h-0.5 rounded-full bg-gradient-primary"
                />
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
