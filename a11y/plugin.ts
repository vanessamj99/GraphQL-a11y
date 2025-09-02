import { GraphQLResolveInfo } from "graphql";
import { getSiblingFieldNames } from "./getSiblingFieldNames";
import { humanizeTokens, Tok } from "./humanize";
import type { A11yPluginConfig, TokenConfig, PerTypeTokens } from "./types";
import { defaultTokens } from "./types";
import { 
  getLabelFieldFromDirectives, 
  getTokenConfigsFromDirectives, 
  getTemplateFromDirectives 
} from "./directives";
import { renderTemplateSmart } from "./utils/renderTemplate";

const safe = (v: any) => (v == null ? "" : String(v));

type SourceMode = "directives-first" | "config-only";

export function createA11yPlugin(
  config: A11yPluginConfig = {},
  mode: SourceMode = "directives-first"
) {
  const tokensByType: PerTypeTokens = { ...defaultTokens, ...(config.tokensByType ?? {}) };
  const labelFieldCfg = config.labelField ?? { Movie: "title" };
  const templates = config.templates ?? {};
  const locale = config.locale ?? "en";
  const sep = config.sep ?? ", ";

  const getLabelField = (typeName: string): string | undefined =>
    typeof labelFieldCfg === "string" ? labelFieldCfg : labelFieldCfg[typeName];

  const getTokensForType = (typeName: string): TokenConfig[] =>
    tokensByType[typeName] ?? [];

  // Movie.a11y -> returns a handle with parent/typeName
  function a11yRoot(parent: any, _args: any, _ctx: any, info: GraphQLResolveInfo) {
    return { __a11y: { parent, typeName: info.parentType.name } };
  }

  // Resolvers for A11y subfields (lazy)
  const A11y = {
    label: (root: any, _args: any, _ctx: any, info: GraphQLResolveInfo) => {
      const { parent, typeName } = root.__a11y;
      // 1) try directives
      const fromDir = mode !== "config-only" ? getLabelFieldFromDirectives(info.schema, typeName) : undefined;
      const field = fromDir ?? getLabelField(typeName);
      return safe(field ? parent?.[field] : "");
    },
    role:  () => "GROUP",
    state: () => [],

    tokens: (root: any, _args: any, _ctx: any, info: GraphQLResolveInfo) => {
      const { parent, typeName } = root.__a11y;
      const siblings = getSiblingFieldNames(info); // depth-safe

      // 1) tokens from directives (if any)
      const dirCfg = mode !== "config-only" ? getTokenConfigsFromDirectives(info.schema, typeName) : [];
      // 2) fallback to config
      const cfg = dirCfg.length ? dirCfg : getTokensForType(typeName);

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
      const dirCfg = mode !== "config-only" ? getTokenConfigsFromDirectives(info.schema, typeName) : [];
      const cfg = dirCfg.length ? dirCfg : getTokensForType(typeName);

      const tokens: Tok[] = cfg
        .filter(t => siblings.has(t.field))
        .map(t => ({
          type: t.type,
          value: safe(t.format ? t.format(parent[t.field]) : parent[t.field]),
          priority: t.priority ?? 0,
        }))
        .sort((a, b) => a.priority - b.priority);

      const template = (mode !== "config-only" ? getTemplateFromDirectives(info.schema, typeName) : undefined)
        ?? (config.templates?.[typeName]);

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