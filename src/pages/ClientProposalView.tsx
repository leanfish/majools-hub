import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { getPublicProposal, respondToProposal } from '@/lib/api';
import type { Proposal } from '@/lib/mock-data';
import { getSettings } from '@/lib/settings-store';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ClientProposalView() {
  const { token } = useParams<{ token: string }>();
  const [proposal, setProposal] = useState<(Proposal & { requiresPassword: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [responded, setResponded] = useState<'accepted' | 'declined' | null>(null);
  const [declineMessage, setDeclineMessage] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const settings = getSettings();
  const { companyLogo, companyName } = settings;

  useEffect(() => {
    if (!token) return;
    getPublicProposal(token)
      .then(p => { setProposal(p); if (!p.requiresPassword) setUnlocked(true); })
      .catch(() => setError('Proposal not found'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleUnlock = () => {
    if (proposal && codeInput === proposal.accessCode) {
      setUnlocked(true);
    } else {
      setError('Incorrect access code');
    }
  };

  const handleAccept = async () => {
    if (!token) return;
    await respondToProposal(token, 'accept');
    setResponded('accepted');
  };

  const handleDecline = async () => {
    if (!token) return;
    await respondToProposal(token, 'decline', declineMessage);
    setResponded('declined');
  };

  const BrandMark = ({ imgClass = 'h-8', textClass = 'text-xl font-bold tracking-[0.08em] uppercase text-foreground' }: { imgClass?: string; textClass?: string }) => {
    if (companyLogo) return <img src={companyLogo} alt={companyName || 'Company'} className={imgClass} />;
    if (companyName) return <span className={textClass}>{companyName}</span>;
    return null;
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (error && !proposal) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-destructive">{error}</div>;
  }

  if (!proposal) return null;

  // ─── Access Code Gate — white-labeled, no Majools branding ───
  if (!unlocked) {
    const cover = proposal.sections.find(s => s.type === 'cover')?.coverData;
    const projectTitle = cover?.projectTitle || proposal.title || 'Proposal';
    return (
      <div className="min-h-screen bg-surface-dark flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          {/* Freelancer branding — logo or company name */}
          <div className="flex items-center justify-center mb-10">
            {companyLogo ? (
              <img src={companyLogo} alt={companyName || 'Company'} className="h-10 w-auto" />
            ) : companyName ? (
              <span className="text-[28px] font-bold tracking-[0.08em] uppercase text-surface-dark-foreground">{companyName}</span>
            ) : null}
          </div>

          <div className="bg-card rounded-lg p-8 shadow-widget space-y-5">
            <h1 className="text-xl font-semibold text-foreground text-center">{projectTitle}</h1>
            <p className="text-sm text-muted-foreground text-center">Enter your access code to view this proposal</p>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <input
              type="text"
              value={codeInput}
              onChange={e => { setCodeInput(e.target.value); setError(''); }}
              placeholder="Access code"
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button onClick={handleUnlock} className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Unlock</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Response confirmation ───
  if (responded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-lg shadow-widget p-12 text-center max-w-md">
          <div className="text-5xl mb-4">{responded === 'accepted' ? '✓' : '✗'}</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {responded === 'accepted' ? 'Proposal Accepted!' : 'Proposal Declined'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {responded === 'accepted'
              ? "Thank you! We'll be in touch shortly to get started."
              : 'Your response has been recorded. Thank you for your time.'}
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── Main proposal view ───
  const cover = proposal.sections.find(s => s.type === 'cover')?.coverData;
  const displayCompany = companyName || cover?.companyName || 'Your Company';
  const totalPages = proposal.sections.length;
  const version = proposal.version || 1;
  const sentDate = proposal.sentAt ? format(new Date(proposal.sentAt), 'MMM d, yyyy') : '';

  const handlePdfExport = async () => {
    setPdfExporting(true);
    toast.info('Generating PDF...');
    try {
      const container = mainRef.current;
      if (!container) throw new Error('No content');
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
      const clientName = cover?.clientName || proposal.client || 'Client';
      const projectTitle = cover?.projectTitle || proposal.title || 'Proposal';
      pdf.save(`${clientName} — ${projectTitle} — v${version}.pdf`);
      toast.success('PDF downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    } finally {
      setPdfExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Sticky top bar ── */}
      <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <BrandMark imgClass="h-7" textClass="text-base font-bold tracking-[0.06em] uppercase text-foreground" />
        <span className="text-xs font-medium text-muted-foreground">v{version}</span>
      </header>

      {/* ── Scrollable content ── */}
      <motion.main ref={mainRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 max-w-3xl mx-auto w-full p-8 pb-28 space-y-10">
        {proposal.sections.map((s, pageIdx) => {
          if (s.type === 'cover' && cover) {
            return (
              <div key={s.id} data-pdf-page className="bg-card rounded-lg shadow-widget min-h-[500px] flex flex-col relative">
                <div className="flex-1 p-8 flex flex-col justify-center space-y-2">
                  <h1 className="text-2xl font-semibold text-foreground">{cover.projectTitle || proposal.title}</h1>
                  <p className="text-muted-foreground">Prepared for <span className="text-foreground font-medium">{cover.clientName || proposal.client}</span></p>
                  <p className="text-sm text-muted-foreground">By {displayCompany} · {cover.date}</p>
                </div>
              </div>
            );
          }

          if (s.type === 'investment') {
            const items = s.lineItems || [];
            const total = items.reduce((sum, li) => sum + li.total, 0);
            if (items.length === 0) return null;
            return (
              <div key={s.id} data-pdf-page className="bg-card rounded-lg shadow-widget min-h-[500px] flex flex-col relative">
                <div className="flex-1 p-8">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">{s.title}</h2>
                  <div className="space-y-2">
                    {items.map(li => (
                      <div key={li.id} className="flex justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <span className="text-sm text-foreground">{li.description || 'Line item'}</span>
                          <span className="text-xs text-muted-foreground ml-2">× {li.quantity}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">${li.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 mt-4 border-t border-border flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-xl font-semibold text-foreground">${total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="border-t border-border px-8 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{proposal.title} · v{version}{sentDate ? ` · ${sentDate}` : ''}</span>
                  <span>Page {pageIdx + 1} of {totalPages}</span>
                </div>
              </div>
            );
          }

          if (!s.content) return null;
          return (
            <div key={s.id} data-pdf-page className="bg-card rounded-lg shadow-widget min-h-[500px] flex flex-col relative">
              <div className="flex-1 p-8">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">{s.title}</h2>
                <div className="text-sm text-foreground whitespace-pre-wrap">{s.content}</div>
              </div>
              <div className="border-t border-border px-8 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{proposal.title} · v{version}{sentDate ? ` · ${sentDate}` : ''}</span>
                <span>Page {pageIdx + 1} of {totalPages}</span>
              </div>
            </div>
          );
        })}
      </motion.main>

      {/* ── Fixed bottom bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePdfExport}
            disabled={pdfExporting}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <Download size={14} /> {pdfExporting ? 'Generating...' : 'Download PDF'}
          </button>

          <div className="flex items-center gap-2">
            {showDeclineForm ? (
              <div className="flex items-center gap-2">
                <input
                  value={declineMessage}
                  onChange={e => setDeclineMessage(e.target.value)}
                  placeholder="Reason (optional)"
                  className="h-9 w-48 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button onClick={() => setShowDeclineForm(false)} className="h-9 px-3 rounded-md border border-border text-xs font-medium hover:bg-secondary">Cancel</button>
                <button onClick={handleDecline} className="h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90">Confirm Decline</button>
              </div>
            ) : (
              <>
                <button onClick={() => setShowDeclineForm(true)} className="h-9 px-4 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                  Decline
                </button>
                <button onClick={handleAccept} className="h-9 px-6 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Accept Proposal
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
