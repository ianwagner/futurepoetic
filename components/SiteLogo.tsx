'use client';

import { useSiteSettings } from './SiteSettingsProvider';

type SiteLogoProps = {
  fallbackText?: string;
  textClassName?: string;
  imageClassName?: string;
};

export default function SiteLogo({
  fallbackText = 'Future Poetic',
  textClassName,
  imageClassName
}: SiteLogoProps) {
  const settings = useSiteSettings();
  const logoUrl = settings?.logoUrl ?? null;
  const logoAlt = settings?.logoAlt ?? fallbackText;

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={logoAlt}
        className={imageClassName}
      />
    );
  }

  return <span className={textClassName}>{fallbackText}</span>;
}
