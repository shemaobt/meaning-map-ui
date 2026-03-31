import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Check, Clock } from "lucide-react";
import { bookContextAPI } from "../../../services/api";
import type { BCDApprovalEntry, BCDApprovalStatus } from "../../../types/bookContext";
import { cn } from "../../../utils/cn";

type SpecKey = "exegete" | "biblical_language_specialist" | "translation_specialist";

const ROLE_LABEL_MAP: Record<string, string> = {
  exegete: "roles.exegete",
  biblical_language_specialist: "roles.biblicalLanguageSpecialist",
  translation_specialist: "roles.translationSpecialist",
};

const SPECS: { key: SpecKey; labelKey: string; accent: string; accentBg: string }[] = [
  { key: "exegete", labelKey: "roles.exegete", accent: "text-telha", accentBg: "bg-telha/15" },
  { key: "biblical_language_specialist", labelKey: "roles.biblicalLanguageSpecialist", accent: "text-azul", accentBg: "bg-azul/15" },
  { key: "translation_specialist", labelKey: "roles.translationSpecialist", accent: "text-verde-claro", accentBg: "bg-verde-claro/15" },
];

interface ApprovalProgressProps {
  bcdId: string;
  status: string;
  refreshKey?: number;
}

export function ApprovalProgress({ bcdId, status, refreshKey }: ApprovalProgressProps) {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<BCDApprovalStatus | null>(null);

  useEffect(() => {
    if (status === "generating") return;
    bookContextAPI.getApprovalStatus(bcdId).then(setData).catch(() => {});
  }, [bcdId, status, refreshKey]);

  if (!data || status === "approved") return null;

  const approversBySpec = new Map<string, BCDApprovalEntry[]>();
  for (const a of data.approvals) {
    for (const role of a.roles_at_approval) {
      if (SPECS.some((s) => s.key === role)) {
        const list = approversBySpec.get(role) || [];
        if (!list.some((x) => x.user_id === a.user_id)) list.push(a);
        approversBySpec.set(role, list);
      }
    }
  }

  const isSingleReviewer = data.is_complete && data.distinct_reviewers === 1;

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        {SPECS.map((spec) => {
          const covered = data.covered_specialties.includes(spec.key);
          const approvers = approversBySpec.get(spec.key) || [];

          return (
            <div
              key={spec.key}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border pl-1 pr-2.5 py-1 text-xs transition-colors",
                covered
                  ? `${spec.accentBg} border-transparent`
                  : "bg-areia/10 border-areia/20",
              )}
            >
              {approvers.length > 0 ? (
                <div className="flex -space-x-1">
                  {approvers.map((a) => (
                    <Avatar key={a.user_id} name={a.user_name} avatarUrl={a.avatar_url} accent={spec.accent} accentBg={spec.accentBg} approvedAt={a.approved_at} locale={a.reviewer_locale} lang={i18n.language} />
                  ))}
                </div>
              ) : (
                <span className="h-5 w-5 rounded-full bg-areia/15 flex items-center justify-center">
                  <Clock className="h-2.5 w-2.5 text-verde/25" />
                </span>
              )}

              {approvers.length === 1 && (
                <span className={cn("text-[11px] font-medium truncate max-w-[100px]", covered ? spec.accent : "text-verde/40")}>
                  {approvers[0].user_name}
                </span>
              )}

              <span className={cn(
                "text-[10px] opacity-60",
                covered ? spec.accent : "text-verde/40",
              )}>
                {t(spec.labelKey)}
              </span>

              {covered && <Check className={cn("h-3 w-3 -ml-0.5", spec.accent)} />}
            </div>
          );
        })}

        <span className={cn(
          "text-[10px] font-medium px-2 py-0.5 rounded-full",
          data.is_complete
            ? "bg-verde-claro/15 text-verde-claro"
            : "bg-areia/15 text-verde/40",
        )}>
          {t("bcdDetail.approvalCounter", { approved: data.covered_specialties.length, total: 3 })}
          {data.distinct_reviewers > 0 && (
            <> · {t(data.distinct_reviewers === 1 ? "bcdDetail.reviewerCount" : "bcdDetail.reviewerCount_plural", { count: data.distinct_reviewers })}</>
          )}
        </span>

        {data.approvals.length > 0 && !data.has_english_review && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-telha/80 bg-telha/10 rounded-full px-2 py-0.5">
            <AlertTriangle className="h-2.5 w-2.5" />
            {t("bcdDetail.noEnglishReview")}
          </span>
        )}

        {isSingleReviewer && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-telha/80 bg-telha/10 rounded-full px-2 py-0.5">
            <AlertTriangle className="h-2.5 w-2.5" />
            {t("bcdDetail.singleReviewerWarning")}
          </span>
        )}
      </div>

      {isSingleReviewer && (
        <p className="text-[10px] text-telha/70 pl-1">
          {t("bcdDetail.singleReviewerDetail")}
        </p>
      )}
    </div>
  );
}

function Avatar({ name, avatarUrl, accent, accentBg, approvedAt, locale, lang }: { name: string; avatarUrl: string | null; accent: string; accentBg: string; approvedAt?: string | null; locale?: string | null; lang: string }) {
  const { t } = useTranslation();
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const dateStr = approvedAt
    ? new Date(approvedAt).toLocaleDateString(lang, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <div className="group relative">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-5 w-5 rounded-full border-2 border-surface object-cover cursor-default transition-transform hover:scale-110 hover:z-10"
        />
      ) : (
        <div className={cn(
          "h-5 w-5 rounded-full border-2 border-surface flex items-center justify-center text-[8px] font-bold cursor-default transition-transform hover:scale-110 hover:z-10",
          accentBg, accent,
        )}>
          {initials}
        </div>
      )}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded bg-preto text-branco text-[10px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20">
        {name}{locale ? ` [${locale}]` : ""}
        {dateStr && <span className="block text-branco/60">{t("bcdDetail.approvedOn", { date: dateStr })}</span>}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[3px] border-x-transparent border-t-[3px] border-t-preto" />
      </div>
    </div>
  );
}
