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

export interface ProposalSection {
  id: string;
  type: 'cover' | 'executive-summary' | 'scope' | 'deliverables' | 'timeline' | 'investment' | 'terms';
  title: string;
  content: string;
  lineItems?: ProposalLineItem[];
  coverData?: {
    projectTitle: string;
    clientName: string;
    clientEmail: string;
    yourName: string;
    date: string;
  };
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
  accessType?: 'link' | 'password';
  password?: string;
  publicToken?: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
}

const defaultSections: ProposalSection[] = [
  { id: '1', type: 'cover', title: 'Cover', content: '', coverData: { projectTitle: '', clientName: '', clientEmail: '', yourName: '', date: new Date().toISOString().split('T')[0] } },
  { id: '2', type: 'executive-summary', title: 'Executive Summary', content: '' },
  { id: '3', type: 'scope', title: 'Scope of Work', content: '' },
  { id: '4', type: 'deliverables', title: 'Deliverables', content: '' },
  { id: '5', type: 'timeline', title: 'Timeline', content: '' },
  { id: '6', type: 'investment', title: 'Investment', content: '', lineItems: [{ id: 'li-1', description: '', quantity: 1, unitPrice: 0, total: 0 }] },
  { id: '7', type: 'terms', title: 'Terms & Conditions', content: '' },
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
  },
];

export const mockActivity: ActivityItem[] = [
  { id: 'a1', text: 'Proposal sent to Acme Corp', time: '2 hours ago' },
  { id: 'a2', text: 'Invoice #1042 marked as paid', time: '5 hours ago' },
  { id: 'a3', text: 'New project created: Zenith App', time: 'Yesterday' },
  { id: 'a4', text: 'Proposal accepted by Pinnacle Media', time: '2 days ago' },
];

export function createDefaultSections(): ProposalSection[] {
  return defaultSections.map((s, i) => ({
    ...s,
    id: `sec-${Date.now()}-${i}`,
    lineItems: s.lineItems ? s.lineItems.map(li => ({ ...li, id: `li-${Date.now()}-${i}` })) : undefined,
    coverData: s.coverData ? { ...s.coverData } : undefined,
  }));
}
