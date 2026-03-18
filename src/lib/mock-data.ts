export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ProposalLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface TimelineRow {
  id: string;
  phase: string;
  activity: string;
  duration: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  clientName: string;
  clientCompany: string;
}

export type SectionType =
  | 'cover-letter'
  | 'table-of-contents'
  | 'cover'
  | 'executive-summary'
  | 'scope'
  | 'deliverables'
  | 'timeline'
  | 'investment'
  | 'terms'
  | 'about-us'
  | 'testimonials'
  | 'back-page'
  | 'custom';

export const ALL_SECTION_TYPES: { type: SectionType; title: string }[] = [
  { type: 'cover-letter', title: 'Cover Letter' },
  { type: 'table-of-contents', title: 'Table of Contents' },
  { type: 'cover', title: 'Cover' },
  { type: 'executive-summary', title: 'Executive Summary' },
  { type: 'scope', title: 'Scope of Work' },
  { type: 'deliverables', title: 'Deliverables' },
  { type: 'timeline', title: 'Timeline' },
  { type: 'investment', title: 'Investment' },
  { type: 'terms', title: 'Terms & Conditions' },
  { type: 'about-us', title: 'About Us' },
  { type: 'testimonials', title: 'Testimonials' },
  { type: 'back-page', title: 'Back Page' },
];

export const BOILERPLATE_CONTENT: Record<string, string> = {
  'executive-summary': `<h2>The Objective</h2><p>Thank you for the opportunity to present this proposal for [Project Title]. Based on our conversations, we understand that [Client Name] is looking to achieve [specific goal]. This proposal outlines our recommended approach to make that happen.</p><h2>The Opportunity</h2><p>By working with [Your Company], [Client Name] will benefit from:</p><ul><li>[Benefit 1]</li><li>[Benefit 2]</li><li>[Benefit 3]</li></ul><h2>Our Approach</h2><p>We bring [X years] of experience in [relevant area] and a proven track record of delivering results for clients like [Client Name]. Our methodology is collaborative, transparent, and focused entirely on your success.</p>`,
  'scope': `<h2>What is Included</h2><p>The following services and deliverables are included in this proposal:</p><ul><li>[Service or deliverable 1]</li><li>[Service or deliverable 2]</li><li>[Service or deliverable 3]</li></ul><h2>What is Not Included</h2><p>The following items are explicitly outside the scope of this engagement unless agreed separately in writing:</p><ul><li>[Exclusion 1]</li><li>[Exclusion 2]</li></ul><p>Any work outside this scope will be discussed and quoted separately before proceeding.</p>`,
  'deliverables': `<p>Upon successful completion of this project, [Client Name] will receive:</p><h2>Primary Deliverables</h2><ul><li>[Deliverable 1 — be specific]</li><li>[Deliverable 2 — be specific]</li><li>[Deliverable 3 — be specific]</li></ul><h2>Supporting Materials</h2><ul><li>[Any documentation, files, or assets included]</li></ul><p>All deliverables will be provided in the formats agreed upon during the project kickoff.</p>`,
  'timeline': '',
  'investment': '<p>Please see the investment breakdown below. Payment terms and conditions are outlined in the Terms section.</p>',
  'terms': `<h2>Payment Terms</h2><p>A deposit of [50%] is required before work begins. The remaining balance is due upon project completion. All invoices are payable within [30 days] of issue.</p><h2>Revisions</h2><p>This proposal includes [2 rounds] of revisions. Additional revisions will be billed at [hourly rate] per hour.</p><h2>Cancellation</h2><p>If this project is cancelled by either party after work has begun, [Your Company] will invoice for all work completed to date at the agreed project rate.</p><h2>Intellectual Property</h2><p>Upon receipt of final payment, all intellectual property rights for the deliverables described in this proposal transfer to [Client Name].</p><h2>Validity</h2><p>This proposal is valid for [30 days] from the date issued.</p>`,
  'cover-letter': `<p>Dear [Client Name],</p><p>Thank you for the opportunity to present this proposal for [Project Title]. Based on our conversations, I have developed a comprehensive proposal that addresses your specific needs and objectives.</p><p>[Your Company] has extensive experience delivering projects of this nature and I am confident we can exceed your expectations. I have outlined our approach, timeline, and investment in the pages that follow.</p><p>Please do not hesitate to reach out if you have any questions. I look forward to hearing from you.</p><p>Sincerely,<br>[Your Name]<br>[Your Company]<br>[Phone]<br>[Email]<br>[Website]</p>`,
  'about-us': `<p>[Your Company] was founded with a simple mission: to deliver exceptional results for our clients. With [X years] of experience in [your industry], we have built a reputation for quality, reliability, and professionalism.</p><p>Our team brings together expertise in [area 1], [area 2], and [area 3], allowing us to approach every project with both strategic thinking and practical execution.</p><p>We have worked with clients ranging from [type of client] to [type of client], consistently delivering projects on time and within budget. We would be proud to bring that same commitment to [Project Title].</p>`,
  'back-page': `<p>Thank you for taking the time to review this proposal. We are excited about the opportunity to work together and are confident that [Your Company] is the right partner for [Project Title].</p><p>To proceed, please click Accept Proposal below or reach out to us directly using the contact details on this page. We look forward to your response.</p>`,
};

export const DEFAULT_TIMELINE_ROWS: TimelineRow[] = [
  { id: 'tr-1', phase: 'Phase 1', activity: 'Discovery and Requirements Gathering', duration: '1 week' },
  { id: 'tr-2', phase: 'Phase 2', activity: 'Design and Development', duration: '2-3 weeks' },
  { id: 'tr-3', phase: 'Phase 3', activity: 'Review and Revisions', duration: '1 week' },
  { id: 'tr-4', phase: 'Phase 4', activity: 'Final Delivery', duration: '1 week' },
];

export interface ProposalSection {
  id: string;
  type: SectionType;
  title: string;
  content: string;
  lineItems?: ProposalLineItem[];
  coverData?: {
    projectTitle: string;
    clientName: string;
    clientEmail: string;
    companyName: string;
    date: string;
  };
  coverLetterData?: {
    toName: string;
    toTitle: string;
    fromCompany: string;
  };
  timelineRows?: TimelineRow[];
  testimonials?: Testimonial[];
}

export interface Proposal {
  id: string;
  title: string;
  client: string;
  clientEmail: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
  value: number;
  sections: ProposalSection[];
  accessType?: 'link' | 'access-code';
  accessCode?: string;
  publicToken?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  version?: number;
  sentAt?: string;
  parentId?: string;
  template?: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
}

const defaultSections: ProposalSection[] = [
  { id: '1', type: 'cover-letter', title: 'Cover Letter', content: BOILERPLATE_CONTENT['cover-letter'], coverLetterData: { toName: '', toTitle: '', fromCompany: '' } },
  { id: '2', type: 'table-of-contents', title: 'Table of Contents', content: '' },
  { id: '3', type: 'cover', title: 'Cover', content: '', coverData: { projectTitle: '', clientName: '', clientEmail: '', companyName: '', date: new Date().toISOString().split('T')[0] } },
  { id: '4', type: 'executive-summary', title: 'Executive Summary', content: BOILERPLATE_CONTENT['executive-summary'] },
  { id: '5', type: 'scope', title: 'Scope of Work', content: BOILERPLATE_CONTENT['scope'] },
  { id: '6', type: 'deliverables', title: 'Deliverables', content: BOILERPLATE_CONTENT['deliverables'] },
  { id: '7', type: 'timeline', title: 'Timeline', content: '', timelineRows: [...DEFAULT_TIMELINE_ROWS.map(r => ({ ...r, id: `tr-${Date.now()}-${r.id}` }))] },
  { id: '8', type: 'investment', title: 'Investment', content: '', lineItems: [{ id: 'li-1', description: '', quantity: 1, unitPrice: 0, total: 0 }] },
  { id: '9', type: 'terms', title: 'Terms & Conditions', content: BOILERPLATE_CONTENT['terms'] },
  { id: '10', type: 'about-us', title: 'About Us', content: BOILERPLATE_CONTENT['about-us'] },
  { id: '11', type: 'testimonials', title: 'Testimonials', content: '', testimonials: [{ id: 'test-1', quote: '', clientName: '', clientCompany: '' }] },
  { id: '12', type: 'back-page', title: 'Back Page', content: BOILERPLATE_CONTENT['back-page'] },
];

export const mockUser: User = {
  id: 'usr-1',
  name: 'Alex Morgan',
  email: 'alex@majools.com',
};

export const mockProposals: Proposal[] = [
  {
    id: 'prop-1',
    title: 'Website Redesign',
    client: 'Acme Corp',
    clientEmail: 'contact@acmecorp.com',
    status: 'sent',
    createdAt: '2026-03-12T10:00:00Z',
    updatedAt: '2026-03-12T14:30:00Z',
    value: 4500,
    sections: defaultSections,
    publicToken: 'tk-acme-001',
    version: 1,
    sentAt: '2026-03-12T14:30:00Z',
    accessType: 'access-code',
    accessCode: 'acme2026',
  },
  {
    id: 'prop-2',
    title: 'Brand Identity',
    client: 'Nova Labs',
    clientEmail: 'hello@novalabs.io',
    status: 'draft',
    createdAt: '2026-03-10T09:00:00Z',
    updatedAt: '2026-03-11T16:00:00Z',
    value: 2800,
    sections: defaultSections,
    version: 1,
  },
  {
    id: 'prop-3',
    title: 'SEO Audit',
    client: 'Pinnacle Media',
    clientEmail: 'info@pinnaclemedia.com',
    status: 'accepted',
    createdAt: '2026-03-08T11:00:00Z',
    updatedAt: '2026-03-09T10:00:00Z',
    value: 1200,
    sections: defaultSections,
    publicToken: 'tk-pinnacle-003',
    version: 1,
    sentAt: '2026-03-09T10:00:00Z',
  },
  {
    id: 'prop-4',
    title: 'App Prototype',
    client: 'Zenith Inc',
    clientEmail: 'dev@zenithinc.com',
    status: 'sent',
    createdAt: '2026-03-05T08:00:00Z',
    updatedAt: '2026-03-06T12:00:00Z',
    value: 6500,
    sections: defaultSections,
    publicToken: 'tk-zenith-004',
    version: 1,
    sentAt: '2026-03-06T12:00:00Z',
  },
  {
    id: 'prop-5',
    title: 'Marketing Strategy',
    client: 'Bloom Co',
    clientEmail: 'team@bloomco.com',
    status: 'draft',
    createdAt: '2026-03-03T13:00:00Z',
    updatedAt: '2026-03-04T09:00:00Z',
    value: 3200,
    sections: defaultSections,
    version: 1,
  },
];

export const mockActivity: ActivityItem[] = [
  { id: 'a1', text: 'Proposal sent to Acme Corp', time: '2 hours ago' },
  { id: 'a2', text: 'Invoice #1042 marked as paid', time: '5 hours ago' },
  { id: 'a3', text: 'New project created: Zenith App', time: 'Yesterday' },
  { id: 'a4', text: 'Proposal accepted by Pinnacle Media', time: '2 days ago' },
];

export function createDefaultSections(enabledTypes?: SectionType[]): ProposalSection[] {
  const filtered = enabledTypes
    ? defaultSections.filter(s =>
        s.type === 'cover' ||
        s.type === 'cover-letter' ||
        s.type === 'table-of-contents' ||
        s.type === 'back-page' ||
        enabledTypes.includes(s.type)
      )
    : defaultSections;
  return filtered.map((s, i) => ({
    ...s,
    id: `sec-${Date.now()}-${i}`,
    lineItems: s.lineItems ? s.lineItems.map(li => ({ ...li, id: `li-${Date.now()}-${i}` })) : undefined,
    coverData: s.coverData ? { ...s.coverData } : undefined,
    coverLetterData: s.coverLetterData ? { ...s.coverLetterData } : undefined,
    timelineRows: s.timelineRows ? s.timelineRows.map(r => ({ ...r, id: `tr-${Date.now()}-${i}-${r.id}` })) : undefined,
    testimonials: s.testimonials ? s.testimonials.map(t => ({ ...t, id: `test-${Date.now()}-${i}` })) : undefined,
  }));
}
