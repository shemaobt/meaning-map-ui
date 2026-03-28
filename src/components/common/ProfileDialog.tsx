import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { ImageUpload } from "./ImageUpload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const ROLE_LABEL_KEYS: Record<string, string> = {
  admin: "profile.roles.admin",
  analyst: "profile.roles.analyst",
  exegete: "profile.roles.exegete",
  biblical_language_specialist: "profile.roles.biblicalLanguageSpecialist",
  translation_specialist: "profile.roles.translationSpecialist",
};

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-telha/15 text-telha border-telha/20",
  analyst: "bg-azul/15 text-azul border-azul/20",
  exegete: "bg-telha/15 text-telha border-telha/20",
  biblical_language_specialist: "bg-azul/15 text-azul border-azul/20",
  translation_specialist: "bg-verde-claro/15 text-verde-claro border-verde-claro/20",
};

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { t } = useTranslation();
  const { user, refreshUser, appRoles } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      setDisplayName(user.display_name || "");
      setAvatarUrl(user.avatar_url);
    }
  }, [open, user]);

  async function handleSave() {
    setSaving(true);
    try {
      const payload: { display_name?: string; avatar_url?: string | null } = {};

      if (displayName !== (user?.display_name || "")) {
        payload.display_name = displayName;
      }
      if (avatarUrl !== user?.avatar_url) {
        payload.avatar_url = avatarUrl ?? "";
      }

      if (Object.keys(payload).length === 0) {
        onOpenChange(false);
        return;
      }

      await authAPI.updateMe(payload);
      await refreshUser();
      toast.success(t("profile.updated"));
      onOpenChange(false);
    } catch {
      toast.error(t("profile.updateFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("profile.editTitle")}</DialogTitle>
          <DialogDescription>
            {t("profile.editDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          <div className="flex justify-center py-2">
            <ImageUpload
              value={avatarUrl}
              onChange={setAvatarUrl}
              folder="avatars"
              shape="circle"
              size="lg"
              placeholder={<UserIcon className="h-8 w-8 text-verde/30" />}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-display-name" className="text-sm font-medium text-preto">
              {t("profile.displayNameLabel")}
            </label>
            <input
              id="profile-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("profile.displayNamePlaceholder")}
              maxLength={120}
              className="flex h-10 w-full rounded-md border border-areia bg-surface px-3 py-2 text-sm focus:ring-2 focus:ring-telha focus:border-telha outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-preto">{t("profile.emailLabel")}</label>
            <input
              value={user?.email || ""}
              disabled
              className="flex h-10 w-full rounded-md border border-areia/50 bg-areia/10 px-3 py-2 text-sm text-verde/60 cursor-not-allowed"
            />
            <p className="text-xs text-verde/50 mt-1.5">
              {t("profile.emailCannotChange")}
            </p>
          </div>

          {appRoles.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-preto">
                {t("profile.rolesLabel")}
              </label>
              <div className="flex flex-wrap gap-2">
                {appRoles.map((role) => (
                  <span
                    key={role}
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      ROLE_STYLES[role] || "bg-areia/15 text-verde border-areia/20"
                    )}
                  >
                    {t(ROLE_LABEL_KEYS[role] || role)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
