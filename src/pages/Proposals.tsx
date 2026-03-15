import { motion } from "framer-motion";
import { FileText, Plus, Search } from "lucide-react";
import BreadcrumbBar from "../components/BreadcrumbBar";

const proposals = [
  { id: 1, name: "Website Redesign — Acme Corp", value: "$4,500", status: "Sent", date: "Mar 12, 2026" },
  { id: 2, name: "Brand Identity — Nova Labs", value: "$2,800", status: "Draft", date: "Mar 10, 2026" },
  { id: 3, name: "SEO Audit — Pinnacle Media", value: "$1,200", status: "Accepted", date: "Mar 8, 2026" },
  { id: 4, name: "App Prototype — Zenith Inc", value: "$6,500", status: "Sent", date: "Mar 5, 2026" },
  { id: 5, name: "Marketing Strategy — Bloom Co", value: "$3,200", status: "Draft", date: "Mar 3, 2026" },
];

const statusColor: Record<string, string> = {
  Sent: "bg-primary/20 text-primary",
  Draft: "bg-secondary text-muted-foreground",
  Accepted: "bg-green-100 text-green-700",
};

const Proposals = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
    >
      <BreadcrumbBar items={["Dashboard", "Proposals"]} />
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Proposals</h1>
          <button className="flex items-center gap-2 px-4 py-2 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={16} />
            New Proposal
          </button>
        </div>

        <div className="bg-card rounded-lg shadow-widget overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Search size={16} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search proposals..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
            />
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-6 py-3">Proposal</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-6 py-3">Value</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-6 py-3">Status</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-background/50 transition-colors cursor-pointer">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-foreground">{p.value}</td>
                  <td className="px-6 py-3.5">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-sm ${statusColor[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-muted-foreground">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Proposals;
