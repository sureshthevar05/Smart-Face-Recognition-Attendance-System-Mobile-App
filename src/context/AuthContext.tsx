import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { login as loginRequest } from "../services/authService";
import {
  storeTokens,
  clearTokens,
  clearStoredFacultyIdentity,
  getStoredFacultyIdentity,
  storeFacultyIdentity,
  ApiError,
} from "../services/apiClient";
import type { AuthUser, LoginCredentials } from "../types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (credentials: LoginCredentials) => void;
  isLoggingIn: boolean;
  loginError: string | null;
  clearLoginError: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await getStoredFacultyIdentity();
      if (stored) {
        setUser({
          facultyId: stored.facultyId,
          fullName: stored.fullName,
          department: stored.department,
          gender: stored.gender,
          isAdmin: stored.isAdmin || false,
        });
      }
      setIsHydrated(true);
    })();
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoggingIn(true);
      setLoginError(null);
      try {
        const data = await loginRequest(credentials);
        const isAdmin = data.is_admin === true;
        await storeTokens(data.access, data.refresh);
        const identity: AuthUser = {
          facultyId: data.faculty_id,
          fullName: data.full_name,
          department: data.department,
          gender: data.gender,
          isAdmin,
        };
        await storeFacultyIdentity(identity);
        setUser(identity);
        if (isAdmin) {
          router.replace("/(admin)/dashboard");
        } else {
          router.replace("/start-attendance");
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setLoginError(err.message);
        } else {
          setLoginError("Something went wrong while signing in.");
        }
      } finally {
        setIsLoggingIn(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    await clearTokens();
    await clearStoredFacultyIdentity();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isHydrated,
      login,
      isLoggingIn,
      loginError,
      clearLoginError: () => setLoginError(null),
      logout,
    }),
    [user, isHydrated, login, isLoggingIn, loginError, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

