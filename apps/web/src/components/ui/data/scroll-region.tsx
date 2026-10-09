"use client";

import { useEffect, useRef, useState } from "react";
import { classNames } from "@/components/ui/class-names";

export type ScrollRegionProps = Omit<
  React.ComponentProps<"div">,
  "style" | "role" | "tabIndex" | "aria-labelledby"
> & {
  /** The id of the element that names the region, for example a caption. */
  labelledBy: string;
};

/**
 * A container that scrolls sideways. While its content is wider than it, it is
 * a tab stop, so the keyboard can scroll it, and a region with a name, so the
 * stop says what it is. While the content fits it is neither.
 */
export function ScrollRegion({ labelledBy, className, children, ...divProps }: ScrollRegionProps) {
  const element = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const region = element.current;
    if (!region) return;
    const measure = () => setOverflowing(region.scrollWidth > region.clientWidth);
    // Measured once here: the observer's first report comes with a frame, and
    // a tab that is not visible draws none.
    measure();
    if (typeof ResizeObserver === "undefined") return;
    // Then on every change of size of the container or of what is in it.
    const observer = new ResizeObserver(measure);
    observer.observe(region);
    for (const child of region.children) observer.observe(child);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      {...divProps}
      ref={element}
      role={overflowing ? "region" : undefined}
      aria-labelledby={overflowing ? labelledBy : undefined}
      tabIndex={overflowing ? 0 : undefined}
      className={classNames("overflow-x-auto", className)}
    >
      {children}
    </div>
  );
}
