'use client';

import { createAuthClient } from 'better-auth/react';

const resolveBaseURL = () => {
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/api/auth`;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return `${appUrl.replace(/\/$/, '')}/api/auth`;
};

export const authClient = createAuthClient({
  baseURL: resolveBaseURL(),
});

export type AuthSession = Awaited<ReturnType<typeof authClient.getSession>> extends {
  data: infer T;
}
  ? T
  : null;

