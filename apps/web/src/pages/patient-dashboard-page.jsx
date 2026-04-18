import { CalendarDays, Search, WalletCards } from "lucide-react";
import AppShell from "@/components/app-shell.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";

const patientSteps = [
  {
    title: "Search hospitals",
    description: "Next phase should let patients search by city, pincode, hospital, and vaccine.",
    icon: Search,
  },
  {
    title: "View time slots",
    description: "Availability should show actual slot windows, not only daily counts.",
    icon: CalendarDays,
  },
  {
    title: "Manage bookings",
    description: "Patients should be able to confirm, modify, or cancel their booking safely.",
    icon: WalletCards,
  },
];

export default function PatientDashboardPage() {
  return (
    <AppShell
      title="Patient Dashboard"
      description="This first slice gets the patient authenticated and inside a stable app shell. Search, slot viewing, and booking flows should plug into this route next."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <Badge>Current state</Badge>
            <CardTitle>You are authenticated as a patient.</CardTitle>
            <CardDescription>
              The next implementation pass should attach real search, hospital details, price
              visibility, and booking actions to this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {patientSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-border bg-background p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-slate-950 text-slate-50">
          <CardHeader>
            <Badge className="bg-white/10 text-white">Suggested next build</Badge>
            <CardTitle className="text-2xl">Patient flow contract</CardTitle>
            <CardDescription className="text-slate-300">
              Keep the frontend thin. Let the API own pricing, slot availability, and booking rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-200">
            <p>1. Search hospitals and offerings through one filter endpoint.</p>
            <p>2. Show hospital pricing and time-slot availability together.</p>
            <p>3. Confirm bookings only after the backend locks the price and slot.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
