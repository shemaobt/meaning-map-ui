import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./components/pages/LoginPage";
import { SignupPage } from "./components/pages/SignupPage";
import { ForgotPasswordPage } from "./components/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/pages/ResetPasswordPage";
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

function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
        <ThemedToaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      {
        path: "/app",
        element: (
          <ErrorBoundary>
            <AppShell />
          </ErrorBoundary>
        ),
        children: [
          { index: true, element: <Navigate to="books" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "books", element: <BooksPage /> },
          { path: "books/:bookId", element: <BookPage /> },
          { path: "book-context/:bcdId", element: <BCDDetailPage /> },
          { path: "maps/:mapId", element: <MeaningMapPage /> },
          { path: "notifications", element: <NotificationsPage /> },
        ],
      },
      { path: "/", element: <Navigate to="/app/books" replace /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
