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
          <div className="min-h-[100svh] flex flex-col">
            <div className="fixed left-6 top-6 z-50 flex items-center gap-2">
              <BackButtonClient />
              <a
                href="https://ianwagner.co/contact"
                aria-label="Contact Ian Wagner"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#F78326] hover:text-[#F78326]"
              >
                <svg
                  className="h-[18px] w-[18px]"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </a>
            </div>
            <div className="flex-1">
              {children}
            </div>
            <footer className="fixed bottom-0 left-0 right-0 z-50 w-full border-t border-white/10 bg-black/80 px-6 py-3 text-[0.7rem] uppercase tracking-[0.16em] text-white/60 font-mono backdrop-blur">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>© 2026 Ian Wagner</span>
                <span className="sm:text-center">
                  Designed and built by{' '}
                  <a
                    href="https://www.studiotak.co"
                    className="text-[#F78326] hover:text-[#ff9a4a] transition-colors"
                  >
                    Studio Tak
                  </a>
                </span>
              </div>
            </footer>
          </div>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
