import { ArrowRight, CalendarRange, MapPinned, ShieldPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { useAuth } from "@/context/auth-context.jsx";
import { getDefaultPathForRole } from "@/lib/utils.js";

const highlights = [
  {
    title: "Find nearby hospitals",
    description: "Search by city, pincode, and vaccine type without jumping across systems.",
    icon: MapPinned,
  },
  {
    title: "Compare real slot choices",
    description: "Move beyond date-only counts and prepare for actual time-slot booking flows.",
    icon: CalendarRange,
  },
  {
    title: "Manage operations cleanly",
    description: "Admins can update hospitals, pricing, capacity, and booking visibility from one shell.",
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
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">VaxBook</p>
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
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container py-10">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <Badge>Initial phase delivered</Badge>
            <div className="space-y-4">
              <h2 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-foreground">
                JS-only structure, real auth, and clean role entry for the first working slice.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                The repo is now split into a lean Vite frontend and a lean Express API. Patients
                and admins each get a proper entry path, and the team can extend search, slots, and
                bookings without pulling business logic into the UI.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg">
                  Create an account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>

          <Card className="overflow-hidden border-none bg-slate-950 text-slate-50">
            <CardHeader className="space-y-4">
              <Badge className="bg-white/10 text-white">Team-friendly repo</Badge>
              <CardTitle className="text-3xl">What this reset fixes</CardTitle>
              <CardDescription className="text-slate-300">
                No TypeScript sprawl, no dead package layer, and no hollow architecture folders.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Frontend owner</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Works entirely inside `apps/web` with stable auth endpoints.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Backend owner</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Builds route, service, and repo files module by module without framework clutter.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Database owner</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Owns PostgreSQL migrations, seed data, and future slot and booking queries.
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
