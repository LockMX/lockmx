import { useId } from "react";
import { classNames } from "@/components/ui/class-names";
import { Icon } from "@/components/ui/core/icon";
import {
  CHOICE_DESCRIPTION_CLASSES,
  CHOICE_LABEL_CLASSES,
  CHOICE_ROW_CLASSES,
} from "@/components/ui/forms/choice-styles";

export type CheckboxProps = Omit<
  React.ComponentProps<"input">,
  "style" | "type" | "size" | "children" | "aria-labelledby" | "aria-describedby"
> & {
  label: string;
  /** A second line under the label, read as the description of the checkbox. */
  description?: string;
};

/**
 * The native checkbox, drawn by its own classes: it keeps its size and place,
 * so focus, the form and the keyboard are the browser's. The check mark is a
 * sibling shown from the input's state.
 */
export function Checkbox({
  id,
  label,
  description,
  className,
  ...inputProps
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const labelId = `${inputId}-label`;
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <label className={classNames("items-start", CHOICE_ROW_CLASSES, className)}>
      <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
        <input
          {...inputProps}
          id={inputId}
          type="checkbox"
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
          className="peer size-5 cursor-pointer appearance-none rounded-xs border-2 border-border-strong bg-surface-card transition-colors checked:bg-yellow disabled:cursor-not-allowed"
        />
        <Icon
          name="check"
          size="sm"
          className="pointer-events-none absolute hidden text-black peer-checked:block"
        />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span id={labelId} className={CHOICE_LABEL_CLASSES}>
          {label}
        </span>
        {description && (
          <span id={descriptionId} className={CHOICE_DESCRIPTION_CLASSES}>
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
