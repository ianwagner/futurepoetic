import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect } from 'react';

const CardIntro = dynamic(() => import('../components/CardIntro'), { ssr: false });

export default function MiddleArchive() {
  // Ensure the page is always served from a trailing slash URL so
  // relative asset paths resolve correctly when hosted statically.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (!path.endsWith('/')) {
        window.location.replace(`${path}/`);
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>Middle Archive</title>
      </Head>
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <CardIntro />
      </div>
    </>
  );
}
