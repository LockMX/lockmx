export type ControlSize = "sm" | "md" | "lg";

// The box around an input, select or textarea. The native control inside has no
// border or outline of its own, so every state is drawn here, from the state of
// the control: focus (outline in the focus token plus a dark border), invalid
// (a second line, so it does not rely on colour) and disabled.
export const CONTROL_BOX_CLASSES =
  "rounded-sm border border-border-control bg-surface-card text-text-strong transition-[border-color,box-shadow] has-focus-visible:border-border-strong has-focus-visible:shadow-focus has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring has-aria-invalid:border-status-danger has-aria-invalid:ring-1 has-aria-invalid:ring-status-danger has-aria-invalid:has-focus-visible:shadow-focus-danger has-disabled:bg-surface-sunken has-disabled:opacity-60";

export const CONTROL_HEIGHT_CLASSES: Record<ControlSize, string> = {
  sm: "h-9",
  md: "h-11",
  lg: "h-13",
};

/** For the native control: it fills the box and shows through it. */
export const CONTROL_RESET_CLASSES =
  "bg-transparent text-md outline-none placeholder:text-text-subtle disabled:cursor-not-allowed";
