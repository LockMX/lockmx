import { useId } from "react";
import { classNames } from "@/components/ui/class-names";
import {
  CHOICE_DESCRIPTION_CLASSES,
  CHOICE_LABEL_CLASSES,
  CHOICE_ROW_CLASSES,
} from "@/components/ui/forms/choice-styles";
import { FIELD_LABEL_CLASSES } from "@/components/ui/forms/field";

export type RadioOption = {
  value: string;
  label: string;
  /** A second line under the label. */
  description?: string;
  /** Short text at the end of the row, for example a price. */
  aside?: string;
  disabled?: boolean;
};

type RadioVariant = "plain" | "card";
type RadioDirection = "column" | "row";

export type RadioProps = Omit<
  React.ComponentProps<"fieldset">,
  "style" | "children" | "name" | "onChange" | "defaultValue"
> & {
  /** The name of the group, read before its options. */
  legend: string;
  /** Shared by every radio: it is what makes them one group. */
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  /** The native change event of the radio that was chosen. */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
  variant?: RadioVariant;
  direction?: RadioDirection;
};

const DIRECTION_CLASSES: Record<RadioDirection, string> = {
  column: "flex-col",
  row: "flex-row flex-wrap",
};

const GAP_CLASSES: Record<RadioVariant, string> = {
  plain: "gap-3",
  card: "gap-2",
};

// The card is the label itself, so the whole box selects the option. The
// selected card gets a second line and a tint on top of the radio's own dot.
const OPTION_CLASSES: Record<RadioVariant, string> = {
  plain: "",
  card: "rounded-sm border border-border-control px-4 py-3.5 transition-colors has-checked:border-border-strong has-checked:bg-yellow-50 has-checked:ring-1 has-checked:ring-border-strong",
};

const OPTION_LABEL_CLASSES: Record<RadioVariant, string> = {
  plain: "",
  card: "font-semibold",
};

/**
 * A group of native radios in a `fieldset`: the shared `name` gives the arrow
 * keys, the single tab stop and the form value, with no script.
 */
export function Radio({
  legend,
  name,
  options,
  value,
  defaultValue,
  onChange,
  required,
  variant = "plain",
  direction = "column",
  className,
  ...fieldsetProps
}: RadioProps) {
  const groupId = useId();

  return (
    <fieldset
      {...fieldsetProps}
      className={classNames("min-w-0", className)}
    >
      <legend className={classNames("mb-2", FIELD_LABEL_CLASSES)}>{legend}</legend>
      <div
        className={classNames("flex", DIRECTION_CLASSES[direction], GAP_CLASSES[variant])}
      >
        {options.map((option, index) => {
          const labelId = `${groupId}-${index}-label`;
          const descriptionId = option.description
            ? `${groupId}-${index}-description`
            : undefined;
          const asideId = option.aside ? `${groupId}-${index}-aside` : undefined;

          return (
            <label
              key={option.value}
              className={classNames(
                "items-center",
                CHOICE_ROW_CLASSES,
                OPTION_CLASSES[variant],
              )}
            >
              <span className="relative grid size-5 shrink-0 place-items-center">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === undefined ? undefined : value === option.value}
                  defaultChecked={
                    defaultValue === undefined
                      ? undefined
                      : defaultValue === option.value
                  }
                  onChange={onChange}
                  disabled={option.disabled}
                  required={required}
                  aria-labelledby={labelId}
                  aria-describedby={classNames(descriptionId, asideId) || undefined}
                  className="peer size-5 cursor-pointer appearance-none rounded-pill border-2 border-border-strong bg-surface-card transition-colors checked:bg-yellow disabled:cursor-not-allowed"
                />
                <span
                  aria-hidden="true"
                  data-radio-dot=""
                  className="pointer-events-none absolute hidden size-2 rounded-pill bg-black peer-checked:block"
                />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span
                  id={labelId}
                  className={classNames(
                    CHOICE_LABEL_CLASSES,
                    OPTION_LABEL_CLASSES[variant],
                  )}
                >
                  {option.label}
                </span>
                {option.description && (
                  <span id={descriptionId} className={CHOICE_DESCRIPTION_CLASSES}>
                    {option.description}
                  </span>
                )}
              </span>
              {option.aside && (
                <span
                  id={asideId}
                  className="text-sm font-semibold text-text-strong"
                >
                  {option.aside}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
