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
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <div className="flex items-center gap-6">
          <Link
            href="/plastic/"
            className="text-xs uppercase tracking-wider text-white/40 hover:text-white/70 transition-colors"
          >
            &larr; Back
          </Link>
          <div>
            <h1 className="text-base font-medium tracking-wide text-white/90">
              {entry.title}
            </h1>
            <p className="text-[11px] text-white/40 mt-1 max-w-lg leading-relaxed">
              {entry.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {entry.tags && entry.tags.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1.5">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <span
            className="text-[10px] font-medium uppercase tracking-[0.2em]"
            style={{ color: entry.accentColor || '#fff' }}
          >
            Day {String(entry.dayNumber).padStart(3, '0')}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-white/30">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Rendered UI */}
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
    </main>
  );
}
