import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ZodiacSelector from './ZodiacSelector';

const messages = [
  'Sensing planet…',
  'Planet found',
  'Calibrating for Earth',
  'Sensing star signs…',
  '12 signs found',
  'Please select the star sign you were born under:'
];

export default function CardIntro() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index <= messages.length) {
      const timer = setTimeout(() => {
        setIndex((i) => i + 1);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [index]);

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center pointer-events-none">
      <motion.div
        className="pointer-events-auto bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg text-white max-w-md w-full"
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 70, damping: 15 }}
      >
        {messages.slice(0, index).map((msg, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-2 text-center"
          >
            {msg}
          </motion.p>
        ))}
        {index > messages.length && <ZodiacSelector />}
      </motion.div>
    </div>
  );
}
