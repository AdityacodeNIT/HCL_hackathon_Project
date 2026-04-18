import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  ClipboardList,
  IndianRupee,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Syringe,
} from "lucide-react";
import AppShell from "@/components/app-shell.jsx";
import { Alert } from "@/components/ui/alert.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Select } from "@/components/ui/select.jsx";
import { useAuth } from "@/context/auth-context.jsx";
import {
  formatCurrencyInr,
  formatDateLabel,
  formatTimeLabel,
  getTodayDateInputValue,
} from "@/lib/utils.js";
import * as catalogService from "@/services/catalog-service.js";
import * as schedulingService from "@/services/scheduling-service.js";

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

const initialSlotForm = {
  offeringId: "",
  date: getTodayDateInputValue(),
  startTime: "09:00",
  endTime: "09:30",
  capacity: 10,
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
  const [slots, setSlots] = useState([]);
  const [adminBookings, setAdminBookings] = useState({ date: getTodayDateInputValue(), bookings: [] });
  const [hospitalForm, setHospitalForm] = useState(initialHospitalForm);
  const [vaccineForm, setVaccineForm] = useState(initialVaccineForm);
  const [offeringForm, setOfferingForm] = useState(initialOfferingForm);
  const [slotForm, setSlotForm] = useState(initialSlotForm);
  const [slotEditId, setSlotEditId] = useState("");
  const [editingHospitalId, setEditingHospitalId] = useState("");
  const [priceDrafts, setPriceDrafts] = useState({});
  const [operationalFilters, setOperationalFilters] = useState({
    date: getTodayDateInputValue(),
    hospitalId: "",
    vaccineId: "",
  });
  const [isMasterLoading, setIsMasterLoading] = useState(true);
  const [isOperationsLoading, setIsOperationsLoading] = useState(true);
  const [actionState, setActionState] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const hospitals = masterData.hospitals || [];
  const vaccines = masterData.vaccines || [];
  const offerings = useMemo(
    () =>
      hospitals.flatMap((hospital) =>
        hospital.offerings.map((offering) => ({
          ...offering,
          hospital,
        }))
      ),
    [hospitals]
  );

  async function loadMasterData({ silent = false } = {}) {
    if (!silent) {
      setIsMasterLoading(true);
    }

    try {
      const data = await catalogService.getAdminMasterData(token);
      setMasterData(data);
      setPriceDrafts(
        Object.fromEntries(
          data.hospitals.flatMap((hospital) =>
            hospital.offerings.map((offering) => [offering.id, offering.priceInr ?? 0])
          )
        )
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      if (!silent) {
        setIsMasterLoading(false);
      }
    }
  }

  async function loadOperationalData({ silent = false } = {}) {
    if (!silent) {
      setIsOperationsLoading(true);
    }

    try {
      const [slotData, bookingData] = await Promise.all([
        schedulingService.listAdminSlots(token, operationalFilters),
        schedulingService.listAdminBookings(token, operationalFilters),
      ]);

      setSlots(slotData);
      setAdminBookings(bookingData);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      if (!silent) {
        setIsOperationsLoading(false);
      }
    }
  }

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    loadOperationalData();
  }, [operationalFilters.date, operationalFilters.hospitalId, operationalFilters.vaccineId]);

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

  function updateSlotField(event) {
    const { name, value } = event.target;
    setSlotForm((current) => ({ ...current, [name]: value }));
  }

  function updateOperationalFilter(event) {
    const { name, value } = event.target;
    setOperationalFilters((current) => ({ ...current, [name]: value }));
  }

  function startHospitalEdit(hospital) {
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

  function startSlotEdit(slot) {
    clearMessages();
    setSlotEditId(slot.id);
    setSlotForm({
      offeringId: slot.offeringId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
    });
  }

  function cancelSlotEdit() {
    setSlotEditId("");
    setSlotForm(initialSlotForm);
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
      setSuccessMessage("Vaccine added.");
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
      setOfferingForm(initialOfferingForm);
      setSuccessMessage("Offering saved.");
      await loadMasterData({ silent: true });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setActionState("");
    }
  }

  async function handlePriceSave(offeringId) {
    clearMessages();
    setActionState(`price-${offeringId}`);

    try {
      await catalogService.updateOfferingPrice(token, offeringId, {
        priceInr: Number(priceDrafts[offeringId] || 0),
      });
      setSuccessMessage("Price updated.");
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

  async function handleSlotSubmit(event) {
    event.preventDefault();
    clearMessages();
    setActionState("slot");

    try {
      const payload = {
        ...slotForm,
        capacity: Number(slotForm.capacity || 0),
      };

      if (slotEditId) {
        await schedulingService.updateSlot(token, slotEditId, payload);
        setSuccessMessage("Time slot updated.");
      } else {
        await schedulingService.createSlot(token, payload);
        setSuccessMessage("Time slot created.");
      }

      cancelSlotEdit();
      await loadOperationalData({ silent: true });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setActionState("");
    }
  }

  return (
    <AppShell
      title="Admin Dashboard"
      description="The app is now in an operational state: admins can manage hospitals, vaccines, offerings, prices, slots, and see day-wise bookings from one place."
    >
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Building2} label="Hospitals" value={masterData.counts.hospitals} />
        <StatCard icon={Syringe} label="Vaccines" value={masterData.counts.vaccines} />
        <StatCard icon={IndianRupee} label="Offerings" value={masterData.counts.offerings} />
        <StatCard icon={CalendarClock} label="Slots" value={slots.length} />
        <StatCard icon={ClipboardList} label="Bookings" value={adminBookings.bookings.length} />
        <StatCard
          icon={ShieldCheck}
          label="Booked Today"
          value={adminBookings.bookings.filter((booking) => booking.status === "booked").length}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge>Final admin scope</Badge>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Master data, pricing, capacity planning, and daily booking visibility are now handled
            from this screen.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => loadMasterData()} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh master data
          </Button>
          <Button onClick={() => loadOperationalData()} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh operations
          </Button>
        </div>
      </div>

      {errorMessage ? <Alert className="mt-4" variant="destructive">{errorMessage}</Alert> : null}
      {successMessage ? <Alert className="mt-4">{successMessage}</Alert> : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Badge>{editingHospitalId ? "Edit hospital" : "Create hospital"}</Badge>
              <CardTitle>{editingHospitalId ? "Update hospital" : "Add hospital"}</CardTitle>
              <CardDescription>Hospitals are the base layer for all patient discovery and slot setup.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleHospitalSubmit}>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="hospital-name">Hospital name</Label>
                  <Input id="hospital-name" name="name" onChange={updateHospitalField} value={hospitalForm.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital-city">City</Label>
                  <Input id="hospital-city" name="city" onChange={updateHospitalField} value={hospitalForm.city} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital-pincode">Pincode</Label>
                  <Input
                    id="hospital-pincode"
                    maxLength={6}
                    name="pincode"
                    onChange={updateHospitalField}
                    value={hospitalForm.pincode}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="hospital-address">Address</Label>
                  <Input id="hospital-address" name="address" onChange={updateHospitalField} value={hospitalForm.address} />
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
              <Badge>Vaccine catalog</Badge>
              <CardTitle>Create vaccine types</CardTitle>
              <CardDescription>These entries are reused across offerings, slots, and bookings.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleVaccineSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="vaccine-name">Vaccine name</Label>
                  <Input id="vaccine-name" name="name" onChange={updateVaccineField} value={vaccineForm.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vaccine-description">Description</Label>
                  <Input
                    id="vaccine-description"
                    name="description"
                    onChange={updateVaccineField}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge>Offerings</Badge>
              <CardTitle>Assign vaccines to hospitals</CardTitle>
              <CardDescription>Offerings define where a vaccine is available and at what price.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form className="grid gap-4" onSubmit={handleOfferingSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="offering-hospital">Hospital</Label>
                  <Select id="offering-hospital" name="hospitalId" onChange={updateOfferingField} value={offeringForm.hospitalId}>
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
                  <Select id="offering-vaccine" name="vaccineId" onChange={updateOfferingField} value={offeringForm.vaccineId}>
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
                    name="isActive"
                    onChange={updateOfferingField}
                    type="checkbox"
                  />
                  Mark offering active immediately
                </label>
                <Button disabled={actionState === "offering"} type="submit">
                  Save offering
                </Button>
              </form>

              <div className="space-y-4">
                {isMasterLoading ? (
                  <p className="text-sm text-muted-foreground">Loading offerings...</p>
                ) : offerings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No offerings created yet.</p>
                ) : (
                  offerings.map((offering) => (
                    <div key={offering.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="font-semibold text-foreground">
                            {offering.hospital.name} | {offering.vaccine.name}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {offering.hospital.city} | {offering.hospital.pincode}
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
                            {offering.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                        <div className="space-y-2">
                          <Label htmlFor={`price-${offering.id}`}>Price (INR)</Label>
                          <Input
                            id={`price-${offering.id}`}
                            min={0}
                            onChange={(event) =>
                              setPriceDrafts((current) => ({
                                ...current,
                                [offering.id]: event.target.value,
                              }))
                            }
                            type="number"
                            value={priceDrafts[offering.id] ?? 0}
                          />
                        </div>
                        <Button
                          disabled={actionState === `price-${offering.id}`}
                          onClick={() => handlePriceSave(offering.id)}
                          type="button"
                        >
                          Save price
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Badge>{slotEditId ? "Edit slot" : "Create slot"}</Badge>
              <CardTitle>{slotEditId ? "Update time slot" : "Add time slot"}</CardTitle>
              <CardDescription>Time slots are the actual bookable units used by patients.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSlotSubmit}>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="slot-offering">Offering</Label>
                  <Select id="slot-offering" name="offeringId" onChange={updateSlotField} value={slotForm.offeringId}>
                    <option value="">Select hospital and vaccine</option>
                    {offerings.map((offering) => (
                      <option key={offering.id} value={offering.id}>
                        {offering.hospital.name} | {offering.vaccine.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slot-date">Date</Label>
                  <Input id="slot-date" name="date" onChange={updateSlotField} type="date" value={slotForm.date} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slot-capacity">Capacity</Label>
                  <Input
                    id="slot-capacity"
                    min={1}
                    name="capacity"
                    onChange={updateSlotField}
                    type="number"
                    value={slotForm.capacity}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slot-start">Start time</Label>
                  <Input id="slot-start" name="startTime" onChange={updateSlotField} type="time" value={slotForm.startTime} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slot-end">End time</Label>
                  <Input id="slot-end" name="endTime" onChange={updateSlotField} type="time" value={slotForm.endTime} />
                </div>
                <div className="flex flex-wrap gap-3 md:col-span-2">
                  <Button disabled={actionState === "slot"} type="submit">
                    {slotEditId ? "Update slot" : "Create slot"}
                  </Button>
                  {slotEditId ? (
                    <Button onClick={cancelSlotEdit} type="button" variant="outline">
                      Cancel edit
                    </Button>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge>Daily operations</Badge>
              <CardTitle>Slots and bookings by day</CardTitle>
              <CardDescription>Use filters to inspect capacity and bookings for a selected day.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="ops-date">Date</Label>
                  <Input
                    id="ops-date"
                    name="date"
                    onChange={updateOperationalFilter}
                    type="date"
                    value={operationalFilters.date}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ops-hospital">Hospital</Label>
                  <Select
                    id="ops-hospital"
                    name="hospitalId"
                    onChange={updateOperationalFilter}
                    value={operationalFilters.hospitalId}
                  >
                    <option value="">All hospitals</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ops-vaccine">Vaccine</Label>
                  <Select
                    id="ops-vaccine"
                    name="vaccineId"
                    onChange={updateOperationalFilter}
                    value={operationalFilters.vaccineId}
                  >
                    <option value="">All vaccines</option>
                    {vaccines.map((vaccine) => (
                      <option key={vaccine.id} value={vaccine.id}>
                        {vaccine.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Time slots
                </p>
                {isOperationsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading slots...</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No slots match the selected filters.</p>
                ) : (
                  slots.map((slot) => (
                    <div key={slot.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="font-semibold text-foreground">
                            {slot.hospital.name} | {slot.vaccine.name}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatDateLabel(slot.date)} | {formatTimeLabel(slot.startTime)} - {formatTimeLabel(slot.endTime)}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {slot.bookedCount}/{slot.capacity} booked | {slot.remainingCapacity} remaining |{" "}
                            {formatCurrencyInr(slot.priceInr)}
                          </p>
                        </div>
                        <Button onClick={() => startSlotEdit(slot)} size="sm" variant="outline">
                          Edit slot
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Bookings for {formatDateLabel(adminBookings.date)}
                </p>
                {isOperationsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading bookings...</p>
                ) : adminBookings.bookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No bookings found for this day.</p>
                ) : (
                  adminBookings.bookings.map((booking) => (
                    <div key={booking.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="font-semibold text-foreground">{booking.user?.fullName}</p>
                            <Badge variant={booking.status === "booked" ? "default" : "secondary"}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{booking.user?.email}</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {booking.hospital.name} | {booking.vaccine.name}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatTimeLabel(booking.slot.startTime)} - {formatTimeLabel(booking.slot.endTime)} |{" "}
                            {formatCurrencyInr(booking.lockedPriceInr)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                          {booking.confirmationCode}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
