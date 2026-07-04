import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your school, team, and platform preferences." />
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="card-elevated max-w-2xl space-y-5 p-6">
            <div className="grid gap-2">
              <Label htmlFor="school">School name</Label>
              <Input id="school" defaultValue="Aurora International School" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Contact email</Label>
              <Input id="email" type="email" defaultValue="admin@aurora.edu" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tz">Timezone</Label>
              <Input id="tz" defaultValue="UTC-05:00 · Eastern" />
            </div>
            <Button variant="hero" onClick={() => toast.success("Settings saved")}>Save changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="card-elevated max-w-2xl divide-y divide-border p-2">
            {[
              { t: "Email digests", d: "Daily summary of school activity." },
              { t: "Fee reminders", d: "Send automatic reminders for overdue invoices." },
              { t: "Grade releases", d: "Notify parents when grades are published." },
            ].map((s) => (
              <div key={s.t} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{s.t}</p>
                  <p className="text-sm text-muted-foreground">{s.d}</p>
                </div>
                <Switch defaultChecked aria-label={s.t} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="card-elevated max-w-2xl space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-factor authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra security layer to sign-in.</p>
              </div>
              <Switch aria-label="2FA" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pwd">Change password</Label>
              <Input id="pwd" type="password" placeholder="New password" />
            </div>
            <Button variant="hero" onClick={() => toast.success("Security settings updated")}>Update</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
