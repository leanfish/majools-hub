import { motion } from 'framer-motion';
import { Mail, HelpCircle } from 'lucide-react';
import BreadcrumbBar from '@/components/BreadcrumbBar';

export default function Help() {
  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      <BreadcrumbBar items={['Dashboard', 'Help']} />
      <div className="max-w-[600px] mx-auto p-8">
        <h1 className="text-2xl font-semibold text-foreground mb-8">Help & Support</h1>
        <div className="bg-card rounded-lg shadow-widget p-8 space-y-6">
          <div className="flex items-start gap-4">
            <HelpCircle size={24} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Need help?</h2>
              <p className="text-sm text-muted-foreground">If you have questions, feedback, or need support, reach out to our team.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-md bg-background border border-border">
            <Mail size={18} className="text-primary" />
            <a href="mailto:hello@majools.com" className="text-sm font-medium text-primary hover:underline">hello@majools.com</a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
