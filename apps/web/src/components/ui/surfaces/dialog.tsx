"use client";

import { useEffect, useId, useRef } from "react";
import { classNames } from "@/components/ui/class-names";
import { IconButton } from "@/components/ui/core/icon-button";

type DialogSize = "sm" | "md" | "lg";

export type DialogProps = Omit<
  React.ComponentProps<"dialog">,
  | "style"
  | "open"
  | "title"
  | "role"
  | "tabIndex"
  | "onClose"
  | "aria-labelledby"
  | "aria-describedby"
  | "aria-modal"
> & {
  open: boolean;
  /** Asks the caller to close: it answers by setting `open` to false. */
  onClose: () => void;
  title: string;
  /** One short sentence, read with the title. Longer text goes in the body. */
  description?: string;
  /** The accessible name of the close button. */
  closeLabel: string;
  /** The actions, on the bottom edge. */
  footer?: React.ReactNode;
  size?: DialogSize;
};

// A width, not a maximum: the browser's own style keeps a dialog inside the
// viewport with a margin, and a `max-w-*` class here would replace that.
const SIZE_CLASSES: Record<DialogSize, string> = {
  sm: "w-100",
  md: "w-120",
  lg: "w-160",
};

/**
 * A modal dialog on the native element. `showModal()` gives the top layer,
 * the inert page and the focus trap; this component keeps the element in step
 * with `open` and reports every way of closing through `onClose`.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  closeLabel,
  footer,
  size = "md",
  className,
  children,
  ...dialogProps
}: DialogProps) {
  const element = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const pressedBackdrop = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  // No cleanup closes the dialog: Strict Mode runs the effect twice, and the
  // `close` event of the first run would arrive after the second had opened it.
  useEffect(() => {
    const dialog = element.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      opener.current = document.activeElement;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Escape: the browser fires `cancel` and would then close the dialog by
  // itself. It is stopped, so `open` stays the one source of truth and the
  // caller hears of it at once (Chrome delivers `close` with the next frame,
  // which a hidden tab never draws). A `cancel` from inside is not ours: a
  // file field fires one that bubbles.
  function handleCancel(event: React.SyntheticEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    onClose();
  }

  // Whatever closes the element without asking ends in `close`: a form with
  // `method="dialog"`, or a second Escape the browser does not let be stopped.
  // The element is then closed while `open` is still true. The effect above
  // ends here too, with `open` already false.
  function handleClose() {
    if (open && !element.current?.open) onClose();
    if (opener.current instanceof HTMLElement && opener.current.isConnected) {
      opener.current.focus();
    }
  }

  // A click on the backdrop reaches the dialog element itself. The press must
  // have started there too, or selecting text out of the dialog would close it.
  function handleClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (pressedBackdrop.current && event.target === event.currentTarget) onClose();
    pressedBackdrop.current = false;
  }

  return (
    <dialog
      {...dialogProps}
      ref={element}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={handleCancel}
      onClose={handleClose}
      onPointerDown={(event) => {
        pressedBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={handleClick}
      className={classNames(
        "m-auto overflow-hidden rounded-md bg-surface-card p-0 text-text-body shadow-lg backdrop:bg-surface-backdrop open:flex",
        SIZE_CLASSES[size],
        className,
      )}
    >
      {open && (
        // Covers the whole dialog, so a click on any part of it is not a
        // click on the element itself.
        <div className="flex min-h-0 w-full flex-col border-t-4 border-yellow">
          <div className="flex items-start gap-4 px-6 pt-5">
            <div className="min-w-0 flex-1">
              <h2
                id={titleId}
                className="font-display text-heading-lg leading-none font-extrabold text-text-strong uppercase italic"
              >
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1.5 text-sm text-text-muted">
                  {description}
                </p>
              )}
            </div>
            <IconButton icon="x" size="sm" label={closeLabel} onClick={onClose} />
          </div>
          <div className="min-h-0 overflow-y-auto px-6 pt-4 pb-6">{children}</div>
          {footer && (
            <div className="flex flex-wrap justify-end gap-2.5 border-t border-border-subtle bg-surface-subtle px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
