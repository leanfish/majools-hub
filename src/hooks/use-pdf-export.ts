import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UsePdfExportOptions {
  filename: string;
}

export function usePdfExport({ filename }: UsePdfExportOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const exportPdf = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    setExporting(true);
    toast.info('Generating PDF...');

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      // Get all page cards (direct children that are section cards)
      const pageCards = container.querySelectorAll<HTMLElement>('[data-pdf-page]');
      if (pageCards.length === 0) {
        toast.error('No pages found to export');
        setExporting(false);
        return;
      }

      // Use A4 dimensions in points
      const PDF_WIDTH = 595.28;
      const PDF_HEIGHT = 841.89;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      for (let i = 0; i < pageCards.length; i++) {
        const card = pageCards[i];

        const canvas = await html2canvas(card, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgWidth = PDF_WIDTH;
        const imgHeight = (canvas.height / canvas.width) * PDF_WIDTH;

        if (i > 0) pdf.addPage();

        // Center vertically if shorter than page, otherwise fit to page
        if (imgHeight <= PDF_HEIGHT) {
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        } else {
          const scaledHeight = PDF_HEIGHT;
          const scaledWidth = (canvas.width / canvas.height) * PDF_HEIGHT;
          pdf.addImage(imgData, 'JPEG', 0, 0, scaledWidth, scaledHeight);
        }
      }

      pdf.save(`${filename}.pdf`);
      toast.success('PDF downloaded');
    } catch (err) {
      console.error('PDF export failed:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  }, [filename]);

  return { containerRef, exporting, exportPdf };
}
