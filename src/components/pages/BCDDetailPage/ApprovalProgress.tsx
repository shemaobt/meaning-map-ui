import { useEffect, useState } from "react";
import { Check, Clock } from "lucide-react";
import { bookContextAPI } from "../../../services/api";
import { cn } from "../../../utils/cn";

interface Approval {
  id: string;
  user_id: string;
  user_name: string;
  roles_at_approval: string[];
}

interface ApprovalStatus {
  approvals: Approval[];
  covered_specialties: string[];
  missing_specialties: string[];
  distinct_reviewers: number;
  is_complete: boolean;
}

type SpecKey = "exegete" | "biblical_language_specialist" | "translation_specialist";

const SPECS: { key: SpecKey; label: string; accent: string; accentBg: string }[] = [
  { key: "exegete", label: "Exegete", accent: "text-telha", accentBg: "bg-telha/15" },
  { key: "biblical_language_specialist", label: "Biblical Lang.", accent: "text-azul", accentBg: "bg-azul/15" },
  { key: "translation_specialist", label: "Translation", accent: "text-verde-claro", accentBg: "bg-verde-claro/15" },
];

export function ApprovalProgress({ bcdId, status }: { bcdId: string; status: string }) {
  const [data, setData] = useState<ApprovalStatus | null>(null);

  useEffect(() => {
    if (status === "generating") return;
    bookContextAPI.getApprovalStatus(bcdId).then(setData).catch(() => {});
  }, [bcdId, status]);

  if (!data || status === "approved") return null;

  const approversBySpec = new Map<string, Approval[]>();
  for (const a of data.approvals) {
    for (const role of a.roles_at_approval) {
      if (SPECS.some((s) => s.key === role)) {
        const list = approversBySpec.get(role) || [];
        if (!list.some((x) => x.user_id === a.user_id)) list.push(a);
        approversBySpec.set(role, list);
      }
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
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
            {/* Avatar or clock */}
            {approvers.length > 0 ? (
              <div className="flex -space-x-1">
                {approvers.map((a) => (
                  <Avatar key={a.user_id} name={a.user_name} accent={spec.accent} accentBg={spec.accentBg} />
                ))}
              </div>
            ) : (
              <span className="h-5 w-5 rounded-full bg-areia/15 flex items-center justify-center">
                <Clock className="h-2.5 w-2.5 text-verde/25" />
              </span>
            )}

            {/* Label */}
            <span className={cn(
              "text-[11px] font-medium",
              covered ? spec.accent : "text-verde/40",
            )}>
              {spec.label}
            </span>

            {covered && <Check className={cn("h-3 w-3 -ml-0.5", spec.accent)} />}
          </div>
        );
      })}

      {/* Counter */}
      <span className={cn(
        "text-[10px] font-medium px-2 py-0.5 rounded-full",
        data.is_complete
          ? "bg-verde-claro/15 text-verde-claro"
          : "bg-areia/15 text-verde/40",
      )}>
        {data.covered_specialties.length}/3
      </span>
    </div>
  );
}

function Avatar({ name, accent, accentBg }: { name: string; accent: string; accentBg: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="group relative">
      <div className={cn(
        "h-5 w-5 rounded-full border-2 border-surface flex items-center justify-center text-[8px] font-bold cursor-default transition-transform hover:scale-110 hover:z-10",
        accentBg, accent,
      )}>
        {initials}
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded bg-preto text-branco text-[10px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20">
        {name}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[3px] border-x-transparent border-t-[3px] border-t-preto" />
      </div>
    </div>
  );
}
