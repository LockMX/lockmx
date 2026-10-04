// Enforces the convention in docs/workflow.md.
// Source: https://commitlint.js.org/reference/rules.html
const asciiOnly = {
  rules: {
    // No built-in rule restricts the character set, and the convention
    // forbids icons and emojis, so this is the smallest custom rule.
    "ascii-only": (parsed) => {
      const message = parsed.raw ?? "";
      return [/^[\x09\x0A\x0D\x20-\x7E]*$/.test(message), "message must be ASCII only"];
    },
  },
};

export default {
  plugins: [asciiOnly],
  rules: {
    "type-enum": [2, "always", ["feat", "arch", "fix", "refactor", "docs"]],
    "type-empty": [2, "never"],
    "type-case": [2, "always", "lower-case"],
    "subject-empty": [2, "never"],
    "subject-case": [2, "always", "lower-case"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 72],
    "footer-empty": [2, "always"],
    "ascii-only": [2, "always"],
  },
};
