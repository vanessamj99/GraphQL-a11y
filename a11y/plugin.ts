import { GraphQLResolveInfo } from "graphql";
import { getSiblingFieldNames } from "./getSiblingFieldNames";
import { humanizeTokens, Tok } from "./humanize";
import { 
  getLabelFieldFromDirectives, 
  getTokenConfigsFromDirectives, 
  getTemplateFromDirectives 
} from "./directives";
import { renderTemplateSmart } from "./utils/renderTemplate";

const safe = (v: any) => (v == null ? "" : String(v));

export function createA11yPlugin() {
  const locale = "en";
  const sep = ", ";

  // Movie.a11y -> returns a handle with parent/typeName
  function a11yRoot(parent: any, _args: any, _ctx: any, info: GraphQLResolveInfo) {
    return { __a11y: { parent, typeName: info.parentType.name } };
  }

  // Resolvers for A11y subfields
  const A11y = {
    label: (root: any, _args: any, _ctx: any, info: GraphQLResolveInfo) => {
      const { parent, typeName } = root.__a11y;
      const field = getLabelFieldFromDirectives(info.schema, typeName);
      return safe(field ? parent?.[field] : "");
    },
    role:  () => "GROUP",
    state: () => [],

    tokens: (root: any, _args: any, _ctx: any, info: GraphQLResolveInfo) => {
      const { parent, typeName } = root.__a11y;
      const siblings = getSiblingFieldNames(info); // depth-safe

      const cfg = getTokenConfigsFromDirectives(info.schema, typeName);

      const toks: Tok[] = cfg
        .filter(t => siblings.has(t.field))
        .map(t => ({
          type: t.type,
          value: safe(t.format ? t.format(parent[t.field]) : parent[t.field]),
          priority: t.priority ?? 0,
        }))
        .sort((a, b) => a.priority - b.priority);

      return toks;
    },

    templates: (root: any) => ({ __a11y: root.__a11y }),
  };

  const A11yTemplates = {
    summary: (root: any, _args: any, _ctx: any, info: GraphQLResolveInfo) => {
      const { parent, typeName } = root.__a11y ?? {};
      if (!parent || !typeName) return "";

      const siblings = getSiblingFieldNames(info);
      const cfg = getTokenConfigsFromDirectives(info.schema, typeName);

      const tokens: Tok[] = cfg
        .filter(t => siblings.has(t.field))
        .map(t => ({
          type: t.type,
          value: safe(t.format ? t.format(parent[t.field]) : parent[t.field]),
          priority: t.priority ?? 0,
        }))
        .sort((a, b) => a.priority - b.priority);

      const template = getTemplateFromDirectives(info.schema, typeName);

      if (template) {
        // Create humanized tokens for template rendering
        const humanizedTokens = tokens.map(t => ({
          type: t.type,
          value: humanizeTokens([t], cfg, locale, sep).trim()
        }));
        
        // Use smart template rendering to handle missing placeholders and clean separators
        return renderTemplateSmart(template, humanizedTokens, sep);
      }

      // Generic humanized fallback
      return humanizeTokens(tokens, cfg, locale, sep);
    },
  };

  return { a11yRoot, A11y, A11yTemplates };
} 