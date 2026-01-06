/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';
import Link from 'next/link';
import { LuChevronLeft } from 'react-icons/lu';

export type Xine = {
  id: string;
  title: string;
  slug: string;
  issueNumber?: number;
  description?: string;
  coverUrl: string | null;
  backCoverUrl: string | null;
  pageUrls: string[];
};

const handleImgError = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.style.opacity = '0';
  event.currentTarget.setAttribute('data-error', 'true');
};

function XineBook({ xine }: { xine: Xine }) {
  const coverSrc = xine.coverUrl;
  const backCoverSrc = xine.backCoverUrl ?? coverSrc;
  const pages = xine.pageUrls;
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

  const nextPage = useCallback(() => {
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
  }, [
    isBackCover,
    isClosing,
    isFlipping,
    isOpen,
    isOpening,
    isReturning,
    pages.length,
    rightIndex,
  ]);

  const prevPage = useCallback(() => {
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
  }, [isClosing, isFlipping, isOpen, leftIndex]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [nextPage, prevPage]);

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

export default function XineViewerClient({ xine }: { xine: Xine }) {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="flex min-h-[70vh] flex-col items-center justify-center gap-8">
          <Link
            href="/xine-library"
            aria-label="Back to library"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 p-3 text-white/70 transition hover:border-white/60 hover:text-white"
          >
            <LuChevronLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div className="text-center">
            {xine.issueNumber && (
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                Issue {xine.issueNumber}
              </p>
            )}
            <h2 className="text-2xl uppercase tracking-[0.3em]">
              {xine.title}
            </h2>
            {xine.description && (
              <p className="mt-3 max-w-xl text-sm text-white/60">
                {xine.description}
              </p>
            )}
          </div>
          <XineBook key={xine.id} xine={xine} />
        </section>
      </div>
    </main>
  );
}
