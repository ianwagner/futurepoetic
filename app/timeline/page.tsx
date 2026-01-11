'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Open_Sans } from 'next/font/google';
import { client } from '@/sanity/lib/client';

const openSans = Open_Sans({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
});

const scaleOptions = [1, 10, 25, 50] as const;
  const eventTypeOptions = ['politics', 'economy', 'art', 'war', 'science'] as const;
const spacingRange = { min: 1.5, max: 5, step: 0.1 };
const labelTransitionMs = 300;
const labelDelayMs = 150;

type EventType = (typeof eventTypeOptions)[number];

type TimelineEventDoc = {
  _key?: string;
  label?: string;
  startYear?: number;
  endYear?: number;
  continent?: string;
  eventType?: EventType;
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
  eventType: EventType;
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
    eventType,
    datesLabel
  }
}`;

const eventStyleTokens = {
  groupOffsetClass: 'top-0',
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
  topPaddingRem: 7,
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
  const filterMenuRef = useRef<HTMLDivElement | null>(null);
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
    eventStyleTokens.labelOffsetRem * 16,
  );
  const [containerHeight, setContainerHeight] = useState(0);
  const [trackTailPaddingPx, setTrackTailPaddingPx] = useState(0);
  const [labelMeasureTick, setLabelMeasureTick] = useState(0);
  const [axisTopPx, setAxisTopPx] = useState(0);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const baselinePx = eventStyleTokens.topPaddingRem * 16;
  const continentOptions = Object.keys(continentStyles) as Array<
    keyof typeof continentStyles
  >;
  const [activeContinents, setActiveContinents] = useState<string[]>(
    continentOptions,
  );
  const [activeEventTypes, setActiveEventTypes] = useState<
    Array<(typeof eventTypeOptions)[number]>
  >(() => [...eventTypeOptions]);
  const continentLabels: Record<keyof typeof continentStyles, string> = {
    europe: 'Europe',
    northAmerica: 'North America',
    southAmerica: 'South America',
    asia: 'Asia',
    africa: 'Africa',
    oceania: 'Oceania',
    antarctica: 'Antarctica',
    global: 'Global',
  };
  const eventTypeLabels: Record<(typeof eventTypeOptions)[number], string> = {
    politics: 'Politics',
    economy: 'Economy',
    art: 'Art',
    war: 'War',
    science: 'Science',
  };

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
              eventType: event.eventType ?? 'politics',
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

  const filteredEvents = useMemo(() => {
    if (activeContinents.length === 0 || activeEventTypes.length === 0) {
      return [];
    }
    return timelineEvents.filter((event) =>
      activeContinents.includes(event.continent) &&
      activeEventTypes.includes(event.eventType),
    );
  }, [timelineEvents, activeContinents, activeEventTypes]);

  const highlightYears = useMemo(() => {
    const highlighted = new Set<number>();
    highlighted.add(timelineStartYear);
    highlighted.add(timelineEndYear);
    filteredEvents.forEach((event) => {
      highlighted.add(event.start);
      highlighted.add(event.end);
    });
    return highlighted;
  }, [timelineStartYear, timelineEndYear, filteredEvents]);

  useEffect(() => {
    if (!isFilterMenuOpen) return;
    const handlePointer = (event: MouseEvent) => {
      if (!filterMenuRef.current) return;
      if (!filterMenuRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFilterMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handlePointer);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handlePointer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isFilterMenuOpen]);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    if (!isDataLoaded) return;
    let rafId: number | null = null;
    rafId = window.requestAnimationFrame(() => {
      const lastYear = years[years.length - 1];
      const lastNode = yearRefs.current.get(lastYear) ?? null;
      const maxScroll = container.scrollWidth - container.clientWidth;
      let targetScroll = Math.max(0, maxScroll - trackTailPaddingPx);
      if (lastNode) {
        targetScroll = lastNode.offsetLeft + lastNode.offsetWidth - container.clientWidth;
      }
      container.scrollLeft = Math.max(0, Math.min(targetScroll, maxScroll));
      setIsReady(true);
    });
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [isDataLoaded, yearStep, years, trackTailPaddingPx]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const container = scrollRef.current;
    if (!track || !container) return;

    let rafId: number | null = null;
    let delayTimeout: number | null = null;
    const updateSpans = () => {
      const trackRect = track.getBoundingClientRect();
      const anchorPositions = new Map<number, number>();
      const axisOffsets: number[] = [];
      years.forEach((year) => {
        const anchor = yearRefs.current.get(year);
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        anchorPositions.set(
          year,
          rect.left - trackRect.left + rect.width / 2,
        );
        const axisLine = anchor.querySelector<HTMLElement>('[data-axis-line]');
        if (axisLine) {
          axisOffsets.push(anchor.offsetTop + axisLine.offsetTop);
        }
      });
      const nextAxisTopPx =
        axisOffsets.length > 0 ? Math.max(...axisOffsets) : baselinePx;

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

      filteredEvents.forEach((event) => {
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
      const defaultBaseOffsetPx = eventStyleTokens.labelOffsetRem * 16;
      const labelHeightPx = 28;
      const safetyPaddingPx = 16;
      let nextBaseOffsetPx = defaultBaseOffsetPx;
      let nextLaneSpacingPx = eventStyleTokens.laneSpacingRem * 16;
      if (containerHeight) {
        const maxAllowedTop =
          containerHeight - nextAxisTopPx - labelHeightPx - safetyPaddingPx;
        const minBaseOffset = 8;
        if (Number.isFinite(maxAllowedTop)) {
          nextBaseOffsetPx = Math.min(defaultBaseOffsetPx, maxAllowedTop);
          nextBaseOffsetPx = Math.max(nextBaseOffsetPx, minBaseOffset);
        }
        if (maxLane > 0) {
          const available = maxAllowedTop - nextBaseOffsetPx;
          if (available > 0) {
            nextLaneSpacingPx = Math.min(
              nextLaneSpacingPx,
              Math.max(12, available / maxLane),
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
      setAxisTopPx((prev) =>
        Math.abs(prev - nextAxisTopPx) > 0.5 ? nextAxisTopPx : prev,
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
  }, [filteredEvents, years, containerHeight, labelMeasureTick, baselinePx]);

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
          <div className="absolute right-6 top-6 z-20 flex flex-col items-end gap-3 text-[11px] uppercase tracking-[0.35em] text-white/60 pointer-events-auto">
            <div className="relative" ref={filterMenuRef}>
              <button
                type="button"
                onClick={() => setIsFilterMenuOpen((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur transition hover:border-[#F78326] hover:text-[#F78326] hover:scale-105"
                aria-haspopup="true"
                aria-expanded={isFilterMenuOpen}
                aria-label="Toggle timeline filters"
              >
                <span className="flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-current" />
                  <span className="h-1 w-1 rounded-full bg-current" />
                  <span className="h-1 w-1 rounded-full bg-current" />
                </span>
              </button>
              {isFilterMenuOpen ? (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/20 bg-neutral-900/95 p-3 text-[10px] uppercase tracking-[0.25em] text-white/70 shadow-2xl">
                  <div className="mb-2 text-[9px] text-white/40">
                    Year Scale
                  </div>
                  <div className="flex flex-wrap gap-2">
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
                  <div className="my-3 h-px bg-white/10" />
                  <div className="mb-2 text-[9px] text-white/40">
                    Continents
                  </div>
                  <div className="flex flex-col gap-2">
                    {continentOptions.map((continent) => (
                      <label
                        key={continent}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={activeContinents.includes(continent)}
                          onChange={() => {
                            setActiveContinents((prev) =>
                              prev.includes(continent)
                                ? prev.filter((entry) => entry !== continent)
                                : [...prev, continent],
                            );
                          }}
                          className="h-3 w-3 rounded border border-white/40 bg-transparent text-white accent-white"
                        />
                        <span
                          className={`h-2 w-2 rounded-full ${continentStyles[continent].dotColorClass}`}
                        />
                        <span className="text-white/80">
                          {continentLabels[continent]}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="my-3 h-px bg-white/10" />
                  <div className="mb-2 text-[9px] text-white/40">
                    Event Type
                  </div>
                  <div className="flex flex-col gap-2">
                    {eventTypeOptions.map((eventType) => (
                      <label key={eventType} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={activeEventTypes.includes(eventType)}
                          onChange={() => {
                            setActiveEventTypes((prev) =>
                              prev.includes(eventType)
                                ? prev.filter((entry) => entry !== eventType)
                                : [...prev, eventType],
                            );
                          }}
                          className="h-3 w-3 rounded border border-white/40 bg-transparent text-white accent-white"
                        />
                        <span className="text-white/80">
                          {eventTypeLabels[eventType]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="absolute left-1/2 top-20 z-20 flex w-[calc(100%-3rem)] -translate-x-1/2 items-center justify-center gap-3 text-[11px] uppercase tracking-[0.35em] text-white/60 pointer-events-auto sm:left-auto sm:right-6 sm:top-20 sm:w-auto sm:translate-x-0 sm:justify-end">
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
          ) : isDataLoaded && filteredEvents.length === 0 ? (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-white/60">
              No events match your filters.
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
            className="relative flex h-full items-start min-w-max"
            style={{
              gap: `${spacing}rem`,
              transition: 'gap 200ms ease',
              paddingTop: baselinePx,
            }}
          >
              <div
                className="absolute left-0 right-0 h-px bg-white/20"
                style={{ top: axisTopPx }}
              />
              <div className="absolute left-0 top-0 opacity-0 pointer-events-none whitespace-nowrap">
                {filteredEvents.map((event) => (
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
              {filteredEvents.map((event) => {
                const span = eventSpans[event.id];
                if (!span) return null;
                const width = span.layoutWidth;
                const spanWidth = span.spanWidth;
                const anchorOffset = span.anchorX - span.startX;
                const labelTopPx =
                  axisTopPx + labelOffsetPx + span.lane * laneSpacingPx;
                const stemHeightPx = labelTopPx - axisTopPx;
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
                      top: 0,
                      width,
                      opacity: areLabelsHidden ? 0 : 1,
                      transition: `opacity ${labelTransitionMs}ms ease`,
                    }}
                  >
                    <span
                      className={`absolute ${eventStyleTokens.dotSizeClass} -translate-x-1/2 rounded-full ${continentStyle.dotColorClass} pointer-events-none opacity-70 transition duration-150 group-hover:scale-150 group-hover:opacity-100`}
                      style={{
                        left: anchorOffset,
                        top: axisTopPx,
                        boxShadow: continentStyle.dotShadow,
                      }}
                    />
                    {!span.isPoint && (
                      <span
                        className={`absolute ${eventStyleTokens.dotSizeClass} -translate-x-1/2 rounded-full ${continentStyle.dotColorClass} pointer-events-none opacity-70 transition duration-150 group-hover:scale-150 group-hover:opacity-100`}
                        style={{
                          left: spanWidth,
                          top: axisTopPx,
                          boxShadow: continentStyle.dotShadow,
                        }}
                      />
                    )}
                    <span
                      className={`absolute w-px -translate-x-1/2 ${continentStyle.stemColorClass} pointer-events-none`}
                      style={{
                        left: anchorOffset,
                        top: axisTopPx,
                        height: stemHeightPx,
                      }}
                    />
                    {!span.isPoint && (
                      <span
                        className={`absolute w-px -translate-x-1/2 ${continentStyle.stemColorClass} pointer-events-none`}
                        style={{
                          left: spanWidth,
                          top: axisTopPx,
                          height: stemHeightPx,
                        }}
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
                      data-axis-line
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
