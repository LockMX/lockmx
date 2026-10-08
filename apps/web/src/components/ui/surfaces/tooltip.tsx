"use client";

import { cloneElement, useEffect, useId, useState } from "react";
import { classNames } from "@/components/ui/class-names";

type TooltipPlacement = "top" | "bottom";

export type TooltipProps = {
  /** A short description. Never the only place a needed piece of information is. */
  content: string;
  placement?: TooltipPlacement;
  /** Layout only, for the wrapper around the trigger. */
  className?: string;
  /** The trigger: one focusable element, which is given `aria-describedby`. */
  children: React.ReactElement<{ "aria-describedby"?: string }>;
};

// The padding is the gap between trigger and tooltip. It belongs to the
// tooltip, so the pointer can cross it without leaving (WCAG 1.4.13).
const PLACEMENT_CLASSES: Record<TooltipPlacement, string> = {
  top: "bottom-full pb-2",
  bottom: "top-full pt-2",
};

/**
 * A description shown while its trigger is hovered or focused, and dismissed
 * with Escape. It stays in the page when hidden, so it describes the trigger
 * for assistive technology either way.
 */
export function Tooltip({
  content,
  placement = "top",
  className,
  children,
}: TooltipProps) {
  const id = useId();
  // Hover and focus are kept apart: the tooltip stays while either one lasts
  // (WCAG 1.4.13, persistent). Escape dismisses it until the next one starts.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const open = (hovered || focused) && !dismissed;

  function start(setTrigger: (active: boolean) => void) {
    setDismissed(false);
    setTrigger(true);
  }

  // On the document: a tooltip opened by the pointer has the focus elsewhere.
  useEffect(() => {
    if (!open) return;
    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setDismissed(true);
    }
    document.addEventListener("keydown", dismissOnEscape);
    return () => document.removeEventListener("keydown", dismissOnEscape);
  }, [open]);

  const describedBy = classNames(children.props["aria-describedby"], id);

  return (
    <span
      onMouseEnter={() => start(setHovered)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => start(setFocused)}
      onBlur={() => setFocused(false)}
      className={classNames("relative inline-flex", className)}
    >
      {cloneElement(children, { "aria-describedby": describedBy })}
      <span
        role="tooltip"
        id={id}
        hidden={!open}
        className={classNames(
          "absolute left-1/2 z-(--z-toast) w-max max-w-60 -translate-x-1/2",
          PLACEMENT_CLASSES[placement],
        )}
      >
        <span className="block rounded-xs bg-surface-inverse px-2.5 py-1.5 text-xs font-medium text-text-inverse shadow-md">
          {content}
        </span>
      </span>
    </span>
  );
}
