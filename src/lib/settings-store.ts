import type { SectionType } from './mock-data';

// Simple localStorage-based settings store
const SETTINGS_KEY = 'majools_settings';

// All toggleable section types (cover is always on)
export const TOGGLEABLE_SECTIONS: { type: SectionType; label: string }[] = [
  { type: 'executive-summary', label: 'Summary' },
  { type: 'scope', label: 'Scope of Work' },
  { type: 'deliverables', label: 'Deliverables' },
  { type: 'timeline', label: 'Timeline' },
  { type: 'investment', label: 'Investment' },
  { type: 'terms', label: 'Terms & Conditions' },
];

const DEFAULT_ENABLED: SectionType[] = [
  'executive-summary', 'scope', 'deliverables', 'timeline', 'investment', 'terms',
];

export const DEFAULT_BOILERPLATE: Record<string, string> = {
  'executive-summary': 'We are pleased to present this proposal for [Project Title]. Our goal is to [briefly describe the outcome]. We believe this project represents a significant opportunity to [benefit for client].',
  'scope': 'The following work is included in this proposal:\n\n• [List your deliverables here]\n\nThe following is explicitly out of scope:\n\n• [List exclusions]',
  'deliverables': 'Upon completion, you will receive:\n\n• [List what the client gets]',
  'timeline': 'We estimate this project will take [X weeks] to complete.\n\n• Phase 1: [dates]\n• Phase 2: [dates]',
  'investment': 'Please see the investment breakdown below. Payment terms and conditions are outlined in the Terms section.',
  'terms': 'Payment is due [net 30/on receipt]. A deposit of [50%] is required before work begins. Revisions are limited to [2 rounds]. Additional revisions will be billed at [hourly rate].',
};

export interface Settings {
  // Profile
  profileName: string;
  profileEmail: string;
  // Company
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyWebsite: string;
  // Proposals
  defaultSections: SectionType[];
  boilerplate: Record<string, string>;
  // Notifications
  notificationsEmail: boolean;
  notifyProposalViewed: boolean;
  notifyProposalAccepted: boolean;
  notifyProposalDeclined: boolean;
}

const DEFAULTS: Settings = {
  profileName: '',
  profileEmail: '',
  companyName: '',
  companyAddress: '',
  companyPhone: '',
  companyWebsite: '',
  defaultSections: DEFAULT_ENABLED,
  boilerplate: { ...DEFAULT_BOILERPLATE },
  notificationsEmail: true,
  notifyProposalViewed: true,
  notifyProposalAccepted: true,
  notifyProposalDeclined: true,
};

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULTS,
        ...parsed,
        boilerplate: { ...DEFAULT_BOILERPLATE, ...(parsed.boilerplate || {}) },
      };
    }
  } catch {}
  return { ...DEFAULTS };
}

export function saveSettings(settings: Partial<Settings>): void {
  const current = getSettings();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
}
