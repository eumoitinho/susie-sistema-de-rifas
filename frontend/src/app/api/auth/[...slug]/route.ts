import { NextRequest, NextResponse } from 'next/server';
import {
  TOKEN_COOKIE,
  SESSION_MAX_AGE,
  decodeAuthToken,
} from '@/lib/server/auth';

type RouteParams = {
  slug?: string[];
};

type RouteContext = {
  params: Promise<RouteParams>;
};

const BACKEND_BASE_URL = process.env.BACKEND_API_URL ?? 'http://localhost:4000';
const BACKEND_API_PREFIX = process.env.BACKEND_API_PREFIX ?? '/api';
const BACKEND_API_URL = `${BACKEND_BASE_URL.replace(/\/$/, '')}${BACKEND_API_PREFIX}`;

async function resolveParams(context: RouteContext): Promise<RouteParams> {
  const params = await context.params;
  return params ?? {};
}

type AuthBackendResponse = {
  message?: string;
  token?: string;
  user?: {
    id: number;
    email: string;
  };
  error?: string;
};

async function callBackend<T>(
  endpoint: string,
  init: RequestInit & { parseJson?: boolean } = {}
): Promise<{ ok: boolean; status: number; body: T | null }> {
  const url = `${BACKEND_API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...init,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });

    const parseJson = init.parseJson ?? true;
    const body = parseJson ? ((await response.json().catch(() => null)) as T | null) : null;

    return {
      ok: response.ok,
      status: response.status,
      body,
    };
  } catch (error) {
    console.error(`Erro ao contatar backend ${endpoint}:`, error);
    return {
      ok: false,
      status: 503,
      body: ({
        error: 'Serviço de backend indisponível',
      } as unknown as T),
    };
  }
}

const isProduction = process.env.NODE_ENV === 'production';

async function handleSignIn(request: NextRequest) {
  const { email, password } = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email e senha são obrigatórios' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const { ok, status, body } = await callBackend<AuthBackendResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      senha: password,
    }),
  });

  if (!ok || !body) {
    return NextResponse.json(
      body ?? { error: 'Não foi possível realizar o login' },
      { status, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (!body.token || !body.user) {
    return NextResponse.json(
      { error: 'Resposta inválida do servidor de autenticação' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const response = NextResponse.json(
    {
      message: body.message ?? 'Login realizado com sucesso',
      user: body.user,
      token: body.token,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );

  response.cookies.set({
    name: TOKEN_COOKIE,
    value: body.token,
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}

async function handleSignUp(request: NextRequest) {
  const { email, password } = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email e senha são obrigatórios' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const { ok, status, body } = await callBackend<AuthBackendResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      senha: password,
    }),
  });

  if (!ok || !body) {
    return NextResponse.json(
      body ?? { error: 'Não foi possível realizar o cadastro' },
      { status, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (!body.token || !body.user) {
    return NextResponse.json(
      { error: 'Resposta inválida do servidor de autenticação' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const response = NextResponse.json(
    {
      message: body.message ?? 'Usuário cadastrado com sucesso',
      user: body.user,
      token: body.token,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );

  response.cookies.set({
    name: TOKEN_COOKIE,
    value: body.token,
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}

function handleSignOut() {
  const response = NextResponse.json(
    { message: 'Sessão encerrada com sucesso' },
    { headers: { 'Cache-Control': 'no-store' } }
  );

  response.cookies.delete(TOKEN_COOKIE);

  return response;
}

function handleGetSession(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(null, { headers: { 'Cache-Control': 'no-store' } });
  }

  const session = decodeAuthToken(token);

  const response = NextResponse.json(session, {
    headers: { 'Cache-Control': 'no-store' },
  });

  if (!session) {
    response.cookies.delete(TOKEN_COOKIE);
  }

  return response;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { slug = [] } = await resolveParams(context);
  const [action, provider] = slug;

  if (action === 'sign-in' && provider === 'email') {
    return handleSignIn(request);
  }

  if (action === 'sign-up' && provider === 'email') {
    return handleSignUp(request);
  }

  if (action === 'sign-out') {
    return handleSignOut();
  }

  return NextResponse.json(
    { error: 'Rota não encontrada' },
    { status: 404, headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug = [] } = await resolveParams(context);
  const [action] = slug;

  if (action === 'get-session') {
    return handleGetSession(request);
  }

  return NextResponse.json(
    { error: 'Rota não encontrada' },
    { status: 404, headers: { 'Cache-Control': 'no-store' } }
  );
}

