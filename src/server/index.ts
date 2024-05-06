import { publicProcedure, router } from './trpc';

export const appRouter = router({
  hello: publicProcedure.query(async ({ ctx }) => {
    return { data: 'Hello world' };
  }),
});

export type AppRouter = typeof appRouter;
