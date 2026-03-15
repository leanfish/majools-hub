import { Bell, ChevronDown, User } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";

const TopBar = () => {
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

        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-sidebar-border flex items-center justify-center">
            <User size={16} className="text-sidebar-muted" />
          </div>
          <ChevronDown size={14} className="text-sidebar-muted group-hover:text-surface-dark-foreground transition-colors" />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
