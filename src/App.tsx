import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./components/pages/LoginPage";
import { SignupPage } from "./components/pages/SignupPage";
import { NotFoundPage } from "./components/pages/NotFoundPage";
import { DashboardPage } from "./components/pages/DashboardPage";
import { BooksPage } from "./components/pages/BooksPage";
import { BookPage } from "./components/pages/BookPage";
import { MeaningMapPage } from "./components/pages/MeaningMapPage";
import { NotificationsPage } from "./components/pages/NotificationsPage";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster position="bottom-right" richColors theme={resolvedTheme} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/app" element={<ErrorBoundary><AppShell /></ErrorBoundary>}>
              <Route index element={<Navigate to="books" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="books" element={<BooksPage />} />
              <Route path="books/:bookId" element={<BookPage />} />
              <Route path="maps/:mapId" element={<MeaningMapPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
            <Route path="/" element={<Navigate to="/app/books" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <ThemedToaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
