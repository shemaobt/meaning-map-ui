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
import { BCDDetailPage } from "./components/pages/BCDDetailPage";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="bottom-right"
      theme={resolvedTheme}
      toastOptions={{
        classNames: {
          toast: "!bg-surface !border-areia/30 !text-preto !shadow-lg",
          title: "!text-preto !font-sans",
          description: "!text-verde",
          success: "!bg-verde-claro/10 !border-verde-claro/30 !text-verde-claro",
          error: "!bg-red-50 !border-red-200 !text-red-700 dark:!bg-red-950/30 dark:!border-red-800/40 dark:!text-red-400",
          warning: "!bg-amber-50 !border-amber-200 !text-amber-800 dark:!bg-amber-950/30 dark:!border-amber-800/40 dark:!text-amber-400",
          info: "!bg-azul/10 !border-azul/30 !text-azul",
          actionButton: "!bg-telha !text-white",
          cancelButton: "!bg-areia/20 !text-verde",
        },
      }}
    />
  );
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
              <Route path="book-context/:bcdId" element={<BCDDetailPage />} />
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
