import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
  saving?: boolean;
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onSave,
  onDiscard,
  saving = false,
}: UnsavedChangesDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("bcdDetail.unsavedChangesTitle")}</DialogTitle>
          <DialogDescription>
            {t("bcdDetail.unsavedChangesDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button variant="outline" onClick={onDiscard} disabled={saving}>
            {t("bcdDetail.discardChanges")}
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? t("common.saving") : t("bcdDetail.saveAndContinue")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
