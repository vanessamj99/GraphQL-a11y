# A11y Schema Contract Rollout Checklist

Use this when adopting GraphQL-driven accessibility semantics across platform teams.

## Week 1 — Pilot (5–10 screens)

- [ ] Pick high-traffic screens with stable copy (settings, profile, checkout summary)
- [ ] Add `@a11yLabel`, `@a11yRole`, and `@a11yTemplate` to their GraphQL types
- [ ] Wire `createA11yPlugin()` resolvers on the server
- [ ] Map `a11y` fields to Compose semantics or ARIA in one client (Android or Web)
- [ ] Add `npm run check:contract` to CI

## Week 2 — Contract tests

- [ ] Copy `scripts/check-a11y-contract.ts` and tune required directives per type
- [ ] Add PR checklist: “Schema a11y directives updated?”
- [ ] Assign `CODEOWNERS` on `demo/schema.graphql` (or your schema path)

## Week 3 — Browser gate (optional)

- [ ] Adopt [`selenium/`](../selenium/) generator for Playwright + axe-core on critical routes
- [ ] Start with `getByRole({ name })` locators derived from schema labels
- [ ] Fail CI on semantic drift, not just axe violations

## Pitfalls to avoid

- Over-annotating every field — start with label, role, and one summary template per type
- Ambiguous labels shared across list items — use unique backing fields
- Dynamic role/name changes without schema updates — treat schema as source of truth
- Shared glossary: align design, content, and engineering on token names (`title`, `rating`, `year`)

## Measuring coverage

- Count GraphQL object types with `@a11yLabel` + `@a11yRole`
- Track contract-check failures in CI as regression signal
- Expand screen list incrementally; do not block entire app on day one
