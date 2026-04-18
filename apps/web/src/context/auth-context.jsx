import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "@/services/auth-service.js";

const AuthContext = createContext(null);
const tokenStorageKey = "vaxbook_token";

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(tokenStorageKey));
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      if (!token) {
        if (isMounted) {
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser(token);

        if (isMounted) {
          setUser(currentUser);
        }
      } catch (_error) {
        localStorage.removeItem(tokenStorageKey);

        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleAuth(action) {
    const response = await action();
    localStorage.setItem(tokenStorageKey, response.token);
    setToken(response.token);
    setUser(response.user);
    return response;
  }

  async function login(values) {
    return handleAuth(() => authService.login(values));
  }

  async function register(values) {
    return handleAuth(() => authService.register(values));
  }

  async function logout() {
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (_error) {
      // Client-side logout should still complete even if the server call fails.
    } finally {
      localStorage.removeItem(tokenStorageKey);
      setToken(null);
      setUser(null);
      navigate("/login", { replace: true });
    }
  }

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      logout,
      register,
      token,
      user,
    }),
    [isBootstrapping, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
