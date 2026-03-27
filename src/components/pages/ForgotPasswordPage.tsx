import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CheckCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "../../services/api";
import { MM_APP_KEY } from "../../constants/app";
import { AuthLayout } from "../layout/AuthLayout";

const INPUT_CLASS =
  "flex h-11 w-full rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 text-sm text-white placeholder:text-white/25 focus:ring-2 focus:ring-[#BE4A01]/30 focus:border-[#BE4A01]/40 focus:bg-white/[0.08] transition-all outline-none";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email, app_key: MM_APP_KEY });
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-7">
        <h2 className="text-[24px] font-bold tracking-tight text-white mb-1.5">
          {t("auth.forgotPassword.title")}
        </h2>
        <p className="text-[14px] text-white/35">
          {t("auth.forgotPassword.subtitle")}
        </p>
      </div>

      {submitted ? (
        <div
          className="flex items-start gap-2.5 rounded-lg border p-4 text-sm"
          style={{ background: "rgba(119,125,69,0.1)", borderColor: "rgba(119,125,69,0.25)", color: "rgba(119,125,69,0.9)" }}
        >
          <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{t("auth.forgotPassword.successMessage")}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              {t("auth.forgotPassword.emailPlaceholder")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="group w-full h-11 flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#BE4A01] to-[#BE4A01]/80 text-white font-semibold text-[14px] shadow-lg shadow-[#BE4A01]/20 hover:from-[#BE4A01]/90 hover:to-[#BE4A01]/70 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("auth.forgotPassword.sending")}
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  {t("auth.forgotPassword.submit")}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 pt-4 border-t border-white/[0.06]">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-[12px] text-white/30 hover:text-[#BE4A01] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("auth.forgotPassword.backToLogin")}
        </Link>
      </div>
    </AuthLayout>
  );
}
