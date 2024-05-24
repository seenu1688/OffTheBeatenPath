import { authProcedure, router } from "../trpc";

import z from "zod";

export const segmentsRouter = router({
  getById: authProcedure.input(z.string()).query(({ ctx, input }) => {}),
});
