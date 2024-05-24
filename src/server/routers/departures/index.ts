import z from "zod";

import { authProcedure, router } from "@/server/trpc";

import { fetchDepartureById, fetchSegmentsByDepartureId } from "./apis";

export const departuresRouter = router({
  getById: authProcedure.input(z.string()).query(({ ctx, input }) => {
    const { salesforceClient } = ctx;

    try {
      return fetchDepartureById({
        client: salesforceClient,
        departureId: input,
      });
    } catch (err) {
      throw err;
    }
  }),
  getSegments: authProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return fetchSegmentsByDepartureId({
      client: ctx.salesforceClient,
      departureId: input,
    });
  }),
});
