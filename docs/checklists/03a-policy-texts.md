# Checklist: policy texts (privacy, terms, returns)

Repeats how the policy texts of the site were brought in on 2026-11-17 (T7 of `../specs/004-landing-page.md`, parts 1 to 3) and how they are kept from then on. The texts were generated in Termly by the owner and exported as HTML. Since that day **the repository is the source of the texts**: they are changed here, never in Termly, and Termly is not read again.

All paths are inside `apps/web/` unless they start with `docs/`.

## Where the texts are

| Policy | Page | Files |
|---|---|---|
| Privacy policy | `/privacy-policy` | `src/server/site/policies/privacy-policy.en.ts`, `privacy-policy.pt.ts` |
| Terms and conditions | `/terms` | `src/server/site/policies/terms.en.ts`, `terms.pt.ts` |
| Return policy | `/returns` | `src/server/site/policies/return-policy.en.ts`, `return-policy.pt.ts` |

- Each file is a `PolicyDocument` (`src/lib/site/policy-document.ts`): a list of blocks (`heading` level 2 or 3, `paragraph`, `list`, `table`). Each text is a list of runs, a plain string or `{ text, strong?, em?, href? }`. Optional `id`s are the anchors of the table of contents.
- The English file is the text as delivered, with the owner's later changes. The Portuguese file is its translation, block by block.
- `src/server/site/policies/policies.ts` lists the policies (`policies`) and gives one with `getPolicy(policy, locale)`.
- `src/components/site/policy-document-view.tsx` renders a document; each page under `src/app/[lang]/(marketing)/` gives the `h1` (from the dictionary) and the eyebrow "Legal".
- The footer entries, their order and addresses: `src/lib/site/legal-pages.ts`. Their labels and the page descriptions: `legal` in `src/server/i18n/messages/pt.ts` and `en.ts`.
- What the law says about them and what is still wrong in them: `docs/compliance/` (`returns-and-withdrawal.md` for the return policy). The changes made after delivery are listed in the notes of T7 of spec 004.

## Changing a policy

1. Edit the same block in **both** files, `.en.ts` and `.pt.ts`. Keep the same blocks, ids, links and bold/italic runs in both: the Portuguese text may be rephrased, the structure may not.
2. Update the "Last updated" line at the top of both files (the privacy policy promises it in its section 11).
3. A link to another page of the site carries the locale of its file: `/en/returns` in the English file, `/pt/returns` in the Portuguese one. A link within the page is `#id`, and that id must exist in the same file.
4. Record the change, with its date and who asked for it, in the notes of T7 of spec 004 (or of the spec that owns the policy then).
5. `pnpm lint`, `pnpm typecheck`, `pnpm test`; `pnpm test:e2e` when a page, an address or the footer changed. Expected: `policies.test.ts` passes (see "Verification").

## Importing a new policy from a generator export

Done for the three policies above; the cookie policy is still to come this way.

1. **Get the export.** Termly: the policy's HTML export, one file per policy. Keep it outside the repository (`debugging/` is ignored by git) and read the whole of it before converting: it is the client's legal text.
2. **Convert.** `python -I docs/checklists/policy-texts-import.py <export.html> apps/web/src/server/site/policies/<name>.en.ts <exportName>`. The script writes the module and prints its check. Expected: "text equal to the export ... True"; every dropped link is a link without text (hidden sections, Termly's hidden data request link, `None`); no duplicate ids; no link within the page without a target. If the text is not equal, do not go on: compare the two by hand.
3. **Header comment.** Replace the TODO at the top of the module with who delivered the policy, when, its "last updated" date, and that the text is changed here from now on (see the existing files).
4. **Read the result** next to the export. Anything odd in the text (placeholders such as `__________`, stray words, wrong addresses or names) is kept as delivered and listed for the owner in the spec notes: the text is the client's.
5. **Translate.** The PT-PT file `<name>.pt.ts`, export `<name>Pt`. It was done by an agent (Claude Haiku) told to: keep every block, id, link and run with its marks, rephrasing when Portuguese word order would need another run; keep emails, URLs, addresses, numbers, names and placeholders as they are; use PT-PT words and the current spelling; a formal register ("o utilizador", "o seu", never "tu" or "você"); reuse the terms of the existing translations. Then read it: `policies.test.ts` checks the structure, not the language.
6. **Register it.** Add the name to `policies` and the two modules to `documents` in `policies.ts`. Add the address constant to `src/lib/site/public-paths.ts` and to `publicPaths` (it joins the sitemap), and the entry to `legalPagePaths` in `legal-pages.ts`, in the footer's order. Add the label and its description to `legal` in both dictionaries.
7. **The page.** Copy `src/app/[lang]/(marketing)/returns/page.tsx` to the new route and change the address, the dictionary keys, the policy name and the section id (it must not equal an id of the text). If the route replaces a placeholder, delete the placeholder route.
8. **Tests, written before steps 6 and 7.** `policies.test.ts` (the list of policies), `src/lib/site/legal-pages.test.ts`, `src/lib/site/public-paths.test.ts`, the footer test if a label changes, and one entry per locale in `e2e/policy-pages.spec.ts` (with `firstSectionId` empty when the policy has no table of contents). Remove the page from `e2e/legal-pages.spec.ts` if it was a placeholder.
9. **Docs.** The spec notes (source, date, what was kept as delivered), `docs/architecture.md` (the public site section) and this checklist's table.
10. **Check and commit.** `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`, the page at 320 and 1440 px, then one commit (`feat: add <name> page`).

## Common errors

- **Text with `â€™` or `�` in the terminal.** The export is UTF-8; the Windows console shows it wrongly. Check the bytes (`python -I -c "open(p, encoding='utf-8').read()"`) before "fixing" anything.
- **One list per item, or "- " lines.** Termly writes both; the script turns them into one list. Without that, each item is its own list.
- **`id="control"` on every section.** Termly repeats it; the script drops it. A duplicate id breaks `policies.test.ts`.
- **A translation with one run more or less** than the English text (for example a word after a link). `policies.test.ts` fails on "follows the English text block by block"; rephrase to fit the runs.
- **`import "server-only"` in a policy module** makes Vitest fail to resolve it: the policy modules are plain data and do not import it.
- **A renamed or removed route still in `.next/dev/types`.** `pnpm typecheck` fails on a page that no longer exists when an old `next dev` left its types there. Delete `apps/web/.next/dev/types` (generated) and run it again.
- **A local `next start` stops serving the site correctly after `pnpm test:e2e`.** The run builds into the same `.next`; restart that server.
- **Termly links in the text.** The data request form (`app.termly.io/dsar/...`) and the "created using Termly's generator" line stay in the delivered text; if the Termly account is closed, the form stops working. Whether Termly's terms allow publishing without the account was not checked.

## Verification

- `pnpm test` runs `src/server/site/policies/policies.test.ts` for every policy in both locales: content exists, ids are unique, every `#id` link has its target, every link to a page of the site leads to a public page in the file's locale, no heading level is skipped, and the Portuguese file has the structure of the English one.
- `pnpm test:e2e` runs `e2e/policy-pages.spec.ts` for every page in both locales and four browsers: the footer link, the "last updated" line and the first heading, the table of contents leading to its section, title, canonical address and no `noindex`, the current footer link, no sideways scroll at 320, 768, 1024 and 1440 px, the sitemap, and the old `/pt/privacy` answering 404.
- `/terms/`, with the slash, answers 308 to `/terms`, which answers 307 to the visitor's locale.
