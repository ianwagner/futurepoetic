/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, SyntheticEvent } from 'react';

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
  const [isFlippingBackward, setIsFlippingBackward] = useState(false);
  const [isPeeling, setIsPeeling] = useState(false);
  const [isPeelCompleting, setIsPeelCompleting] = useState(false);
  const [peelProgress, setPeelProgress] = useState(0);
  const [peelDirection, setPeelDirection] = useState<'next' | 'prev' | null>(
    null
  );
  const peelStartX = useRef(0);
  const peelWidth = useRef(200);
  const peelPointerId = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const totalPages = pages.length;
  const totalSpreads = totalPages ? Math.ceil(totalPages / 2) : 0;
  const spreadIndex = totalSpreads
    ? Math.min(totalSpreads, Math.max(1, Math.floor(leftIndex / 2) + 1))
    : 0;
  const indicatorLabel = totalPages
    ? !isOpen
      ? isBackCover
        ? 'Back cover'
        : 'Front cover'
      : `Page ${spreadIndex}/${totalSpreads}`
    : null;

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
    if (
      isFlipping ||
      isFlippingBackward ||
      isClosing ||
      isPeeling ||
      isPeelCompleting
    )
      return;
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
    isPeelCompleting,
    isPeeling,
    isReturning,
    pages.length,
    rightIndex,
  ]);

  const prevPage = useCallback(() => {
    if (
      !isOpen ||
      isFlipping ||
      isFlippingBackward ||
      isClosing ||
      isPeeling ||
      isPeelCompleting
    )
      return;
    if (leftIndex <= 0) {
      setIsOpen(false);
      setLeftIndex(0);
      setRightIndex(1);
      setIsBackCover(false);
      return;
    }
    setIsFlippingBackward(true);
  }, [
    isClosing,
    isFlipping,
    isFlippingBackward,
    isOpen,
    isPeelCompleting,
    isPeeling,
    leftIndex,
  ]);

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
    if (!isFlippingBackward) return;
    const timer = window.setTimeout(() => {
      setLeftIndex((i) => Math.max(0, i - 2));
      setRightIndex((i) => Math.max(1, i - 2));
      setIsFlippingBackward(false);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [isFlippingBackward]);

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

  useEffect(() => {
    if (!isPeelCompleting) return;
    const timer = window.setTimeout(() => {
      if (peelDirection === 'next') {
        if (rightIndex >= pages.length - 2) {
          setIsOpen(false);
          setIsBackCover(true);
          setLeftIndex(0);
          setRightIndex(1);
        } else {
          setLeftIndex(rightIndex + 1);
          setRightIndex(rightIndex + 2);
        }
      }
      if (peelDirection === 'prev') {
        if (leftIndex <= 0) {
          setIsOpen(false);
          setIsBackCover(false);
          setLeftIndex(0);
          setRightIndex(1);
        } else {
          setLeftIndex((i) => Math.max(0, i - 2));
          setRightIndex((i) => Math.max(1, i - 2));
        }
      }
      setIsPeelCompleting(false);
      setPeelProgress(0);
      setPeelDirection(null);
    }, 360);
    return () => window.clearTimeout(timer);
  }, [
    isPeelCompleting,
    leftIndex,
    pages.length,
    peelDirection,
    rightIndex,
  ]);

  const activeCoverSrc = isBackCover ? backCoverSrc : coverSrc;

  const prevLeftIndex = Math.max(0, leftIndex - 2);
  const prevRightIndex = Math.max(0, leftIndex - 1);
  const canPeelNext =
    isOpen &&
    !isFlipping &&
    !isFlippingBackward &&
    !isClosing &&
    !isOpening &&
    !isReturning &&
    !isPeelCompleting;
  const canPeelPrev = canPeelNext && leftIndex > 0;

  const handlePeelStart = (
    event: ReactPointerEvent<HTMLButtonElement>,
    direction: 'next' | 'prev'
  ) => {
    if (isPeeling || isPeelCompleting) return;
    if (direction === 'next' && !canPeelNext) return;
    if (direction === 'prev' && !canPeelPrev) return;
    const rect = event.currentTarget.getBoundingClientRect();
    peelWidth.current = rect.width || 200;
    peelStartX.current = event.clientX;
    peelPointerId.current = event.pointerId;
    suppressClick.current = false;
    setPeelDirection(direction);
    setPeelProgress(0);
    setIsPeeling(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePeelMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isPeeling || peelPointerId.current !== event.pointerId) return;
    const deltaX = event.clientX - peelStartX.current;
    const width = peelWidth.current || 200;
    const nextProgress =
      peelDirection === 'prev'
        ? Math.min(1, Math.max(0, deltaX / width))
        : Math.min(1, Math.max(0, -deltaX / width));
    if (nextProgress > 0.02) {
      suppressClick.current = true;
    }
    setPeelProgress(nextProgress);
  };

  const finishPeel = () => {
    const triggerTurn = peelProgress > 0.35;
    const direction = peelDirection;
    setIsPeeling(false);
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 200);
    if (!triggerTurn || !direction) {
      setPeelProgress(0);
      setPeelDirection(null);
      return;
    }
    setPeelProgress(1);
    setIsPeelCompleting(true);
  };

  const handlePeelEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (peelPointerId.current !== event.pointerId) return;
    peelPointerId.current = null;
    finishPeel();
  };

  const handlePeelCancel = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (peelPointerId.current !== event.pointerId) return;
    peelPointerId.current = null;
    finishPeel();
  };
  const handleNextClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    nextPage();
  };

  const handlePrevClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    prevPage();
  };

  return (
    <div className="floating flex flex-col items-center gap-3">
      <div
        className={`book-container shadow-xl ${isOpen || isOpening ? 'open' : 'closed'}`}
      >
        <button
          type="button"
          aria-label="Previous page"
          onClick={handlePrevClick}
          onPointerDown={(event) => handlePeelStart(event, 'prev')}
          onPointerMove={handlePeelMove}
          onPointerUp={handlePeelEnd}
          onPointerCancel={handlePeelCancel}
          className="absolute inset-y-0 left-0 z-20 w-1/2 cursor-pointer bg-transparent"
        />
        <button
          type="button"
          aria-label="Next page"
          onClick={handleNextClick}
          onPointerDown={(event) => handlePeelStart(event, 'next')}
          onPointerMove={handlePeelMove}
          onPointerUp={handlePeelEnd}
          onPointerCancel={handlePeelCancel}
          className="absolute inset-y-0 right-0 z-20 w-1/2 cursor-pointer bg-transparent"
        />
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
            {(isPeeling && peelDirection === 'prev') ||
            (isPeelCompleting && peelDirection === 'prev') ? (
              <>
                {getPageSrc(prevLeftIndex) ? (
                  <img
                    src={getPageSrc(prevLeftIndex) ?? ''}
                    alt={`Page ${prevLeftIndex}`}
                    className="book-page left under"
                    onError={handleImgError}
                  />
                ) : (
                  <div className="book-page left under image-placeholder" />
                )}
                <div
                  className="page-peel left"
                  aria-hidden="true"
                  style={{
                    transform: `rotateY(${(isPeeling ? peelProgress : 1) * 180}deg)`,
                    transition: isPeeling ? 'none' : 'transform 0.36s ease',
                  }}
                >
                  {getPageSrc(leftIndex) ? (
                    <img
                      src={getPageSrc(leftIndex) ?? ''}
                      alt=""
                      className="page-face front"
                      onError={handleImgError}
                    />
                  ) : (
                    <div className="page-face front image-placeholder" />
                  )}
                  {getPageSrc(prevRightIndex) ? (
                    <img
                      src={getPageSrc(prevRightIndex) ?? ''}
                      alt=""
                      className="page-face back"
                      onError={handleImgError}
                    />
                  ) : (
                    <div className="page-face back image-placeholder" />
                  )}
                </div>
              </>
            ) : isFlippingBackward ? (
              getPageSrc(prevLeftIndex) ? (
                <img
                  src={getPageSrc(prevLeftIndex) ?? ''}
                  alt={`Page ${prevLeftIndex}`}
                  className="book-page left under"
                  onError={handleImgError}
                />
              ) : (
                <div className="book-page left under image-placeholder" />
              )
            ) : getPageSrc(leftIndex) ? (
              <img
                src={getPageSrc(leftIndex) ?? ''}
                alt={`Page ${leftIndex}`}
                className="book-page left"
                onError={handleImgError}
              />
            ) : (
              <div className="book-page left image-placeholder" />
            )}
            {!isFlippingBackward &&
              (getPageSrc(rightIndex + 2) ? (
                <img
                  src={getPageSrc(rightIndex + 2) ?? ''}
                  alt={`Page ${rightIndex + 2}`}
                  className="book-page right under"
                  onError={handleImgError}
                />
              ) : (
                <div className="book-page right under image-placeholder" />
              ))}
            {(isPeeling && peelDirection === 'next') ||
            (isPeelCompleting && peelDirection === 'next') ? (
              <div
                className="page-peel right"
                aria-hidden="true"
                style={{
                  transform: `rotateY(-${(isPeeling ? peelProgress : 1) * 180}deg)`,
                  transition: isPeeling ? 'none' : 'transform 0.36s ease',
                }}
              >
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
                {rightIndex >= pages.length - 2 ? (
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
            ) : isFlippingBackward ? (
              <>
                <div className="page-flip left flipping-back" aria-hidden="true">
                  {getPageSrc(leftIndex) ? (
                    <img
                      src={getPageSrc(leftIndex) ?? ''}
                      alt=""
                      className="page-face front"
                      onError={handleImgError}
                    />
                  ) : (
                    <div className="page-face front image-placeholder" />
                  )}
                  {getPageSrc(prevRightIndex) ? (
                    <img
                      src={getPageSrc(prevRightIndex) ?? ''}
                      alt=""
                      className="page-face back"
                      onError={handleImgError}
                    />
                  ) : (
                    <div className="page-face back image-placeholder" />
                  )}
                </div>
                {getPageSrc(rightIndex) ? (
                  <img
                    src={getPageSrc(rightIndex) ?? ''}
                    alt={`Page ${rightIndex}`}
                    className="book-page right"
                    onError={handleImgError}
                  />
                ) : (
                  <div className="book-page right image-placeholder" />
                )}
              </>
            ) : isFlipping || isClosing ? (
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
            ) : getPageSrc(rightIndex) ? (
              <img
                src={getPageSrc(rightIndex) ?? ''}
                alt={`Page ${rightIndex}`}
                className="book-page right"
                onError={handleImgError}
              />
            ) : (
              <div className="book-page right image-placeholder" />
            )}
          </>
        )}
      </div>
      {indicatorLabel && (
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">
          {indicatorLabel}
        </p>
      )}
    </div>
  );
}

export default function XineViewerClient({ xine }: { xine: Xine }) {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="flex min-h-[70vh] flex-col items-center justify-center gap-8">
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
