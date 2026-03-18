import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User, Building2, FileText, CreditCard, Bell,
  Receipt, Users, Save, Upload, Check, ChevronDown, ChevronRight, Lock, X,
} from 'lucide-react';
import BreadcrumbBar from '@/components/BreadcrumbBar';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { templates, getDefaultTemplate, setDefaultTemplate, type TemplateId } from '@/lib/templates';
import { getSettings, saveSettings, TOGGLEABLE_SECTIONS, DEFAULT_BOILERPLATE, DEFAULT_BRAND_COLORS, type Settings, type BrandColors, type LogoDisplayMode } from '@/lib/settings-store';
import type { SectionType } from '@/lib/mock-data';
import { Switch } from '@/components/ui/switch';
import { MiniCoverPreview } from '@/components/TemplateSelectorModal';
import RichTextEditor from '@/components/RichTextEditor';



type SettingsSection = 'profile' | 'company' | 'proposals' | 'billing' | 'notifications' | 'invoicing' | 'crm';

const NAV_ITEMS: { id: SettingsSection; label: string; icon: typeof User; disabled?: boolean }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'proposals', label: 'Proposals', icon: FileText },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'invoicing', label: 'Invoicing', icon: Receipt, disabled: true },
  { id: 'crm', label: 'CRM', icon: Users, disabled: true },
];




export default function Settings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [settings, setSettings] = useState<Settings>(() => {
    const s = getSettings();
    return {
      ...s,
      profileName: s.profileName || user?.name || '',
      profileEmail: s.profileEmail || user?.email || '',
    };
  });
  const [defaultTpl, setDefaultTpl] = useState<TemplateId>(getDefaultTemplate());
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new1: '', new2: '' });
  const [expandedBoilerplate, setExpandedBoilerplate] = useState<SectionType | null>(null);
  const [boilerplateEdits, setBoilerplateEdits] = useState<Record<string, string>>({});
  const logoInputRef = useRef<HTMLInputElement>(null);

  const update = (partial: Partial<Settings>) => setSettings(prev => ({ ...prev, ...partial }));

  const handleSaveProfile = () => {
    saveSettings({ profileName: settings.profileName, profileEmail: settings.profileEmail });
    toast.success('Profile saved');
  };

  const handleSaveCompany = () => {
    saveSettings({
      companyName: settings.companyName,
      companyLogo: settings.companyLogo,
      logoDisplayMode: settings.logoDisplayMode,
      brandColors: settings.brandColors,
      companyAddress: settings.companyAddress,
      companyPhone: settings.companyPhone,
      companyWebsite: settings.companyWebsite,
    });
    toast.success('Company settings saved');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      toast.error('Please upload a PNG, JPG, or SVG file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      update({ companyLogo: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    update({ companyLogo: '' });
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSaveProposals = () => {
    setDefaultTemplate(defaultTpl);
    saveSettings({ defaultSections: settings.defaultSections });
    toast.success('Proposal settings saved');
  };

  const handleSaveBoilerplate = (type: SectionType) => {
    const text = boilerplateEdits[type] ?? settings.boilerplate[type] ?? '';
    const newBoilerplate = { ...settings.boilerplate, [type]: text };
    update({ boilerplate: newBoilerplate });
    saveSettings({ boilerplate: newBoilerplate });
    toast.success('Boilerplate saved');
  };

  const handleSaveNotifications = () => {
    saveSettings({
      notificationsEmail: settings.notificationsEmail,
      notifyProposalViewed: settings.notifyProposalViewed,
      notifyProposalAccepted: settings.notifyProposalAccepted,
      notifyProposalDeclined: settings.notifyProposalDeclined,
    });
    toast.success('Notification settings saved');
  };

  const toggleSection = (type: SectionType) => {
    update({
      defaultSections: settings.defaultSections.includes(type)
        ? settings.defaultSections.filter(t => t !== type)
        : [...settings.defaultSections, type],
    });
  };

  const handlePasswordSave = () => {
    if (!passwords.current || !passwords.new1) return;
    if (passwords.new1 !== passwords.new2) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed');
    setPasswords({ current: '', new1: '', new2: '' });
    setShowPasswordForm(false);
  };

  const renderInput = (label: string, value: string, onChange: (v: string) => void, type = 'text') => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );

  const SaveButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
      <Save size={16} /> Save
    </button>
  );

  // ─── Section renderers ───

  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your personal information.</p>
      </div>
      {renderInput('Name', settings.profileName, v => update({ profileName: v }))}
      {renderInput('Email', settings.profileEmail, v => update({ profileEmail: v }), 'email')}

      <div className="space-y-3 pt-2">
        <button
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="text-sm font-medium text-primary hover:underline"
        >
          Change Password
        </button>
        {showPasswordForm && (
          <div className="space-y-3 p-4 rounded-md border border-border bg-muted/30">
            {renderInput('Current Password', passwords.current, v => setPasswords(p => ({ ...p, current: v })), 'password')}
            {renderInput('New Password', passwords.new1, v => setPasswords(p => ({ ...p, new1: v })), 'password')}
            {renderInput('Confirm New Password', passwords.new2, v => setPasswords(p => ({ ...p, new2: v })), 'password')}
            <button
              onClick={handlePasswordSave}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Update Password
            </button>
          </div>
        )}
      </div>

      <SaveButton onClick={handleSaveProfile} />
    </div>
  );

  const renderColorPicker = (label: string, desc: string, colorKey: keyof BrandColors) => {
    const value = settings.brandColors[colorKey];
    return (
      <div className="flex items-center gap-3">
        <label
          className="relative w-9 h-9 rounded-md border border-border cursor-pointer overflow-hidden flex-shrink-0"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={e => update({ brandColors: { ...settings.brandColors, [colorKey]: e.target.value } })}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-tight">{label}</p>
          <p className="text-[11px] text-muted-foreground leading-tight">{desc}</p>
        </div>
        <input
          type="text"
          value={value}
          onChange={e => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) update({ brandColors: { ...settings.brandColors, [colorKey]: v } });
          }}
          className="w-[88px] h-8 px-2 rounded-md border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    );
  };

  const renderBrandPreview = () => {
    const { primary, background, text, accent } = settings.brandColors;
    return (
      <div className="rounded-lg border border-border overflow-hidden" style={{ maxWidth: 280 }}>
        {/* Mini cover */}
        <div className="px-5 py-6" style={{ backgroundColor: background }}>
          <div className="h-1.5 w-16 rounded-full mb-2" style={{ backgroundColor: accent }} />
          <div className="h-2 w-24 rounded-full mb-1" style={{ backgroundColor: '#ffffff', opacity: 0.9 }} />
          <div className="h-1.5 w-20 rounded-full" style={{ backgroundColor: '#ffffff', opacity: 0.5 }} />
        </div>
        {/* Mini body */}
        <div className="bg-white px-5 py-4 space-y-2">
          <div className="h-1.5 w-14 rounded-full" style={{ backgroundColor: accent }} />
          <div className="space-y-1">
            <div className="h-1 w-full rounded-full" style={{ backgroundColor: text, opacity: 0.25 }} />
            <div className="h-1 w-4/5 rounded-full" style={{ backgroundColor: text, opacity: 0.25 }} />
            <div className="h-1 w-3/5 rounded-full" style={{ backgroundColor: text, opacity: 0.25 }} />
          </div>
          <div className="pt-2">
            <div className="h-5 w-20 rounded-md" style={{ backgroundColor: primary }} />
          </div>
        </div>
      </div>
    );
  };

  const renderCompany = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Company</h2>
        <p className="text-sm text-muted-foreground mt-1">Your business information appears on proposals.</p>
      </div>

      {/* Company Name */}
      {renderInput('Company Name', settings.companyName, v => update({ companyName: v }))}

      {/* Logo upload */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company Logo</label>
        <input
          ref={logoInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.svg"
          onChange={handleLogoUpload}
          className="hidden"
        />
        {settings.companyLogo ? (
          <div className="flex items-center gap-4">
            <div className="h-16 w-auto p-2 rounded-md border border-border bg-background flex items-center justify-center">
              <img src={settings.companyLogo} alt="Logo preview" className="h-full max-w-[200px] object-contain" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => logoInputRef.current?.click()} className="text-xs font-medium text-primary hover:underline">Replace</button>
              <button onClick={handleRemoveLogo} className="text-xs font-medium text-destructive hover:underline flex items-center gap-1"><X size={12} /> Remove</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => logoInputRef.current?.click()}
            className="w-full h-24 rounded-md border-2 border-dashed border-input bg-background flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer hover:border-primary transition-colors"
          >
            <Upload size={16} />
            <span>Upload logo (PNG, JPG, SVG)</span>
          </button>
        )}
      </div>

      {/* Logo Display Rule */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Logo Display Rule</label>
        <div className="space-y-1.5">
          <label className={`flex items-center gap-2.5 px-3 py-2 rounded-md border cursor-pointer transition-colors ${
            settings.logoDisplayMode === 'logo' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
          } ${!settings.companyLogo ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <input
              type="radio"
              name="logoDisplay"
              checked={settings.logoDisplayMode === 'logo'}
              onChange={() => update({ logoDisplayMode: 'logo' })}
              disabled={!settings.companyLogo}
              className="accent-[hsl(var(--primary))]"
            />
            <span className="text-sm text-foreground">Show logo only</span>
          </label>
          <label className={`flex items-center gap-2.5 px-3 py-2 rounded-md border cursor-pointer transition-colors ${
            settings.logoDisplayMode === 'name' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
          }`}>
            <input
              type="radio"
              name="logoDisplay"
              checked={settings.logoDisplayMode === 'name'}
              onChange={() => update({ logoDisplayMode: 'name' })}
              className="accent-[hsl(var(--primary))]"
            />
            <span className="text-sm text-foreground">Show company name only</span>
          </label>
        </div>
      </div>

      {/* Brand Colors */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Brand Colors</label>
        <div className="grid grid-cols-[1fr_auto] gap-6 items-start">
          <div className="space-y-3">
            {renderColorPicker('Primary Color', 'Buttons, active states, accents', 'primary')}
            {renderColorPicker('Background Color', 'Cover/header backgrounds', 'background')}
            {renderColorPicker('Text Color', 'Body text', 'text')}
            {renderColorPicker('Accent Color', 'Section headers, dividers', 'accent')}
          </div>
          <div className="pt-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
            {renderBrandPreview()}
          </div>
        </div>
      </div>

      {renderInput('Address', settings.companyAddress, v => update({ companyAddress: v }))}
      {renderInput('Phone', settings.companyPhone, v => update({ companyPhone: v }), 'tel')}
      {renderInput('Website', settings.companyWebsite, v => update({ companyWebsite: v }), 'url')}
      <SaveButton onClick={handleSaveCompany} />
    </div>
  );

  const renderProposals = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Proposals</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure defaults for new proposals.</p>
      </div>

      {/* Default Template */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Default Template</h3>
        <p className="text-xs text-muted-foreground">New proposals will use this template by default.</p>
        <div className="grid grid-cols-3 gap-3">
          {templates.map(t => {
            const isSelected = defaultTpl === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setDefaultTpl(t.id)}
                className={`rounded-lg border-2 p-1 transition-all text-left ${
                  isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="relative h-20 rounded-md overflow-hidden">
                  <MiniCoverPreview templateId={t.id} />
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

      {/* Default Sections */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Default Sections</h3>
        <p className="text-xs text-muted-foreground">Toggle sections and edit their default boilerplate content.</p>
        <div className="space-y-1">
          {/* Cover — always on */}
          <div className="flex items-center justify-between py-2.5 px-3 rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              <Lock size={12} className="text-muted-foreground" />
              <span className="text-sm text-foreground font-medium">Cover</span>
            </div>
            <Switch checked disabled className="opacity-50" />
          </div>

          {TOGGLEABLE_SECTIONS.map(s => {
            const isAutoGenerated = s.type === 'table-of-contents';
            const isExpanded = expandedBoilerplate === s.type;
            const editValue = boilerplateEdits[s.type] ?? settings.boilerplate[s.type] ?? DEFAULT_BOILERPLATE[s.type] ?? '';
            return (
              <div key={s.type}>
                <div className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-muted/30 transition-colors">
                  {isAutoGenerated ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{s.label}</span>
                      <span className="text-[10px] uppercase tracking-wider">(auto-generated)</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setExpandedBoilerplate(isExpanded ? null : s.type)}
                      className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span>{s.label}</span>
                    </button>
                  )}
                  <Switch
                    checked={settings.defaultSections.includes(s.type)}
                    onCheckedChange={() => toggleSection(s.type)}
                  />
                </div>
                {!isAutoGenerated && isExpanded && (
                  <div className="ml-6 mr-3 mb-2 p-3 rounded-md border border-border bg-muted/20 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Edit the default boilerplate for this section. Use placeholders: <code className="bg-muted px-1 py-0.5 rounded text-[10px]">[Client Name]</code> <code className="bg-muted px-1 py-0.5 rounded text-[10px]">[Project Title]</code> <code className="bg-muted px-1 py-0.5 rounded text-[10px]">[Your Company]</code> <code className="bg-muted px-1 py-0.5 rounded text-[10px]">[Date]</code>
                    </p>
                    <RichTextEditor
                      content={editValue}
                      onChange={val => setBoilerplateEdits(prev => ({ ...prev, [s.type]: val }))}
                      className="min-h-[120px]"
                    />
                    <button
                      onClick={() => handleSaveBoilerplate(s.type)}
                      className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <SaveButton onClick={handleSaveProposals} />
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Billing</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your subscription and payment methods.</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Active Jools</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-3 px-4 rounded-md border border-border">
            <div className="flex items-center gap-3">
              <FileText size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Proposals</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-primary/10 text-primary uppercase tracking-wider">Trial</span>
          </div>
          {[
            { label: 'Invoicing', icon: Receipt },
            { label: 'CRM', icon: Users },
          ].map(j => (
            <div key={j.label} className="flex items-center justify-between py-3 px-4 rounded-md border border-border">
              <div className="flex items-center gap-3">
                <j.icon size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{j.label}</span>
              </div>
              <button className="text-xs font-medium px-3 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                Add
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Payment Method</h3>
        <div className="py-4 px-4 rounded-md border border-dashed border-border text-sm text-muted-foreground">
          No payment method on file
        </div>
      </div>

      <div className="p-4 rounded-md bg-primary/5 border border-primary/20">
        <p className="text-sm text-foreground">
          Your <span className="font-semibold">30-day free trial</span> is active. No credit card required.
        </p>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground mt-1">Control how and when you receive alerts.</p>
      </div>

      <div className="space-y-2">
        {[
          { label: 'Email notifications', key: 'notificationsEmail' as const, desc: 'Receive email alerts for proposal activity' },
          { label: 'Proposal viewed by client', key: 'notifyProposalViewed' as const, desc: 'When a client opens your proposal' },
          { label: 'Proposal accepted', key: 'notifyProposalAccepted' as const, desc: 'When a client accepts your proposal' },
          { label: 'Proposal declined', key: 'notifyProposalDeclined' as const, desc: 'When a client declines your proposal' },
        ].map(n => (
          <div key={n.key} className="flex items-center justify-between py-3 px-3 rounded-md hover:bg-muted/30 transition-colors">
            <div>
              <p className="text-sm font-medium text-foreground">{n.label}</p>
              <p className="text-xs text-muted-foreground">{n.desc}</p>
            </div>
            <Switch
              checked={settings[n.key]}
              onCheckedChange={v => update({ [n.key]: v })}
            />
          </div>
        ))}
      </div>

      <SaveButton onClick={handleSaveNotifications} />
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return renderProfile();
      case 'company': return renderCompany();
      case 'proposals': return renderProposals();
      case 'billing': return renderBilling();
      case 'notifications': return renderNotifications();
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      <BreadcrumbBar items={['Dashboard', 'Settings']} />
      <div className="max-w-[960px] mx-auto p-8">
        <h1 className="text-2xl font-semibold text-foreground mb-8">Settings</h1>
        <div className="grid grid-cols-[220px_1fr] gap-8">
          {/* Left nav */}
          <nav className="space-y-1">
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => !item.disabled && setActiveSection(item.id)}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${
                    item.disabled
                      ? 'text-muted-foreground/40 cursor-not-allowed'
                      : isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted/50'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                  {item.disabled && (
                    <span className="ml-auto text-[9px] uppercase tracking-wider text-muted-foreground/40">Soon</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div className="bg-card rounded-lg shadow-widget p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
