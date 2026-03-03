import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/app/dashboard");
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-branco px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-preto mb-2">
            <span className="text-telha">Prose</span> MeaningMaps
          </h1>
          <p className="text-sm text-verde/70">Welcome back! Please sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-500 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="bg-yellow-50/50 border-areia/40 placeholder:text-verde/50"
              required
              autoFocus
            />

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-yellow-50/50 border-areia/40 placeholder:text-verde/50"
              required
            />
          </div>

          <Button type="submit" className="w-full bg-telha hover:bg-telha/90 text-white font-medium" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-verde/70 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-telha hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>

      <div className="hidden sm:block fixed bottom-8 text-xs text-verde/40 text-center w-full">
        Semantic Analysis of Biblical Hebrew
      </div>
    </div>
  );
}
