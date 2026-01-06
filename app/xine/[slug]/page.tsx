import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import XineViewerClient from '@/components/xine/XineViewerClient';
import type { Xine } from '@/components/xine/XineViewerClient';

type XineDoc = {
  _id: string;
  title: string;
  slug?: { current?: string };
  issueNumber?: number;
  description?: string;
  coverImage?: SanityImageSource;
  backCoverImage?: SanityImageSource;
  pages?: SanityImageSource[];
  publishedAt?: string;
};

const xineQuery = `*[_type == "xine" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  issueNumber,
  description,
  coverImage,
  backCoverImage,
  pages,
  publishedAt
}`;

const xineSlugsQuery = `*[_type == "xine" && defined(slug.current)]{
  "slug": slug.current
}`;

const buildImageUrl = (source?: SanityImageSource | null) =>
  source ? urlFor(source).width(800).height(1200).fit('crop').url() : null;

const toXine = (doc: XineDoc): Xine => ({
  id: doc._id,
  title: doc.title,
  slug: doc.slug?.current ?? '',
  issueNumber: doc.issueNumber,
  description: doc.description,
  coverUrl: buildImageUrl(doc.coverImage),
  backCoverUrl: buildImageUrl(doc.backCoverImage),
  pageUrls: (doc.pages ?? [])
    .map((page) => buildImageUrl(page))
    .filter((page): page is string => Boolean(page)),
});

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch<Array<{ slug?: string }>>(xineSlugsQuery);
    return slugs
      .map((entry) => entry.slug)
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export default async function XinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let xine: Xine | null = null;
  let loadError: string | null = null;

  try {
    const doc = await client.fetch<XineDoc | null>(xineQuery, {
      slug,
    });
    xine = doc ? toXine(doc) : null;
  } catch {
    loadError = 'Unable to load this xine right now.';
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-background text-foreground px-6 py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-10 text-center text-sm text-red-100">
            {loadError}
          </div>
        </div>
      </main>
    );
  }

  if (!xine) {
    return (
      <main className="min-h-screen bg-background text-foreground px-6 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
          <p className="text-sm text-white/60">
            This xine could not be found.
          </p>
          <Link
            href="/xine-library"
            className="text-xs uppercase tracking-[0.4em] text-white/70 hover:text-white"
          >
            Back to library
          </Link>
        </div>
      </main>
    );
  }

  return <XineViewerClient xine={xine} />;
}
