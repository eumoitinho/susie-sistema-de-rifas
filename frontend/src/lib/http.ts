'use client';

type ApiErrorResponse = {
  error?: string;
  message?: string;
  [key: string]: unknown;
};

export class ApiError extends Error {
  status: number;
  details?: ApiErrorResponse;

  constructor(message: string, status: number, details?: ApiErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function buildHeaders(init?: RequestInit) {
  const headers = new Headers(init?.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
}

export async function apiFetch<T>(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: buildHeaders(init),
    credentials: 'include',
  });

  const data = (await response.json().catch(() => null)) as T | ApiErrorResponse | null;

  if (!response.ok) {
    const message =
      (typeof data === 'object' && data && ('error' in data || 'message' in data)
        ? (data.error as string) || (data.message as string)
        : null) || 'Erro inesperado';

    throw new ApiError(message, response.status, data || undefined);
  }

  return data as T;
}

