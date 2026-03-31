'use client';

import { useEffect, useState } from 'react';
import { client } from '@/sanity/lib/client';
import PlasticCard from '@/components/plastic/PlasticCard';

type PlasticEntry = {
  _id: string;
  title: string;
  subtitle: string;
  date: string;
  dayNumber: number;
  tags?: string[];
  accentColor?: string;
};

const plasticQuery = `*[_type == "plastic"] | order(dayNumber desc) {
  _id,
  title,
  subtitle,
  date,
  dayNumber,
  tags,
  accentColor
}`;

export default function PlasticPage() {
  const [entries, setEntries] = useState<PlasticEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadEntries = async () => {
      try {
        const docs = await client.fetch<PlasticEntry[]>(plasticQuery);
        if (!isActive) return;
        setEntries(docs);
        setLoadError(null);
      } catch {
        if (!isActive) return;
        setLoadError('Unable to load entries right now.');
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    };

    loadEntries();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="min-h-[100svh] bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12">
          <h1 className="text-2xl font-light tracking-wide text-white/90">
            Plastic
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-white/40 max-w-md">
            A daily experiment in impossible interfaces. Every day, a new UI
            concept that has never existed — and probably shouldn&apos;t.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-sm text-white/40">
            Loading...
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-10 text-center text-sm text-red-100">
            {loadError}
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-sm text-white/40">
            No entries yet. The first one arrives tomorrow.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {entries.map((entry, i) => (
              <PlasticCard
                key={entry._id}
                title={entry.title}
                subtitle={entry.subtitle}
                date={entry.date}
                dayNumber={entry.dayNumber}
                tags={entry.tags}
                accentColor={entry.accentColor}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
