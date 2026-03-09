import { useState, useEffect } from "react";
import { User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
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

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, refreshUser } = useAuth();
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
      toast.success("Profile updated");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your display name and profile photo.
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
              Display Name
            </label>
            <input
              id="profile-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              maxLength={120}
              className="flex h-10 w-full rounded-md border border-areia bg-surface px-3 py-2 text-sm focus:ring-2 focus:ring-telha focus:border-telha outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-preto">Email</label>
            <input
              value={user?.email || ""}
              disabled
              className="flex h-10 w-full rounded-md border border-areia/50 bg-areia/10 px-3 py-2 text-sm text-verde/60 cursor-not-allowed"
            />
            <p className="text-xs text-verde/50 mt-1.5">
              Email cannot be changed
            </p>
          </div>
        </div>

        <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
