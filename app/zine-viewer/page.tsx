'use client';

import { useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';

// Placeholder image URLs (replace with your Firebase Storage URLs)
const coverSrc =
  'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=800&q=80';
const backCoverSrc =
  'https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?auto=format&fit=crop&w=800&q=80';
const pages = [
  // First interior spread
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=800&q=80',
  // Second interior spread
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
  // Third interior spread
  'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
];

const getPageSrc = (index: number) => pages[index] ?? '/file.svg';
const handleImgError = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.src = '/file.svg';
};

export default function ZineViewerPage() {
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
  }, [isFlipping, rightIndex]);

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
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="floating">
        <div
          className={`book-container shadow-xl cursor-pointer ${isOpen || isOpening ? 'open' : 'closed'}`}
          onClick={nextPage}
        >
          {!isOpen && !isOpening && !isReturning && (
            <img
              src={activeCoverSrc}
              alt={isBackCover ? 'Back cover' : 'Front cover'}
              className="book-page cover"
              onError={handleImgError}
            />
          )}
          {!isOpen && isReturning && (
            <div className="page-flip returning" aria-hidden="true">
              <img
                src={backCoverSrc}
                alt=""
                className="page-face front"
                onError={handleImgError}
              />
              <img
                src={coverSrc}
                alt=""
                className="page-face back"
                onError={handleImgError}
              />
            </div>
          )}
          {isOpening && (
            <>
              {openingPhase === 'flip' && pages[rightIndex] && (
                <img
                  src={getPageSrc(rightIndex)}
                  alt={`Page ${rightIndex}`}
                  className="book-page right under"
                  onError={handleImgError}
                />
              )}
              <div className="page-flip right opening" aria-hidden="true">
                <img
                  src={activeCoverSrc}
                  alt=""
                  className="page-face front"
                  onError={handleImgError}
                />
                <img
                  src={getPageSrc(leftIndex)}
                  alt=""
                  className="page-face back"
                  onError={handleImgError}
                />
              </div>
            </>
          )}
          {isOpen && (
            <>
              <img
                src={getPageSrc(leftIndex)}
                alt={`Page ${leftIndex}`}
                className="book-page left"
                onError={handleImgError}
              />
              {pages[rightIndex + 2] && (
                <img
                  src={getPageSrc(rightIndex + 2)}
                  alt={`Page ${rightIndex + 2}`}
                  className="book-page right under"
                  onError={handleImgError}
                />
              )}
              {isFlipping || isClosing ? (
                <div className="page-flip right flipping" aria-hidden="true">
                  <img
                    src={getPageSrc(rightIndex)}
                    alt=""
                    className="page-face front"
                    onError={handleImgError}
                  />
                  <img
                    src={isClosing ? backCoverSrc : getPageSrc(rightIndex + 1)}
                    alt=""
                    className="page-face back"
                    onError={handleImgError}
                  />
                </div>
              ) : (
                <img
                  src={getPageSrc(rightIndex)}
                  alt={`Page ${rightIndex}`}
                  className="book-page right"
                  onError={handleImgError}
                />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
