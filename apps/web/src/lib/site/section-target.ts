// The element a link leads to when it points at a place in the page that is
// already open; null for a link to another page or without a fragment.
export function findSectionTarget(href: string, current: Location): HTMLElement | null {
  const url = new URL(href, current.href);
  const samePage = url.origin === current.origin && url.pathname === current.pathname;
  if (!samePage || url.hash.length < 2) return null;

  return document.getElementById(decodeURIComponent(url.hash.slice(1)));
}
