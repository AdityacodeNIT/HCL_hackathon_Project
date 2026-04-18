import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/app/protected-route.jsx";
import AdminDashboardPage from "@/pages/admin-dashboard-page.jsx";
import HomePage from "@/pages/home-page.jsx";
import LoginPage from "@/pages/login-page.jsx";
import PatientDashboardPage from "@/pages/patient-dashboard-page.jsx";
import RegisterPage from "@/pages/register-page.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
