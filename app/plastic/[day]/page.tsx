'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { client } from '@/sanity/lib/client';

type PlasticEntry = {
  _id: string;
  title: string;
  subtitle: string;
  date: string;
  dayNumber: number;
  tags?: string[];
  accentColor?: string;
  htmlCode?: string;
};

export default function PlasticDetailPage() {
  const params = useParams();
  const day = params.day as string;

  const [entry, setEntry] = useState<PlasticEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const doc = await client.fetch<PlasticEntry | null>(
          `*[_type == "plastic" && dayNumber == $day][0] {
            _id, title, subtitle, date, dayNumber, tags, accentColor, htmlCode
          }`,
          { day: parseInt(day, 10) }
        );
        if (!isActive) return;
        if (!doc) {
          setLoadError('Entry not found.');
        } else {
          setEntry(doc);
        }
      } catch {
        if (!isActive) return;
        setLoadError('Unable to load this entry.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, [day]);

  if (isLoading) {
    return (
      <main className="min-h-[100svh] bg-black text-white flex items-center justify-center">
        <p className="text-sm text-white/40">Loading...</p>
      </main>
    );
  }

  if (loadError || !entry) {
    return (
      <main className="min-h-[100svh] bg-black text-white flex items-center justify-center">
        <p className="text-sm text-red-300">{loadError || 'Not found.'}</p>
      </main>
    );
  }

  const formattedDate = new Date(entry.date + 'T00:00:00').toLocaleDateString(
    'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  return (
    <main className="h-[100svh] bg-black text-white flex flex-col overflow-hidden">
      {/* Full-screen UI */}
      <div className="flex-1 relative">
        {entry.htmlCode ? (
          <iframe
            srcDoc={entry.htmlCode}
            sandbox="allow-scripts"
            className="absolute inset-0 w-full h-full border-0"
            title={entry.title}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-white/30">
              No UI generated for this entry.
            </p>
          </div>
        )}
      </div>

      {/* Floating controls — bottom left */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
        <Link
          href="/plastic/"
          className="rounded-full bg-black/70 backdrop-blur-sm border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/50 hover:text-white/90 hover:border-white/30 transition-all"
        >
          &larr;
        </Link>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="rounded-full bg-black/70 backdrop-blur-sm border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/50 hover:text-white/90 hover:border-white/30 transition-all"
        >
          {showInfo ? 'Hide' : 'Info'}
        </button>
      </div>

      {/* Floating day badge — bottom right */}
      <div className="absolute bottom-4 right-4 z-10">
        <span
          className="rounded-full bg-black/70 backdrop-blur-sm border border-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em]"
          style={{ color: entry.accentColor || '#fff' }}
        >
          {String(entry.dayNumber).padStart(3, '0')}
        </span>
      </div>

      {/* Info panel — slides up from bottom */}
      {showInfo && (
        <div className="absolute bottom-14 left-4 z-10 max-w-sm rounded-xl bg-black/80 backdrop-blur-md border border-white/10 p-4">
          <h1 className="text-sm font-medium tracking-wide text-white/90">
            {entry.title}
          </h1>
          <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
            {entry.subtitle}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-[9px] uppercase tracking-wider text-white/25">
              {formattedDate}
            </span>
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-white/25"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
