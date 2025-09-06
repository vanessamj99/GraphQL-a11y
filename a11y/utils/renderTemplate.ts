function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  
  /**
   * Render a token-based template like "{title}, {rating}, {year} as an example"
   * using already-formatted tokens. Missing placeholders are removed,
   * and separators are cleaned (no leading/trailing/double seps).
   */
  export function renderTemplateSmart(
    template: string,
    tokens: Array<{ type: string; value: string }>,
    sep = ", "
  ): string {
    const map = Object.fromEntries(tokens.map(t => [t.type, t.value]));
    // Replace placeholders with token values, missing keys become empty string
    const replaced = template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, k) => map[k] ?? "");
    
    // Clean up separators: no leading, trailing, or double seps
    const sepPattern = new RegExp(`\\s*${escapeRegExp(sep.trim())}\\s*`, "g");
    const parts = replaced
      .split(sepPattern)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    return parts.join(sep);
  } 