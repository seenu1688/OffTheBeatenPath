import { departuresRouter } from "./routers/departures";
import { destinationsRouter } from "./routers/destinations";
import { segmentsRouter } from "./routers/segments";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  hello: publicProcedure.query(async ({ ctx }) => {
    return { data: "Hello world" };
  }),
  destinations: destinationsRouter,
  departures: departuresRouter,
  segments: segmentsRouter,
});

export type AppRouter = typeof appRouter;
