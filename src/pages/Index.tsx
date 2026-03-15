import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, FileText, Receipt, FolderKanban, Activity, DollarSign, Zap } from "lucide-react";
import BreadcrumbBar from "../components/BreadcrumbBar";
import { useNavigate } from "react-router-dom";

interface Widget {
  id: string;
  title: string;
  icon: React.ElementType;
  colSpan: string;
}

const ALL_WIDGETS: Widget[] = [
  { id: "proposals", title: "Recent Proposals", icon: FileText, colSpan: "col-span-8" },
  { id: "revenue", title: "Revenue Snapshot", icon: DollarSign, colSpan: "col-span-4" },
  { id: "invoices", title: "Outstanding Invoices", icon: Receipt, colSpan: "col-span-4" },
  { id: "projects", title: "Active Projects", icon: FolderKanban, colSpan: "col-span-4" },
  { id: "quick-actions", title: "Quick Actions", icon: Zap, colSpan: "col-span-4" },
  { id: "activity", title: "Activity Feed", icon: Activity, colSpan: "col-span-12" },
];

const DEFAULT_IDS = ["revenue", "proposals", "invoices", "projects", "quick-actions", "activity"];

const WidgetCard = ({
  widget,
  onRemove,
  index,
  children,
}: {
  widget: Widget;
  onRemove: () => void;
  index: number;
  children: React.ReactNode;
}) => (
  <motion.div
    layout
    initial={{ scale: 0.98, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.98, opacity: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05, ease: [0.2, 0, 0, 1] }}
    className={`${widget.colSpan} bg-card rounded-lg p-6 shadow-widget transition-transform duration-200 hover:-translate-y-0.5`}
  >
    <header className="flex justify-between items-center mb-4">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {widget.title}
      </h3>
      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive transition-colors"
      >
        <X size={14} />
      </button>
    </header>
    {children}
  </motion.div>
);

const Index = () => {
  const [activeWidgets, setActiveWidgets] = useState<string[]>(DEFAULT_IDS);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const navigate = useNavigate();

  const removeWidget = (id: string) => setActiveWidgets((prev) => prev.filter((w) => w !== id));
  const addWidget = (id: string) => {
    setActiveWidgets((prev) => [...prev, id]);
    setShowAddPanel(false);
  };

  const availableToAdd = ALL_WIDGETS.filter((w) => !activeWidgets.includes(w.id));

  const renderWidgetContent = (id: string) => {
    switch (id) {
      case "revenue":
        return (
          <div>
            <div className="text-3xl font-semibold text-foreground">$12,480.00</div>
            <p className="text-sm text-muted-foreground mt-1">This month</p>
          </div>
        );
      case "proposals":
        return (
          <div className="space-y-0">
            {[
              { name: "Website Redesign — Acme Corp", status: "Sent", color: "bg-primary/20 text-primary" },
              { name: "Brand Identity — Nova Labs", status: "Draft", color: "bg-secondary text-muted-foreground" },
              { name: "SEO Audit — Pinnacle Media", status: "Accepted", color: "bg-green-100 text-green-700" },
              { name: "App Prototype — Zenith Inc", status: "Sent", color: "bg-primary/20 text-primary" },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{p.name}</span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-sm ${p.color}`}>{p.status}</span>
              </div>
            ))}
          </div>
        );
      case "invoices":
        return (
          <div>
            <div className="text-3xl font-semibold text-foreground">3</div>
            <p className="text-sm text-muted-foreground mt-1">Totalling $4,250.00</p>
          </div>
        );
      case "projects":
        return (
          <div>
            <div className="text-3xl font-semibold text-foreground">5</div>
            <p className="text-sm text-muted-foreground mt-1">Active projects</p>
          </div>
        );
      case "quick-actions":
        return (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate("/proposals")}
              className="h-10 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              New Proposal
            </button>
            <button className="h-10 rounded-sm border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors cursor-not-allowed opacity-50">
              New Invoice
            </button>
          </div>
        );
      case "activity":
        return (
          <div className="space-y-0">
            {[
              { text: "Proposal sent to Acme Corp", time: "2 hours ago" },
              { text: "Invoice #1042 marked as paid", time: "5 hours ago" },
              { text: "New project created: Zenith App", time: "Yesterday" },
              { text: "Proposal accepted by Pinnacle Media", time: "2 days ago" },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{a.text}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{a.time}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
    >
      <BreadcrumbBar items={["Dashboard"]} />
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Good morning. You have 3 proposals awaiting signature.
          </h1>
          <button
            onClick={() => setShowAddPanel(!showAddPanel)}
            className="flex items-center gap-2 px-4 py-2 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Add Widget
          </button>
        </div>

        <AnimatePresence>
          {showAddPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-card rounded-lg p-6 shadow-widget">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  Available Widgets
                </h3>
                {availableToAdd.length === 0 ? (
                  <p className="text-sm text-muted-foreground">All widgets are active.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableToAdd.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => addWidget(w.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-sm border border-border text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        <w.icon size={14} />
                        {w.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-12 gap-6">
          <AnimatePresence mode="popLayout">
            {activeWidgets.map((id, index) => {
              const widget = ALL_WIDGETS.find((w) => w.id === id);
              if (!widget) return null;
              return (
                <WidgetCard key={id} widget={widget} onRemove={() => removeWidget(id)} index={index}>
                  {renderWidgetContent(id)}
                </WidgetCard>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Index;
