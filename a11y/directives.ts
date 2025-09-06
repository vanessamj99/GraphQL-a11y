import { GraphQLSchema, GraphQLObjectType } from "graphql";
import type { TokenConfig } from "./types";

export function getLabelFieldFromDirectives(schema: GraphQLSchema, typeName: string): string | undefined {
  const type = schema.getType(typeName) as GraphQLObjectType;
  if (!type?.astNode) return;
  
  const fieldLevel = Object.values(type.getFields()).find(f =>
    f.astNode?.directives?.some(d => d.name.value === "a11yLabel")
  );
  if (fieldLevel) {
    const dir = fieldLevel.astNode!.directives!.find(d => d.name.value === "a11yLabel")!;
    const arg = dir.arguments?.find(a => a.name.value === "field");
    if (arg && (arg.value as any).value) return (arg.value as any).value;
  }
  
  const typeDir = type.astNode.directives?.find(d => d.name.value === "a11yLabel");
  const typeArg = typeDir?.arguments?.find(a => a.name.value === "field");
  return typeArg && (typeArg.value as any).value;
}

export function getTokenConfigsFromDirectives(schema: GraphQLSchema, typeName: string): TokenConfig[] {
  const type = schema.getType(typeName) as GraphQLObjectType;
  if (!type?.astNode) return [];
  
  const out: TokenConfig[] = [];
  for (const [fieldName, field] of Object.entries(type.getFields())) {
    const dir = field.astNode?.directives?.find(d => d.name.value === "a11yToken");
    if (!dir) continue;
    
    const get = (n: string) => dir.arguments?.find(a => a.name.value === n)?.value as any;
    const typeArg = get("type")?.value;
    const fieldArg = get("field")?.value ?? fieldName;
    const priority = get("priority")?.value ? parseInt(get("priority").value, 10) : 0;
    const label = get("label")?.value;
    const labelPosition = get("labelPosition")?.value as any;
    const unitPrefix = get("unitPrefix")?.value;
    const unitSuffix = get("unitSuffix")?.value;
    const number = get("number")?.value === true;

    out.push({ 
      field: fieldArg, 
      type: typeArg, 
      priority, 
      label, 
      labelPosition, 
      unitPrefix, 
      unitSuffix, 
      number 
    });
  }
  return out;
}

export function getTemplateFromDirectives(schema: GraphQLSchema, typeName: string): string | undefined {
  const type = schema.getType(typeName) as GraphQLObjectType;
  const dir = type?.astNode?.directives?.find(d => d.name.value === "a11yTemplate");
  const arg = dir?.arguments?.find(a => a.name.value === "summary");
  return arg && (arg.value as any).value;
} 