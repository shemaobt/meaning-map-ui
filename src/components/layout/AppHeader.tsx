import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { NotificationBell } from "./NotificationBell";
import { useTheme } from "../../contexts/ThemeContext";

interface AppHeaderProps {
  onToggleSidebar: () => void;
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="flex h-14 items-center justify-between border-b border-areia/30 bg-branco px-4">
      <div className="flex w-1/3 items-center">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex w-1/3 items-center justify-center">
        <h1 className="text-xl font-bold tracking-tight text-preto">
          <span className="text-telha">Bible</span> MeaningMaps
        </h1>
      </div>

      <div className="flex w-1/3 items-center justify-end gap-1">
        <button
          onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
          className="rounded-md p-1.5 text-verde hover:bg-areia/20 transition-colors"
          aria-label="Toggle dark mode"
        >
          {resolvedTheme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
        <NotificationBell />
      </div>
    </header>
  );
}
