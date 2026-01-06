import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { client } from './client';
import { urlFor } from './image';

type SiteSettingsDoc = {
  logo?: SanityImageSource;
  logoAlt?: string;
  backIcon?: SanityImageSource;
  favicon?: SanityImageSource;
};

export type SiteSettings = {
  logoUrl: string | null;
  logoAlt: string | null;
  backIconUrl: string | null;
  faviconUrl: string | null;
};

const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  logo,
  logoAlt,
  backIcon,
  favicon
}`;

export async function getSiteSettings(): Promise<SiteSettings> {
  const doc = await client.fetch<SiteSettingsDoc | null>(siteSettingsQuery);

  if (!doc) {
    return {
      logoUrl: null,
      logoAlt: null,
      backIconUrl: null,
      faviconUrl: null
    };
  }

  return {
    logoUrl: doc.logo ? urlFor(doc.logo).width(360).url() : null,
    logoAlt: doc.logoAlt ?? null,
    backIconUrl: doc.backIcon
      ? urlFor(doc.backIcon).width(28).height(28).fit('crop').url()
      : null,
    faviconUrl: doc.favicon
      ? urlFor(doc.favicon).width(64).height(64).fit('crop').url()
      : null
  };
}
