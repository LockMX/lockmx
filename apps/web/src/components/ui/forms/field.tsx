import { classNames } from "@/components/ui/class-names";
import { Icon } from "@/components/ui/core/icon";

// A symbol, not a word: the word that explains it comes from `requiredLabel`.
const REQUIRED_MARK = "*";

/** The text every form control shows around itself. */
export type FieldText = {
  label: string;
  hint?: string;
  /** Shown with an icon and announced politely. Its presence marks the control invalid. */
  error?: string;
  required?: boolean;
  /** The word for "required" in the page's language, shown as the tooltip of the mark. */
  requiredLabel?: string;
};

/** What the control inside a `Field` must receive to be labelled and described. */
export type FieldControlProps = {
  id: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

export type FieldProps = FieldText & {
  id: string;
  className?: string;
  children: (control: FieldControlProps) => React.ReactNode;
};

export function Field({
  id,
  label,
  hint,
  error,
  required = false,
  requiredLabel,
  className,
  children,
}: FieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = classNames(errorId, hintId) || undefined;

  return (
    <div className={classNames("flex min-w-0 flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="text-2xs leading-tight font-semibold tracking-label text-text-strong uppercase"
      >
        {label}
        {required && (
          <span aria-hidden="true" title={requiredLabel} className="ml-1 text-text-accent">
            {REQUIRED_MARK}
          </span>
        )}
      </label>
      {children({
        id,
        required: required || undefined,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {/* Always rendered: a live region must exist before its content changes. */}
      <div aria-live="polite">
        {error && (
          <p
            id={errorId}
            className="flex items-center gap-1 text-xs leading-snug text-status-danger"
          >
            <Icon name="circle-alert" size="sm" />
            {error}
          </p>
        )}
      </div>
      {hint && (
        <p id={hintId} className="text-xs leading-snug text-text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
