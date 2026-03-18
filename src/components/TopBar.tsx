import { Bell, ChevronDown, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import logoIcon from "@/assets/logo-icon.png";

const TopBar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-surface-dark flex items-center justify-between px-6">
      <div className="flex items-center gap-3 w-[220px]">
        <img src={logoIcon} alt="Majools" className="h-8 w-auto" />
        <span className="text-[22px] font-bold tracking-[0.08em] uppercase leading-none text-surface-dark-foreground">
          MAJOOLS
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-sm text-sidebar-muted hover:text-surface-dark-foreground transition-colors duration-200">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-sidebar-border flex items-center justify-center">
              <User size={16} className="text-sidebar-muted" />
            </div>
            <ChevronDown size={14} className="text-sidebar-muted group-hover:text-surface-dark-foreground transition-colors" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-lg shadow-widget py-1 z-50">
              {user && (
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              )}
              <button onClick={logout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
