import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, RefreshCw, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import BreadcrumbBar from '@/components/BreadcrumbBar';
import ProposalPreview from '@/components/ProposalPreview';
import { getProposal, reviseProposal } from '@/lib/api';
import type { Proposal } from '@/lib/mock-data';
import { toast } from 'sonner';
import type { TemplateId } from '@/lib/templates';

export default function SentProposalView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getProposal(id)
      .then(p => {
        // If it's a draft, redirect to builder
        if (p.status === 'draft') {
          navigate(`/proposals/${p.id}/edit`, { replace: true });
          return;
        }
        setProposal(p);
      })
      .catch(() => {
        toast.error('Proposal not found');
        navigate('/proposals');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleCreateNewVersion = async () => {
    if (!proposal) return;
    try {
      const revised = await reviseProposal(proposal.id);
      toast.success(`Created v${revised.version} draft`);
      navigate(`/proposals/${revised.id}/edit`);
    } catch {
      toast.error('Failed to create new version');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Loading...</div>
    );
  }

  if (!proposal) return null;

  const sentDate = proposal.sentAt
    ? format(new Date(proposal.sentAt), 'MMMM d, yyyy')
    : 'unknown date';
  const template = (proposal.template as TemplateId) || 'classic';
  const cover = proposal.sections.find(s => s.type === 'cover')?.coverData;
  const companyName = cover?.companyName || '';

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="flex flex-col min-h-[calc(100vh-48px)]">
      <BreadcrumbBar items={['Dashboard', 'Proposals', proposal.title]} />

      {/* Locked banner */}
      <div className="bg-primary/5 border-b border-primary/20 px-8 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Lock size={14} className="text-primary flex-shrink-0" />
          <p className="text-sm text-foreground">
            This proposal was sent on <span className="font-medium">{sentDate}</span> and is locked for editing.
          </p>
        </div>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="max-w-3xl mx-auto my-8">
          <ProposalPreview
            sections={proposal.sections}
            template={template}
            companyName={companyName}
            version={proposal.version}
            sentAt={proposal.sentAt}
            proposalTitle={proposal.title}
            clientName={proposal.client}
          />
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="sticky bottom-0 z-10 border-t border-border bg-card px-8 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/proposals')}
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Proposals
        </button>
        <button
          onClick={handleCreateNewVersion}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw size={16} /> Create New Version
        </button>
      </div>
    </motion.div>
  );
}
