import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Save, X, PartyPopper } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { WizardStepper } from "./WizardStepper";
import {
  admissionFormSchema,
  defaultAdmissionValues,
  generateAdmissionNo,
  type AdmissionFormValues,
} from "./schema";
import {
  PersonalStep, AdmissionStep, GuardianStep, MedicalStep, DocumentsStep, ReviewStep,
} from "./steps";

const STORAGE_KEY = "edumanage.admission.draft.v1";

const STEPS = [
  { label: "Personal", fields: ["personal"] as const },
  { label: "Admission", fields: ["admission"] as const },
  { label: "Guardian", fields: ["guardian"] as const },
  { label: "Medical", fields: ["medical"] as const },
  { label: "Documents", fields: ["documents"] as const },
  { label: "Review", fields: [] as const },
];

interface Props {
  onSubmit?: (values: AdmissionFormValues) => string; // returns generated student id
  onCancel?: () => void;
}

export function AdmissionWizard({ onSubmit, onCancel }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [success, setSuccess] = useState<{ id: string; name: string } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionFormSchema),
    defaultValues: defaultAdmissionValues,
    mode: "onBlur",
  });

  // Load draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        form.reset(parsed.values);
        setStep(parsed.step ?? 0);
        setCompleted(new Set(parsed.completed ?? []));
        toast.info("Draft restored", { description: "Your previous progress was loaded." });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave on changes (debounced)
  useEffect(() => {
    const sub = form.watch((values) => {
      const t = window.setTimeout(() => {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ values, step, completed: [...completed] }),
        );
        setSavedAt(new Date());
      }, 700);
      return () => window.clearTimeout(t);
    });
    return () => sub.unsubscribe();
  }, [form, step, completed]);

  const focusTop = () => contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const goNext = async () => {
    const fields = STEPS[step].fields;
    const ok = fields.length === 0 ? true : await form.trigger(fields as unknown as (keyof AdmissionFormValues)[]);
    if (!ok) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setCompleted((c) => new Set(c).add(step));
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    focusTop();
  };

  const goPrev = () => { setStep((s) => Math.max(0, s - 1)); focusTop(); };

  const jump = (i: number) => { setStep(i); focusTop(); };

  const saveDraft = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ values: form.getValues(), step, completed: [...completed] }),
    );
    setSavedAt(new Date());
    toast.success("Draft saved");
  };

  const cancel = () => {
    if (onCancel) return onCancel();
    navigate("/students");
  };

  const submit = form.handleSubmit((values) => {
    const id = onSubmit ? onSubmit(values) : `STU-${Math.floor(1000 + Math.random() * 8999)}`;
    localStorage.removeItem(STORAGE_KEY);
    setSuccess({ id, name: `${values.personal.firstName} ${values.personal.lastName}`.trim() });
  });

  if (success) return <SuccessScreen id={success.id} name={success.name} onAnother={() => {
    form.reset({ ...defaultAdmissionValues, admission: { ...defaultAdmissionValues.admission, admissionNo: generateAdmissionNo() } });
    setStep(0); setCompleted(new Set()); setSuccess(null);
  }} />;

  const isReview = step === STEPS.length - 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Student Admission"
        description="Complete the six-step admission workflow to enroll a student."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={cancel} type="button"><X /> Cancel</Button>
            <Button variant="outline" onClick={saveDraft} type="button"><Save /> Save draft</Button>
          </div>
        }
      />

      <WizardStepper
        steps={STEPS.map((s) => ({ label: s.label }))}
        current={step}
        completed={completed}
        onJump={jump}
      />

      <div className="h-1 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
        <motion.div
          className="h-full bg-gradient-primary"
          initial={false}
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <Card className="glass border-border/60">
        <CardContent className="p-4 sm:p-6" ref={contentRef}>
          <FormProvider {...form}>
            <form onSubmit={(e) => e.preventDefault()} noValidate>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {step === 0 && <PersonalStep />}
                  {step === 1 && <AdmissionStep />}
                  {step === 2 && <GuardianStep />}
                  {step === 3 && <MedicalStep />}
                  {step === 4 && <DocumentsStep />}
                  {step === 5 && <ReviewStep onJump={jump} />}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex flex-col-reverse items-stretch gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-muted-foreground">
                  {savedAt ? `Autosaved at ${savedAt.toLocaleTimeString()}` : "Changes autosave as you type"}
                </div>
                <div className="flex gap-2 sm:justify-end">
                  <Button type="button" variant="outline" onClick={goPrev} disabled={step === 0}>
                    <ArrowLeft /> Previous
                  </Button>
                  {isReview ? (
                    <Button type="button" variant="hero" onClick={submit}>
                      <CheckCircle2 /> Create Student
                    </Button>
                  ) : (
                    <Button type="button" variant="default" onClick={goNext}>
                      Next <ArrowRight />
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}

function SuccessScreen({ id, name, onAnother }: { id: string; name: string; onAnother: () => void }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-xl"
    >
      <Card className="glass border-primary/30 text-center">
        <CardContent className="space-y-6 p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -8, 8, 0] }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary shadow-glow"
          >
            <PartyPopper className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Welcome, {name}!</h2>
            <p className="text-sm text-muted-foreground">Admission completed successfully.</p>
            <p className="font-mono text-sm">
              Student ID: <span className="rounded-md bg-primary/10 px-2 py-0.5 text-primary">{id}</span>
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="hero" onClick={() => navigate("/students")}>View Student</Button>
            <Button variant="outline" onClick={onAnother}>Add another</Button>
            <Button variant="ghost" onClick={() => navigate("/")}>Return to Dashboard</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
