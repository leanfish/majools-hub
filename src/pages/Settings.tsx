import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, Check } from 'lucide-react';
import BreadcrumbBar from '@/components/BreadcrumbBar';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { templates, getDefaultTemplate, setDefaultTemplate, type TemplateId } from '@/lib/templates';

const thumbnailStyles: Record<TemplateId, { bg: string; accent: string }> = {
  classic: { bg: 'bg-white', accent: 'bg-gray-200' },
  modern: { bg: 'bg-white', accent: 'bg-[#3DCEE9]' },
  branded: { bg: 'bg-gray-900', accent: 'bg-[#3DCEE9]' },
};

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState('');
  const [defaultTpl, setDefaultTpl] = useState<TemplateId>(getDefaultTemplate());

  const handleSave = () => {
    setDefaultTemplate(defaultTpl);
    toast.success('Settings saved');
  };

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      <BreadcrumbBar items={['Dashboard', 'Settings']} />
      <div className="max-w-[600px] mx-auto p-8">
        <h1 className="text-2xl font-semibold text-foreground mb-8">Settings</h1>
        <div className="bg-card rounded-lg shadow-widget p-8 space-y-6">
          {[
            { label: 'Name', value: name, onChange: setName },
            { label: 'Email', value: email, onChange: setEmail },
            { label: 'Company Name', value: company, onChange: setCompany },
          ].map(f => (
            <div key={f.label} className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{f.label}</label>
              <input
                value={f.value}
                onChange={e => f.onChange(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company Logo</label>
            <div className="w-full h-24 rounded-md border-2 border-dashed border-input bg-background flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer hover:border-primary transition-colors">
              <Upload size={16} />
              <span>Upload logo (coming soon)</span>
            </div>
          </div>

          {/* Default Template */}
          <div className="space-y-3 pt-4 border-t border-border">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Default Template</label>
            <p className="text-xs text-muted-foreground">New proposals will use this template by default.</p>
            <div className="grid grid-cols-3 gap-3">
              {templates.map(t => {
                const style = thumbnailStyles[t.id];
                const isSelected = defaultTpl === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setDefaultTpl(t.id)}
                    className={`rounded-lg border-2 p-1 transition-all text-left ${
                      isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`${style.bg} rounded-md h-20 p-2 flex flex-col gap-1.5 relative`}>
                      <div className={`${style.accent} h-1.5 w-10 rounded-full`} />
                      <div className={`${style.accent} h-1 w-14 rounded-full opacity-40`} />
                      <div className={`${style.accent} h-1 w-12 rounded-full opacity-40`} />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check size={10} className="text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-foreground mt-1 px-1">{t.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>
    </motion.div>
  );
}
