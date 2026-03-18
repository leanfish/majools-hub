import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Send, CalendarIcon, Eye, HelpCircle, RefreshCw, Lock } from 'lucide-react';
import { format } from 'date-fns';
import BreadcrumbBar from '@/components/BreadcrumbBar';
import ProposalSendFlow from '@/components/ProposalSendFlow';
import SectionsPanel from '@/components/SectionsPanel';
import SectionHelpTips from '@/components/SectionHelpTips';
import { getProposal, createProposal, updateProposal, reviseProposal } from '@/lib/api';
import type { ProposalSection, ProposalLineItem, SectionType } from '@/lib/mock-data';
import { createDefaultSections, BOILERPLATE_CONTENT } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth';
import { getSettings } from '@/lib/settings-store';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getDefaultTemplate, templates, type TemplateId } from '@/lib/templates';

export default function ProposalBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const [sections, setSections] = useState<ProposalSection[]>(createDefaultSections());
  const [activeSection, setActiveSection] = useState(0);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSendFlow, setShowSendFlow] = useState(false);
  const [previewOnly, setPreviewOnly] = useState(false);
  const [proposalId, setProposalId] = useState(id || '');
  const [template, setTemplate] = useState<TemplateId>(getDefaultTemplate());
  const [showHelp, setShowHelp] = useState(false);
  const [proposalStatus, setProposalStatus] = useState<string>('draft');
  const [proposalVersion, setProposalVersion] = useState(1);

  const isSent = proposalStatus !== 'draft';
  const readOnly = isSent;

  // Auto-populate company name from Settings, fallback to user name
  useEffect(() => {
    if (!isEdit && user) {
      const settings = getSettings();
      const companyName = settings.companyName || user.name;
      setSections(prev => prev.map(s => {
        if (s.type === 'cover' && s.coverData && !s.coverData.companyName) {
          return { ...s, coverData: { ...s.coverData, companyName } };
        }
        return s;
      }));
    }
  }, [isEdit, user]);

  useEffect(() => {
    if (isEdit && id) {
      getProposal(id).then(p => {
        setTitle(p.title);
        setSections(p.sections);
        setProposalId(p.id);
        setProposalStatus(p.status);
        setProposalVersion(p.version || 1);
        if ((p as any).template) setTemplate((p as any).template);
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
        template,
      };

      if (proposalId) {
        await updateProposal(proposalId, data as any);
      } else {
        const created = await createProposal(data as any);
        setProposalId(created.id);
      }
      toast.success('Proposal saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = (newSections: ProposalSection[], newActiveIndex: number) => {
    setSections(newSections);
    setActiveSection(newActiveIndex);
  };

  const handleDeleteSection = (index: number) => {
    setSections(prev => prev.filter((_, i) => i !== index));
    if (activeSection >= index && activeSection > 0) {
      setActiveSection(activeSection - 1);
    }
  };

  const handleAddSection = (type: SectionType, sectionTitle: string) => {
    const newSection: ProposalSection = {
      id: `sec-${Date.now()}`,
      type,
      title: sectionTitle,
      content: BOILERPLATE_CONTENT[type] || '',
      lineItems: type === 'investment' ? [{ id: `li-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, total: 0 }] : undefined,
      coverData: type === 'cover' ? { projectTitle: '', clientName: '', clientEmail: '', companyName: '', date: '' } : undefined,
    };
    setSections(prev => [...prev, newSection]);
    setActiveSection(sections.length);
  };

  const handlePreview = () => {
    setPreviewOnly(true);
    setShowSendFlow(true);
  };

  const handleSendClick = async () => {
    await handleSave();
    setPreviewOnly(false);
    setShowSendFlow(true);
  };

  const handleRevise = async () => {
    try {
      const revised = await reviseProposal(proposalId);
      toast.success(`Created v${revised.version} draft`);
      navigate(`/proposals/${revised.id}/edit`);
    } catch {
      toast.error('Failed to create revision');
    }
  };

  const current = sections[activeSection];
  const currentTemplate = templates.find(t => t.id === template);
  const companyName = sections.find(s => s.type === 'cover')?.coverData?.companyName || '';

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="relative min-h-[calc(100vh-48px)]">
      <BreadcrumbBar items={['Dashboard', 'Proposals', isEdit ? 'Edit Proposal' : 'New Proposal']} />
      <div>
        <div className="max-w-[1400px] mx-auto p-8 pb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">{isEdit ? 'Edit Proposal' : 'New Proposal'}</h1>
              {proposalVersion > 1 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-sm bg-secondary text-muted-foreground">v{proposalVersion}</span>
              )}
              {readOnly && (
                <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-sm bg-primary/10 text-primary">
                  <Lock size={10} /> Read Only
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[280px_1fr] gap-6">
            <SectionsPanel
              sections={sections}
              activeSection={activeSection}
              onSetActive={setActiveSection}
              onReorder={handleReorder}
              onDelete={handleDeleteSection}
              onAdd={handleAddSection}
              readOnly={readOnly}
            />

            <div className="bg-card rounded-lg shadow-widget p-8">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-lg font-semibold text-foreground">{current?.title}</h2>
                {current && current.type !== 'custom' && (
                  <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Writing tips"
                  >
                    <HelpCircle size={16} />
                  </button>
                )}
              </div>
              <SectionEditor
                section={current}
                onUpdate={(updates) => updateSection(activeSection, updates)}
                onTitleChange={setTitle}
                onAddLineItem={addLineItem}
                onUpdateLineItem={updateLineItem}
                onRemoveLineItem={removeLineItem}
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="sticky bottom-0 z-10 border-t border-border bg-card px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {readOnly ? (
            <button onClick={handleRevise} className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <RefreshCw size={16} /> Revise (Create v{proposalVersion + 1})
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Draft'}
            </button>
          )}
          <span className="text-xs text-muted-foreground">
            Template: {currentTemplate?.name}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePreview} className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
            <Eye size={16} /> Preview
          </button>
          {!readOnly && (
            <button onClick={handleSendClick} className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Send size={16} /> Send Proposal
            </button>
          )}
        </div>
      </div>

      {showSendFlow && (
        <ProposalSendFlow
          proposalId={proposalId}
          sections={sections}
          template={template}
          companyName={companyName}
          onClose={() => setShowSendFlow(false)}
          onSent={() => { setShowSendFlow(false); navigate('/proposals'); }}
          previewOnly={previewOnly}
          onTemplateChange={setTemplate}
        />
      )}

      {showHelp && current && current.type !== 'custom' && (
        <SectionHelpTips sectionType={current.type} onClose={() => setShowHelp(false)} />
      )}
    </motion.div>
  );
}

function SectionEditor({
  section,
  onUpdate,
  onTitleChange,
  onAddLineItem,
  onUpdateLineItem,
  onRemoveLineItem,
  readOnly,
}: {
  section: ProposalSection | undefined;
  onUpdate: (updates: Partial<ProposalSection>) => void;
  onTitleChange: (title: string) => void;
  onAddLineItem: () => void;
  onUpdateLineItem: (idx: number, updates: Partial<ProposalLineItem>) => void;
  onRemoveLineItem: (idx: number) => void;
  readOnly?: boolean;
}) {
  if (!section) return null;

  if (section.type === 'cover') {
    const cd = section.coverData || { projectTitle: '', clientName: '', clientEmail: '', companyName: '', date: '' };
    const updateCover = (field: string, value: string) => {
      onUpdate({ coverData: { ...cd, [field]: value } });
      if (field === 'projectTitle') onTitleChange(value);
    };

    const dateValue = cd.date ? new Date(cd.date) : undefined;

    return (
      <div className="space-y-4">
        {[
          { label: 'Project Title', field: 'projectTitle', placeholder: 'e.g. Website Redesign' },
          { label: 'Client Name', field: 'clientName', placeholder: 'e.g. Acme Corp' },
          { label: 'Client Email', field: 'clientEmail', placeholder: 'client@example.com' },
          { label: 'Company Name', field: 'companyName', placeholder: 'e.g. Acme Freelancing' },
        ].map(f => (
          <div key={f.field} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{f.label}</label>
            <input
              value={(cd as Record<string, string>)[f.field] || ''}
              onChange={e => updateCover(f.field, e.target.value)}
              placeholder={f.placeholder}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              disabled={readOnly}
            />
          </div>
        ))}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</label>
          {readOnly ? (
            <div className="h-10 px-3 flex items-center rounded-md border border-input bg-background text-sm text-foreground opacity-60">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? format(dateValue, "MMMM d, yyyy") : 'No date set'}
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !dateValue && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateValue ? format(dateValue, "MMMM d, yyyy") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={(d) => { if (d) updateCover('date', d.toISOString().split('T')[0]); }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    );
  }

  if (section.type === 'investment') {
    const items = section.lineItems || [];
    const total = items.reduce((sum, li) => sum + li.total, 0);
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Description</span><span>Qty</span><span>Unit Price</span><span>Total</span><span />
        </div>
        {items.map((li, i) => (
          <div key={li.id} className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-2 items-center">
            <input value={li.description} onChange={e => onUpdateLineItem(i, { description: e.target.value })} placeholder="Line item" className="h-9 px-2 rounded-md border border-input bg-background text-sm disabled:opacity-60" disabled={readOnly} />
            <input type="number" value={li.quantity} onChange={e => onUpdateLineItem(i, { quantity: Number(e.target.value) })} className="h-9 px-2 rounded-md border border-input bg-background text-sm disabled:opacity-60" min={1} disabled={readOnly} />
            <input type="number" value={li.unitPrice} onChange={e => onUpdateLineItem(i, { unitPrice: Number(e.target.value) })} className="h-9 px-2 rounded-md border border-input bg-background text-sm disabled:opacity-60" min={0} step={0.01} disabled={readOnly} />
            <span className="text-sm font-medium text-foreground">${li.total.toFixed(2)}</span>
            {!readOnly && (
              <button onClick={() => onRemoveLineItem(i)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
            )}
          </div>
        ))}
        {!readOnly && (
          <button onClick={onAddLineItem} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
            <Plus size={14} /> Add line item
          </button>
        )}
        <div className="pt-4 border-t border-border flex justify-between">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <span className="text-lg font-semibold text-foreground">${total.toFixed(2)}</span>
        </div>
      </div>
    );
  }

  return (
    <textarea
      value={section.content}
      onChange={e => onUpdate({ content: e.target.value })}
      placeholder={`Write your ${section.title.toLowerCase()} here...`}
      className="w-full h-64 px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-60"
      disabled={readOnly}
    />
  );
}
