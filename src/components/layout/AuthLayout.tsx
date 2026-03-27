import type { ReactNode } from "react";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HebrewBackground } from "../common/HebrewBackground";
import { AuthLanguageSwitcher } from "../common/AuthLanguageSwitcher";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1a1814 0%, #1e1a12 25%, #15201c 60%, #12130d 100%)" }}
    >
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Radial gradient overlays */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 700px 600px at 20% 25%, rgba(190,74,1,0.08), transparent)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 600px 700px at 80% 75%, rgba(137,170,163,0.06), transparent)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 500px 500px at 55% 45%, rgba(119,125,69,0.04), transparent)" }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "linear-gradient(rgba(197,194,159,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(197,194,159,0.5) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />

        <HebrewBackground />
      </div>

      {/* Content — vertically stacked, centered */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7 lg:px-12 lg:pt-9">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-[#BE4A01]/20 bg-[#BE4A01]/10 flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="w-5 h-5 text-[#BE4A01]" />
            </div>
            <div>
              <span className="text-lg font-semibold text-white/90">Shema</span>
              <span className="text-[10px] tracking-[0.15em] text-white/25 uppercase ml-2">OBT</span>
            </div>
          </div>
          <AuthLanguageSwitcher />
        </div>

        {/* Center — hero + card */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
          {/* Hero headline — desktop only */}
          <div className="hidden lg:block text-center mb-10 max-w-xl">
            <h1 className="text-[42px] font-bold text-white/95 leading-[1.1] tracking-tight mb-4">
              Discover,{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #BE4A01, #89AAA3, #777D45)" }}
              >
                Analyze,
              </span>{" "}
              Translate.
            </h1>
            <p className="text-[14px] text-white/30 leading-relaxed">
              Semantic analysis of Biblical Hebrew — mapping the meaning
              structures that power faithful oral translations.
            </p>
          </div>

          {/* Glassmorphism card */}
          <div className="w-full max-w-[420px]">
            <div
              className="rounded-2xl p-8"
              style={{
                background: "rgba(30, 29, 23, 0.7)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
              }}
            >
              {/* Mobile branding inside card */}
              <div className="lg:hidden mb-8">
                <h1 className="text-[22px] font-bold text-white tracking-tight mb-1">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(135deg, #BE4A01, #89AAA3)" }}
                  >
                    {t("app.titleBible")}
                  </span>{" "}
                  {t("app.titleMeaningMaps")}
                </h1>
                <p className="text-[12px] text-white/30">{t("app.tagline")}</p>
              </div>

              {children}
            </div>
          </div>
        </div>

        {/* Footer — pipeline steps (desktop) */}
        <div className="hidden lg:flex items-end justify-between px-12 pb-9">
          <div>
            <div className="text-[9px] font-semibold tracking-[0.15em] text-white/15 uppercase mb-2">
              Meaning Map Pipeline
            </div>
            <div className="flex items-center gap-2">
              {[
                { label: "Hebrew Analysis", color: "#89AAA3" },
                { label: "Semantic Mapping", color: "#777D45" },
                { label: "Translation Support", color: "#BE4A01" },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: step.color, opacity: 0.5 }} />
                    <span className="text-[10px] text-white/40 font-medium">{step.label}</span>
                  </div>
                  {i < 2 && <span className="text-white/10 text-[10px]">&rarr;</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            {[
              { value: "66", label: "Books" },
              { value: "5", label: "Stages" },
              { value: "RTL", label: "Hebrew" },
            ].map((stat) => (
              <div key={stat.label} className="text-right">
                <div className="text-lg font-bold font-mono tabular-nums text-white/40">{stat.value}</div>
                <div className="text-[9px] text-white/20 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-5 pb-4 sm:px-8 sm:pb-5 lg:px-12">
          <p className="text-[10px] text-white/10">
            Shema OBT &middot; Bible Meaning Map Platform
          </p>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`w-1 h-1 rounded-full ${i < 3 ? "bg-[#777D45]/30" : "bg-white/8"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
