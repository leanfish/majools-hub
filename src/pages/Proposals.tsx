import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, Trash2, Lock, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BreadcrumbBar from '../components/BreadcrumbBar';
import { getProposals, deleteProposal } from '@/lib/api';
import type { Proposal } from '@/lib/mock-data';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

const statusColor: Record<string, string> = {
  sent: 'bg-primary/20 text-primary',
  draft: 'bg-secondary text-muted-foreground',
  accepted: 'bg-green-100 text-green-700',
  viewed: 'bg-yellow-100 text-yellow-700',
  declined: 'bg-red-100 text-red-600',
};

const statusLabel: Record<string, string> = {
  sent: 'Sent', draft: 'Draft', accepted: 'Accepted', viewed: 'Viewed', declined: 'Declined',
};

const Proposals = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Proposal | null>(null);

  const loadProposals = () => {
    setLoading(true);
    getProposals().then(setProposals).finally(() => setLoading(false));
  };

  useEffect(() => { loadProposals(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteProposal(deleteTarget.id);
    toast.success('Proposal deleted');
    setDeleteTarget(null);
    loadProposals();
  };

  const filtered = proposals.filter(p => {
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <TooltipProvider>
      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}>
        <BreadcrumbBar items={['Dashboard', 'Proposals']} />
        <div className="max-w-[1400px] mx-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-foreground">Proposals</h1>
            <button onClick={() => navigate('/proposals/new')} className="flex items-center gap-2 px-4 py-2 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus size={16} /> New Proposal
            </button>
          </div>

          <div className="bg-card rounded-lg shadow-widget overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Search size={16} className="text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title or client..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-sm border border-border rounded-md px-2 py-1 bg-background text-foreground"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-6 py-3">Proposal</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-6 py-3">Client</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-6 py-3">Status</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-6 py-3">Created</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-6 py-3">Updated</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground text-sm">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground text-sm">No proposals found</td></tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.id} onClick={() => navigate(`/proposals/${p.id}/edit`)} className="border-b border-border last:border-0 hover:bg-background/50 transition-colors cursor-pointer">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{p.title}</span>
                          {p.version && p.version > 1 && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">v{p.version}</span>
                          )}
                          {p.accessType === 'access-code' && p.accessCode && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-muted-foreground">
                                  <KeyRound size={13} />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Access code: <span className="font-mono font-medium">{p.accessCode}</span></p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-foreground">{p.client}</td>
                      <td className="px-6 py-3.5">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-sm ${statusColor[p.status]}`}>
                          {statusLabel[p.status]}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-muted-foreground">{formatDate(p.createdAt)}</td>
                      <td className="px-6 py-3.5 text-sm text-muted-foreground">{formatDate(p.updatedAt)}</td>
                      <td className="px-6 py-3.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}
                          className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete confirmation modal */}
        <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This proposal will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </TooltipProvider>
  );
};

export default Proposals;
