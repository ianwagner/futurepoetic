'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { getSiteSettings, type SiteSettings } from '@/sanity/lib/siteSettings';

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
  const [currentSettings, setCurrentSettings] = useState(settings);

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  useEffect(() => {
    let isActive = true;

    const loadLatestSettings = async () => {
      try {
        const latest = await getSiteSettings({ useCdn: false });
        if (isActive) setCurrentSettings(latest);
      } catch {
        // Keep the build-time settings if the live fetch fails.
      }
    };

    loadLatestSettings();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <SiteSettingsContext.Provider value={currentSettings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
