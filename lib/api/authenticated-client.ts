import { apiClient } from "@/lib/api/client";
import { handleApiError } from "@/lib/api/handle-api-error";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  ensureFreshSession,
  isAuthExpiryError,
  refreshAccessToken,
} from "@/lib/auth/token-refresh";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError, BackendDisabledError } from "@/types/api";

export async function authApiClient<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  if (isAuthDisabled()) {
    throw new BackendDisabledError();
  }

  // Proactively refresh if the access cookie is about to expire, so most
  // requests never even see a 401. The cookie is sent by the browser; the
  // BFF proxy copies it into Authorization for Nest.
  const ready = await ensureFreshSession();
  if (!ready) {
    handleApiError(new ApiError(401, { message: "Unauthorized", statusCode: 401 }), {
      redirectOn401: true,
    });
    throw new ApiError(401, { message: "Unauthorized", statusCode: 401 });
  }

  try {
    return await apiClient<T>(path, init);
  } catch (error) {
    // Reactive path: the cookie expired between checks (or clock skew). Refresh
    // once and retry the original request.
    if (isAuthExpiryError(error)) {
      if (isAuthDisabled()) {
        throw error;
      }

      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return await apiClient<T>(path, init);
      }
      // Refresh failed → session is gone.
      handleApiError(
        new ApiError(401, {
          message: "Session expired, please log in",
          statusCode: 401,
        }),
        { redirectOn401: true },
      );
      throw new ApiError(401, {
        message: "Session expired, please log in",
        statusCode: 401,
      });
    }
    throw error;
  }
}

/** Dev-bypass token only. Real sessions never expose an access token to JavaScript. */
export function getAccessToken(): string | null {
  if (!isAuthDisabled()) return null;
  return useAuthStore.getState().session?.accessToken ?? null;
}
