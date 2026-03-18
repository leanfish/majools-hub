export type TemplateId = 'classic' | 'modern' | 'branded';

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
    description: 'Bold cyan headers, strong visual hierarchy, design-forward',
  },
  {
    id: 'branded',
    name: 'Branded',
    description: 'Premium deliverable with company name and cyan accents throughout',
  },
];

const STORAGE_KEY = 'majools_default_template';

export function getDefaultTemplate(): TemplateId {
  return (localStorage.getItem(STORAGE_KEY) as TemplateId) || 'classic';
}

export function setDefaultTemplate(id: TemplateId) {
  localStorage.setItem(STORAGE_KEY, id);
}
