# GraphQL Accessibility Plugin

Server-driven UI should ship accessibility semantics, not just layout and copy. This repo embeds a11y hints (labels, roles, tokens, templates) directly in your GraphQL schema using directives, so clients can render accessible components by default.

Built for [Devoxx Greece](https://devoxx.gr/) — schema contract, runtime plugin, and CI validation. For the Playwright + axe-core generator demo, see [`selenium/`](selenium/).

## Related Talks & Writing

- GraphQLConf base talk: https://www.youtube.com/watch?v=ttmp_zkHH_0
- Newsletter: https://vanessaonmobile.substack.com/p/designing-accessible-experiences
- SeleniumConf contract tests: [`selenium/README.md`](selenium/README.md)

## Try the Demo

```bash
npm install
cd demo && npm install && npm run dev
```

Open GraphQL Playground at `http://localhost:4003/graphql` and run:

```graphql
query {
  movies {
    title
    rating
    releaseYear
    a11y {
      label
      role
      tokens { type value }
      templates { summary }
    }
  }
}
```

Change the selection (drop `rating` or `releaseYear`) and watch `templates.summary` adapt — the metadata is selection-aware.

## Directive Catalog

| Directive | Purpose |
|-----------|---------|
| `@a11yLabel(field: String!)` | Names the backing field used as the accessible label |
| `@a11yRole(role: A11yRole!)` | Declares semantic role (`GROUP`, `BUTTON`, `LINK`, …) |
| `@a11yToken(...)` | Marks fields that contribute tokens to summaries |
| `@a11yTemplate(summary: String)` | Template with `{placeholder}` tokens for descriptions |

See [`demo/schema.graphql`](demo/schema.graphql) for a copy-ready example.

## Client Mapping (Compose / ARIA)

| Schema `A11yRole` | Android Compose | Web ARIA |
|-------------------|-----------------|----------|
| `GROUP` | `Semantics { collectionItem() }` | `role="group"` or list item context |
| `BUTTON` | `Role.Button` | `role="button"` |
| `LINK` | `Role.Link` | `role="link"` |
| `IMAGE` | `ContentDescription` + image role | `role="img"` |

Map `a11y.label` → accessible name, `a11y.templates.summary` → description or `aria-describedby`, and `a11y.role` → platform semantics.

## Schema Contract Check (CI)

Fast regression gate that fails when required directives disappear:

```bash
npm run check:contract
```

This validates `demo/schema.graphql` still defines `@a11yLabel`, `@a11yRole`, and `@a11yTemplate` on `Movie`.

## Repo Shape

```
a11y/                  # Directive readers + runtime plugin
demo/                  # GraphQL schema + Apollo demo server
scripts/               # Schema contract gate (check-a11y-contract.ts)
docs/                  # Rollout checklist + mapping notes
selenium/              # SeleniumConf: Playwright + axe-core generator
```

## How It Works

- `@a11yToken` marks fields that contribute to accessibility data
- `@a11yTemplate` defines summary templates with placeholders like `{title}`, `{rating}`
- Only queried fields appear in tokens and summaries
- Empty placeholders are filtered automatically
