export interface ApiErrorBody {
  message?: string | string[];
  statusCode?: number;
  error?: string;
}

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    const msg = Array.isArray(body.message)
      ? body.message.join(", ")
      : body.message ?? "Request failed";
    super(msg);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** Thrown when a backend call is skipped because the app is in UI-only mode. */
export class BackendDisabledError extends Error {
  constructor(message = "Unavailable in UI-only mode") {
    super(message);
    this.name = "BackendDisabledError";
  }
}