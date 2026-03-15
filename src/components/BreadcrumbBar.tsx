import { ChevronRight } from "lucide-react";

interface BreadcrumbBarProps {
  items: string[];
}

const BreadcrumbBar = ({ items }: BreadcrumbBarProps) => {
  return (
    <div className="h-12 bg-card border-b border-border flex items-center px-8">
      <nav className="flex items-center gap-1.5">
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight size={12} className="text-muted" />}
            <span
              className={`text-xs uppercase tracking-widest font-medium ${
                index === items.length - 1
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {item}
            </span>
          </span>
        ))}
      </nav>
    </div>
  );
};

export default BreadcrumbBar;
