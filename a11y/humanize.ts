import type { TokenConfig } from "./types";

const words = (s: string) =>
  s.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").toLowerCase();

const fmtNumber = (v: any, locale: string) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? new Intl.NumberFormat(locale).format(n) : String(v);
};

export type Tok = { type: string; value: string; priority: number };

export function humanizeTokens(
  tokens: Tok[],
  tokenConfig: TokenConfig[],
  locale = "en",
  sep = ", "
): string {
  const cfg = new Map(tokenConfig.map(c => [c.type, c]));
  const parts: string[] = [];

  for (const t of tokens) {
    const c = cfg.get(t.type);
    const raw = t.value;
    const val = c?.number ? fmtNumber(raw, locale) : raw;
    const withUnits = (c?.unitPrefix ?? "") + val + (c?.unitSuffix ?? "");
    const label = c?.label ?? words(t.type);
    const pos = c?.labelPosition ?? "after";

    // pos = "before" | "after" | "none"
    let piece = withUnits;
    if (pos === "before") piece = `${label} ${withUnits}`;
    else if (pos === "after") piece = `${withUnits} ${label}`;
    // "none" → just value with units

    piece = piece.replace(/\s+/g, " ").trim();
    if (piece) parts.push(piece);
  }
  return parts.join(sep);
} 