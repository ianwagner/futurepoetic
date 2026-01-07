import { client } from '@/sanity/lib/client';
import XinePageClient from '@/components/xine/XinePageClient';

const xineSlugsQuery = `*[_type == "xine" && defined(slug.current)]{
  "slug": slug.current
}`;

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
  return <XinePageClient slug={slug} />;
}
