import { NextRequest } from 'next/server';

import { auth } from '@/auth';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const session = await auth();

  return {
    session,
    headers: opts.req.headers,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
