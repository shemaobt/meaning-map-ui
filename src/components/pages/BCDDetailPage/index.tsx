import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BookOpen,
  Building2,
  ChevronRight,
  Layers,
  MapPin,
  MessageCircle,
  Package,
  StickyNote,
  Tag,
  Users,
  X,
} from "lucide-react";
import { useBCDStore } from "../../../stores/bcdStore";
import { useAuth } from "../../../contexts/AuthContext";
import type { BCD } from "../../../types/bookContext";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { EmptyState } from "../../common/EmptyState";
import { BCDStatusBadge } from "../BookContextPage/BCDStatusBadge";
import { BCDActionBar } from "./BCDActionBar";
import { GenerationPanel } from "./GenerationPanel";
import { SectionDetail } from "./SectionDetail";
import { SectionEditor, TextSection } from "./SectionEditor";
import { OutlineEditor } from "./editors/OutlineEditor";
import { ParticipantEditor } from "./editors/ParticipantEditor";
import { ThreadEditor } from "./editors/ThreadEditor";
import { PlaceEditor, ObjectEditor, InstitutionEditor } from "./editors/EntityEditors";
import { GenreContextEditor, KeyValueEditor } from "./editors/DictEditors";
import { VersionPicker } from "./VersionPicker";
import { BCDInfoTooltip } from "./BCDInfoTooltip";
import { ApprovalProgress } from "./ApprovalProgress";
import { cn } from "../../../utils/cn";

type SectionDef = {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  span?: "wide";
};

const SECTIONS: SectionDef[] = [
  { key: "structural_outline", label: "Structural Outline", icon: Layers, color: "bg-telha/15 text-telha", span: "wide" },
  { key: "participant_register", label: "Participants", icon: Users, color: "bg-azul/15 text-azul" },
  { key: "discourse_threads", label: "Discourse Threads", icon: MessageCircle, color: "bg-verde-claro/15 text-verde-claro" },
  { key: "theological_spine", label: "Theological Spine", icon: BookOpen, color: "bg-telha/10 text-telha" },
  { key: "places", label: "Places", icon: MapPin, color: "bg-azul/10 text-azul" },
  { key: "objects", label: "Objects", icon: Package, color: "bg-areia/30 text-verde" },
  { key: "institutions", label: "Institutions", icon: Building2, color: "bg-verde-claro/10 text-verde-claro" },
  { key: "genre_context", label: "Genre Context", icon: Tag, color: "bg-verde/10 text-verde" },
  { key: "maintenance_notes", label: "Maintenance Notes", icon: StickyNote, color: "bg-areia/20 text-verde" },
];

export function BCDDetailPage() {
  const { bcdId } = useParams<{ bcdId: string }>();
  const { appRole, appRoles } = useAuth();
  const { currentBCD, isLoading, fetchBCD, clear } = useBCDStore();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const canManage = appRole === "admin" || appRole === "facilitator";

  useEffect(() => {
    if (bcdId) fetchBCD(bcdId);
    return () => clear();
  }, [bcdId, fetchBCD, clear]);

  if (isLoading && !currentBCD) return <LoadingSpinner />;
  if (!currentBCD) return <EmptyState title="Document not found" />;

  return (
    <div className="flex flex-col h-full">
      <nav className="flex items-center gap-1 text-xs text-verde/50 mb-5">
        <Link to="/app/books" className="hover:text-telha transition-colors">Books</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/app/books/${currentBCD.book_id}`} className="hover:text-telha transition-colors">Book</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-preto font-medium">Context v{currentBCD.version}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-preto tracking-tight">Book Context</h2>
          <BCDInfoTooltip />
          <BCDStatusBadge status={currentBCD.status} />
          <VersionPicker
            currentBCDId={currentBCD.id}
            bookId={currentBCD.book_id}
            currentVersion={currentBCD.version}
            isActive={currentBCD.is_active}
            canManage={canManage}
          />
        </div>
        <BCDActionBar
          bcdId={currentBCD.id}
          status={currentBCD.status}
          canManage={canManage}
          hasContent={currentBCD.structural_outline != null || currentBCD.participant_register != null}
          isApproved={currentBCD.status === "approved"}
          userRoles={appRoles}
        />
      </div>

      {(currentBCD.status === "generating" || useBCDStore.getState().generationLogs.length > 0) && (
        <GenerationPanel bcdId={currentBCD.id} canManage={canManage} />
      )}

      <ApprovalProgress bcdId={currentBCD.id} status={currentBCD.status} />

      {/* Metro tile grid — fills remaining height */}
      {!activeSection && (
        <div className="flex-1">
          <TileGrid
            bcd={currentBCD}
            disabled={currentBCD.status === "generating"}
            onSelect={setActiveSection}
          />
        </div>
      )}

      {/* Expanded section detail */}
      {activeSection && (
        <div className="flex-1 overflow-y-auto min-h-0">
          <button
            onClick={() => setActiveSection(null)}
            className="flex items-center gap-1.5 text-xs text-verde/50 hover:text-telha transition-colors mb-4"
          >
            <X className="h-3 w-3" />
            Back to overview
          </button>
          {canManage && currentBCD.status === "draft" ? (
            <EditableSection
              bcdId={currentBCD.id}
              sectionKey={activeSection}
            />
          ) : (
            <SectionDetail
              bcd={currentBCD}
              sectionKey={activeSection}
            />
          )}
        </div>
      )}
    </div>
  );
}

function TileGrid({ bcd, disabled, onSelect }: { bcd: BCD; disabled?: boolean; onSelect: (key: string) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {SECTIONS.map((section) => {
        const data = (bcd as unknown as Record<string, unknown>)[section.key];
        const hasContent = data !== null && data !== undefined;
        const count = Array.isArray(data) ? data.length : null;
        const preview = getPreview(data, section.key);

        return (
          <button
            key={section.key}
            onClick={() => { if (!disabled) onSelect(section.key); }}
            disabled={disabled}
            className={cn(
              "relative flex flex-col justify-between rounded-xl p-4 text-left transition-all min-h-[120px]",
              section.color,
              section.span === "wide" && "sm:col-span-2",
              disabled
                ? "opacity-30 cursor-not-allowed"
                : "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
              !hasContent && !disabled && "opacity-50",
            )}
          >
            <section.icon className="h-6 w-6 mb-3 opacity-70" />
            <div>
              <p className="text-xs font-bold leading-tight">{section.label}</p>
              {count !== null && (
                <p className="text-[10px] opacity-60 mt-0.5">{count} entries</p>
              )}
              {!hasContent && (
                <p className="text-[10px] opacity-50 italic mt-0.5">empty</p>
              )}
              {preview && !count && (
                <p className="text-[10px] opacity-60 mt-0.5 line-clamp-2">{preview}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

const TEXT_SECTIONS = new Set(["theological_spine"]);

const SECTION_EDITORS: Record<string, React.ComponentType<{ data: unknown; setData: (val: unknown) => void }>> = {
  structural_outline: OutlineEditor,
  participant_register: ParticipantEditor,
  discourse_threads: ThreadEditor,
  places: PlaceEditor,
  objects: ObjectEditor,
  institutions: InstitutionEditor,
  genre_context: GenreContextEditor,
  maintenance_notes: KeyValueEditor,
};

const BHSA_SECTIONS = new Set([
  "participant_register",
  "places",
  "objects",
  "institutions",
]);

function EditableSection({ bcdId, sectionKey }: { bcdId: string; sectionKey: string }) {
  const sectionDef = SECTIONS.find((s) => s.key === sectionKey);
  if (!sectionDef) return null;

  const Editor = SECTION_EDITORS[sectionKey];
  const isTextSection = TEXT_SECTIONS.has(sectionKey);
  const hasBHSAFields = BHSA_SECTIONS.has(sectionKey);

  return (
    <SectionEditor
      bcdId={bcdId}
      sectionKey={sectionKey}
      label={sectionDef.label}
      icon={sectionDef.icon}
      readOnly={false}
    >
      {({ data, setData }) => (
        <>
          {hasBHSAFields && (
            <div className="mb-3 rounded-md bg-areia/15 border border-areia/30 px-3 py-2 text-xs text-verde/70">
              Fields marked <span className="font-semibold text-verde/50">BHSA</span> are sourced from linguistic data and should not be modified.
            </div>
          )}
          {isTextSection ? (
            <TextSection data={data} setData={setData} readOnly={false} />
          ) : Editor ? (
            <Editor data={data} setData={setData} />
          ) : (
            <TextSection data={data} setData={setData} readOnly={false} />
          )}
        </>
      )}
    </SectionEditor>
  );
}

function getPreview(data: unknown, key: string): string | null {
  if (!data) return null;
  if (typeof data === "string") return data.slice(0, 80);
  if (typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    if (key === "structural_outline" && typeof obj.book_arc === "string") {
      return obj.book_arc.slice(0, 80);
    }
    if (typeof obj.genre === "string") return obj.genre;
    if (typeof obj.primary_genre === "string") return obj.primary_genre;
  }
  return null;
}
