import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, RefreshCw, ArrowLeft, Download } from 'lucide-react';
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
  const [pdfExporting, setPdfExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadPdf = async () => {
    setPdfExporting(true);
    toast.info('Generating PDF...');
    try {
      await new Promise(r => setTimeout(r, 100));
      const container = pdfRef.current;
      if (!container) throw new Error('No preview');
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas')]);
      const pageCards = container.querySelectorAll<HTMLElement>('[data-pdf-page]');
      if (pageCards.length === 0) throw new Error('No pages');
      const PDF_W = 595.28, PDF_H = 841.89;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      for (let i = 0; i < pageCards.length; i++) {
        const canvas = await html2canvas(pageCards[i], { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgH = (canvas.height / canvas.width) * PDF_W;
        if (i > 0) pdf.addPage();
        if (imgH <= PDF_H) pdf.addImage(imgData, 'JPEG', 0, 0, PDF_W, imgH);
        else pdf.addImage(imgData, 'JPEG', 0, 0, (canvas.width / canvas.height) * PDF_H, PDF_H);
      }
      const cover = proposal.sections.find(s => s.type === 'cover')?.coverData;
      const clientName = cover?.clientName || proposal.client || 'Client';
      const projectTitle = cover?.projectTitle || proposal.title || 'Proposal';
      pdf.save(`${clientName} — ${projectTitle} — v${proposal.version || 1}.pdf`);
      toast.success('PDF downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    } finally {
      setPdfExporting(false);
    }
  };

  const isAccepted = proposal.status === 'accepted';
  const sentDate = proposal.sentAt
    ? format(new Date(proposal.sentAt), 'MMMM d, yyyy')
    : 'unknown date';
  const template = (proposal.template as TemplateId) || 'classic';
  const cover = proposal.sections.find(s => s.type === 'cover')?.coverData;
  const companyName = cover?.companyName || '';

  const bannerText = isAccepted
    ? `This proposal was accepted on ${sentDate} and is permanently locked.`
    : `This proposal was sent on ${sentDate} and is locked for editing.`;

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="flex flex-col min-h-[calc(100vh-48px)]">
      <BreadcrumbBar items={['Dashboard', 'Proposals', proposal.title]} />

      {/* Locked banner */}
      <div className={`border-b px-8 py-3 ${isAccepted ? 'bg-green-50 border-green-200' : 'bg-primary/5 border-primary/20'}`}>
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Lock size={14} className={isAccepted ? 'text-green-600 flex-shrink-0' : 'text-primary flex-shrink-0'} />
          <p className="text-sm text-foreground">{bannerText}</p>
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
            acceptedAt={isAccepted ? proposal.sentAt : undefined}
          />
        </div>
      </div>

      {/* Bottom action bar — no actions for accepted proposals */}
      <div className="sticky bottom-0 z-10 border-t border-border bg-card px-8 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/proposals')}
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Proposals
        </button>
        {!isAccepted && (
          <button
            onClick={handleCreateNewVersion}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw size={16} /> Create New Version
          </button>
        )}
      </div>
    </motion.div>
  );
}
