import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { AuthLanguageSwitcher } from "../common/AuthLanguageSwitcher";
import { toast } from "sonner";
export function SignupPage() {
  const { t } = useTranslation();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [displayName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password, displayName);
      toast.success(t("auth.signup.successToast"));
      navigate("/app/books");
    } catch {
      setError(t("auth.signup.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-branco px-4">
      <AuthLanguageSwitcher />
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-preto mb-2">
            <span className="text-telha">{t("app.titleBible")}</span> {t("app.titleMeaningMaps")}
          </h1>
          <p className="text-sm text-verde/70">{t("auth.signup.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-500 text-center dark:bg-red-950/30 dark:border-red-800/40 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("auth.signup.namePlaceholder")}
              className="bg-branco border-areia/40 placeholder:text-verde/50"
              required
              autoFocus
            />

            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.signup.emailPlaceholder")}
              className="bg-branco border-areia/40 placeholder:text-verde/50"
              required
            />

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.signup.passwordPlaceholder")}
              className="bg-branco border-areia/40 placeholder:text-verde/50"
              required
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full bg-telha hover:bg-telha/90 text-white font-medium" disabled={loading}>
            {loading ? t("auth.signup.creating") : t("auth.signup.submit")}
          </Button>

          <p className="text-center text-sm text-verde/70 mt-6">
            {t("auth.signup.hasAccount")}{" "}
            <Link to="/login" className="font-medium text-telha hover:underline">
              {t("auth.signup.signinLink")}
            </Link>
          </p>
        </form>
      </div>

      <div className="hidden sm:block fixed bottom-8 text-xs text-verde/40 text-center w-full">
        {t("app.tagline")}
      </div>
    </div>
  );
}
