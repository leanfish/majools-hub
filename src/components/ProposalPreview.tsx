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

  // Calculate total pages (sections that will actually render)
  const renderableSections = sections.filter(s => {
    if (s.type === 'table-of-contents') return true;
    if (s.type === 'cover-letter') return true;
    if (s.type === 'cover') return true;
    if (s.type === 'back-page') return true;
    if (s.type === 'testimonials') return (s.testimonials || []).some(t => t.quote);
    if (s.type === 'timeline') return (s.timelineRows || []).length > 0;
    if (s.type === 'investment') return (s.lineItems || []).length > 0;
    return !!s.content;
  });
  const totalPages = renderableSections.length;
  const footerLeft = `${displayTitle}${displayClient ? ` — ${displayClient}` : ''} · v${version || 1} · ${statusText}`;

  const renderFooter = (pageIdx: number) => (
    <div className="border-t border-gray-200 px-10 py-2 flex items-center justify-between text-[10px] text-gray-400">
      <span>{footerLeft}</span>
      <span>Page {pageIdx + 1} of {totalPages}</span>
    </div>
  );

  const renderSectionCard = (section: ProposalSection, content: React.ReactNode, pageIdx: number, hideFooter = false) => (
    <div key={section.id} data-pdf-page className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col" style={{ aspectRatio: '8.5 / 11' }}>
      <div className="flex-1 overflow-hidden">{content}</div>
      {!hideFooter && renderFooter(pageIdx)}
    </div>
  );

  const renderHtml = (html: string, style?: React.CSSProperties) => (
    <div
      className="proposal-prose text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-base prose-headings:font-semibold"
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
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

  const renderTimeline = (section: ProposalSection) => {
    const rows = section.timelineRows || [];
    if (rows.length === 0) return null;
    return (
      <table className="w-full text-sm" style={{ color: bc.text }}>
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider" style={{ color: bc.accent }}>Phase</th>
            <th className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wider" style={{ color: bc.accent }}>Activity</th>
            <th className="text-left py-2 font-semibold text-xs uppercase tracking-wider" style={{ color: bc.accent }}>Duration</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="border-b border-gray-100 last:border-0">
              <td className="py-2.5 pr-4 font-medium">{row.phase}</td>
              <td className="py-2.5 pr-4">{row.activity}</td>
              <td className="py-2.5">{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderTestimonials = (section: ProposalSection) => {
    const items = (section.testimonials || []).filter(t => t.quote);
    if (items.length === 0) return null;
    return (
      <div className="space-y-4">
        {items.map(t => (
          <div key={t.id} className="pl-4" style={{ borderLeft: `3px solid ${bc.accent}` }}>
            <p className="text-sm italic leading-relaxed" style={{ color: bc.text }}>"{t.quote}"</p>
            <p className="text-xs mt-2 font-semibold" style={{ color: bc.text }}>
              {t.clientName}{t.clientCompany ? `, ${t.clientCompany}` : ''}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderToc = (pageIdx: number) => {
    const tocSections = sections.filter(s => s.type !== 'cover-letter' && s.type !== 'table-of-contents');
    return (
      <div className="space-y-2">
        {tocSections.map((s, i) => (
          <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
            <span className="text-sm" style={{ color: bc.text }}>{s.title}</span>
            <span className="text-xs" style={{ color: bc.text, opacity: 0.4 }}>{i + 1}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCoverLetterContent = (section: ProposalSection) => {
    const cl = section.coverLetterData;
    return (
      <>
        {cl?.toName && (
          <div className="mb-4 text-sm" style={{ color: bc.text }}>
            <p className="font-medium">{cl.toName}</p>
            {cl.toTitle && <p className="opacity-60">{cl.toTitle}</p>}
          </div>
        )}
        {section.content && renderHtml(section.content, { color: bc.text })}
      </>
    );
  };

  const renderBackPage = (section: ProposalSection) => (
    <div className="flex flex-col items-center justify-center h-full text-center px-10">
      <div className="mb-6">
        <p className="text-lg font-bold" style={{ color: bc.text }}>{displayCompany}</p>
        <div className="mt-2 space-y-0.5 text-sm" style={{ color: bc.text, opacity: 0.6 }}>
          {settings.companyPhone && <p>{settings.companyPhone}</p>}
          {settings.profileEmail && <p>{settings.profileEmail}</p>}
          {settings.companyWebsite && <p>{settings.companyWebsite}</p>}
        </div>
      </div>
      {section.content && renderHtml(section.content, { color: bc.text })}
    </div>
  );

  // Helper to render content for a section based on type
  const renderSectionContent = (s: ProposalSection) => {
    if (s.type === 'investment') return renderInvestment(s);
    if (s.type === 'timeline') return renderTimeline(s);
    if (s.type === 'testimonials') return renderTestimonials(s);
    if (s.content) return renderHtml(s.content, { color: bc.text, opacity: 0.75 });
    return null;
  };

  let pageIndex = 0;

  // Build pages array
  const pages: React.ReactNode[] = [];

  const buildPages = (
    renderCover: (coverSection: ProposalSection) => React.ReactNode,
    renderContentSection: (s: ProposalSection, idx: number) => React.ReactNode,
  ) => {
    sections.forEach(s => {
      if (s.type === 'cover-letter') {
        pages.push(renderSectionCard(s, (
          <div className="px-10 py-8">{renderCoverLetter(s)}</div>
        ), pageIndex++));
      } else if (s.type === 'table-of-contents') {
        pages.push(renderContentSection(s, pageIndex++));
      } else if (s.type === 'cover') {
        pages.push(renderCover(s));
      } else if (s.type === 'back-page') {
        pages.push(renderSectionCard(s, renderBackPage(s), pageIndex++));
      } else {
        // Skip empty content sections
        if (s.type === 'testimonials' && !(s.testimonials || []).some(t => t.quote)) return;
        if (s.type === 'timeline' && !(s.timelineRows || []).length) return;
        if (s.type === 'investment' && !(s.lineItems || []).length) return;
        if (!['investment', 'timeline', 'testimonials'].includes(s.type) && !s.content) return;
        pages.push(renderContentSection(s, pageIndex++));
      }
    });
  };

  // ─── CLASSIC ───
  if (template === 'classic') {
    buildPages(
      (s) => renderSectionCard(s, (
        <div className="px-10 py-10 flex flex-col justify-center h-full">
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: bc.text }}>{cover?.projectTitle || 'Untitled Proposal'}</h1>
          <p className="mt-2" style={{ color: bc.text, opacity: 0.6 }}>Prepared for <span style={{ color: bc.text, opacity: 1 }} className="font-medium">{cover?.clientName}</span></p>
          <p className="text-sm mt-1" style={{ color: bc.text, opacity: 0.4 }}>By {displayCompany} · {dateDisplay}</p>
        </div>
      ), pageIndex++, true),
      (s, idx) => renderSectionCard(s, (
        <div className="px-10 py-8">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: bc.text, opacity: 0.4 }}>{s.title}</h2>
          <div className="h-px mb-4" style={{ backgroundColor: bc.primary, opacity: 0.2 }} />
          {s.type === 'table-of-contents' ? renderToc(idx) : renderSectionContent(s)}
        </div>
      ), idx),
    );
  }

  // ─── MODERN ───
  else if (template === 'modern') {
    buildPages(
      (s) => renderSectionCard(s, (
        <div className="px-10 py-12 flex flex-col justify-center h-full" style={{ borderLeft: `6px solid ${bc.primary}` }}>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: bc.text }}>{cover?.projectTitle || 'Untitled Proposal'}</h1>
          <p className="mt-2 text-base" style={{ color: bc.text, opacity: 0.6 }}>Prepared for <span className="font-semibold" style={{ color: bc.text }}>{cover?.clientName}</span></p>
          <p className="text-sm mt-1" style={{ color: bc.text, opacity: 0.4 }}>By {displayCompany} · {dateDisplay}</p>
        </div>
      ), pageIndex++, true),
      (s, idx) => renderSectionCard(s, (
        <div className="px-10 py-8">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color: bc.primary }}>{s.title}</h2>
          <div className="border-t-2 mb-4" style={{ borderColor: bc.primary }} />
          {s.type === 'table-of-contents' ? renderToc(idx) : renderSectionContent(s)}
        </div>
      ), idx),
    );
  }

  // ─── BRANDED ───
  else if (template === 'branded') {
    buildPages(
      (s) => renderSectionCard(s, (
        <div className="px-10 py-10 flex flex-col justify-center relative overflow-hidden h-full" style={{ backgroundColor: bc.background }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/3" style={{ backgroundColor: bc.accent, opacity: 0.2 }} />
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: bc.accent }}>{displayCompany}</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">{cover?.projectTitle || 'Untitled Proposal'}</h1>
          <div className="mt-4 flex gap-6 text-sm text-gray-400">
            <span>Client: <span className="text-white font-medium">{cover?.clientName}</span></span>
            <span>By: <span className="text-white font-medium">{displayCompany}</span></span>
            <span>{dateDisplay}</span>
          </div>
        </div>
      ), pageIndex++, true),
      (s, idx) => renderSectionCard(s, (
        <div className="bg-white px-10 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: bc.accent }} />
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: bc.text }}>{s.title}</h2>
          </div>
          {s.type === 'table-of-contents' ? renderToc(idx) : renderSectionContent(s)}
        </div>
      ), idx),
    );
  }

  // ─── EXECUTIVE ───
  else if (template === 'executive') {
    buildPages(
      (s) => renderSectionCard(s, (
        <div className="flex flex-col h-full">
          <div className="flex-[3] px-10 flex flex-col justify-end pb-8" style={{ backgroundColor: bc.background }}>
            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">{cover?.projectTitle || 'Untitled Proposal'}</h1>
          </div>
          <div className="flex-[2] bg-white px-10 flex flex-col justify-center">
            <p className="text-base" style={{ color: bc.text }}>Prepared for <span className="font-semibold">{cover?.clientName}</span></p>
            <p className="text-sm mt-1" style={{ color: bc.text, opacity: 0.4 }}>By {displayCompany} · {dateDisplay}</p>
          </div>
        </div>
      ), pageIndex++, true),
      (s, idx) => renderSectionCard(s, (
        <div className="flex h-full">
          <div className="w-1 flex-shrink-0" style={{ backgroundColor: bc.background }} />
          <div className="flex-1 px-10 py-8">
            <h2 className="text-base font-semibold mb-4" style={{ color: bc.accent }}>{s.title}</h2>
            {s.type === 'table-of-contents' ? renderToc(idx) : renderSectionContent(s)}
          </div>
        </div>
      ), idx),
    );
  }

  // ─── MINIMAL ───
  else if (template === 'minimal') {
    buildPages(
      (s) => renderSectionCard(s, (
        <div className="px-10 py-10 flex flex-col justify-center bg-white h-full">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: bc.text }}>{cover?.projectTitle || 'Untitled Proposal'}</h1>
          <p className="text-sm mt-4 text-gray-400">{displayCompany}</p>
          <p className="text-sm text-gray-400">{cover?.clientName} · {dateDisplay}</p>
        </div>
      ), pageIndex++, true),
      (s, idx) => renderSectionCard(s, (
        <div className="px-10 py-8 bg-white">
          <h2 className="text-sm font-bold tracking-[0.15em] uppercase mb-6" style={{ color: bc.text }}>{s.title}</h2>
          {s.type === 'table-of-contents' ? renderToc(idx) : renderSectionContent(s)}
        </div>
      ), idx),
    );
  }

  // ─── BOLD ───
  else if (template === 'bold') {
    buildPages(
      (s) => renderSectionCard(s, (
        <div className="px-10 py-12 flex flex-col justify-center h-full" style={{ backgroundColor: bc.primary }}>
          <h1 className="text-4xl font-black text-white tracking-tight">{cover?.projectTitle || 'Untitled Proposal'}</h1>
          <p className="text-white/70 mt-3 text-lg">{cover?.clientName}</p>
          <p className="text-white/50 text-sm mt-1">By {displayCompany} · {dateDisplay}</p>
        </div>
      ), pageIndex++, true),
      (s, idx) => renderSectionCard(s, (
        <div className="flex flex-col">
          <div className="px-10 py-3" style={{ backgroundColor: bc.background }}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">{s.title}</h2>
          </div>
          <div className="px-10 py-6 bg-white flex-1">
            {s.type === 'table-of-contents' ? renderToc(idx) : (
              s.type === 'investment' ? renderInvestment(s, bc.accent) : renderSectionContent(s)
            )}
          </div>
        </div>
      ), idx),
    );
  }

  if (pages.length === 0) return <div ref={ref} />;

  return (
    <div ref={ref} className="space-y-10 p-2">
      {pages}
    </div>
  );
});

export default ProposalPreview;
