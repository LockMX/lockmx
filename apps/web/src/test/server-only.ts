// Stands in for the `server-only` marker in unit tests. Next.js resolves
// `server-only` itself (it is optional to install, see the bundled docs,
// 01-getting-started/05-server-and-client-components.md, "Preventing
// environment poisoning"); Vitest does not, so vitest.config.ts maps it here.
export {};
