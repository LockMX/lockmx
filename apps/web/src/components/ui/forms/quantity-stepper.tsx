"use client";

import { useState } from "react";
import { classNames } from "@/components/ui/class-names";
import { Icon, type IconName } from "@/components/ui/core/icon";

type QuantityStepperSize = "sm" | "md";

export type QuantityStepperProps = Omit<
  React.ComponentProps<"input">,
  | "style"
  | "type"
  | "role"
  | "inputMode"
  | "size"
  | "children"
  | "value"
  | "defaultValue"
  | "onChange"
  | "min"
  | "max"
  | "aria-label"
> & {
  /** The accessible name of the field, for example "Quantity". */
  label: string;
  /** The accessible name of the minus button. */
  decreaseLabel: string;
  /** The accessible name of the plus button. */
  increaseLabel: string;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  size?: QuantityStepperSize;
  /** Called with a whole number between `min` and `max`, never anything else. */
  onChange?: (value: number) => void;
};

const DIGITS_ONLY = /^\d*$/;

const HEIGHT_CLASSES: Record<QuantityStepperSize, string> = {
  sm: "h-8",
  md: "h-11",
};

// The focus ring of the field and the buttons is drawn inside the box, which
// has no room around its parts.
const BUTTON_CLASSES =
  "grid aspect-square h-full place-items-center text-text-strong transition-colors hover:bg-surface-sunken focus-visible:-outline-offset-2 disabled:cursor-not-allowed aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-transparent";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

/**
 * A quantity between `min` and `max`: a field that takes digits only, with a
 * button on each side. What is typed is a draft until it is a number in range
 * or the field is left, when it is clamped; an empty draft restores the value.
 */
export function QuantityStepper({
  label,
  decreaseLabel,
  increaseLabel,
  value,
  defaultValue = 1,
  min = 1,
  max = 99,
  size = "md",
  disabled = false,
  onChange,
  onBlur,
  onKeyDown,
  className,
  ...inputProps
}: QuantityStepperProps) {
  const [innerValue, setInnerValue] = useState(defaultValue);
  const [draft, setDraft] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const current = clamp(value ?? innerValue, min, max);

  function change(next: number): number {
    const clamped = clamp(next, min, max);
    if (clamped !== current) {
      if (value === undefined) setInnerValue(clamped);
      onChange?.(clamped);
    }
    return clamped;
  }

  function step(delta: number, announce: boolean) {
    setDraft(null);
    const next = change(current + delta);
    if (announce && next !== current) setAnnouncement(String(next));
  }

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    const text = event.target.value;
    if (!DIGITS_ONLY.test(text)) return;
    setDraft(text);
    const typed = Number(text);
    if (text !== "" && typed >= min && typed <= max) change(typed);
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    if (draft) change(Number(draft));
    setDraft(null);
    onBlur?.(event);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    step(event.key === "ArrowUp" ? 1 : -1, false);
  }

  // At a limit the button stays focusable (`aria-disabled`): the native
  // attribute would drop the focus of someone who has just pressed it.
  function stepButton(icon: IconName, name: string, delta: number, atLimit: boolean) {
    return (
      <button
        type="button"
        aria-label={name}
        aria-disabled={atLimit || undefined}
        disabled={disabled}
        onClick={() => step(delta, true)}
        className={BUTTON_CLASSES}
      >
        <Icon name={icon} size="sm" />
      </button>
    );
  }

  return (
    <div
      className={classNames(
        "inline-flex items-center rounded-sm border border-border-control bg-surface-card has-[input:disabled]:bg-surface-sunken has-[input:disabled]:opacity-60",
        HEIGHT_CLASSES[size],
        className,
      )}
    >
      {stepButton("minus", decreaseLabel, -1, current <= min)}
      <input
        {...inputProps}
        type="text"
        role="spinbutton"
        inputMode="numeric"
        autoComplete="off"
        aria-label={label}
        aria-valuenow={current}
        aria-valuemin={min}
        aria-valuemax={max}
        disabled={disabled}
        value={draft ?? String(current)}
        onChange={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-full w-10 bg-transparent text-center font-mono text-md font-semibold text-text-strong focus-visible:-outline-offset-2 disabled:cursor-not-allowed"
      />
      {stepButton("plus", increaseLabel, 1, current >= max)}
      {/* Always rendered: a live region must exist before its content changes. */}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
