import { useTranslation } from "react-i18next";
import { useMeaningMapStore } from "../../../../../stores/meaningMapStore";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { QAEditor } from "./QAEditor";
import { WarningsBlock } from "../WarningsBlock";
import { FeedbackThread } from "../FeedbackThread";
import { List } from "lucide-react";

interface PropositionsCardProps {
  readOnly?: boolean;
  mapId: string;
  showFeedback: boolean;
  canWriteFeedback: boolean;
  canResolveFeedback: boolean;
}

export function PropositionsCard({
  readOnly = false,
  mapId,
  showFeedback,
  canWriteFeedback,
  canResolveFeedback,
}: PropositionsCardProps) {
  const { t } = useTranslation();
  const propositions = useMeaningMapStore(
    (s) => s.currentMap?.data?.level_3_propositions ?? []
  );
  const allWarnings = useMeaningMapStore((s) => s.reviewState.warnings);
  const warnings = allWarnings.filter((w) => w.section.startsWith("prop_"));

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b border-areia/20">
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-verde-claro" />
          <CardTitle className="tracking-tight">{t("meaningMap.level3Title")}</CardTitle>
        </div>
        <p className="text-xs text-verde/60">
          {t("meaningMap.level3Description")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        {propositions.map((prop, i) => {
          const propWarnings = warnings.filter(
            (w) => w.section === `prop_${prop.proposition_number}`
          );
          return (
            <div
              key={prop.proposition_number}
              className="rounded-lg border border-areia/20 bg-branco/50 p-4 space-y-3"
            >
              <h5 className="text-sm font-semibold text-preto">
                {t("meaningMap.propositionTitle", { number: prop.proposition_number, verse: prop.verse })}
              </h5>
              <QAEditor
                content={prop.content}
                onChange={(content) =>
                  useMeaningMapStore.getState().updatePropositionContent(i, content)
                }
                readOnly={readOnly}
              />
              {propWarnings.length > 0 && <WarningsBlock warnings={propWarnings} />}
              {showFeedback && (
                <FeedbackThread
                  mapId={mapId}
                  sectionKey={`prop_${prop.proposition_number}`}
                  canWrite={canWriteFeedback}
                  canResolve={canResolveFeedback}
                />
              )}
            </div>
          );
        })}
        {propositions.length === 0 && (
          <p className="text-sm text-verde/50 text-center py-4">
            {t("meaningMap.noPropositions")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
