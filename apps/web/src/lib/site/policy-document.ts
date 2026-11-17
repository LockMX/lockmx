// The shape of a policy text (privacy, cookies, terms): plain data, kept in
// the repository and edited there. The repository is the source of the texts;
// nothing is read from the generator they were first written with.

/** A run of text, optionally bold, italic or a link. */
export type PolicyRun =
  | string
  | {
      text: string;
      strong?: true;
      em?: true;
      /** An address: `#id` within the page, `mailto:` or `https:`. */
      href?: string;
    };

/** The text of one paragraph, heading, list item or table cell. */
export type PolicyText = readonly PolicyRun[];

export type PolicyBlock =
  | { kind: "heading"; level: 2 | 3; id?: string; text: PolicyText }
  | { kind: "paragraph"; id?: string; text: PolicyText }
  | { kind: "list"; id?: string; items: readonly PolicyText[] }
  | {
      kind: "table";
      id?: string;
      head: readonly PolicyText[];
      rows: readonly (readonly PolicyText[])[];
    };

export type PolicyDocument = {
  blocks: readonly PolicyBlock[];
};

/** The address of a run, if it is a link. */
export function runHref(run: PolicyRun): string | undefined {
  return typeof run === "string" ? undefined : run.href;
}

/** Every text of a block, in reading order. */
export function blockTexts(block: PolicyBlock): readonly PolicyText[] {
  switch (block.kind) {
    case "heading":
    case "paragraph":
      return [block.text];
    case "list":
      return block.items;
    case "table":
      return [...block.head, ...block.rows.flat()];
  }
}
