import type { SectionType } from './mock-data';

// Simple localStorage-based settings store
const SETTINGS_KEY = 'majools_settings';

// All toggleable section types (cover is always on)
export const TOGGLEABLE_SECTIONS: { type: SectionType; label: string }[] = [
  { type: 'cover-letter', label: 'Cover Letter' },
  { type: 'table-of-contents', label: 'Table of Contents' },
  { type: 'executive-summary', label: 'Summary' },
  { type: 'scope', label: 'Scope of Work' },
  { type: 'deliverables', label: 'Deliverables' },
  { type: 'timeline', label: 'Timeline' },
  { type: 'investment', label: 'Investment' },
  { type: 'terms', label: 'Terms & Conditions' },
  { type: 'about-us', label: 'About Us' },
  { type: 'testimonials', label: 'Testimonials' },
  { type: 'back-page', label: 'Back Page' },
];

const DEFAULT_ENABLED: SectionType[] = [
  'cover-letter', 'table-of-contents',
  'executive-summary', 'scope', 'deliverables', 'timeline', 'investment', 'terms',
  'about-us', 'testimonials', 'back-page',
];

export const DEFAULT_BOILERPLATE: Record<string, string> = {
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

export type LogoDisplayMode = 'logo' | 'name';

export interface BrandColors {
  primary: string;
  background: string;
  text: string;
  accent: string;
}

export const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: '#3DCEE9',
  background: '#2B2B2B',
  text: '#2B2B2B',
  accent: '#3DCEE9',
};

export interface Settings {
  profileName: string;
  profileEmail: string;
  companyName: string;
  companyLogo: string;
  logoDisplayMode: LogoDisplayMode;
  brandColors: BrandColors;
  companyAddress: string;
  companyPhone: string;
  companyWebsite: string;
  defaultSections: SectionType[];
  boilerplate: Record<string, string>;
  notificationsEmail: boolean;
  notifyProposalViewed: boolean;
  notifyProposalAccepted: boolean;
  notifyProposalDeclined: boolean;
}

const DEFAULTS: Settings = {
  profileName: '',
  profileEmail: '',
  companyName: '',
  companyLogo: '',
  logoDisplayMode: 'logo',
  brandColors: { ...DEFAULT_BRAND_COLORS },
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
        brandColors: { ...DEFAULT_BRAND_COLORS, ...(parsed.brandColors || {}) },
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
