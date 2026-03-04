import { useState } from "react";
import { NavLink } from "react-router-dom";
import { BookOpen, FolderOpen, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuth } from "../../contexts/AuthContext";

const NAV_ITEMS = [
  { to: "/app/dashboard", label: "Dashboard", icon: FolderOpen },
  { to: "/app/books", label: "Books", icon: BookOpen },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const userName = user?.display_name || user?.email || "U";
  const userInitials = userName.charAt(0).toUpperCase();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 top-14 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed top-14 bottom-0 left-0 z-50 flex flex-col flex-shrink-0 bg-branco transition-all duration-300 border-r border-areia/20 lg:static lg:top-0 lg:translate-x-0",
          isExpanded ? "w-64" : "w-16",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex flex-col gap-2 p-3 mt-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onClose}
              title={!isExpanded ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md p-2 text-sm font-medium transition-colors overflow-hidden",
                  isExpanded ? "justify-start px-3" : "justify-center",
                  isActive
                    ? "bg-telha/10 text-telha"
                    : "text-verde/60 hover:text-preto hover:bg-areia/10"
                )
              }
            >
              <item.icon className={cn("flex-shrink-0 h-5 w-5", isExpanded && "mr-3 text-telha/80")} />
              {isExpanded && <span className="truncate whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col items-stretch gap-2 pb-4 px-3 w-full overflow-hidden">
          {isExpanded ? (
            <div className="flex items-center gap-3 p-2 rounded-md mb-2 bg-areia/5 border border-areia/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-telha text-sm font-semibold text-white flex-shrink-0">
                {userInitials}
              </div>
              <span className="truncate text-sm font-medium text-preto flex-1">{userName}</span>
              <button onClick={logout} title="Sign out" className="p-1.5 rounded-md text-verde/60 hover:bg-areia/20 hover:text-telha transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex mx-auto h-8 w-8 items-center justify-center rounded-full bg-telha text-sm font-semibold text-white mb-2 flex-shrink-0">
                {userInitials}
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="mx-auto p-2 rounded-md text-verde/60 hover:bg-areia/10 hover:text-telha transition-colors mb-2"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center text-verde/60 hover:text-preto transition-colors p-2 rounded-md hover:bg-areia/10",
              isExpanded ? "justify-start px-3" : "justify-center mx-auto"
            )}
            title={isExpanded ? "Collapse menu" : "Expand menu"}
          >
            <span className="flex items-center">
              {isExpanded ? <PanelLeftClose className="h-5 w-5 flex-shrink-0" /> : <PanelLeftOpen className="h-5 w-5 flex-shrink-0" />}
              {isExpanded && <span className="ml-3 text-sm font-medium whitespace-nowrap truncate">Collapse</span>}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
