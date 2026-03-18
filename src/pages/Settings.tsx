import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload } from 'lucide-react';
import BreadcrumbBar from '@/components/BreadcrumbBar';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState('');

  const handleSave = () => {
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
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>
    </motion.div>
  );
}
