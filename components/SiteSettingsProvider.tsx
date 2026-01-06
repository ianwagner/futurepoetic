'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { SiteSettings } from '@/sanity/lib/siteSettings';

type SiteSettingsContextValue = SiteSettings | null;

const SiteSettingsContext = createContext<SiteSettingsContextValue>(null);

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

type SiteSettingsProviderProps = {
  settings: SiteSettings;
  children: ReactNode;
};

export default function SiteSettingsProvider({
  settings,
  children
}: SiteSettingsProviderProps) {
  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
