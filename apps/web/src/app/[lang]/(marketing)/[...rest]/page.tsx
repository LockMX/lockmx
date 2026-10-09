// Source: 01-app/03-api-reference/03-file-conventions/not-found.md (bundled Next.js docs).
// The root layout is inside `[lang]`, so there is no root `app/not-found` to
// catch an address that matches no route. This route matches every such
// address under a locale and hands it to the not-found page of the group.
import { notFound } from "next/navigation";

export default function UnmatchedPage() {
  notFound();
}
