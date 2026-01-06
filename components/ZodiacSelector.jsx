'use client';

import { motion } from 'framer-motion';
import React from 'react';
import {
  GiAries,
  GiTaurus,
  GiGemini,
  GiCancer,
  GiLeo,
  GiVirgo,
  GiLibra,
  GiScorpio,
  GiSagittarius,
  GiCapricorn,
  GiAquarius,
  GiPisces,
} from 'react-icons/gi';

const signs = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

const icons = [
  GiAries,
  GiTaurus,
  GiGemini,
  GiCancer,
  GiLeo,
  GiVirgo,
  GiLibra,
  GiScorpio,
  GiSagittarius,
  GiCapricorn,
  GiAquarius,
  GiPisces,
];

const colors = [
  '#FCD5CE','#F8EDEB','#E8E8E4','#D8E2DC','#FFE5D9','#FFD7BA',
  '#E0BBE4','#CBAACB','#B8E0D2','#C9E4DE','#D6EACF','#F6EAC2'
];

export default function ZodiacSelector() {
  return (
    <div className="mt-6 flex flex-wrap justify-center max-w-md mx-auto">
      {signs.map((sign, i) => (
        <div key={sign} className="m-2 flex flex-col items-center group">
          <motion.button
            whileHover={{ scale: 1.2, boxShadow: '0 0 10px rgba(255,255,255,0.6)' }}
            className="w-12 h-12 rounded-full floating flex items-center justify-center"
            style={{ backgroundColor: colors[i] }}
            onClick={() => console.log(sign)}
          >
            {icons[i] && (
              <span className="text-xl">
                {React.createElement(icons[i])}
              </span>
            )}
            <span className="sr-only">{sign}</span>
          </motion.button>
          <span className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {sign}
          </span>
        </div>
      ))}
    </div>
  );
}
