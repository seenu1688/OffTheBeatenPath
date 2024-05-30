import { accountsRouter } from "./routers/accounts";
import { departuresRouter } from "./routers/departures";
import { destinationsRouter } from "./routers/destinations";
import { reservationsRouter } from "./routers/reservations";
import { segmentsRouter } from "./routers/segments";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  hello: publicProcedure.query(async ({ ctx }) => {
    return { data: "Hello world" };
  }),
  destinations: destinationsRouter,
  departures: departuresRouter,
  segments: segmentsRouter,
  reservations: reservationsRouter,
  accounts: accountsRouter,
});

export type AppRouter = typeof appRouter;
