import jsforce from "jsforce";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

import { auth } from "@/auth";
import { createApexClient } from "./client";

export type Context = {
  headers: Headers;
  session: {
    access_token: string;
    instance_url: string;
  } | null;
  salesforceClient: jsforce.Connection | null;
  apexClient: ReturnType<typeof createApexClient> | null;
};

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const session = (await auth()) as Context["session"];

  return {
    session,
    headers: opts.req.headers,
    salesforceClient: null,
    apexClient: null,
  } satisfies Context;
};
