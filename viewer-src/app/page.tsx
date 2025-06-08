'use client';
import { useState, useEffect } from 'react';

// Placeholder image URLs (replace with your Firebase Storage URLs)
const pages = [
  'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1535909339361-9b471a410096?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=800&q=80'
];

export default function Home() {
  const [index, setIndex] = useState(0);

  const nextPage = () => setIndex((i) => (i + 1) % pages.length);
  const prevPage = () => setIndex((i) => (i - 1 + pages.length) % pages.length);

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
      <div
        className="floating max-w-[80vw] max-h-[80vh] shadow-xl cursor-pointer"
        onClick={nextPage}
      >
        <img
          src={pages[index]}
          alt={`Zine page ${index + 1}`}
          className="w-full h-full object-contain"
        />
      </div>
    </main>
  );
}
