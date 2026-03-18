import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { templates, type TemplateId } from '@/lib/templates';
import { getSettings, DEFAULT_BRAND_COLORS } from '@/lib/settings-store';

interface Props {
  current: TemplateId;
  onSelect: (id: TemplateId) => void;
  onClose: () => void;
}

function MiniCoverPreview({ templateId }: { templateId: TemplateId }) {
  const settings = getSettings();
  const p = settings.brandColors?.primary || DEFAULT_BRAND_COLORS.primary;
  const bg = settings.brandColors?.background || DEFAULT_BRAND_COLORS.background;
  const tx = settings.brandColors?.text || DEFAULT_BRAND_COLORS.text;
  const ac = settings.brandColors?.accent || DEFAULT_BRAND_COLORS.accent;

  const titleBar = (h: string, w: string, color: string, opacity = 1) => (
    <div className={`rounded-full ${h} ${w}`} style={{ backgroundColor: color, opacity }} />
  );
  const textBar = (w: string, color: string, opacity = 0.3) => (
    <div className={`rounded-full h-[3px] ${w}`} style={{ backgroundColor: color, opacity }} />
  );

  switch (templateId) {
    case 'classic':
      return (
        <div className="bg-white rounded-md h-full p-3 flex flex-col justify-center gap-2">
          {titleBar('h-[5px]', 'w-16', tx, 0.9)}
          {textBar('w-12', tx, 0.3)}
          {textBar('w-14', tx, 0.2)}
          <div className="mt-auto">{textBar('w-10', p, 0.15)}</div>
        </div>
      );
    case 'modern':
      return (
        <div className="bg-white rounded-md h-full p-3 flex flex-col justify-center gap-2" style={{ borderLeft: `4px solid ${p}` }}>
          {titleBar('h-[5px]', 'w-16', tx, 0.9)}
          {textBar('w-12', tx, 0.3)}
          {textBar('w-14', tx, 0.2)}
        </div>
      );
    case 'branded':
      return (
        <div className="rounded-md h-full p-3 flex flex-col justify-center gap-2 relative overflow-hidden" style={{ backgroundColor: bg }}>
          <div className="absolute top-0 right-0 w-10 h-10 rounded-full -translate-y-1/2 translate-x-1/3" style={{ backgroundColor: ac, opacity: 0.25 }} />
          <div className="rounded-full h-[3px] w-8" style={{ backgroundColor: ac, opacity: 0.7 }} />
          {titleBar('h-[5px]', 'w-14', '#ffffff', 0.9)}
          {textBar('w-12', '#ffffff', 0.4)}
        </div>
      );
    case 'executive':
      return (
        <div className="rounded-md h-full flex flex-col overflow-hidden">
          <div className="flex-[3] p-3 flex flex-col justify-end" style={{ backgroundColor: bg }}>
            {titleBar('h-[5px]', 'w-14', '#ffffff', 0.9)}
          </div>
          <div className="flex-[2] bg-white p-3 flex flex-col justify-center gap-1">
            {textBar('w-10', tx, 0.5)}
            {textBar('w-8', tx, 0.2)}
          </div>
        </div>
      );
    case 'minimal':
      return (
        <div className="bg-white rounded-md h-full p-3 flex flex-col justify-center gap-2">
          {titleBar('h-[6px]', 'w-16', tx, 0.9)}
          <div className="mt-1" />
          {textBar('w-10', '#9ca3af', 0.4)}
          {textBar('w-12', '#9ca3af', 0.3)}
        </div>
      );
    case 'bold':
      return (
        <div className="rounded-md h-full p-3 flex flex-col justify-center gap-2" style={{ backgroundColor: p }}>
          {titleBar('h-[6px]', 'w-16', '#ffffff', 0.95)}
          {textBar('w-10', '#ffffff', 0.5)}
          {textBar('w-8', '#ffffff', 0.3)}
        </div>
      );
    default:
      return <div className="bg-white rounded-md h-full" />;
  }
}

export default function TemplateSelectorModal({ current, onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-lg shadow-widget p-8 w-full max-w-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>
        <h2 className="text-lg font-semibold text-foreground mb-6">Choose a Template</h2>
        <div className="grid grid-cols-3 gap-4">
          {templates.map(t => {
            const isSelected = current === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { onSelect(t.id); onClose(); }}
                className={`rounded-lg border-2 p-1 transition-all text-left ${
                  isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="relative h-28 rounded-md overflow-hidden">
                  <MiniCoverPreview templateId={t.id} />
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-2 text-left">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export { MiniCoverPreview };
