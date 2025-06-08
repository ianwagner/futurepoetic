import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ZodiacSelector from './ZodiacSelector';

// Introductory lines shown before displaying the astrological signs.
const introSequence = [
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
    if (index <= introSequence.length) {
      const timer = setTimeout(() => {
        setIndex((i) => i + 1);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [index]);

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none bg-black text-white">
      <motion.div
        className="pointer-events-auto bg-black p-6 rounded-xl shadow-lg text-white max-w-md w-full"
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 70, damping: 15 }}
      >
        {index > 0 && index <= introSequence.length && (
          <motion.p
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-2 text-center"
          >
            {introSequence[index - 1]}
          </motion.p>
        )}
        {index > introSequence.length && <ZodiacSelector />}
      </motion.div>
    </div>
  );
}
