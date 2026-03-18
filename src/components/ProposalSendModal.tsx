import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { sendProposal } from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  proposalId: string;
  onClose: () => void;
  onSent: () => void;
}

export default function ProposalSendModal({ proposalId, onClose, onSent }: Props) {
  const [accessType, setAccessType] = useState<'link' | 'access-code'>('link');
  const [accessCode, setAccessCode] = useState('');
  const [sending, setSending] = useState(false);
  const [sentLink, setSentLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      const result = await sendProposal(proposalId, accessType, accessType === 'access-code' ? accessCode : undefined);
      setSentLink(result.link);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card rounded-lg shadow-widget p-8 w-full max-w-md">
        {sentLink ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Proposal Sent!</h2>
            <p className="text-sm text-muted-foreground">Share this link with your client:</p>
            <div className="flex gap-2">
              <input readOnly value={sentLink} className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground" onClick={e => (e.target as HTMLInputElement).select()} />
              <button onClick={handleCopy} className="flex items-center gap-1.5 px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <button onClick={onSent} className="w-full h-10 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">Done</button>
          </div>
        ) : (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Send Proposal</h2>
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Access Type</label>
              <div className="flex gap-3">
                {([{ key: 'link' as const, label: 'Link Only' }, { key: 'access-code' as const, label: 'Access Code' }]).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setAccessType(key)}
                    className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors ${
                      accessType === key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:bg-secondary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {accessType === 'access-code' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Access Code</label>
                <input type="text" value={accessCode} onChange={e => setAccessCode(e.target.value)} placeholder="Set an access code" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 h-10 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary">Cancel</button>
              <button onClick={handleSend} disabled={sending || (accessType === 'access-code' && !accessCode)} className="flex-1 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
