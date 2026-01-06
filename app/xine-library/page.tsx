/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';
import Link from 'next/link';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';

type XineDoc = {
  _id: string;
  title: string;
  slug?: { current?: string };
  issueNumber?: number;
  coverImage?: SanityImageSource;
  publishedAt?: string;
};

type Xine = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
};

const xinesQuery = `*[_type == "xine" && defined(slug.current)] | order(issueNumber asc, publishedAt desc) {
  _id,
  title,
  slug,
  issueNumber,
  coverImage,
  publishedAt
}`;

const buildImageUrl = (source?: SanityImageSource | null) =>
  source ? urlFor(source).width(800).height(1200).fit('crop').url() : null;

const toXine = (doc: XineDoc): Xine => ({
  id: doc._id,
  title: doc.title,
  slug: doc.slug?.current ?? '',
  coverUrl: buildImageUrl(doc.coverImage),
});

const handleImgError = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.style.opacity = '0';
  event.currentTarget.setAttribute('data-error', 'true');
};

export default function XineLibraryPage() {
  const [xines, setXines] = useState<Xine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadXines = async () => {
      try {
        const docs = await client.fetch<XineDoc[]>(xinesQuery);
        if (!isActive) return;
        setXines(docs.map(toXine).filter((xine) => xine.slug));
        setLoadError(null);
      } catch {
        if (!isActive) return;
        setLoadError('Unable to load xines right now.');
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    };

    loadXines();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        {isLoading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-sm text-white/60">
            Loading xines...
          </div>
        ) : loadError ? (
          <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-10 text-center text-sm text-red-100">
            {loadError}
          </div>
        ) : xines.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-sm text-white/60">
            No xines published yet.
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {xines.map((xine) => (
              <Link
                key={xine.id}
                href={`/xine/${xine.slug}`}
                aria-label={`View ${xine.title}`}
                className="group flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <div className="w-full max-w-[220px] shadow-xl transition-transform duration-300 group-hover:-translate-y-1 aspect-[8.5/11]">
                  {xine.coverUrl ? (
                    <img
                      src={xine.coverUrl}
                      alt={`${xine.title} cover`}
                      className="h-full w-full object-contain"
                      onError={handleImgError}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/5 text-[10px] uppercase tracking-[0.3em] text-white/40">
                      No cover
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
