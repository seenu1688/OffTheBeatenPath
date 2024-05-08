import { destinationsRouter } from './routers/destinations';
import { publicProcedure, router } from './trpc';

export const appRouter = router({
  hello: publicProcedure.query(async ({ ctx }) => {
    return { data: 'Hello world' };
  }),
  destinations: destinationsRouter,
});

export type AppRouter = typeof appRouter;
