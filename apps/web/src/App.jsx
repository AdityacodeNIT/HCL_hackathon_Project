import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/auth-context.jsx";
import AppRouter from "@/app/router.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
