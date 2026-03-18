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
import i18n from "../i18n";
import { LOCALE_STORAGE_KEY } from "../i18n";

const MM_APP_KEY = "meaning-map-generator";

const SPECIALIST_ROLES = ["exegete", "biblical_language_specialist", "translation_specialist"] as const;

interface AuthContextValue {
  user: User | null;
  appRole: string | null;
  appRoles: string[];
  isAdmin: boolean;
  isAnalyst: boolean;
  canApproveBCD: boolean;
  accessRequestStatus: "pending" | "approved" | "rejected" | null;
  isLoading: boolean;
  needsLanguagePicker: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function deriveHighestRole(roles: string[]): string | null {
  if (roles.includes("admin")) return "admin";
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
  const isAdmin = appRole === "admin";
  const isAnalyst = appRoles.includes("analyst") || isAdmin;
  const canApproveBCD =
    isAdmin || appRoles.some((r) => (SPECIALIST_ROLES as readonly string[]).includes(r));
  const needsLanguagePicker = user !== null && user.locale === null && appRoles.length > 0;

  const syncLocale = useCallback((u: User) => {
    if (u.locale) {
      i18n.changeLanguage(u.locale);
      localStorage.setItem(LOCALE_STORAGE_KEY, u.locale);
    }
  }, []);

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

  const refreshUser = useCallback(async () => {
    const u = await authAPI.me();
    setUser(u);
    syncLocale(u);
  }, [syncLocale]);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const u = await authAPI.me();
      setUser(u);
      syncLocale(u);
      const roles = await resolveRoles(u);
      setAppRoles(roles);
    } catch {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, [resolveRoles, syncLocale]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem(ACCESS_TOKEN_KEY, res.tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.tokens.refresh_token);
    setUser(res.user);
    syncLocale(res.user);
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
    <AuthContext.Provider value={{ user, appRole, appRoles, isAdmin, isAnalyst, canApproveBCD, accessRequestStatus, isLoading, needsLanguagePicker, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
