'use client';
import { useState, useEffect } from 'react';

// Placeholder image URLs (replace with your Firebase Storage URLs)
const pages = [
  // Front and back covers
  'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504198458649-3128b932f49b?auto=format&fit=crop&w=800&q=80',
  // First interior spread
  'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80',
  // Second interior spread
  'https://images.unsplash.com/photo-1535909339361-9b471a410096?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=800&q=80',
];

export default function Home() {
  const [pageIndex, setPageIndex] = useState(0);

  const nextPage = () => {
    setPageIndex((i) => Math.min(i + 2, pages.length));
  };

  const prevPage = () => {
    setPageIndex((i) => Math.max(i - 2, 0));
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="floating">
        <div className="book-container shadow-xl cursor-pointer" onClick={nextPage}>
          {pages.map((src, i) => {
            const closing = pageIndex === pages.length;
            const turned = closing ? i !== 1 : i < pageIndex;
            const offset =
              i === 1 && (pageIndex === 0 || closing) ? 0 : i % 2 === 0 ? 0 : 200;

            return (
              <img
                key={i}
                src={src}
                alt={`Page ${i}`}
                className={`book-page ${i % 2 === 0 ? 'left' : 'right'} ${
                  turned ? 'turned' : ''
                }`}
                style={{ zIndex: pages.length - i, left: offset }}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
