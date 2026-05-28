const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export type ApiErrorPayload = {
  status: number;
  code?: string;
  message: string;
  details?: unknown;
  errors?: Record<string, string | string[]>;
  fieldErrors?: Record<string, string | string[]>;
  raw?: unknown;
};

function normalizePayload(payload: unknown): Record<string, unknown> {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload as Record<string, unknown>;
  }

  return {};
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const rawText = await response.text();

  let payload: unknown = {};
  let parsedAsJson = false;

  if (rawText) {
    try {
      payload = JSON.parse(rawText);
      parsedAsJson = true;
    } catch {
      payload = {
        message: response.ok
          ? "Réponse non JSON reçue."
          : "Réponse API non JSON reçue.",
        raw: rawText,
      };
    }
  }

  if (response.ok && rawText && !parsedAsJson) {
    throw {
      status: response.status,
      code: "INVALID_API_RESPONSE",
      message: "Réponse API invalide reçue.",
      raw: rawText,
    } satisfies ApiErrorPayload;
  }

  if (!response.ok) {
    const normalized = normalizePayload(payload);
    const normalizedError = normalizePayload(normalized.error);
    const fieldErrorsFromDetails =
      normalizedError.details &&
      typeof normalizedError.details === "object" &&
      !Array.isArray(normalizedError.details)
        ? (normalizedError.details as Record<string, string | string[]>)
        : undefined;

    throw {
      status: response.status,
      code:
        typeof normalized.code === "string"
          ? normalized.code
          : typeof normalizedError.code === "string"
            ? normalizedError.code
            : undefined,
      message:
        typeof normalized.message === "string"
          ? normalized.message
          : typeof normalizedError.message === "string"
            ? normalizedError.message
          : "Une erreur est survenue lors de la requête.",
      details: normalizedError.details,
      errors:
        normalized.errors &&
        typeof normalized.errors === "object" &&
        !Array.isArray(normalized.errors)
          ? (normalized.errors as Record<string, string | string[]>)
          : undefined,
      fieldErrors:
        normalized.fieldErrors &&
        typeof normalized.fieldErrors === "object" &&
        !Array.isArray(normalized.fieldErrors)
          ? (normalized.fieldErrors as Record<string, string | string[]>)
          : fieldErrorsFromDetails,
      raw: normalized.raw,
    } satisfies ApiErrorPayload;
  }

  return payload as T;
}
