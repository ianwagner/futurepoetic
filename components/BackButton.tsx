'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

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
      Back
    </button>
  );
}
