import { useState, useEffect } from 'react';
import { X, Clock, FileText, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { getProposalVersions, getProposal } from '@/lib/api';
import type { Proposal } from '@/lib/mock-data';
import type { TemplateId } from '@/lib/templates';
import ProposalPreview from './ProposalPreview';

interface VersionHistoryDrawerProps {
  proposalId: string;
  open: boolean;
  onClose: () => void;
}

const statusLabel: Record<string, string> = {
  sent: 'Sent', draft: 'Draft', accepted: 'Accepted', viewed: 'Viewed', declined: 'Declined',
};

export default function VersionHistoryDrawer({ proposalId, open, onClose }: VersionHistoryDrawerProps) {
  const [versions, setVersions] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewingVersion, setViewingVersion] = useState<Proposal | null>(null);

  useEffect(() => {
    if (open && proposalId) {
      setLoading(true);
      getProposalVersions(proposalId)
        .then(setVersions)
        .finally(() => setLoading(false));
    }
  }, [open, proposalId]);

  const handleViewVersion = async (versionId: string) => {
    try {
      const p = await getProposal(versionId);
      setViewingVersion(p);
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Drawer overlay + panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-foreground/20"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-card border-l border-border shadow-xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Version History</h2>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-2">
                {loading ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
                ) : versions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No version history</p>
                ) : (
                  versions.map(v => {
                    const isCurrent = v.id === proposalId;
                    return (
                      <button
                        key={v.id}
                        onClick={() => !isCurrent && handleViewVersion(v.id)}
                        className={`w-full text-left rounded-lg border p-3 transition-colors ${
                          isCurrent
                            ? 'border-primary bg-primary/5 cursor-default'
                            : 'border-border hover:border-primary/50 hover:bg-secondary cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <FileText size={13} className="text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">v{v.version || 1}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">Current</span>
                            )}
                          </div>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            v.status === 'draft' ? 'bg-secondary text-muted-foreground' : 'bg-primary/20 text-primary'
                          }`}>
                            {statusLabel[v.status] || v.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {v.sentAt
                            ? `Sent ${format(new Date(v.sentAt), 'MMM d, yyyy')}`
                            : `Created ${format(new Date(v.createdAt), 'MMM d, yyyy')}`}
                        </p>
                        {!isCurrent && (
                          <p className="text-[10px] text-primary mt-1 flex items-center gap-1">
                            <Eye size={10} /> View this version
                          </p>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Version preview modal overlay */}
      <AnimatePresence>
        {viewingVersion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col bg-background"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <Eye size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Version {viewingVersion.version || 1} — Read Only
                </span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  viewingVersion.status === 'draft' ? 'bg-secondary text-muted-foreground' : 'bg-primary/20 text-primary'
                }`}>
                  {statusLabel[viewingVersion.status] || viewingVersion.status}
                </span>
              </div>
              <button onClick={() => setViewingVersion(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-muted/30">
              <div className="max-w-3xl mx-auto my-8">
                <ProposalPreview
                  sections={viewingVersion.sections}
                  template={(viewingVersion.template as TemplateId) || 'classic'}
                  companyName={viewingVersion.sections.find(s => s.type === 'cover')?.coverData?.companyName}
                  version={viewingVersion.version}
                  sentAt={viewingVersion.sentAt}
                  proposalTitle={viewingVersion.title}
                  clientName={viewingVersion.client}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
