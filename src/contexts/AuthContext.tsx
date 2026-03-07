import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { MyRole, User } from "../types/auth";
import { accessRequestsAPI, authAPI } from "../services/api";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants/app";

const MM_APP_KEY = "meaning-map-generator";

interface AuthContextValue {
  user: User | null;
  /** @deprecated Use appRoles instead */
  appRole: string | null;
  appRoles: string[];
  accessRequestStatus: "pending" | "approved" | "rejected" | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function deriveHighestRole(roles: string[]): string | null {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("facilitator")) return "facilitator";
  if (roles.includes("analyst")) return "analyst";
  if (roles.length > 0) return roles[0];
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appRoles, setAppRoles] = useState<string[]>([]);
  const [accessRequestStatus, setAccessRequestStatus] = useState<
    "pending" | "approved" | "rejected" | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  const appRole = deriveHighestRole(appRoles);

  const ensureAccessRequest = useCallback(async () => {
    try {
      const existing = await accessRequestsAPI.mine(MM_APP_KEY);
      if (existing) {
        setAccessRequestStatus(existing.status);
        return;
      }
      const created = await accessRequestsAPI.create({ app_key: MM_APP_KEY });
      setAccessRequestStatus(created.status);
    } catch {
      // If the request fails, leave status as null (fallback UI)
    }
  }, []);

  const resolveRoles = useCallback(
    async (u: User): Promise<string[]> => {
      if (u.is_platform_admin) return ["admin"];
      const roles = await authAPI.myRoles(MM_APP_KEY);
      const matched = roles
        .filter((r: MyRole) => r.app_key === MM_APP_KEY)
        .map((r: MyRole) => r.role_key);
      if (matched.length === 0) {
        await ensureAccessRequest();
      }
      return matched;
    },
    [ensureAccessRequest],
  );

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const u = await authAPI.me();
      setUser(u);
      const roles = await resolveRoles(u);
      setAppRoles(roles);
    } catch {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, [resolveRoles]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem(ACCESS_TOKEN_KEY, res.tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.tokens.refresh_token);
    setUser(res.user);
    const roles = await resolveRoles(res.user);
    setAppRoles(roles);
  };

  const signup = async (email: string, password: string, displayName: string) => {
    const res = await authAPI.signup({ email, password, display_name: displayName });
    localStorage.setItem(ACCESS_TOKEN_KEY, res.tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.tokens.refresh_token);
    setUser(res.user);
    setAppRoles([]);
    await ensureAccessRequest();
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    setAppRoles([]);
    setAccessRequestStatus(null);
  };

  return (
    <AuthContext.Provider value={{ user, appRole, appRoles, accessRequestStatus, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
