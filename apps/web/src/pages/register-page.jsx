import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth-layout.jsx";
import { Alert } from "@/components/ui/alert.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { useAuth } from "@/context/auth-context.jsx";
import { cn, getDefaultPathForRole } from "@/lib/utils.js";

const roles = [
  {
    value: "patient",
    label: "Patient",
    description: "Search hospitals, compare prices, and book slots.",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Manage hospitals, capacity, time slots, and bookings.",
  },
];

const initialValues = {
  fullName: "",
  email: "",
  password: "",
  role: "patient",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const [formValues, setFormValues] = useState(initialValues);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(getDefaultPathForRole(user.role), { replace: true });
    }
  }, [navigate, user]);

  function updateField(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await register(formValues);
      navigate(getDefaultPathForRole(response.user.role), { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start with the role you need today. You can expand capability in later phases."
      footerText="Already registered?"
      footerLink="/login"
      footerLabel="Sign in"
    >
      <Card className="border-none shadow-none">
        <CardContent className="space-y-5 p-0">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                autoComplete="name"
                id="fullName"
                name="fullName"
                onChange={updateField}
                placeholder="Enter your full name"
                value={formValues.fullName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                autoComplete="email"
                id="email"
                name="email"
                onChange={updateField}
                placeholder="you@example.com"
                type="email"
                value={formValues.email}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                autoComplete="new-password"
                id="password"
                name="password"
                onChange={updateField}
                placeholder="At least 8 characters"
                type="password"
                value={formValues.password}
              />
            </div>

            <div className="space-y-3">
              <Label>Choose role</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {roles.map((role) => {
                  const isSelected = formValues.role === role.value;

                  return (
                    <label
                      key={role.value}
                      className={cn(
                        "cursor-pointer rounded-2xl border p-4 transition-all",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-background hover:border-primary/40"
                      )}
                    >
                      <input
                        checked={isSelected}
                        className="sr-only"
                        name="role"
                        onChange={updateField}
                        type="radio"
                        value={role.value}
                      />
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-foreground">{role.label}</p>
                        {isSelected ? <Badge>Selected</Badge> : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {role.description}
                      </p>
                    </label>
                  );
                })}
              </div>
            </div>

            {errorMessage ? <Alert variant="destructive">{errorMessage}</Alert> : null}

            <Button disabled={isSubmitting} fullWidth type="submit">
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
