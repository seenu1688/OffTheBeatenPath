import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

import { Context } from "./context";
import { createApexClient, salesforceClient } from "./client";

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape;
  },
  transformer: superjson,
});

export const router = t.router;

export const publicProcedure = t.procedure;

export const authProcedure = publicProcedure.use(async (opts) => {
  // FIXME: need to check if the session is valid
  if (!opts.ctx.session || !opts.ctx.session.access_token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Request is not authorised",
    });
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      salesforceClient: salesforceClient(opts.ctx.session),
      apexClient: createApexClient({
        accessToken: opts.ctx.session.access_token,
        instanceUrl: opts.ctx.session.instance_url,
      }),
    },
    input: opts.input,
  });
});
