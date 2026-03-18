import { format } from 'date-fns';
import type { ProposalSection } from '@/lib/mock-data';
import type { TemplateId } from '@/lib/templates';

interface Props {
  sections: ProposalSection[];
  template: TemplateId;
  companyName?: string;
}

export default function ProposalPreview({ sections, template, companyName }: Props) {
  const cover = sections.find(s => s.type === 'cover')?.coverData;
  const investment = sections.find(s => s.type === 'investment');
  const total = investment?.lineItems?.reduce((sum, li) => sum + li.total, 0) || 0;
  const contentSections = sections.filter(s => s.type !== 'cover' && s.type !== 'investment');

  const dateDisplay = cover?.date
    ? format(new Date(cover.date), 'MMMM d, yyyy')
    : '';

  if (template === 'modern') return (
    <div className="min-h-full bg-white text-gray-900">
      {/* Modern: bold cyan header bar */}
      {cover && (
        <div className="bg-[#3DCEE9] px-10 py-12">
          <h1 className="text-3xl font-bold text-white tracking-tight">{cover.projectTitle || 'Untitled Proposal'}</h1>
          <p className="text-white/80 mt-2 text-base">Prepared for <span className="font-semibold text-white">{cover.clientName}</span></p>
          <p className="text-white/60 text-sm mt-1">By {cover.yourName} · {dateDisplay}</p>
        </div>
      )}
      <div className="px-10 py-8 space-y-8">
        {contentSections.map(s => s.content ? (
          <div key={s.id}>
            <h2 className="text-lg font-bold text-[#3DCEE9] uppercase tracking-wider mb-3">{s.title}</h2>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{s.content}</div>
          </div>
        ) : null)}
        {investment && investment.lineItems && investment.lineItems.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-[#3DCEE9] uppercase tracking-wider mb-3">Investment</h2>
            <div className="border-t-2 border-[#3DCEE9]">
              {investment.lineItems.map(li => (
                <div key={li.id} className="flex justify-between py-3 border-b border-gray-100">
                  <div>
                    <span className="text-sm text-gray-900">{li.description || 'Line item'}</span>
                    <span className="text-xs text-gray-400 ml-2">× {li.quantity}</span>
                  </div>
                  <span className="text-sm font-semibold">${li.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4 mt-2">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-[#3DCEE9]">${total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (template === 'branded') return (
    <div className="min-h-full bg-gray-50 text-gray-900">
      {/* Branded: company name banner */}
      {cover && (
        <div className="bg-gray-900 px-10 py-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3DCEE9]/20 rounded-full -translate-y-1/2 translate-x-1/3" />
          <p className="text-[#3DCEE9] text-xs font-bold uppercase tracking-[0.2em] mb-4">{companyName || 'Your Company'}</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">{cover.projectTitle || 'Untitled Proposal'}</h1>
          <div className="mt-4 flex gap-6 text-sm text-gray-400">
            <span>Client: <span className="text-white font-medium">{cover.clientName}</span></span>
            <span>By: <span className="text-white font-medium">{cover.yourName}</span></span>
            <span>{dateDisplay}</span>
          </div>
        </div>
      )}
      <div className="px-10 py-8 space-y-8">
        {contentSections.map(s => s.content ? (
          <div key={s.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-[#3DCEE9] rounded-full" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">{s.title}</h2>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{s.content}</div>
          </div>
        ) : null)}
        {investment && investment.lineItems && investment.lineItems.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-[#3DCEE9] rounded-full" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">Investment</h2>
            </div>
            {investment.lineItems.map(li => (
              <div key={li.id} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <span className="text-sm">{li.description || 'Line item'}</span>
                  <span className="text-xs text-gray-400 ml-2">× {li.quantity}</span>
                </div>
                <span className="text-sm font-semibold">${li.total.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-4 mt-4 border-t-2 border-[#3DCEE9]">
              <span className="font-bold">Total</span>
              <span className="text-xl font-bold text-[#3DCEE9]">${total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Classic (default): clean white minimal
  return (
    <div className="min-h-full bg-white text-gray-900 px-10 py-10">
      {cover && (
        <div className="mb-10 pb-8 border-b border-gray-200">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{cover.projectTitle || 'Untitled Proposal'}</h1>
          <p className="text-gray-500 mt-2">Prepared for <span className="text-gray-900 font-medium">{cover.clientName}</span></p>
          <p className="text-sm text-gray-400 mt-1">By {cover.yourName} · {dateDisplay}</p>
        </div>
      )}
      <div className="space-y-8">
        {contentSections.map(s => s.content ? (
          <div key={s.id}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{s.title}</h2>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{s.content}</div>
          </div>
        ) : null)}
        {investment && investment.lineItems && investment.lineItems.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Investment</h2>
            {investment.lineItems.map(li => (
              <div key={li.id} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <span className="text-sm text-gray-900">{li.description || 'Line item'}</span>
                  <span className="text-xs text-gray-400 ml-2">× {li.quantity}</span>
                </div>
                <span className="text-sm font-medium">${li.total.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-4 mt-2 border-t border-gray-200">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-semibold">${total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
