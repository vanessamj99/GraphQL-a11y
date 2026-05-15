# GraphQL A11y Contract Demo

Schema-driven accessibility semantics for GraphQL, with a runtime plugin and a generated Playwright + axe-core test flow.

## What This Repo Demonstrates

1. The GraphQL schema carries accessibility semantics with directives.
2. The runtime plugin exposes those semantics through `a11y`.
3. A generator reads the same schema and emits Playwright expectations.
4. CI fails when the UI drifts from the contract.

## Install

```bash
npm install
npx playwright install chromium
```

## Commands

```bash
npm run demo:api
npm run demo:ui
npm run check:contract
npm run generate:a11y
npm run test:a11y
npm run test
```

## Runtime Demo

Start the GraphQL demo:

```bash
npm run demo:api
```

Open `http://localhost:4003/graphql` and run:

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

This shows:
- `label` comes from `@a11yLabel`
- `role` comes from `@a11yRole`
- `summary` comes from `@a11yTemplate`

## Contract + Test Demo

Generate the a11y contract artifacts:

```bash
npm run check:contract
npm run generate:a11y
```

The generator writes files into `generated/`. Those files are intentionally ignored by git so the repo stays focused on the hand-written source you actually need to understand.

Run browser checks:

```bash
npm run test:a11y
```

This launches the demo UI automatically, verifies schema-driven role/name/description expectations, and runs axe-core.

## Repo Shape

- `demo/schema.graphql`: the accessibility contract
- `a11y/`: directive readers and runtime plugin
- `scripts/check-a11y-contract.ts`: fast schema gate
- `scripts/generate-a11y-tests.ts`: schema -> JSON + Playwright
- `demo/ui-server.ts`: tiny semantic HTML target
- `generated/`: generated browser artifacts, not committed

## Talk Flow

1. Show the schema contract.
2. Show the GraphQL runtime output.
3. Generate the test artifacts.
4. Run Playwright + axe.
5. Break one semantic attribute and re-run.
