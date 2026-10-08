"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { classNames } from "@/components/ui/class-names";
import { Icon, type IconName } from "@/components/ui/core/icon";
import { IconButton } from "@/components/ui/core/icon-button";

type ToastTone = "neutral" | "success" | "info" | "danger";

type ToastClosing =
  | { onClose: () => void; /** The accessible name of the close button. */ closeLabel: string }
  | { onClose?: undefined; closeLabel?: undefined };

// A toast with an action stays: the user needs the time to reach the action.
type ToastLasting =
  | { action?: React.ReactNode; duration?: undefined }
  | {
      action?: undefined;
      /** Milliseconds before the toast closes itself. Without it, it stays. */
      duration?: number;
    };

export type ToastProps = {
  tone?: ToastTone;
  title: string;
  message?: string;
  className?: string;
} & ToastClosing &
  ToastLasting;

export type ToasterProps = Omit<
  React.ComponentProps<"div">,
  "style" | "role" | "aria-label" | "aria-live"
> & {
  /** The accessible name of the region, for example "Notifications". */
  label: string;
};

/** No toast closes itself sooner: there must be time to read it. */
const MINIMUM_DURATION_MS = 5000;

// Each tone has its own icon shape, so the tone is not carried by colour alone.
const TONES: Record<ToastTone, { icon: IconName; className: string }> = {
  neutral: { icon: "bell", className: "text-yellow" },
  success: { icon: "circle-check", className: "text-status-success" },
  info: { icon: "info", className: "text-status-info" },
  danger: { icon: "circle-alert", className: "text-status-danger" },
};

/**
 * A short message about something that just happened. A `status`, or an
 * `alert` for the danger tone. It holds no state: the caller shows it and
 * removes it in `onClose`.
 */
export function Toast({
  tone = "neutral",
  title,
  message,
  action,
  duration,
  closeLabel,
  onClose,
  className,
}: ToastProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const waiting = hovered || focused;
  const timeBar = useRef<HTMLSpanElement>(null);
  const close = useEffectEvent(() => onClose?.());

  // The time starts again when the pointer and the focus have left. The bar
  // fills over the same time, so the toast is seen to be about to close; it is
  // animated here because its length is a prop, which no class can carry.
  useEffect(() => {
    if (duration === undefined || waiting) return;
    const time = Math.max(duration, MINIMUM_DURATION_MS);
    const timer = setTimeout(close, time);
    const filling = timeBar.current?.animate?.([{ scale: "0 1" }, { scale: "1 1" }], {
      duration: time,
      fill: "forwards",
    });
    return () => {
      clearTimeout(timer);
      filling?.cancel();
    };
  }, [duration, waiting]);

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      data-surface="inverse"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={classNames(
        "pointer-events-auto relative flex w-90 max-w-full items-start gap-3 rounded-md bg-surface-inverse py-3.5 pr-3.5 pl-4 text-text-inverse shadow-lg",
        className,
      )}
    >
      <Icon name={TONES[tone].icon} className={classNames("mt-px", TONES[tone].className)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {message && <p className="text-sm text-text-inverse-muted">{message}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && (
        <IconButton
          icon="x"
          size="sm"
          variant="ghost-inverse"
          label={closeLabel}
          onClick={onClose}
        />
      )}
      {duration !== undefined && (
        // Clipped to the corners of the toast. Decoration: the words say what
        // happened, and nothing depends on reading the bar.
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-md"
        >
          <span
            ref={timeBar}
            data-toast-timer
            className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-yellow"
          />
        </span>
      )}
    </div>
  );
}

/**
 * Where toasts appear. It is rendered once, empty, with the page: a live
 * region announces what is added to it only if it was there before. Only the
 * toasts take the pointer; the rest of the region lets clicks through.
 */
export function Toaster({ label, className, ...divProps }: ToasterProps) {
  return (
    <div
      {...divProps}
      role="region"
      aria-label={label}
      aria-live="polite"
      className={classNames(
        "pointer-events-none fixed inset-x-4 bottom-4 z-(--z-toast) flex flex-col items-end gap-2 sm:left-auto",
        className,
      )}
    />
  );
}
