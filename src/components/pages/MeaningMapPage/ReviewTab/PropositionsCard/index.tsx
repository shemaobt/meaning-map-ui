import { useMeaningMapStore } from "../../../../../stores/meaningMapStore";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { QAEditor } from "./QAEditor";
import { WarningsBlock } from "../WarningsBlock";

interface PropositionsCardProps {
  readOnly?: boolean;
}

export function PropositionsCard({ readOnly = false }: PropositionsCardProps) {
  const propositions = useMeaningMapStore(
    (s) => s.currentMap?.data.level_3_propositions || []
  );
  const updatePropositionContent = useMeaningMapStore((s) => s.updatePropositionContent);
  const warnings = useMeaningMapStore((s) =>
    s.reviewState.warnings.filter((w) => w.section.startsWith("prop_"))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Level 3 — Propositions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {propositions.map((prop, i) => {
          const propWarnings = warnings.filter(
            (w) => w.section === `prop_${prop.proposition_number}`
          );
          return (
            <div
              key={prop.proposition_number}
              className="rounded-lg border border-areia/20 p-4 space-y-3"
            >
              <h5 className="text-sm font-semibold text-preto">
                Proposition {prop.proposition_number} — Verse {prop.verse}
              </h5>
              <QAEditor
                content={prop.content}
                onChange={(content) => updatePropositionContent(i, content)}
                readOnly={readOnly}
              />
              {propWarnings.length > 0 && <WarningsBlock warnings={propWarnings} />}
            </div>
          );
        })}
        {propositions.length === 0 && (
          <p className="text-sm text-verde/50 text-center py-4">
            No propositions parsed yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
