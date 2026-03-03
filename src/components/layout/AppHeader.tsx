import { Menu } from "lucide-react";
import { Button } from "../ui/button";

interface AppHeaderProps {
  onToggleSidebar: () => void;
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-areia/30 bg-branco px-4">
      <div className="flex w-1/3 items-center">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex w-1/3 items-center justify-center">
        <h1 className="text-xl font-bold tracking-tight text-preto">
          <span className="text-telha">Prose</span> MeaningMaps
        </h1>
      </div>

      <div className="flex w-1/3 items-center justify-end">
        {/* Empty space for future navbar items */}
      </div>
    </header>
  );
}
