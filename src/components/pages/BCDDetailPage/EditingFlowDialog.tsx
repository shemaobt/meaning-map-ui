import { useTranslation } from "react-i18next";
import { Pencil, Save, MousePointerClick } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";

interface EditingFlowDialogProps {
  open: boolean;
  onAcknowledge: () => void;
}

export function EditingFlowDialog({ open, onAcknowledge }: EditingFlowDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onAcknowledge(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto sm:mx-0 mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-telha/15 text-telha">
            <Pencil className="h-5 w-5" />
          </div>
          <DialogTitle>{t("bcdDetail.editingFlowTitle")}</DialogTitle>
          <DialogDescription>{t("bcdDetail.editingFlowIntro")}</DialogDescription>
        </DialogHeader>

        <ol className="mt-4 space-y-3">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-azul/10 text-azul">
              <MousePointerClick className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm text-preto/80">{t("bcdDetail.editingFlowStep1")}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-azul/10 text-azul">
              <Pencil className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm text-preto/80">{t("bcdDetail.editingFlowStep2")}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-verde-claro/15 text-verde-claro">
              <Save className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm text-preto/80">{t("bcdDetail.editingFlowStep3")}</span>
          </li>
        </ol>

        <div className="flex justify-end mt-6">
          <Button onClick={onAcknowledge}>{t("common.gotIt")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
