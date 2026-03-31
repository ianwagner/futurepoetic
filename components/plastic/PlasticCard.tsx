'use client';

import { motion } from 'framer-motion';

type PlasticCardProps = {
  title: string;
  subtitle: string;
  date: string;
  dayNumber: number;
  tags?: string[];
  accentColor?: string;
  index: number;
};

export default function PlasticCard({
  title,
  subtitle,
  date,
  dayNumber,
  tags,
  accentColor = '#ffffff',
  index,
}: PlasticCardProps) {
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );

  return (
    <a href={`/plastic/${dayNumber}/`}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07] cursor-pointer"
      style={{ borderLeftColor: accentColor, borderLeftWidth: 2 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className="text-[10px] font-medium uppercase tracking-[0.2em]"
          style={{ color: accentColor }}
        >
          Day {String(dayNumber).padStart(3, '0')}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-white/30">
          {formattedDate}
        </span>
      </div>

      <h3 className="mb-2 text-sm font-medium tracking-wide text-white/90">
        {title}
      </h3>

      <p className="text-xs leading-relaxed text-white/50">{subtitle}</p>

      {tags && tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/30"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
    </a>
  );
}
