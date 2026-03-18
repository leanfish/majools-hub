import { forwardRef } from 'react';
import { format } from 'date-fns';
import type { ProposalSection } from '@/lib/mock-data';
import type { TemplateId } from '@/lib/templates';

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
  const dateDisplay = cover?.date
    ? format(new Date(cover.date), 'MMMM d, yyyy')
    : '';
  const displayCompany = companyName || cover?.companyName || 'Your Company';
  const totalPages = sections.length;
  const displayTitle = proposalTitle || cover?.projectTitle || 'Untitled Proposal';
  const displayClient = clientName || cover?.clientName || '';

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

  // Render each section as a distinct page card with footer
  const renderSectionCard = (section: ProposalSection, content: React.ReactNode, pageIdx: number, hideFooter = false) => (
    <div key={section.id} className="bg-white rounded-lg shadow-md min-h-[500px] overflow-hidden flex flex-col">
      <div className="flex-1">
        {content}
      </div>
      {!hideFooter && renderFooter(pageIdx)}
    </div>
  );

  const renderInvestment = (investment: ProposalSection) => {
    const items = investment.lineItems || [];
    const total = items.reduce((sum, li) => sum + li.total, 0);
    return items.length > 0 ? (
      <div>
        {items.map(li => (
          <div key={li.id} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
            <div>
              <span className="text-sm text-gray-900">{li.description || 'Line item'}</span>
              <span className="text-xs text-gray-400 ml-2">× {li.quantity}</span>
            </div>
            <span className="text-sm font-semibold">${li.total.toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-4 mt-2 border-t border-gray-200">
          <span className="font-bold">Total</span>
          <span className="text-xl font-bold">${total.toFixed(2)}</span>
        </div>
      </div>
    ) : null;
  };

  // Track page index across all sections
  let pageIndex = 0;

  if (template === 'modern') {
    pageIndex = 0;
    return (
      <div className="space-y-10 p-2">
        {cover && renderSectionCard(sections.find(s => s.type === 'cover')!, (
          <div className="bg-[#3DCEE9] px-10 py-12 min-h-[500px] flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">{cover.projectTitle || 'Untitled Proposal'}</h1>
            <p className="text-white/80 mt-2 text-base">Prepared for <span className="font-semibold text-white">{cover.clientName}</span></p>
            <p className="text-white/60 text-sm mt-1">By {displayCompany} · {dateDisplay}</p>
          </div>
        ), pageIndex++, true)}

        {sections.filter(s => s.type !== 'cover').map(s => {
          const idx = pageIndex++;
          if (s.type === 'investment') {
            return renderSectionCard(s, (
              <div className="px-10 py-8">
                <h2 className="text-lg font-bold text-[#3DCEE9] uppercase tracking-wider mb-4">{s.title}</h2>
                <div className="border-t-2 border-[#3DCEE9]">
                  {renderInvestment(s)}
                </div>
              </div>
            ), idx);
          }
          return renderSectionCard(s, (
            <div className="px-10 py-8">
              <h2 className="text-lg font-bold text-[#3DCEE9] uppercase tracking-wider mb-4">{s.title}</h2>
              {s.content && <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{s.content}</div>}
            </div>
          ), idx);
        })}
      </div>
    );
  }

  if (template === 'branded') {
    pageIndex = 0;
    return (
      <div className="space-y-10 p-2">
        {cover && renderSectionCard(sections.find(s => s.type === 'cover')!, (
          <div className="bg-gray-900 px-10 py-10 min-h-[500px] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#3DCEE9]/20 rounded-full -translate-y-1/2 translate-x-1/3" />
            <p className="text-[#3DCEE9] text-xs font-bold uppercase tracking-[0.2em] mb-4">{displayCompany}</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">{cover.projectTitle || 'Untitled Proposal'}</h1>
            <div className="mt-4 flex gap-6 text-sm text-gray-400">
              <span>Client: <span className="text-white font-medium">{cover.clientName}</span></span>
              <span>By: <span className="text-white font-medium">{displayCompany}</span></span>
              <span>{dateDisplay}</span>
            </div>
          </div>
        ), pageIndex++, true)}

        {sections.filter(s => s.type !== 'cover').map(s => {
          const idx = pageIndex++;
          if (s.type === 'investment') {
            return renderSectionCard(s, (
              <div className="bg-white px-10 py-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-[#3DCEE9] rounded-full" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">{s.title}</h2>
                </div>
                {renderInvestment(s)}
              </div>
            ), idx);
          }
          return renderSectionCard(s, (
            <div className="bg-white px-10 py-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-[#3DCEE9] rounded-full" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">{s.title}</h2>
              </div>
              {s.content && <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{s.content}</div>}
            </div>
          ), idx);
        })}
      </div>
    );
  }

  // Classic (default)
  pageIndex = 0;
  return (
    <div className="space-y-10 p-2">
      {cover && renderSectionCard(sections.find(s => s.type === 'cover')!, (
        <div className="px-10 py-10 min-h-[500px] flex flex-col justify-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{cover.projectTitle || 'Untitled Proposal'}</h1>
          <p className="text-gray-500 mt-2">Prepared for <span className="text-gray-900 font-medium">{cover.clientName}</span></p>
          <p className="text-sm text-gray-400 mt-1">By {displayCompany} · {dateDisplay}</p>
        </div>
      ), pageIndex++, true)}

      {sections.filter(s => s.type !== 'cover').map(s => {
        const idx = pageIndex++;
        if (s.type === 'investment') {
          return renderSectionCard(s, (
            <div className="px-10 py-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{s.title}</h2>
              {renderInvestment(s)}
            </div>
          ), idx);
        }
        return renderSectionCard(s, (
          <div className="px-10 py-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{s.title}</h2>
            {s.content && <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{s.content}</div>}
          </div>
        ), idx);
      })}
    </div>
  );
}
