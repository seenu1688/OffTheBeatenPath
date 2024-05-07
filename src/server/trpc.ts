import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';

import { Context } from './context';
import { salesforceClient } from './client';

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape;
  },
  transformer: superjson,
});

export const router = t.router;

export const publicProcedure = t.procedure;

export const authProcedure = publicProcedure.use(async (opts) => {
  if (!opts.ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Request is not authorised',
    });
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      salesforceClient: salesforceClient(opts.ctx.session),
    },
    input: opts.input,
  });
});
