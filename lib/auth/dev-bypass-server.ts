import { isAuthDisabled, isDevBypassAuthorization } from "@/lib/auth/dev-bypass";

/** True when the request carries the local design-bypass token. */
export function isDevBypassRequest(authorization: string | null): boolean {
  return isAuthDisabled() && isDevBypassAuthorization(authorization);
}
