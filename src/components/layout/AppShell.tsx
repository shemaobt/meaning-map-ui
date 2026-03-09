import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useBHSAInit } from "../../hooks/useBHSA";
import { useNotificationPolling } from "../../hooks/useNotificationPolling";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";
import { BHSAPanel } from "./BHSAPanel";
import { AccessDeniedPage } from "../pages/AccessDeniedPage";

export function AppShell() {
  const { user, appRoles, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useBHSAInit();
  useNotificationPolling();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (appRoles.length === 0) return <AccessDeniedPage />;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-branco">
      <AppHeader onToggleSidebar={() => setSidebarOpen((o) => !o)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
        <BHSAPanel />
      </div>
    </div>
  );
}
