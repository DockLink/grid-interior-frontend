import { toast } from "sonner";

import { notifySessionExpired } from "@/lib/auth/session-expiry";
import { isAuthExpiryError } from "@/lib/auth/token-refresh";
import { ApiError, BackendDisabledError } from "@/types/api";

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof BackendDisabledError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong";
}

export interface HandleApiErrorOptions {
  toast?: boolean;
  redirectOn401?: boolean;
}

export function handleApiError(
  error: unknown,
  options: HandleApiErrorOptions = {},
): void {
  const { toast: showToast = false, redirectOn401 = false } = options;

  if (error instanceof BackendDisabledError) {
    return;
  }

  const is401 =
    error instanceof ApiError
      ? error.status === 401
      : isAuthExpiryError(error);

  if (is401 && redirectOn401) {
    notifySessionExpired();
    return;
  }

  if (showToast) {
    toast.error(getApiErrorMessage(error));
  }
}
