# SeleniumConf: Schema-Driven Playwright + axe-core Tests

Contract-driven accessibility checks generated from the shared GraphQL schema in `../demo/schema.graphql`.

## What This Folder Demonstrates

1. Annotate the schema with `@a11yLabel`, `@a11yRole`, and `@a11yTemplate`.
2. Run a single-file Node generator that emits JSON + Playwright specs.
3. Execute Playwright + axe-core with stable `getByRole({ name })` locators.
4. Fail CI when the UI drifts from the schema contract.

## Install

From the repo root:

```bash
npm install
cd selenium && npm install
npx playwright install chromium
```

## Commands

```bash
cd selenium
npm run demo:ui
npm run generate:a11y
npm run test:a11y
npm run test
```

## Live Demo Flow

1. Show `../demo/schema.graphql` annotations.
2. `npm run generate:a11y` → writes `generated/a11y-spec.json` and `generated/a11y.generated.spec.ts`.
3. `npm run test:a11y` → Playwright verifies role/name expectations and axe-core WCAG checks.
4. Break a label or UI string, re-run, and watch the contract fail.
5. Fix schema or UI, re-run until green.

## CI Gate

See `.github/workflows/selenium-a11y.yml` for the generate → test workflow.

## Related

- GraphQLConf talk: https://www.youtube.com/watch?v=ttmp_zkHH_0
- Newsletter: https://vanessaonmobile.substack.com/p/designing-accessible-experiences
