import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { PasswordInput } from "../common/PasswordInput";
import { AuthLayout } from "../layout/AuthLayout";

const INPUT_CLASS =
  "flex h-11 w-full rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 text-sm text-white placeholder:text-white/25 focus:ring-2 focus:ring-[#BE4A01]/30 focus:border-[#BE4A01]/40 focus:bg-white/[0.08] transition-all outline-none";

export function SignupPage() {
  const { t } = useTranslation();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t("auth.signup.passwordMismatch"));
      return;
    }
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
    <AuthLayout>
      <div className="mb-7">
        <h2 className="text-[24px] font-bold tracking-tight text-white mb-1.5">
          {t("auth.signup.submit")}
        </h2>
        <p className="text-[14px] text-white/35">{t("auth.signup.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            className="rounded-lg border p-3 text-sm text-center"
            style={{ background: "rgba(220,50,50,0.08)", borderColor: "rgba(220,50,50,0.2)", color: "rgba(220,100,100,0.9)" }}
          >
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              {t("auth.signup.namePlaceholder")}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={INPUT_CLASS}
              placeholder={t("auth.placeholders.fullName")}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              {t("auth.signup.emailPlaceholder")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
              placeholder={t("auth.placeholders.email")}
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              {t("auth.signup.passwordPlaceholder")}
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT_CLASS}
              placeholder={t("auth.placeholders.passwordMin")}
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              {t("auth.signup.confirmPasswordPlaceholder")}
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${INPUT_CLASS} ${passwordMismatch ? "!border-red-400/50 !focus:ring-red-400/30" : ""}`}
              placeholder={t("auth.placeholders.confirmPassword")}
              required
              minLength={8}
            />
            {passwordMismatch && (
              <p className="mt-1.5 text-xs text-red-400/80">{t("auth.signup.passwordMismatch")}</p>
            )}
          </div>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading || passwordMismatch}
            className="group w-full h-11 flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#BE4A01] to-[#BE4A01]/80 text-white font-semibold text-[14px] shadow-lg shadow-[#BE4A01]/20 hover:from-[#BE4A01]/90 hover:to-[#BE4A01]/70 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("auth.signup.creating")}
              </>
            ) : (
              <>
                {t("auth.signup.submit")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
        <p className="text-[12px] text-white/30">
          {t("auth.signup.hasAccount")}{" "}
          <Link to="/login" className="text-[#BE4A01] font-medium hover:text-[#BE4A01]/80 transition-colors">
            {t("auth.signup.signinLink")}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
