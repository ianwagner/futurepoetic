'use client';

import { useEffect } from 'react';
import CardIntro from '../../components/CardIntro';

export default function MiddleArchivePage() {
  useEffect(() => {
    const path = window.location.pathname;
    if (!path.endsWith('/')) {
      window.location.replace(`${path}/`);
    }
  }, []);

  return (
    <div className="min-h-[100svh] bg-black text-white flex items-center justify-center">
      <CardIntro />
    </div>
  );
}
