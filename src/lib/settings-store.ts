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

interface Settings {
  companyName: string;
  defaultSections: SectionType[];
}

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        companyName: parsed.companyName || '',
        defaultSections: parsed.defaultSections || DEFAULT_ENABLED,
      };
    }
  } catch {}
  return { companyName: '', defaultSections: DEFAULT_ENABLED };
}

export function saveSettings(settings: Partial<Settings>): void {
  const current = getSettings();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
}
