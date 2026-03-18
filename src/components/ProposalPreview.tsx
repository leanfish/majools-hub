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
  const dateDisplay = cover?.date
    ? format(new Date(cover.date), 'MMMM d, yyyy')
    : '';
  const displayCompany = companyName || cover?.companyName || 'Your Company';

  // Render each section as a distinct page card
  const renderSectionCard = (section: ProposalSection, content: React.ReactNode) => (
    <div key={section.id} className="bg-white rounded-lg shadow-md min-h-[500px] overflow-hidden">
      {content}
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

  if (template === 'modern') {
    return (
      <div className="space-y-10 p-2">
        {/* Cover card */}
        {cover && renderSectionCard(sections.find(s => s.type === 'cover')!, (
          <div className="bg-[#3DCEE9] px-10 py-12 min-h-[500px] flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">{cover.projectTitle || 'Untitled Proposal'}</h1>
            <p className="text-white/80 mt-2 text-base">Prepared for <span className="font-semibold text-white">{cover.clientName}</span></p>
            <p className="text-white/60 text-sm mt-1">By {displayCompany} · {dateDisplay}</p>
          </div>
        ))}

        {/* Content sections */}
        {sections.filter(s => s.type !== 'cover').map(s => {
          if (s.type === 'investment') {
            return renderSectionCard(s, (
              <div className="px-10 py-8">
                <h2 className="text-lg font-bold text-[#3DCEE9] uppercase tracking-wider mb-4">{s.title}</h2>
                <div className="border-t-2 border-[#3DCEE9]">
                  {renderInvestment(s)}
                </div>
              </div>
            ));
          }
          return renderSectionCard(s, (
            <div className="px-10 py-8">
              <h2 className="text-lg font-bold text-[#3DCEE9] uppercase tracking-wider mb-4">{s.title}</h2>
              {s.content && <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{s.content}</div>}
            </div>
          ));
        })}
      </div>
    );
  }

  if (template === 'branded') {
    return (
      <div className="space-y-10 p-2">
        {/* Cover card */}
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
        ))}

        {/* Content sections */}
        {sections.filter(s => s.type !== 'cover').map(s => {
          if (s.type === 'investment') {
            return renderSectionCard(s, (
              <div className="bg-white px-10 py-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-[#3DCEE9] rounded-full" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">{s.title}</h2>
                </div>
                {renderInvestment(s)}
              </div>
            ));
          }
          return renderSectionCard(s, (
            <div className="bg-white px-10 py-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-[#3DCEE9] rounded-full" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">{s.title}</h2>
              </div>
              {s.content && <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{s.content}</div>}
            </div>
          ));
        })}
      </div>
    );
  }

  // Classic (default)
  return (
    <div className="space-y-10 p-2">
      {/* Cover card */}
      {cover && renderSectionCard(sections.find(s => s.type === 'cover')!, (
        <div className="px-10 py-10 min-h-[500px] flex flex-col justify-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{cover.projectTitle || 'Untitled Proposal'}</h1>
          <p className="text-gray-500 mt-2">Prepared for <span className="text-gray-900 font-medium">{cover.clientName}</span></p>
          <p className="text-sm text-gray-400 mt-1">By {displayCompany} · {dateDisplay}</p>
        </div>
      ))}

      {/* Content sections */}
      {sections.filter(s => s.type !== 'cover').map(s => {
        if (s.type === 'investment') {
          return renderSectionCard(s, (
            <div className="px-10 py-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{s.title}</h2>
              {renderInvestment(s)}
            </div>
          ));
        }
        if (!s.content) return null;
        return renderSectionCard(s, (
          <div className="px-10 py-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{s.title}</h2>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{s.content}</div>
          </div>
        ));
      })}
    </div>
  );
}
