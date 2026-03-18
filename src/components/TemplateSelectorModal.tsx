import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { templates, type TemplateId } from '@/lib/templates';

interface Props {
  current: TemplateId;
  onSelect: (id: TemplateId) => void;
  onClose: () => void;
}

const thumbnailStyles: Record<TemplateId, { bg: string; accent: string; label: string }> = {
  classic: { bg: 'bg-white', accent: 'bg-gray-200', label: 'Clean & minimal' },
  modern: { bg: 'bg-white', accent: 'bg-[#3DCEE9]', label: 'Bold & design-forward' },
  branded: { bg: 'bg-gray-900', accent: 'bg-[#3DCEE9]', label: 'Premium deliverable' },
};

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
            const style = thumbnailStyles[t.id];
            const isSelected = current === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { onSelect(t.id); onClose(); }}
                className={`rounded-lg border-2 p-1 transition-all ${
                  isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                }`}
              >
                {/* Mini preview thumbnail */}
                <div className={`${style.bg} rounded-md h-32 p-3 flex flex-col gap-2 relative`}>
                  <div className={`${style.accent} h-2 w-16 rounded-full`} />
                  <div className={`${style.accent} h-1.5 w-24 rounded-full opacity-40`} />
                  <div className={`${style.accent} h-1.5 w-20 rounded-full opacity-40`} />
                  <div className="mt-auto flex gap-1">
                    <div className={`${style.accent} h-1 w-8 rounded-full opacity-30`} />
                    <div className={`${style.accent} h-1 w-6 rounded-full opacity-30`} />
                  </div>
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
