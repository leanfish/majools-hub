export type TemplateId = 'classic' | 'modern' | 'branded' | 'executive' | 'minimal' | 'bold';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
}

export const templates: TemplateInfo[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean, minimal, white background with professional typography',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Bold headers, strong visual hierarchy, design-forward',
  },
  {
    id: 'branded',
    name: 'Branded',
    description: 'Full brand colors with logo and premium accents',
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Premium feel for high-value corporate proposals',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Extreme restraint — content is the design',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'High energy, full color for creative studios',
  },
];

const STORAGE_KEY = 'majools_default_template';

export function getDefaultTemplate(): TemplateId {
  return (localStorage.getItem(STORAGE_KEY) as TemplateId) || 'classic';
}

export function setDefaultTemplate(id: TemplateId) {
  localStorage.setItem(STORAGE_KEY, id);
}
