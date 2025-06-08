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
  const [isOpen, setIsOpen] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => setIsOpen((o) => !o);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ') toggleOpen();
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
          className="book cursor-pointer"
          onClick={toggleOpen}
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          }}
        >
          <div className={`cover shadow-xl ${isOpen ? 'open' : ''}`}>
            <img
              src={pages[0]}
              alt="Front cover"
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
          <div className={`pages ${isOpen ? 'open' : ''}`}>
            <div className="page">
              <img
                src={pages[1]}
                alt="Page 1"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
            <div className="page" style={{ left: '200px' }}>
              <img
                src={pages[2]}
                alt="Page 2"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
          </div>
          <div className="back-cover" style={{ left: '200px' }}>
            <img
              src={pages[pages.length - 1]}
              alt="Back cover"
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
