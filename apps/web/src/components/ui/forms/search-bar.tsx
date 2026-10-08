"use client";

import { useId, useState } from "react";
import { classNames } from "@/components/ui/class-names";
import { Icon, type IconName, type IconSize } from "@/components/ui/core/icon";

type SearchBarSize = "md" | "lg";

export type SearchSuggestion = {
  label: string;
  /** Short text at the end of the row, for example a category. */
  meta?: string;
  icon?: IconName;
};

export type SearchBarProps = Omit<
  React.ComponentProps<"form">,
  | "style"
  | "role"
  | "children"
  | "name"
  | "defaultValue"
  | "onChange"
  | "onSubmit"
  | "onSelect"
> & {
  /** The accessible name of the field. A placeholder does not name it. */
  label: string;
  submitLabel: string;
  /** The accessible name of the list of suggestions. */
  listLabel: string;
  /** Announced when the list changes; `{count}` is replaced by the number. */
  resultsLabel: { one: string; other: string };
  /** Announced when no suggestion contains the text. */
  noResultsLabel: string;
  placeholder?: string;
  /** The name the text is submitted under. */
  name?: string;
  value?: string;
  defaultValue?: string;
  size?: SearchBarSize;
  /** The candidates. The bar shows the ones that contain the text. */
  suggestions?: SearchSuggestion[];
  onChange?: (value: string) => void;
  /** Called before the form submits; prevent the event to stop the navigation. */
  onSubmit?: (query: string, event: React.FormEvent<HTMLFormElement>) => void;
  onSelect?: (suggestion: SearchSuggestion) => void;
};

const MAX_SUGGESTIONS = 6;
const NO_OPTION = -1;

const BOX_CLASSES =
  "flex items-stretch overflow-hidden rounded-sm border-2 border-border-strong bg-surface-card transition-shadow has-[input:focus-visible]:shadow-focus has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus-ring";

const HEIGHT_CLASSES: Record<SearchBarSize, string> = {
  md: "h-11",
  lg: "h-15",
};

const ICON_PADDING_CLASSES: Record<SearchBarSize, string> = {
  md: "pl-3",
  lg: "pl-4.5",
};

const ICON_SIZES: Record<SearchBarSize, IconSize> = {
  md: "md",
  lg: "lg",
};

const INPUT_SIZE_CLASSES: Record<SearchBarSize, string> = {
  md: "text-md",
  lg: "text-lg font-medium",
};

// The focus ring of the button is drawn inside the box, which clips its edges.
const SUBMIT_CLASSES =
  "bg-action-primary font-display font-extrabold italic uppercase tracking-caps text-text-on-accent transition-colors hover:bg-action-primary-hover active:bg-action-primary-press focus-visible:-outline-offset-2";

const SUBMIT_SIZE_CLASSES: Record<SearchBarSize, string> = {
  md: "px-4 text-md",
  lg: "px-7 text-heading-md",
};

// The active option is outlined, so it does not rely on its tint alone.
const OPTION_CLASSES =
  "flex cursor-pointer items-center gap-3 rounded-xs px-3 py-2.5 text-md text-text-strong hover:bg-surface-subtle aria-selected:bg-surface-sunken aria-selected:outline-2 aria-selected:-outline-offset-2 aria-selected:outline-focus-ring";

function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function matching(suggestions: SearchSuggestion[], query: string): SearchSuggestion[] {
  const wanted = fold(query);
  return suggestions
    .filter((suggestion) => fold(suggestion.label).includes(wanted))
    .slice(0, MAX_SUGGESTIONS);
}

/**
 * A search form whose field is a combobox (APG, list autocomplete with manual
 * selection): the focus stays in the field and the arrows move an active
 * option. Without `onSubmit` it submits like any form, under `name`.
 */
export function SearchBar({
  label,
  submitLabel,
  listLabel,
  resultsLabel,
  noResultsLabel,
  placeholder,
  name = "q",
  value,
  defaultValue = "",
  size = "md",
  suggestions = [],
  onChange,
  onSubmit,
  onSelect,
  className,
  ...formProps
}: SearchBarProps) {
  const listId = useId();
  const [innerValue, setInnerValue] = useState(defaultValue);
  // Suggesting starts with typing or an arrow and ends when the list is
  // dismissed: Escape, leaving the field, a selection or a submission.
  const [suggesting, setSuggesting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(NO_OPTION);
  const query = value ?? innerValue;
  const list = suggesting && query ? matching(suggestions, query) : [];
  const open = list.length > 0;
  const active = list[activeIndex];

  function optionId(index: number): string {
    return `${listId}-${index}`;
  }

  function change(next: string) {
    if (value === undefined) setInnerValue(next);
    onChange?.(next);
  }

  function dismiss() {
    setSuggesting(false);
    setActiveIndex(NO_OPTION);
  }

  function select(suggestion: SearchSuggestion) {
    change(suggestion.label);
    onSelect?.(suggestion);
    dismiss();
  }

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    change(event.target.value);
    setSuggesting(true);
    setActiveIndex(NO_OPTION);
  }

  function moveActive(key: "ArrowDown" | "ArrowUp") {
    if (!open) {
      const count = query ? matching(suggestions, query).length : 0;
      setSuggesting(true);
      setActiveIndex(key === "ArrowDown" ? 0 : count - 1);
      return;
    }
    const last = list.length - 1;
    if (key === "ArrowDown") setActiveIndex(activeIndex >= last ? 0 : activeIndex + 1);
    else setActiveIndex(activeIndex <= 0 ? last : activeIndex - 1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(event.key);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      dismiss();
    } else if (event.key === "Enter" && active) {
      // Enter takes the active option; without one it submits the form.
      event.preventDefault();
      select(active);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    dismiss();
    onSubmit?.(query, event);
  }

  function statusText(): string {
    if (!suggesting || !query) return "";
    if (!open) return noResultsLabel;
    const template = list.length === 1 ? resultsLabel.one : resultsLabel.other;
    return template.replace("{count}", String(list.length));
  }

  return (
    <form
      {...formProps}
      role="search"
      onSubmit={handleSubmit}
      className={classNames("relative w-full", className)}
    >
      <div className={classNames(BOX_CLASSES, HEIGHT_CLASSES[size])}>
        <span
          className={classNames(
            "grid place-items-center text-text-muted",
            ICON_PADDING_CLASSES[size],
          )}
        >
          <Icon name="search" size={ICON_SIZES[size]} />
        </span>
        <input
          type="text"
          role="combobox"
          name={name}
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          aria-label={label}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={active ? optionId(activeIndex) : undefined}
          placeholder={placeholder}
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={dismiss}
          className={classNames(
            "min-w-0 flex-1 bg-transparent px-3 text-text-strong outline-none placeholder:text-text-subtle",
            INPUT_SIZE_CLASSES[size],
          )}
        />
        <button
          type="submit"
          className={classNames(SUBMIT_CLASSES, SUBMIT_SIZE_CLASSES[size])}
        >
          {submitLabel}
        </button>
      </div>
      {open && (
        // Pressing an option must not move the focus out of the field, which
        // would close the list before the click arrives.
        <ul
          id={listId}
          role="listbox"
          aria-label={listLabel}
          onMouseDown={(event) => event.preventDefault()}
          className="absolute inset-x-0 top-full z-(--z-dropdown) mt-1.5 rounded-md border border-border-subtle bg-surface-card p-1.5 shadow-lg"
        >
          {list.map((suggestion, index) => (
            <li
              key={optionId(index)}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => select(suggestion)}
              className={OPTION_CLASSES}
            >
              <Icon
                name={suggestion.icon ?? "search"}
                size="sm"
                className="text-text-muted"
              />
              <span className="flex-1">{suggestion.label}</span>
              {suggestion.meta && (
                <span className="text-sm text-text-muted">{suggestion.meta}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {/* Always rendered: a live region must exist before its content changes. */}
      <span role="status" className="sr-only">
        {statusText()}
      </span>
    </form>
  );
}
