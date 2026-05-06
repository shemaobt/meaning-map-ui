import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useBlocker, useParams } from "react-router-dom";
import {
  BookOpen,
  Building2,
  ChevronRight,
  Layers,
  MapPin,
  MessageCircle,
  Package,
  Pencil,
  StickyNote,
  Tag,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useBCDStore } from "../../../stores/bcdStore";
import { useAuth } from "../../../contexts/AuthContext";
import { booksAPI, bookContextAPI } from "../../../services/api";
import type { BCD } from "../../../types/bookContext";
import type { BibleBook } from "../../../types/bible";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { EmptyState } from "../../common/EmptyState";
import { LockBadge } from "../../common/LockBadge";
import { UnsavedChangesDialog } from "../../common/UnsavedChangesDialog";
import { BCDStatusBadge } from "../BookContextPage/BCDStatusBadge";
import { BCDActionBar } from "./BCDActionBar";
import { EditingFlowDialog } from "./EditingFlowDialog";
import { GenerationPanel } from "./GenerationPanel";
import { SectionDetail } from "./SectionDetail";
import { SectionEditor, TextSection } from "./SectionEditor";
import { OutlineEditor } from "./editors/OutlineEditor";
import { ParticipantEditor } from "./editors/ParticipantEditor";
import { ThreadEditor } from "./editors/ThreadEditor";
import { PlaceEditor, ObjectEditor, InstitutionEditor } from "./editors/EntityEditors";
import { GenreContextEditor, MaintenanceNotesEditor } from "./editors/DictEditors";
import { VersionPicker } from "./VersionPicker";
import { BCDInfoTooltip } from "./BCDInfoTooltip";
import { ApprovalProgress } from "./ApprovalProgress";
import { BCDBHSASidebar, BCDBHSASidebarToggle } from "./BCDBHSASidebar";
import { cn } from "../../../utils/cn";

const EDITING_FLOW_FLAG = "bcdEditingFlowAcknowledged";

type SectionDef = {
  key: string;
  labelKey: string;
  icon: React.ElementType;
  color: string;
  span?: "wide";
};

const SECTIONS: SectionDef[] = [
  { key: "structural_outline", labelKey: "bcdDetail.sectionOutline", icon: Layers, color: "bg-telha/15 text-telha", span: "wide" },
  { key: "participant_register", labelKey: "bcdDetail.sectionParticipants", icon: Users, color: "bg-azul/15 text-azul" },
  { key: "discourse_threads", labelKey: "bcdDetail.sectionThreads", icon: MessageCircle, color: "bg-verde-claro/15 text-verde-claro" },
  { key: "theological_spine", labelKey: "bcdDetail.sectionTheologicalSpine", icon: BookOpen, color: "bg-telha/10 text-telha" },
  { key: "places", labelKey: "bcdDetail.sectionPlaces", icon: MapPin, color: "bg-azul/10 text-azul" },
  { key: "objects", labelKey: "bcdDetail.sectionObjects", icon: Package, color: "bg-areia/30 text-verde" },
  { key: "institutions", labelKey: "bcdDetail.sectionInstitutions", icon: Building2, color: "bg-verde-claro/10 text-verde-claro" },
  { key: "genre_context", labelKey: "bcdDetail.sectionGenreContext", icon: Tag, color: "bg-verde/10 text-verde" },
  { key: "maintenance_notes", labelKey: "bcdDetail.sectionMaintenanceNotes", icon: StickyNote, color: "bg-areia/20 text-verde" },
];

export function BCDDetailPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { bcdId } = useParams<{ bcdId: string }>();
  const { user, isAdmin, isAnalyst, canApproveBCD } = useAuth();
  const { currentBCD, isLoading, fetchBCD, clear } = useBCDStore();
  const saveAllDirty = useBCDStore((s) => s.saveAllDirty);
  const clearAllDirty = useBCDStore((s) => s.clearAllDirty);
  const dirtyCount = useBCDStore((s) => Object.keys(s.dirtySections).length);
  const hasDirty = dirtyCount > 0;
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [book, setBook] = useState<BibleBook | null>(null);
  const [approvalRefreshKey, setApprovalRefreshKey] = useState(0);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [dialogSaving, setDialogSaving] = useState(false);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  const isLockedByMe = currentBCD?.locked_by === user?.id;
  const canEditWhenLocked =
    ((isAdmin || isAnalyst) && currentBCD?.status === "draft") ||
    (canApproveBCD && currentBCD?.status === "review");
  const canEdit = canEditWhenLocked && isLockedByMe;
  const showEditHint =
    canEditWhenLocked && !currentBCD?.locked_by && currentBCD?.status !== "generating";
  const [showEditingFlow, setShowEditingFlow] = useState(false);

  useEffect(() => {
    if (!isLockedByMe) return;
    if (typeof window === "undefined") return;
    const acknowledged = window.localStorage.getItem(EDITING_FLOW_FLAG) === "true";
    if (!acknowledged) setShowEditingFlow(true);
  }, [isLockedByMe]);

  const acknowledgeEditingFlow = useCallback(() => {
    window.localStorage.setItem(EDITING_FLOW_FLAG, "true");
    setShowEditingFlow(false);
  }, []);

  const handleLock = useCallback(async () => {
    if (!currentBCD) return;
    try {
      await bookContextAPI.lock(currentBCD.id);
      await fetchBCD(currentBCD.id);
      toast.success(t("bcdDetail.lockSuccess"));
    } catch (e) {
      const msg = e instanceof AxiosError ? e.response?.data?.detail : t("bcdDetail.lockFailed");
      toast.error(msg);
    }
  }, [currentBCD, fetchBCD, t]);

  const handleUnlock = useCallback(async () => {
    if (!currentBCD) return;
    if (hasDirty) {
      const result = await saveAllDirty(currentBCD.id, locale);
      if (result.failed.length > 0) {
        toast.error(t("bcdDetail.saveFailedPartial", { count: result.failed.length }));
        return;
      }
      if (useBCDStore.getState().isDirty()) {
        toast.warning(t("bcdDetail.newEditsDuringSave"));
        return;
      }
    }
    try {
      await bookContextAPI.unlock(currentBCD.id);
      await fetchBCD(currentBCD.id);
      toast.success(t("bcdDetail.unlockSuccess"));
    } catch (e) {
      const msg = e instanceof AxiosError ? e.response?.data?.detail : t("bcdDetail.unlockFailed");
      toast.error(msg);
    }
  }, [currentBCD, fetchBCD, hasDirty, saveAllDirty, locale, t]);

  const requestSectionChange = useCallback(
    (next: string | null) => {
      if (hasDirty) {
        setPendingAction(() => () => setActiveSection(next));
      } else {
        setActiveSection(next);
      }
    },
    [hasDirty],
  );

  const proceedAfterDialog = useCallback(() => {
    if (blocker.state === "blocked") blocker.proceed?.();
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [blocker, pendingAction]);

  const cancelDialog = useCallback(() => {
    if (blocker.state === "blocked") blocker.reset?.();
    setPendingAction(null);
  }, [blocker]);

  const handleDialogSave = useCallback(async () => {
    if (!currentBCD) return;
    setDialogSaving(true);
    try {
      const result = await saveAllDirty(currentBCD.id, locale);
      if (result.failed.length > 0) {
        toast.error(t("bcdDetail.saveFailedPartial", { count: result.failed.length }));
        return;
      }
      if (useBCDStore.getState().isDirty()) {
        toast.warning(t("bcdDetail.newEditsDuringSave"));
        return;
      }
      proceedAfterDialog();
    } finally {
      setDialogSaving(false);
    }
  }, [currentBCD, locale, proceedAfterDialog, saveAllDirty, t]);

  const handleDialogDiscard = useCallback(() => {
    clearAllDirty();
    proceedAfterDialog();
  }, [clearAllDirty, proceedAfterDialog]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) cancelDialog();
    },
    [cancelDialog],
  );

  useEffect(() => {
    if (!hasDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasDirty]);

  useEffect(() => {
    if (bcdId) {
      fetchBCD(bcdId).then(() => {
        const bcd = useBCDStore.getState().currentBCD;
        if (bcd?.book_id) {
          booksAPI.list().then((books) => {
            setBook(books.find((b) => b.id === bcd.book_id) ?? null);
          }).catch(() => {});
        }
      });
    }
    return () => {
      const state = useBCDStore.getState();
      if (state.currentBCD && state.currentBCD.locked_by === user?.id) {
        bookContextAPI.unlock(state.currentBCD.id).catch(() => {});
      }
      clear();
    };
  }, [bcdId, fetchBCD, clear, user?.id]);

  const bookName = book?.name ?? "";
  const chapterCount = book?.chapter_count ?? 0;

  if (isLoading && !currentBCD) return <LoadingSpinner />;
  if (!currentBCD) return <EmptyState title={t("bcdDetail.notFound")} />;

  return (
    <div className="flex flex-col h-full">
      <nav className="flex items-center gap-1 text-xs text-verde/50 mb-5">
        <Link to="/app/books" className="hover:text-telha transition-colors">{t("nav.books")}</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/app/books/${currentBCD.book_id}`} className="hover:text-telha transition-colors">{bookName || t("nav.book")}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-preto font-medium">{t("bcdDetail.contextVersion", { version: currentBCD.version })}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-preto tracking-tight">{t("bcdDetail.title")}</h2>
          <BCDInfoTooltip />
          <BCDStatusBadge status={currentBCD.status} />
          <LockBadge lockedBy={currentBCD.locked_by} lockedByName={currentBCD.locked_by_name} />
          <VersionPicker
            currentBCDId={currentBCD.id}
            bookId={currentBCD.book_id}
            currentVersion={currentBCD.version}
            isActive={currentBCD.is_active}
            canManage={isAdmin}
            onActivated={() => setApprovalRefreshKey((k) => k + 1)}
          />
        </div>
        <BCDActionBar
          bcdId={currentBCD.id}
          status={currentBCD.status}
          canEdit={isAdmin || isAnalyst}
          canApproveBCD={canApproveBCD}
          isAdmin={isAdmin}
          hasContent={currentBCD.structural_outline != null || currentBCD.participant_register != null}
          isApproved={currentBCD.status === "approved"}
          lockedBy={currentBCD.locked_by}
          isLockedByMe={isLockedByMe}
          onLock={handleLock}
          onUnlock={handleUnlock}
          onRevisionRequested={() => setApprovalRefreshKey((k) => k + 1)}
        />
      </div>

      {(currentBCD.status === "generating" || useBCDStore.getState().generationLogs.length > 0) && (
        <GenerationPanel bcdId={currentBCD.id} canManage={isAdmin} />
      )}

      <ApprovalProgress bcdId={currentBCD.id} status={currentBCD.status} refreshKey={approvalRefreshKey} />

      <div className="flex-1 flex gap-6 items-start min-h-0">
        <div className="flex-1 min-w-0">
          {!activeSection && showEditHint && (
            <div className="mb-3 flex items-center gap-2 rounded-md bg-azul/10 border border-azul/20 px-3 py-2 text-xs text-azul/80">
              <Pencil className="h-3 w-3 flex-shrink-0" />
              <span>{t("bcdDetail.editHint")}</span>
            </div>
          )}
          {!activeSection && (
            <TileGrid
              bcd={currentBCD}
              disabled={currentBCD.status === "generating"}
              canEdit={canEdit}
              onSelect={requestSectionChange}
            />
          )}

          {activeSection && (
            <>
              <button
                onClick={() => requestSectionChange(null)}
                className="flex items-center gap-1.5 text-xs text-verde/50 hover:text-telha transition-colors mb-4"
              >
                <X className="h-3 w-3" />
                {t("bcdDetail.backToOverview")}
              </button>
              {canEdit ? (
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
            </>
          )}
        </div>

        {bookName && chapterCount > 0 && (
          <BCDBHSASidebar bookName={bookName} chapterCount={chapterCount} />
        )}
      </div>

      {bookName && chapterCount > 0 && (
        <BCDBHSASidebarToggle bookName={bookName} />
      )}

      <UnsavedChangesDialog
        open={blocker.state === "blocked" || pendingAction !== null}
        onOpenChange={handleDialogOpenChange}
        onSave={handleDialogSave}
        onDiscard={handleDialogDiscard}
        saving={dialogSaving}
      />

      <EditingFlowDialog
        open={showEditingFlow}
        onAcknowledge={acknowledgeEditingFlow}
      />
    </div>
  );
}

function TileGrid({ bcd, disabled, canEdit, onSelect }: { bcd: BCD; disabled?: boolean; canEdit?: boolean; onSelect: (key: string) => void }) {
  const { t } = useTranslation();

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
            <div className="flex items-start justify-between">
              <section.icon className="h-6 w-6 mb-3 opacity-70" />
              {canEdit && !disabled && <Pencil className="h-3.5 w-3.5 opacity-40" />}
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">{t(section.labelKey)}</p>
              {count !== null && (
                <p className="text-[10px] opacity-60 mt-0.5">{count} {t("bcdDetail.entries")}</p>
              )}
              {!hasContent && (
                <p className="text-[10px] opacity-50 italic mt-0.5">{t("bcdDetail.empty")}</p>
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
  maintenance_notes: MaintenanceNotesEditor,
};

function EditableSection({ bcdId, sectionKey }: { bcdId: string; sectionKey: string }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const currentBCD = useBCDStore((s) => s.currentBCD);
  const fetchBCD = useBCDStore((s) => s.fetchBCD);

  const needsHydration =
    locale !== "en" &&
    currentBCD != null &&
    currentBCD.translations?.[locale]?.[sectionKey] === undefined;

  useEffect(() => {
    if (!needsHydration) return;
    let cancelled = false;
    bookContextAPI
      .translate(bcdId, locale)
      .then(() => {
        if (!cancelled) return fetchBCD(bcdId);
      })
      .catch(() => {
        // Silent fallback — the UI keeps showing the English source.
      });
    return () => {
      cancelled = true;
    };
  }, [bcdId, locale, sectionKey, needsHydration, fetchBCD]);

  const sectionDef = SECTIONS.find((s) => s.key === sectionKey);
  if (!sectionDef) return null;

  const Editor = SECTION_EDITORS[sectionKey];
  const isTextSection = TEXT_SECTIONS.has(sectionKey);

  return (
    <SectionEditor
      bcdId={bcdId}
      sectionKey={sectionKey}
      label={t(sectionDef.labelKey)}
      icon={sectionDef.icon}
      readOnly={false}
    >
      {({ data, setData }) => (
        <>
          {needsHydration && (
            <div className="mb-3 rounded-md bg-azul/10 border border-azul/20 px-3 py-2 text-xs text-azul/80">
              {t("bcdDetail.loadingTranslation")}
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
