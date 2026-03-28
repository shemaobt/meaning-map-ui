import { useState, useRef, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowLeft, Camera, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI, uploadsAPI } from "../../services/api";
import { PasswordInput } from "../common/PasswordInput";
import { AuthLayout } from "../layout/AuthLayout";

const INPUT_CLASS =
  "flex h-11 w-full rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 text-sm text-white placeholder:text-white/25 focus:ring-2 focus:ring-[#BE4A01]/30 focus:border-[#BE4A01]/40 focus:bg-white/[0.08] transition-all outline-none";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024;

export function SignupPage() {
  const { t } = useTranslation();
  const { signup, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleContinue = () => {
    if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
      setError(t("auth.signup.error"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.signup.passwordMismatch"));
      return;
    }
    if (password.length < 8) {
      return;
    }
    setError("");
    setStep(2);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t("imageUpload.invalidFormat"));
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error(t("imageUpload.tooLarge"));
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

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
      if (avatarFile) {
        try {
          const { data } = await uploadsAPI.image(avatarFile, "avatars");
          await authAPI.updateMe({ avatar_url: data.url });
          await refreshUser();
        } catch {
          toast.warning(t("auth.signup.avatarUploadFailed"));
        }
      }
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
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? "bg-[#BE4A01]" : "bg-white/[0.08]"}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? "bg-[#BE4A01]" : "bg-white/[0.08]"}`} />
      </div>

      <div className="mb-7">
        <h2 className="text-[24px] font-bold tracking-tight text-white mb-1.5">
          {step === 1 ? t("auth.signup.submit") : t("auth.signup.profileTitle")}
        </h2>
        <p className="text-[14px] text-white/35">
          {step === 1 ? t("auth.signup.subtitle") : t("auth.signup.profileSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div
            className="rounded-lg border p-3 text-sm text-center mb-4"
            style={{ background: "rgba(220,50,50,0.08)", borderColor: "rgba(220,50,50,0.2)", color: "rgba(220,100,100,0.9)" }}
          >
            {error}
          </div>
        )}

        {/* Step 1 — Credentials */}
        {step === 1 && (
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

            <div className="pt-1">
              <button
                type="button"
                onClick={handleContinue}
                disabled={passwordMismatch}
                className="group w-full h-11 flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#BE4A01] to-[#BE4A01]/80 text-white font-semibold text-[14px] shadow-lg shadow-[#BE4A01]/20 hover:from-[#BE4A01]/90 hover:to-[#BE4A01]/70 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("auth.signup.continue")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Profile setup */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-24 w-24 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center overflow-hidden hover:border-[#BE4A01]/40 transition-colors cursor-pointer"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-white/25" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#BE4A01] text-white flex items-center justify-center shadow-md hover:bg-[#BE4A01]/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={() => {
                    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                    setAvatarFile(null);
                    setAvatarPreview(null);
                  }}
                  className="mt-2 text-xs text-white/40 hover:text-white/60 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] text-white/70 font-semibold text-[14px] hover:bg-white/[0.04] active:scale-[0.98] transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("auth.signup.back")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#BE4A01] to-[#BE4A01]/80 text-white font-semibold text-[14px] shadow-lg shadow-[#BE4A01]/20 hover:from-[#BE4A01]/90 hover:to-[#BE4A01]/70 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("auth.signup.creating")}
                  </>
                ) : (
                  t("auth.signup.submit")
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                onClick={() => {
                  if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                  setAvatarFile(null);
                  setAvatarPreview(null);
                }}
                className="text-[12px] text-white/30 hover:text-white/50 transition-colors"
              >
                {t("auth.signup.skip")}
              </button>
            </div>
          </div>
        )}
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
