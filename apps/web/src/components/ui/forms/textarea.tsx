import { useId } from "react";
import { classNames } from "@/components/ui/class-names";
import {
  CONTROL_BOX_CLASSES,
  CONTROL_RESET_CLASSES,
} from "@/components/ui/forms/control-styles";
import { Field, type FieldText } from "@/components/ui/forms/field";

export type TextareaProps = Omit<
  React.ComponentProps<"textarea">,
  "style" | "children" | "required"
> &
  FieldText;

export function Textarea({
  id,
  label,
  hint,
  error,
  required,
  requiredLabel,
  rows = 5,
  className,
  ...textareaProps
}: TextareaProps) {
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
        <div className={classNames("flex", CONTROL_BOX_CLASSES)}>
          <textarea
            {...textareaProps}
            {...control}
            rows={rows}
            className={classNames(
              "min-w-0 flex-1 resize-y px-3 py-2.5 leading-body",
              CONTROL_RESET_CLASSES,
            )}
          />
        </div>
      )}
    </Field>
  );
}
