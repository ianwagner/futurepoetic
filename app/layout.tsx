import type { Metadata } from 'next';
import { Rubik_Mono_One } from 'next/font/google';
import './globals.css';
import BackButton from '../components/BackButton';
import SiteSettingsProvider from '../components/SiteSettingsProvider';
import { getSiteSettings } from '@/sanity/lib/siteSettings';

const rubikMono = Rubik_Mono_One({
  weight: '400',
  subsets: ['latin']
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: 'Future Poetic',
    description: 'Future Poetic site and zine viewer',
    icons: settings.faviconUrl ? { icon: settings.faviconUrl } : undefined
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en">
      <body className={`${rubikMono.className} antialiased`}>
        <SiteSettingsProvider settings={settings}>
          <BackButton />
          {children}
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
