/** Shared snake_case ↔ camelCase helpers at the BFF boundary. */

export function pickString(obj: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string" && val.length > 0) return val;
  }
  return undefined;
}

export function pickNumber(obj: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "number" && !Number.isNaN(val)) return val;
    if (typeof val === "string" && val.length > 0) {
      const n = Number(val);
      if (!Number.isNaN(n)) return n;
    }
  }
  return undefined;
}

export function pickBoolean(obj: Record<string, unknown>, ...keys: string[]): boolean | undefined {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "boolean") return val;
  }
  return undefined;
}

export function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function normalizeKeys<T extends Record<string, unknown>>(
  raw: Record<string, unknown>,
  toCamel: boolean,
): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    const nextKey = toCamel ? snakeToCamel(key) : camelToSnake(key);
    out[nextKey] = value;
  }
  return out as T;
}
