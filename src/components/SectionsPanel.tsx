import { useState } from 'react';
import { GripVertical, X, Plus, Lock, FileText, BookOpen } from 'lucide-react';
import type { ProposalSection, SectionType } from '@/lib/mock-data';
import { ALL_SECTION_TYPES } from '@/lib/mock-data';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const FIXED_TYPES = new Set<SectionType>(['cover', 'cover-letter', 'table-of-contents', 'back-page']);

const getSectionNavLabel = (section: ProposalSection) => {
  if (section.type === 'executive-summary') return 'Summary';
  if (section.type === 'terms') return 'Terms';
  if (section.type === 'table-of-contents') return 'TOC';
  if (section.type === 'cover-letter') return 'Cover Letter';
  if (section.type === 'back-page') return 'Back Page';
  if (section.type === 'about-us') return 'About Us';
  return section.title;
};

interface SectionsPanelProps {
  sections: ProposalSection[];
  activeSection: number;
  onSetActive: (index: number) => void;
  onReorder: (sections: ProposalSection[], newActiveIndex: number) => void;
  onDelete: (index: number) => void;
  onAdd: (type: SectionType, title: string) => void;
  readOnly?: boolean;
}

export default function SectionsPanel({
  sections, activeSection, onSetActive, onReorder, onDelete, onAdd, readOnly,
}: SectionsPanelProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [customName, setCustomName] = useState('');

  const isFixed = (s: ProposalSection) => FIXED_TYPES.has(s.type);

  const moveSection = (from: number, to: number) => {
    const fromSection = sections[from];
    const toSection = sections[to];
    // Don't allow moving fixed sections or moving into fixed positions
    if (isFixed(fromSection) || isFixed(toSection)) return;
    // Don't allow moving before cover-letter/toc or after back-page
    const coverLetterIdx = sections.findIndex(s => s.type === 'cover-letter');
    const tocIdx = sections.findIndex(s => s.type === 'table-of-contents');
    const backPageIdx = sections.findIndex(s => s.type === 'back-page');
    const minMovable = Math.max(coverLetterIdx, tocIdx) + 1;
    const maxMovable = backPageIdx >= 0 ? backPageIdx - 1 : sections.length - 1;
    if (to < minMovable || to > maxMovable) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(from, 1);
    newSections.splice(to, 0, moved);
    const newActive = activeSection === from ? to : activeSection;
    onReorder(newSections, newActive);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    moveSection(dragIdx, idx);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const existingTypes = new Set(sections.map(s => s.type));
  const availableSections = ALL_SECTION_TYPES.filter(
    s => s.type !== 'cover' && !existingTypes.has(s.type)
  );

  const handleAddSection = (type: SectionType, title: string) => {
    onAdd(type, title);
    setShowAddPicker(false);
    setCustomName('');
  };

  return (
    <div className="bg-card rounded-lg shadow-widget p-4 space-y-1 h-fit">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
        Sections
      </h3>
      {sections.map((s, i) => {
        const fixed = isFixed(s);
        return (
          <div
            key={s.id}
            draggable={!fixed && !readOnly}
            onDragStart={() => !fixed && handleDragStart(i)}
            onDragOver={e => handleDragOver(e, i)}
            onDragEnd={handleDragEnd}
            onClick={() => onSetActive(i)}
            className={`group flex items-center gap-1 px-2 py-2 rounded-md text-sm cursor-pointer transition-colors ${
              i === activeSection
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground hover:bg-secondary'
            } ${s.type === 'cover' ? 'border-b border-border mb-1' : ''}`}
          >
            {fixed ? (
              <Lock size={12} className="text-muted-foreground flex-shrink-0" />
            ) : (
              <GripVertical size={14} className={`text-muted-foreground flex-shrink-0 ${readOnly ? '' : 'cursor-grab'}`} />
            )}
            <span className="min-w-0 flex-1 whitespace-normal break-words leading-snug text-[13px]">
              {getSectionNavLabel(s)}
            </span>
            {!fixed && !readOnly && s.type !== 'cover' && (
              <button
                onClick={e => { e.stopPropagation(); setDeleteIdx(i); }}
                className="p-0.5 rounded hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                title="Remove section"
              >
                <X size={12} />
              </button>
            )}
            {/* Allow removing fixed sections except cover */}
            {fixed && s.type !== 'cover' && !readOnly && (
              <button
                onClick={e => { e.stopPropagation(); setDeleteIdx(i); }}
                className="p-0.5 rounded hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                title="Remove section"
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}

      {/* Add Section */}
      {!readOnly && (
        <Popover open={showAddPicker} onOpenChange={setShowAddPicker}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-3 w-full px-2 py-1.5">
              <Plus size={14} /> Add Section
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2" align="start">
            <div className="space-y-1">
              {availableSections.map(s => (
                <button
                  key={s.type}
                  onClick={() => handleAddSection(s.type, s.title)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                >
                  {s.title}
                </button>
              ))}
              <div className="border-t border-border pt-2 mt-2">
                <p className="text-xs text-muted-foreground px-3 mb-1">Custom Section</p>
                <div className="flex gap-1 px-1">
                  <input
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="Section name"
                    className="flex-1 h-8 px-2 rounded-md border border-input bg-background text-sm"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && customName.trim()) {
                        handleAddSection('custom', customName.trim());
                      }
                    }}
                  />
                  <Button size="sm" className="h-8" disabled={!customName.trim()} onClick={() => handleAddSection('custom', customName.trim())}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deleteIdx !== null} onOpenChange={open => { if (!open) setDeleteIdx(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this section?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteIdx !== null ? sections[deleteIdx]?.title : ''}" will be removed from this proposal. You can add it back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteIdx !== null) {
                  onDelete(deleteIdx);
                  setDeleteIdx(null);
                }
              }}
            >
              Yes, remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
