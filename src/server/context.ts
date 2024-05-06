import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import jsforce from 'jsforce';

import { auth } from '@/auth';

export type Context = {
  headers: Headers;
  session: {
    access_token: string;
    instance_url: string;
  } | null;
  salesforceClient: jsforce.Connection | null;
};

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const session = (await auth()) as Context['session'];

  return {
    session,
    headers: opts.req.headers,
    salesforceClient: null,
  } satisfies Context;
};
