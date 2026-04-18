import { useEffect, useState } from "react";
import { CalendarDays, Search, Syringe, WalletCards } from "lucide-react";
import AppShell from "@/components/app-shell.jsx";
import { Alert } from "@/components/ui/alert.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import * as catalogService from "@/services/catalog-service.js";

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
  const [vaccines, setVaccines] = useState([]);
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadVaccines() {
      try {
        const data = await catalogService.getPublicVaccines();

        if (isMounted) {
          setVaccines(data);
        }
      } catch (error) {
        if (isMounted) {
          setCatalogError(error.message);
        }
      }
    }

    loadVaccines();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppShell
      title="Patient Dashboard"
      description="Patients now have a stable authenticated shell, and the vaccine catalog phase is visible here while search, availability, and booking flows are built next."
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
            <Badge className="bg-white/10 text-white">Catalog preview</Badge>
            <CardTitle className="text-2xl">Available vaccine types</CardTitle>
            <CardDescription className="text-slate-300">
              This list comes from the shared vaccine catalog managed by admins.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-200">
            {catalogError ? <Alert variant="destructive">{catalogError}</Alert> : null}
            {vaccines.length === 0 ? (
              <p>No vaccines have been added yet. Once admins seed the catalog, patients will see them here.</p>
            ) : (
              vaccines.map((vaccine) => (
                <div
                  key={vaccine.id}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Syringe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{vaccine.name}</p>
                    <p className="mt-1 text-sm text-slate-300">
                      {vaccine.description || "Description will be added by admin."}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {vaccine.dosesRequired} dose{vaccine.dosesRequired > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
