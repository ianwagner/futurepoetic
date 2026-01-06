import SiteLogo from '@/components/SiteLogo';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-4xl sm:text-5xl tracking-tight mb-6">
          <SiteLogo imageClassName="mx-auto h-12 w-auto" />
        </h1>
        <div className="flex flex-col items-center gap-3">
          <a
            href="/timeline/"
            className="px-5 py-3 rounded-md bg-white text-black text-sm uppercase tracking-wide"
          >
            Timeline
          </a>
          <a
            href="/zine-viewer/"
            className="px-5 py-3 rounded-md bg-white text-black text-sm uppercase tracking-wide"
          >
            View Zine
          </a>
          <a
            href="/note.html"
            className="px-5 py-3 rounded-md bg-white text-black text-sm uppercase tracking-wide"
          >
            Note to Self
          </a>
          <a
            href="mailto:info@studiotak.co"
            className="px-5 py-3 rounded-md bg-white text-black text-sm uppercase tracking-wide"
          >
            Contact
          </a>
        </div>
      </div>
    </main>
  );
}
