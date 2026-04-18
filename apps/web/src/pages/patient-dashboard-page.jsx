import { useEffect, useState } from "react";
import {
  CalendarDays,
  IndianRupee,
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
import { useAuth } from "@/context/auth-context.jsx";
import {
  formatCurrencyInr,
  formatDateLabel,
  formatTimeLabel,
  getTodayDateInputValue,
} from "@/lib/utils.js";
import * as catalogService from "@/services/catalog-service.js";
import * as schedulingService from "@/services/scheduling-service.js";

const patientSteps = [
  {
    title: "Search hospitals",
    description: "Patients can now search by location, hospital, vaccine, and price range.",
    icon: Search,
  },
  {
    title: "View availability",
    description: "Actual time slots show remaining capacity and per-offering pricing.",
    icon: CalendarDays,
  },
  {
    title: "Manage bookings",
    description: "Bookings can be created, rescheduled, and cancelled with locked pricing.",
    icon: WalletCards,
  },
];

const initialFilters = {
  name: "",
  city: "",
  pincode: "",
  vaccineId: "",
  minPrice: "",
  maxPrice: "",
};

function flattenOfferingSlots(availability) {
  return (availability.offerings || []).flatMap((offering) =>
    offering.slots.map((slot) => ({
      ...slot,
      priceInr: offering.priceInr,
      vaccine: offering.vaccine,
    }))
  );
}

export default function PatientDashboardPage() {
  const { token } = useAuth();
  const [vaccines, setVaccines] = useState([]);
  const [searchFilters, setSearchFilters] = useState(initialFilters);
  const [availabilityDate, setAvailabilityDate] = useState(getTodayDateInputValue());
  const [hospitalResults, setHospitalResults] = useState([]);
  const [availabilityByHospital, setAvailabilityByHospital] = useState({});
  const [myBookings, setMyBookings] = useState([]);
  const [rescheduleState, setRescheduleState] = useState({});
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isResultsLoading, setIsResultsLoading] = useState(true);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const [loadingAvailabilityId, setLoadingAvailabilityId] = useState("");
  const [actionState, setActionState] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        const data = await catalogService.getPublicVaccines();

        if (isMounted) {
          setVaccines(data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message);
        }
      } finally {
        if (isMounted) {
          setIsCatalogLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    runSearch(initialFilters);
    loadMyBookings();
  }, []);

  useEffect(() => {
    setAvailabilityByHospital({});
  }, [availabilityDate, searchFilters.vaccineId]);

  function clearMessages() {
    setErrorMessage("");
    setSuccessMessage("");
  }

  function updateFilter(event) {
    const { name, value } = event.target;
    setSearchFilters((current) => ({ ...current, [name]: value }));
  }

  async function runSearch(filters = searchFilters) {
    clearMessages();
    setIsResultsLoading(true);

    try {
      const data = await catalogService.searchPublicHospitals(filters);
      setHospitalResults(data.hospitals || []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsResultsLoading(false);
    }
  }

  async function loadMyBookings() {
    setIsBookingsLoading(true);

    try {
      const data = await schedulingService.listMyBookings(token);
      setMyBookings(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsBookingsLoading(false);
    }
  }

  async function loadAvailability(hospitalId, vaccineId = searchFilters.vaccineId) {
    setLoadingAvailabilityId(hospitalId);
    clearMessages();

    try {
      const data = await schedulingService.getHospitalAvailability(token, hospitalId, {
        date: availabilityDate,
        vaccineId,
      });

      setAvailabilityByHospital((current) => ({
        ...current,
        [hospitalId]: data,
      }));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoadingAvailabilityId("");
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

  async function handleBookSlot(slotId, hospitalId) {
    clearMessages();
    setActionState(`book-${slotId}`);

    try {
      const booking = await schedulingService.createBooking(token, { timeSlotId: slotId });
      setSuccessMessage(`Booking confirmed. Reference: ${booking.confirmationCode}`);
      await Promise.all([loadMyBookings(), loadAvailability(hospitalId)]);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setActionState("");
    }
  }

  function toggleReschedulePanel(bookingId) {
    setRescheduleState((current) => ({
      ...current,
      [bookingId]: {
        open: !current[bookingId]?.open,
        date: current[bookingId]?.date || getTodayDateInputValue(),
        slots: current[bookingId]?.slots || [],
        loading: false,
        error: "",
      },
    }));
  }

  function updateRescheduleDate(bookingId, date) {
    setRescheduleState((current) => ({
      ...current,
      [bookingId]: {
        ...(current[bookingId] || {}),
        open: true,
        date,
        slots: current[bookingId]?.slots || [],
        loading: false,
        error: "",
      },
    }));
  }

  async function loadRescheduleOptions(booking) {
    const state = rescheduleState[booking.id] || { date: booking.slot.date };

    setRescheduleState((current) => ({
      ...current,
      [booking.id]: {
        ...(current[booking.id] || {}),
        open: true,
        date: state.date,
        slots: current[booking.id]?.slots || [],
        loading: true,
        error: "",
      },
    }));

    try {
      const data = await schedulingService.getHospitalAvailability(token, booking.hospital.id, {
        date: state.date,
        vaccineId: booking.vaccine.id,
      });

      const slots = flattenOfferingSlots(data)
        .filter((slot) => slot.remainingCapacity > 0 || slot.id === booking.slot.id)
        .sort((left, right) => left.startTime.localeCompare(right.startTime));

      setRescheduleState((current) => ({
        ...current,
        [booking.id]: {
          ...(current[booking.id] || {}),
          open: true,
          date: state.date,
          slots,
          loading: false,
          error: "",
        },
      }));
    } catch (error) {
      setRescheduleState((current) => ({
        ...current,
        [booking.id]: {
          ...(current[booking.id] || {}),
          open: true,
          date: state.date,
          slots: [],
          loading: false,
          error: error.message,
        },
      }));
    }
  }

  async function handleRescheduleBooking(booking, newSlotId) {
    clearMessages();
    setActionState(`reschedule-${booking.id}-${newSlotId}`);

    try {
      const updatedBooking = await schedulingService.rescheduleBooking(token, booking.id, { timeSlotId: newSlotId });
      setSuccessMessage(
        `Booking moved to ${formatDateLabel(updatedBooking.slot.date)} at ${formatTimeLabel(updatedBooking.slot.startTime)}.`
      );
      setRescheduleState((current) => ({
        ...current,
        [booking.id]: {
          ...(current[booking.id] || {}),
          open: false,
          slots: [],
        },
      }));
      await Promise.all([loadMyBookings(), loadAvailability(booking.hospital.id, booking.vaccine.id)]);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setActionState("");
    }
  }

  async function handleCancelBooking(booking) {
    clearMessages();
    setActionState(`cancel-${booking.id}`);

    try {
      const cancelledBooking = await schedulingService.cancelBooking(token, booking.id);
      setSuccessMessage(`Booking ${cancelledBooking.confirmationCode} cancelled.`);
      await Promise.all([loadMyBookings(), loadAvailability(booking.hospital.id, booking.vaccine.id)]);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setActionState("");
    }
  }

  return (
    <AppShell
      title="Patient Dashboard"
      description="Patients can now search hospitals, inspect prices and slot availability, create bookings, and manage them from one screen."
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Hospitals</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">{hospitalResults.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Syringe className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Vaccines</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">{vaccines.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Upcoming</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
                {myBookings.filter((b) => (b.bookingPeriod === 'upcoming' || b.bookingPeriod === 'today') && (b.status === 'pending' || b.status === 'approved')).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-600">
              <WalletCards className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Completed</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
                {myBookings.filter((b) => b.status === 'completed').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Badge>Complete patient flow</Badge>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Search hospitals by location, vaccine, and price range. Then load slot availability for a
          selected day and book or manage appointments.
        </p>
      </div>

      {errorMessage ? <Alert className="mt-4" variant="destructive">{errorMessage}</Alert> : null}
      {successMessage ? <Alert className="mt-4">{successMessage}</Alert> : null}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Badge>Hospital search</Badge>
              <CardTitle>Find vaccine providers</CardTitle>
              <CardDescription>Search by hospital, city, pincode, vaccine, or price band.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSearchSubmit}>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="search-name">Hospital name or address</Label>
                  <Input
                    id="search-name"
                    name="name"
                    onChange={updateFilter}
                    placeholder="Search hospital or locality"
                    value={searchFilters.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="search-city">City</Label>
                  <Input id="search-city" name="city" onChange={updateFilter} value={searchFilters.city} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="search-pincode">Pincode</Label>
                  <Input id="search-pincode" maxLength={6} name="pincode" onChange={updateFilter} value={searchFilters.pincode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="search-vaccine">Vaccine type</Label>
                  <Select id="search-vaccine" name="vaccineId" onChange={updateFilter} value={searchFilters.vaccineId}>
                    <option value="">All vaccines</option>
                    {vaccines.map((vaccine) => (
                      <option key={vaccine.id} value={vaccine.id}>
                        {vaccine.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability-date">Availability date</Label>
                  <Input
                    id="availability-date"
                    onChange={(event) => setAvailabilityDate(event.target.value)}
                    type="date"
                    value={availabilityDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-price">Min price</Label>
                  <Input id="min-price" min={0} name="minPrice" onChange={updateFilter} type="number" value={searchFilters.minPrice} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-price">Max price</Label>
                  <Input id="max-price" min={0} name="maxPrice" onChange={updateFilter} type="number" value={searchFilters.maxPrice} />
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
                    <p className="font-semibold text-foreground">No hospitals match your filters.</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Try another city, vaccine, or price range.</p>
                  </div>
                ) : (
                  hospitalResults.map((hospital) => {
                    const availability = availabilityByHospital[hospital.id];

                    return (
                      <div key={hospital.id} className="rounded-2xl border border-border bg-background p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-xl font-bold tracking-tight text-foreground">{hospital.name}</h3>
                              <Badge>{hospital.offerings.length} offering{hospital.offerings.length > 1 ? "s" : ""}</Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <span className="inline-flex items-center gap-2">
                                <MapPinned className="h-4 w-4" />
                                {hospital.city}
                              </span>
                              <span>|</span>
                              <span>{hospital.pincode}</span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{hospital.address}</p>
                          </div>
                          <Button
                            disabled={loadingAvailabilityId === hospital.id}
                            onClick={() => loadAvailability(hospital.id)}
                            variant="outline"
                          >
                            {loadingAvailabilityId === hospital.id ? "Loading..." : "Load slots"}
                          </Button>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          {hospital.offerings.map((offering) => (
                            <div key={offering.id} className="rounded-2xl border border-border/80 bg-card p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                  <IndianRupee className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">{offering.vaccine.name}</p>
                                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {offering.vaccine.description || "Description will be added by admin."}
                                  </p>
                                  <p className="mt-2 text-sm font-semibold text-foreground">
                                    {formatCurrencyInr(offering.priceInr)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {availability ? (
                          <div className="mt-5 space-y-4 rounded-2xl border border-border bg-card p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                  Availability for {formatDateLabel(availabilityDate)}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  Select a slot to lock the shown price.
                                </p>
                              </div>
                              <Badge>{availability.offerings.length} vaccine option{availability.offerings.length > 1 ? "s" : ""}</Badge>
                            </div>

                            {availability.offerings.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No slots available for this date.</p>
                            ) : (
                              availability.offerings.map((offering) => (
                                <div key={offering.id} className="space-y-3 rounded-2xl border border-border bg-background p-4">
                                  <div>
                                    <p className="font-semibold text-foreground">{offering.vaccine.name}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {formatCurrencyInr(offering.priceInr)} | {offering.vaccine.dosesRequired} dose
                                      {offering.vaccine.dosesRequired > 1 ? "s" : ""}
                                    </p>
                                  </div>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    {offering.slots.map((slot) => (
                                      <div key={slot.id} className="rounded-2xl border border-border/80 bg-card p-4">
                                        <p className="font-semibold text-foreground">
                                          {formatTimeLabel(slot.startTime)} - {formatTimeLabel(slot.endTime)}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                          {slot.remainingCapacity} of {slot.capacity} seats left
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-foreground">
                                          {formatCurrencyInr(offering.priceInr)}
                                        </p>
                                        <Button
                                          className="mt-3"
                                          disabled={slot.remainingCapacity < 1 || actionState === `book-${slot.id}`}
                                          onClick={() => handleBookSlot(slot.id, hospital.id)}
                                          size="sm"
                                        >
                                          {slot.remainingCapacity < 1
                                            ? "Full"
                                            : actionState === `book-${slot.id}`
                                              ? "Booking..."
                                              : "Book this slot"}
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-950 text-slate-50">
            <CardHeader>
              <Badge className="bg-white/10 text-white">Patient flow</Badge>
              <CardTitle className="text-2xl">What is now live</CardTitle>
              <CardDescription className="text-slate-300">
                The patient side now supports real discovery, slot selection, and booking management.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {patientSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <div key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
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

              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/20 text-emerald-200">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Price lock is enforced</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      The price shown at booking time is stored with the booking and remains visible in your booking list.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge>My bookings</Badge>
              <CardTitle>Manage appointments</CardTitle>
              <CardDescription>Review booked or cancelled slots, reschedule upcoming ones, or cancel if needed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isBookingsLoading ? (
                <p className="text-sm text-muted-foreground">Loading your bookings...</p>
              ) : myBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">You have no bookings yet.</p>
              ) : (
                <>
                  {(() => {
                    const upcomingBookings = myBookings.filter(
                      (b) => (b.bookingPeriod === 'upcoming' || b.bookingPeriod === 'today') && (b.status === 'pending' || b.status === 'approved')
                    );
                    const pastBookings = myBookings.filter(
                      (b) => b.bookingPeriod === 'past' || b.status === 'cancelled' || b.status === 'completed'
                    );

                    return (
                      <>
                        {upcomingBookings.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-primary" />
                              <h3 className="font-semibold text-foreground">Upcoming Appointments</h3>
                              <Badge variant="default">{upcomingBookings.length}</Badge>
                            </div>
                            <div className="space-y-4">
                              {upcomingBookings.map((booking) => {
                  const reschedule = rescheduleState[booking.id];

                  return (
                    <div key={booking.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="font-semibold text-foreground">{booking.hospital.name}</p>
                            <Badge variant={booking.status === "booked" ? "default" : "secondary"}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{booking.vaccine.name}</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {formatDateLabel(booking.slot.date)} | {formatTimeLabel(booking.slot.startTime)} -{" "}
                            {formatTimeLabel(booking.slot.endTime)}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {formatCurrencyInr(booking.lockedPriceInr)}
                          </p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            {booking.confirmationCode}
                          </p>
                        </div>
                        {booking.status === "pending" || booking.status === "approved" ? (
                          <div className="flex flex-wrap gap-2">
                            <Button onClick={() => toggleReschedulePanel(booking.id)} size="sm" variant="outline">
                              {reschedule?.open ? "Close reschedule" : "Reschedule"}
                            </Button>
                            <Button
                              disabled={actionState === `cancel-${booking.id}`}
                              onClick={() => handleCancelBooking(booking)}
                              size="sm"
                              variant="outline"
                            >
                              {actionState === `cancel-${booking.id}` ? "Cancelling..." : "Cancel"}
                            </Button>
                          </div>
                        ) : null}
                      </div>

                      {(booking.status === "pending" || booking.status === "approved") && reschedule?.open ? (
                        <div className="mt-4 space-y-4 rounded-2xl border border-border bg-card p-4">
                          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                            <div className="space-y-2">
                              <Label htmlFor={`reschedule-date-${booking.id}`}>New date</Label>
                              <Input
                                id={`reschedule-date-${booking.id}`}
                                onChange={(event) => updateRescheduleDate(booking.id, event.target.value)}
                                type="date"
                                value={reschedule.date || booking.slot.date}
                              />
                            </div>
                            <Button onClick={() => loadRescheduleOptions(booking)} size="sm" type="button">
                              Load slots
                            </Button>
                          </div>

                          {reschedule.loading ? <p className="text-sm text-muted-foreground">Loading slot options...</p> : null}
                          {reschedule.error ? <Alert variant="destructive">{reschedule.error}</Alert> : null}

                          {reschedule.slots?.length ? (
                            <div className="grid gap-3">
                              {reschedule.slots.map((slot) => (
                                <div key={slot.id} className="rounded-2xl border border-border bg-background p-4">
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      <p className="font-semibold text-foreground">
                                        {formatTimeLabel(slot.startTime)} - {formatTimeLabel(slot.endTime)}
                                      </p>
                                      <p className="mt-1 text-sm text-muted-foreground">
                                        {slot.remainingCapacity} seats left | {formatCurrencyInr(slot.priceInr)}
                                      </p>
                                    </div>
                                    <Button
                                      disabled={slot.id === booking.slot.id || actionState === `reschedule-${booking.id}-${slot.id}`}
                                      onClick={() => handleRescheduleBooking(booking, slot.id)}
                                      size="sm"
                                    >
                                      {slot.id === booking.slot.id
                                        ? "Current slot"
                                        : actionState === `reschedule-${booking.id}-${slot.id}`
                                          ? "Updating..."
                                          : "Move booking"}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : reschedule.slots && !reschedule.loading ? (
                            <p className="text-sm text-muted-foreground">No alternate slots found for the selected date.</p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                            </div>
                          </div>
                        )}

                        {pastBookings.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Syringe className="h-4 w-4 text-muted-foreground" />
                              <h3 className="font-semibold text-foreground">Vaccination History</h3>
                              <Badge variant="secondary">{pastBookings.length}</Badge>
                            </div>
                            <div className="space-y-4">
                              {pastBookings.map((booking) => (
                                <div key={booking.id} className="rounded-2xl border border-border bg-muted/30 p-4 opacity-75">
                                  <div className="flex flex-col gap-3">
                                    <div>
                                      <div className="flex flex-wrap items-center gap-3">
                                        <p className="font-semibold text-foreground">{booking.hospital.name}</p>
                                        <Badge variant={booking.status === "pending" ? "outline" : booking.status === "approved" ? "default" : "secondary"}>
                                          {booking.status}
                                        </Badge>
                                        {booking.bookingPeriod === 'past' && booking.status === 'completed' && (
                                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            Completed
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="mt-1 text-sm text-muted-foreground">{booking.vaccine.name}</p>
                                      <p className="mt-2 text-sm text-muted-foreground">
                                        {formatDateLabel(booking.slot.date)} | {formatTimeLabel(booking.slot.startTime)} -{" "}
                                        {formatTimeLabel(booking.slot.endTime)}
                                      </p>
                                      <p className="mt-1 text-sm font-semibold text-foreground">
                                        {formatCurrencyInr(booking.lockedPriceInr)}
                                      </p>
                                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                        {booking.confirmationCode}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
