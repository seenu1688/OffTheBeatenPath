import { accountsRouter } from "./routers/accounts";
import { departuresRouter } from "./routers/departures";
import { destinationsRouter } from "./routers/destinations";
import { experiencesRouter } from "./routers/experiences";
import { reservationsRouter } from "./routers/reservations";
import { segmentsRouter } from "./routers/segments";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  destinations: destinationsRouter,
  departures: departuresRouter,
  segments: segmentsRouter,
  reservations: reservationsRouter,
  accounts: accountsRouter,
  experiences: experiencesRouter,
});

export type AppRouter = typeof appRouter;
