'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../sanity.config';

export default function StudioClient() {
  if (!config) {
    return (
      <div className="m-6 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Set `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` to
        enable the Studio.
      </div>
    );
  }
  return <NextStudio config={config} />;
}
