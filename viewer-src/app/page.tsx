'use client';
import { useState, useEffect, useRef } from 'react';

// Placeholder image URLs (replace with your Firebase Storage URLs)
// We keep an even number of pages so each interior spread has two pages
const pages = [
  // Front cover
  'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=800&q=80',
  // Interior pages
  'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1535909339361-9b471a410096?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=800&q=80',
  // Back cover
  'https://images.unsplash.com/photo-1504198458649-3128b932f49b?auto=format&fit=crop&w=800&q=80'
];

export default function Home() {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [flipAngle, setFlipAngle] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-compute the spreads: first and last are covers, interiors are pairs
  const interior = pages.slice(1, pages.length - 1);
  const spreads = [
    [pages[0]],
    ...Array.from({ length: interior.length / 2 }, (_, i) => [
      interior[i * 2],
      interior[i * 2 + 1],
    ]),
    [pages[pages.length - 1]],
  ];

  const nextSpread = () => {
    if (isFlipping || spreadIndex >= spreads.length - 1) return;
    setIsFlipping(true);
    setFlipAngle(180);
    setTimeout(() => {
      setSpreadIndex((i) => Math.min(i + 1, spreads.length - 1));
    }, 150);
    setTimeout(() => {
      setFlipAngle(0);
      setIsFlipping(false);
    }, 300);
  };

  const prevSpread = () => {
    if (isFlipping || spreadIndex === 0) return;
    setIsFlipping(true);
    setFlipAngle(-180);
    setTimeout(() => {
      setSpreadIndex((i) => Math.max(i - 1, 0));
    }, 150);
    setTimeout(() => {
      setFlipAngle(0);
      setIsFlipping(false);
    }, 300);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSpread();
      if (e.key === 'ArrowLeft') prevSpread();
    };
    const handleMouse = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      setRotateX((-y / rect.height) * 10);
      setRotateY((x / rect.width) * 10);
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('mousemove', handleMouse);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="floating">
        <div
          ref={containerRef}
          className="zine-container shadow-xl cursor-pointer"
          onClick={nextSpread}
          style={{
            transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY + flipAngle}deg)`,
          }}
        >
          {spreads[spreadIndex].length === 1 ? (
            <img
              src={spreads[spreadIndex][0]}
              alt={`Zine page ${spreadIndex}`}
              className="zine-page h-full object-contain pointer-events-none"
            />
          ) : (
            <>
              <img
                src={spreads[spreadIndex][0]}
                alt={`Zine page ${spreadIndex * 2 - 1}`}
                className="zine-page h-full object-contain pointer-events-none"
              />
              <img
                src={spreads[spreadIndex][1]}
                alt={`Zine page ${spreadIndex * 2}`}
                className="zine-page h-full object-contain pointer-events-none"
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
