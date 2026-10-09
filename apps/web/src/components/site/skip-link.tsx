type SkipLinkProps = {
  /** The `id` of the element that holds the main content. */
  targetId: string;
  label: string;
};

/**
 * The first stop of the page for a keyboard: jumps over the header to the
 * content (WCAG 2.4.1, technique G1). Kept above the viewport until focused.
 */
export function SkipLink({ targetId, label }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="fixed -top-1 left-gutter z-(--z-overlay) -translate-y-full rounded-sm bg-surface-card px-4 py-2 text-sm leading-tight font-semibold shadow-lg focus:top-2 focus:translate-y-0"
    >
      {label}
    </a>
  );
}
