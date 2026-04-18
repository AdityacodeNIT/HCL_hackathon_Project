import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPinned,
  RefreshCcw,
  Search,
  ShieldCheck,
  Syringe,
  WalletCards,
} from "lucide-react";
import AppShell from "@/components/app-shell.jsx";
import { Alert } from "@/components/ui/alert.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Select } from "@/components/ui/select.jsx";
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

const initialFilters = {
  name: "",
  city: "",
  pincode: "",
  vaccineId: "",
};

export default function PatientDashboardPage() {
  const [vaccines, setVaccines] = useState([]);
  const [searchFilters, setSearchFilters] = useState(initialFilters);
  const [hospitalResults, setHospitalResults] = useState([]);
  const [catalogError, setCatalogError] = useState("");
  const [resultsError, setResultsError] = useState("");
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isResultsLoading, setIsResultsLoading] = useState(true);

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
      } finally {
        if (isMounted) {
          setIsCatalogLoading(false);
        }
      }
    }

    loadVaccines();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadHospitals() {
      setIsResultsLoading(true);

      try {
        const data = await catalogService.searchPublicHospitals();

        if (isMounted) {
          setHospitalResults(data.hospitals || []);
        }
      } catch (error) {
        if (isMounted) {
          setResultsError(error.message);
        }
      } finally {
        if (isMounted) {
          setIsResultsLoading(false);
        }
      }
    }

    loadHospitals();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateFilter(event) {
    const { name, value } = event.target;
    setSearchFilters((current) => ({ ...current, [name]: value }));
  }

  async function runSearch(filters = searchFilters) {
    setResultsError("");
    setIsResultsLoading(true);

    try {
      const data = await catalogService.searchPublicHospitals(filters);
      setHospitalResults(data.hospitals || []);
    } catch (error) {
      setResultsError(error.message);
    } finally {
      setIsResultsLoading(false);
    }
  }

  async function handleSearchSubmit(event) {
    event.preventDefault();
    await runSearch();
  }

  async function handleClearFilters() {
    setSearchFilters(initialFilters);
    await runSearch(initialFilters);
  }

  return (
    <AppShell
      title="Patient Dashboard"
      description="Patients can now browse hospitals and filter by location or vaccine. Pricing, time slots, and booking confirmation will plug into this same discovery flow next."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <Badge>Hospital search</Badge>
            <CardTitle>Find hospitals by location or vaccine</CardTitle>
            <CardDescription>
              This is the first real patient-side flow. It uses public hospital and offering data
              created by admins.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSearchSubmit}>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="search-name">Hospital name or address</Label>
                <Input
                  id="search-name"
                  name="name"
                  onChange={updateFilter}
                  placeholder="Search by hospital or area"
                  value={searchFilters.name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="search-city">City</Label>
                <Input
                  id="search-city"
                  name="city"
                  onChange={updateFilter}
                  placeholder="Bengaluru"
                  value={searchFilters.city}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="search-pincode">Pincode</Label>
                <Input
                  id="search-pincode"
                  maxLength={6}
                  name="pincode"
                  onChange={updateFilter}
                  placeholder="560001"
                  value={searchFilters.pincode}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="search-vaccine">Vaccine type</Label>
                <Select
                  id="search-vaccine"
                  name="vaccineId"
                  onChange={updateFilter}
                  value={searchFilters.vaccineId}
                >
                  <option value="">All vaccines</option>
                  {vaccines.map((vaccine) => (
                    <option key={vaccine.id} value={vaccine.id}>
                      {vaccine.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <Button disabled={isResultsLoading} type="submit">
                  <Search className="mr-2 h-4 w-4" />
                  Search hospitals
                </Button>
                <Button disabled={isResultsLoading} onClick={handleClearFilters} type="button" variant="outline">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Clear filters
                </Button>
              </div>
            </form>

            {resultsError ? <Alert variant="destructive">{resultsError}</Alert> : null}

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Search results
                </p>
                <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
                  {hospitalResults.length}
                </p>
              </div>
              <Badge>{hospitalResults.length === 1 ? "1 match" : `${hospitalResults.length} matches`}</Badge>
            </div>

            <div className="space-y-4">
              {isResultsLoading ? (
                <p className="text-sm text-muted-foreground">Loading hospitals...</p>
              ) : hospitalResults.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-background p-6">
                  <p className="font-semibold text-foreground">No hospitals match these filters.</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Try clearing filters or selecting a different city or vaccine.
                  </p>
                </div>
              ) : (
                hospitalResults.map((hospital) => (
                  <div key={hospital.id} className="rounded-2xl border border-border bg-background p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold tracking-tight text-foreground">
                            {hospital.name}
                          </h3>
                          <Badge>{hospital.offerings.length} vaccine option{hospital.offerings.length > 1 ? "s" : ""}</Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <MapPinned className="h-4 w-4" />
                            {hospital.city}
                          </span>
                          <span>•</span>
                          <span>{hospital.pincode}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{hospital.address}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                        Price and time slots in next phase
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {hospital.offerings.map((offering) => (
                        <div key={offering.id} className="rounded-2xl border border-border/80 bg-card p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                              <Syringe className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{offering.vaccine.name}</p>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {offering.vaccine.description || "Description will be added by admin."}
                              </p>
                              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                {offering.vaccine.dosesRequired} dose
                                {offering.vaccine.dosesRequired > 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 text-slate-50">
          <CardHeader>
            <Badge className="bg-white/10 text-white">Patient flow</Badge>
            <CardTitle className="text-2xl">What this unlocks next</CardTitle>
            <CardDescription className="text-slate-300">
              The patient side now has a real discovery surface. Booking-related features can build on this instead of replacing it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {catalogError ? <Alert variant="destructive">{catalogError}</Alert> : null}
            {patientSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="rounded-2xl border border-white/10 bg-emerald-400/10 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">Shared catalog is live</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {isCatalogLoading
                      ? "Loading vaccine catalog..."
                      : vaccines.length === 0
                        ? "Admins have not added vaccines yet."
                        : `${vaccines.length} vaccine type${vaccines.length > 1 ? "s are" : " is"} available for patient discovery.`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
