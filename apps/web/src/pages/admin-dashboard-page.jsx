import { useEffect, useMemo, useState } from "react";
import { Building2, ClipboardList, Plus, RefreshCcw, ShieldCheck, Syringe } from "lucide-react";
import AppShell from "@/components/app-shell.jsx";
import { Alert } from "@/components/ui/alert.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Select } from "@/components/ui/select.jsx";
import { useAuth } from "@/context/auth-context.jsx";
import * as catalogService from "@/services/catalog-service.js";

const initialHospitalForm = {
  name: "",
  city: "",
  pincode: "",
  address: "",
};

const initialVaccineForm = {
  name: "",
  description: "",
  dosesRequired: 1,
};

const initialOfferingForm = {
  hospitalId: "",
  vaccineId: "",
  isActive: true,
};

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [masterData, setMasterData] = useState({
    hospitals: [],
    vaccines: [],
    counts: { hospitals: 0, vaccines: 0, offerings: 0 },
  });
  const [hospitalForm, setHospitalForm] = useState(initialHospitalForm);
  const [vaccineForm, setVaccineForm] = useState(initialVaccineForm);
  const [offeringForm, setOfferingForm] = useState(initialOfferingForm);
  const [editingHospitalId, setEditingHospitalId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionState, setActionState] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const hospitals = masterData.hospitals || [];
  const vaccines = masterData.vaccines || [];

  const offeringReady = useMemo(
    () => hospitals.length > 0 && vaccines.length > 0,
    [hospitals.length, vaccines.length]
  );

  async function loadMasterData({ silent = false } = {}) {
    if (!silent) {
      setIsLoading(true);
    }

    try {
      const data = await catalogService.getAdminMasterData(token);
      setMasterData(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    loadMasterData();
  }, []);

  function clearMessages() {
    setErrorMessage("");
    setSuccessMessage("");
  }

  function updateHospitalField(event) {
    const { name, value } = event.target;
    setHospitalForm((current) => ({ ...current, [name]: value }));
  }

  function updateVaccineField(event) {
    const { name, value } = event.target;
    setVaccineForm((current) => ({ ...current, [name]: value }));
  }

  function updateOfferingField(event) {
    const { name, value, type, checked } = event.target;
    setOfferingForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function beginHospitalEdit(hospital) {
    clearMessages();
    setEditingHospitalId(hospital.id);
    setHospitalForm({
      name: hospital.name,
      city: hospital.city,
      pincode: hospital.pincode,
      address: hospital.address,
    });
  }

  function cancelHospitalEdit() {
    setEditingHospitalId("");
    setHospitalForm(initialHospitalForm);
  }

  async function handleHospitalSubmit(event) {
    event.preventDefault();
    clearMessages();
    setActionState("hospital");

    try {
      if (editingHospitalId) {
        await catalogService.updateHospital(token, editingHospitalId, hospitalForm);
        setSuccessMessage("Hospital updated.");
      } else {
        await catalogService.createHospital(token, hospitalForm);
        setSuccessMessage("Hospital created.");
      }

      cancelHospitalEdit();
      await loadMasterData({ silent: true });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setActionState("");
    }
  }

  async function handleVaccineSubmit(event) {
    event.preventDefault();
    clearMessages();
    setActionState("vaccine");

    try {
      await catalogService.createVaccine(token, {
        ...vaccineForm,
        dosesRequired: Number(vaccineForm.dosesRequired || 1),
      });
      setVaccineForm(initialVaccineForm);
      setSuccessMessage("Vaccine added to the catalog.");
      await loadMasterData({ silent: true });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setActionState("");
    }
  }

  async function handleOfferingSubmit(event) {
    event.preventDefault();
    clearMessages();
    setActionState("offering");

    try {
      await catalogService.createOffering(token, offeringForm);
      setOfferingForm((current) => ({ ...initialOfferingForm, isActive: current.isActive }));
      setSuccessMessage("Hospital offering saved.");
      await loadMasterData({ silent: true });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setActionState("");
    }
  }

  async function handleOfferingToggle(offeringId, isActive) {
    clearMessages();
    setActionState(`offering-${offeringId}`);

    try {
      await catalogService.updateOfferingStatus(token, offeringId, { isActive });
      setSuccessMessage(isActive ? "Offering activated." : "Offering marked inactive.");
      await loadMasterData({ silent: true });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setActionState("");
    }
  }

  return (
    <AppShell
      title="Admin Dashboard"
      description="This phase turns the admin surface into a real master-data workspace. Hospitals, vaccine catalog entries, and hospital offerings are now managed from one screen."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Building2} label="Hospitals" value={masterData.counts.hospitals} />
        <StatCard icon={Syringe} label="Vaccines" value={masterData.counts.vaccines} />
        <StatCard icon={ClipboardList} label="Offerings" value={masterData.counts.offerings} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge>Master data phase</Badge>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Admins can now create hospitals, define vaccines, and connect vaccine offerings to
            hospitals before pricing and time-slot management land.
          </p>
        </div>
        <Button onClick={() => loadMasterData()} variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {errorMessage ? <Alert className="mt-4" variant="destructive">{errorMessage}</Alert> : null}
      {successMessage ? <Alert className="mt-4">{successMessage}</Alert> : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Badge>{editingHospitalId ? "Edit hospital" : "Create hospital"}</Badge>
              <CardTitle>{editingHospitalId ? "Update hospital details" : "Add a new hospital"}</CardTitle>
              <CardDescription>
                Keep hospital data clean now so search and booking flows do not need to rewrite it later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleHospitalSubmit}>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="hospital-name">Hospital name</Label>
                  <Input
                    id="hospital-name"
                    name="name"
                    onChange={updateHospitalField}
                    placeholder="Apollo Hospital"
                    value={hospitalForm.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital-city">City</Label>
                  <Input
                    id="hospital-city"
                    name="city"
                    onChange={updateHospitalField}
                    placeholder="Bengaluru"
                    value={hospitalForm.city}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital-pincode">Pincode</Label>
                  <Input
                    id="hospital-pincode"
                    maxLength={6}
                    name="pincode"
                    onChange={updateHospitalField}
                    placeholder="560001"
                    value={hospitalForm.pincode}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="hospital-address">Address</Label>
                  <Input
                    id="hospital-address"
                    name="address"
                    onChange={updateHospitalField}
                    placeholder="Road, area, landmark"
                    value={hospitalForm.address}
                  />
                </div>
                <div className="flex flex-wrap gap-3 sm:col-span-2">
                  <Button disabled={actionState === "hospital"} type="submit">
                    {editingHospitalId ? "Update hospital" : "Save hospital"}
                  </Button>
                  {editingHospitalId ? (
                    <Button onClick={cancelHospitalEdit} type="button" variant="outline">
                      Cancel edit
                    </Button>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge>Hospital network</Badge>
              <CardTitle>Hospitals and assigned vaccines</CardTitle>
              <CardDescription>
                Each hospital can expose multiple vaccine offerings. Status can be toggled without deleting data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading hospitals...</p>
              ) : hospitals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hospitals yet. Add the first hospital above.</p>
              ) : (
                hospitals.map((hospital) => (
                  <div key={hospital.id} className="rounded-2xl border border-border bg-background p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{hospital.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {hospital.city} • {hospital.pincode}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{hospital.address}</p>
                      </div>
                      <Button onClick={() => beginHospitalEdit(hospital)} size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>

                    <div className="mt-4 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Assigned vaccines
                      </p>
                      {hospital.offerings.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No vaccines mapped yet.</p>
                      ) : (
                        hospital.offerings.map((offering) => (
                          <div
                            key={offering.id}
                            className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="font-semibold text-foreground">{offering.vaccine?.name}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {offering.vaccine?.description || "No description added."}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={offering.isActive ? "default" : "secondary"}>
                                {offering.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Button
                                disabled={actionState === `offering-${offering.id}`}
                                onClick={() => handleOfferingToggle(offering.id, !offering.isActive)}
                                size="sm"
                                variant="outline"
                              >
                                {offering.isActive ? "Mark inactive" : "Activate"}
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-950 text-slate-50">
            <CardHeader>
              <Badge className="bg-white/10 text-white">API slice</Badge>
              <CardTitle className="text-2xl">What this phase unlocked</CardTitle>
              <CardDescription className="text-slate-300">
                The admin page is now backed by real PostgreSQL tables instead of static placeholder text.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-slate-200">
              <p>1. Hospitals are stored and editable.</p>
              <p>2. Vaccines are stored in a reusable catalog.</p>
              <p>3. Offerings connect hospitals and vaccines with active or inactive status.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge>Vaccine catalog</Badge>
              <CardTitle>Create vaccine definitions</CardTitle>
              <CardDescription>
                These entries are reusable across hospitals and will later connect to pricing and time slots.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleVaccineSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="vaccine-name">Vaccine name</Label>
                  <Input
                    id="vaccine-name"
                    name="name"
                    onChange={updateVaccineField}
                    placeholder="Covaxin"
                    value={vaccineForm.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vaccine-description">Description</Label>
                  <Input
                    id="vaccine-description"
                    name="description"
                    onChange={updateVaccineField}
                    placeholder="Primary or booster vaccine details"
                    value={vaccineForm.description}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vaccine-doses">Doses required</Label>
                  <Input
                    id="vaccine-doses"
                    min={1}
                    name="dosesRequired"
                    onChange={updateVaccineField}
                    type="number"
                    value={vaccineForm.dosesRequired}
                  />
                </div>
                <Button disabled={actionState === "vaccine"} type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Add vaccine
                </Button>
              </form>

              <div className="mt-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Current catalog
                </p>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading vaccines...</p>
                ) : vaccines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No vaccines created yet.</p>
                ) : (
                  vaccines.map((vaccine) => (
                    <div key={vaccine.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{vaccine.name}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {vaccine.description || "No description added."}
                          </p>
                        </div>
                        <Badge>{vaccine.dosesRequired} dose{vaccine.dosesRequired > 1 ? "s" : ""}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge>Offerings</Badge>
              <CardTitle>Assign vaccines to hospitals</CardTitle>
              <CardDescription>
                This mapping is the bridge between catalog setup and the next pricing and slot phases.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleOfferingSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="offering-hospital">Hospital</Label>
                  <Select
                    disabled={!offeringReady}
                    id="offering-hospital"
                    name="hospitalId"
                    onChange={updateOfferingField}
                    value={offeringForm.hospitalId}
                  >
                    <option value="">Select hospital</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name} ({hospital.city})
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offering-vaccine">Vaccine</Label>
                  <Select
                    disabled={!offeringReady}
                    id="offering-vaccine"
                    name="vaccineId"
                    onChange={updateOfferingField}
                    value={offeringForm.vaccineId}
                  >
                    <option value="">Select vaccine</option>
                    {vaccines.map((vaccine) => (
                      <option key={vaccine.id} value={vaccine.id}>
                        {vaccine.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground">
                  <input
                    checked={offeringForm.isActive}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    name="isActive"
                    onChange={updateOfferingField}
                    type="checkbox"
                  />
                  Mark this offering active immediately
                </label>

                <Button disabled={!offeringReady || actionState === "offering"} type="submit">
                  Save offering
                </Button>
              </form>

              {!offeringReady ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Add at least one hospital and one vaccine before assigning offerings.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
