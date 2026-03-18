import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  FolderKanban,
  Rocket,
  BookOpen,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  title: string;
  icon: React.ElementType;
  path: string;
  comingSoon?: boolean;
}

const mainNav: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Proposals", icon: FileText, path: "/proposals" },
  { title: "Invoicing", icon: Receipt, path: "/invoicing", comingSoon: true },
  { title: "CRM", icon: Users, path: "/crm", comingSoon: true },
  { title: "Project Management", icon: FolderKanban, path: "/projects", comingSoon: true },
  { title: "Onboarding", icon: Rocket, path: "/onboarding", comingSoon: true },
  { title: "SOPs", icon: BookOpen, path: "/sops", comingSoon: true },
];

const bottomNav: NavItem[] = [
  { title: "Settings", icon: Settings, path: "/settings" },
  { title: "Help", icon: HelpCircle, path: "/help" },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const renderItem = (item: NavItem) => {
    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

    return (
      <button
        key={item.title}
        onClick={() => !item.comingSoon && navigate(item.path)}
        className={`group flex items-center w-full px-4 py-2.5 text-sm font-medium transition-all duration-200 border-l-2 text-left ${
          isActive
            ? "border-primary bg-primary/[0.08] text-primary"
            : item.comingSoon
            ? "border-transparent text-surface-dark-foreground/40 cursor-not-allowed grayscale"
            : "border-transparent text-surface-dark-foreground/70 hover:bg-surface-dark-foreground/[0.04] hover:text-surface-dark-foreground cursor-pointer"
        }`}
        disabled={item.comingSoon}
      >
        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
        <span className="truncate">{item.title}</span>
        {item.comingSoon && (
          <span className="ml-auto text-[10px] uppercase tracking-wider opacity-50">Soon</span>
        )}
      </button>
    );
  };

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-[240px] bg-surface-dark shadow-sidebar z-40 flex flex-col">
      <nav className="flex-1 py-4 flex flex-col gap-0.5">
        {mainNav.map(renderItem)}
      </nav>
      <nav className="py-4 border-t border-surface-dark-foreground/10 flex flex-col gap-0.5">
        {bottomNav.map(renderItem)}
      </nav>
    </aside>
  );
};

export default AppSidebar;
