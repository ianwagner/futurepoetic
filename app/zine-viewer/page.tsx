'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SyntheticEvent } from 'react';
import type { SanityImageSource } from '@sanity/image-url/lib/types';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';

type ZineDoc = {
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

type Zine = {
  id: string;
  title: string;
  issueNumber?: number;
  description?: string;
  coverUrl: string | null;
  backCoverUrl: string | null;
  pageUrls: string[];
};

const zinesQuery = `*[_type == "zine"] | order(issueNumber asc, publishedAt desc) {
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

const toZine = (doc: ZineDoc): Zine => ({
  id: doc._id,
  title: doc.title,
  issueNumber: doc.issueNumber,
  description: doc.description,
  coverUrl: buildImageUrl(doc.coverImage),
  backCoverUrl: buildImageUrl(doc.backCoverImage),
  pageUrls: (doc.pages ?? [])
    .map((page) => buildImageUrl(page))
    .filter((page): page is string => Boolean(page)),
});

const handleImgError = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.style.opacity = '0';
  event.currentTarget.setAttribute('data-error', 'true');
};

function ZineBook({ zine }: { zine: Zine }) {
  const coverSrc = zine.coverUrl;
  const backCoverSrc = zine.backCoverUrl ?? coverSrc;
  const pages = zine.pageUrls;
  const getPageSrc = (index: number) => pages[index] ?? null;

  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isBackCover, setIsBackCover] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [openingPhase, setOpeningPhase] = useState<'slide' | 'flip'>('slide');
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);

  const nextPage = () => {
    if (!isOpen) {
      if (isOpening || isReturning) return;
      if (isBackCover) {
        setIsReturning(true);
        return;
      }
      setLeftIndex(0);
      setRightIndex(1);
      setIsBackCover(false);
      setOpeningPhase('slide');
      setIsOpening(true);
      return;
    }
    if (isFlipping || isClosing) return;
    if (rightIndex >= pages.length - 2) {
      setIsClosing(true);
      return;
    }
    setIsFlipping(true);
  };

  const prevPage = () => {
    if (!isOpen || isFlipping || isClosing) return;
    if (leftIndex <= 0) {
      setIsOpen(false);
      setLeftIndex(0);
      setRightIndex(1);
      setIsBackCover(false);
      return;
    }
    setLeftIndex((i) => Math.max(0, i - 1));
    setRightIndex((i) => Math.max(1, i - 1));
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (!isFlipping) return;
    const timer = window.setTimeout(() => {
      if (rightIndex < pages.length - 2) {
        setLeftIndex(rightIndex + 1);
        setRightIndex(rightIndex + 2);
      }
      setIsFlipping(false);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [isFlipping, rightIndex, pages.length]);

  useEffect(() => {
    if (!isOpening) return;
    const phaseTimer = window.setTimeout(() => {
      setOpeningPhase('flip');
    }, 360);
    const timer = window.setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);
      setIsBackCover(false);
    }, 650);
    return () => {
      window.clearTimeout(phaseTimer);
      window.clearTimeout(timer);
    };
  }, [isOpening]);

  useEffect(() => {
    if (!isClosing) return;
    const timer = window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setLeftIndex(0);
      setRightIndex(1);
      setIsBackCover(true);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [isClosing]);

  useEffect(() => {
    if (!isReturning) return;
    const timer = window.setTimeout(() => {
      setIsBackCover(false);
      setIsReturning(false);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [isReturning]);

  const activeCoverSrc = isBackCover ? backCoverSrc : coverSrc;

  return (
    <div className="floating">
      <div
        className={`book-container shadow-xl cursor-pointer ${isOpen || isOpening ? 'open' : 'closed'}`}
        onClick={nextPage}
      >
        {!isOpen && !isOpening && !isReturning && (
          activeCoverSrc ? (
            <img
              src={activeCoverSrc}
              alt={isBackCover ? 'Back cover' : 'Front cover'}
              className="book-page cover"
              onError={handleImgError}
            />
          ) : (
            <div className="book-page cover image-placeholder">
              No cover
            </div>
          )
        )}
        {!isOpen && isReturning && (
          <div className="page-flip returning" aria-hidden="true">
            {backCoverSrc ? (
              <img
                src={backCoverSrc}
                alt=""
                className="page-face front"
                onError={handleImgError}
              />
            ) : (
              <div className="page-face front image-placeholder" />
            )}
            {coverSrc ? (
              <img
                src={coverSrc}
                alt=""
                className="page-face back"
                onError={handleImgError}
              />
            ) : (
              <div className="page-face back image-placeholder" />
            )}
          </div>
        )}
        {isOpening && (
          <>
            {openingPhase === 'flip' && (
              getPageSrc(rightIndex) ? (
                <img
                  src={getPageSrc(rightIndex) ?? ''}
                  alt={`Page ${rightIndex}`}
                  className="book-page right under"
                  onError={handleImgError}
                />
              ) : (
                <div className="book-page right under image-placeholder" />
              )
            )}
            <div className="page-flip right opening" aria-hidden="true">
              {activeCoverSrc ? (
                <img
                  src={activeCoverSrc}
                  alt=""
                  className="page-face front"
                  onError={handleImgError}
                />
              ) : (
                <div className="page-face front image-placeholder" />
              )}
              {getPageSrc(leftIndex) ? (
                <img
                  src={getPageSrc(leftIndex) ?? ''}
                  alt=""
                  className="page-face back"
                  onError={handleImgError}
                />
              ) : (
                <div className="page-face back image-placeholder" />
              )}
            </div>
          </>
        )}
        {isOpen && (
          <>
            {getPageSrc(leftIndex) ? (
              <img
                src={getPageSrc(leftIndex) ?? ''}
                alt={`Page ${leftIndex}`}
                className="book-page left"
                onError={handleImgError}
              />
            ) : (
              <div className="book-page left image-placeholder" />
            )}
            {getPageSrc(rightIndex + 2) ? (
              <img
                src={getPageSrc(rightIndex + 2) ?? ''}
                alt={`Page ${rightIndex + 2}`}
                className="book-page right under"
                onError={handleImgError}
              />
            ) : (
              <div className="book-page right under image-placeholder" />
            )}
            {isFlipping || isClosing ? (
              <div className="page-flip right flipping" aria-hidden="true">
                {getPageSrc(rightIndex) ? (
                  <img
                    src={getPageSrc(rightIndex) ?? ''}
                    alt=""
                    className="page-face front"
                    onError={handleImgError}
                  />
                ) : (
                  <div className="page-face front image-placeholder" />
                )}
                {isClosing ? (
                  backCoverSrc ? (
                    <img
                      src={backCoverSrc}
                      alt=""
                      className="page-face back"
                      onError={handleImgError}
                    />
                  ) : (
                    <div className="page-face back image-placeholder" />
                  )
                ) : getPageSrc(rightIndex + 1) ? (
                  <img
                    src={getPageSrc(rightIndex + 1) ?? ''}
                    alt=""
                    className="page-face back"
                    onError={handleImgError}
                  />
                ) : (
                  <div className="page-face back image-placeholder" />
                )}
              </div>
            ) : (
              getPageSrc(rightIndex) ? (
                <img
                  src={getPageSrc(rightIndex) ?? ''}
                  alt={`Page ${rightIndex}`}
                  className="book-page right"
                  onError={handleImgError}
                />
              ) : (
                <div className="book-page right image-placeholder" />
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ZineViewerPage() {
  const [zines, setZines] = useState<Zine[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadZines = async () => {
      try {
        const docs = await client.fetch<ZineDoc[]>(zinesQuery);
        if (!isActive) return;
        setZines(docs.map(toZine));
        setLoadError(null);
      } catch (error) {
        if (!isActive) return;
        setLoadError('Unable to load zines right now.');
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    };

    loadZines();

    return () => {
      isActive = false;
    };
  }, []);

  const selectedZine = useMemo(
    () => zines.find((zine) => zine.id === selectedId) ?? null,
    [zines, selectedId],
  );

  useEffect(() => {
    if (selectedId && !selectedZine && !isLoading) {
      setSelectedId(null);
    }
  }, [selectedId, selectedZine, isLoading]);

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        {!selectedZine ? (
          <>
            {isLoading ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-sm text-white/60">
                Loading zines...
              </div>
            ) : loadError ? (
              <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-10 text-center text-sm text-red-100">
                {loadError}
              </div>
            ) : zines.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-sm text-white/60">
                No zines published yet.
              </div>
            ) : (
              <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {zines.map((zine) => (
                  <button
                    key={zine.id}
                    type="button"
                    onClick={() => setSelectedId(zine.id)}
                    className="group flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-8 text-center transition hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    <div className="h-[220px] w-[160px] overflow-hidden rounded-xl shadow-xl transition-transform duration-300 group-hover:-translate-y-1">
                      {zine.coverUrl ? (
                        <img
                          src={zine.coverUrl}
                          alt={`${zine.title} cover`}
                          className="h-full w-full object-cover"
                          onError={handleImgError}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-white/5 text-[10px] uppercase tracking-[0.3em] text-white/40">
                          No cover
                        </div>
                      )}
                    </div>
                    <div className="text-xs uppercase tracking-[0.35em] text-white/60">
                      {zine.issueNumber ? `Issue ${zine.issueNumber}` : 'Zine'}
                    </div>
                    <div className="text-sm uppercase tracking-[0.2em] text-white/90">
                      {zine.title}
                    </div>
                    {zine.description && (
                      <p className="text-xs text-white/50">
                        {zine.description}
                      </p>
                    )}
                  </button>
                ))}
              </section>
            )}
          </>
        ) : (
          <section className="flex min-h-[70vh] flex-col items-center justify-center gap-8">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-white/60 hover:text-white"
            >
              {'<-'} Back to library
            </button>
            <div className="text-center">
              {selectedZine.issueNumber && (
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  Issue {selectedZine.issueNumber}
                </p>
              )}
              <h2 className="text-2xl uppercase tracking-[0.3em]">
                {selectedZine.title}
              </h2>
              {selectedZine.description && (
                <p className="mt-3 max-w-xl text-sm text-white/60">
                  {selectedZine.description}
                </p>
              )}
            </div>
            <ZineBook key={selectedZine.id} zine={selectedZine} />
          </section>
        )}
      </div>
    </main>
  );
}
