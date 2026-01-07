import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import BackButtonClient from '../components/BackButtonClient';
import SiteSettingsProvider from '../components/SiteSettingsProvider';
import { getSiteSettings } from '@/sanity/lib/siteSettings';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: 'Future Poetic',
    description: 'Future Poetic site and xine viewer',
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
      <body className={`${jetbrainsMono.className} ${jetbrainsMono.variable} antialiased`}>
        <SiteSettingsProvider settings={settings}>
          <BackButtonClient />
          {children}
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
