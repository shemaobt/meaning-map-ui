import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-branco px-4">
      <h1 className="text-5xl sm:text-6xl font-bold text-telha">404</h1>
      <p className="mt-2 text-base sm:text-lg text-verde">Page not found</p>
      <Button asChild className="mt-6">
        <Link to="/app/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
