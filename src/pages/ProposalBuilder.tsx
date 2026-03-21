import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Send, CalendarIcon, Eye, HelpCircle, Clock, Download, Palette } from 'lucide-react';
import { format } from 'date-fns';
import BreadcrumbBar from '@/components/BreadcrumbBar';
import ProposalSendFlow from '@/components/ProposalSendFlow';
import ProposalPreview from '@/components/ProposalPreview';
import SectionsPanel from '@/components/SectionsPanel';
import SectionHelpTips from '@/components/SectionHelpTips';
import VersionHistoryDrawer from '@/components/VersionHistoryDrawer';
import RichTextEditor from '@/components/RichTextEditor';
import { getProposal, createProposal, updateProposal } from '@/lib/api';
import type { ProposalSection, ProposalLineItem, SectionType, TimelineRow, Testimonial } from '@/lib/mock-data';
import { createDefaultSections, BOILERPLATE_CONTENT, DEFAULT_TIMELINE_ROWS } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth';
import { getSettings } from '@/lib/settings-store';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getDefaultTemplate, templates, type TemplateId } from '@/lib/templates';
import TemplateSelectorModal from '@/components/TemplateSelectorModal';

export default function ProposalBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const [sections, setSections] = useState<ProposalSection[]>(() => {
    const settings = getSettings();
    return createDefaultSections(settings.defaultSections);
  });
  const [activeSection, setActiveSection] = useState(0);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSendFlow, setShowSendFlow] = useState(false);
  const [previewOnly, setPreviewOnly] = useState(false);
  const [proposalId, setProposalId] = useState(id || '');
  const [template, setTemplate] = useState<TemplateId>(getDefaultTemplate());
  const [showHelp, setShowHelp] = useState(false);
  const [proposalVersion, setProposalVersion] = useState(1);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

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
        if (p.status !== 'draft') {
          navigate(`/proposals/${p.id}/view`, { replace: true });
          return;
        }
        setTitle(p.title);
        setSections(p.sections);
        setProposalId(p.id);
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
      coverLetterData: type === 'cover-letter' ? { toName: '', toTitle: '', fromCompany: '' } : undefined,
      timelineRows: type === 'timeline' ? [...DEFAULT_TIMELINE_ROWS.map(r => ({ ...r, id: `tr-${Date.now()}-${r.id}` }))] : undefined,
      testimonials: type === 'testimonials' ? [{ id: `test-${Date.now()}`, quote: '', clientName: '', clientCompany: '' }] : undefined,
    };

    // Fixed position sections
    if (type === 'cover-letter') {
      setSections(prev => [newSection, ...prev]);
      setActiveSection(0);
    } else if (type === 'table-of-contents') {
      // After cover-letter if it exists, otherwise at start
      setSections(prev => {
        const clIdx = prev.findIndex(s => s.type === 'cover-letter');
        const insertAt = clIdx >= 0 ? clIdx + 1 : 0;
        const next = [...prev];
        next.splice(insertAt, 0, newSection);
        return next;
      });
      setActiveSection(0);
    } else if (type === 'back-page') {
      setSections(prev => [...prev, newSection]);
      setActiveSection(sections.length);
    } else {
      // Insert before back-page if it exists, otherwise at end
      setSections(prev => {
        const bpIdx = prev.findIndex(s => s.type === 'back-page');
        if (bpIdx >= 0) {
          const next = [...prev];
          next.splice(bpIdx, 0, newSection);
          return next;
        }
        return [...prev, newSection];
      });
      setActiveSection(sections.length);
    }
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

  const handleDownloadPdf = useCallback(async () => {
    setPdfExporting(true);
    toast.info('Generating PDF...');
    try {
      await new Promise(r => setTimeout(r, 100));
      const container = pdfRef.current;
      if (!container) throw new Error('No preview container');

      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      const pageCards = container.querySelectorAll<HTMLElement>('[data-pdf-page]');
      if (pageCards.length === 0) throw new Error('No pages');

      const PDF_WIDTH = 595.28;
      const PDF_HEIGHT = 841.89;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      for (let i = 0; i < pageCards.length; i++) {
        const canvas = await html2canvas(pageCards[i], { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgHeight = (canvas.height / canvas.width) * PDF_WIDTH;
        if (i > 0) pdf.addPage();
        if (imgHeight <= PDF_HEIGHT) {
          pdf.addImage(imgData, 'JPEG', 0, 0, PDF_WIDTH, imgHeight);
        } else {
          pdf.addImage(imgData, 'JPEG', 0, 0, (canvas.width / canvas.height) * PDF_HEIGHT, PDF_HEIGHT);
        }
      }

      const cover = sections.find(s => s.type === 'cover')?.coverData;
      const clientName = cover?.clientName || 'Client';
      const projectTitle = cover?.projectTitle || title || 'Proposal';
      pdf.save(`${clientName} — ${projectTitle} — v${proposalVersion}.pdf`);
      toast.success('PDF downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    } finally {
      setPdfExporting(false);
    }
  }, [sections, title, proposalVersion]);

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
            </div>
          </div>

          <div className={`grid gap-6 ${showLivePreview ? 'grid-cols-[280px_1fr_1fr]' : 'grid-cols-[280px_1fr]'}`}>
            <SectionsPanel
              sections={sections}
              activeSection={activeSection}
              onSetActive={setActiveSection}
              onReorder={handleReorder}
              onDelete={handleDeleteSection}
              onAdd={handleAddSection}
            />

            <div className="bg-card rounded-lg shadow-widget p-8">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-lg font-semibold text-foreground">{current?.title}</h2>
                {current && current.type !== 'custom' && current.type !== 'table-of-contents' && (
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
                allSections={sections}
              />
            </div>

            {showLivePreview && (
              <div className="bg-muted/30 rounded-lg shadow-widget p-4 overflow-auto max-h-[calc(100vh-200px)] sticky top-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Live Preview</p>
                <div className="transform origin-top scale-[0.45] w-[222%]">
                  <ProposalPreview
                    sections={sections}
                    template={template}
                    companyName={companyName}
                    version={proposalVersion}
                    proposalTitle={title}
                    clientName={sections.find(s => s.type === 'cover')?.coverData?.clientName}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="sticky bottom-0 z-10 border-t border-border bg-card px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Draft'}
          </button>
          {proposalId && (
            <button onClick={() => setShowVersionHistory(true)} className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
              <Clock size={16} /> Version History
            </button>
          )}
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Palette size={14} />
            Template: {currentTemplate?.name}
          </button>
          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {showLivePreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {showLivePreview ? 'Hide Preview' : 'Live Preview'}
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownloadPdf} disabled={pdfExporting} className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50">
            <Download size={16} /> {pdfExporting ? 'Exporting...' : 'Download PDF'}
          </button>
          <button onClick={handlePreview} className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
            <Eye size={16} /> Preview
          </button>
          <button onClick={handleSendClick} className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Send size={16} /> Send Proposal
          </button>
        </div>
      </div>

      {/* Hidden preview for PDF export */}
      {pdfExporting && (
        <div className="fixed left-[-9999px] top-0" style={{ width: 800 }}>
          <ProposalPreview
            ref={pdfRef}
            sections={sections}
            template={template}
            companyName={companyName}
            version={proposalVersion}
            proposalTitle={title}
            clientName={sections.find(s => s.type === 'cover')?.coverData?.clientName}
          />
        </div>
      )}

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

      {showHelp && current && current.type !== 'custom' && current.type !== 'table-of-contents' && (
        <SectionHelpTips sectionType={current.type} onClose={() => setShowHelp(false)} />
      )}

      <VersionHistoryDrawer
        proposalId={proposalId}
        open={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
      />

      {showTemplateModal && (
        <TemplateSelectorModal
          current={template}
          onSelect={setTemplate}
          onClose={() => setShowTemplateModal(false)}
        />
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
  allSections,
}: {
  section: ProposalSection | undefined;
  onUpdate: (updates: Partial<ProposalSection>) => void;
  onTitleChange: (title: string) => void;
  onAddLineItem: () => void;
  onUpdateLineItem: (idx: number, updates: Partial<ProposalLineItem>) => void;
  onRemoveLineItem: (idx: number) => void;
  allSections: ProposalSection[];
}) {
  if (!section) return null;

  // ── Table of Contents (auto-generated, read-only) ──
  if (section.type === 'table-of-contents') {
    const tocSections = allSections.filter(s => s.type !== 'cover-letter' && s.type !== 'table-of-contents');
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">This section is auto-generated from your proposal sections. It cannot be manually edited.</p>
        <div className="rounded-md border border-input bg-muted/30 p-4 space-y-2">
          {tocSections.map((s, i) => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <span className="text-foreground">{s.title}</span>
              <span className="text-muted-foreground text-xs">Page {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Cover Letter ──
  if (section.type === 'cover-letter') {
    const cl = section.coverLetterData || { toName: '', toTitle: '', fromCompany: '' };
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">To (Client Name)</label>
            <input
              value={cl.toName}
              onChange={e => onUpdate({ coverLetterData: { ...cl, toName: e.target.value } })}
              placeholder="Client name"
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</label>
            <input
              value={cl.toTitle}
              onChange={e => onUpdate({ coverLetterData: { ...cl, toTitle: e.target.value } })}
              placeholder="e.g. CEO"
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">From (Company)</label>
          <input
            value={cl.fromCompany}
            onChange={e => onUpdate({ coverLetterData: { ...cl, fromCompany: e.target.value } })}
            placeholder="Your company name"
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Body</label>
          <RichTextEditor content={section.content} onChange={html => onUpdate({ content: html })} />
        </div>
      </div>
    );
  }

  // ── Cover ──
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
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        ))}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10", !dateValue && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateValue ? format(dateValue, "MMMM d, yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateValue} onSelect={(d) => { if (d) updateCover('date', d.toISOString().split('T')[0]); }} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  }

  // ── Investment ──
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
            <input value={li.description} onChange={e => onUpdateLineItem(i, { description: e.target.value })} placeholder="Line item" className="h-9 px-2 rounded-md border border-input bg-background text-sm" />
            <input type="number" value={li.quantity} onChange={e => onUpdateLineItem(i, { quantity: Number(e.target.value) })} className="h-9 px-2 rounded-md border border-input bg-background text-sm" min={1} />
            <input type="number" value={li.unitPrice} onChange={e => onUpdateLineItem(i, { unitPrice: Number(e.target.value) })} className="h-9 px-2 rounded-md border border-input bg-background text-sm" min={0} step={0.01} />
            <span className="text-sm font-medium text-foreground">${li.total.toFixed(2)}</span>
            <button onClick={() => onRemoveLineItem(i)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
          </div>
        ))}
        <button onClick={onAddLineItem} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Plus size={14} /> Add line item
        </button>
        <div className="pt-4 border-t border-border flex justify-between">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <span className="text-lg font-semibold text-foreground">${total.toFixed(2)}</span>
        </div>
      </div>
    );
  }

  // ── Timeline (table) ──
  if (section.type === 'timeline') {
    const rows = section.timelineRows || [];
    const addRow = () => {
      onUpdate({
        timelineRows: [...rows, { id: `tr-${Date.now()}`, phase: '', activity: '', duration: '' }],
      });
    };
    const updateRow = (idx: number, updates: Partial<TimelineRow>) => {
      const newRows = [...rows];
      newRows[idx] = { ...newRows[idx], ...updates };
      onUpdate({ timelineRows: newRows });
    };
    const removeRow = (idx: number) => {
      onUpdate({ timelineRows: rows.filter((_, i) => i !== idx) });
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-[120px_1fr_120px_40px] gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Phase</span><span>Activity</span><span>Duration</span><span />
        </div>
        {rows.map((row, i) => (
          <div key={row.id} className="grid grid-cols-[120px_1fr_120px_40px] gap-2 items-center">
            <input value={row.phase} onChange={e => updateRow(i, { phase: e.target.value })} placeholder="Phase 1" className="h-9 px-2 rounded-md border border-input bg-background text-sm" />
            <input value={row.activity} onChange={e => updateRow(i, { activity: e.target.value })} placeholder="Activity description" className="h-9 px-2 rounded-md border border-input bg-background text-sm" />
            <input value={row.duration} onChange={e => updateRow(i, { duration: e.target.value })} placeholder="1 week" className="h-9 px-2 rounded-md border border-input bg-background text-sm" />
            <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
          </div>
        ))}
        <button onClick={addRow} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Plus size={14} /> Add row
        </button>
      </div>
    );
  }

  // ── Testimonials ──
  if (section.type === 'testimonials') {
    const items = section.testimonials || [];
    const addTestimonial = () => {
      if (items.length >= 5) { toast.error('Maximum 5 testimonials'); return; }
      onUpdate({
        testimonials: [...items, { id: `test-${Date.now()}`, quote: '', clientName: '', clientCompany: '' }],
      });
    };
    const updateTestimonial = (idx: number, updates: Partial<Testimonial>) => {
      const next = [...items];
      next[idx] = { ...next[idx], ...updates };
      onUpdate({ testimonials: next });
    };
    const removeTestimonial = (idx: number) => {
      onUpdate({ testimonials: items.filter((_, i) => i !== idx) });
    };

    return (
      <div className="space-y-4">
        {items.map((t, i) => (
          <div key={t.id} className="p-4 rounded-md border border-input bg-muted/20 space-y-3 relative">
            <button onClick={() => removeTestimonial(i)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quote</label>
              <textarea
                value={t.quote}
                onChange={e => updateTestimonial(i, { quote: e.target.value })}
                placeholder="What the client said..."
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client Name</label>
                <input value={t.clientName} onChange={e => updateTestimonial(i, { clientName: e.target.value })} placeholder="Jane Smith" className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client Company</label>
                <input value={t.clientCompany} onChange={e => updateTestimonial(i, { clientCompany: e.target.value })} placeholder="Acme Corp" className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" />
              </div>
            </div>
          </div>
        ))}
        {items.length < 5 && (
          <button onClick={addTestimonial} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
            <Plus size={14} /> Add Testimonial
          </button>
        )}
      </div>
    );
  }

  // ── Back Page ──
  if (section.type === 'back-page') {
    const settings = getSettings();
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-input bg-muted/30 p-4 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Contact details (from Settings)</p>
          <div className="text-sm text-foreground space-y-1">
            {settings.companyName && <p className="font-medium">{settings.companyName}</p>}
            {settings.companyPhone && <p>{settings.companyPhone}</p>}
            {settings.profileEmail && <p>{settings.profileEmail}</p>}
            {settings.companyWebsite && <p>{settings.companyWebsite}</p>}
          </div>
          {!settings.companyName && !settings.companyPhone && (
            <p className="text-xs text-muted-foreground">Add your contact details in Settings → Company</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Closing Statement</label>
          <RichTextEditor content={section.content} onChange={html => onUpdate({ content: html })} />
        </div>
      </div>
    );
  }

  // ── All other rich text sections ──
  return (
    <RichTextEditor
      content={section.content}
      onChange={html => onUpdate({ content: html })}
      placeholder={`Write your ${section.title.toLowerCase()} here...`}
    />
  );
}
