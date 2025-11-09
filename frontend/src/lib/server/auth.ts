import { cookies, headers } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const TOKEN_COOKIE = 'susie.auth-token';
export const SESSION_MAX_AGE = 60 * 60 * 24; // 24h

const JWT_SECRET = process.env.JWT_SECRET ?? 'seu_secret_key_aqui_mude_em_producao';

export type DecodedSession = {
  user: {
    id: number;
    email: string;
  };
  token: string;
};

async function extractToken(): Promise<string | null> {
  try {
    const store = await cookies();
    const candidate = store?.get?.(TOKEN_COOKIE);

    if (typeof candidate === 'string') {
      return candidate;
    }

    if (candidate && typeof candidate === 'object' && 'value' in candidate) {
      const value = (candidate as { value?: string }).value;
      if (typeof value === 'string') {
        return value;
      }
    }
  } catch (error) {
    console.warn('Falha ao acessar cookies()', error);
  }

  try {
    const headerList = await headers();
    const cookieHeader = headerList?.get?.('cookie');
    if (!cookieHeader) {
      return null;
    }

    const tokenPair = cookieHeader
      .split(';')
      .map((segment) => segment.trim())
      .find((segment) => segment.startsWith(`${TOKEN_COOKIE}=`));

    if (!tokenPair) {
      return null;
    }

    const [, rawValue] = tokenPair.split('=');
    return decodeURIComponent(rawValue ?? '');
  } catch (error) {
    console.warn('Falha ao ler cabeçalho de cookies', error);
  }

  return null;
}

export function decodeAuthToken(token: string): DecodedSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
      userId?: number;
      email?: string;
    };

    if (!decoded?.userId || !decoded?.email) {
      return null;
    }

    return {
      user: {
        id: decoded.userId,
        email: decoded.email,
      },
      token,
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function getSessionFromCookies(): Promise<DecodedSession | null> {
  const token = await extractToken();
  if (!token) {
    return null;
  }

  return decodeAuthToken(token);
}

export async function getAuthToken(): Promise<string | null> {
  return extractToken();
}

export async function withAuthHeader(init?: HeadersInit): Promise<HeadersInit> {
  const token = await getAuthToken();
  if (!token) {
    return init ?? {};
  }

  const headerBag = new Headers(init ?? {});
  headerBag.set('Authorization', `Bearer ${token}`);
  return headerBag;
}

