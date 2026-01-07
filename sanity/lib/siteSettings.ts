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

type SiteSettingsOptions = {
  useCdn?: boolean;
};

const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  logo,
  logoAlt,
  backIcon,
  favicon
}`;

function buildSettings(doc: SiteSettingsDoc | null): SiteSettings {
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
      ? urlFor(doc.backIcon).width(32).fit('max').url()
      : null,
    faviconUrl: doc.favicon
      ? urlFor(doc.favicon).width(64).height(64).fit('crop').url()
      : null
  };
}

export async function getSiteSettings(
  options: SiteSettingsOptions = {}
): Promise<SiteSettings> {
  const settingsClient =
    options.useCdn === false ? client.withConfig({ useCdn: false }) : client;
  const doc = await settingsClient.fetch<SiteSettingsDoc | null>(
    siteSettingsQuery,
  );
  return buildSettings(doc);
}
