import { useId } from "react";
import { classNames } from "@/components/ui/class-names";
import { Icon, type IconName } from "@/components/ui/core/icon";
import {
  CONTROL_BOX_CLASSES,
  CONTROL_HEIGHT_CLASSES,
  CONTROL_RESET_CLASSES,
  type ControlSize,
} from "@/components/ui/forms/control-styles";
import { Field, type FieldText } from "@/components/ui/forms/field";

export type InputProps = Omit<
  React.ComponentProps<"input">,
  "style" | "size" | "children" | "required"
> &
  FieldText & {
    size?: ControlSize;
    iconLeft?: IconName;
    /** Short text after the value, for example a unit. */
    suffix?: string;
  };

export function Input({
  id,
  label,
  hint,
  error,
  required,
  requiredLabel,
  size = "md",
  iconLeft,
  suffix,
  type = "text",
  className,
  ...inputProps
}: InputProps) {
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
            "flex items-center gap-2.5 px-3",
            CONTROL_BOX_CLASSES,
            CONTROL_HEIGHT_CLASSES[size],
          )}
        >
          {iconLeft && <Icon name={iconLeft} className="text-text-muted" />}
          <input
            {...inputProps}
            {...control}
            type={type}
            className={classNames("h-full min-w-0 flex-1", CONTROL_RESET_CLASSES)}
          />
          {suffix && <span className="text-sm text-text-muted">{suffix}</span>}
        </div>
      )}
    </Field>
  );
}
