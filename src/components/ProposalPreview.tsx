import { forwardRef } from 'react';
import { format } from 'date-fns';
import type { ProposalSection } from '@/lib/mock-data';
import type { TemplateId } from '@/lib/templates';
import { getSettings, DEFAULT_BRAND_COLORS, type BrandColors } from '@/lib/settings-store';

interface Props {
  sections: ProposalSection[];
  template: TemplateId;
  companyName?: string;
  version?: number;
  sentAt?: string;
  proposalTitle?: string;
  clientName?: string;
  acceptedAt?: string;
}

const ProposalPreview = forwardRef<HTMLDivElement, Props>(function ProposalPreview({ sections, template, companyName, version, sentAt, proposalTitle, clientName, acceptedAt }, ref) {
  const cover = sections.find(s => s.type === 'cover')?.coverData;
  const dateDisplay = cover?.date ? format(new Date(cover.date), 'MMMM d, yyyy') : '';
  const displayCompany = companyName || cover?.companyName || 'Your Company';
  const totalPages = sections.length;
  const displayTitle = proposalTitle || cover?.projectTitle || 'Untitled Proposal';
  const displayClient = clientName || cover?.clientName || '';

  const settings = getSettings();
  const bc: BrandColors = {
    primary: settings.brandColors?.primary || DEFAULT_BRAND_COLORS.primary,
    background: settings.brandColors?.background || DEFAULT_BRAND_COLORS.background,
    text: settings.brandColors?.text || DEFAULT_BRAND_COLORS.text,
    accent: settings.brandColors?.accent || DEFAULT_BRAND_COLORS.accent,
  };

  const statusText = acceptedAt
    ? `Accepted ${format(new Date(acceptedAt), 'MMM d, yyyy')}`
    : sentAt
      ? `Sent ${format(new Date(sentAt), 'MMM d, yyyy')}`
      : 'Draft';
  const footerLeft = `${displayTitle}${displayClient ? ` — ${displayClient}` : ''} · v${version || 1} · ${statusText}`;

  const renderFooter = (pageIdx: number) => (
    <div className="border-t border-gray-200 px-10 py-2 flex items-center justify-between text-[10px] text-gray-400">
      <span>{footerLeft}</span>
      <span>Page {pageIdx + 1} of {totalPages}</span>
    </div>
  );

  const renderSectionCard = (section: ProposalSection, content: React.ReactNode, pageIdx: number, hideFooter = false) => (
    <div key={section.id} data-pdf-page className="bg-white rounded-lg shadow-md min-h-[500px] overflow-hidden flex flex-col">
      <div className="flex-1">{content}</div>
      {!hideFooter && renderFooter(pageIdx)}
    </div>
  );

  const renderInvestment = (investment: ProposalSection, totalColor?: string) => {
    const items = investment.lineItems || [];
    const total = items.reduce((sum, li) => sum + li.total, 0);
    return items.length > 0 ? (
      <div>
        {items.map(li => (
          <div key={li.id} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
            <div>
              <span className="text-sm" style={{ color: bc.text }}>{li.description || 'Line item'}</span>
              <span className="text-xs text-gray-400 ml-2">× {li.quantity}</span>
            </div>
            <span className="text-sm font-semibold" style={totalColor ? { color: totalColor } : {}}>${li.total.toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-4 mt-2 border-t border-gray-200">
          <span className="font-bold" style={{ color: bc.text }}>Total</span>
          <span className="text-xl font-bold" style={totalColor ? { color: totalColor } : { color: bc.text }}>${total.toFixed(2)}</span>
        </div>
      </div>
    ) : null;
  };

  const nonCoverSections = sections.filter(s => s.type !== 'cover');
  let pageIndex = 0;

  // ─── CLASSIC ───
  if (template === 'classic') {
    pageIndex = 0;
    return (
      <div ref={ref} className="space-y-10 p-2">
        {cover && renderSectionCard(sections.find(s => s.type === 'cover')!, (
          <div className="px-10 py-10 min-h-[500px] flex flex-col justify-center">
            <h1 className="text-3xl font-semibold tracking-tight" style={{ color: bc.text }}>{cover.projectTitle || 'Untitled Proposal'}</h1>
            <p className="mt-2" style={{ color: bc.text, opacity: 0.6 }}>Prepared for <span style={{ color: bc.text, opacity: 1 }} className="font-medium">{cover.clientName}</span></p>
            <p className="text-sm mt-1" style={{ color: bc.text, opacity: 0.4 }}>By {displayCompany} · {dateDisplay}</p>
          </div>
        ), pageIndex++, true)}
        {nonCoverSections.map(s => {
          const idx = pageIndex++;
          return renderSectionCard(s, (
            <div className="px-10 py-8">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: bc.text, opacity: 0.4 }}>{s.title}</h2>
              <div className="h-px mb-4" style={{ backgroundColor: bc.primary, opacity: 0.2 }} />
              {s.type === 'investment' ? renderInvestment(s) : (
                s.content && <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: bc.text, opacity: 0.75 }}>{s.content}</div>
              )}
            </div>
          ), idx);
        })}
      </div>
    );
  }

  // ─── MODERN ───
  if (template === 'modern') {
    pageIndex = 0;
    return (
      <div ref={ref} className="space-y-10 p-2">
        {cover && renderSectionCard(sections.find(s => s.type === 'cover')!, (
          <div className="px-10 py-12 min-h-[500px] flex flex-col justify-center" style={{ borderLeft: `6px solid ${bc.primary}` }}>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: bc.text }}>{cover.projectTitle || 'Untitled Proposal'}</h1>
            <p className="mt-2 text-base" style={{ color: bc.text, opacity: 0.6 }}>Prepared for <span className="font-semibold" style={{ color: bc.text }}>{cover.clientName}</span></p>
            <p className="text-sm mt-1" style={{ color: bc.text, opacity: 0.4 }}>By {displayCompany} · {dateDisplay}</p>
          </div>
        ), pageIndex++, true)}
        {nonCoverSections.map(s => {
          const idx = pageIndex++;
          return renderSectionCard(s, (
            <div className="px-10 py-8">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color: bc.primary }}>{s.title}</h2>
              <div className="border-t-2 mb-4" style={{ borderColor: bc.primary }} />
              {s.type === 'investment' ? renderInvestment(s) : (
                s.content && <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: bc.text, opacity: 0.75 }}>{s.content}</div>
              )}
            </div>
          ), idx);
        })}
      </div>
    );
  }

  // ─── BRANDED ───
  if (template === 'branded') {
    pageIndex = 0;
    return (
      <div ref={ref} className="space-y-10 p-2">
        {cover && renderSectionCard(sections.find(s => s.type === 'cover')!, (
          <div className="px-10 py-10 min-h-[500px] flex flex-col justify-center relative overflow-hidden" style={{ backgroundColor: bc.background }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/3" style={{ backgroundColor: bc.accent, opacity: 0.2 }} />
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: bc.accent }}>{displayCompany}</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">{cover.projectTitle || 'Untitled Proposal'}</h1>
            <div className="mt-4 flex gap-6 text-sm text-gray-400">
              <span>Client: <span className="text-white font-medium">{cover.clientName}</span></span>
              <span>By: <span className="text-white font-medium">{displayCompany}</span></span>
              <span>{dateDisplay}</span>
            </div>
          </div>
        ), pageIndex++, true)}
        {nonCoverSections.map(s => {
          const idx = pageIndex++;
          return renderSectionCard(s, (
            <div className="bg-white px-10 py-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 rounded-full" style={{ backgroundColor: bc.accent }} />
                <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: bc.text }}>{s.title}</h2>
              </div>
              {s.type === 'investment' ? renderInvestment(s) : (
                s.content && <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: bc.text, opacity: 0.75 }}>{s.content}</div>
              )}
            </div>
          ), idx);
        })}
      </div>
    );
  }

  // ─── EXECUTIVE ───
  if (template === 'executive') {
    pageIndex = 0;
    return (
      <div ref={ref} className="space-y-10 p-2">
        {cover && renderSectionCard(sections.find(s => s.type === 'cover')!, (
          <div className="min-h-[500px] flex flex-col">
            <div className="flex-[3] px-10 flex flex-col justify-end pb-8" style={{ backgroundColor: bc.background }}>
              <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">{cover.projectTitle || 'Untitled Proposal'}</h1>
            </div>
            <div className="flex-[2] bg-white px-10 flex flex-col justify-center">
              <p className="text-base" style={{ color: bc.text }}>Prepared for <span className="font-semibold">{cover.clientName}</span></p>
              <p className="text-sm mt-1" style={{ color: bc.text, opacity: 0.4 }}>By {displayCompany} · {dateDisplay}</p>
            </div>
          </div>
        ), pageIndex++, true)}
        {nonCoverSections.map(s => {
          const idx = pageIndex++;
          return renderSectionCard(s, (
            <div className="flex min-h-[500px]">
              <div className="w-1 flex-shrink-0" style={{ backgroundColor: bc.background }} />
              <div className="flex-1 px-10 py-8">
                <h2 className="text-base font-semibold mb-4" style={{ color: bc.accent }}>{s.title}</h2>
                {s.type === 'investment' ? renderInvestment(s) : (
                  s.content && <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: bc.text, opacity: 0.75 }}>{s.content}</div>
                )}
              </div>
            </div>
          ), idx);
        })}
      </div>
    );
  }

  // ─── MINIMAL ───
  if (template === 'minimal') {
    pageIndex = 0;
    return (
      <div ref={ref} className="space-y-10 p-2">
        {cover && renderSectionCard(sections.find(s => s.type === 'cover')!, (
          <div className="px-10 py-10 min-h-[500px] flex flex-col justify-center bg-white">
            <h1 className="text-4xl font-bold tracking-tight" style={{ color: bc.text }}>{cover.projectTitle || 'Untitled Proposal'}</h1>
            <p className="text-sm mt-4 text-gray-400">{displayCompany}</p>
            <p className="text-sm text-gray-400">{cover.clientName} · {dateDisplay}</p>
          </div>
        ), pageIndex++, true)}
        {nonCoverSections.map(s => {
          const idx = pageIndex++;
          return renderSectionCard(s, (
            <div className="px-10 py-8 bg-white">
              <h2 className="text-sm font-bold tracking-[0.15em] uppercase mb-6" style={{ color: bc.text }}>{s.title}</h2>
              {s.type === 'investment' ? renderInvestment(s) : (
                s.content && <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: bc.text, opacity: 0.7 }}>{s.content}</div>
              )}
            </div>
          ), idx);
        })}
      </div>
    );
  }

  // ─── BOLD ───
  if (template === 'bold') {
    pageIndex = 0;
    return (
      <div ref={ref} className="space-y-10 p-2">
        {cover && renderSectionCard(sections.find(s => s.type === 'cover')!, (
          <div className="px-10 py-12 min-h-[500px] flex flex-col justify-center" style={{ backgroundColor: bc.primary }}>
            <h1 className="text-4xl font-black text-white tracking-tight">{cover.projectTitle || 'Untitled Proposal'}</h1>
            <p className="text-white/70 mt-3 text-lg">{cover.clientName}</p>
            <p className="text-white/50 text-sm mt-1">By {displayCompany} · {dateDisplay}</p>
          </div>
        ), pageIndex++, true)}
        {nonCoverSections.map(s => {
          const idx = pageIndex++;
          return renderSectionCard(s, (
            <div className="flex flex-col">
              <div className="px-10 py-3" style={{ backgroundColor: bc.background }}>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">{s.title}</h2>
              </div>
              <div className="px-10 py-6 bg-white flex-1">
                {s.type === 'investment' ? renderInvestment(s, bc.accent) : (
                  s.content && <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: bc.text }}>{s.content}</div>
                )}
              </div>
            </div>
          ), idx);
        })}
      </div>
    );
  }

  // Fallback — classic
  return <div ref={ref} />;
});

export default ProposalPreview;
