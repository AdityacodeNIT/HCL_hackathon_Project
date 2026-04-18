import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth-layout.jsx";
import { Alert } from "@/components/ui/alert.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { useAuth } from "@/context/auth-context.jsx";
import { getDefaultPathForRole } from "@/lib/utils.js";

const initialValues = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, user } = useAuth();
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
      const response = await login(formValues);
      const targetPath = location.state?.from || getDefaultPathForRole(response.user.role);
      navigate(targetPath, { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your registered email and password."
      footerText="Need an account?"
      footerLink="/register"
      footerLabel="Create one"
    >
      <Card className="border-none shadow-none">
        <CardContent className="space-y-5 p-0">
          <form className="space-y-5" onSubmit={handleSubmit}>
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
                autoComplete="current-password"
                id="password"
                name="password"
                onChange={updateField}
                placeholder="Enter your password"
                type="password"
                value={formValues.password}
              />
            </div>

            {errorMessage ? <Alert variant="destructive">{errorMessage}</Alert> : null}

            <Button disabled={isSubmitting} fullWidth type="submit">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
