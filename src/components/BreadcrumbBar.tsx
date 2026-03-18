import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbBarProps {
  items: string[];
}

const routeMap: Record<string, string> = {
  Dashboard: '/',
  Proposals: '/proposals',
  Settings: '/settings',
  Help: '/help',
};

const BreadcrumbBar = ({ items }: BreadcrumbBarProps) => {
  return (
    <div className="h-12 bg-card border-b border-border flex items-center px-8">
      <nav className="flex items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const route = routeMap[item];
          return (
            <span key={index} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight size={12} className="text-muted" />}
              {isLast || !route ? (
                <span
                  className={`text-xs uppercase tracking-widest font-medium ${
                    isLast ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item}
                </span>
              ) : (
                <Link
                  to={route}
                  className="text-xs uppercase tracking-widest font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
};

export default BreadcrumbBar;
