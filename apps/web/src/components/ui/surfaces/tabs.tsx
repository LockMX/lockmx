"use client";

import { useId, useState } from "react";
import { classNames } from "@/components/ui/class-names";

type TabsVariant = "underline" | "segmented";

export type TabItem = {
  id: string;
  label: string;
  /** A number after the label, for example the reviews of a product. */
  count?: number;
  /** The panel of the tab. */
  content: React.ReactNode;
};

export type TabsProps = Omit<
  React.ComponentProps<"div">,
  "style" | "children" | "onChange" | "defaultValue" | "aria-label"
> & {
  /** The accessible name of the list of tabs. */
  label: string;
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  variant?: TabsVariant;
  onChange?: (id: string) => void;
};

const LIST_CLASSES: Record<TabsVariant, string> = {
  underline: "flex flex-wrap gap-x-6 border-b border-border-subtle",
  segmented: "inline-flex w-fit flex-wrap gap-0.5 rounded-sm bg-surface-sunken p-0.75",
};

const TAB_CLASSES: Record<TabsVariant, string> = {
  underline: "relative inline-flex items-center gap-2 pt-3 pb-3.5 text-sm transition-colors",
  segmented:
    "inline-flex items-center gap-2 rounded-xs px-3.5 py-1.75 text-sm transition-colors",
};

const UNSELECTED_CLASSES = "font-medium text-text-muted hover:text-text-strong";

// The selected tab never relies on colour: the underline variant draws a bar
// in the text colour, the segmented one a boundary around a raised segment.
const SELECTED_CLASSES: Record<TabsVariant, string> = {
  underline: "font-semibold text-text-strong",
  segmented:
    "bg-surface-card font-semibold text-text-strong shadow-sm ring-1 ring-border-control",
};

const COUNT_CLASSES = "min-w-5 rounded-pill px-1.5 py-px text-2xs font-semibold";

/**
 * Tabs with their panels (APG tabs pattern, automatic activation: every panel
 * is already in the page). One tab is in the tab order; Left, Right, Home and
 * End move the focus and the selection.
 */
export function Tabs({
  label,
  items,
  value,
  defaultValue,
  variant = "underline",
  onChange,
  ...divProps
}: TabsProps) {
  const baseId = useId();
  const [innerValue, setInnerValue] = useState(defaultValue ?? items[0]?.id);
  const current = value ?? innerValue;

  function tabId(index: number): string {
    return `${baseId}-tab-${index}`;
  }

  function panelId(index: number): string {
    return `${baseId}-panel-${index}`;
  }

  function select(id: string) {
    if (value === undefined) setInnerValue(id);
    if (id !== current) onChange?.(id);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1;
    const targets: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    select(items[target].id);
    document.getElementById(tabId(target))?.focus();
  }

  return (
    <div {...divProps}>
      <div role="tablist" aria-label={label} className={LIST_CLASSES[variant]}>
        {items.map((item, index) => {
          const selected = item.id === current;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={tabId(index)}
              // Label and count would run together in a name made from the content.
              aria-label={item.count === undefined ? undefined : `${item.label} ${item.count}`}
              aria-selected={selected}
              aria-controls={panelId(index)}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={classNames(
                TAB_CLASSES[variant],
                selected ? SELECTED_CLASSES[variant] : UNSELECTED_CLASSES,
              )}
            >
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span
                  className={classNames(
                    COUNT_CLASSES,
                    selected ? "bg-ink-950 text-white" : "bg-ink-200 text-text-body",
                  )}
                >
                  {item.count}
                </span>
              )}
              {selected && variant === "underline" && (
                <span
                  data-tab-indicator
                  aria-hidden="true"
                  className="absolute inset-x-0.5 -bottom-px h-0.75 skew-x-(--slant) bg-border-strong"
                />
              )}
            </button>
          );
        })}
      </div>
      {items.map((item, index) => (
        // Focusable, so the keyboard reaches a panel that has no control in it.
        <div
          key={item.id}
          role="tabpanel"
          id={panelId(index)}
          aria-labelledby={tabId(index)}
          tabIndex={0}
          hidden={item.id !== current}
          className="pt-4"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
