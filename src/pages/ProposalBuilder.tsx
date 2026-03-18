import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GripVertical, Plus, Trash2, Save, Send } from 'lucide-react';
import BreadcrumbBar from '@/components/BreadcrumbBar';
import { getProposal, createProposal, updateProposal, sendProposal } from '@/lib/api';
import type { Proposal, ProposalSection, ProposalLineItem } from '@/lib/mock-data';
import { createDefaultSections } from '@/lib/mock-data';
import { toast } from 'sonner';

const SECTION_LABELS: Record<string, string> = {
  cover: 'Cover',
  'executive-summary': 'Executive Summary',
  scope: 'Scope of Work',
  deliverables: 'Deliverables',
  timeline: 'Timeline',
  investment: 'Investment',
  terms: 'Terms & Conditions',
};

export default function ProposalBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [sections, setSections] = useState<ProposalSection[]>(createDefaultSections());
  const [activeSection, setActiveSection] = useState(0);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [proposalId, setProposalId] = useState(id || '');
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      getProposal(id).then(p => {
        setTitle(p.title);
        setSections(p.sections);
        setProposalId(p.id);
      }).catch(() => {
        toast.error('Proposal not found');
        navigate('/proposals');
      });
    }
  }, [id, isEdit, navigate]);

  const updateSection = (index: number, updates: Partial<ProposalSection>) => {
    setSections(prev => prev.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  const addLineItem = () => {
    const section = sections[activeSection];
    if (section.type !== 'investment') return;
    const items = section.lineItems || [];
    updateSection(activeSection, {
      lineItems: [...items, { id: `li-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const updateLineItem = (liIdx: number, updates: Partial<ProposalLineItem>) => {
    const section = sections[activeSection];
    const items = [...(section.lineItems || [])];
    items[liIdx] = { ...items[liIdx], ...updates };
    if ('quantity' in updates || 'unitPrice' in updates) {
      items[liIdx].total = items[liIdx].quantity * items[liIdx].unitPrice;
    }
    updateSection(activeSection, { lineItems: items });
  };

  const removeLineItem = (liIdx: number) => {
    const section = sections[activeSection];
    updateSection(activeSection, {
      lineItems: (section.lineItems || []).filter((_, i) => i !== liIdx),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const totalValue = sections
        .find(s => s.type === 'investment')
        ?.lineItems?.reduce((sum, li) => sum + li.total, 0) || 0;

      const cover = sections.find(s => s.type === 'cover')?.coverData;
      const data = {
        title: title || cover?.projectTitle || 'Untitled Proposal',
        client: cover?.clientName || '',
        clientEmail: cover?.clientEmail || '',
        value: totalValue,
        sections,
      };

      if (proposalId) {
        await updateProposal(proposalId, data);
      } else {
        const created = await createProposal(data);
        setProposalId(created.id);
      }
      toast.success('Proposal saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newSections = [...sections];
    const [moved] = newSections.splice(dragIdx, 1);
    newSections.splice(idx, 0, moved);
    setSections(newSections);
    setDragIdx(idx);
    if (activeSection === dragIdx) setActiveSection(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const current = sections[activeSection];

  const renderSectionEditor = () => {
    if (!current) return null;

    if (current.type === 'cover') {
      const cd = current.coverData || { projectTitle: '', clientName: '', clientEmail: '', yourName: '', date: '' };
      const updateCover = (field: string, value: string) => {
        updateSection(activeSection, { coverData: { ...cd, [field]: value } });
        if (field === 'projectTitle') setTitle(value);
      };
      return (
        <div className="space-y-4">
          {[
            { label: 'Project Title', field: 'projectTitle', placeholder: 'e.g. Website Redesign' },
            { label: 'Client Name', field: 'clientName', placeholder: 'e.g. Acme Corp' },
            { label: 'Client Email', field: 'clientEmail', placeholder: 'client@example.com' },
            { label: 'Your Name', field: 'yourName', placeholder: 'Your full name' },
            { label: 'Date', field: 'date', placeholder: 'YYYY-MM-DD' },
          ].map(f => (
            <div key={f.field} className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{f.label}</label>
              <input
                value={(cd as Record<string, string>)[f.field] || ''}
                onChange={e => updateCover(f.field, e.target.value)}
                placeholder={f.placeholder}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </div>
      );
    }

    if (current.type === 'investment') {
      const items = current.lineItems || [];
      const total = items.reduce((sum, li) => sum + li.total, 0);
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>Description</span><span>Qty</span><span>Unit Price</span><span>Total</span><span />
          </div>
          {items.map((li, i) => (
            <div key={li.id} className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-2 items-center">
              <input value={li.description} onChange={e => updateLineItem(i, { description: e.target.value })} placeholder="Line item" className="h-9 px-2 rounded-md border border-input bg-background text-sm" />
              <input type="number" value={li.quantity} onChange={e => updateLineItem(i, { quantity: Number(e.target.value) })} className="h-9 px-2 rounded-md border border-input bg-background text-sm" min={1} />
              <input type="number" value={li.unitPrice} onChange={e => updateLineItem(i, { unitPrice: Number(e.target.value) })} className="h-9 px-2 rounded-md border border-input bg-background text-sm" min={0} step={0.01} />
              <span className="text-sm font-medium text-foreground">${li.total.toFixed(2)}</span>
              <button onClick={() => removeLineItem(i)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={addLineItem} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
            <Plus size={14} /> Add line item
          </button>
          <div className="pt-4 border-t border-border flex justify-between">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-lg font-semibold text-foreground">${total.toFixed(2)}</span>
          </div>
        </div>
      );
    }

    return (
      <textarea
        value={current.content}
        onChange={e => updateSection(activeSection, { content: e.target.value })}
        placeholder={`Write your ${current.title.toLowerCase()} here...`}
        className="w-full h-64 px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      />
    );
  };

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      <BreadcrumbBar items={['Dashboard', 'Proposals', isEdit ? 'Edit Proposal' : 'New Proposal']} />
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-foreground">{isEdit ? 'Edit Proposal' : 'New Proposal'}</h1>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={() => { handleSave().then(() => setShowSendModal(true)); }} className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Send size={16} /> Send Proposal
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[240px_1fr] gap-6">
          {/* Section list */}
          <div className="bg-card rounded-lg shadow-widget p-4 space-y-1 h-fit">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Sections</h3>
            {sections.map((s, i) => (
              <div
                key={s.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={e => handleDragOver(e, i)}
                onDragEnd={handleDragEnd}
                onClick={() => setActiveSection(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                  i === activeSection ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-secondary'
                }`}
              >
                <GripVertical size={14} className="text-muted-foreground flex-shrink-0 cursor-grab" />
                <span className="truncate">{s.title}</span>
              </div>
            ))}
          </div>

          {/* Editor */}
          <div className="bg-card rounded-lg shadow-widget p-8">
            <h2 className="text-lg font-semibold text-foreground mb-6">{current?.title}</h2>
            {renderSectionEditor()}
          </div>
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <SendModal
          proposalId={proposalId}
          onClose={() => setShowSendModal(false)}
          onSent={() => { setShowSendModal(false); navigate('/proposals'); }}
        />
      )}
    </motion.div>
  );
}

function SendModal({ proposalId, onClose, onSent }: { proposalId: string; onClose: () => void; onSent: () => void }) {
  const [accessType, setAccessType] = useState<'link' | 'password'>('link');
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [sentLink, setSentLink] = useState('');

  const handleSend = async () => {
    setSending(true);
    try {
      const result = await sendProposal(proposalId, accessType, accessType === 'password' ? password : undefined);
      setSentLink(result.link);
      toast.success('Proposal sent!');
    } catch {
      toast.error('Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card rounded-lg shadow-widget p-8 w-full max-w-md">
        {sentLink ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Proposal Sent!</h2>
            <p className="text-sm text-muted-foreground">Share this link with your client:</p>
            <input readOnly value={sentLink} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground" onClick={e => (e.target as HTMLInputElement).select()} />
            <button onClick={onSent} className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Done</button>
          </div>
        ) : (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Send Proposal</h2>
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
                <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Set a password" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 h-10 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary">Cancel</button>
              <button onClick={handleSend} disabled={sending || (accessType === 'password' && !password)} className="flex-1 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
