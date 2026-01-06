'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Open_Sans } from 'next/font/google';
import { client } from '@/sanity/lib/client';

const openSans = Open_Sans({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
});

const scaleOptions = [1, 10, 25, 50] as const;
const spacingRange = { min: 1.5, max: 5, step: 0.1 };
const labelTransitionMs = 300;
const labelDelayMs = 150;

type TimelineEventDoc = {
  _key?: string;
  label?: string;
  startYear?: number;
  endYear?: number;
  continent?: string;
  datesLabel?: string;
};

type TimelineDoc = {
  title?: string;
  startYear?: number;
  endYear?: number;
  events?: TimelineEventDoc[];
};

type TimelineEvent = {
  id: string;
  label: string;
  dates: string;
  start: number;
  end: number;
  continent: string;
};

const timelineQuery = `*[_type == "timeline"][0]{
  title,
  startYear,
  endYear,
  events[]{
    _key,
    label,
    startYear,
    endYear,
    continent,
    datesLabel
  }
}`;

const eventStyleTokens = {
  groupOffsetClass: 'top-1/2',
  dotSizeClass: 'h-2 w-2',
  dotShadow: '0_0_10px_rgba(255,255,255,0.4)',
  labelOffsetRem: 3,
  labelHeightClass: 'h-7',
  labelPaddingClass: 'px-3',
  labelTrackingClass: 'tracking-[0.18em]',
  labelFontSize: '0.55rem',
  labelBorderClass: 'border border-white/60',
  labelBackgroundClass: 'bg-neutral-800/90',
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
  southAmerica: {
    dotColorClass: 'bg-amber-300',
    stemColorClass: 'bg-amber-200/80',
    labelBorderClass: 'border border-amber-200/70',
    labelTextClass: 'text-amber-100 uppercase',
    dotShadow: '0_0_10px_rgba(251,191,36,0.4)',
  },
  asia: {
    dotColorClass: 'bg-rose-300',
    stemColorClass: 'bg-rose-200/80',
    labelBorderClass: 'border border-rose-200/70',
    labelTextClass: 'text-rose-100 uppercase',
    dotShadow: '0_0_10px_rgba(251,113,133,0.4)',
  },
  africa: {
    dotColorClass: 'bg-lime-300',
    stemColorClass: 'bg-lime-200/80',
    labelBorderClass: 'border border-lime-200/70',
    labelTextClass: 'text-lime-100 uppercase',
    dotShadow: '0_0_10px_rgba(163,230,53,0.4)',
  },
  oceania: {
    dotColorClass: 'bg-teal-300',
    stemColorClass: 'bg-teal-200/80',
    labelBorderClass: 'border border-teal-200/70',
    labelTextClass: 'text-teal-100 uppercase',
    dotShadow: '0_0_10px_rgba(45,212,191,0.4)',
  },
  antarctica: {
    dotColorClass: 'bg-cyan-200',
    stemColorClass: 'bg-cyan-100/80',
    labelBorderClass: 'border border-cyan-100/70',
    labelTextClass: 'text-cyan-50 uppercase',
    dotShadow: '0_0_10px_rgba(165,243,252,0.35)',
  },
  global: {
    dotColorClass: 'bg-slate-200',
    stemColorClass: 'bg-slate-100/80',
    labelBorderClass: 'border border-slate-100/70',
    labelTextClass: 'text-slate-100 uppercase',
    dotShadow: '0_0_10px_rgba(226,232,240,0.35)',
  },
} as const;

export default function TimelinePage() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const yearRefs = useRef(new Map<number, HTMLDivElement | null>());
  const labelRefs = useRef(new Map<string, HTMLSpanElement | null>());
  const [isReady, setIsReady] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [timelineStartYear, setTimelineStartYear] = useState(0);
  const [timelineEndYear, setTimelineEndYear] = useState(2026);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [yearStep, setYearStep] = useState<(typeof scaleOptions)[number]>(1);
  const [spacing, setSpacing] = useState(2.5);
  const [eventSpans, setEventSpans] = useState<
    Record<
      string,
      {
        startX: number;
        endX: number;
        lane: number;
        isPoint: boolean;
        anchorX: number;
        spanWidth: number;
        layoutWidth: number;
      }
    >
  >({});
  const [areLabelsHidden, setAreLabelsHidden] = useState(false);
  const [laneSpacingPx, setLaneSpacingPx] = useState(
    eventStyleTokens.laneSpacingRem * 16,
  );
  const [labelOffsetPx, setLabelOffsetPx] = useState(
    (eventStyleTokens.topPaddingRem + eventStyleTokens.labelOffsetRem) * 16,
  );
  const [containerHeight, setContainerHeight] = useState(0);
  const [trackTailPaddingPx, setTrackTailPaddingPx] = useState(0);
  const [labelMeasureTick, setLabelMeasureTick] = useState(0);

  const estimateLabelWidth = (text: string) => {
    const approxCharWidth = 7;
    const padding = 24;
    return Math.max(90, text.length * approxCharWidth + padding);
  };

  useEffect(() => {
    let isActive = true;

    const loadTimeline = async () => {
      try {
        const doc = await client.fetch<TimelineDoc | null>(timelineQuery);
        if (!isActive) return;

        const events = (doc?.events ?? [])
          .map((event, index) => {
            const start = event.startYear ?? 0;
            const end = event.endYear ?? start;
            const label = event.label ?? 'Untitled event';
            const dates =
              event.datesLabel ??
              (start === end ? `${start}` : `${start}-${end}`);
            return {
              id: event._key ?? `${label}-${index}`,
              label,
              dates,
              start,
              end,
              continent: event.continent ?? 'global',
            };
          })
          .filter(
            (event) => Number.isFinite(event.start) && Number.isFinite(event.end),
          );

        setTimelineStartYear(doc?.startYear ?? 0);
        setTimelineEndYear(doc?.endYear ?? 2026);
        setTimelineEvents(events);
        setLoadError(null);
      } catch {
        if (!isActive) return;
        setLoadError('Unable to load timeline events right now.');
      } finally {
        if (!isActive) return;
        setIsDataLoaded(true);
      }
    };

    loadTimeline();

    return () => {
      isActive = false;
    };
  }, []);

  const years = useMemo(() => {
    const values: number[] = [];
    for (let year = timelineStartYear; year <= timelineEndYear; year += yearStep) {
      values.push(year);
    }
    if (values[values.length - 1] !== timelineEndYear) {
      values.push(timelineEndYear);
    }
    return values;
  }, [timelineStartYear, timelineEndYear, yearStep]);

  const highlightYears = useMemo(() => {
    const highlighted = new Set<number>();
    highlighted.add(timelineStartYear);
    highlighted.add(timelineEndYear);
    timelineEvents.forEach((event) => {
      highlighted.add(event.start);
      highlighted.add(event.end);
    });
    return highlighted;
  }, [timelineStartYear, timelineEndYear, timelineEvents]);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    if (!isDataLoaded) return;
    container.scrollLeft = container.scrollWidth - container.clientWidth;
    setIsReady(true);
  }, [isDataLoaded, yearStep]);

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
        spanWidth: number;
        layoutWidth: number;
      }> = [];

      timelineEvents.forEach((event) => {
        const startX = resolveYearX(event.start);
        const endX = resolveYearX(event.end);
        if (startX === null || endX === null) return;
        const isPoint = event.start === event.end;
        const labelText = `${event.label} ${event.dates}`;
        const measuredNode = labelRefs.current.get(event.id);
        const measuredWidth = measuredNode
          ? measuredNode.getBoundingClientRect().width
          : undefined;
        const labelWidth =
          measuredWidth !== undefined && measuredWidth > 0
            ? measuredWidth + 2
            : estimateLabelWidth(labelText);
        if (isPoint) {
          const layoutWidth = labelWidth;
          spanCandidates.push({
            id: event.id,
            startX,
            endX: startX + layoutWidth,
            isPoint: true,
            anchorX: startX,
            spanWidth: 0,
            layoutWidth,
          });
        } else {
          let adjustedEndX = endX;
          if (endX <= startX) {
            adjustedEndX = startX + eventStyleTokens.minSpanPx;
          } else if (endX - startX < eventStyleTokens.minSpanPx) {
            adjustedEndX = startX + eventStyleTokens.minSpanPx;
          }
          const spanWidth = adjustedEndX - startX;
          const layoutWidth = Math.max(spanWidth, labelWidth);
          spanCandidates.push({
            id: event.id,
            startX,
            endX: startX + layoutWidth,
            isPoint: false,
            anchorX: startX,
            spanWidth,
            layoutWidth,
          });
        }
      });

      spanCandidates.sort((a, b) => a.startX - b.startX);
      const lanes: number[] = [];
      const nextSpans: Record<
        string,
        {
          startX: number;
          endX: number;
          lane: number;
          isPoint: boolean;
          anchorX: number;
          spanWidth: number;
          layoutWidth: number;
        }
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

      const nextTailPadding = Math.max(
        0,
        ...Object.values(nextSpans).map((span) => span.layoutWidth - span.spanWidth),
      );
      setTrackTailPaddingPx((prev) =>
        Math.abs(prev - nextTailPadding) > 1 ? nextTailPadding : prev,
      );

      const maxLane = Math.max(0, lanes.length - 1);
      const defaultBaseOffsetPx =
        (eventStyleTokens.topPaddingRem + eventStyleTokens.labelOffsetRem) * 16;
      const labelHeightPx = 28;
      const safetyPaddingPx = 16;
      let nextBaseOffsetPx = defaultBaseOffsetPx;
      let nextLaneSpacingPx = eventStyleTokens.laneSpacingRem * 16;
      if (containerHeight) {
        const halfHeight = containerHeight / 2;
        const maxBaseOffset =
          halfHeight - labelHeightPx - safetyPaddingPx;
        if (Number.isFinite(maxBaseOffset) && maxBaseOffset > 0) {
          nextBaseOffsetPx = Math.min(defaultBaseOffsetPx, maxBaseOffset);
        } else {
          nextBaseOffsetPx = Math.max(8, halfHeight - labelHeightPx);
        }
        if (maxLane > 0) {
          const available =
            halfHeight - nextBaseOffsetPx - labelHeightPx - safetyPaddingPx;
          if (available > 0) {
            nextLaneSpacingPx = Math.min(
              nextLaneSpacingPx,
              Math.max(14, available / maxLane),
            );
          }
        }
      }
      setLabelOffsetPx((prev) =>
        Math.abs(prev - nextBaseOffsetPx) > 0.5 ? nextBaseOffsetPx : prev,
      );
      setLaneSpacingPx((prev) =>
        Math.abs(prev - nextLaneSpacingPx) > 0.5 ? nextLaneSpacingPx : prev,
      );
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
  }, [timelineEvents, years, containerHeight, labelMeasureTick]);

  useLayoutEffect(() => {
    setAreLabelsHidden(true);
    const delayTimeout = window.setTimeout(() => {
      setAreLabelsHidden(false);
    }, labelDelayMs);
    return () => window.clearTimeout(delayTimeout);
  }, [yearStep, spacing]);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const updateHeight = () => {
      setContainerHeight(container.clientHeight);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fonts = document.fonts;
    if (!fonts || !fonts.ready) return;
    let isActive = true;
    fonts.ready.then(() => {
      if (!isActive) return;
      setLabelMeasureTick((prev) => prev + 1);
    });
    return () => {
      isActive = false;
    };
  }, []);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    container.scrollLeft += event.deltaY;
    event.preventDefault();
  };

  return (
    <main
      className={`min-h-screen text-white bg-black ${openSans.className}`}
    >
      <div className="min-h-screen flex flex-col">
        <section className="relative z-10 h-screen px-6 sm:px-10 pb-12 pt-16">
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
                {step}yr
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
          {loadError ? (
            <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-red-100">
              {loadError}
            </div>
          ) : isDataLoaded && timelineEvents.length === 0 ? (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-white/60">
              No timeline events yet.
            </div>
          ) : null}
          <div
            ref={scrollRef}
            onWheel={handleWheel}
            className="h-full overflow-x-auto overflow-y-visible snap-x snap-proximity touch-pan-x scrollbar-hidden"
            style={{ visibility: isReady ? 'visible' : 'hidden' }}
          >
            <div
              ref={trackRef}
              className="relative flex h-full items-center py-16 min-w-max"
              style={{ gap: `${spacing}rem`, transition: 'gap 200ms ease' }}
            >
              <div className="absolute left-0 right-0 top-1/2 h-px bg-white/20" />
              <div className="absolute left-0 top-0 opacity-0 pointer-events-none whitespace-nowrap">
                {timelineEvents.map((event) => (
                  <span
                    key={`${event.id}-measure`}
                    ref={(node) => {
                      if (node) {
                        labelRefs.current.set(event.id, node);
                      } else {
                        labelRefs.current.delete(event.id);
                      }
                    }}
                    className={`inline-flex ${eventStyleTokens.labelHeightClass} items-center ${eventStyleTokens.labelPaddingClass} ${eventStyleTokens.labelTrackingClass} ${eventStyleTokens.labelTextClass} w-max max-w-none`}
                    style={{ fontSize: eventStyleTokens.labelFontSize }}
                  >
                    {event.label} {event.dates}
                  </span>
                ))}
              </div>
              {timelineEvents.map((event) => {
                const span = eventSpans[event.id];
                if (!span) return null;
                const width = span.layoutWidth;
                const spanWidth = span.spanWidth;
                const anchorOffset = span.anchorX - span.startX;
                const labelTopPx = labelOffsetPx + span.lane * laneSpacingPx;
                const continentStyle =
                  continentStyles[
                    event.continent as keyof typeof continentStyles
                  ] ?? eventStyleTokens;
                return (
                  <div
                    key={event.id}
                    className={`group absolute ${eventStyleTokens.groupOffsetClass}`}
                    style={{
                      left: span.startX,
                      width,
                      opacity: areLabelsHidden ? 0 : 1,
                      transition: `opacity ${labelTransitionMs}ms ease`,
                    }}
                  >
                    <span
                      className={`absolute top-0 ${eventStyleTokens.dotSizeClass} -translate-x-1/2 rounded-full ${continentStyle.dotColorClass} pointer-events-none opacity-70 transition duration-150 group-hover:scale-150 group-hover:opacity-100`}
                      style={{ left: anchorOffset, boxShadow: continentStyle.dotShadow }}
                    />
                    {!span.isPoint && (
                      <span
                        className={`absolute top-0 ${eventStyleTokens.dotSizeClass} -translate-x-1/2 rounded-full ${continentStyle.dotColorClass} pointer-events-none opacity-70 transition duration-150 group-hover:scale-150 group-hover:opacity-100`}
                        style={{ left: spanWidth, boxShadow: continentStyle.dotShadow }}
                      />
                    )}
                    <span
                      className={`absolute top-0 w-px -translate-x-1/2 ${continentStyle.stemColorClass} pointer-events-none`}
                      style={{ left: anchorOffset, height: labelTopPx }}
                    />
                    {!span.isPoint && (
                      <span
                        className={`absolute top-0 w-px -translate-x-1/2 ${continentStyle.stemColorClass} pointer-events-none`}
                        style={{ left: spanWidth, height: labelTopPx }}
                      />
                    )}
                    <span
                      className={`absolute left-0 flex ${eventStyleTokens.labelHeightClass} items-center justify-start ${continentStyle.labelBorderClass} ${eventStyleTokens.labelBackgroundClass} ${continentStyle.labelTextClass} ${eventStyleTokens.labelTrackingClass} ${eventStyleTokens.labelPaddingClass} whitespace-nowrap w-max max-w-none relative z-10 hover:z-40`}
                      style={{
                        top: labelTopPx,
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
                      className={`mb-2 ${
                        isDecade ? 'tracking-[0.4em]' : 'tracking-[0.2em]'
                      } ${isHighlight ? 'text-white' : 'text-white/70'}`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {year}
                    </span>
                    {isDecade && (
                      <span
                        className="mb-3 uppercase tracking-[0.3em] text-white/40"
                        style={{ fontSize: '0.5rem' }}
                      >
                        Decade
                      </span>
                    )}
                    <span
                      className={`block w-px ${isHighlight ? 'bg-white' : 'bg-white/60'}`}
                      style={{ height: `${isDecade ? 4 : 2.5}rem` }}
                    />
                  </div>
                );
              })}
              <div
                aria-hidden
                className="shrink-0"
                style={{ width: trackTailPaddingPx }}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
