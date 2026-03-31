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
    <main className="min-h-[100svh] bg-black text-white flex flex-col pb-14">
      {/* Header — below fixed global nav */}
      <div className="mt-14 px-6 py-3 border-b border-white/10">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-sm font-medium tracking-wide text-white/90">
            {entry.title}
          </h1>
          <div className="flex items-center gap-3 shrink-0">
            <span
              className="text-[10px] font-medium uppercase tracking-[0.2em]"
              style={{ color: entry.accentColor || '#fff' }}
            >
              {String(entry.dayNumber).padStart(3, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-white/30">
              {formattedDate}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
          {entry.subtitle}
        </p>
      </div>

      {/* Rendered UI */}
      <div className="flex-1">
        {entry.htmlCode ? (
          <iframe
            srcDoc={entry.htmlCode}
            sandbox="allow-scripts"
            className="w-full border-0"
            style={{ height: 'calc(100svh - 160px)', minHeight: '500px' }}
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
