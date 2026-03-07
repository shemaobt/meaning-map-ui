import { useState } from "react";
import { ChevronDown, ChevronRight, Users, MessageCircle, Building2, MapPin, Package } from "lucide-react";
import type { PassageEntryBrief } from "../../../types/bookContext";
import { cn } from "../../../utils/cn";

interface EntryBriefCardProps {
  brief: PassageEntryBrief;
}

export function EntryBriefCard({ brief }: EntryBriefCardProps) {
  const [expanded, setExpanded] = useState(false);

  const counts = [
    brief.participants.length > 0 && `${brief.participants.length} participant${brief.participants.length !== 1 ? "s" : ""}`,
    brief.active_threads.length > 0 && `${brief.active_threads.length} thread${brief.active_threads.length !== 1 ? "s" : ""}`,
    brief.places.length > 0 && `${brief.places.length} place${brief.places.length !== 1 ? "s" : ""}`,
    brief.objects.length > 0 && `${brief.objects.length} object${brief.objects.length !== 1 ? "s" : ""}`,
    brief.institutions.length > 0 && `${brief.institutions.length} institution${brief.institutions.length !== 1 ? "s" : ""}`,
  ].filter(Boolean);

  return (
    <div className="rounded-lg border border-azul/20 bg-surface mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-azul" />
          ) : (
            <ChevronRight className="h-4 w-4 text-azul" />
          )}
          <span className="text-sm font-semibold text-preto">
            {brief.is_first_pericope ? "Opening Pericope" : "Already Established"}
          </span>
          <span className="text-xs text-verde/50">
            BCD v{brief.bcd_version}
          </span>
        </div>
        {counts.length > 0 && (
          <span className="text-[10px] text-verde/50 hidden sm:block">
            {counts.join(", ")}
          </span>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-azul/15 space-y-4">
          {brief.established_items.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-verde/70 uppercase tracking-wide mb-2">
                Established Items
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {brief.established_items.map((item, i) => (
                  <EstablishedChip key={i} item={item} />
                ))}
              </div>
            </div>
          )}

          {brief.participants.length > 0 && (
            <BriefSection
              icon={<Users className="h-3.5 w-3.5" />}
              title="Known Participants"
              items={brief.participants}
              nameKey="name"
            />
          )}

          {brief.active_threads.length > 0 && (
            <BriefSection
              icon={<MessageCircle className="h-3.5 w-3.5" />}
              title="Active Discourse Threads"
              items={brief.active_threads}
              nameKey="label"
            />
          )}

          {brief.places.length > 0 && (
            <BriefSection
              icon={<MapPin className="h-3.5 w-3.5" />}
              title="Known Places"
              items={brief.places}
              nameKey="name"
            />
          )}

          {brief.objects.length > 0 && (
            <BriefSection
              icon={<Package className="h-3.5 w-3.5" />}
              title="Known Objects"
              items={brief.objects}
              nameKey="name"
            />
          )}

          {brief.institutions.length > 0 && (
            <BriefSection
              icon={<Building2 className="h-3.5 w-3.5" />}
              title="Known Institutions"
              items={brief.institutions}
              nameKey="name"
            />
          )}
        </div>
      )}
    </div>
  );
}

function EstablishedChip({ item }: { item: { category: string; name: string; english_gloss?: string; description: string; verse_reference: string } }) {
  const categoryColors: Record<string, string> = {
    participant: "bg-azul/15 text-azul border-azul/25",
    event: "bg-telha/10 text-telha border-telha/20",
    institution: "bg-verde-claro/15 text-verde-claro border-verde-claro/25",
    place: "bg-verde/10 text-verde border-verde/20",
    object: "bg-areia/30 text-preto border-areia/40",
  };

  const label = item.english_gloss
    ? `${item.name} (${item.english_gloss})`
    : item.name;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs",
        categoryColors[item.category] || "bg-areia/20 text-verde border-areia/30"
      )}
      title={`${item.description} (${item.verse_reference})`}
    >
      {label}
    </span>
  );
}

function BriefSection({
  icon,
  title,
  items,
  nameKey,
}: {
  icon: React.ReactNode;
  title: string;
  items: Record<string, unknown>[];
  nameKey: string;
}) {
  return (
    <div>
      <h4 className="flex items-center gap-1.5 text-xs font-semibold text-verde/70 uppercase tracking-wide mb-2">
        {icon}
        {title}
      </h4>
      <div className="space-y-1">
        {items.map((item, i) => {
          const name = String(item[nameKey] || `Item ${i + 1}`);
          const gloss = item.english_gloss ? String(item.english_gloss) : "";
          return (
            <div key={i} className="text-xs text-preto bg-surface-alt rounded px-2.5 py-1.5 border border-areia/15">
              <span className="font-medium">{name}</span>
              {gloss && (
                <span className="text-verde/50 ml-1.5">({gloss})</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
