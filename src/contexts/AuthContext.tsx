import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { MyRole, User } from "../types/auth";
import { authAPI } from "../services/api";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants/app";

const MM_APP_KEY = "meaning-map-generator";

interface AuthContextValue {
  user: User | null;
  appRole: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appRole, setAppRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const [u, roles] = await Promise.all([
        authAPI.me(),
        authAPI.myRoles(MM_APP_KEY),
      ]);
      setUser(u);
      if (u.is_platform_admin) {
        setAppRole("admin");
      } else {
        const match = roles.find((r: MyRole) => r.app_key === MM_APP_KEY);
        setAppRole(match?.role_key ?? null);
      }
    } catch {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem(ACCESS_TOKEN_KEY, res.tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.tokens.refresh_token);
    setUser(res.user);

    if (res.user.is_platform_admin) {
      setAppRole("admin");
    } else {
      const roles = await authAPI.myRoles(MM_APP_KEY);
      const match = roles.find((r: MyRole) => r.app_key === MM_APP_KEY);
      setAppRole(match?.role_key ?? null);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    const res = await authAPI.signup({ email, password, display_name: displayName });
    localStorage.setItem(ACCESS_TOKEN_KEY, res.tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.tokens.refresh_token);
    setUser(res.user);
    setAppRole(null);
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    setAppRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, appRole, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
