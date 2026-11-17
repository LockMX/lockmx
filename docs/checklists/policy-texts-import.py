"""Convert a policy exported from Termly (HTML) into a policy module of the site.

Usage (Python 3, no packages):

    python -I docs/checklists/policy-texts-import.py <export.html> <out.ts> <exportName>

It writes `<out.ts>`, a `PolicyDocument` (apps/web/src/lib/site/policy-document.ts),
and prints a check of the conversion: the text of the export compared with the
text of the module (ignoring whitespace), the links that were dropped (only
links without text may be), the ids, and any link within the page whose target
is missing. See `03a-policy-texts.md` for the whole procedure.

What it drops: Termly's styles, its `bdt` markers, the logo, the repeated
`id="control"`, empty links (hidden sections, the hidden data request link)
and the policy's own title (the page gives the `h1`). What it changes in the
form, never in the text: one list per item becomes one list, and lines that
start with "- " become a list.
"""

import json
import re
import sys
from collections import Counter
from html.parser import HTMLParser

BLOCK_TAGS = {"div", "p", "br"}


class Converter(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.blocks = []
        self.runs = []
        self.marks = []
        self.pending_id = None
        self.heading = None
        self.item = None
        self.list = None
        self.table = None
        self.cell = None
        self.row = None
        self.in_head = False
        self.skip = 0
        self.in_title = False

    # Runs of text with their marks.

    def add(self, text):
        if self.skip or self.in_title:
            return
        marks = {}
        if self.heading is None:
            for mark in self.marks:
                if mark[0] == "a":
                    marks["href"] = mark[1]
                else:
                    marks[mark[0]] = True
        self.runs.append((text, marks))

    def take(self):
        merged = []
        for text, marks in self.runs:
            if merged and merged[-1][1] == marks:
                merged[-1] = (merged[-1][0] + text, marks)
            else:
                merged.append((text, marks))
        self.runs = []
        merged = [(re.sub(r"\s+", " ", text), marks) for text, marks in merged]
        while merged and not merged[0][0].strip():
            merged.pop(0)
        while merged and not merged[-1][0].strip():
            merged.pop()
        if not merged:
            return []
        merged[0] = (merged[0][0].lstrip(), merged[0][1])
        merged[-1] = (merged[-1][0].rstrip(), merged[-1][1])

        runs = []
        for text, marks in merged:
            if not marks:
                runs.append(text)
                continue
            core = text.strip()
            lead = text[: len(text) - len(text.lstrip())]
            trail = text[len(text.rstrip()) :]
            if lead:
                runs.append(lead)
            if core:
                run = {"text": core}
                if marks.get("strong"):
                    run["strong"] = True
                if marks.get("em"):
                    run["em"] = True
                if marks.get("href"):
                    run["href"] = marks["href"]
                runs.append(run)
            if trail:
                runs.append(trail)

        joined = []
        for run in runs:
            if isinstance(run, str) and joined and isinstance(joined[-1], str):
                joined[-1] += run
            else:
                joined.append(run)
        return [re.sub(r"\s+", " ", r) if isinstance(r, str) else r for r in joined if r != ""]

    def emit(self, block):
        if self.pending_id:
            block = {"kind": block["kind"], "id": self.pending_id, **{k: v for k, v in block.items() if k != "kind"}}
            self.pending_id = None
        self.blocks.append(block)

    def flush(self):
        if self.item is not None or self.cell is not None or self.heading is not None:
            return
        text = self.take()
        if text:
            self.emit({"kind": "paragraph", "text": text})

    def pop_mark(self, name):
        for index in range(len(self.marks) - 1, -1, -1):
            if self.marks[index][0] == name:
                del self.marks[index]
                return

    # Tags.

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ("style", "script"):
            self.skip += 1
            return
        if attrs.get("id") and attrs["id"] != "control" and not self.skip and tag in ("div", "span"):
            self.flush()
            self.pending_id = attrs["id"]
        if tag == "h1":
            self.flush()
            self.in_title = True
        elif tag in ("h2", "h3"):
            self.flush()
            self.heading = int(tag[1])
        elif tag in ("strong", "b"):
            self.marks.append(("strong",))
        elif tag in ("em", "i"):
            self.marks.append(("em",))
        elif tag == "a":
            self.marks.append(("a", attrs.get("href")))
        elif tag == "ul":
            self.flush()
            if self.list is None:
                self.list = []
        elif tag == "li":
            self.flush()
            self.item = True
            self.runs = []
        elif tag == "table":
            self.flush()
            if self.blocks and self.blocks[-1]["kind"] == "table" and self.pending_id is None:
                self.table = self.blocks.pop()
            else:
                self.table = {"kind": "table", "head": [], "rows": []}
        elif tag == "tr":
            self.row = []
        elif tag == "thead":
            self.in_head = True
        elif tag in ("td", "th"):
            self.cell = True
            self.runs = []
        elif tag in BLOCK_TAGS:
            if self.item or self.cell:
                self.add(" ")
            else:
                self.flush()

    def handle_endtag(self, tag):
        if tag in ("style", "script"):
            self.skip -= 1
        elif tag == "h1":
            self.in_title = False
        elif tag in ("h2", "h3") and self.heading is not None:
            level = self.heading
            self.heading = -1
            text = self.take()
            self.heading = None
            self.emit({"kind": "heading", "level": level, "text": text})
        elif tag in ("strong", "b"):
            self.pop_mark("strong")
        elif tag in ("em", "i"):
            self.pop_mark("em")
        elif tag == "a":
            self.pop_mark("a")
        elif tag == "li" and self.item:
            self.item = None
            text = self.take()
            if text:
                self.list.append(text)
        elif tag == "ul" and self.list is not None and self.item is None:
            items, self.list = self.list, None
            if items:
                self.emit({"kind": "list", "items": items})
        elif tag in ("td", "th") and self.cell:
            self.cell = None
            self.row.append(self.take())
        elif tag == "tr" and self.row is not None:
            if self.in_head:
                self.table["head"] = self.row
            else:
                self.table["rows"].append(self.row)
            self.row = None
        elif tag == "thead":
            self.in_head = False
        elif tag == "table" and self.table is not None:
            table, self.table = self.table, None
            self.emit(table)
        elif tag in BLOCK_TAGS and not (self.item or self.cell):
            self.flush()

    def handle_data(self, data):
        self.add(data.replace("\xa0", " "))


def merge_lists(blocks):
    """One list per item, and lines starting with "- ", become one list."""
    merged = []
    for block in blocks:
        text = block.get("text")
        dash = (
            block["kind"] == "paragraph"
            and "id" not in block
            and len(text) == 1
            and isinstance(text[0], str)
            and text[0].startswith("- ")
        )
        if dash:
            block = {"kind": "list", "items": [[text[0][2:].lstrip()]]}
        if block["kind"] == "list" and "id" not in block and merged and merged[-1]["kind"] == "list":
            merged[-1]["items"].extend(block["items"])
        else:
            merged.append(block)
    return merged


def to_typescript(blocks, export_name):
    quote = lambda value: json.dumps(value, ensure_ascii=False)

    def run(r):
        if isinstance(r, str):
            return quote(r)
        parts = ["text: " + quote(r["text"])]
        for mark in ("strong", "em"):
            if r.get(mark):
                parts.append(mark + ": true")
        if r.get("href"):
            parts.append("href: " + quote(r["href"]))
        return "{ " + ", ".join(parts) + " }"

    def text(runs):
        return "[" + ", ".join(run(r) for r in runs) + "]"

    lines = []
    for block in blocks:
        block_id = (", id: " + quote(block["id"])) if block.get("id") else ""
        kind = block["kind"]
        if kind == "heading":
            lines.append(f'    {{ kind: "heading", level: {block["level"]}{block_id}, text: {text(block["text"])} }},')
        elif kind == "paragraph":
            lines.append(f'    {{ kind: "paragraph"{block_id}, text: {text(block["text"])} }},')
        elif kind == "list":
            lines.append(f'    {{\n      kind: "list"{block_id},\n      items: [')
            lines.extend("        " + text(item) + "," for item in block["items"])
            lines.append("      ],\n    },")
        else:
            head = ", ".join(text(cell) for cell in block["head"])
            lines.append(f'    {{\n      kind: "table"{block_id},\n      head: [{head}],\n      rows: [')
            lines.extend("        [" + ", ".join(text(cell) for cell in row) + "]," for row in block["rows"])
            lines.append("      ],\n    },")

    return (
        'import type { PolicyDocument } from "@/lib/site/policy-document";\n\n'
        "// TODO: say who delivered this policy, when, and its \"last updated\" date.\n"
        "// From now on it is changed here, not in the generator.\n"
        f"export const {export_name}: PolicyDocument = {{\n  blocks: [\n" + "\n".join(lines) + "\n  ],\n};\n"
    )


def check(source, blocks):
    """Print what a reviewer needs to trust the conversion."""

    class Plain(HTMLParser):
        def __init__(self):
            super().__init__(convert_charrefs=True)
            self.words, self.hrefs, self.skip, self.title = [], [], 0, False

        def handle_starttag(self, tag, attrs):
            if tag == "style":
                self.skip += 1
            if tag == "h1":
                self.title = True
            if tag == "a":
                self.hrefs.append(dict(attrs).get("href"))

        def handle_endtag(self, tag):
            if tag == "style":
                self.skip -= 1
            if tag == "h1":
                self.title = False

        def handle_data(self, data):
            if not self.skip and not self.title:
                self.words.append(data)

    plain = Plain()
    plain.feed(source)

    words, hrefs, ids = [], [], []

    def walk(runs):
        for r in runs:
            words.append(r if isinstance(r, str) else r["text"])
            if not isinstance(r, str) and r.get("href"):
                hrefs.append(r["href"])

    for block in blocks:
        if block.get("id"):
            ids.append(block["id"])
        if block["kind"] in ("heading", "paragraph"):
            walk(block["text"])
        elif block["kind"] == "list":
            for item in block["items"]:
                walk(item)
        else:
            for cell in block["head"]:
                walk(cell)
            for row in block["rows"]:
                for cell in row:
                    walk(cell)

    squash = lambda parts: re.sub(r"\s+", "", "".join(parts)).replace("-", "")
    print("text equal to the export (whitespace and list dashes ignored):", squash(plain.words) == squash(words))
    print("links dropped (must be links without text):", dict(Counter(plain.hrefs) - Counter(hrefs)))
    print("ids:", ids)
    print("duplicate ids:", [i for i, n in Counter(ids).items() if n > 1])
    print("links within the page without a target:", sorted({h[1:] for h in hrefs if h.startswith("#")} - set(ids)))


def main():
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    source_path, out_path, export_name = sys.argv[1:]
    source = open(source_path, encoding="utf-8").read()
    start = source.find("<style")
    source = source[start:] if start >= 0 else source

    converter = Converter()
    converter.feed(source)
    converter.flush()
    blocks = merge_lists(converter.blocks)

    with open(out_path, "w", encoding="utf-8", newline="\n") as out:
        out.write(to_typescript(blocks, export_name))
    print(f"{len(blocks)} blocks written to {out_path}")
    check(source, blocks)


if __name__ == "__main__":
    main()
