/* eslint-disable @next/next/no-img-element */
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
    router.push('/');
  }, [router]);

  if (!pathname || pathname === '/') return null;

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex h-9 items-center rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/80 backdrop-blur transition hover:border-[#F78326] hover:text-[#F78326] hover:bg-black/60"
      aria-label="Go back"
    >
      {backIconUrl ? (
        <>
          <img
            src={backIconUrl}
            alt=""
            aria-hidden="true"
            className="h-7 w-7 object-contain"
          />
          <span className="sr-only">Back</span>
        </>
      ) : (
        'Back'
      )}
    </button>
  );
}
