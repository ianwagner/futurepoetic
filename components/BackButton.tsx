'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSiteSettings } from './SiteSettingsProvider';

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const settings = useSiteSettings();
  const backIconUrl = settings?.backIconUrl ?? null;

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/');
  }, [router]);

  if (!pathname || pathname === '/') return null;

  return (
    <button
      type="button"
      onClick={handleBack}
      className="fixed left-6 top-6 z-40 inline-flex items-center rounded-full border border-white/40 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80 backdrop-blur transition hover:border-white/70 hover:text-white hover:bg-black/60"
      aria-label="Go back"
    >
      {backIconUrl ? (
        <>
          <img
            src={backIconUrl}
            alt=""
            aria-hidden="true"
            className="h-4 w-4"
          />
          <span className="sr-only">Back</span>
        </>
      ) : (
        'Back'
      )}
    </button>
  );
}
/* eslint-disable @next/next/no-img-element */
