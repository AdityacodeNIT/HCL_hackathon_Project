import { ArrowRight, CalendarRange, MapPinned, ShieldPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { useAuth } from "@/context/auth-context.jsx";
import { getDefaultPathForRole } from "@/lib/utils.js";

const highlights = [
  {
    title: "Real-Time Availability",
    description: "View live vaccine slot availability across hospitals and vaccination centers.",
    icon: MapPinned,
  },
  {
    title: "Trusted Hospitals",
    description: "Browse verified hospitals and vaccination centers with transparent pricing.",
    icon: CalendarRange,
  },
  {
    title: "Easy Booking",
    description: "Book your vaccine slot in just a few clicks with instant confirmation.",
    icon: ShieldPlus,
  },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background bg-hero-wash">
      <header className="border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="container flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">DevNexus</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Hospital vaccine booking, kept simple.
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            {user ? (
              <Link to={getDefaultPathForRole(user.role)}>
                <Button>
                  Open dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">View My Bookings</Button>
                </Link>
                <Link to="/register">
                  <Button>Check Availability</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container py-10">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <Badge>Trusted by Patients & Hospitals</Badge>
            <div className="space-y-4">
              <h2 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-foreground">
                Find, Compare, and Book Vaccine Appointments Easily
              </h2>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                Search nearby hospitals, check real-time vaccine availability, compare prices, and secure your appointment in seconds. Trusted by patients and healthcare providers across the region.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg">
                  Book a Vaccine Slot
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  View My Bookings
                </Button>
              </Link>
            </div>
          </div>

          <Card className="overflow-hidden border-none bg-slate-950 text-slate-50">
            <CardHeader className="space-y-4">
              <Badge className="bg-white/10 text-white">Healthcare Platform</Badge>
              <CardTitle className="text-3xl">Why Choose DevNexus</CardTitle>
              <CardDescription className="text-slate-300">
                Your trusted partner for safe and convenient vaccine booking.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Real-Time Availability</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  View live vaccine slot availability across hospitals and vaccination centers.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Trusted Hospitals</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Browse verified hospitals and vaccination centers with transparent pricing.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Easy Booking</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Book your vaccine slot in just a few clicks with instant confirmation.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title}>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </section>
      </main>
    </div>
  );
}