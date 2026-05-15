import assert from "node:assert/strict";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { buildSchema } from "graphql";
import {
  getLabelFieldFromDirectives,
  getRoleFromDirectives,
  getTemplateFromDirectives,
} from "../a11y/directives";

const ROOT = process.cwd();
const TYPE_NAME = "Movie";
const PAGE_PATH = "/movies";
const FIXTURE_PATH = path.join(ROOT, "demo", "movies.fixture.json");

const schema = buildSchema(
  readFileSync(path.join(ROOT, "demo", "schema.graphql"), "utf8"),
);

assert(schema.getType(TYPE_NAME), `Configured type "${TYPE_NAME}" does not exist in the schema`);
assert(getLabelFieldFromDirectives(schema, TYPE_NAME), `${TYPE_NAME} is missing @a11yLabel`);
assert(getRoleFromDirectives(schema, TYPE_NAME), `${TYPE_NAME} is missing @a11yRole`);
assert(getTemplateFromDirectives(schema, TYPE_NAME), `${TYPE_NAME} is missing @a11yTemplate`);
assert(PAGE_PATH.startsWith("/"), `Page path must start with "/": ${PAGE_PATH}`);
assert(existsSync(FIXTURE_PATH), `Fixture file does not exist: ${FIXTURE_PATH}`);

console.log(`A11y contract check passed for ${TYPE_NAME} -> ${PAGE_PATH}`);
