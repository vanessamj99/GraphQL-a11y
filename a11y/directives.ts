import { GraphQLObjectType, GraphQLSchema } from "graphql";
import type { TokenConfig } from "./types";

function getObjectType(schema: GraphQLSchema, typeName: string): GraphQLObjectType | undefined {
  return schema.getType(typeName) as GraphQLObjectType | undefined;
}

function getDirectiveArgValue(
  directives: readonly any[] | undefined,
  directiveName: string,
  argName: string,
): any {
  const dir = directives?.find((d) => d.name.value === directiveName);
  const arg = dir?.arguments?.find((a: any) => a.name.value === argName);
  return arg?.value?.value;
}

export function getLabelFieldFromDirectives(
  schema: GraphQLSchema,
  typeName: string,
): string | undefined {
  const type = getObjectType(schema, typeName);
  if (!type?.astNode) return;

  for (const [fieldName, field] of Object.entries(type.getFields())) {
    const fieldArg = getDirectiveArgValue(field.astNode?.directives, "a11yLabel", "field");
    if (fieldArg) return fieldArg;

    const hasFieldDirective = field.astNode?.directives?.some(
      (directive) => directive.name.value === "a11yLabel",
    );
    if (hasFieldDirective) return fieldName;
  }

  return getDirectiveArgValue(type.astNode.directives, "a11yLabel", "field");
}

export function getRoleFromDirectives(
  schema: GraphQLSchema,
  typeName: string,
): string | undefined {
  const type = getObjectType(schema, typeName);
  if (!type?.astNode) return;
  return getDirectiveArgValue(type.astNode.directives, "a11yRole", "role");
}

export function getTokenConfigsFromDirectives(
  schema: GraphQLSchema,
  typeName: string,
): TokenConfig[] {
  const type = getObjectType(schema, typeName);
  if (!type?.astNode) return [];

  const out: TokenConfig[] = [];
  for (const [fieldName, field] of Object.entries(type.getFields())) {
    const dir = field.astNode?.directives?.find((d) => d.name.value === "a11yToken");
    if (!dir) continue;

    const get = (name: string) => dir.arguments?.find((a) => a.name.value === name)?.value as any;
    const typeArg = get("type")?.value;
    const fieldArg = get("field")?.value ?? fieldName;
    const priorityArg = get("priority")?.value;
    const label = get("label")?.value;
    const labelPosition = get("labelPosition")?.value as any;
    const unitPrefix = get("unitPrefix")?.value;
    const unitSuffix = get("unitSuffix")?.value;
    const number = get("number")?.value === true;

    out.push({
      field: fieldArg,
      type: typeArg,
      priority: priorityArg != null ? Number(priorityArg) : 0,
      label,
      labelPosition,
      unitPrefix,
      unitSuffix,
      number,
    });
  }

  return out;
}

export function getTemplateFromDirectives(
  schema: GraphQLSchema,
  typeName: string,
): string | undefined {
  const type = getObjectType(schema, typeName);
  if (!type?.astNode) return;
  return getDirectiveArgValue(type.astNode.directives, "a11yTemplate", "summary");
}
