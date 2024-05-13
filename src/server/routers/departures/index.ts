import z from "zod";

import { authProcedure, router } from "@/server/trpc";

import { fetchDepartureById, fetchSegmentsByDepartureId } from "./apis";

import { Segment } from "@/common/types";

export const departuresRouter = router({
  getById: authProcedure.input(z.string()).query(({ ctx, input }) => {
    const { salesforceClient } = ctx;

    return fetchDepartureById({
      client: salesforceClient,
      departureId: input,
    });
  }),
  getSegments: authProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return fetchSegmentsByDepartureId({
      client: ctx.salesforceClient,
      departureId: input,
    });
  }),
});
