import type { PolicyBlock, PolicyRun, PolicyText } from "@/lib/site/policy-document";

type PolicyDocumentViewProps = {
  document: { blocks: readonly PolicyBlock[] };
};

const HEADING_CLASSES = {
  2: "mt-6 font-display text-heading-md leading-snug font-extrabold tracking-display text-text-strong uppercase",
  3: "mt-2 text-heading-sm leading-snug font-bold text-text-strong",
} as const;

const CELL = "border border-border-default px-3 py-2 align-top text-left";

function isExternal(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

function Run({ run }: { run: PolicyRun }) {
  if (typeof run === "string") return run;

  let content: React.ReactNode = run.text;
  if (run.href) {
    content = isExternal(run.href) ? (
      <a href={run.href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    ) : (
      <a href={run.href}>{content}</a>
    );
  }
  if (run.em) content = <em>{content}</em>;
  if (run.strong) content = <strong className="font-semibold text-text-strong">{content}</strong>;
  return content;
}

function Text({ text }: { text: PolicyText }) {
  return text.map((run, index) => <Run key={index} run={run} />);
}

function Block({ block }: { block: PolicyBlock }) {
  switch (block.kind) {
    case "heading": {
      const Heading = block.level === 2 ? "h2" : "h3";
      return (
        <Heading id={block.id} className={HEADING_CLASSES[block.level]}>
          <Text text={block.text} />
        </Heading>
      );
    }
    case "paragraph":
      return (
        <p id={block.id}>
          <Text text={block.text} />
        </p>
      );
    case "list":
      return (
        <ul id={block.id} className="flex list-disc flex-col gap-2 ps-6">
          {block.items.map((item, index) => (
            <li key={index}>
              <Text text={item} />
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="overflow-x-auto">
          <table id={block.id} className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {block.head.map((cell, index) => (
                  <th key={index} scope="col" className={CELL}>
                    <Text text={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, index) => (
                    <td key={index} className={CELL}>
                      <Text text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

/**
 * A policy text (privacy, cookies, terms) from its data: the page gives the
 * `h1`, the text starts at `h2`. Every string comes from the document.
 */
export function PolicyDocumentView({ document }: PolicyDocumentViewProps) {
  return (
    <div className="flex flex-col gap-4 text-md leading-body break-words">
      {document.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}
