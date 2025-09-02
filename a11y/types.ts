export type TokenConfig = {
    field: string;                 // GraphQL field name on the parent type
    type: string;                  // token key (e.g., "title", "rating")
    priority?: number;             // ordering for summaries
    format?: (v: any) => string;   // optional value formatter
    // "humanizer" hints
    label?: string;                        // default: inferred from {type}
    labelPosition?: "before"|"after"|"none"; // default: "after"
    unitPrefix?: string;                   // e.g. "$"
    unitSuffix?: string;                   // e.g. "/10"
    number?: boolean;                      // locale-aware number formatting (adds commas, etc.)
  };
  
  // string is GraphQL type name
  export type PerTypeTokens = Record<string, TokenConfig[]>;
  
  export type LabelFieldConfig =
    | string                                  // same label field for all types
    | Record<string, string>; // per-type label field
  
  export type SummaryTemplates = Record<string, string>;
  
  export type A11yPluginConfig = {
    labelField?: LabelFieldConfig;        // e.g., { Movie: "title", Product: "name" }
    tokensByType?: PerTypeTokens;         // e.g., { Movie: [ ... ], Product: [ ... ] }
    templates?: SummaryTemplates;         // optional per-type summary templates
    locale?: string;                      // default "en"
    sep?: string;                         // summary separator, default ", "
  };
  
  // Example default tokens for a "Movie" type
  export const defaultTokens: PerTypeTokens = {
    Movie: [
      { field: "title",       type: "title",  priority: 0, label: "title",  labelPosition: "none" },
      { field: "rating",      type: "rating", priority: 1, label: "rating", unitSuffix: "/10", number: true },
      { field: "releaseYear", type: "year",   priority: 2, label: "year",   labelPosition: "after", number: false },
    ],
  }; 