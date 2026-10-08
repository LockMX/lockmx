import { useId } from "react";
import { classNames } from "@/components/ui/class-names";
import {
  CHOICE_LABEL_CLASSES,
  CHOICE_ROW_CLASSES,
} from "@/components/ui/forms/choice-styles";

export type SwitchProps = Omit<
  React.ComponentProps<"input">,
  "style" | "type" | "role" | "size" | "children" | "aria-labelledby" | "aria-checked"
> & {
  label: string;
};

/**
 * A native checkbox with the switch role: the browser holds the state, so it
 * is read from `checked` and never from a hand-written `aria-checked`, and the
 * switch submits with its form. The thumb moves with the state.
 */
export function Switch({ id, label, className, ...inputProps }: SwitchProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const labelId = `${inputId}-label`;

  return (
    <label className={classNames("items-center", CHOICE_ROW_CLASSES, className)}>
      <span className="relative flex shrink-0">
        <input
          {...inputProps}
          id={inputId}
          type="checkbox"
          role="switch"
          aria-labelledby={labelId}
          className="peer h-5.5 w-10 cursor-pointer appearance-none rounded-pill border-2 border-border-strong bg-ink-200 transition-colors checked:bg-yellow disabled:cursor-not-allowed"
        />
        <span
          aria-hidden="true"
          data-switch-thumb=""
          className="pointer-events-none absolute top-1 left-1 size-3.5 rounded-pill bg-ink-950 transition-transform duration-(--duration-base) peer-checked:translate-x-4.5"
        />
      </span>
      <span id={labelId} className={CHOICE_LABEL_CLASSES}>
        {label}
      </span>
    </label>
  );
}
