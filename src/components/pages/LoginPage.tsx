import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { PasswordInput } from "../common/PasswordInput";
import { AuthLayout } from "../layout/AuthLayout";

const INPUT_CLASS =
  "flex h-11 w-full rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 text-sm text-white placeholder:text-white/25 focus:ring-2 focus:ring-[#BE4A01]/30 focus:border-[#BE4A01]/40 focus:bg-white/[0.08] transition-all outline-none";

const STATUS_CONFIG = {
  pending: { icon: Clock, bg: "rgba(197,194,159,0.1)", border: "rgba(197,194,159,0.2)", text: "rgba(197,194,159,0.8)", key: "statusPending" },
  approved: { icon: CheckCircle, bg: "rgba(119,125,69,0.1)", border: "rgba(119,125,69,0.25)", text: "rgba(119,125,69,0.9)", key: "statusApproved" },
  rejected: { icon: XCircle, bg: "rgba(220,50,50,0.08)", border: "rgba(220,50,50,0.2)", text: "rgba(220,100,100,0.9)", key: "statusRejected" },
  "password-reset": { icon: CheckCircle, bg: "rgba(119,125,69,0.1)", border: "rgba(119,125,69,0.25)", text: "rgba(119,125,69,0.9)", key: "statusPasswordReset" },
} as const;

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const message = searchParams.get("message") as keyof typeof STATUS_CONFIG | null;
  const statusInfo = message ? STATUS_CONFIG[message] : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success(t("auth.login.successToast"));
      navigate("/app/books");
    } catch {
      setError(t("auth.login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-7">
        <h2 className="text-[24px] font-bold tracking-tight text-white mb-1.5">
          {t("auth.welcomeBack")}
        </h2>
        <p className="text-[14px] text-white/35">{t("auth.login.subtitle")}</p>
      </div>

      {statusInfo && (
        <div
          className="flex items-start gap-2.5 rounded-lg border p-3 mb-6 text-sm"
          style={{ background: statusInfo.bg, borderColor: statusInfo.border, color: statusInfo.text }}
        >
          <statusInfo.icon className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{t(`auth.login.${statusInfo.key}`)}</span>
        </div>
      )}

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
              {t("auth.login.emailPlaceholder")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
              placeholder={t("auth.placeholders.email")}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              {t("auth.login.passwordPlaceholder")}
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT_CLASS}
              placeholder={t("auth.placeholders.password")}
              required
            />
            <div className="flex justify-end mt-1.5">
              <Link
                to="/forgot-password"
                className="text-xs text-[#BE4A01] font-medium hover:text-[#BE4A01]/80 transition-colors"
              >
                {t("auth.login.forgotPassword")}
              </Link>
            </div>
          </div>
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
                {t("auth.login.signingIn")}
              </>
            ) : (
              <>
                {t("auth.login.submit")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
        <p className="text-[12px] text-white/30">
          {t("auth.login.noAccount")}{" "}
          <Link to="/signup" className="text-[#BE4A01] font-medium hover:text-[#BE4A01]/80 transition-colors">
            {t("auth.login.signupLink")}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
