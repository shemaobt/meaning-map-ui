import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, KeyRound, XCircle } from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "../../services/api";
import { PasswordInput } from "../common/PasswordInput";
import { AuthLayout } from "../layout/AuthLayout";

const INPUT_CLASS =
  "flex h-11 w-full rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 text-sm text-white placeholder:text-white/25 focus:ring-2 focus:ring-[#BE4A01]/30 focus:border-[#BE4A01]/40 focus:bg-white/[0.08] transition-all outline-none";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center py-4">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
            style={{ background: "rgba(220,50,50,0.1)" }}
          >
            <XCircle className="h-7 w-7 text-red-400/80" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {t("auth.resetPassword.invalidToken")}
          </h2>
          <p className="text-sm text-white/35 mb-6">
            {t("auth.resetPassword.invalidTokenMessage")}
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#BE4A01] to-[#BE4A01]/80 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#BE4A01]/20 hover:from-[#BE4A01]/90 hover:to-[#BE4A01]/70 active:scale-[0.98] transition-all"
          >
            {t("auth.resetPassword.requestNewLink")}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, password });
      setSuccess(true);
      setTimeout(() => navigate("/login?message=password-reset"), 2000);
    } catch {
      toast.error(t("auth.resetPassword.invalidTokenMessage"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-7">
        <h2 className="text-[24px] font-bold tracking-tight text-white mb-1.5">
          {t("auth.resetPassword.title")}
        </h2>
        <p className="text-[14px] text-white/35">
          {t("auth.resetPassword.subtitle")}
        </p>
      </div>

      {success ? (
        <div
          className="flex items-start gap-2.5 rounded-lg border p-4 text-sm"
          style={{ background: "rgba(119,125,69,0.1)", borderColor: "rgba(119,125,69,0.25)", color: "rgba(119,125,69,0.9)" }}
        >
          <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{t("auth.resetPassword.success")}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              {t("auth.resetPassword.passwordPlaceholder")}
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT_CLASS}
              placeholder={t("auth.placeholders.passwordMin")}
              required
              minLength={8}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              {t("auth.resetPassword.confirmPasswordPlaceholder")}
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${INPUT_CLASS} ${passwordMismatch ? "!border-red-400/50" : ""}`}
              placeholder={t("auth.placeholders.confirmPassword")}
              required
              minLength={8}
            />
            {passwordMismatch && (
              <p className="mt-1.5 text-xs text-red-400/80">{t("auth.resetPassword.passwordMismatch")}</p>
            )}
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
                  {t("auth.resetPassword.resetting")}
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  {t("auth.resetPassword.submit")}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
