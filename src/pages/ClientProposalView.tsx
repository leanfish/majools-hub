import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { getPublicProposal, respondToProposal } from '@/lib/api';
import type { Proposal } from '@/lib/mock-data';
import logoIcon from '@/assets/logo-icon.png';
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

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (error && !proposal) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-destructive">{error}</div>;
  }

  if (!proposal) return null;

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-lg shadow-widget p-8 w-full max-w-sm space-y-5">
          <div className="flex items-center justify-center gap-3">
            <img src={logoIcon} alt="Majools" className="h-8" />
            <span className="text-xl font-bold tracking-[0.08em] uppercase text-foreground">MAJOOLS</span>
          </div>
          <h2 className="text-lg font-semibold text-foreground text-center">This proposal requires an access code</h2>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <input
            type="text"
            value={codeInput}
            onChange={e => { setCodeInput(e.target.value); setError(''); }}
            placeholder="Enter access code"
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button onClick={handleUnlock} className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Unlock</button>
        </motion.div>
      </div>
    );
  }

  if (responded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-lg shadow-widget p-12 text-center max-w-md">
          <div className="text-5xl mb-4">
            {responded === 'accepted' ? '✓' : '✗'}
          </div>
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

  const cover = proposal.sections.find(s => s.type === 'cover')?.coverData;
  const displayCompany = cover?.companyName || 'Your Company';
  const totalPages = proposal.sections.length;
  const version = proposal.version || 1;
  const sentDate = proposal.sentAt ? format(new Date(proposal.sentAt), 'MMM d, yyyy') : '';

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface-dark py-6 px-8">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <img src={logoIcon} alt="Majools" className="h-8" />
          <span className="text-lg font-bold tracking-[0.08em] uppercase text-surface-dark-foreground">MAJOOLS</span>
        </div>
      </header>

      <motion.main ref={mainRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto p-8 space-y-10">
        {/* Each section as a distinct page card */}
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

        {/* Actions */}
        <div className="bg-card rounded-lg shadow-widget p-8 space-y-4">
          {showDeclineForm ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Would you like to share why?</h3>
              <textarea
                value={declineMessage}
                onChange={e => setDeclineMessage(e.target.value)}
                placeholder="Optional message..."
                className="w-full h-24 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowDeclineForm(false)} className="flex-1 h-10 rounded-md border border-border text-sm font-medium hover:bg-secondary">Back</button>
                <button onClick={handleDecline} className="flex-1 h-10 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90">Confirm Decline</button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={handleAccept} className="flex-1 h-12 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                Accept Proposal
              </button>
              <button onClick={() => setShowDeclineForm(true)} className="flex-1 h-12 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                Decline
              </button>
            </div>
          )}
        </div>

        {/* Download PDF link */}
        <div className="text-center pt-2 pb-8">
          <button
            onClick={async () => {
              setPdfExporting(true);
              toast.info('Generating PDF...');
              try {
                const container = mainRef.current;
                if (!container) throw new Error('No content');
                const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas')]);
                // Select all page cards (bg-card rounded-lg shadow-widget)
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
            }}
            disabled={pdfExporting}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <Download size={12} /> {pdfExporting ? 'Generating...' : 'Download as PDF'}
          </button>
        </div>
      </motion.main>
    </div>
  );
}
