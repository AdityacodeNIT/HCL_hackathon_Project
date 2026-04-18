import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge.jsx";

export default function AuthLayout({ title, subtitle, children, footerText, footerLink, footerLabel }) {
  return (
    <div className="min-h-screen bg-background bg-hero-wash">
      <div className="container flex min-h-screen items-center justify-center py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-soft lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-between border-b border-border/70 bg-slate-950 px-8 py-10 text-slate-50 lg:border-b-0 lg:border-r">
            <div className="space-y-5">
              <Badge className="bg-white/10 text-white hover:bg-white/10">Real auth</Badge>
              <div className="space-y-4">
                <h1 className="max-w-sm text-4xl font-extrabold leading-tight">
                  Simple vaccine booking, cleaner team delivery.
                </h1>
                <p className="max-w-md text-sm leading-7 text-slate-300">
                  Patients and admins share one product, while the code stays separated into a
                  clean web app and a clean API.
                </p>
              </div>
            </div>
            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">Patient path</p>
                <p className="mt-2">Search hospitals, compare prices, and manage bookings.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">Admin path</p>
                <p className="mt-2">Manage hospitals, time slots, and daily operations.</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-10 sm:px-8">
            <div className="mx-auto w-full max-w-md">
              <Link className="text-sm font-semibold text-primary" to="/">
                ← Back to home
              </Link>
              <div className="mt-8 space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">{subtitle}</p>
              </div>
              <div className="mt-8">{children}</div>
              <p className="mt-6 text-sm text-muted-foreground">
                {footerText}{" "}
                <Link className="font-semibold text-primary" to={footerLink}>
                  {footerLabel}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
