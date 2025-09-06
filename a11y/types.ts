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