import dynamic from 'next/dynamic';
import Head from 'next/head';

const CardIntro = dynamic(() => import('../components/CardIntro'), { ssr: false });

export default function MiddleArchive() {
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
