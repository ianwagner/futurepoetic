import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { notFound } from 'next/navigation';
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

const xineSlugsQuery = `*[_type == "xine" && defined(slug.current)]{
  "slug": slug.current
}`;

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

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(xineSlugsQuery);
  return slugs
    .map((item) => item.slug)
    .filter(Boolean)
    .map((slug) => ({ slug }));
}

export default async function XinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await client.fetch<XineDoc | null>(xineQuery, {
    slug,
  });

  if (!doc) {
    notFound();
  }

  return <XineViewerClient xine={toXine(doc)} />;
}
