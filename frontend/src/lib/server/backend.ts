import { withAuthHeader } from './auth';

const BACKEND_BASE_URL = process.env.BACKEND_API_URL ?? 'http://localhost:8080';
const BACKEND_API_PREFIX = process.env.BACKEND_API_PREFIX ?? '/api';

export const BACKEND_API_URL = `${BACKEND_BASE_URL.replace(/\/$/, '')}${BACKEND_API_PREFIX}`;

type BackendFetchOptions = RequestInit & {
  auth?: boolean;
  parseJson?: boolean;
};

export async function backendFetch<T = unknown>(
  endpoint: string,
  options: BackendFetchOptions = {}
): Promise<{ ok: boolean; status: number; body: T | null }> {
  const { auth = true, parseJson = true, headers, ...fetchOptions } = options;

  const resolvedHeaders = auth ? await withAuthHeader(headers) : headers;

  const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
    ...fetchOptions,
    cache: 'no-store',
    headers: resolvedHeaders ?? undefined,
  });

  const body = parseJson ? ((await response.json().catch(() => null)) as T | null) : null;

  return {
    ok: response.ok,
    status: response.status,
    body,
  };
}

