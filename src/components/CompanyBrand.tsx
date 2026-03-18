import { getSettings } from '@/lib/settings-store';

interface Props {
  className?: string;
  imgClassName?: string;
  textClassName?: string;
}

/**
 * Renders company logo image OR company name text — never both.
 * Falls back to nothing if neither is set.
 */
export default function CompanyBrand({ className = '', imgClassName = 'h-8', textClassName = 'text-lg font-bold tracking-[0.08em] uppercase' }: Props) {
  const { companyLogo, companyName } = getSettings();

  if (companyLogo) {
    return <img src={companyLogo} alt={companyName || 'Company'} className={`${imgClassName} ${className}`} />;
  }

  if (companyName) {
    return <span className={`${textClassName} ${className}`}>{companyName}</span>;
  }

  return null;
}
