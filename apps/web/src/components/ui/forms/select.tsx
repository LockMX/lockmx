import { useId } from "react";
import { classNames } from "@/components/ui/class-names";
import { Icon } from "@/components/ui/core/icon";
import {
  CONTROL_BOX_CLASSES,
  CONTROL_HEIGHT_CLASSES,
  CONTROL_RESET_CLASSES,
  type ControlSize,
} from "@/components/ui/forms/control-styles";
import { Field, type FieldText } from "@/components/ui/forms/field";

export type SelectOption = { value: string; label: string };

export type SelectProps = Omit<
  React.ComponentProps<"select">,
  "style" | "size" | "children" | "required" | "multiple"
> &
  FieldText & {
    options: SelectOption[];
    /** Shown first, as an empty choice. */
    placeholder?: string;
    size?: ControlSize;
  };

/** A native select: the browser provides the list, the keyboard and the mobile picker. */
export function Select({
  id,
  label,
  hint,
  error,
  required,
  requiredLabel,
  options,
  placeholder,
  size = "md",
  className,
  ...selectProps
}: SelectProps) {
  const generatedId = useId();

  return (
    <Field
      id={id ?? generatedId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      requiredLabel={requiredLabel}
      className={className}
    >
      {(control) => (
        <div
          className={classNames(
            "relative",
            CONTROL_BOX_CLASSES,
            CONTROL_HEIGHT_CLASSES[size],
          )}
        >
          <select
            {...selectProps}
            {...control}
            className={classNames(
              "size-full cursor-pointer appearance-none pr-10 pl-3",
              CONTROL_RESET_CLASSES,
            )}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon
            name="chevron-down"
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
          />
        </div>
      )}
    </Field>
  );
}
