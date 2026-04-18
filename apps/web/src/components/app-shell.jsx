import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/auth-context.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";

const navigationByRole = {
  patient: [{ label: "Patient Dashboard", to: "/patient" }],
  admin: [{ label: "Admin Dashboard", to: "/admin" }],
};

export default function AppShell({ title, description, children }) {
  const { logout, user } = useAuth();
  const navigation = navigationByRole[user.role] || [];

  return (
    <div className="min-h-screen bg-background bg-hero-wash">
      <header className="border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="container flex flex-col gap-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                {user.role === "admin" ? <ShieldCheck className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">DevNexus</p>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{user.role}</Badge>
              <div className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground">
                {user.fullName}
              </div>
              <Button onClick={logout} size="sm" variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
            <nav className="flex flex-wrap gap-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  className={({ isActive }) =>
                    [
                      "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    ].join(" ")
                  }
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
