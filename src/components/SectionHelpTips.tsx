import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SectionType } from '@/lib/mock-data';

const tips: Record<string, { description: string; bullets: string[] }> = {
  cover: {
    description: 'The first thing your client sees. Set the tone for the entire proposal.',
    bullets: [
      'Make the project title clear and specific.',
      'Use your client\'s company name exactly as they use it.',
      'Include a date so the proposal feels current.',
      'Your company name builds trust - make sure it\'s prominent.',
    ],
  },
  'executive-summary': {
    description: 'A concise overview of the entire proposal. Clients often decide here.',
    bullets: [
      'Keep to 2-3 paragraphs.',
      'State the problem, your solution, and why you\'re the right person.',
      'Write it last even though it appears first.',
      'Avoid jargon - write for a decision-maker, not a technician.',
    ],
  },
  scope: {
    description: 'Defines exactly what is and is not included in your work.',
    bullets: [
      'Be specific about what is and is not included.',
      'Vague scope leads to scope creep.',
      'If it\'s not written here, it\'s not included.',
      'Use bullet points for clarity.',
    ],
  },
  deliverables: {
    description: 'Concrete, tangible outputs your client will receive.',
    bullets: [
      'List concrete tangible outputs.',
      'Not "design work" but "5-page website with mobile responsive design and contact form."',
      'Quantify wherever possible.',
      'Group related deliverables together.',
    ],
  },
  timeline: {
    description: 'When things will happen and how long each phase takes.',
    bullets: [
      'Break into phases with names and estimated durations.',
      'Build in buffer time.',
      'Include milestones for client review.',
      'Note any dependencies on client feedback.',
    ],
  },
  investment: {
    description: 'Your pricing, presented clearly and confidently.',
    bullets: [
      'Present pricing clearly and confidently.',
      'Include a note about what happens if scope changes.',
      'Consider offering payment milestones.',
      'Avoid apologetic language around price.',
    ],
  },
  terms: {
    description: 'The legal and business terms that protect both parties.',
    bullets: [
      'Be clear about payment terms, revision limits, and cancellation policy.',
      'Specify net 30, on receipt, or milestone-based payment.',
      'Define what counts as a "revision."',
      'Include intellectual property transfer terms.',
    ],
  },
};

interface Props {
  sectionType: SectionType;
  onClose: () => void;
}

export default function SectionHelpTips({ sectionType, onClose }: Props) {
  const tip = tips[sectionType];

  if (!tip) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
        className="fixed right-0 top-0 bottom-0 w-80 bg-card border-l border-border shadow-lg z-40 flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Writing Tips</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-5 py-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
          <ul className="space-y-2.5">
            {tip.bullets.map((b, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground">
                <span className="text-primary mt-0.5 flex-shrink-0">&#8226;</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-5 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
