import { GraphQLResolveInfo, Kind, FieldNode } from "graphql";

/** Collect sibling field names next to the nearest `a11y` in the path. */
export function getSiblingFieldNames(info: GraphQLResolveInfo): Set<string> {
  const fullPath: Array<string | number> = [];
  for (let p: any = info.path; p; p = p.prev) fullPath.unshift(p.key);

  while (fullPath.length && fullPath[fullPath.length - 1] !== "a11y") fullPath.pop();
  if (fullPath[fullPath.length - 1] === "a11y") fullPath.pop();

  let selections = info.operation.selectionSet.selections;
  for (const key of fullPath) {
    if (typeof key === "number") continue;
    const node = selections.find(
      (s) => s.kind === Kind.FIELD && ((s.alias?.value ?? s.name.value) === key)
    ) as FieldNode | undefined;
    if (!node?.selectionSet) return new Set();
    selections = node.selectionSet.selections;
  }

  const names = new Set<string>();
  for (const s of selections) {
    if (s.kind === Kind.FIELD && s.name.value !== "a11y") {
      names.add(s.alias?.value ?? s.name.value);
    }
  }
  return names;
} 