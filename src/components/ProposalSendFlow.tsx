import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, X, ArrowLeft, Eye, Palette } from 'lucide-react';
import { sendProposal } from '@/lib/api';
import { toast } from 'sonner';
import ProposalPreview from './ProposalPreview';
import TemplateSelectorModal from './TemplateSelectorModal';
import type { ProposalSection } from '@/lib/mock-data';
import type { TemplateId } from '@/lib/templates';

interface Props {
  proposalId: string;
  sections: ProposalSection[];
  template: TemplateId;
  companyName?: string;
  onClose: () => void;
  onSent: () => void;
  previewOnly?: boolean;
  onTemplateChange?: (id: TemplateId) => void;
}

type Step = 'preview' | 'settings' | 'confirmation';

export default function ProposalSendFlow({ proposalId, sections, template, companyName, onClose, onSent, previewOnly, onTemplateChange }: Props) {
  const [step, setStep] = useState<Step>('preview');
  const [accessType, setAccessType] = useState<'link' | 'password'>('link');
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [sentLink, setSentLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      const result = await sendProposal(proposalId, accessType, accessType === 'password' ? password : undefined);
      setSentLink(result.link);
      setStep('confirmation');
      toast.success('Proposal sent!');
    } catch {
      toast.error('Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sentLink);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          {step !== 'preview' && (
            <button onClick={() => setStep(step === 'confirmation' ? 'settings' : 'preview')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              {step === 'preview' ? 'Preview' : step === 'settings' ? 'Send Settings' : 'Sent!'}
            </span>
            {step === 'preview' && onTemplateChange && previewOnly && (
              <button
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center gap-1.5 ml-3 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <Palette size={14} />
                Change Template
              </button>
            )}
          </div>
          {!previewOnly && (
            <div className="flex items-center gap-1 ml-4">
              {(['preview', 'settings', 'confirmation'] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${step === s ? 'bg-primary' : s === 'confirmation' && step !== 'confirmation' ? 'bg-border' : step === 'confirmation' ? 'bg-primary' : 'bg-border'}`} />
                  {i < 2 && <div className="w-6 h-px bg-border" />}
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {step === 'preview' && (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
              <div className="flex-1 overflow-auto bg-gray-100">
                <div className="max-w-3xl mx-auto my-8">
                  <ProposalPreview sections={sections} template={template} companyName={companyName} />
                </div>
              </div>
              <div className="border-t border-border bg-card px-6 py-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">This is exactly what your client will see.</p>
                <div className="flex gap-2">
                  <button onClick={onClose} className="px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                    Back to editing
                  </button>
                  {!previewOnly && (
                    <button onClick={() => setStep('settings')} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                      Looks good, send it
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-16">
              <div className="bg-card rounded-lg shadow-widget p-8 w-full max-w-md space-y-5">
                <h2 className="text-lg font-semibold text-foreground">Send Settings</h2>
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Access Type</label>
                  <div className="flex gap-3">
                    {(['link', 'password'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setAccessType(type)}
                        className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors ${
                          accessType === type ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:bg-secondary'
                        }`}
                      >
                        {type === 'link' ? 'Link Only' : 'Password Protected'}
                      </button>
                    ))}
                  </div>
                </div>
                {accessType === 'password' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
                    <input
                      type="text"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Set a password"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setStep('preview')} className="flex-1 h-10 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary">
                    Back
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending || (accessType === 'password' && !password)}
                    className="flex-1 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'confirmation' && (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-16">
              <div className="bg-card rounded-lg shadow-widget p-8 w-full max-w-md space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Check size={24} className="text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground text-center">Proposal Sent!</h2>
                <p className="text-sm text-muted-foreground text-center">Share this link with your client:</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={sentLink}
                    className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
                    onClick={e => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <button
                  onClick={onSent}
                  className="w-full h-10 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {showTemplateModal && onTemplateChange && (
        <TemplateSelectorModal
          current={template}
          onSelect={onTemplateChange}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </div>
  );
}
