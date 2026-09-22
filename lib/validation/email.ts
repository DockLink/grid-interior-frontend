/**
 * User-facing email rules for create/invite flows.
 * - Must start with a lowercase letter or digit (no capitals / special chars at the start)
 * - Must be a well-formed address
 * - Stored/sent as lowercase
 */

/** local@domain.tld — single @, no spaces/consecutive dots; local starts with [a-z0-9] */
const EMAIL_PATTERN =
  /^[a-z0-9](?:[a-z0-9.!#$%&'*+/=?^_`{|}~-]*[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

export const EMAIL_LEADING_CHAR_ERROR =
  "Email must not start with a capital letter or special character";

export const EMAIL_FORMAT_ERROR = "Enter a valid email address";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getEmailValidationError(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required";

  // Case-sensitive: capitals at the start are rejected (do not lowercase before this check).
  if (!/^[a-z0-9]/.test(trimmed)) {
    return EMAIL_LEADING_CHAR_ERROR;
  }

  const normalized = trimmed.toLowerCase();
  if (normalized.includes("..")) return EMAIL_FORMAT_ERROR;

  const at = normalized.indexOf("@");
  if (at <= 0 || at !== normalized.lastIndexOf("@")) return EMAIL_FORMAT_ERROR;

  const domain = normalized.slice(at + 1);
  if (
    !domain.includes(".") ||
    domain.startsWith("-") ||
    domain.endsWith("-") ||
    domain.startsWith(".") ||
    domain.endsWith(".")
  ) {
    return EMAIL_FORMAT_ERROR;
  }

  const tld = domain.slice(domain.lastIndexOf(".") + 1);
  if (tld.length < 2) return EMAIL_FORMAT_ERROR;

  if (!EMAIL_PATTERN.test(normalized)) return EMAIL_FORMAT_ERROR;

  return null;
}

export function isValidEmail(email: string): boolean {
  return getEmailValidationError(email) === null;
}
