# Context

Working agreements for anyone (human or agent) making changes in this repo.

## Committing

**Do not create git commits unless the repo owner explicitly asks for one.**

Make the changes, report what changed, and stop. Staging is fine; committing is not.
Wait for an explicit instruction such as "commit this" or "commit and push".

This applies to every branch, including `develop`.

## Package manager

npm workspaces. There is no pnpm lockfile and no plan to add one.
Root `build` must build `eth-agent-kit` before `runtime`, since npm workspaces
does not order builds by dependency graph.

## Module systems

Each workspace member is deliberate about its module system. Do not "unify" them.

- `runtime` is ESM (`"type": "module"`, `nodenext`). It talks to Node directly,
  and the MCP SDK's exports-map subpaths only resolve correctly this way.
- `dashboard` has no `"type"` field on purpose. Its `next.config.js`,
  `postcss.config.js`, and `tailwind.config.js` use `module.exports`, and adding
  `"type": "module"` breaks all three. Next bundles its own modules.
- `packages/eth-agent-kit` and `packages/create-eth-agent` stay CommonJS. They are
  published to npm and consumed by scaffolded projects whose templates are CJS.
  `runtime` reaches the kit via `await import()`, which works across the boundary.

## Comment style

- Single line: `//`
- Multi line: `/* ... */`
- JSX markup only: `{/* ... */}`. Never use this form outside a returned JSX tree.
- Section separators: `// === Section Name`. No ASCII rules, boxes, or `--- x ---`.
- Comment the non-obvious WHY. Do not narrate what the code already says.

## Em dashes

No em dash (`—`) anywhere it is being used as prose punctuation. That means all of:

- code comments, both `//` and `/* */`
- README and other markdown files
- `console.log` / `console.error` / `console.warn` output and `Error` messages
- user-facing UI copy and page metadata
- LLM system prompts and canned agent replies
- commit messages and PR descriptions

Do not swap in a hyphen as a replacement. Rewrite so neither character is needed.
A colon usually works for a label followed by its description, and a comma or a
full stop usually works mid-sentence.

```
BAD   console.error("policy submitted — tx:", tx)
BAD   console.error("policy submitted - tx:", tx)
GOOD  console.error("policy submitted, tx:", tx)

BAD   - **MCP** — Cursor, VS Code, Kiro
GOOD  - **MCP**: Cursor, VS Code, Kiro
```

### The one exception: em dash as a UI glyph

An em dash rendered as the empty-value placeholder is a deliberate typographic
choice, not prose, and stays. A hyphen there reads as a typo.

<!-- prettier-ignore -->
```tsx
{data ? parseFloat(data.balanceFormatted).toFixed(6) : '—'}
```

Current instances live in `dashboard/src/components/panels/OverviewPanel.tsx` and
`SpendingLimitsPanel.tsx`. The test is whether the character is punctuating a
sentence or standing in for a missing value. Only the second case is allowed.

## Generated and vendored code

Do not format, lint, or refactor these. They are shipped or vendored artifacts.

- `contracts/lib/**` (Foundry dependencies)
- `packages/create-eth-agent/templates/**` (the scaffold handed to end users,
  including its own vendored `contracts/lib/openzeppelin-contracts`)

## Secrets

`.env.example` holds placeholders only. Never copy a live value into it.
Real values belong in `.env`, which is gitignored.
