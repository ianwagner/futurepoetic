'use client';
import { useState, useEffect, useRef } from 'react';

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
  const [isFlipping, setIsFlipping] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [flipAngle, setFlipAngle] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextPage = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setFlipAngle(180);
    setTimeout(() => {
      setIndex((i) => (i + 1) % pages.length);
    }, 150);
    setTimeout(() => {
      setFlipAngle(0);
      setIsFlipping(false);
    }, 300);
  };
  const prevPage = () => setIndex((i) => (i - 1 + pages.length) % pages.length);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
    };
    const handleMouse = (e: MouseEvent) => {
      if (isFlipping || !containerRef.current) return;
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
      <div
        ref={containerRef}
        className="floating zine-container shadow-xl cursor-pointer"
        onClick={nextPage}
        style={{
          transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY + flipAngle}deg)`,
        }}
      >
        <img
          src={pages[index]}
          alt={`Zine page ${index + 1}`}
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>
    </main>
  );
}
