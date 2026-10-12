"use client";

import { Children, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { classNames } from "@/components/ui/class-names";
import { Icon } from "@/components/ui/core/icon";
import { IconButton } from "@/components/ui/core/icon-button";

/** The words of the carousel, all from the dictionaries. */
export type CarouselLabels = {
  /** What the region is, in place of "region": for example "carrossel". */
  roleDescription: string;
  /** What each slide is, in place of "group": for example "diapositivo". */
  slideRoleDescription: string;
  /** The name of a slide, with `{index}` and `{total}`: "{index} de {total}". */
  slide: string;
  pause: string;
  play: string;
  previous: string;
  next: string;
};

export type CarouselProps = Omit<
  React.ComponentProps<"section">,
  "style" | "aria-label" | "aria-roledescription" | "onFocus"
> & {
  /** The name of the region, without the word "carousel". */
  label: string;
  labels: CarouselLabels;
  /** Shown above the slides; from 44rem the controls share its line. */
  heading?: React.ReactNode;
  /** Shown in place of the slides when there are none. */
  emptyMessage: string;
  /** Milliseconds a page stays before the next one comes. */
  interval?: number;
  /** One child per slide. */
  children?: React.ReactNode;
};

type Layout = {
  /** How many slides fit side by side. */
  perView: number;
  /** The first slide in view. */
  start: number;
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// One, two, three or four slides per view from 0, 44, 60 and 76 rem of the
// carousel's own width: screens of 320, 768, 1024 and 1440 px with the
// gutters of the page. In CSS, so the row is right before the script runs.
const SLIDE_CLASSES =
  "grid min-w-0 shrink-0 grow-0 basis-full @[44rem]:basis-[calc((100%-var(--space-5))/2)] @[60rem]:basis-[calc((100%-2*var(--space-5))/3)] @[76rem]:basis-[calc((100%-3*var(--space-5))/4)]";

// White on the page surface and on the subtle one. The outline variant sets
// no background at rest, so this repeats nothing.
const CONTROL_CLASSES = "bg-surface-card";

function subscribeToReducedMotion(onChange: () => void): () => void {
  const media = window.matchMedia(REDUCED_MOTION);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

function slidesOf(viewport: HTMLElement): HTMLElement[] {
  return Array.from(viewport.children) as HTMLElement[];
}

// Read from what the browser laid out and scrolled: the CSS decides how many
// slides fit, and the visitor may have scrolled by hand.
function readLayout(viewport: HTMLElement): Layout {
  const slides = slidesOf(viewport);
  const first = slides[0];
  if (!first || first.offsetWidth === 0) return { perView: 1, start: 0 };

  const scrolled = first.offsetLeft + viewport.scrollLeft;
  const distance = (slide: HTMLElement) => Math.abs(slide.offsetLeft - scrolled);
  const start = slides.reduce(
    (nearest, slide, index) => (distance(slide) < distance(slides[nearest]) ? index : nearest),
    0,
  );

  return { perView: Math.max(1, Math.round(viewport.clientWidth / first.offsetWidth)), start };
}

// The first slide of a page. Past either end it wraps, and the last page
// starts early enough to be full.
function firstSlideOfPage(page: number, pages: number, perView: number, count: number): number {
  const wrapped = (page + pages) % pages;
  return Math.max(0, Math.min(wrapped * perView, count - perView));
}

// How it gets there (a slide, or at once under reduced motion) is in the CSS.
function scrollToSlide(viewport: HTMLElement | null, index: number) {
  if (!viewport) return;
  const slides = slidesOf(viewport);
  viewport.scrollTo({ left: slides[index].offsetLeft - slides[0].offsetLeft });
}

function isKeyboardFocus(element: Element): boolean {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

/**
 * A row of cards that shows a few at a time and moves to the next ones by
 * itself (APG carousel pattern). The row is a scroll container with snap
 * points, so touch and trackpad move it as any other; the buttons and the
 * rotation scroll it. The rotation control comes first, and the rotation
 * holds under the pointer, stops for good on keyboard focus and does not start
 * for a visitor who asked for reduced motion.
 */
export function Carousel({
  label,
  labels,
  heading,
  emptyMessage,
  interval = 6000,
  className,
  children,
  ...sectionProps
}: CarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const viewport = useRef<HTMLDivElement>(null);
  // Unknown until measured: on the server, and in a page without script,
  // every slide stays reachable.
  const [layout, setLayout] = useState<Layout | null>(null);
  // What the visitor chose with the rotation control, or by focusing inside.
  const [chosen, setChosen] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const perView = Math.min(layout?.perView ?? 1, Math.max(1, count));
  const pages = Math.ceil(count / perView);
  const start = Math.min(layout?.start ?? 0, Math.max(0, count - perView));
  const page = Math.min(pages - 1, Math.ceil(start / perView));
  const paged = pages > 1;
  // Numbers and a separator, the same in every language.
  const position = [page + 1, pages].join(" / ");
  const playing = chosen ?? !reducedMotion;
  const rotating = paged && playing && !hovered;

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const measure = () => {
      const next = readLayout(element);
      setLayout((current) =>
        current?.perView === next.perView && current.start === next.start ? current : next,
      );
    };
    measure();
    element.addEventListener("scroll", measure, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(element);
    return () => {
      element.removeEventListener("scroll", measure);
      observer?.disconnect();
    };
  }, [count]);

  useEffect(() => {
    if (!rotating) return;
    const timer = setTimeout(() => {
      scrollToSlide(viewport.current, firstSlideOfPage(page + 1, pages, perView, count));
    }, interval);
    return () => clearTimeout(timer);
  }, [rotating, page, pages, perView, count, interval]);

  const goTo = (target: number) => {
    scrollToSlide(viewport.current, firstSlideOfPage(target, pages, perView, count));
  };

  // Keyboard focus coming in stops the rotation, and only the control starts
  // it again. Focus moving inside changes nothing, or the control could never
  // be used to resume.
  const stopOnKeyboardFocus = (event: React.FocusEvent<HTMLElement>) => {
    const cameFromInside =
      event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget);
    if (!cameFromInside && isKeyboardFocus(event.target)) setChosen(false);
  };

  return (
    <section
      {...sectionProps}
      aria-roledescription={labels.roleDescription}
      aria-label={label}
      onFocus={stopOnKeyboardFocus}
      className={classNames("@container", className)}
    >
      <div className="grid gap-4 @[44rem]:grid-cols-[1fr_auto] @[44rem]:items-end @[44rem]:gap-6">
        {heading && <div className="min-w-0">{heading}</div>}
        {paged && (
          // Before the slides in the page, so the rotation control is the
          // first stop; under them on a narrow carousel.
          <div className="order-1 flex items-center gap-2 @[44rem]:order-none @[44rem]:col-start-2">
            <IconButton
              variant="outline"
              size="lg"
              icon={playing ? "pause" : "play"}
              label={playing ? labels.pause : labels.play}
              onClick={() => setChosen(!playing)}
              className={CONTROL_CLASSES}
            />
            {/* The slides say their own position, so this is not read out. */}
            <div
              aria-hidden="true"
              className="flex min-w-0 flex-1 items-center gap-3 px-2 @[44rem]:flex-none"
            >
              <span className="flex h-2 flex-1 @[44rem]:w-24 @[44rem]:flex-none">
                {Array.from({ length: pages }, (_, index) => (
                  <span
                    key={index}
                    className={classNames(
                      "flex-1 transition-colors",
                      index === page ? "bg-surface-inverse" : "bg-border-default",
                    )}
                  />
                ))}
              </span>
              <span className="font-mono text-xs leading-tight font-semibold whitespace-nowrap text-text-muted tabular-nums">
                {position}
              </span>
            </div>
            <IconButton
              variant="outline"
              size="lg"
              icon="arrow-left"
              label={labels.previous}
              onClick={() => goTo(page - 1)}
              className={CONTROL_CLASSES}
            />
            <IconButton
              variant="outline"
              size="lg"
              icon="arrow-right"
              label={labels.next}
              onClick={() => goTo(page + 1)}
              className={CONTROL_CLASSES}
            />
          </div>
        )}
        {count === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border-default bg-surface-card px-6 py-12 text-center text-text-subtle @[44rem]:col-span-2">
            <Icon name="package-open" size="lg" />
            <p className="text-sm leading-body text-text-muted">{emptyMessage}</p>
          </div>
        ) : (
          <div
            ref={viewport}
            aria-live={playing ? "off" : "polite"}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] motion-reduce:scroll-auto @[44rem]:col-span-2"
          >
            {slides.map((slide, index) => {
              const outOfView = layout !== null && (index < start || index >= start + perView);
              return (
                <div
                  key={index}
                  role="group"
                  aria-roledescription={labels.slideRoleDescription}
                  aria-label={labels.slide
                    .replace("{index}", String(index + 1))
                    .replace("{total}", String(count))}
                  aria-hidden={outOfView || undefined}
                  inert={outOfView}
                  className={classNames(SLIDE_CLASSES, index % perView === 0 && "snap-start")}
                >
                  {slide}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
