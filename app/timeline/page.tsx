'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Open_Sans } from 'next/font/google';

const openSans = Open_Sans({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
});

const startYear = 0;
const endYear = 2026;
const scaleOptions = [1, 10, 25, 50, 100] as const;
const spacingRange = { min: 1.5, max: 5, step: 0.1 };
const labelTransitionMs = 300;
const labelDelayMs = 150;
const dateTokens = {
  americanRevolutionStart: 1775,
  americanRevolutionEnd: 1783,
  frenchRevolutionStart: 1789,
  frenchRevolutionEnd: 1799,
  louisXVIExecution: 1793,
  marieAntoinetteExecution: 1793,
  greatDepressionStart: 1929,
  greatDepressionEnd: 1939,
  moonLanding: 1969,
  nineEleven: 2001,
  covidStart: 2019,
  covidEnd: 2022,
  ww1Start: 1914,
  ww1End: 1918,
  ww2Start: 1939,
  ww2End: 1945,
} as const;

const timelineEvents = [
  {
    id: 'american-revolution',
    label: 'American Revolution',
    dates: `${dateTokens.americanRevolutionStart}-${dateTokens.americanRevolutionEnd}`,
    start: dateTokens.americanRevolutionStart,
    end: dateTokens.americanRevolutionEnd,
    continent: 'northAmerica',
  },
  {
    id: 'french-revolution',
    label: 'French Revolution',
    dates: `${dateTokens.frenchRevolutionStart}-${dateTokens.frenchRevolutionEnd}`,
    start: dateTokens.frenchRevolutionStart,
    end: dateTokens.frenchRevolutionEnd,
    continent: 'europe',
  },
  {
    id: 'louis-xvi-execution',
    label: 'Louis XVI Execution',
    dates: `${dateTokens.louisXVIExecution}`,
    start: dateTokens.louisXVIExecution,
    end: dateTokens.louisXVIExecution,
    continent: 'europe',
  },
  {
    id: 'marie-antoinette-execution',
    label: 'Marie Antoinette Execution',
    dates: `${dateTokens.marieAntoinetteExecution}`,
    start: dateTokens.marieAntoinetteExecution,
    end: dateTokens.marieAntoinetteExecution,
    continent: 'europe',
  },
  {
    id: 'ww1',
    label: 'WWI',
    dates: `${dateTokens.ww1Start}-${dateTokens.ww1End}`,
    start: dateTokens.ww1Start,
    end: dateTokens.ww1End,
    continent: 'europe',
  },
  {
    id: 'great-depression',
    label: 'Great Depression',
    dates: `${dateTokens.greatDepressionStart}-${dateTokens.greatDepressionEnd}`,
    start: dateTokens.greatDepressionStart,
    end: dateTokens.greatDepressionEnd,
    continent: 'europe',
  },
  {
    id: 'ww2',
    label: 'WWII',
    dates: `${dateTokens.ww2Start}-${dateTokens.ww2End}`,
    start: dateTokens.ww2Start,
    end: dateTokens.ww2End,
    continent: 'europe',
  },
  {
    id: 'moon-landing',
    label: 'Moon Landing',
    dates: `${dateTokens.moonLanding}`,
    start: dateTokens.moonLanding,
    end: dateTokens.moonLanding,
    continent: 'northAmerica',
  },
  {
    id: 'nine-eleven',
    label: '9/11',
    dates: `${dateTokens.nineEleven}`,
    start: dateTokens.nineEleven,
    end: dateTokens.nineEleven,
    continent: 'northAmerica',
  },
  {
    id: 'covid',
    label: 'COVID-19',
    dates: `${dateTokens.covidStart}-${dateTokens.covidEnd}`,
    start: dateTokens.covidStart,
    end: dateTokens.covidEnd,
    continent: 'global',
  },
];
const highlightYears = new Set([
  0,
  dateTokens.americanRevolutionStart,
  dateTokens.americanRevolutionEnd,
  dateTokens.frenchRevolutionStart,
  dateTokens.frenchRevolutionEnd,
  dateTokens.louisXVIExecution,
  dateTokens.marieAntoinetteExecution,
  dateTokens.ww1Start,
  dateTokens.ww1End,
  dateTokens.greatDepressionStart,
  dateTokens.greatDepressionEnd,
  dateTokens.ww2Start,
  dateTokens.ww2End,
  dateTokens.moonLanding,
  dateTokens.nineEleven,
  dateTokens.covidStart,
  dateTokens.covidEnd,
  2026,
]);

const eventStyleTokens = {
  groupOffsetClass: 'top-1/2',
  dotSizeClass: 'h-2 w-2',
  dotShadow: '0_0_10px_rgba(255,255,255,0.4)',
  labelOffsetRem: 3,
  labelHeightClass: 'h-7',
  labelPaddingClass: 'pl-3',
  labelTrackingClass: 'tracking-[0.18em]',
  labelFontSize: '0.55rem',
  labelBorderClass: 'border border-white/60',
  labelBackgroundClass: 'bg-black/80',
  labelTextClass: 'text-white uppercase',
  dotColorClass: 'bg-white',
  stemColorClass: 'bg-white/70',
  laneSpacingRem: 3,
  minSpanPx: 24,
  pointLabelWidthPx: 200,
  topPaddingRem: 1.5,
} as const;

const continentStyles = {
  europe: {
    dotColorClass: 'bg-emerald-300',
    stemColorClass: 'bg-emerald-200/80',
    labelBorderClass: 'border border-emerald-200/70',
    labelTextClass: 'text-emerald-100 uppercase',
    dotShadow: '0_0_10px_rgba(16,185,129,0.4)',
  },
  northAmerica: {
    dotColorClass: 'bg-sky-300',
    stemColorClass: 'bg-sky-200/80',
    labelBorderClass: 'border border-sky-200/70',
    labelTextClass: 'text-sky-100 uppercase',
    dotShadow: '0_0_10px_rgba(56,189,248,0.4)',
  },
} as const;

export default function TimelinePage() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const yearRefs = useRef(new Map<number, HTMLDivElement | null>());
  const [isReady, setIsReady] = useState(false);
  const [yearStep, setYearStep] = useState<(typeof scaleOptions)[number]>(1);
  const [spacing, setSpacing] = useState(2.5);
  const [eventSpans, setEventSpans] = useState<
    Record<
      string,
      { startX: number; endX: number; lane: number; isPoint: boolean; anchorX: number }
    >
  >({});
  const [areLabelsHidden, setAreLabelsHidden] = useState(false);

  const years = useMemo(() => {
    const values: number[] = [];
    for (let year = startYear; year <= endYear; year += yearStep) {
      values.push(year);
    }
    if (values[values.length - 1] !== endYear) {
      values.push(endYear);
    }
    return values;
  }, [yearStep]);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollLeft = container.scrollWidth - container.clientWidth;
    setIsReady(true);
  }, [yearStep]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const container = scrollRef.current;
    if (!track || !container) return;

    let rafId: number | null = null;
    let delayTimeout: number | null = null;
    const updateSpans = () => {
      const trackRect = track.getBoundingClientRect();
      const anchorPositions = new Map<number, number>();
      years.forEach((year) => {
        const anchor = yearRefs.current.get(year);
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        anchorPositions.set(
          year,
          rect.left - trackRect.left + rect.width / 2,
        );
      });

      const resolveYearX = (year: number) => {
        const exact = anchorPositions.get(year);
        if (exact !== undefined) return exact;

        let lowerYear: number | null = null;
        let upperYear: number | null = null;
        for (let i = 0; i < years.length; i += 1) {
          const value = years[i];
          if (value <= year) lowerYear = value;
          if (value >= year) {
            upperYear = value;
            break;
          }
        }

        if (lowerYear === null) return null;
        const lowerX = anchorPositions.get(lowerYear);
        if (lowerX === undefined) return null;
        if (upperYear === null || upperYear === lowerYear) return lowerX;
        const upperX = anchorPositions.get(upperYear);
        if (upperX === undefined) return lowerX;

        const span = upperYear - lowerYear;
        const progress = span > 0 ? (year - lowerYear) / span : 0;
        return lowerX + (upperX - lowerX) * progress;
      };

      const spanCandidates: Array<{
        id: string;
        startX: number;
        endX: number;
        isPoint: boolean;
        anchorX: number;
      }> = [];

      timelineEvents.forEach((event) => {
        const startX = resolveYearX(event.start);
        const endX = resolveYearX(event.end);
        if (startX === null || endX === null) return;
        const isPoint = event.start === event.end;
        if (isPoint) {
          spanCandidates.push({
            id: event.id,
            startX,
            endX: startX + eventStyleTokens.pointLabelWidthPx,
            isPoint: true,
            anchorX: startX,
          });
        } else {
          let adjustedEndX = endX;
          if (endX <= startX) {
            adjustedEndX = startX + eventStyleTokens.minSpanPx;
          } else if (endX - startX < eventStyleTokens.minSpanPx) {
            adjustedEndX = startX + eventStyleTokens.minSpanPx;
          }
          spanCandidates.push({
            id: event.id,
            startX,
            endX: adjustedEndX,
            isPoint: false,
            anchorX: startX,
          });
        }
      });

      spanCandidates.sort((a, b) => a.startX - b.startX);
      const lanes: number[] = [];
      const nextSpans: Record<
        string,
        { startX: number; endX: number; lane: number; isPoint: boolean; anchorX: number }
      > = {};

      spanCandidates.forEach((span) => {
        let lane = 0;
        while (lane < lanes.length && span.startX < lanes[lane]) {
          lane += 1;
        }
        if (lane === lanes.length) {
          lanes.push(span.endX);
        } else {
          lanes[lane] = span.endX;
        }
        nextSpans[span.id] = { ...span, lane };
      });

      setEventSpans(nextSpans);
    };

    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateSpans();
      });
    };

    const scheduleDelayedUpdate = () => {
      if (delayTimeout !== null) {
        window.clearTimeout(delayTimeout);
      }
      setAreLabelsHidden(true);
      delayTimeout = window.setTimeout(() => {
        scheduleUpdate();
        setAreLabelsHidden(false);
      }, labelDelayMs);
    };

    updateSpans();
    window.addEventListener('resize', scheduleDelayedUpdate);
    container.addEventListener('scroll', scheduleUpdate, { passive: true });
    return () => {
      window.removeEventListener('resize', scheduleDelayedUpdate);
      container.removeEventListener('scroll', scheduleUpdate);
      if (delayTimeout !== null) {
        window.clearTimeout(delayTimeout);
      }
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [years]);

  useLayoutEffect(() => {
    setAreLabelsHidden(true);
    const delayTimeout = window.setTimeout(() => {
      setAreLabelsHidden(false);
    }, labelDelayMs);
    return () => window.clearTimeout(delayTimeout);
  }, [yearStep, spacing]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    container.scrollLeft += event.deltaY;
    event.preventDefault();
  };

  return (
    <main
      className={`min-h-screen text-white overflow-hidden bg-black ${openSans.className}`}
    >
      <div className="min-h-screen flex flex-col">
        <section className="relative z-10 flex-1 px-6 sm:px-10 pb-12 pt-16">
          <div className="absolute right-6 top-6 z-20 flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-white/60 pointer-events-auto">
            {scaleOptions.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => {
                  if (step === yearStep) return;
                  setIsReady(false);
                  setYearStep(step);
                }}
                className={`px-3 py-2 border transition ${
                  yearStep === step
                    ? 'border-white text-white'
                    : 'border-white/30 text-white/60 hover:border-white/70 hover:text-white'
                }`}
              >
                {step}y
              </button>
            ))}
          </div>
          <div className="absolute right-6 top-20 z-20 flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-white/60 pointer-events-auto">
            <span className="text-white/40">Zoom</span>
            <input
              type="range"
              min={spacingRange.min}
              max={spacingRange.max}
              step={spacingRange.step}
              value={spacing}
              onChange={(event) => {
                setSpacing(Number(event.target.value));
              }}
              className="w-40 accent-white"
              aria-label="Zoom spacing"
            />
            <span className="tabular-nums text-white/60">
              {spacing.toFixed(1)}x
            </span>
          </div>
          <div
            ref={scrollRef}
            onWheel={handleWheel}
            className="overflow-x-auto overflow-y-hidden pb-24 snap-x snap-proximity touch-pan-x scrollbar-hidden"
            style={{ visibility: isReady ? 'visible' : 'hidden' }}
          >
            <div
              ref={trackRef}
              className="relative flex items-center py-16 min-w-max"
              style={{ gap: `${spacing}rem`, transition: 'gap 200ms ease' }}
            >
              <div className="absolute left-0 right-0 top-1/2 h-px bg-white/20" />
              {timelineEvents.map((event) => {
                const span = eventSpans[event.id];
                if (!span) return null;
                const width = span.endX - span.startX;
                const anchorOffset = span.anchorX - span.startX;
                const labelTop =
                  eventStyleTokens.topPaddingRem +
                  span.lane * eventStyleTokens.laneSpacingRem +
                  eventStyleTokens.labelOffsetRem;
                const continentStyle =
                  continentStyles[
                    event.continent as keyof typeof continentStyles
                  ] ?? eventStyleTokens;
                return (
                  <div
                    key={event.id}
                    className={`absolute ${eventStyleTokens.groupOffsetClass} pointer-events-none`}
                    style={{
                      left: span.startX,
                      width,
                      opacity: areLabelsHidden ? 0 : 1,
                      transition: `opacity 120ms ease`,
                    }}
                  >
                    <span
                      className={`absolute top-0 ${eventStyleTokens.dotSizeClass} -translate-x-1/2 rounded-full ${continentStyle.dotColorClass}`}
                      style={{ left: anchorOffset, boxShadow: continentStyle.dotShadow }}
                    />
                    {!span.isPoint && (
                      <span
                        className={`absolute top-0 ${eventStyleTokens.dotSizeClass} -translate-x-1/2 rounded-full ${continentStyle.dotColorClass}`}
                        style={{ left: width, boxShadow: continentStyle.dotShadow }}
                      />
                    )}
                    <span
                      className={`absolute top-0 w-px -translate-x-1/2 ${continentStyle.stemColorClass}`}
                      style={{ left: anchorOffset, height: `${labelTop}rem` }}
                    />
                    {!span.isPoint && (
                      <span
                        className={`absolute top-0 w-px -translate-x-1/2 ${continentStyle.stemColorClass}`}
                        style={{ left: width, height: `${labelTop}rem` }}
                      />
                    )}
                    <span
                      className={`absolute left-0 flex ${eventStyleTokens.labelHeightClass} items-center justify-start ${continentStyle.labelBorderClass} ${eventStyleTokens.labelBackgroundClass} ${continentStyle.labelTextClass} ${eventStyleTokens.labelTrackingClass} ${eventStyleTokens.labelPaddingClass}`}
                      style={{
                        top: `${labelTop}rem`,
                        width,
                        fontSize: eventStyleTokens.labelFontSize,
                      }}
                    >
                      {event.label} {event.dates}
                    </span>
                  </div>
                );
              })}
              {years.map((year) => {
                const isDecade = year % 10 === 0;
                const isHighlight = highlightYears.has(year);
                return (
                  <div
                    key={year}
                    className="relative flex flex-col items-center snap-start"
                    ref={(node) => {
                      if (node) {
                        yearRefs.current.set(year, node);
                      } else {
                        yearRefs.current.delete(year);
                      }
                    }}
                  >
                    <span
                      className={`block w-px ${isHighlight ? 'bg-white' : 'bg-white/60'}`}
                      style={{ height: `${isDecade ? 4 : 2.5}rem` }}
                    />
                    <span
                      className={`mt-4 ${
                        isDecade ? 'tracking-[0.4em]' : 'tracking-[0.2em]'
                      } ${isHighlight ? 'text-white' : 'text-white/70'}`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {year}
                    </span>
                    {isDecade && (
                      <span
                        className="mt-2 uppercase tracking-[0.3em] text-white/40"
                        style={{ fontSize: '0.5rem' }}
                      >
                        Decade
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
