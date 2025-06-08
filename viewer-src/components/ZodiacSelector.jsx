import { motion } from 'framer-motion';

const signs = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

const colors = [
  '#FCD5CE','#F8EDEB','#E8E8E4','#D8E2DC','#FFE5D9','#FFD7BA',
  '#E0BBE4','#CBAACB','#B8E0D2','#C9E4DE','#D6EACF','#F6EAC2'
];

export default function ZodiacSelector() {
  return (
    <div className="mt-6 flex flex-wrap justify-center max-w-md mx-auto">
      {signs.map((sign, i) => (
        <motion.button
          key={sign}
          whileHover={{ scale: 1.1, boxShadow: '0 0 10px rgba(255,255,255,0.6)' }}
          className="w-12 h-12 m-2 rounded-full floating"
          style={{ backgroundColor: colors[i] }}
          onClick={() => console.log(sign)}
        >
          <span className="sr-only">{sign}</span>
        </motion.button>
      ))}
    </div>
  );
}
