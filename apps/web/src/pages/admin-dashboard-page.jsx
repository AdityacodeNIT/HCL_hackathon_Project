import { Building2, Clock3, ClipboardList } from "lucide-react";
import AppShell from "@/components/app-shell.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";

const adminModules = [
  {
    title: "Hospital management",
    description: "Create and update hospital records without mixing them into auth logic.",
    icon: Building2,
  },
  {
    title: "Time-slot management",
    description: "Set actual slot windows and available capacity by hospital, vaccine, and date.",
    icon: Clock3,
  },
  {
    title: "Booking operations",
    description: "Review bookings for the selected day with clean filters and fast visibility.",
    icon: ClipboardList,
  },
];

export default function AdminDashboardPage() {
  return (
    <AppShell
      title="Admin Dashboard"
      description="Admins now have a dedicated authenticated shell. This is where hospital setup, slot configuration, and operational booking views should land next."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-slate-950 text-slate-50">
          <CardHeader>
            <Badge className="bg-white/10 text-white">Real role path</Badge>
            <CardTitle className="text-2xl">You are inside the admin surface.</CardTitle>
            <CardDescription className="text-slate-300">
              The route is protected by JWT auth and role checks from the backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-200">
            <p>1. Auth stays isolated in the `auth` module.</p>
            <p>2. New backend features should follow routes -&gt; controller -&gt; service -&gt; repo.</p>
            <p>3. Database work should stay inside migrations and repo queries, not scattered.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge>Next modules</Badge>
            <CardTitle>Admin build sequence</CardTitle>
            <CardDescription>
              The admin path should own hospital setup before patient search and booking go live.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {adminModules.map((module) => {
              const Icon = module.icon;

              return (
                <div
                  key={module.title}
                  className="flex gap-4 rounded-2xl border border-border bg-background p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{module.title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{module.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
