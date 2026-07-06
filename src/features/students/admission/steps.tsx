import { useFormContext } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, FileCheck2, File as FileIcon } from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";
import { DOCUMENT_SLOTS, type AdmissionFormValues } from "./schema";
import { cn } from "@/lib/utils";

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"] as const;

type F = AdmissionFormValues;

/* ---------------- Step 1: Personal ---------------- */
export function PersonalStep() {
  const form = useFormContext<F>();
  const fileRef = useRef<HTMLInputElement>(null);
  const photo = form.watch("personal.photo");

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => form.setValue("personal.photo", String(reader.result), { shouldDirty: true });
    reader.readAsDataURL(f);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border-2 border-primary/40">
          <AvatarImage src={photo || undefined} alt="Student profile photo preview" />
          <AvatarFallback className="bg-muted"><Camera className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium">Profile Photo</p>
          <p className="text-xs text-muted-foreground">PNG or JPG, up to 5MB</p>
          <div className="flex gap-2 pt-1">
            <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" /> Upload
            </Button>
            {photo && (
              <Button type="button" size="sm" variant="ghost" onClick={() => form.setValue("personal.photo", "")}>
                <X className="h-3.5 w-3.5" /> Remove
              </Button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="Upload profile photo"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField control={form.control} name="personal.firstName" render={({ field }) => (
          <FormItem><FormLabel>First name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="personal.middleName" render={({ field }) => (
          <FormItem><FormLabel>Middle name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="personal.lastName" render={({ field }) => (
          <FormItem><FormLabel>Last name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField control={form.control} name="personal.dob" render={({ field }) => (
          <FormItem><FormLabel>Date of birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="personal.gender" render={({ field }) => (
          <FormItem>
            <FormLabel>Gender</FormLabel>
            <FormControl>
              <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4 pt-2">
                {(["male", "female", "other"] as const).map((v) => (
                  <div key={v} className="flex items-center gap-2">
                    <RadioGroupItem value={v} id={`gender-${v}`} />
                    <Label htmlFor={`gender-${v}`} className="capitalize">{v}</Label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="personal.bloodGroup" render={({ field }) => (
          <FormItem>
            <FormLabel>Blood group</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>{BLOOD.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField control={form.control} name="personal.nationality" render={({ field }) => (
          <FormItem><FormLabel>Nationality</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="personal.religion" render={({ field }) => (
          <FormItem><FormLabel>Religion</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="personal.aadhaar" render={({ field }) => (
          <FormItem><FormLabel>Aadhaar (optional)</FormLabel><FormControl><Input inputMode="numeric" maxLength={12} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField control={form.control} name="personal.mobile" render={({ field }) => (
          <FormItem><FormLabel>Mobile</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="personal.email" render={({ field }) => (
          <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>

      <FormField control={form.control} name="personal.address" render={({ field }) => (
        <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
      )} />

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField control={form.control} name="personal.city" render={({ field }) => (
          <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="personal.state" render={({ field }) => (
          <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="personal.postalCode" render={({ field }) => (
          <FormItem><FormLabel>Postal code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>
    </div>
  );
}

/* ---------------- Step 2: Admission ---------------- */
export function AdmissionStep() {
  const form = useFormContext<F>();
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField control={form.control} name="admission.admissionNo" render={({ field }) => (
          <FormItem><FormLabel>Admission number</FormLabel><FormControl><Input readOnly className="bg-muted/40" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="admission.rollNo" render={({ field }) => (
          <FormItem><FormLabel>Roll number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="admission.academicYear" render={({ field }) => (
          <FormItem><FormLabel>Academic year</FormLabel><FormControl><Input placeholder="2026-27" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField control={form.control} name="admission.className" render={({ field }) => (
          <FormItem>
            <FormLabel>Class</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>{["6","7","8","9","10","11","12"].map((c) => <SelectItem key={c} value={c}>Grade {c}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="admission.section" render={({ field }) => (
          <FormItem>
            <FormLabel>Section</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>{["A","B","C","D"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="admission.house" render={({ field }) => (
          <FormItem>
            <FormLabel>House</FormLabel>
            <Select value={field.value || ""} onValueChange={field.onChange}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger></FormControl>
              <SelectContent>{["Red","Blue","Green","Yellow"].map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField control={form.control} name="admission.admissionDate" render={({ field }) => (
          <FormItem><FormLabel>Admission date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="admission.previousSchool" render={({ field }) => (
          <FormItem><FormLabel>Previous school</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField control={form.control} name="admission.transportRequired" render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 p-4">
            <div><FormLabel className="text-sm">Transport required</FormLabel><p className="text-xs text-muted-foreground">Assign a bus route</p></div>
            <FormControl><Switch checked={!!field.value} onCheckedChange={field.onChange} aria-label="Transport required" /></FormControl>
          </FormItem>
        )} />
        <FormField control={form.control} name="admission.hostelRequired" render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 p-4">
            <div><FormLabel className="text-sm">Hostel required</FormLabel><p className="text-xs text-muted-foreground">Allocate hostel room</p></div>
            <FormControl><Switch checked={!!field.value} onCheckedChange={field.onChange} aria-label="Hostel required" /></FormControl>
          </FormItem>
        )} />
      </div>
    </div>
  );
}

/* ---------------- Step 3: Guardian ---------------- */
function ParentBlock({ prefix, title }: { prefix: "father" | "mother"; title: string }) {
  const form = useFormContext<F>();
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground/90">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField control={form.control} name={`guardian.${prefix}.name` as const} render={({ field }) => (
          <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name={`guardian.${prefix}.occupation` as const} render={({ field }) => (
          <FormItem><FormLabel>Occupation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name={`guardian.${prefix}.mobile` as const} render={({ field }) => (
          <FormItem><FormLabel>Mobile</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name={`guardian.${prefix}.email` as const} render={({ field }) => (
          <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>
    </div>
  );
}

export function GuardianStep() {
  const form = useFormContext<F>();
  return (
    <div className="space-y-5">
      <ParentBlock prefix="father" title="Father" />
      <ParentBlock prefix="mother" title="Mother" />
      <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground/90">Emergency Contact</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField control={form.control} name="guardian.emergency.name" render={({ field }) => (
            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="guardian.emergency.relationship" render={({ field }) => (
            <FormItem><FormLabel>Relationship</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="guardian.emergency.phone" render={({ field }) => (
            <FormItem><FormLabel>Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Step 4: Medical ---------------- */
export function MedicalStep() {
  const form = useFormContext<F>();
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField control={form.control} name="medical.bloodGroup" render={({ field }) => (
          <FormItem>
            <FormLabel>Blood group</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>{BLOOD.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="medical.doctorName" render={({ field }) => (
          <FormItem><FormLabel>Family doctor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>
      {(["allergies","conditions","disabilities","medications","emergencyNotes"] as const).map((k) => (
        <FormField key={k} control={form.control} name={`medical.${k}` as const} render={({ field }) => (
          <FormItem>
            <FormLabel className="capitalize">
              {k === "conditions" ? "Existing medical conditions" : k === "emergencyNotes" ? "Emergency notes" : k}
            </FormLabel>
            <FormControl><Textarea rows={2} placeholder="None" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      ))}
    </div>
  );
}

/* ---------------- Step 5: Documents ---------------- */
export function DocumentsStep() {
  const form = useFormContext<F>();
  const files = form.watch("documents.files") || {};
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [dragKey, setDragKey] = useState<string | null>(null);

  const handleFile = useCallback((key: string, file: File) => {
    setProgress((p) => ({ ...p, [key]: 5 }));
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) setProgress((p) => ({ ...p, [key]: Math.round((e.loaded / e.total) * 100) }));
    };
    reader.onload = () => {
      const dataUrl = file.type.startsWith("image/") ? String(reader.result) : undefined;
      form.setValue(`documents.files.${key}` as const, {
        name: file.name, size: file.size, type: file.type, dataUrl,
      }, { shouldDirty: true });
      setProgress((p) => ({ ...p, [key]: 100 }));
      setTimeout(() => setProgress((p) => { const c = { ...p }; delete c[key]; return c; }), 400);
    };
    reader.readAsDataURL(file);
  }, [form]);

  const remove = (key: string) => {
    const next = { ...files };
    delete next[key];
    form.setValue("documents.files", next, { shouldDirty: true });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {DOCUMENT_SLOTS.map((slot) => {
        const f = files[slot.key];
        const pct = progress[slot.key];
        const isDrag = dragKey === slot.key;
        return (
          <div
            key={slot.key}
            onDragOver={(e) => { e.preventDefault(); setDragKey(slot.key); }}
            onDragLeave={() => setDragKey(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragKey(null);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(slot.key, file);
            }}
            className={cn(
              "relative flex flex-col rounded-xl border-2 border-dashed p-4 transition-smooth",
              isDrag ? "border-primary bg-primary/10" : "border-border/60 bg-card/40",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{slot.label}</span>
              {f && <FileCheck2 className="h-4 w-4 text-success" aria-label="Uploaded" />}
            </div>

            {!f ? (
              <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg py-6 text-center hover:bg-primary/5">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Drag &amp; drop or click to upload</span>
                <input
                  type="file"
                  className="sr-only"
                  aria-label={`Upload ${slot.label}`}
                  onChange={(e) => e.target.files?.[0] && handleFile(slot.key, e.target.files[0])}
                />
              </label>
            ) : (
              <div className="mt-3 flex items-center gap-3 rounded-lg bg-background/40 p-2">
                {f.dataUrl ? (
                  <img src={f.dataUrl} alt={`${slot.label} preview`} className="h-12 w-12 rounded-md object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted"><FileIcon className="h-5 w-5 text-muted-foreground" /></div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{f.name}</p>
                  <p className="text-[11px] text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button type="button" size="icon" variant="ghost" onClick={() => remove(slot.key)} aria-label={`Remove ${slot.label}`}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {pct !== undefined && (
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-gradient-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Step 6: Review ---------------- */
function Row({ label, value }: { label: string; value?: string | number | boolean }) {
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : value || "—";
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground/90 truncate max-w-[60%]">{String(display)}</span>
    </div>
  );
}

function Section({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button type="button" size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
      </div>
      <div className="divide-y divide-border/40">{children}</div>
    </div>
  );
}

export function ReviewStep({ onJump }: { onJump: (i: number) => void }) {
  const form = useFormContext<F>();
  const v = form.getValues();
  const p = v.personal, a = v.admission, g = v.guardian, m = v.medical;
  const docCount = Object.keys(v.documents.files || {}).length;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Section title="Personal" onEdit={() => onJump(0)}>
        <Row label="Name" value={`${p.firstName} ${p.middleName || ""} ${p.lastName}`.trim()} />
        <Row label="DOB" value={p.dob} />
        <Row label="Gender" value={p.gender} />
        <Row label="Blood group" value={p.bloodGroup} />
        <Row label="Mobile" value={p.mobile} />
        <Row label="Email" value={p.email} />
        <Row label="Address" value={`${p.address}, ${p.city}, ${p.state} ${p.postalCode}`} />
      </Section>
      <Section title="Admission" onEdit={() => onJump(1)}>
        <Row label="Admission No" value={a.admissionNo} />
        <Row label="Roll No" value={a.rollNo} />
        <Row label="Class / Section" value={`${a.className} - ${a.section}`} />
        <Row label="Academic year" value={a.academicYear} />
        <Row label="House" value={a.house} />
        <Row label="Admission date" value={a.admissionDate} />
        <Row label="Previous school" value={a.previousSchool} />
        <Row label="Transport" value={a.transportRequired} />
        <Row label="Hostel" value={a.hostelRequired} />
      </Section>
      <Section title="Guardian" onEdit={() => onJump(2)}>
        <Row label="Father" value={`${g.father.name} • ${g.father.mobile}`} />
        <Row label="Mother" value={`${g.mother.name} • ${g.mother.mobile}`} />
        <Row label="Emergency" value={`${g.emergency.name} (${g.emergency.relationship}) • ${g.emergency.phone}`} />
      </Section>
      <Section title="Medical" onEdit={() => onJump(3)}>
        <Row label="Blood group" value={m.bloodGroup} />
        <Row label="Allergies" value={m.allergies} />
        <Row label="Conditions" value={m.conditions} />
        <Row label="Medications" value={m.medications} />
        <Row label="Doctor" value={m.doctorName} />
      </Section>
      <Section title="Documents" onEdit={() => onJump(4)}>
        <Row label="Uploaded" value={`${docCount} of ${DOCUMENT_SLOTS.length}`} />
        {DOCUMENT_SLOTS.map((s) => (
          <Row key={s.key} label={s.label} value={v.documents.files?.[s.key]?.name} />
        ))}
      </Section>
    </div>
  );
}
